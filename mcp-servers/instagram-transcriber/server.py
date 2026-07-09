"""
MCP Server — Instagram Video Transcriber v3

Com Voice DNA, analise de ritmo de fala e busca automatica de perfil.
"""

import subprocess
import sys
import os
import re
import json
import tempfile
from pathlib import Path

try:
    from mcp.server.fastmcp import FastMCP
except ImportError:
    print("Instale o MCP SDK: pip install mcp")
    sys.exit(1)

# Garante que binarios instalados no venv (yt-dlp etc.) sejam encontrados
# mesmo quando o Claude Desktop inicia o processo com PATH minimo.
os.environ["PATH"] = os.path.dirname(sys.executable) + os.pathsep + os.environ.get("PATH", "")

mcp = FastMCP("instagram-transcriber")

# Transcricoes ficam dentro da propria pasta do projeto (autocontido)
OUTPUT_DIR = Path(__file__).resolve().parent / "transcricoes"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def extract_shortcode(url: str) -> str:
    patterns = [
        r'instagram\.com/reel/([A-Za-z0-9_-]+)',
        r'instagram\.com/p/([A-Za-z0-9_-]+)',
        r'instagram\.com/tv/([A-Za-z0-9_-]+)',
        r'instagram\.com/reels/([A-Za-z0-9_-]+)',
    ]
    for p in patterns:
        m = re.search(p, url)
        if m:
            return m.group(1)
    return "unknown"


def run_cmd(cmd, timeout=180):
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        return r.returncode == 0, r.stdout, r.stderr
    except Exception as e:
        return False, "", str(e)


def analyze_speech_rhythm(segments: list) -> str:
    if not segments:
        return "Sem dados de segmentos para analise de ritmo."

    lines = []
    lines.append("\n=== ANALISE DE RITMO DE FALA ===\n")

    segment_data = []
    total_words = 0
    total_speech_time = 0
    pauses = []
    video_duration = segments[-1].get("end", 0) if segments else 0

    for i, seg in enumerate(segments):
        start = seg.get("start", 0)
        end = seg.get("end", 0)
        text = seg.get("text", "").strip()
        words = len(text.split())
        duration = end - start
        wpm = (words / duration) * 60 if duration > 0 else 0

        total_words += words
        total_speech_time += duration
        segment_data.append({"index": i, "start": start, "end": end, "text": text, "words": words, "duration": duration, "wpm": wpm})

        if i > 0:
            gap = start - segments[i-1].get("end", 0)
            if gap > 0.5:
                pauses.append({"after_segment": i-1, "duration": round(gap, 1), "position": f"{int(segments[i-1].get('end',0)//60):02d}:{int(segments[i-1].get('end',0)%60):02d}"})

    lines.append(f"DURACAO TOTAL: {int(video_duration//60)}m{int(video_duration%60)}s")
    lines.append(f"TOTAL DE PALAVRAS: {total_words}")

    if total_speech_time > 0:
        avg_wpm = (total_words / total_speech_time) * 60
        lines.append(f"VELOCIDADE MEDIA: {avg_wpm:.0f} palavras/minuto")

        if avg_wpm < 120:
            lines.append("CLASSIFICACAO: LENTA (abaixo de 120 WPM) — Pode parecer arrastado.")
        elif avg_wpm < 140:
            lines.append("CLASSIFICACAO: MODERADA (120-140 WPM) — Bom para conteudo didatico.")
        elif avg_wpm < 165:
            lines.append("CLASSIFICACAO: IDEAL (140-165 WPM) — Ritmo perfeito para Reels.")
        elif avg_wpm < 190:
            lines.append("CLASSIFICACAO: RAPIDA (165-190 WPM) — Boa energia, cuidar da clareza.")
        else:
            lines.append("CLASSIFICACAO: MUITO RAPIDA (>190 WPM) — Desacelere nos pontos-chave.")

    wpms = [s["wpm"] for s in segment_data if s["wpm"] > 0]
    if wpms:
        lines.append(f"\nVARIACAO DE RITMO:")
        lines.append(f"  Mais lento: {min(wpms):.0f} WPM")
        lines.append(f"  Mais rapido: {max(wpms):.0f} WPM")
        lines.append(f"  Variacao: {max(wpms) - min(wpms):.0f} WPM")
        diff = max(wpms) - min(wpms)
        if diff > 60:
            lines.append("  → Alta variacao — bom! Mantem atencao.")
        elif diff > 30:
            lines.append("  → Variacao moderada — pode dinamizar mais.")
        else:
            lines.append("  → Baixa variacao — fala monotona. Varie o ritmo.")

    hook_segments = [s for s in segment_data if s["start"] <= 3]
    if hook_segments:
        hook_text = " ".join(s["text"] for s in hook_segments)
        hook_words = sum(s["words"] for s in hook_segments)
        lines.append(f"\nHOOK (0-3s):")
        lines.append(f"  Texto: \"{hook_text}\"")
        lines.append(f"  Palavras: {hook_words}")
        if hook_words < 5:
            lines.append("  → Hook curto. Forte se impactante, arriscado se vago.")
        elif hook_words <= 12:
            lines.append("  → Tamanho ideal para Reels.")
        else:
            lines.append("  → Hook longo. Encurte para prender nos 3s.")

    lines.append(f"\nPAUSAS DETECTADAS: {len(pauses)}")
    if pauses:
        long_p = [p for p in pauses if p["duration"] >= 1.5]
        short_p = [p for p in pauses if p["duration"] < 1.5]
        lines.append(f"  Curtas (0.5-1.5s): {len(short_p)}")
        lines.append(f"  Longas (>1.5s): {len(long_p)}")
        if long_p:
            for p in long_p[:5]:
                lines.append(f"    [{p['position']}] — {p['duration']}s")
        if len(pauses) < 2:
            lines.append("  → Poucas pausas. Fala sem respirar cansa o ouvinte.")
        elif len(long_p) > 3:
            lines.append("  → Muitas pausas longas. Pode quebrar retencao.")
        else:
            lines.append("  → Bom uso de pausas.")
    else:
        lines.append("  → Nenhuma pausa. Use pausas estrategicas para dar enfase.")

    if segment_data and video_duration > 0:
        third = video_duration / 3
        opening = [s for s in segment_data if s["start"] < third]
        middle = [s for s in segment_data if third <= s["start"] < 2*third]
        closing = [s for s in segment_data if s["start"] >= 2*third]

        lines.append(f"\nRITMO POR FASE:")
        phase_wpms = {}
        for label, segs in [("ABERTURA", opening), ("MEIO", middle), ("FECHAMENTO", closing)]:
            if segs:
                pw = sum(s["words"] for s in segs)
                pt = sum(s["duration"] for s in segs)
                pwpm = (pw / pt * 60) if pt > 0 else 0
                lines.append(f"  {label}: {pwpm:.0f} WPM")
                phase_wpms[label] = pwpm

        if "ABERTURA" in phase_wpms and "FECHAMENTO" in phase_wpms:
            if phase_wpms["ABERTURA"] > phase_wpms["FECHAMENTO"] + 15:
                lines.append("  → Padrao: DESACELERA no final (bom para CTAs calmos)")
            elif phase_wpms["FECHAMENTO"] > phase_wpms["ABERTURA"] + 15:
                lines.append("  → Padrao: ACELERA no final (bom para urgencia)")
            else:
                lines.append("  → Padrao: CONSTANTE (varie para criar dinamica)")

    return "\n".join(lines)


def do_transcribe(url, modelo="medium", include_rhythm=False):
    shortcode = extract_shortcode(url)
    with tempfile.TemporaryDirectory() as tmpdir:
        video_path = os.path.join(tmpdir, f"{shortcode}.mp4")
        audio_path = os.path.join(tmpdir, f"{shortcode}.wav")

        ok, out, err = run_cmd(["yt-dlp", "--no-warnings", "--no-playlist", "-f", "best", "-o", video_path, "--cookies-from-browser", "chrome", url])
        if not ok:
            ok, out, err = run_cmd(["yt-dlp", "--no-warnings", "--no-playlist", "-f", "best", "-o", video_path, url])
        if not ok:
            return f"Erro no download: {err[:200]}"

        if not os.path.exists(video_path):
            files = [f for f in os.listdir(tmpdir) if f.startswith(shortcode)]
            if files:
                video_path = os.path.join(tmpdir, files[0])
            else:
                return "Arquivo nao encontrado"

        ok, _, err = run_cmd(["ffmpeg", "-y", "-i", video_path, "-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1", audio_path])
        if not ok:
            return f"Erro no audio: {err[:200]}"

        try:
            import whisper
        except ImportError:
            return "Whisper nao instalado"

        try:
            model = whisper.load_model(modelo)
            result = model.transcribe(audio_path, language="pt", verbose=False)
        except Exception as e:
            return f"Erro: {str(e)}"

        lines = [f"=== TRANSCRICAO: {shortcode} ===", f"URL: {url}\n"]
        full_text = result.get("text", "").strip()
        lines.append(f"TEXTO COMPLETO:\n{full_text}\n")
        lines.append("COM TIMESTAMPS:")
        segments = result.get("segments", [])
        for seg in segments:
            start = seg.get("start", 0)
            m, s = int(start // 60), int(start % 60)
            lines.append(f"[{m:02d}:{s:02d}] {seg.get('text', '').strip()}")
        if segments:
            end = segments[-1].get("end", 0)
            lines.append(f"\nDuracao: {int(end//60)}m{int(end%60)}s")
        lines.append(f"Palavras: {len(full_text.split())}")

        if include_rhythm and segments:
            lines.append(analyze_speech_rhythm(segments))

        output = "\n".join(lines)
        (OUTPUT_DIR / f"{shortcode}.txt").write_text(output, encoding="utf-8")
        return output


@mcp.tool()
def transcrever_video_instagram(url: str, modelo: str = "medium") -> str:
    """Baixa e transcreve um video do Instagram com analise de ritmo de fala.

    Args:
        url: URL completa do Instagram
        modelo: Modelo Whisper - small, medium (padrao), large
    """
    return do_transcribe(url, modelo, include_rhythm=True)


@mcp.tool()
def transcrever_multiplos_videos(urls: list[str], modelo: str = "medium") -> str:
    """Transcreve multiplos videos do Instagram com analise de ritmo.

    Args:
        urls: Lista de URLs do Instagram
        modelo: Modelo Whisper
    """
    results = []
    for i, url in enumerate(urls):
        results.append(f"\n{'='*50}\nVIDEO {i+1}/{len(urls)}\n{'='*50}\n")
        results.append(do_transcribe(url.strip(), modelo, include_rhythm=True))
    return "\n".join(results)


@mcp.tool()
def analisar_roteiro_video(url: str) -> str:
    """Baixa, transcreve e analisa estrutura do roteiro com ritmo de fala.

    Args:
        url: URL do Instagram
    """
    transcription = do_transcribe(url, "medium", include_rhythm=True)
    if "Erro" in transcription[:20]:
        return transcription
    analysis = ["\n\n=== ANALISE DE ESTRUTURA ===\n"]
    text_match = re.search(r"TEXTO COMPLETO:\n(.+?)\n\nCOM TIMESTAMPS:", transcription, re.DOTALL)
    full_text = text_match.group(1) if text_match else ""
    segments = re.findall(r'\[(\d+:\d+)\] (.+)', transcription)
    if segments:
        hook_segs = [t for time, t in segments if int(time.split(":")[0])*60+int(time.split(":")[1]) <= 3]
        if hook_segs:
            analysis.append(f"HOOK (0-3s): \"{' '.join(hook_segs)}\"\n")
        total = len(segments)
        if total >= 3:
            t = total // 3
            analysis.append(f"ABERTURA: {' '.join(x for _,x in segments[:t])[:200]}...\n")
            analysis.append(f"MEIO: {' '.join(x for _,x in segments[t:2*t])[:200]}...\n")
            analysis.append(f"FECHAMENTO: {' '.join(x for _,x in segments[2*t:])[:200]}...\n")
    cta_kw = ['link','bio','comenta','salva','compartilha','segue','clica','manda','DM','arrasta','inscreva']
    found = [k for k in cta_kw if k.lower() in full_text.lower()]
    analysis.append(f"CTAs: {', '.join(found) if found else 'nenhum'}")
    return transcription + "\n".join(analysis)


@mcp.tool()
def analisar_perfil_instagram(username: str, quantidade: int = 5, modelo: str = "medium") -> str:
    """Analisa perfil do Instagram: busca Reels, transcreve com analise de ritmo de fala (WPM, pausas, variacao).

    So precisa do @username.

    Args:
        username: @ do Instagram (com ou sem @)
        quantidade: Quantos videos (padrao: 5, max: 10)
        modelo: Modelo Whisper
    """
    username = username.strip().replace("@", "")
    quantidade = min(quantidade, 10)
    profile_url = f"https://www.instagram.com/{username}/reels/"

    ok, out, err = run_cmd(["yt-dlp", "--flat-playlist", "--no-warnings", "--playlist-end", str(quantidade), "--print", "url", "--cookies-from-browser", "chrome", profile_url], timeout=60)
    if not ok:
        ok, out, err = run_cmd(["yt-dlp", "--flat-playlist", "--no-warnings", "--playlist-end", str(quantidade), "--print", "url", profile_url], timeout=60)
    if not ok:
        ok, out, err = run_cmd(["yt-dlp", "--flat-playlist", "--no-warnings", "--playlist-end", str(quantidade), "--print", "url", "--cookies-from-browser", "chrome", f"https://www.instagram.com/{username}/"], timeout=60)

    if not ok or not out.strip():
        return f"Nao consegui listar videos de @{username}. Perfil privado ou Instagram bloqueando. Faca login no Chrome e tente novamente."

    urls = [u.strip() for u in out.strip().split("\n") if u.strip()]
    if not urls:
        return f"Nenhum video em @{username}."

    results = [f"=== ANALISE DO PERFIL @{username} ===", f"Videos: {len(urls)}", f"Transcrevendo com analise de ritmo...\n"]
    for i, url in enumerate(urls):
        results.append(f"\n{'='*50}\nVIDEO {i+1}/{len(urls)}\n{'='*50}\n")
        results.append(do_transcribe(url, modelo, include_rhythm=True))
    results.append(f"\n{'='*50}\nFIM — @{username} — {len(urls)} videos\n{'='*50}")
    return "\n".join(results)


if __name__ == "__main__":
    mcp.run(transport="stdio")

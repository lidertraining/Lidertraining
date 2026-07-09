# MCP Instagram Transcriber

MCP Server que dá ao Claude Desktop o poder de transcrever vídeos do Instagram
com Whisper e analisar ritmo de fala (WPM, pausas, variação, hook dos 3s).

## Ferramentas que o Claude Desktop ganha

| Ferramenta | O que faz |
|---|---|
| `transcrever_video_instagram` | Transcreve 1 vídeo por URL, com análise de ritmo |
| `transcrever_multiplos_videos` | Transcreve uma lista de URLs |
| `analisar_roteiro_video` | Transcrição + análise de estrutura (hook, abertura, meio, fechamento, CTAs) |
| `analisar_perfil_instagram` | Só com o `@username`: busca os últimos Reels e analisa tudo |

## Instalação (1 comando)

### Windows

Abra o **PowerShell** nesta pasta e rode:

```powershell
powershell -ExecutionPolicy Bypass -File .\setup-windows.ps1
```

### Mac

Abra o **Terminal** nesta pasta e rode:

```bash
bash setup-mac.sh
```

O script faz tudo sozinho:

1. ✅ Verifica/instala Python 3.10+, ffmpeg e yt-dlp (winget no Windows, brew no Mac)
2. ✅ Cria o venv (`C:\mcp-transcriber-env` ou `~/mcp-transcriber-env`)
3. ✅ Instala `yt-dlp`, `openai-whisper` e `mcp` no venv
4. ✅ Copia o `server.py` para `C:\mcp-servers` ou `~/mcp-servers`
5. ✅ Adiciona o server ao `claude_desktop_config.json` **sem apagar** outros MCP servers (faz backup `.bak` antes)
6. ✅ Verifica que `whisper` e `mcp` importam e que `yt-dlp`/`ffmpeg` estão no PATH

Depois: **feche e reabra o Claude Desktop** e teste:

> Analisa o perfil @isabelamatte — transcreve os 3 últimos Reels e me diz
> quais padrões de roteiro ela usa, qual o ritmo de fala e como são os hooks.

## Avisos importantes

- ⏳ **Primeira transcrição demora**: o Whisper baixa o modelo `medium` (~1,5 GB) na primeira vez. Use `modelo: small` se quiser mais rápido.
- 🔑 **Instagram**: para listar Reels de perfis, o yt-dlp usa os cookies do seu **Chrome** — mantenha-se logado no Instagram no Chrome. Perfis privados que você não segue não funcionam.
- ⚠️ **Uso responsável**: baixe/analise apenas conteúdo público e respeite os termos de uso do Instagram. Uso intenso pode fazer o Instagram bloquear temporariamente seu acesso.
- 📁 As transcrições ficam salvas na pasta temporária do sistema, em `instagram-transcriptions/`.

## Arquivos

- `server.py` — o MCP Server (é copiado para `C:\mcp-servers` / `~/mcp-servers`)
- `setup-windows.ps1` / `setup-mac.sh` — instaladores automáticos
- `merge_config.py` — atualiza o config do Claude Desktop preservando o que já existe

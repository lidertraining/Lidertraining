# MCP Instagram Transcriber

MCP Server que dá ao Claude Desktop o poder de transcrever vídeos do Instagram
com Whisper e analisar ritmo de fala (WPM, pausas, variação, hook dos 3s).

> **Projeto independente.** Estes arquivos vivem no repositório só como
> distribuição. O instalador copia tudo para uma pasta própria e isolada
> (`C:\mcp-instagram-transcriber` ou `~/mcp-instagram-transcriber`), que não
> depende do LiderTraining nem de nenhum outro projeto seu.

## Ferramentas que o Claude Desktop ganha

| Ferramenta | O que faz |
|---|---|
| `transcrever_video_instagram` | Transcreve 1 vídeo por URL, com análise de ritmo |
| `transcrever_multiplos_videos` | Transcreve uma lista de URLs |
| `analisar_roteiro_video` | Transcrição + análise de estrutura (hook, abertura, meio, fechamento, CTAs) |
| `analisar_perfil_instagram` | Só com o `@username`: busca os últimos Reels e analisa tudo |

## Estrutura instalada (pasta única, autocontida)

```
C:\mcp-instagram-transcriber\        (Mac: ~/mcp-instagram-transcriber/)
├── server.py       ← o MCP Server
├── venv\           ← Python + dependências, isolado do sistema
├── transcricoes\   ← cada transcrição salva como .txt aqui
└── LEIA-ME.md
```

Depois de instalada, essa pasta funciona sozinha — pode até apagar ou trocar
de branch no repositório que nada quebra.

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
2. ✅ Cria a pasta do projeto com `venv` e `transcricoes` dentro
3. ✅ Instala `yt-dlp`, `openai-whisper` e `mcp` no venv
4. ✅ Adiciona o server ao `claude_desktop_config.json` **sem apagar** outros MCP servers (faz backup `.bak` antes)
5. ✅ Verifica que `whisper` e `mcp` importam e que `yt-dlp`/`ffmpeg` estão no PATH
6. ✅ Avisa se encontrar restos de instalação antiga (`C:\mcp-transcriber-env`, `C:\mcp-servers`)

Depois: **feche e reabra o Claude Desktop** e teste:

> Analisa o perfil @isabelamatte — transcreve os 3 últimos Reels e me diz
> quais padrões de roteiro ela usa, qual o ritmo de fala e como são os hooks.

## Avisos importantes

- ⏳ **Primeira transcrição demora**: o Whisper baixa o modelo `medium` (~1,5 GB) na primeira vez. Use `modelo: small` se quiser mais rápido.
- 🔑 **Instagram**: para listar Reels de perfis, o yt-dlp usa os cookies do seu **Chrome** — mantenha-se logado no Instagram no Chrome. Perfis privados que você não segue não funcionam.
- ⚠️ **Uso responsável**: baixe/analise apenas conteúdo público e respeite os termos de uso do Instagram. Uso intenso pode fazer o Instagram bloquear temporariamente seu acesso.
- 📁 As transcrições ficam em `transcricoes\` dentro da pasta do projeto.

## Arquivos desta pasta (no repositório)

- `server.py` — o MCP Server (copiado para a pasta do projeto na instalação)
- `setup-windows.ps1` / `setup-mac.sh` — instaladores automáticos
- `merge_config.py` — atualiza o config do Claude Desktop preservando o que já existe

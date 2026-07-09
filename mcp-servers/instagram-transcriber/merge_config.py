"""Adiciona o instagram-transcriber ao claude_desktop_config.json SEM apagar
outros MCP servers ja configurados. Faz backup .bak antes de escrever.

Uso: python merge_config.py <config_path> <python_do_venv> <server_py>
"""
import json
import os
import shutil
import sys


def main() -> None:
    config_path, python_path, server_path = sys.argv[1], sys.argv[2], sys.argv[3]

    os.makedirs(os.path.dirname(config_path), exist_ok=True)

    cfg = {}
    if os.path.exists(config_path):
        shutil.copy2(config_path, config_path + ".bak")
        try:
            with open(config_path, encoding="utf-8") as f:
                cfg = json.load(f)
        except (json.JSONDecodeError, UnicodeDecodeError):
            print(f"AVISO: config existente invalido — backup salvo em {config_path}.bak, recriando do zero.")
            cfg = {}

    if not isinstance(cfg, dict):
        cfg = {}
    cfg.setdefault("mcpServers", {})
    cfg["mcpServers"]["instagram-transcriber"] = {
        "command": python_path,
        "args": [server_path],
    }

    with open(config_path, "w", encoding="utf-8") as f:
        json.dump(cfg, f, indent=2, ensure_ascii=False)

    outros = [k for k in cfg["mcpServers"] if k != "instagram-transcriber"]
    print(f"Config atualizado: {config_path}")
    print(f"Servers preservados: {', '.join(outros) if outros else '(nenhum outro)'}")


if __name__ == "__main__":
    main()

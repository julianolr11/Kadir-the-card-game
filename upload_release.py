#!/usr/bin/env python3
import os
import requests
import sys

# Configuração
OWNER = "julianolr11"
REPO = "Kadir-the-card-game"
TAG = "v1.2.3"
BUILD_DIR = r"c:\Users\julia\Kadir-card-game\kadiroms\release\build"

# Arquivos para upload
FILES = [
    "kadir11-card-game-setup.exe",
    "kadir11-card-game-setup.exe.blockmap",
    "latest.yml"
]

def upload_release():
    # Token deve estar na variável de ambiente GH_TOKEN
    token = os.getenv('GH_TOKEN')
    if not token:
        print("❌ Erro: Variável GH_TOKEN não definida")
        print("Defina com: $env:GH_TOKEN = 'seu_token'")
        return False

    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json"
    }

    # Obter release
    print(f"📦 Obtendo release {TAG}...")
    url = f"https://api.github.com/repos/{OWNER}/{REPO}/releases/tags/{TAG}"
    resp = requests.get(url, headers=headers)

    if resp.status_code != 200:
        print(f"❌ Erro: Release não encontrada (status {resp.status_code})")
        return False

    release = resp.json()
    upload_url = release['upload_url'].replace('{?name,label}', '')

    # Upload dos arquivos
    for filename in FILES:
        filepath = os.path.join(BUILD_DIR, filename)

        if not os.path.exists(filepath):
            print(f"❌ Arquivo não encontrado: {filename}")
            continue

        print(f"📤 Enviando {filename}...")

        with open(filepath, 'rb') as f:
            file_data = f.read()

        upload_headers = {
            "Authorization": f"token {token}",
            "Content-Type": "application/octet-stream",
            "Accept": "application/vnd.github.v3+json",
        }

        upload_resp = requests.post(
            f"{upload_url}?name={filename}",
            headers=upload_headers,
            data=file_data
        )

        if upload_resp.status_code in [200, 201]:
            print(f"✅ {filename} enviado com sucesso")
        else:
            print(f"❌ Erro ao enviar {filename} (status {upload_resp.status_code})")
            print(upload_resp.text)
            return False

    print("\n✅ Release criado e arquivos enviados com sucesso!")
    print(f"Link: https://github.com/{OWNER}/{REPO}/releases/tag/{TAG}")
    return True

if __name__ == "__main__":
    upload_release()

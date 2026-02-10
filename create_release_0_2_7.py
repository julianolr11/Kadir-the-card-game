#!/usr/bin/env python3
import os
import requests
import sys

# Configuração
OWNER = "julianolr11"
REPO = "Kadir-the-card-game"
TAG = "v0.2.7"
BUILD_DIR = r"c:\Users\julia\Kadir-card-game\kadiroms\release\build"

# Arquivos para upload
FILES = [
    "kadir11-card-game-setup.exe",
    "kadir11-card-game-setup.exe.blockmap",
    "latest.yml"
]

# Release notes
RELEASE_NOTES = """## Novidades da Versão 0.2.7

### 🎬 Correção Importante
- **Wallpaper animado agora incluído nas atualizações** - Resolvido problema onde o vídeo de fundo não era empacotado no instalador

### 🆕 Novos Guardiões
- **Moar** - HP: 11  
- **Roenhell** - HP: 10  
- **Arigus** - HP: 8

### 🐛 Correções
- Corrigido carregamento de imagens de cartas de efeito (Jewel of Life e outras)
- Resolvido bug onde o guardião selecionado no DeckBuilder não era salvo corretamente
- Configuração `extraResources` adicionada para incluir `public/assets/` no build

### 🎨 Melhorias de Interface
- Melhorias no Bestiário: títulos das criaturas agora são exibidos
- Adicionados ícones de elementos no Bestiário (água, ar, fogo, terra, puro)
- Layout horizontal aprimorado para exibição de criaturas
- Transição suave entre tela de carregamento e menu principal

### ⚖️ Ajustes de Balanceamento
- HP dos novos guardiões ajustado para melhor equilíbrio

### 🔧 Sistema de Atualização
- Sistema de auto-update com notas de versão detalhadas
- Correção na URL do `latest.yml` para evitar duplicação de paths

---

**Tamanho do instalador:** 332.6 MB (inclui wallpaper animado de 8.6 MB)
"""

def create_release_with_files():
    # Token deve estar na variável de ambiente GH_TOKEN
    token = os.getenv('GH_TOKEN')
    if not token:
        print("❌ Erro: Variável GH_TOKEN não definida")
        print("Defina com: $env:GH_TOKEN = 'seu_token_aqui'")
        print("")
        print("Para criar um token:")
        print("1. Acesse: https://github.com/settings/tokens/new")
        print("2. Marque 'repo' scope")
        print("3. Copie o token e execute: $env:GH_TOKEN = 'token'")
        return False

    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json"
    }

    # Criar release
    print(f"📦 Criando release {TAG}...")
    create_url = f"https://api.github.com/repos/{OWNER}/{REPO}/releases"
    
    release_data = {
        "tag_name": TAG,
        "name": f"Kadir Card Game {TAG}",
        "body": RELEASE_NOTES,
        "draft": False,
        "prerelease": False
    }

    resp = requests.post(create_url, headers=headers, json=release_data)

    if resp.status_code not in [200, 201]:
        print(f"❌ Erro ao criar release (status {resp.status_code})")
        print(resp.text)
        return False

    release = resp.json()
    upload_url = release['upload_url'].replace('{?name,label}', '')
    print(f"✅ Release criada com sucesso!")

    # Upload dos arquivos
    for filename in FILES:
        filepath = os.path.join(BUILD_DIR, filename)

        if not os.path.exists(filepath):
            print(f"❌ Arquivo não encontrado: {filename}")
            continue

        file_size = os.path.getsize(filepath)
        print(f"📤 Enviando {filename} ({file_size / 1024 / 1024:.1f} MB)...")

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
            print(upload_resp.text[:500])
            return False

    print("\n✅ Release criado e arquivos enviados com sucesso!")
    print(f"🔗 Link: https://github.com/{OWNER}/{REPO}/releases/tag/{TAG}")
    return True

if __name__ == "__main__":
    success = create_release_with_files()
    sys.exit(0 if success else 1)

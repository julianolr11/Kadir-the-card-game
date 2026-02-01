#!/usr/bin/env python3
import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
import os
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import threading
import time

class ReleaseUploaderGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Kadir Release Uploader")
        self.root.geometry("700x850")
        self.root.resizable(True, True)

        # Config
        self.owner = "julianolr11"
        self.repo = "Kadir-the-card-game"
        self.build_dir = r"c:\Users\julia\Kadir-card-game\kadiroms\release\build"

        # Upload stats
        self.upload_start_time = 0
        self.bytes_uploaded = 0

        # Setup UI
        self.setup_ui()

    def setup_ui(self):
        # Frame principal
        main_frame = ttk.Frame(self.root, padding="20")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))

        # Título
        title = ttk.Label(main_frame, text="🎮 Kadir Release Uploader",
                         font=("Arial", 16, "bold"))
        title.grid(row=0, column=0, columnspan=2, pady=(0, 20))

        # Token
        ttk.Label(main_frame, text="GitHub Token:", font=("Arial", 10, "bold")).grid(
            row=1, column=0, sticky=tk.W, pady=5)
        self.token_entry = ttk.Entry(main_frame, width=50, show="*")
        self.token_entry.grid(row=2, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 15))

        # Versão
        ttk.Label(main_frame, text="Versão (tag):", font=("Arial", 10, "bold")).grid(
            row=3, column=0, sticky=tk.W, pady=5)
        version_frame = ttk.Frame(main_frame)
        version_frame.grid(row=4, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 15))

        ttk.Label(version_frame, text="v").pack(side=tk.LEFT)
        self.version_entry = ttk.Entry(version_frame, width=15)
        self.version_entry.insert(0, "1.2.3")
        self.version_entry.pack(side=tk.LEFT, padx=5)

        ttk.Label(version_frame, text="Ex: 1.2.3, 1.2.4, etc").pack(side=tk.LEFT, padx=10)

        # Título do Release
        ttk.Label(main_frame, text="Título do Release:", font=("Arial", 10, "bold")).grid(
            row=5, column=0, sticky=tk.W, pady=5)
        self.title_entry = ttk.Entry(main_frame, width=50)
        self.title_entry.insert(0, "Bênçãos de Guardiões")
        self.title_entry.grid(row=6, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 15))

        # Release Notes
        ttk.Label(main_frame, text="Notas do Release:", font=("Arial", 10, "bold")).grid(
            row=7, column=0, sticky=tk.W, pady=5)
        self.notes_text = scrolledtext.ScrolledText(main_frame, width=60, height=10,
                                                     wrap=tk.WORD, font=("Arial", 9))
        self.notes_text.insert("1.0",
"""## Novidades

- Implementação das bênçãos de guardiões
- Sistema bidirecionais (jogador e IA)
- 17 guardiões com efeitos únicos
- Modais interativos de seleção

## Correções

- Correção de bugs diversos
- Melhorias de performance""")
        self.notes_text.grid(row=8, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 15))

        # Arquivos
        ttk.Label(main_frame, text="Arquivos:", font=("Arial", 10, "bold")).grid(
            row=9, column=0, sticky=tk.W, pady=5)
        files_frame = ttk.Frame(main_frame)
        files_frame.grid(row=10, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 15))

        self.file_checks = {}
        files = [
            ("kadir11-card-game-setup.exe", True),
            ("kadir11-card-game-setup.exe.blockmap", True),
            ("latest.yml", True)
        ]

        for i, (filename, checked) in enumerate(files):
            var = tk.BooleanVar(value=checked)
            self.file_checks[filename] = var
            cb = ttk.Checkbutton(files_frame, text=filename, variable=var)
            cb.pack(anchor=tk.W, pady=2)

        # Botão de Upload
        self.upload_btn = ttk.Button(main_frame, text="🚀 Criar Release e Enviar Arquivos",
                                     command=self.start_upload, style="Accent.TButton")
        self.upload_btn.grid(row=11, column=0, columnspan=2, pady=(10, 10), sticky=(tk.W, tk.E))

        # Progress
        self.progress = ttk.Progressbar(main_frame, mode='determinate', maximum=100)
        self.progress.grid(row=12, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 5))

        # Progress text
        self.progress_label = ttk.Label(main_frame, text="", font=("Arial", 9))
        self.progress_label.grid(row=13, column=0, columnspan=2, pady=(0, 10))

        # Log
        ttk.Label(main_frame, text="Log:", font=("Arial", 10, "bold")).grid(
            row=14, column=0, sticky=tk.W, pady=(10, 5))

        log_frame = ttk.Frame(main_frame)
        log_frame.grid(row=15, column=0, columnspan=2, sticky=(tk.W, tk.E, tk.N, tk.S), pady=(0, 10))

        self.log_text = scrolledtext.ScrolledText(log_frame, width=75, height=12,
                                                   wrap=tk.WORD, font=("Consolas", 9),
                                                   bg="#1e1e1e", fg="#00ff00")
        self.log_text.pack(fill=tk.BOTH, expand=True)

        # Configure grid weights para expansão
        main_frame.rowconfigure(15, weight=1)
        main_frame.columnconfigure(0, weight=1)

    def log(self, message):
        self.log_text.insert(tk.END, message + "\n")
        self.log_text.see(tk.END)
        self.root.update_idletasks()

    def update_progress(self, current, total, message=""):
        if total > 0:
            percent = (current / total) * 100
            self.progress['value'] = percent

            if message:
                self.progress_label.config(text=message)
            else:
                self.progress_label.config(text=f"{percent:.1f}%")

        self.root.update_idletasks()

    def start_upload(self):
        # Validação
        token = self.token_entry.get().strip()
        version = self.version_entry.get().strip()
        title = self.title_entry.get().strip()
        notes = self.notes_text.get("1.0", tk.END).strip()

        if not token:
            messagebox.showerror("Erro", "Token do GitHub é obrigatório!")
            return

        if not version:
            messagebox.showerror("Erro", "Versão é obrigatória!")
            return

        # Desabilitar botão
        self.upload_btn.config(state='disabled')
        self.progress['value'] = 0
        self.progress_label.config(text="Iniciando...")

        # Rodar em thread separada
        thread = threading.Thread(target=self.upload_release,
                                 args=(token, version, title, notes))
        thread.daemon = True
        thread.start()

    def upload_release(self, token, version, title, notes):
        try:
            tag = f"v{version}"

            # Session com retry
            session = requests.Session()
            retry = Retry(
                total=3,
                backoff_factor=1,
                status_forcelist=[500, 502, 503, 504],
                allowed_methods=["POST", "GET"]
            )
            adapter = HTTPAdapter(max_retries=retry)
            session.mount("https://", adapter)

            headers = {
                "Authorization": f"token {token}",
                "Accept": "application/vnd.github.v3+json"
            }

            # 1. Verificar se release existe
            self.log(f"🔍 Verificando release {tag}...")
            url = f"https://api.github.com/repos/{self.owner}/{self.repo}/releases/tags/{tag}"
            resp = session.get(url, headers=headers, timeout=30)

            if resp.status_code == 404:
                # Criar release
                self.log(f"📦 Criando release {tag}...")
                create_url = f"https://api.github.com/repos/{self.owner}/{self.repo}/releases"
                data = {
                    "tag_name": tag,
                    "name": f"{tag} - {title}",
                    "body": notes,
                    "draft": False,
                    "prerelease": False
                }
                resp = session.post(create_url, headers=headers, json=data, timeout=30)

                if resp.status_code not in [200, 201]:
                    self.log(f"❌ Erro ao criar release: {resp.status_code}")
                    self.log(resp.text)
                    self.finish_upload(False)
                    return

                self.log("✅ Release criado com sucesso!")
                release = resp.json()
            elif resp.status_code == 200:
                self.log(f"✅ Release {tag} já existe")
                release = resp.json()
            else:
                self.log(f"❌ Erro ao verificar release: {resp.status_code}")
                self.log(resp.text)
                self.finish_upload(False)
                return

            upload_url = release['upload_url'].replace('{?name,label}', '')

            # 2. Upload dos arquivos
            selected_files = [f for f, var in self.file_checks.items() if var.get()]
            total_files = len(selected_files)

            for idx, filename in enumerate(selected_files, 1):
                filepath = os.path.join(self.build_dir, filename)

                if not os.path.exists(filepath):
                    self.log(f"⚠️ Arquivo não encontrado: {filename}")
                    continue

                file_size = os.path.getsize(filepath)
                file_size_mb = file_size / (1024 * 1024)
                self.log(f"📤 [{idx}/{total_files}] Enviando {filename} ({file_size_mb:.2f} MB)...")

                # Atualizar progresso base
                base_progress = ((idx - 1) / total_files) * 100
                self.update_progress(base_progress, 100, f"[{idx}/{total_files}] Preparando {filename}...")

                # Para arquivos grandes, usar streaming simples
                upload_headers = {
                    "Authorization": f"token {token}",
                    "Content-Type": "application/octet-stream",
                    "Accept": "application/vnd.github.v3+json",
                }

                # Upload direto
                start_time = time.time()

                try:
                    with open(filepath, 'rb') as f:
                        self.update_progress(base_progress + 10, 100, f"[{idx}/{total_files}] Enviando {filename}...")

                        # Timeout maior para arquivos grandes (10 minutos)
                        upload_resp = session.post(
                            f"{upload_url}?name={filename}",
                            headers=upload_headers,
                            data=f,
                            timeout=600
                        )

                    elapsed = time.time() - start_time
                    avg_speed = file_size_mb / elapsed if elapsed > 0 else 0

                    if upload_resp.status_code in [200, 201]:
                        self.log(f"✅ {filename} enviado! ({avg_speed:.2f} MB/s em {elapsed:.1f}s)")
                        self.update_progress(((idx) / total_files) * 100, 100, f"[{idx}/{total_files}] Concluído!")
                    else:
                        self.log(f"❌ Erro ao enviar {filename} (status {upload_resp.status_code})")
                        self.log(upload_resp.text[:500])
                        self.finish_upload(False)
                        return

                except requests.exceptions.Timeout:
                    self.log(f"❌ Timeout ao enviar {filename} após {elapsed:.0f}s")
                    self.finish_upload(False)
                    return
                except Exception as e:
                    self.log(f"❌ Erro ao enviar {filename}: {str(e)}")
                    self.finish_upload(False)
                    return

            self.update_progress(100, 100, "Concluído!")
            self.log("\n🎉 Release criado e arquivos enviados com sucesso!")
            self.log(f"🔗 Link: https://github.com/{self.owner}/{self.repo}/releases/tag/{tag}")
            self.finish_upload(True)

        except Exception as e:
            self.log(f"❌ Erro: {str(e)}")
            import traceback
            self.log(traceback.format_exc())
            self.finish_upload(False)

    def finish_upload(self, success):
        self.progress['value'] = 0
        self.progress_label.config(text="")
        self.upload_btn.config(state='normal')

        if success:
            messagebox.showinfo("Sucesso", "Release criado e arquivos enviados com sucesso! 🎉")

if __name__ == "__main__":
    root = tk.Tk()
    app = ReleaseUploaderGUI(root)
    root.mainloop()

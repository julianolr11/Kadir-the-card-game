# Script para fazer upload do release
cd "c:\Users\julia\Kadir-card-game\kadiroms\release\build"

$ghPath = "C:\Users\julia\AppData\Local\GitHubDesktop\bin\gh.exe"

& $ghPath release create v1.2.3 `
  kadir11-card-game-setup.exe `
  kadir11-card-game-setup.exe.blockmap `
  latest.yml `
  --title "v1.2.3 - Bencaos de Guardioes" `
  --notes "Implementacao da primeira metade das bencaos para 17 guardioes com efeitos bidirecionais."

Write-Host "Release criado com sucesso!"

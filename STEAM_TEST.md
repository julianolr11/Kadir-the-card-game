# Como Testar Detecção Steam Localmente

## Modo Steam (simulado)

Para testar como o jogo se comporta quando rodando via Steam:

```powershell
# Definir variável de ambiente Steam
$env:SteamAppId = "123456"

# Rodar o jogo
npm start

# OU para build empacotado:
cd release\build\win-unpacked
$env:SteamAppId = "123456"
.\kadir11-card-game.exe
```

**O que deve acontecer:**
- ✅ Jogo abre normalmente
- ✅ Wallpaper carrega
- ✅ Todas as funcionalidades funcionam
- ✅ Logs mostram: "Steam detected: true"
- ✅ Logs mostram: "AutoUpdater DESABILITADO (rodando via Steam)"
- ✅ **IMPORTANTE:** Modal de update NÃO aparece
- ✅ Overlay de "Verificando atualizações" não aparece

## Modo Standalone (normal)

Para testar como funciona fora do Steam:

```powershell
# Sem variável Steam
npm start

# OU:
cd release\build\win-unpacked
.\kadir11-card-game.exe
```

**O que deve acontecer:**
- ✅ Jogo abre normalmente
- ✅ Overlay "Verificando atualizações..." aparece por 1.5s
- ✅ Logs mostram: "Steam detected: false"
- ✅ Logs mostram: "AutoUpdater configurado (modo standalone)"
- ✅ Modal de update aparece SE houver atualização disponível

## Verificar Logs

Os logs ficam em:
```
%APPDATA%\kadir11\logs\main.log
```

Procure por:
- "Steam detected: true/false"
- "AutoUpdater configurado" ou "AutoUpdater DESABILITADO"
- "Update check bloqueado" (se Steam)

## Quando estiver na Steam de verdade

A Steam define automaticamente:
- `process.env.SteamAppId` = seu App ID real
- `process.env.SteamGameId` = ID do jogo

Não precisa fazer nada, o código detecta sozinho.

## Comandos Úteis

```powershell
# Ver variáveis de ambiente atuais
Get-ChildItem Env: | Where-Object {$_.Name -like '*Steam*'}

# Limpar variável Steam
Remove-Item Env:\SteamAppId -ErrorAction SilentlyContinue

# Definir e rodar em uma linha
$env:SteamAppId="123456"; npm start
```

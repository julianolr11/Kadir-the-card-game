; Script NSIS customizado para Kadir Card Game
; Gera um instalador visual com wallpaper, ícone e imagens do jogo

!include "MUI2.nsh"

; --- Configurações principais ---
Name "Kadir Card Game"
OutFile "kadir11-card-game-setup.exe"
InstallDir "$PROGRAMFILES\KadirCardGame"
InstallDirRegKey HKCU "Software\KadirCardGame" "Install_Dir"
Icon "assets/iconlive.ico"
UninstallIcon "assets/iconlive.ico"

; --- Imagem de fundo/wallpaper ---
!define MUI_WELCOMEFINISHPAGE_BITMAP "src/assets/img/wallpaper/3d-menu.png"
!define MUI_UNWELCOMEFINISHPAGE_BITMAP "src/assets/img/wallpaper/3d-menu-overlay.png"

; --- Páginas padrão ---
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "LICENSE"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

; --- Idioma ---
!insertmacro MUI_LANGUAGE "Portuguese"

; --- Seção de instalação ---
Section "Instalar"
  SetOutPath "$INSTDIR"
  File /r "release/build/win-unpacked/*.*"
  ; Atalho na área de trabalho
  CreateShortCut "$DESKTOP\Kadir Card Game.lnk" "$INSTDIR\kadir11-card-game.exe" "" "$INSTDIR\kadir11-card-game.exe" 0
  ; Atalho no menu iniciar
  CreateShortCut "$SMPROGRAMS\Kadir Card Game.lnk" "$INSTDIR\kadir11-card-game.exe" "" "$INSTDIR\kadir11-card-game.exe" 0
SectionEnd

; --- Seção de desinstalação ---
Section "Desinstalar"
  Delete "$DESKTOP\Kadir Card Game.lnk"
  Delete "$SMPROGRAMS\Kadir Card Game.lnk"
  Delete "$INSTDIR\kadir11-card-game.exe"
  RMDir /r "$INSTDIR"
SectionEnd

; --- Customização extra: mensagem de boas-vindas ---
Var Dialog

Function .onInit
  MessageBox MB_ICONINFORMATION|MB_OK "Bem-vindo ao universo de Kadir!\n\nMonte seu deck, enfrente criaturas lendárias e conquiste a arena.\n\nAproveite a experiência visual inspirada no jogo!"
FunctionEnd

; --- Fim do script ---

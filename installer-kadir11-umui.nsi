; --- Kadir Card Game - Instalador UltraCustomizado (UltraModernUI) ---
!include "UltraModernUI.nsh"

; --- Configurações principais ---
Name "Kadir Card Game"
OutFile "kadir11-card-game-setup.exe"
InstallDir "$PROGRAMFILES\KadirCardGame"
InstallDirRegKey HKCU "Software\KadirCardGame" "Install_Dir"
Icon "assets/iconlive.ico"
UninstallIcon "assets/iconlive.ico"

; --- UltraModernUI: imagens e cores ---
!define UMUI_BGIMAGE "src/assets/img/wallpaper/3d-menu.png"
!define UMUI_BGFILLCOLOR "0x2a1f3d"
!define UMUI_BGFILLGRADIENT "0x3d2850"
!define UMUI_BUTTONCOLOR "0xa87e2d"
!define UMUI_BUTTONFONTCOLOR "0xffffff"
!define UMUI_PROGRESSBARCOLOR "0xa87e2d"
!define UMUI_WELCOMEFINISHPAGE_BITMAP "src/assets/img/wallpaper/3d-menu-overlay.png"
!define UMUI_UNWELCOMEFINISHPAGE_BITMAP "src/assets/img/wallpaper/3d-menu-overlay.png"

; --- Páginas ---
!insertmacro UMUI_PAGE_WELCOME
!insertmacro UMUI_PAGE_LICENSE "LICENSE"
!insertmacro UMUI_PAGE_DIRECTORY
!insertmacro UMUI_PAGE_INSTFILES
!insertmacro UMUI_PAGE_FINISH

!insertmacro UMUI_UNPAGE_WELCOME
!insertmacro UMUI_UNPAGE_CONFIRM
!insertmacro UMUI_UNPAGE_INSTFILES
!insertmacro UMUI_UNPAGE_FINISH

; --- Idioma ---
!insertmacro UMUI_LANGUAGE "Portuguese"

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

; --- Mensagem de boas-vindas ---
Function .onInit
  MessageBox MB_ICONINFORMATION|MB_OK "Bem-vindo ao universo de Kadir!\n\nMonte seu deck, enfrente criaturas lendárias e conquiste a arena.\n\nInstalador com visual inspirado no jogo!"
FunctionEnd

; --- Fim do script ---

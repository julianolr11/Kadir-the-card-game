
# Kadir Card Game 🎮

Jogo de cartas digital com criaturas, elementos e efeitos visuais/holográficos, feito em React + Electron.

## 🎮 Versão Oficial

**Este jogo está disponível oficialmente na Steam:**

- ✅ **Instalação automática** - Um clique e pronto
- ✅ **Updates automáticos** - Sempre a versão mais recente
- ✅ **Cloud Saves** - Seu progresso salvo na nuvem
- ✅ **Conquistas Steam** - Achievements desbloqueáveis
- ✅ **Suporte oficial** - Atualizações e bugfixes garantidos
- 💰 **[Steam Store]** _(em breve)_

**Compilar manualmente (não recomendado):**
- ⚠️ Requer Node.js, npm, conhecimento técnico
- ⚠️ Sem updates automáticos
- ⚠️ Sem features Steam (conquistas, cloud saves)
- ✅ Código aberto para fins educacionais
- ✅ Totalmente gratuito (porém trabalhoso)

---

## Visão Geral

O Kadir Card Game é um projeto de card game digital, com cartas de criaturas, elementos (fogo, água, terra, ar, puro), efeitos animados, sons e interface moderna. O objetivo é proporcionar uma experiência visualmente rica e interativa, com cartas colecionáveis e preview detalhado de cada criatura.

## Funcionalidades

- Visualização de cartas com efeito holográfico animado
- Cartas de diferentes elementos (fogo, água, terra, ar, puro)
- Preview detalhado de criaturas, habilidades, fraquezas e história
- Efeitos sonoros e música de fundo
- Animações de entrada, transição e interação
- Suporte a múltiplos idiomas (pt/en)
- Modal de opções (idioma, volume, resolução, tela cheia)
- Modal de confirmação de saída
- Estrutura pronta para expansão de regras e modos de jogo

## Estrutura do Projeto

- **src/components/**: Componentes React da interface (cartas, menus, modais, loading, etc)
- **src/assets/**: Imagens, sons e dados das criaturas (creaturesData.js)
- **src/styles/**: CSS dos efeitos, animações e layout
- **src/main/**: Código principal do Electron
- **src/renderer/**: Ponto de entrada do React
- **public/**: Assets públicos

## Instalação e Execução

1. Clone o repositório:
  ```bash
  git clone <url-do-repo>
  cd kadiroms
  ```
2. Instale as dependências:
  ```bash
  npm install
  ```
3. Rode o projeto em modo desenvolvimento:
  ```bash
  npm start
  ```
4. Para empacotar para produção:
  ```bash
  npm run package
  ```

## Testes

Testes unitários estão em `src/__tests__/`. Para rodar:
```bash
npm test
```

## Como contribuir

- Siga o padrão dos componentes e estilos existentes
- Adicione novas criaturas em `src/assets/creaturesData.js`
- Sugestões, issues e PRs são bem-vindos!

## Licença

MIT © 2025

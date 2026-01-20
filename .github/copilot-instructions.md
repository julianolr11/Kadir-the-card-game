# Copilot Instructions for Kadir Card Game

## Visão Geral
Este projeto é um card game digital feito com React + Electron. O foco está em uma interface rica, efeitos visuais, cartas colecionáveis e preview detalhado de criaturas.

## Estrutura e Fluxo
- **src/components/**: Componentes React para interface (cartas, menus, modais, etc). Siga o padrão de props e organização dos componentes existentes.
- **src/assets/**: Dados das criaturas (`creaturesData.js`), imagens, sons. Novas criaturas devem ser adicionadas em `creaturesData.js`.
- **src/styles/**: CSS modularizado por funcionalidade (ex: `battle.css`, `cardpreview.css`).
- **src/main/**: Código principal do Electron (inicialização, IPC, utilitários).
- **src/renderer/**: Entrada do React (`App.tsx`, `index.tsx`).
- **src/__tests__/**: Testes unitários dos componentes principais.

## Convenções Específicas
- Componentes usam nomes em inglês, mas textos e dados podem ser multilíngues (pt/en).
- Efeitos visuais e sons são referenciados por nome nos dados das cartas.
- Novos assets devem ser organizados em subpastas temáticas (ex: `img/card/`, `sounds/effects/`).
- Modais e menus seguem padrão de navegação centralizada via contexto (`AppContext.jsx`).
- Para lógica de batalha, consulte `logic/ai.js` e `logic/fieldAffinity.js`.

## Workflows Importantes
- **Desenvolvimento:**
  - Instale dependências: `npm install`
  - Rode em dev: `npm start`
- **Build Produção:**
  - Empacote: `npm run package`
- **Testes:**
  - Execute: `npm test`
- **Reset de progresso:**
  - Scripts de reset estão em raiz (`RESET.js`, `SUPER-RESET.js`, `reset-progress-devtools.js`).

## Integrações e Comunicação
- IPC entre Electron e React via arquivos em `src/main/` e `src/renderer/`.
- Assets públicos ficam em `public/assets/`.

## Exemplos de Padrões
- Para adicionar criatura:
  - Edite `src/assets/creaturesData.js` seguindo o formato existente.
- Para novo componente:
  - Crie em `src/components/`, use CSS modular em `src/styles/`, e adicione teste em `src/__tests__/`.

## Referências
- Consulte `README.md` para instruções gerais e fluxo de trabalho.
- Siga exemplos de componentes e lógica existentes para manter consistência.

---

Se algum padrão ou fluxo não estiver claro, peça exemplos ou esclarecimentos antes de gerar código novo.

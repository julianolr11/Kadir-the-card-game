# Implementar reações em batalha

Implemente um sistema completo para jogadores enviarem reações visuais durante batalhas PvP e Calamidade cooperativa.

## Assets existentes

Use somente estes arquivos, sem modificar ou regenerar a arte:

- `src/assets/img/icons/reactions/reaction-surprised.png`
- `src/assets/img/icons/reactions/reaction-laughing.png`
- `src/assets/img/icons/reactions/reaction-crowned.png`
- `src/assets/img/icons/reactions/reaction-knocked-out.png`
- `src/assets/img/icons/reactions/reaction-sad.png`
- `src/assets/img/icons/reactions/reaction-love.png`
- `src/assets/img/icons/reactions/reaction-wink.png`

Crie um registro central imutável com IDs curtos e seguros (`surprised`, `laughing`, `crowned`, `knocked-out`, `sad`, `love`, `wink`). Nunca aceite um caminho de imagem vindo da rede.

## Experiência de uso

1. Em `BattleBoard.jsx`, exiba um botão de reação somente em partidas `pvp` ou `calamity` com conexão multiplayer.
2. O botão deve funcionar mesmo fora do turno do jogador; reação não é ação de combate.
3. Ao clicar, abra um popover compacto com as sete imagens, nomes acessíveis e suporte a teclado/Escape.
4. Ao escolher uma reação, feche o popover, mostre a reação localmente e envie aos outros participantes.
5. Mostre a reação em um balão sobre a área do remetente por aproximadamente 2,5 segundos, com entrada, leve flutuação e saída. Não cubra cartas, essência nem botões importantes.
6. Uma reação nova do mesmo remetente substitui a anterior. Reações de jogadores diferentes podem aparecer ao mesmo tempo na Calamidade.
7. Respeite `prefers-reduced-motion`.

## Protocolo P2P

Reutilize `window.electron.ipcRenderer.sendP2PMessage`; não altere `main.ts` ou `preload.ts` sem necessidade comprovada.

Mensagem sugerida:

```js
{
  type: 'reaction',
  reactionId: 'love',
  senderSlot: 0,
  sentAt: Date.now(),
}
```

Regras obrigatórias:

- Valide `reactionId` contra o registro local.
- Ignore payload inválido, remetente desconhecido ou mensagem de um Steam ID que não pertença à partida.
- Reações não podem alterar `activePlayer`, turno, essência, mão, campo, log de combate ou estado autoritativo.
- Não inclua reações nos broadcasts completos de `state`; trate-as como eventos efêmeros.
- PvP: enviar diretamente para `peerSteamId64`.
- Calamidade convidado: enviar ao anfitrião usando `peerSteamId64`.
- Calamidade anfitrião: mostrar a reação recebida e retransmitir para os demais `calamityPeers`, sem ecoar ao remetente.
- A recepção de reação deve ficar separada dos listeners de `message.type === 'action'` e não pode exigir que seja a vez do remetente.

## Anti-spam

- Cliente: intervalo mínimo de 1,5 segundo entre envios.
- Recepção/anfitrião: descarte mensagens do mesmo remetente acima de uma a cada 750 ms.
- Mantenha timestamps em `useRef`, não no estado sincronizado.
- Não grave reação em `localStorage`, histórico ou estatísticas da partida.

## Arquitetura sugerida

- `src/constants/battleReactions.js`: registro de IDs, labels e imports dos assets.
- `src/components/BattleReactionPicker.jsx`: botão e popover acessível.
- `src/components/BattleReactionOverlay.jsx`: apresentação efêmera das reações ativas.
- `src/styles/battle-reactions.css`: estilos e animações.
- `BattleContext.jsx`: funções `sendBattleReaction`, recepção P2P, validação e retransmissão.
- Exponha pelo contexto somente a API e o estado local efêmero necessários à UI.

Se a organização atual do projeto favorecer nomes diferentes, adapte sem duplicar listeners ou registros.

## Testes obrigatórios

Adicione testes para:

1. Aceitar os sete IDs válidos e rejeitar qualquer outro valor.
2. Garantir que escolher uma reação não altera o estado de combate.
3. Aplicar cooldown no envio local.
4. Ignorar spam recebido.
5. PvP enviar apenas ao adversário correto.
6. Calamidade convidado enviar ao host.
7. Calamidade host retransmitir aos outros convidados sem eco.
8. Substituir a reação anterior do mesmo remetente e removê-la após o timeout.
9. Renderizar labels acessíveis no seletor.

Rode ao final:

```powershell
npm test -- --runInBand
npm run build:renderer
git diff --check
```

Não corrija arquivos ou comportamentos fora deste escopo e preserve todas as mudanças já existentes no worktree.

## Critérios de aceite

- Dois jogadores PvP conseguem trocar todas as sete reações sem depender do turno.
- Em Calamidade, qualquer participante consegue reagir e todos os demais recebem uma única cópia.
- Payloads inválidos e spam não causam renderização nem erro.
- Nenhuma reação interfere em jogadas, sincronização ou resultado da partida.
- Interface continua utilizável em 1366x768 e 1920x1080.
- Testes e build passam.

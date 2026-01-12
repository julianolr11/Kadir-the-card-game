# Sistema de Progressão de Batalha - Documentação

## Implementação Completa

### 1. **Fim de Jogo (BattleContext.jsx)**
- Quando uma criatura é derrotada, a orb do oponente é reduzida em 1
- Quando orbs chegam a 0, o jogo entra na fase `ended`
- Estado `gameResult` e `killFeed` são populados automaticamente

### 2. **Modal de Resultado (BattleResultModal.jsx + battle-result.css)**
- Exibe tela de **VITÓRIA** ou **DERROTA** quando o jogo acaba
- Mostra estatísticas:
  - Número de inimigos derrotados
  - Total de XP ganho (25 XP por kill)
  - Boosters recebidos (+1 booster por vitória)
- **Kill Feed**: Lista de qual carta abateu qual
- **XP Distribution**: Mostra XP distribuído a cada criatura que participou
- Botão "Continuar" retorna ao menu

### 3. **Sistema de XP (AppContext.jsx)**
- Já implementado: `updateCardInstanceXp(cardId, instanceId, xpGain)`
- **25 XP por kill** distribuído entre criaturas que abateram inimigos
- **100 XP = 1 Level** (cada nível custa 100 XP)
- Máximo de 10 níveis por criatura
- XP é persistido no localStorage

### 4. **Sistema de Level/Habilidades Desbloqueadas**

#### Estrutura do `unlockTable` (em cada carta):
```javascript
unlockTable: [
  { level: 0, type: 'none' },
  { level: 1, type: 'skill', id: 'skill_id', name, desc, cost },
  { level: 2, type: 'perk', id: 'PERK_ID' },
  { level: 3, type: 'skill', id: 'another_skill', name, desc, cost },
]
```

#### Tipos de Desbloqueáveis:
- **skill**: Nova habilidade (ataque, magia, etc)
- **perk**: Bônus passivo (ATTACK_PLUS_1, HP_PLUS_2, etc)
- **none**: Nenhum desbloqueável nesse nível

#### Funções em `effectRegistry.js`:
- `getUnlockedAbilities(cardData, level)`: Retorna todas as habilidades ativas para um level
- `getUnlockedPerks(cardData, level)`: Retorna todos os perks ativos para um level

#### Integração Automática:
- `resolveCreatureBuild()` em BattleContext já considera:
  - Perks desbloqueados do `unlockTable`
  - Bonus de ATK/DEF/HP dos perks
  - Habilidades desbloqueadas automaticamente

### 5. **Booster Reward**
- Ao vencer: `updateBoosters(boosters + 1)`
- Já integrado no `BattleResultModal`
- Boosters são persistidos em localStorage

### 6. **Kill Feed e Estatísticas**
- Cada kill é registrada em `state.killFeed`:
  ```javascript
  {
    turn: number,
    attacker: string (nome),
    attackerId: string,
    target: string (nome),
    targetId: string,
  }
  ```
- Exibido no modal de resultado com design visual bonito
- Mostra qual criatura abateu qual em cada turno

## Fluxo de Batalha Completo

1. **Batalha acontece normalmente** - Criaturas lutam até alguém ficar sem orbs
2. **Fim da Batalha** - Phase muda para `ended`
3. **BattleResultModal Aparece**:
   - Mostra resultado (ganhou/perdeu)
   - Exibe kills e XP distribuído
   - Adiciona 1 booster se venceu
4. **XP é Distribuído** - `updateCardInstanceXp()` é chamado para cada criatura que matou
5. **Player avança Níveis** - Ao atingir 100 XP, nível sobe automaticamente
6. **Novas Habilidades Desbloqueadas** - Próximas vezes que usar a criatura, `resolveCreatureBuild()` retorna novas habilidades
7. **Volta ao Menu** - onClick do botão "Continuar"

## Como Testar

1. Abra DevTools (F12)
2. Vá para Application > LocalStorage
3. Procure por `cardCollection`
4. Edite manualmente um level: `"level": 5` (para ver habilidades desbloqueadas no level 5)
5. Sumone a criatura em batalha - verá novas habilidades ativas
6. Derrote inimigos para ganhar XP
7. Ao atingir 100 XP, o level sobe automaticamente

## Arquivos Modificados

1. **BattleContext.jsx** - Adicionado detecção de fim de jogo e killFeed
2. **BattleBoard.jsx** - Adicionado import e renderização do BattleResultModal
3. **AppContext.jsx** - Já tinha updateCardInstanceXp e XP system (não modificado)
4. **effectRegistry.js** - Adicionado getUnlockedAbilities() e getUnlockedPerks()
5. **BattleResultModal.jsx** - Novo componente
6. **battle-result.css** - Novo arquivo de estilos

## Próximas Melhorias (Opcional)

- [ ] Tela de Bestiary/Pokedex mostrando XP e habilidades desbloqueadas
- [ ] Animação de nível up durante/após a batalha
- [ ] Som de level up
- [ ] Ranking de criaturas por level
- [ ] Prestige system (resetar e ganhar bônus)

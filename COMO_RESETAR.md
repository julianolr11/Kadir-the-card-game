# 🔄 Como Resetar o Progresso

## Métodos Disponíveis

### 1. **Cheat Code na Aplicação** (Recomendado)
Na tela principal (HomeScreen), digite:
```
kadirreset
```
- Uma janela de confirmação aparecerá
- Clique OK para resetar
- A aplicação recarregará automaticamente

**O que será resetado:**
- ✅ 5 boosters
- ✅ Coleção vazia (sem cartas)
- ✅ Decks deletados
- ✅ Loadouts de guardiões limpos
- ✅ Guardião volta para Draak

---

### 2. **DevTools Console** (Rápido)
1. Pressione `F12` para abrir DevTools
2. Vá na aba **Console**
3. Cole este código:

```javascript
localStorage.setItem('boosters', '5');
localStorage.setItem('cardCollection', '{}');
localStorage.removeItem('kadir_decks');
localStorage.removeItem('guardianLoadouts');
console.log('✅ Resetado! Pressione Ctrl+R');
```

4. Pressione `Ctrl+R` para recarregar

---

### 3. **Interface Web** (Visual)
Abra o arquivo `reset-progress.html` no navegador:
```bash
start reset-progress.html
```
ou simplesmente clique duas vezes no arquivo.

Interface mostra:
- Status atual (boosters, cartas, decks)
- Botão de verificação
- Botão de reset com confirmação

---

## 🎮 Outros Cheat Codes

### `kadirbooster` - Adicionar 5 Boosters
Digite `kadirbooster` na tela principal para ganhar 5 boosters instantaneamente.

---

## 🧪 Testar o Tooltip de Instâncias

Após resetar, para testar o tooltip:

1. **Abra 2-3 boosters** para ter cartas
2. **Pode haver cartas duplicadas** (5% de chance por booster)
3. **Vá ao DeckBuilder**
4. **Cartas com múltiplas cópias** terão:
   - Badge dourado "Nx" no canto superior direito
   - Borda dourada especial
5. **Passe o mouse sobre a carta**
   - Tooltip aparecerá à direita
   - Mostrará todas as cópias com Level/XP/Holo

**Se não aparecer tooltip:**
- Verifique se realmente tem múltiplas instâncias da mesma carta
- Abra mais boosters até conseguir duplicatas
- Use cheat code: `kadirbooster` (5 boosters)

---

## 📝 Estrutura do localStorage

```javascript
// Boosters
localStorage.boosters = "5"

// Coleção (vazia após reset)
localStorage.cardCollection = "{}"
// Exemplo com cartas:
// {
//   "virideer": [
//     { instanceId: "123-abc", xp: 0, level: 0, isHolo: false },
//     { instanceId: "124-def", xp: 45, level: 0, isHolo: true }
//   ]
// }

// Decks (removido após reset)
localStorage.kadir_decks = undefined

// Loadouts (removido após reset)
localStorage.guardianLoadouts = undefined
```

---

## 🎯 Caso Precise de Teste Rápido

Execute no Console do DevTools:

```javascript
// Adicionar múltiplas instâncias manualmente para teste
const testCollection = {
  "virideer": [
    { instanceId: "1-a", cardId: "virideer", xp: 25, level: 0, isHolo: false, acquiredAt: new Date().toISOString() },
    { instanceId: "2-b", cardId: "virideer", xp: 78, level: 0, isHolo: true, acquiredAt: new Date().toISOString() },
    { instanceId: "3-c", cardId: "virideer", xp: 10, level: 0, isHolo: false, acquiredAt: new Date().toISOString() }
  ],
  "landor": [
    { instanceId: "4-d", cardId: "landor", xp: 50, level: 0, isHolo: false, acquiredAt: new Date().toISOString() },
    { instanceId: "5-e", cardId: "landor", xp: 92, level: 0, isHolo: true, acquiredAt: new Date().toISOString() }
  ]
};
localStorage.setItem('cardCollection', JSON.stringify(testCollection));
location.reload();
```

Isso criará 3 cópias de Virideer e 2 de Landor para testar o tooltip imediatamente!

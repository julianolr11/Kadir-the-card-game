// ============================================
// RESET DE PROGRESSO - COLE NO DEVTOOLS (F12)
// ============================================

// Limpar TUDO relacionado ao jogo
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && (key.startsWith('kadir') || key.includes('deck') || key.includes('guardian') || key.includes('card'))) {
    keysToRemove.push(key);
  }
}
keysToRemove.forEach(key => localStorage.removeItem(key));

// Definir valores iniciais
localStorage.setItem('boosters', '5');
localStorage.setItem('cardCollection', '{}');
localStorage.setItem('kadir_decks', '{}');
localStorage.setItem('activeGuardian', JSON.stringify({
  name: 'draak',
  img: '../assets/img/creatures/draak_bio.webp'
}));

console.log('✅ Progresso resetado completamente!');
console.log('Removidas', keysToRemove.length, 'chaves do localStorage');
console.log('Recarregue a página (Ctrl+R ou F5)');

// Perguntar se quer recarregar
if (confirm('Reset concluído! Recarregar agora?')) {
  window.location.reload();
}

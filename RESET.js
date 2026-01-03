// ============================================
// RESET DE PROGRESSO - COLE NO DEVTOOLS (F12)
// ============================================

localStorage.setItem('boosters', '5');
localStorage.setItem('cardCollection', '{}');
localStorage.removeItem('kadir_decks');
localStorage.removeItem('guardianLoadouts');
localStorage.setItem('activeGuardian', JSON.stringify({
  name: 'draak',
  img: '../assets/img/creatures/draak_bio.webp'
}));

console.log('✅ Progresso resetado! Recarregue a página (Ctrl+R)');

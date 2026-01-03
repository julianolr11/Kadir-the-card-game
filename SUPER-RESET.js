// ==============================================
// SUPER RESET - LIMPA ABSOLUTAMENTE TUDO
// Cole no DevTools Console (F12) e pressione Enter
// ==============================================

console.log('🧹 Iniciando limpeza completa do localStorage...\n');

// Mostrar o que tem antes
console.log('📊 ANTES do reset:');
console.log('Total de chaves:', localStorage.length);
const beforeKeys = [];
for (let i = 0; i < localStorage.length; i++) {
  beforeKeys.push(localStorage.key(i));
}
console.log('Chaves:', beforeKeys);

// LIMPAR ABSOLUTAMENTE TUDO
console.log('\n🗑️ Removendo TODAS as chaves...');
localStorage.clear();

console.log('✅ localStorage completamente limpo!\n');

// Definir apenas os valores iniciais essenciais
console.log('⚙️ Configurando valores iniciais...');
localStorage.setItem('boosters', '5');
localStorage.setItem('cardCollection', '{}');
localStorage.setItem('kadir_decks', '{}');
localStorage.setItem('activeGuardian', JSON.stringify({
  name: 'draak',
  img: '../assets/img/creatures/draak_bio.webp'
}));
localStorage.setItem('lang', 'ptbr');
localStorage.setItem('musicVolume', '50');
localStorage.setItem('effectsVolume', '50');

console.log('📊 DEPOIS do reset:');
console.log('Boosters:', localStorage.getItem('boosters'));
console.log('Cartas:', localStorage.getItem('cardCollection'));
console.log('Decks:', localStorage.getItem('kadir_decks'));
console.log('Total de chaves:', localStorage.length);

console.log('\n✅ SUPER RESET CONCLUÍDO!');
console.log('🔄 A página será recarregada em 2 segundos...\n');

setTimeout(() => {
  window.location.reload();
}, 2000);

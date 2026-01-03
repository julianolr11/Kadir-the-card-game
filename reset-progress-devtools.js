/**
 * Script de Reset de Progresso
 * 
 * Execute este script no DevTools Console (F12) da aplicação Electron
 * para resetar completamente o progresso do usuário.
 * 
 * Ctrl+A -> Ctrl+C -> Cole no Console -> Enter
 */

console.log('🔄 Iniciando reset do progresso...\n');

// Valores iniciais
const initialData = {
  boosters: 5,
  cardCollection: {},
  activeGuardian: {
    name: 'draak',
    img: require('../assets/img/creatures/draak_bio.webp')
  }
};

// Status anterior
console.log('📊 Status ANTES do reset:');
console.log('Boosters:', localStorage.getItem('boosters') || '0');
try {
  const collection = JSON.parse(localStorage.getItem('cardCollection') || '{}');
  const cardsCount = Object.keys(collection).length;
  let instancesCount = 0;
  Object.values(collection).forEach(instances => {
    if (Array.isArray(instances)) instancesCount += instances.length;
  });
  console.log('Cartas únicas:', cardsCount);
  console.log('Instâncias totais:', instancesCount);
} catch (e) {
  console.log('Erro ao ler coleção:', e.message);
}

try {
  const decks = JSON.parse(localStorage.getItem('kadir_decks') || '{}');
  console.log('Decks salvos:', Object.keys(decks).length);
} catch (e) {
  console.log('Decks salvos: 0');
}

console.log('\n🗑️ Limpando dados...');

// Limpar localStorage
localStorage.setItem('boosters', '5');
localStorage.setItem('cardCollection', '{}');
localStorage.removeItem('kadir_decks');
localStorage.removeItem('guardianLoadouts');
localStorage.setItem('activeGuardian', JSON.stringify({
  name: 'draak',
  img: '../assets/img/creatures/draak_bio.webp'
}));

console.log('\n📊 Status DEPOIS do reset:');
console.log('Boosters:', localStorage.getItem('boosters'));
console.log('Cartas:', '0');
console.log('Instâncias:', '0');
console.log('Decks:', '0');

console.log('\n✅ Reset concluído com sucesso!');
console.log('🔄 Recarregue a página (Ctrl+R ou F5) para aplicar as mudanças.\n');

// Perguntar se quer recarregar
if (confirm('Reset concluído! Deseja recarregar a página agora?')) {
  window.location.reload();
}

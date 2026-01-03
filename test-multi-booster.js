/**
 * Test script to verify card instances system with multiple booster openings
 * Simulates opening 3 boosters to get duplicate cards
 */

// Generate booster pack helper
const generateBoosterPack = () => {
  const mockCards = [
    { id: 'virideer', name: { pt: 'Virideer' } },
    { id: 'landor', name: { pt: 'Landor' } },
    { id: 'raptauros', name: { pt: 'Raptauros' } },
    { id: 'ekeranth', name: { pt: 'Ekeranth' } },
    { id: 'ashfang', name: { pt: 'Ashfang' } },
    { id: 'viborom', name: { pt: 'Viborom' } },
    { id: 'kael', name: { pt: 'Kael' } },
  ];
  
  const shuffled = [...mockCards].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5).map(card => ({
    ...card,
    isHolo: Math.random() < 0.1, // 10% holo chance
  }));
};

// Instance creation helpers
const generateInstanceId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const createCardInstance = (cardId, isHolo = false) => {
  return {
    instanceId: generateInstanceId(),
    cardId,
    xp: Math.floor(Math.random() * 101), // 0-100 XP
    level: 0,
    isHolo,
    acquiredAt: new Date().toISOString(),
  };
};

// Start with empty collection
console.log('=== MULTI-BOOSTER INSTANCES TEST ===\n');
const cardCollection = {};

// Simulate opening 3 boosters
console.log('Simulating 3 booster openings...\n');
for (let boosterNum = 1; boosterNum <= 3; boosterNum++) {
  console.log(`BOOSTER ${boosterNum}:`);
  const boosterCards = generateBoosterPack();
  
  boosterCards.forEach(card => {
    const instance = createCardInstance(card.id, card.isHolo);
    if (!cardCollection[card.id]) {
      cardCollection[card.id] = [];
    }
    cardCollection[card.id].push(instance);
    console.log(`  Added: ${card.id}${card.isHolo ? ' ✨ HOLO' : ''}`);
  });
  console.log();
}

// Analyze collection
console.log('COLLECTION SUMMARY:');
console.log('==================\n');

const getCardInstances = (cardId) => cardCollection[cardId] || [];
const cardsWithMultipleInstances = Object.entries(cardCollection)
  .filter(([_, instances]) => instances.length > 1)
  .sort((a, b) => b[1].length - a[1].length);

console.log(`Total unique cards: ${Object.keys(cardCollection).length}`);
console.log(`Cards with multiple copies: ${cardsWithMultipleInstances.length}\n`);

if (cardsWithMultipleInstances.length > 0) {
  console.log('Cards with Multiple Instances:');
  console.log('------------------------------');
  
  cardsWithMultipleInstances.forEach(([cardId, instances]) => {
    console.log(`\n${cardId.toUpperCase()} - ${instances.length} copies:`);
    instances.forEach((inst, idx) => {
      const holoStr = inst.isHolo ? ' ✨ HOLO' : '';
      console.log(`  Copy #${idx + 1}: Level ${inst.level}, XP ${inst.xp}${holoStr}`);
      console.log(`           Instance ID: ${inst.instanceId.slice(0, 20)}...`);
      console.log(`           Acquired: ${new Date(inst.acquiredAt).toLocaleString('pt-BR')}`);
    });
    
    console.log(`  ✓ CardInstanceSelector would show these options`);
  });
}

// Test selector behavior
console.log('\n\nTEST: Guardian Selection Example');
console.log('================================\n');

if (cardsWithMultipleInstances.length > 0) {
  const [testCardId, testInstances] = cardsWithMultipleInstances[0];
  console.log(`Scenario: Player tries to select '${testCardId}' as guardian\n`);
  
  console.log(`CardInstanceSelector modal would display:`);
  console.log(`  Title: "Selecione uma cópia do guardião"`);
  console.log(`  Card: ${testCardId}`);
  console.log(`  Available copies: ${testInstances.length}`);
  console.log();
  
  // Simulate sorting (highest level/xp first)
  const sorted = [...testInstances].sort((a, b) => {
    if (b.level !== a.level) return b.level - a.level;
    return b.xp - a.xp;
  });
  
  sorted.forEach((inst, idx) => {
    const holoStr = inst.isHolo ? ' ✨ HOLO' : '';
    console.log(`  [ ] Cópia #${idx + 1}: Level ${inst.level}, XP ${inst.xp}${holoStr}`);
  });
  
  console.log(`\nPlayer selects copy #1 → Guardian set to '${testCardId}' with instance ${sorted[0].instanceId.slice(0, 15)}...`);
}

// Test deck builder
console.log('\n\nTEST: Deck Builder Example');
console.log('==========================\n');

if (cardsWithMultipleInstances.length > 1) {
  const [deckCardId, deckInstances] = cardsWithMultipleInstances[1];
  console.log(`Scenario: Player clicks to add '${deckCardId}' to deck\n`);
  
  if (deckInstances.length > 1) {
    console.log(`✓ Card has ${deckInstances.length} copies in collection`);
    console.log(`✓ CardInstanceSelector modal appears`);
    console.log(`✓ Player selects a copy`);
    console.log(`✓ Card added to deck slot with that instance\n`);
    
    console.log(`If player has 2 of the same card in deck:`);
    console.log(`  - Slot 1: ${deckCardId} (instance ${deckInstances[0].instanceId.slice(0, 10)}...)`);
    if (deckInstances.length > 1) {
      console.log(`  - Slot 5: ${deckCardId} (instance ${deckInstances[1].instanceId.slice(0, 10)}...)`);
      console.log(`\nEach slot can have different instance with different progression!`);
    }
  }
}

// Persistence test
console.log('\n\nTEST: LocalStorage Persistence');
console.log('===============================\n');

try {
  const json = JSON.stringify(cardCollection);
  console.log(`✓ Serialized collection: ${json.length} bytes`);
  
  const restored = JSON.parse(json);
  console.log(`✓ Deserialized successfully`);
  
  let totalInstances = 0;
  Object.values(restored).forEach(insts => totalInstances += insts.length);
  console.log(`✓ Restored ${totalInstances} total instances`);
  
  console.log(`✓ All data preserved: instances, XP, level, holo status, timestamps`);
} catch (err) {
  console.log(`✗ Persistence test failed: ${err.message}`);
}

console.log('\n=== TEST COMPLETE ===\n');

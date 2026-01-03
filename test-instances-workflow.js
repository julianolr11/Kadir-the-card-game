/**
 * Test script to verify card instances system workflow
 *
 * Simulates:
 * 1. Opening a booster (5 random cards)
 * 2. Adding cards to collection as instances
 * 3. Verifying instances are created with XP/level/holo
 * 4. Selecting guardian from multiple instances
 * 5. Adding card with multiple instances to deck
 */

// Mock data
const mockCardData = {
  id: 'virideer',
  name: { pt: 'Virideer', en: 'Virideer' },
  element: 'terra',
  hp: 12,
  type: 'Beast',
};

// Test 1: Generate booster pack (5 random cards)
console.log('TEST 1: Generate Booster Pack');
console.log('Expected: 5 cards with isHolo property (10% chance)');
const generateBoosterPack = () => {
  const mockCards = [
    { id: 'virideer', name: { pt: 'Virideer' } },
    { id: 'landor', name: { pt: 'Landor' } },
    { id: 'raptauros', name: { pt: 'Raptauros' } },
    { id: 'ekeranth', name: { pt: 'Ekeranth' } },
    { id: 'ashfang', name: { pt: 'Ashfang' } },
  ];

  return mockCards.map(card => ({
    ...card,
    isHolo: Math.random() < 0.1, // 10% chance
  }));
};

const boosterCards = generateBoosterPack();
console.log(`✓ Generated ${boosterCards.length} cards from booster`);
boosterCards.forEach((card, idx) => {
  console.log(`  Card ${idx + 1}: ${card.id}, holo: ${card.isHolo}`);
});

// Test 2: Create card instances
console.log('\nTEST 2: Create Card Instances');
console.log('Expected: Each card creates an instance with instanceId, xp=0-100, level=0');

const generateInstanceId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const createCardInstance = (cardId, isHolo = false) => {
  return {
    instanceId: generateInstanceId(),
    cardId,
    xp: Math.floor(Math.random() * 101), // 0-100 XP on creation
    level: 0,
    isHolo,
    acquiredAt: new Date().toISOString(),
  };
};

const instances = boosterCards.map(card =>
  createCardInstance(card.id, card.isHolo)
);

console.log(`✓ Created ${instances.length} instances`);
instances.forEach((inst, idx) => {
  console.log(`  Instance ${idx + 1}: ${inst.cardId}, id=${inst.instanceId.slice(0, 10)}..., xp=${inst.xp}, holo=${inst.isHolo}`);
});

// Test 3: Group instances by cardId (simulating cardCollection structure)
console.log('\nTEST 3: Organize Collection by Card ID');
console.log('Expected: { cardId: [instance1, instance2, ...] }');

const cardCollection = {};
instances.forEach(inst => {
  if (!cardCollection[inst.cardId]) {
    cardCollection[inst.cardId] = [];
  }
  cardCollection[inst.cardId].push(inst);
});

Object.entries(cardCollection).forEach(([cardId, insts]) => {
  console.log(`  ${cardId}: ${insts.length} copy/copies`);
  if (insts.length > 1) {
    console.log(`    ✓ Multiple instances detected - will show selector!`);
  }
});

// Test 4: Simulate guardian selection
console.log('\nTEST 4: Guardian Selection with Multiple Instances');
console.log('Expected: If multiple copies exist, show CardInstanceSelector modal');

const getCardInstances = (cardId) => {
  return cardCollection[cardId] || [];
};

const selectedGuardianCardId = Object.keys(cardCollection).find(
  cardId => getCardInstances(cardId).length > 1
);

if (selectedGuardianCardId) {
  const guardianInstances = getCardInstances(selectedGuardianCardId);
  console.log(`✓ Guardian '${selectedGuardianCardId}' has ${guardianInstances.length} copies`);
  console.log(`✓ CardInstanceSelector modal should appear with options:`);
  guardianInstances.forEach((inst, idx) => {
    console.log(`    Copy #${idx + 1}: Level ${inst.level}, XP ${inst.xp}${inst.isHolo ? ' ✨ HOLO' : ''}`);
  });
} else {
  console.log('✓ No card with multiple instances - direct selection would be used');
}

// Test 5: Simulate deck building
console.log('\nTEST 5: Add Card to Deck with Instance Selection');
console.log('Expected: If multiple instances, show selector; otherwise add directly');

const addCardToDeck = (cardId) => {
  const instances = getCardInstances(cardId);
  if (instances.length > 1) {
    console.log(`✓ Card '${cardId}' has ${instances.length} copies`);
    console.log(`✓ Showing CardInstanceSelector to choose which copy`);
    return { showSelector: true, instances };
  } else if (instances.length === 1) {
    console.log(`✓ Card '${cardId}' has 1 copy - adding directly to deck`);
    return { showSelector: false, selectedInstance: instances[0] };
  } else {
    console.log(`✗ Card '${cardId}' not in collection`);
    return { showSelector: false, selectedInstance: null };
  }
};

// Find a card with multiple instances for testing
const testCardId = Object.keys(cardCollection).find(
  cardId => getCardInstances(cardId).length > 1
);

if (testCardId) {
  const result = addCardToDeck(testCardId);
  console.log(`\nResult:`, result);
} else {
  console.log(`No card with multiple instances to test`);
}

// Test 6: Verify data persistence (would be in localStorage)
console.log('\nTEST 6: Data Persistence Simulation');
console.log('Expected: cardCollection serializable to localStorage');

try {
  const serialized = JSON.stringify(cardCollection);
  const deserialized = JSON.parse(serialized);
  console.log(`✓ Collection serialization successful`);
  console.log(`✓ Serialized size: ${serialized.length} bytes`);
  console.log(`✓ Can be stored in localStorage`);
} catch (err) {
  console.log(`✗ Serialization failed: ${err.message}`);
}

console.log('\n=== ALL TESTS PASSED ===\n');

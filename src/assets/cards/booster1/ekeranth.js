// Card data for Ekeranth
module.exports = {
	// Dados básicos da carta
	id: 'ekeranth',
	title: { pt: 'Tirano do fogo', en: 'Fire Tyrant' },
	num: 6,
	height: 6.4,
	weakness: 'agua',
	name: { pt: 'Ekeranth', en: 'Ekeranth' },
	type: { pt: 'Draconídeo', en: 'Draconid' },
	element: 'fogo',
	img: require('../../img/creatures/ekeranth_bio.jpg'),
	color: 'fire',
	hp: 6,

	// Habilidades base (exibidas no card preview)
	abilities: [
		{ name: { pt: 'Fúria Flamejante', en: 'Flaming Fury' }, cost: 1, desc: { pt: 'Causa 2 de dano ao inimigo.', en: 'Deals 2 damage to the enemy.' } },
		{ name: { pt: 'Rajada de Fogo', en: 'Fire Burst' }, cost: 2, desc: { pt: 'Causa 1 de dano a 2 inimigos aleatórios em campo.', en: 'Deals 1 damage to 2 random enemies on the field.' } }
	],

	// Campo de efeito
	field: { pt: 'Solo Vulcânico', en: 'Volcanic Soil' },
	fielddesc: { pt: 'Durante 3 turnos as cartas de fogo ficam imunes as suas fraquezas.', en: 'For 3 turns, fire cards become immune to their weaknesses.' },

	// História
	storyTitle: { pt: 'O Tirano do Fogo', en: 'The Fire Tyrant' },
	story: [
		{ pt: 'Ekeranth nasceu nas entranhas ardentes de Ashkarn, forjado quando um ritual para controlar o fogo primordial saiu do controle e fez um vulcão inteiro ruir sobre si mesmo. Do colapso surgiu um draconídeo de pele vermelha incandescente, com veias de magma pulsando sob a carne como um coração em fúria.', en: 'Ekeranth was born in the burning bowels of Ashkarn, forged when a ritual to control primordial fire spiraled out of control and brought an entire volcano crashing down. From the collapse emerged a draconid with incandescent red skin, magma veins pulsing beneath flesh like a heart in fury.' },
		{ pt: 'Seu corpo exala fumaça constante, e cada movimento faz a terra rachar. Torres de pedra derretem sob suas garras, e suas asas, cortadas por fissuras luminosas, espalham brasas por onde passam.', en: 'His body exhales constant smoke, and each movement cracks the earth. Stone towers melt under his claws, and his wings, cut by luminous fissures, spread embers wherever they pass.' },
		{ pt: 'Nos olhos verdes arde uma consciência antiga: fragmentos das mentes que tentaram criá-lo. Por isso, Ekeranth não caça por instinto — ele caça por julgamento.', en: 'In his green eyes burns an ancient consciousness: fragments of the minds that tried to create him. This is why Ekeranth does not hunt by instinct — he hunts by judgment.' },
		{ pt: 'Ele não reina sobre reinos. Ele os reduz a cinzas.', en: 'He does not reign over kingdoms. He reduces them to ashes.' }
	],

	// ===== DADOS ESTENDIDOS (Guardiã) =====
	isGuardian: true,

	// Habilidades padrão do guardião (sempre disponíveis)
	defaultSkills: [
		{
			id: 'ekeranth_skill_1',
			name: { pt: 'Fúria Flamejante', en: 'Flaming Fury' },
			desc: { pt: 'Causa 2 de dano ao inimigo.', en: 'Deals 2 damage to the enemy.' },
			cost: 1,
			type: 'damage',
		},
		{
			id: 'ekeranth_skill_2',
			name: { pt: 'Rajada de Fogo', en: 'Fire Burst' },
			desc: { pt: 'Causa 1 de dano a 2 inimigos aleatórios em campo.', en: 'Deals 1 damage to 2 random enemies on the field.' },
			cost: 2,
			type: 'aoe_damage',
		},
	],

	// Bênção padrão
	defaultBlessing: {
		id: 'ekeranth_blessing',
		name: { pt: 'Solo Vulcânico', en: 'Volcanic Soil' },
		desc: { pt: 'Durante 3 turnos as cartas de fogo ficam imunes as suas fraquezas.', en: 'For 3 turns, fire cards become immune to their weaknesses.' },
	},

	// Tabela de desbloqueios por nível (0-10)
	unlockTable: [
		{
			level: 0,
			type: 'skill',
			id: 'ekeranth_skill_1',
			name: { pt: 'Fúria Flamejante', en: 'Flaming Fury' },
			displayText: { pt: 'Causa 2 de dano ao inimigo', en: 'Deals 2 damage to the enemy' },
			cost: 1,
		},
		{
			level: 0,
			type: 'skill',
			id: 'ekeranth_skill_2',
			name: { pt: 'Rajada de Fogo', en: 'Fire Burst' },
			displayText: { pt: 'Causa 1 de dano a 2 inimigos aleatórios em campo', en: 'Deals 1 damage to 2 random enemies on the field' },
			cost: 2,
		},
		{
			level: 1,
			type: 'skill',
			id: 'ekeranth_skill_3',
			name: { pt: 'Sopro Abrasador', en: 'Searing Breath' },
			displayText: { pt: 'Aplica 🔥 a um inimigo por 2 turnos (–1 Vida por turno).', en: 'Applies 🔥 to an enemy for 2 turns (–1 HP per turn).' },
			cost: 1,
			statusEffect: 'burn',
		},
		{
			level: 2,
			type: 'perk',
			id: 'HP_PLUS_1',
			name: { pt: '+1 de vida', en: '+1 HP' },
			displayText: { pt: 'nv 2 - + 1 de vida\ninicia com + 1 de vida', en: 'Lv 2 - +1 HP\nStart with +1 HP' },
		},
		{ level: 3, type: 'none' },
		{
			level: 4,
			type: 'skill',
			id: 'ekeranth_skill_4',
			name: { pt: 'Erupção', en: 'Eruption' },
			displayText: { pt: 'Causa 3 de dano a um inimigo', en: 'Deals 3 damage to an enemy' },
			cost: 3,
		},
		{
			level: 5,
			type: 'perk',
			id: 'ARMOR_PLUS_2',
			name: { pt: 'Pele Impenetrável', en: 'Impenetrable Skin' },
			displayText: { pt: 'Ganha 2 de 🛡️', en: 'Gains 2 🛡️' },
		},
		{ level: 6, type: 'none' },
		{
			level: 7,
			type: 'perk',
			id: 'KILL_XP_BONUS_10',
			name: { pt: '+10% de exp por abate', en: '+10% XP per kill' },
			displayText: { pt: '+10% de exp por abate do guardião', en: '+10% XP per guardian kill' },
		},
		{ level: 8, type: 'none' },
		{
			level: 9,
			type: 'skill',
			id: 'ekeranth_skill_6',
			name: { pt: 'Meteoro Flamejante', en: 'Flaming Meteor' },
			displayText: { pt: 'Causa 2 de dano e aplica 🔥 por 2 turnos (–1 Vida por turno).', en: 'Deals 2 damage and applies 🔥 for 2 turns (–1 HP per turn).' },
			cost: 2,
			statusEffect: 'burn',
		},
		{
			level: 10,
			type: 'skill',
			id: 'ekeranth_skill_7',
			name: { pt: 'Rugido do Vulcão', en: 'Volcano\'s Roar' },
			displayText: { pt: 'Causa 4 de dano ao inimigo', en: 'Deals 4 damage to the enemy' },
			cost: 3,
		},
	],
};

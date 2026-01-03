// Card data for Griffor
module.exports = {
	id: 'griffor',
	num: 5,
	height: 2.2,
	weakness: 'puro',
	name: { pt: 'Griffor', en: 'Griffor' },
	type: { pt: 'Ave', en: 'Bird' },
	element: 'puro',
	img: require('../../img/creatures/griffor_bio.webp'),
	color: 'pure',
	hp: 4,
	abilities: [
		{ name: { pt: 'Voo Sagrado', en: 'Sacred Flight' }, cost: 1, desc: { pt: 'Causa 22 de dano ao inimigo.', en: 'Deals 22 damage to the enemy.' } },
		{ name: { pt: 'Proteção Celestial', en: 'Celestial Protection' }, cost: 1, desc: { pt: 'Aliados recebem escudo de luz.', en: 'Allies receive a light shield.' } }
	],
	field: { pt: 'Céu Imaculado', en: 'Immaculate Sky' },
	fielddesc: { pt: 'Aliados recebem 6% menos dano enquanto Griffor estiver em campo.', en: 'Allies take 6% less damage while Griffor is on the field.' },
	storyTitle: { pt: 'Origem de Griffor', en: 'Origin of Griffor' },
	story: [
		{ pt: 'Griffor é uma ave lendária, símbolo de pureza e proteção.', en: 'Griffor is a legendary bird, symbol of purity and protection.' },
		{ pt: 'Seu voo inspira coragem e esperança.', en: 'Its flight inspires courage and hope.' }
	],

	// ===== DADOS ESTENDIDOS (Guardião) =====
	isGuardian: true,
	defaultSkills: [
		{
			id: 'griffor_skill_1',
			name: { pt: 'Garra Dilaceradora', en: 'Rending Claw' },
			desc: { pt: 'Causa 23 de dano ao inimigo com garras afiadas.', en: 'Deals 23 damage to the enemy with sharp claws.' },
			cost: 1,
			type: 'damage',
		},
		{
			id: 'griffor_skill_2',
			name: { pt: 'Salto Acrobático', en: 'Acrobatic Leap' },
			desc: { pt: 'Causa 17 de dano e aumenta esquiva em 20% por 1 turno.', en: 'Deals 17 damage and increases evasion by 20% for 1 turn.' },
			cost: 1,
			type: 'damage_buff',
		},
	],
	defaultBlessing: {
		id: 'griffor_blessing',
		name: { pt: 'Ferocidade Selvagem', en: 'Wild Ferocity' },
		desc: { pt: 'Criaturas de fogo ganham +12% de ataque enquanto Griffor estiver em campo.', en: 'Fire creatures gain +12% attack while Griffor is on the field.' },
	},
	unlockTable: [
		{ level: 0, type: 'none' },
		{ level: 1, type: 'skill', id: 'griffor_skill_3', name: { pt: 'Ataques Rápidos', en: 'Quick Strikes' }, desc: { pt: 'Causa 19 de dano 2 vezes consecutivas.', en: 'Deals 19 damage twice consecutively.' }, cost: 1 },
		{ level: 2, type: 'perk', id: 'HP_PLUS_1' },
		{ level: 3, type: 'none' },
		{ level: 4, type: 'skill', id: 'griffor_skill_4', name: { pt: 'Ataque Feral', en: 'Feral Attack' }, desc: { pt: 'Causa 32 de dano e ignora 25% da defesa inimiga.', en: 'Deals 32 damage and ignores 25% of enemy defense.' }, cost: 2 },
		{ level: 5, type: 'skill', id: 'griffor_skill_5', name: { pt: 'Velocidade Legendária', en: 'Legendary Speed' }, desc: { pt: 'Causa 27 de dano e age 2 vezes por turno.', en: 'Deals 27 damage and acts twice per turn.' }, cost: 2 },
		{ level: 6, type: 'none' },
		{ level: 7, type: 'perk', id: 'FIRST_ROUND_SHIELD' },
		{ level: 8, type: 'perk', id: 'HP_PLUS_2' },
		{ level: 9, type: 'skill', id: 'griffor_skill_6', name: { pt: 'Fúria Selvagem', en: 'Wild Fury' }, desc: { pt: 'Causa 37 de dano e reduz defesa do inimigo significativamente.', en: 'Deals 37 damage and significantly reduces enemy defense.' }, cost: 2 },
		{ level: 10, type: 'skill', id: 'griffor_skill_7', name: { pt: 'Grito do Predador', en: 'Predator\'s Roar' }, desc: { pt: 'Supremo: 45 de dano e atordoa inimigo enquanto recupera 12 de vida.', en: 'Ultimate: 45 damage and stuns enemy while recovering 12 HP.' }, cost: 3 },
	],
};

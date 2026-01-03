// Card data for Leoracal
module.exports = {
	id: 'leoracal',
	num: 4,
	height: 1.5,
	weakness: 'ar',
	name: { pt: 'Leoracal', en: 'Leoracal' },
	type: { pt: 'Fera', en: 'Beast' },
	element: 'terra',
	img: require('../../img/creatures/leoracal_bio.webp'),
	color: 'earth',
	hp: 5,
	abilities: [
		{
			name: { pt: 'Rugido Sísmico', en: 'Seismic Roar' },
			cost: 1,
			desc: { pt: 'Causa 26 de dano ao inimigo.', en: 'Deals 26 damage to the enemy.' }
		},
		{
			name: { pt: 'Pele Rochosa', en: 'Rocky Hide' },
			cost: 1,
			desc: { pt: 'Reduz dano recebido em 10%.', en: 'Reduces damage taken by 10%.' }
		}
	],
	field: { pt: 'Solo Sagrado', en: 'Sacred Ground' },
	fielddesc: { pt: 'Aliados recebem 7% menos dano enquanto Leoracal estiver em campo.', en: 'Allies take 7% less damage while Leoracal is on the field.' },
	storyTitle: { pt: 'Origem de Leoracal', en: 'Origin of Leoracal' },
	story: [
		{ pt: 'Leoracal é uma fera de força incomparável, guardiã das terras ancestrais.', en: 'Leoracal is a beast of unmatched strength, guardian of ancient lands.' },
		{ pt: 'Seu rugido ecoa por todo o campo de batalha.', en: 'Its roar echoes across the battlefield.' }
	],

	// ===== DADOS ESTENDIDOS (Guardião) =====
	isGuardian: true,
	defaultSkills: [
		{
			id: 'leoracal_skill_1',
			name: { pt: 'Rugido Flamejante', en: 'Flaming Roar' },
			desc: { pt: 'Causa 23 de dano com fogo ardente.', en: 'Deals 23 damage with blazing fire.' },
			cost: 1,
			type: 'damage',
		},
		{
			id: 'leoracal_skill_2',
			name: { pt: 'Chama Queimadora', en: 'Burning Flame' },
			desc: { pt: 'Causa 15 de dano e queima o inimigo por 2 turnos.', en: 'Deals 15 damage and burns enemy for 2 turns.' },
			cost: 1,
			type: 'damage_debuff',
		},
	],
	defaultBlessing: {
		id: 'leoracal_blessing',
		name: { pt: 'Inferno Protetor', en: 'Protective Inferno' },
		desc: { pt: 'Criaturas de fogo ganham +8% de defesa enquanto Leoracal estiver em campo.', en: 'Fire creatures gain +8% defense while Leoracal is on the field.' },
	},
	unlockTable: [
		{ level: 0, type: 'none' },
		{ level: 1, type: 'skill', id: 'leoracal_skill_3', name: { pt: 'Bola de Fogo', en: 'Fireball' }, desc: { pt: 'Causa 19 de dano e queima 1 turno.', en: 'Deals 19 damage and burns for 1 turn.' }, cost: 1 },
		{ level: 2, type: 'perk', id: 'HP_PLUS_1' },
		{ level: 3, type: 'none' },
		{ level: 4, type: 'skill', id: 'leoracal_skill_4', name: { pt: 'Inferno Devastador', en: 'Devastating Inferno' }, desc: { pt: 'Causa 27 de dano e queima o campo.', en: 'Deals 27 damage and burns the field.' }, cost: 2 },
		{ level: 5, type: 'skill', id: 'leoracal_skill_5', name: { pt: 'Fúria Leonina', en: 'Leonine Fury' }, desc: { pt: 'Causa 33 de dano e aumenta ataque próprio.', en: 'Deals 33 damage and increases own attack.' }, cost: 2 },
		{ level: 6, type: 'none' },
		{ level: 7, type: 'perk', id: 'FIRST_ROUND_SHIELD' },
		{ level: 8, type: 'perk', id: 'HP_PLUS_2' },
		{ level: 9, type: 'skill', id: 'leoracal_skill_6', name: { pt: 'Chama Suprema', en: 'Supreme Flame' }, desc: { pt: 'Causa 36 de dano e queima por 3 turnos.', en: 'Deals 36 damage and burns for 3 turns.' }, cost: 2 },
		{ level: 10, type: 'skill', id: 'leoracal_skill_7', name: { pt: 'Verdade do Leão', en: 'Lion\'s Truth' }, desc: { pt: 'Supremo: 43 de dano e queima todos os inimigos.', en: 'Ultimate: 43 damage and burns all enemies.' }, cost: 3 },
	],
};

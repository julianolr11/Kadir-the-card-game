// Card data for Kael
module.exports = {
	id: 'kael',
	title: { pt: 'Do abismo', en: 'from the abyss' },
	num: 3,
	height: 1.8,
	weakness: 'terra',
	name: { pt: 'Kael', en: 'Kael' },
	type: { pt: 'Fera', en: 'Beast' },
	element: 'agua',
	img: require('../../img/creatures/kael_bio.webp'),
	color: 'water',
	hp: 4,
	abilities: [
		{
			name: { pt: 'Mordida Gélida', en: 'Frost Bite' },
			cost: 1,
			desc: { pt: 'Causa 24 de dano ao inimigo.', en: 'Deals 24 damage to the enemy.' }
		},
		{
			name: { pt: 'Pele Escorregadia', en: 'Slippery Hide' },
			cost: 1,
			desc: { pt: 'Reduz dano recebido em 8%.', en: 'Reduces damage taken by 8%.' }
		}
	],
	field: { pt: 'Lago Sagrado', en: 'Sacred Lake' },
	fielddesc: { pt: 'Aliados recebem 5% menos dano enquanto Kael estiver em campo.', en: 'Allies take 5% less damage while Kael is on the field.' },
	storyTitle: { pt: 'Origem de Kael', en: 'Origin of Kael' },
	story: [
		{ pt: 'Kael é uma fera das águas profundas, astuta e resistente.', en: 'Kael is a beast of the deep waters, cunning and resilient.' },
		{ pt: 'Sua presença acalma aliados e confunde inimigos.', en: 'Its presence calms allies and confuses enemies.' }
	],

	// ===== DADOS ESTENDIDOS (Guardião) =====
	isGuardian: true,
	defaultSkills: [
		{
			id: 'kael_skill_1',
			name: { pt: 'Cone de Gelo', en: 'Cone of Ice' },
			desc: { pt: 'Causa 21 de dano ao inimigo com frio intenso.', en: 'Deals 21 damage to the enemy with intense cold.' },
			cost: 1,
			type: 'damage',
		},
		{
			id: 'kael_skill_2',
			name: { pt: 'Cristal Refrigerador', en: 'Chilling Crystal' },
			desc: { pt: 'Causa 14 de dano e reduz velocidade do inimigo em 30%.', en: 'Deals 14 damage and reduces enemy speed by 30%.' },
			cost: 1,
			type: 'damage_debuff',
		},
	],
	defaultBlessing: {
		id: 'kael_blessing',
		name: { pt: 'Frieza Absoluta', en: 'Absolute Coldness' },
		desc: { pt: 'Criaturas de gelo ganham +9% de resistência enquanto Kael estiver em campo.', en: 'Ice creatures gain +9% resistance while Kael is on the field.' },
	},
	unlockTable: [
		{ level: 0, type: 'none' },
		{ level: 1, type: 'skill', id: 'kael_skill_3', name: { pt: 'Blizzard Cortante', en: 'Cutting Blizzard' }, desc: { pt: 'Causa 23 de dano em área e congela 1 turno.', en: 'Deals 23 area damage and freezes for 1 turn.' }, cost: 1 },
		{ level: 2, type: 'perk', id: 'HP_PLUS_1' },
		{ level: 3, type: 'none' },
		{ level: 4, type: 'skill', id: 'kael_skill_4', name: { pt: 'Prisma Gelado', en: 'Icy Prism' }, desc: { pt: 'Causa 29 de dano e reflete 20% do dano recebido.', en: 'Deals 29 damage and reflects 20% of damage taken.' }, cost: 2 },
		{ level: 5, type: 'skill', id: 'kael_skill_5', name: { pt: 'Inverno Eterno', en: 'Eternal Winter' }, desc: { pt: 'Causa 34 de dano e congela o campo por 2 turnos.', en: 'Deals 34 damage and freezes the field for 2 turns.' }, cost: 2 },
		{ level: 6, type: 'none' },
		{ level: 7, type: 'perk', id: 'GUARDIAN_KILL_XP_BONUS' },
		{ level: 8, type: 'perk', id: 'HP_PLUS_2' },
		{ level: 9, type: 'skill', id: 'kael_skill_6', name: { pt: 'Avalanche Misteriosa', en: 'Mysterious Avalanche' }, desc: { pt: 'Causa 38 de dano e paralisa todos os inimigos.', en: 'Deals 38 damage and paralyzes all enemies.' }, cost: 2 },
		{ level: 10, type: 'skill', id: 'kael_skill_7', name: { pt: 'Era do Gelo', en: 'Ice Age' }, desc: { pt: 'Supremo: 44 de dano e congela o campo por 3 turnos.', en: 'Ultimate: 44 damage and freezes the field for 3 turns.' }, cost: 3 },
	],
};

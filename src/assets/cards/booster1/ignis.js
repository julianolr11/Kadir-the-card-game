// Card data for Ignis
module.exports = {
	id: 'ignis',
	num: 7,
	height: 1.2,
	weakness: 'agua',
	name: { pt: 'Ignis', en: 'Ignis' },
	type: { pt: 'Ave', en: 'Bird' },
	element: 'fogo',
	img: require('../../img/creatures/ignis_bio.webp'),
	color: 'fire',
	hp: 3,
	abilities: [
		{ name: { pt: 'Chama Alada', en: 'Winged Flame' }, cost: 1, desc: { pt: 'Causa 20 de dano ao inimigo.', en: 'Deals 20 damage to the enemy.' } },
		{ name: { pt: 'Voo Flamejante', en: 'Flaming Flight' }, cost: 1, desc: { pt: 'Causa 10 de dano extra ao atacar.', en: 'Deals 10 extra damage when attacking.' } }
	],
	field: { pt: 'Céu Flamejante', en: 'Flaming Sky' },
	fielddesc: { pt: 'Aumenta dano de fogo em 6% enquanto Ignis estiver em campo.', en: 'Increases fire damage by 6% while Ignis is on the field.' },
	storyTitle: { pt: 'Origem de Ignis', en: 'Origin of Ignis' },
	story: [
		{ pt: 'Ignis é uma ave de fogo, ágil e feroz.', en: 'Ignis is a fire bird, agile and fierce.' },
		{ pt: 'Seu voo deixa rastros de brasas pelo campo.', en: 'Its flight leaves trails of embers across the field.' }
	],

	// ===== DADOS ESTENDIDOS (Guardião) =====
	isGuardian: true,
	defaultSkills: [
		{
			id: 'ignis_skill_1',
			name: { pt: 'Chama Abrasadora', en: 'Searing Flame' },
			desc: { pt: 'Causa 24 de dano ao inimigo com fogo intenso.', en: 'Deals 24 damage to the enemy with intense fire.' },
			cost: 1,
			type: 'damage',
		},
		{
			id: 'ignis_skill_2',
			name: { pt: 'Queimadura Persistente', en: 'Lingering Burn' },
			desc: { pt: 'Causa 12 de dano e nega 2 pontos de vida por 2 turnos.', en: 'Deals 12 damage and drains 2 HP per turn for 2 turns.' },
			cost: 1,
			type: 'damage_drain',
		},
	],
	defaultBlessing: {
		id: 'ignis_blessing',
		name: { pt: 'Pele de Brasa', en: 'Ember Skin' },
		desc: { pt: 'Criaturas de fogo recebem +10% de resistência enquanto Ignis estiver em campo.', en: 'Fire creatures gain +10% resistance while Ignis is on the field.' },
	},
	unlockTable: [
		{ level: 0, type: 'none' },
		{ level: 1, type: 'skill', id: 'ignis_skill_3', name: { pt: 'Explosão Ardente', en: 'Flaming Explosion' }, desc: { pt: 'Causa 20 de dano em área e queima todos os inimigos.', en: 'Deals 20 area damage and burns all enemies.' }, cost: 1 },
		{ level: 2, type: 'perk', id: 'HP_PLUS_1' },
		{ level: 3, type: 'none' },
		{ level: 4, type: 'skill', id: 'ignis_skill_4', name: { pt: 'Inferno Concentrado', en: 'Focused Inferno' }, desc: { pt: 'Causa 27 de dano e aumenta próprio ataque em 15% por 2 turnos.', en: 'Deals 27 damage and increases own attack by 15% for 2 turns.' }, cost: 2 },
		{ level: 5, type: 'skill', id: 'ignis_skill_5', name: { pt: 'Torrente de Chamas', en: 'Flame Torrent' }, desc: { pt: 'Causa 31 de dano. Dano adicional se inimigo estiver em chamas.', en: 'Deals 31 damage. Bonus damage if enemy is burning.' }, cost: 2 },
		{ level: 6, type: 'none' },
		{ level: 7, type: 'perk', id: 'GUARDIAN_KILL_XP_BONUS' },
		{ level: 8, type: 'perk', id: 'HP_PLUS_2' },
		{ level: 9, type: 'skill', id: 'ignis_skill_6', name: { pt: 'Incineration', en: 'Incineration' }, desc: { pt: 'Causa 39 de dano e remove 1 escudo inimigo.', en: 'Deals 39 damage and removes 1 enemy shield.' }, cost: 3 },
		{ level: 10, type: 'skill', id: 'ignis_skill_7', name: { pt: 'Apocalipse Flamejante', en: 'Fiery Apocalypse' }, desc: { pt: 'Supremo: 46 de dano massivo e queima todo o campo.', en: 'Ultimate: 46 massive damage and burns the entire field.' }, cost: 3 },
	],
};

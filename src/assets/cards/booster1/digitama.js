// Card data for Digitama
module.exports = {
	id: 'digitama',
	title: { pt: 'Fogo silencioso', en: 'Silent fire' },
	num: 10,
	height: 1.23,
	weakness: 'agua',
	name: { pt: 'Digitama', en: 'Digitama' },
	type: { pt: 'Mística', en: 'Mystic' },
	element: 'fogo',
	img: require('../../img/creatures/digitama_bio.webp'),
	color: 'fire',
	hp: 4,
	abilities: [
		{ name: { pt: 'Chama Mística', en: 'Mystic Flame' }, cost: 1, desc: { pt: 'Causa 25 de dano ao inimigo.', en: 'Deals 25 damage to the enemy.' } },
		{ name: { pt: 'Explosão Arcana', en: 'Arcane Explosion' }, cost: 1, desc: { pt: 'Causa 15 de dano em todos os inimigos.', en: 'Deals 15 damage to all enemies.' } }
	],
	field: { pt: 'Aura Flamejante', en: 'Flaming Aura' },
	fielddesc: { pt: 'Aumenta o dano de fogo em 8% enquanto Digitama estiver em campo.', en: 'Increases fire damage by 8% while Digitama is on the field.' },
	storyTitle: { pt: 'Origem de Digitama', en: 'Origin of Digitama' },
	story: [
		{ pt: 'Digitama é uma criatura mística nascida do fogo primordial, capaz de manipular chamas mágicas.', en: 'Digitama is a mystical creature born from primordial fire, able to manipulate magical flames.' },
		{ pt: 'Sua presença aquece o campo e inspira aliados com energia flamejante.', en: 'Its presence warms the field and inspires allies with fiery energy.' }
	],

	// ===== DADOS ESTENDIDOS (Guardião) =====
	isGuardian: true,
	defaultSkills: [
		{
			id: 'digitama_skill_1',
			name: { pt: 'Chama Mística', en: 'Mystic Flame' },
			desc: { pt: 'Causa 25 de dano ao inimigo.', en: 'Deals 25 damage to the enemy.' },
			cost: 1,
			type: 'damage',
		},
		{
			id: 'digitama_skill_2',
			name: { pt: 'Explosão Arcana', en: 'Arcane Explosion' },
			desc: { pt: 'Causa 15 de dano em todos os inimigos.', en: 'Deals 15 damage to all enemies.' },
			cost: 1,
			type: 'aoe_damage',
		},
	],
	defaultBlessing: {
		id: 'digitama_blessing',
		name: { pt: 'Aura Flamejante', en: 'Flaming Aura' },
		desc: { pt: 'Aumenta o dano de fogo em 8% enquanto Digitama estiver em campo.', en: 'Increases fire damage by 8% while Digitama is on the field.' },
	},
	unlockTable: [
		{ level: 0, type: 'none' },
		{ level: 1, type: 'skill', id: 'digitama_skill_3', name: { pt: 'Brasa Giratória', en: 'Spinning Ember' }, desc: { pt: 'Causa 18 de dano e aplica queimadura leve.', en: 'Deals 18 damage and applies a light burn.' }, cost: 1 },
		{ level: 2, type: 'perk', id: 'HP_PLUS_1' },
		{ level: 3, type: 'none' },
		{ level: 4, type: 'skill', id: 'digitama_skill_4', name: { pt: 'Lança Incandescente', en: 'Incandescent Spear' }, desc: { pt: 'Causa 26 de dano e ignora 15% da defesa.', en: 'Deals 26 damage and ignores 15% defense.' }, cost: 2 },
		{ level: 5, type: 'skill', id: 'digitama_skill_5', name: { pt: 'Chamas Crescentes', en: 'Rising Flames' }, desc: { pt: 'Causa 30 de dano. Cada uso aumenta o próximo em +4.', en: 'Deals 30 damage. Each use increases next by +4.' }, cost: 2 },
		{ level: 6, type: 'none' },
		{ level: 7, type: 'perk', id: 'FIRST_ROUND_SHIELD' },
		{ level: 8, type: 'perk', id: 'HP_PLUS_2' },
		{ level: 9, type: 'skill', id: 'digitama_skill_6', name: { pt: 'Coluna de Fogo', en: 'Pillar of Fire' }, desc: { pt: 'Causa 38 de dano em área e queima por 2 turnos.', en: 'Deals 38 area damage and burns for 2 turns.' }, cost: 3 },
		{ level: 10, type: 'skill', id: 'digitama_skill_7', name: { pt: 'Inferno Arcano', en: 'Arcane Inferno' }, desc: { pt: 'Supremo: 48 de dano massivo e atordoa 1 turno.', en: 'Ultimate: Massive 48 damage and stuns for 1 turn.' }, cost: 3 },
	],
};

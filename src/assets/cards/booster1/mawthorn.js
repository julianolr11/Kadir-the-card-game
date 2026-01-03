// Card data for Mawthorn
module.exports = {
	id: 'mawthorn',
	num: 2,
	height: 4.2,
	weakness: 'terra',
	name: { pt: 'Mawthorn', en: 'Mawthorn' },
	type: { pt: 'Monstro', en: 'Monster' },
	element: 'agua',
	img: require('../../img/creatures/mawthorn_bio.webp'),
	color: 'water',
	hp: 3,
	abilities: [
		{
			name: { pt: 'Garras Abissais', en: 'Abyssal Claws' },
			cost: 1,
			desc: { pt: 'Causa 18 de dano ao inimigo.', en: 'Deals 18 damage to the enemy.' }
		},
		{
			name: { pt: 'Regeneração', en: 'Regeneration' },
			cost: 1,
			desc: { pt: 'Recupera 10 de vida por turno.', en: 'Restores 10 HP per turn.' }
		}
	],
	field: { pt: 'Abismo Profundo', en: 'Deep Abyss' },
	fielddesc: { pt: 'Aliados recuperam 3 de vida por turno enquanto Mawthorn estiver em campo.', en: 'Allies recover 3 HP per turn while Mawthorn is on the field.' },
	storyTitle: { pt: 'Origem de Mawthorn', en: 'Origin of Mawthorn' },
	story: [
		{ pt: 'Mawthorn é um monstro das profundezas, temido por sua voracidade.', en: 'Mawthorn is a deep-sea monster feared for its voracity.' },
		{ pt: 'Sua regeneração é lendária entre as criaturas aquáticas.', en: 'Its regeneration is legendary among aquatic creatures.' }
	],

	// ===== DADOS ESTENDIDOS (Guardião) =====
	isGuardian: true,
	defaultSkills: [
		{
			id: 'mawthorn_skill_1',
			name: { pt: 'Espinho Penetrante', en: 'Piercing Thorn' },
			desc: { pt: 'Causa 22 de dano ignorando defesa parcial.', en: 'Deals 22 damage ignoring partial defense.' },
			cost: 1,
			type: 'damage',
		},
		{
			id: 'mawthorn_skill_2',
			name: { pt: 'Veneno Corredor', en: 'Coursing Poison' },
			desc: { pt: 'Causa 14 de dano e envenena o inimigo por 3 turnos.', en: 'Deals 14 damage and poisons enemy for 3 turns.' },
			cost: 1,
			type: 'damage_debuff',
		},
	],
	defaultBlessing: {
		id: 'mawthorn_blessing',
		name: { pt: 'Proteção Tóxica', en: 'Toxic Protection' },
		desc: { pt: 'Criaturas venenosas ganham +8% de resistência enquanto Mawthorn estiver em campo.', en: 'Poison creatures gain +8% resistance while Mawthorn is on the field.' },
	},
	unlockTable: [
		{ level: 0, type: 'none' },
		{ level: 1, type: 'skill', id: 'mawthorn_skill_3', name: { pt: 'Nuvem Tóxica', en: 'Toxic Cloud' }, desc: { pt: 'Causa 17 de dano e envenena por 2 turnos.', en: 'Deals 17 damage and poisons for 2 turns.' }, cost: 1 },
		{ level: 2, type: 'perk', id: 'HP_PLUS_1' },
		{ level: 3, type: 'none' },
		{ level: 4, type: 'skill', id: 'mawthorn_skill_4', name: { pt: 'Picada Mortal', en: 'Deadly Sting' }, desc: { pt: 'Causa 26 de dano e envenena por 4 turnos.', en: 'Deals 26 damage and poisons for 4 turns.' }, cost: 2 },
		{ level: 5, type: 'skill', id: 'mawthorn_skill_5', name: { pt: 'Fúria da Natureza', en: 'Nature\'s Fury' }, desc: { pt: 'Causa 32 de dano e envenena o campo.', en: 'Deals 32 damage and poisons the field.' }, cost: 2 },
		{ level: 6, type: 'none' },
		{ level: 7, type: 'perk', id: 'FIRST_ROUND_SHIELD' },
		{ level: 8, type: 'perk', id: 'HP_PLUS_2' },
		{ level: 9, type: 'skill', id: 'mawthorn_skill_6', name: { pt: 'Toxina Suprema', en: 'Supreme Toxin' }, desc: { pt: 'Causa 35 de dano e envenena todos os inimigos.', en: 'Deals 35 damage and poisons all enemies.' }, cost: 2 },
		{ level: 10, type: 'skill', id: 'mawthorn_skill_7', name: { pt: 'Apocalipse Tóxico', en: 'Toxic Apocalypse' }, desc: { pt: 'Supremo: 42 de dano e envenena todos os inimigos por 5 turnos.', en: 'Ultimate: 42 damage and poisons all enemies for 5 turns.' }, cost: 3 },
	],
};

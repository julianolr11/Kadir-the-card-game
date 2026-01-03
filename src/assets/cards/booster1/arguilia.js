// Card data for Arguilia
module.exports = {
	id: 'arguilia',
	title: { pt: 'Espírito Ancestral do Rio', en: 'Ancestral River Spirit' },
	num: 17,
	height: 2.4,
	weakness: 'terra',
	name: { pt: 'Arguilia', en: 'Arguilia' },
	type: { pt: 'Ave', en: 'Bird' },
	element: 'agua',
	img: require('../../img/creatures/arguilia_bio.webp'),
	color: 'water',
	hp: 5,
	abilities: [
		{
			name: { pt: 'Asas do Fluxo', en: 'Wings of Flow' },
			cost: 1,
			desc: {
				pt: 'Causa 20 de dano e concede esquiva aumentada neste turno.',
				en: 'Deals 20 damage and grants increased evasion this turn.'
			}
		},
		{
			name: { pt: 'Véu das Águas', en: 'Veil of Waters' },
			cost: 1,
			desc: {
				pt: 'Aliados recebem redução de dano por 1 turno.',
				en: 'Allies receive damage reduction for 1 turn.'
			}
		}
	],
	field: { pt: 'Rio Sagrado', en: 'Sacred River' },
	fielddesc: {
		pt: 'Criaturas de água recebem 7% menos dano enquanto Arguilia estiver em campo.',
		en: 'Water creatures take 7% less damage while Arguilia is on the field.'
	},
	storyTitle: { pt: 'A Voz dos Rios Eternos', en: 'The Voice of Eternal Rivers' },
	story: [
		{
			pt: 'Arguilia é um espírito antigo que nasce onde rios sagrados cruzam terras intocadas.',
			en: 'Arguilia is an ancient spirit born where sacred rivers cross untouched lands.'
		},
		{
			pt: 'Seu canto guia viajantes, purifica águas corrompidas e mantém o equilíbrio do mundo.',
			en: 'Its song guides travelers, purifies corrupted waters, and preserves the balance of the world.'
		}
	],

	// ===== DADOS ESTENDIDOS (Guardião) =====
	isGuardian: true,
	defaultSkills: [
		{
			id: 'arguilia_skill_1',
			name: { pt: 'Picada Envenenada', en: 'Poisoned Bite' },
			desc: { pt: 'Causa 18 de dano e envenena o inimigo.', en: 'Deals 18 damage and poisons the enemy.' },
			cost: 1,
			type: 'damage_debuff',
		},
		{
			id: 'arguilia_skill_2',
			name: { pt: 'Teia Venenosa', en: 'Venomous Web' },
			desc: { pt: 'Causa 16 de dano e reduz velocidade do inimigo.', en: 'Deals 16 damage and reduces enemy speed.' },
			cost: 1,
			type: 'damage_debuff',
		},
	],
	defaultBlessing: {
		id: 'arguilia_blessing',
		name: { pt: 'Veneno Amplificado', en: 'Amplified Venom' },
		desc: { pt: 'Danos por veneno infligidos aumentam em 10% enquanto Arguilia estiver em campo.', en: 'Poison damage dealt increases by 10% while Arguilia is on the field.' },
	},
	unlockTable: [
		{ level: 0, type: 'none' },
		{ level: 1, type: 'skill', id: 'arguilia_skill_3', name: { pt: 'Neurotoxina', en: 'Neurotoxin' }, desc: { pt: 'Causa 22 de dano e paralisa o inimigo por 1 turno.', en: 'Deals 22 damage and paralyzes the enemy for 1 turn.' }, cost: 1 },
		{ level: 2, type: 'perk', id: 'HP_PLUS_1' },
		{ level: 3, type: 'skill', id: 'arguilia_skill_4', name: { pt: 'Choque Tóxico', en: 'Toxic Shock' }, desc: { pt: 'Causa 26 de dano e aplica 3 camadas de veneno.', en: 'Deals 26 damage and applies 3 poison layers.' }, cost: 2 },
		{ level: 4, type: 'perk', id: 'POISON_IMMUNITY' },
		{ level: 5, type: 'skill', id: 'arguilia_skill_5', name: { pt: 'Hálito Letal', en: 'Lethal Breath' }, desc: { pt: 'Causa 32 de dano e envenena o inimigo por 3 turnos.', en: 'Deals 32 damage and poisons the enemy for 3 turns.' }, cost: 2 },
		{ level: 6, type: 'perk', id: 'HP_PLUS_1' },
		{ level: 7, type: 'skill', id: 'arguilia_skill_6', name: { pt: 'Enxame Tóxico', en: 'Toxic Swarm' }, desc: { pt: 'Causa 24 de dano a todos os inimigos e reduz defesa.', en: 'Deals 24 damage to all enemies and reduces defense.' }, cost: 2 },
		{ level: 8, type: 'perk', id: 'DODGE_INCREASE' },
		{ level: 9, type: 'perk', id: 'HP_PLUS_2' },
		{ level: 10, type: 'skill', id: 'arguilia_skill_7', name: { pt: 'Praga Apocalíptica', en: 'Apocalyptic Plague' }, desc: { pt: 'Supremo: 40 de dano e aplica veneno permanente até o fim do combate.', en: 'Ultimate: 40 damage and applies permanent poison until combat ends.' }, cost: 3 },
	],
};

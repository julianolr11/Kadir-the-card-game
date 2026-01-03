// Card data for Landor
module.exports = {
	id: 'landor',
	title: { pt: 'Vento do Norte', en: 'Northern Wind' },
	num: 15,
	height: 1.8,
	weakness: 'terra',
	name: { pt: 'Landor', en: 'Landor' },
	type: { pt: 'Ave', en: 'Bird' },
	element: 'ar',
	img: require('../../img/creatures/landor_bio.webp'),
	color: 'air',
	hp: 4,
	abilities: [
		{
			name: { pt: 'Lâmina do Norte', en: 'Northern Blade' },
			cost: 1,
			desc: {
				pt: 'Causa 22 de dano ao inimigo com ventos cortantes.',
				en: 'Deals 22 damage to the enemy with cutting winds.'
			}
		},
		{
			name: { pt: 'Rajada Ascendente', en: 'Updraft Gust' },
			cost: 1,
			desc: {
				pt: 'Causa 14 de dano e empurra o inimigo, reduzindo sua eficácia no próximo turno.',
				en: 'Deals 14 damage and disrupts the enemy, reducing its effectiveness next turn.'
			}
		}
	],
	field: { pt: 'Correntes Boreais', en: 'Boreal Currents' },
	fielddesc: {
		pt: 'Aumenta a velocidade das criaturas de ar em 8% enquanto Landor estiver em campo.',
		en: 'Increases air creatures speed by 8% while Landor is on the field.'
	},
	storyTitle: { pt: 'O Guardião dos Ventos', en: 'Guardian of the Winds' },
	story: [
		{
			pt: 'Landor vaga pelos céus do norte, guiando correntes invisíveis com precisão ancestral.',
			en: 'Landor roams the northern skies, guiding invisible currents with ancient precision.'
		},
		{
			pt: 'Seu voo silencioso é sentido antes de ser visto, anunciando mudança e movimento.',
			en: 'Its silent flight is felt before it is seen, heralding change and motion.'
		}
	],

	// ===== DADOS ESTENDIDOS (Guardião) =====
	isGuardian: true,
	defaultSkills: [
		{
			id: 'landor_skill_1',
			name: { pt: 'Lâmina do Norte', en: 'Northern Blade' },
			desc: { pt: 'Causa 22 de dano ao inimigo com ventos cortantes.', en: 'Deals 22 damage to the enemy with cutting winds.' },
			cost: 1,
			type: 'damage',
		},
		{
			id: 'landor_skill_2',
			name: { pt: 'Rajada Ascendente', en: 'Updraft Gust' },
			desc: { pt: 'Causa 14 de dano e empurra o inimigo, reduzindo sua eficácia no próximo turno.', en: 'Deals 14 damage and disrupts the enemy, reducing its effectiveness next turn.' },
			cost: 1,
			type: 'damage_debuff',
		},
	],
	defaultBlessing: {
		id: 'landor_blessing',
		name: { pt: 'Correntes Boreais', en: 'Boreal Currents' },
		desc: { pt: 'Aumenta a velocidade das criaturas de ar em 8% enquanto Landor estiver em campo.', en: 'Increases air creatures speed by 8% while Landor is on the field.' },
	},
	unlockTable: [
		{ level: 0, type: 'none' },
		{ level: 1, type: 'skill', id: 'landor_skill_3', name: { pt: 'Tempestade Veloz', en: 'Swift Storm' }, desc: { pt: 'Ataque rápido que causa 18 de dano e aumenta velocidade temporariamente.', en: 'Quick attack dealing 18 damage and temporarily increasing speed.' }, cost: 1 },
		{ level: 2, type: 'perk', id: 'HP_PLUS_1' },
		{ level: 3, type: 'none' },
		{ level: 4, type: 'skill', id: 'landor_skill_4', name: { pt: 'Vórtice Cortante', en: 'Cutting Vortex' }, desc: { pt: 'Causa 26 de dano e ignora 20% da defesa inimiga.', en: 'Deals 26 damage and ignores 20% of enemy defense.' }, cost: 2 },
		{ level: 5, type: 'skill', id: 'landor_skill_5', name: { pt: 'Fúria dos Ventos', en: 'Wind Fury' }, desc: { pt: 'Ataque massivo que causa 32 de dano, mas reduz defesa própria por 1 turno.', en: 'Massive attack dealing 32 damage but reduces own defense for 1 turn.' }, cost: 2 },
		{ level: 6, type: 'none' },
		{ level: 7, type: 'perk', id: 'FIRST_ROUND_SHIELD' },
		{ level: 8, type: 'perk', id: 'HP_PLUS_2' },
		{ level: 9, type: 'skill', id: 'landor_skill_6', name: { pt: 'Ciclone Eterno', en: 'Eternal Cyclone' }, desc: { pt: 'Cria uma tempestade que causa 20 de dano por 2 turnos consecutivos.', en: 'Creates a storm dealing 20 damage for 2 consecutive turns.' }, cost: 2 },
		{ level: 10, type: 'skill', id: 'landor_skill_7', name: { pt: 'Ira Boreal', en: 'Boreal Wrath' }, desc: { pt: 'Habilidade suprema: 40 de dano e atordoa inimigo por 1 turno.', en: 'Ultimate ability: 40 damage and stuns enemy for 1 turn.' }, cost: 3 },
	],
};

// Card data for Faskel
module.exports = {
	id: 'faskel',
	title: { pt: 'Arauto dos Ventos Eternos', en: 'Herald of the Eternal Winds' },
	num: 18,
	height: 2.1,
	weakness: 'terra',
	name: { pt: 'Faskel', en: 'Faskel' },
	type: { pt: 'Mística', en: 'Mystic' },
	element: 'ar',
	img: require('../../img/creatures/faskel_bio.webp'),
	color: 'air',
	hp: 5,
	abilities: [
		{
			name: { pt: 'Galope Celeste', en: 'Celestial Gallop' },
			cost: 1,
			desc: {
				pt: 'Causa 20 de dano e aumenta a velocidade das criaturas de ar aliadas.',
				en: 'Deals 20 damage and increases the speed of allied air creatures.'
			}
		},
		{
			name: { pt: 'Asas do Zéfiro', en: 'Zephyr Wings' },
			cost: 1,
			desc: {
				pt: 'Evita o próximo ataque recebido ao se envolver em correntes de vento.',
				en: 'Evades the next incoming attack by wrapping itself in wind currents.'
			}
		}
	],
	field: { pt: 'Brisa do Alvorecer', en: 'Dawn Breeze' },
	fielddesc: {
		pt: 'Criaturas do elemento ar recebem +8% de esquiva enquanto Faskel estiver em campo.',
		en: 'Air element creatures gain +8% evasion while Faskel is on the field.'
	},
	storyTitle: { pt: 'Lenda de Faskel', en: 'Legend of Faskel' },
	story: [
		{
			pt: 'Diz-se que Faskel nasce onde o primeiro vento da manhã toca as montanhas.',
			en: 'It is said Faskel is born where the first morning wind touches the mountains.'
		},
		{
			pt: 'Seu galope ecoa como um presságio de mudança e liberdade.',
			en: 'Its gallop echoes as an omen of change and freedom.'
		}
	],

	// ===== DADOS ESTENDIDOS (Guardião) =====
	isGuardian: true,
	defaultSkills: [
		{
			id: 'faskel_skill_1',
			name: { pt: 'Lâmina Fulminante', en: 'Lightning Blade' },
			desc: { pt: 'Causa 26 de dano ao inimigo com eletricidade pura.', en: 'Deals 26 damage to the enemy with pure electricity.' },
			cost: 1,
			type: 'damage',
		},
		{
			id: 'faskel_skill_2',
			name: { pt: 'Choque Elétrico', en: 'Electric Shock' },
			desc: { pt: 'Causa 12 de dano e atordoa o inimigo com parálisia.', en: 'Deals 12 damage and stuns the enemy with paralysis.' },
			cost: 1,
			type: 'damage_debuff',
		},
	],
	defaultBlessing: {
		id: 'faskel_blessing',
		name: { pt: 'Condutor Perfeito', en: 'Perfect Conductor' },
		desc: { pt: 'Aumenta dano de eletricidade em 10% enquanto Faskel estiver em campo.', en: 'Increases electricity damage by 10% while Faskel is on the field.' },
	},
	unlockTable: [
		{ level: 0, type: 'none' },
		{ level: 1, type: 'skill', id: 'faskel_skill_3', name: { pt: 'Raio Destrutivo', en: 'Destructive Lightning' }, desc: { pt: 'Causa 24 de dano em área afetando múltiplos alvos.', en: 'Deals 24 area damage affecting multiple targets.' }, cost: 1 },
		{ level: 2, type: 'perk', id: 'HP_PLUS_1' },
		{ level: 3, type: 'none' },
		{ level: 4, type: 'skill', id: 'faskel_skill_4', name: { pt: 'Descarga Elétrica', en: 'Electric Discharge' }, desc: { pt: 'Causa 30 de dano e aumenta velocidade própria por 2 turnos.', en: 'Deals 30 damage and increases own speed for 2 turns.' }, cost: 2 },
		{ level: 5, type: 'skill', id: 'faskel_skill_5', name: { pt: 'Tempestade Elétrica', en: 'Electric Storm' }, desc: { pt: 'Causa 33 de dano e paralisa todos os inimigos por 1 turno.', en: 'Deals 33 damage and paralyzes all enemies for 1 turn.' }, cost: 2 },
		{ level: 6, type: 'none' },
		{ level: 7, type: 'perk', id: 'GUARDIAN_KILL_XP_BONUS' },
		{ level: 8, type: 'perk', id: 'HP_PLUS_2' },
		{ level: 9, type: 'skill', id: 'faskel_skill_6', name: { pt: 'Fulgor Supremo', en: 'Supreme Radiance' }, desc: { pt: 'Causa 40 de dano e reverte 1 debuff do aliado.', en: 'Deals 40 damage and reverts 1 debuff from ally.' }, cost: 3 },
		{ level: 10, type: 'skill', id: 'faskel_skill_7', name: { pt: 'Apocalipse Elétrico', en: 'Electric Apocalypse' }, desc: { pt: 'Supremo: 47 de dano massivo e atordoa tudo por 2 turnos.', en: 'Ultimate: Massive 47 damage and stuns everything for 2 turns.' }, cost: 3 },
	],
};

// Card data for Virideer
module.exports = {
	id: 'virideer',
	num: 11,
	height: 2.0,
	weakness: 'fogo',
	name: { pt: 'Virideer', en: 'Virideer' },
	type: { pt: 'Mística', en: 'Mystic' },
	element: 'terra',
	img: require('../../img/creatures/virideer_bio.webp'),
	color: 'earth',
	hp: 4,
	abilities: [
		{
			name: { pt: 'Chifre Protetor', en: 'Protective Horn' },
			cost: 1,
			desc: { pt: 'Causa 22 de dano ao inimigo.', en: 'Deals 22 damage to the enemy.' }
		},
		{
			name: { pt: 'Crescimento Rápido', en: 'Rapid Growth' },
			cost: 1,
			desc: { pt: 'Recupera 8 de vida por turno.', en: 'Recovers 8 HP per turn.' }
		}
	],
	field: { pt: 'Floresta Ancestral', en: 'Ancestral Forest' },
	fielddesc: {
		pt: 'Aliados recuperam 2 de vida por turno enquanto Virideer estiver em campo.',
		en: 'Allies recover 2 HP per turn while Virideer is on the field.'
	},
	storyTitle: { pt: 'Origem de Virideer', en: 'Origin of Virideer' },
	story: [
		{
			pt: 'Virideer é uma criatura mística das florestas ancestrais, símbolo de renovação.',
			en: 'Virideer is a mystic creature of the ancestral forests, a symbol of renewal.'
		},
		{
			pt: 'Sua energia vital fortalece todo o campo.',
			en: 'Its vital energy strengthens the entire field.'
		}
	],

	// ===== DADOS ESTENDIDOS (Guardião) =====
	isGuardian: true,
	defaultSkills: [
		{
			id: 'virideer_skill_1',
			name: { pt: 'Chifre Protetor', en: 'Protective Horn' },
			desc: { pt: 'Causa 18 de dano e recupera 6 de vida.', en: 'Deals 18 damage and recovers 6 HP.' },
			cost: 1,
			type: 'damage_heal',
		},
		{
			id: 'virideer_skill_2',
			name: { pt: 'Crescimento Rápido', en: 'Rapid Growth' },
			desc: { pt: 'Aumenta a defesa própria e regenera 4 de vida por turno por 2 turnos.', en: 'Increases own defense and regenerates 4 HP per turn for 2 turns.' },
			cost: 1,
			type: 'buff_regen',
		},
	],
	defaultBlessing: {
		id: 'virideer_blessing',
		name: { pt: 'Vitalidade da Floresta', en: 'Forest Vitality' },
		desc: { pt: 'Criaturas de terra regeneram 2 de vida por turno enquanto Virideer estiver em campo.', en: 'Earth creatures regenerate 2 HP per turn while Virideer is on the field.' },
	},
	unlockTable: [
		{ level: 0, type: 'none' },
		{ level: 1, type: 'skill', id: 'virideer_skill_3', name: { pt: 'Raízes Curativas', en: 'Healing Roots' }, desc: { pt: 'Recupera 12 de vida e remove debuffs.', en: 'Recovers 12 HP and removes debuffs.' }, cost: 1 },
		{ level: 2, type: 'perk', id: 'HP_PLUS_1' },
		{ level: 3, type: 'none' },
		{ level: 4, type: 'skill', id: 'virideer_skill_4', name: { pt: 'Espinhos Venenosos', en: 'Poison Thorns' }, desc: { pt: 'Causa 22 de dano e envenena o inimigo por 3 turnos.', en: 'Deals 22 damage and poisons enemy for 3 turns.' }, cost: 2 },
		{ level: 5, type: 'skill', id: 'virideer_skill_5', name: { pt: 'Chamado da Natureza', en: 'Nature\'s Call' }, desc: { pt: 'Causa 16 de dano e invoca raízes que imobilizam o inimigo.', en: 'Deals 16 damage and summons roots that immobilize enemy.' }, cost: 2 },
		{ level: 6, type: 'none' },
		{ level: 7, type: 'perk', id: 'FIRST_ROUND_SHIELD' },
		{ level: 8, type: 'perk', id: 'HP_PLUS_2' },
		{ level: 9, type: 'skill', id: 'virideer_skill_6', name: { pt: 'Floresta Sagrada', en: 'Sacred Forest' }, desc: { pt: 'Cria uma zona que cura 8 de vida por turno por 3 turnos.', en: 'Creates a zone healing 8 HP per turn for 3 turns.' }, cost: 2 },
		{ level: 10, type: 'skill', id: 'virideer_skill_7', name: { pt: 'Renascimento Verdejante', en: 'Verdant Rebirth' }, desc: { pt: 'Supremo: Recupera 25 de vida e aumenta ataque e defesa permanentemente.', en: 'Ultimate: Recovers 25 HP and permanently increases attack and defense.' }, cost: 3 },
	],
};

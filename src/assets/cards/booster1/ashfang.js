// Card data for Ashfang
module.exports = {
	id: 'ashfang',
	title: { pt: 'Presas vulcânicas', en: 'Volcanic Fangs' },
	num: 12,
	height: 2.7,
	weakness: 'agua',
	name: { pt: 'Ashfang', en: 'Ashfang' },
	type: { pt: 'Fera', en: 'Beast' },
	element: 'fogo',
	img: require('../../img/creatures/ashfang_bio.webp'),
	color: 'fire',
	hp: 4,
	abilities: [
		{
			name: { pt: 'Mordida Vulcânica', en: 'Volcanic Bite' },
			cost: 1,
			desc: { pt: 'Causa 22 de dano ao inimigo.', en: 'Deals 22 damage to the enemy.' }
		},
		{
			name: { pt: 'Fúria das Cinzas', en: 'Ashen Fury' },
			cost: 1,
			desc: { pt: 'Aumenta o ataque em 10% por 2 turnos.', en: 'Increases attack by 10% for 2 turns.' }
		}
	],
	field: { pt: 'Campos de Cinzas', en: 'Ash Fields' },
	fielddesc: {
		pt: 'Aliados de fogo recebem 6% menos dano enquanto Ashfang estiver em campo.',
		en: 'Fire allies take 6% less damage while Ashfang is on the field.'
	},
	storyTitle: { pt: 'Origem de Ashfang', en: 'Origin of Ashfang' },
	story: [
		{ pt: 'Ashfang emerge das cinzas de antigos vulcões, trazendo destruição e renascimento.', en: 'Ashfang emerges from the ashes of ancient volcanoes, bringing destruction and rebirth.' },
		{ pt: 'Sua presença aquece o campo e inspira aliados a lutar com fervor.', en: 'Its presence warms the field and inspires allies to fight with fervor.' }
	],

	// ===== DADOS ESTENDIDOS (Guardião) =====
	isGuardian: true,
	defaultSkills: [
		{
			id: 'ashfang_skill_1',
			name: { pt: 'Mordida Vulcânica', en: 'Volcanic Bite' },
			desc: { pt: 'Causa 22 de dano ao inimigo com presas incandescentes.', en: 'Deals 22 damage to the enemy with incandescent fangs.' },
			cost: 1,
			type: 'damage',
		},
		{
			id: 'ashfang_skill_2',
			name: { pt: 'Fúria das Cinzas', en: 'Ashen Fury' },
			desc: { pt: 'Causa 14 de dano e aumenta o próprio ataque em 12% por 2 turnos.', en: 'Deals 14 damage and increases own attack by 12% for 2 turns.' },
			cost: 1,
			type: 'damage_buff',
		},
	],
	defaultBlessing: {
		id: 'ashfang_blessing',
		name: { pt: 'Campos de Cinzas', en: 'Ash Fields' },
		desc: { pt: 'Aliados de fogo recebem 6% menos dano enquanto Ashfang estiver em campo.', en: 'Fire allies take 6% less damage while Ashfang is on the field.' },
	},
	unlockTable: [
		{ level: 0, type: 'none' },
		{ level: 1, type: 'skill', id: 'ashfang_skill_3', name: { pt: 'Erupção Vulcânica', en: 'Volcanic Eruption' }, desc: { pt: 'Causa 21 de dano em área afetando todos os inimigos.', en: 'Deals 21 area damage affecting all enemies.' }, cost: 1 },
		{ level: 2, type: 'perk', id: 'HP_PLUS_1' },
		{ level: 3, type: 'none' },
		{ level: 4, type: 'skill', id: 'ashfang_skill_4', name: { pt: 'Chamas Bravias', en: 'Wild Flames' }, desc: { pt: 'Causa 25 de dano e queima o inimigo, infligindo 3 de dano por 2 turnos.', en: 'Deals 25 damage and burns the enemy for 3 damage per turn.' }, cost: 2 },
		{ level: 5, type: 'skill', id: 'ashfang_skill_5', name: { pt: 'Investida Ígnea', en: 'Fiery Charge' }, desc: { pt: 'Causa 28 de dano e regenera 4 pontos de vida.', en: 'Deals 28 damage and regenerates 4 HP.' }, cost: 2 },
		{ level: 6, type: 'none' },
		{ level: 7, type: 'perk', id: 'FIRST_ROUND_SHIELD' },
		{ level: 8, type: 'perk', id: 'HP_PLUS_2' },
		{ level: 9, type: 'skill', id: 'ashfang_skill_6', name: { pt: 'Tsunami de Fogo', en: 'Fire Tsunami' }, desc: { pt: 'Causa 36 de dano e ignora 15% da defesa inimiga.', en: 'Deals 36 damage and ignores 15% of enemy defense.' }, cost: 3 },
		{ level: 10, type: 'skill', id: 'ashfang_skill_7', name: { pt: 'Derramamento Magmático', en: 'Magmatic Deluge' }, desc: { pt: 'Supremo: 44 de dano e queima o campo por 3 turnos.', en: 'Ultimate: 44 damage and burns the field for 3 turns.' }, cost: 3 },
	],
};

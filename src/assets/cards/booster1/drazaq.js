// Card data for Drazaq
module.exports = {
	id: 'drazaq',
	num: 8,
	height: 1.3,
	weakness: 'puro',
	name: { pt: 'Drazraq', en: 'Drazraq' },
	type: { pt: 'Draconídeo', en: 'Draconid' },
	element: 'puro',
	img: require('../../img/creatures/drazraq_bio.webp'),
	color: 'pure',
	hp: 5,
	abilities: [
		{
			name: { pt: 'Impacto Bestial', en: 'Beast Strike' },
			cost: 1,
			desc: { pt: 'Causa 30 de dano ao inimigo.', en: 'Deals 30 damage to the enemy.' }
		},
		{
			name: { pt: 'Fúria Vulcânica', en: 'Volcanic Rage' },
			cost: 1,
			desc: { pt: 'Aumenta seu ataque em 10% por 3 turnos.', en: 'Increases its attack by 10% for 3 turns.' }
		}
	],
	field: { pt: 'Fenda Vulcânica', en: 'Volcanic Rift' },
	fielddesc: {
		pt: 'Aliados recebem 5% de ataque adicional enquanto Drazraq estiver em campo.',
		en: 'Allies gain 5% attack while Drazraq is on the field.'
	},
	storyTitle: { pt: 'Origem de Drazraq', en: 'Origin of Drazraq' },
	story: [
		{ pt: 'Drazraq habita fissuras vulcânicas onde a vida e a chama se misturam.', en: 'Drazraq dwells in volcanic fissures where life and flame merge.' },
		{ pt: 'Sua força bruta é temida até entre outras feras.', en: 'Its brute strength is feared even among other beasts.' }
	],

	// ===== DADOS ESTENDIDOS (Guardião) =====
	isGuardian: true,
	defaultSkills: [
		{
			id: 'drazaq_skill_1',
			name: { pt: 'Bênção Sombria', en: 'Shadow Blessing' },
			desc: { pt: 'Causa 19 de dano ao inimigo com escuridão.', en: 'Deals 19 damage to the enemy with darkness.' },
			cost: 1,
			type: 'damage',
		},
		{
			id: 'drazaq_skill_2',
			name: { pt: 'Maldição Obscura', en: 'Dark Curse' },
			desc: { pt: 'Causa 14 de dano e reduz ataque do inimigo.', en: 'Deals 14 damage and reduces enemy attack.' },
			cost: 1,
			type: 'damage_debuff',
		},
	],
	defaultBlessing: {
		id: 'drazaq_blessing',
		name: { pt: 'Abraço das Sombras', en: 'Shadow Embrace' },
		desc: { pt: 'Aliados de sombra recebem +5% de resistência mágica enquanto Drazaq estiver em campo.', en: 'Shadow allies gain +5% magic resistance while Drazaq is on the field.' },
	},
	unlockTable: [
		{ level: 0, type: 'none' },
		{ level: 1, type: 'skill', id: 'drazaq_skill_3', name: { pt: 'Sucção de Vida', en: 'Life Drain' }, desc: { pt: 'Causa 21 de dano e recupera metade do dano infligido.', en: 'Deals 21 damage and recovers half the damage dealt.' }, cost: 1 },
		{ level: 2, type: 'perk', id: 'LIFESTEAL_INCREASE' },
		{ level: 3, type: 'skill', id: 'drazaq_skill_4', name: { pt: 'Sombra Devorador', en: 'Shadow Devourer' }, desc: { pt: 'Causa 28 de dano e reduz defesa mágica do inimigo.', en: 'Deals 28 damage and reduces enemy magic defense.' }, cost: 2 },
		{ level: 4, type: 'perk', id: 'HP_PLUS_1' },
		{ level: 5, type: 'skill', id: 'drazaq_skill_5', name: { pt: 'Noite Eterna', en: 'Eternal Night' }, desc: { pt: 'Causa 33 de dano e aplica escuridão por 3 turnos.', en: 'Deals 33 damage and applies darkness for 3 turns.' }, cost: 2 },
		{ level: 6, type: 'perk', id: 'MAGIC_RESISTANCE' },
		{ level: 7, type: 'skill', id: 'drazaq_skill_6', name: { pt: 'Portal da Perdição', en: 'Portal of Perdition' }, desc: { pt: 'Causa 32 de dano e reduz todos os stats do inimigo.', en: 'Deals 32 damage and reduces all enemy stats.' }, cost: 2 },
		{ level: 8, type: 'perk', id: 'HP_PLUS_2' },
		{ level: 9, type: 'perk', id: 'EVASION_BONUS' },
		{ level: 10, type: 'skill', id: 'drazaq_skill_7', name: { pt: 'Consumidor de Almas', en: 'Soul Devourer' }, desc: { pt: 'Supremo: 43 de dano e remove buffs do inimigo.', en: 'Ultimate: 43 damage and removes enemy buffs.' }, cost: 3 },
	],
};

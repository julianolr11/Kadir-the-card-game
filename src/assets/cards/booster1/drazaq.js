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
	]
};

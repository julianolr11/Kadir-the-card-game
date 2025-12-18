// Card data for Kael
module.exports = {
	id: 'kael',
	title: { pt: 'Do abismo', en: 'from the abyss' },
	num: 3,
	height: 1.8,
	weakness: 'terra',
	name: { pt: 'Kael', en: 'Kael' },
	type: { pt: 'Fera', en: 'Beast' },
	element: 'agua',
	img: require('../../img/creatures/kael_bio.png'),
	color: 'water',
	hp: 4,
	abilities: [
		{
			name: { pt: 'Mordida Gélida', en: 'Frost Bite' },
			desc: { pt: 'Causa 24 de dano ao inimigo.', en: 'Deals 24 damage to the enemy.' }
		},
		{
			name: { pt: 'Pele Escorregadia', en: 'Slippery Hide' },
			desc: { pt: 'Reduz dano recebido em 8%.', en: 'Reduces damage taken by 8%.' }
		}
	],
	field: { pt: 'Lago Sagrado', en: 'Sacred Lake' },
	fielddesc: { pt: 'Aliados recebem 5% menos dano enquanto Kael estiver em campo.', en: 'Allies take 5% less damage while Kael is on the field.' },
	storyTitle: { pt: 'Origem de Kael', en: 'Origin of Kael' },
	story: [
		{ pt: 'Kael é uma fera das águas profundas, astuta e resistente.', en: 'Kael is a beast of the deep waters, cunning and resilient.' },
		{ pt: 'Sua presença acalma aliados e confunde inimigos.', en: 'Its presence calms allies and confuses enemies.' }
	]
};

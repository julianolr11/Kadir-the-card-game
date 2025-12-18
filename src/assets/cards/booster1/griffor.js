// Card data for Griffor
module.exports = {
	id: 'griffor',
	num: 5,
	height: 2.2,
	weakness: 'puro',
	name: { pt: 'Griffor', en: 'Griffor' },
	type: { pt: 'Ave', en: 'Bird' },
	element: 'puro',
	img: require('../../img/creatures/griffor_bio.png'),
	color: 'pure',
	hp: 4,
	abilities: [
		{ name: { pt: 'Voo Sagrado', en: 'Sacred Flight' }, desc: { pt: 'Causa 22 de dano ao inimigo.', en: 'Deals 22 damage to the enemy.' } },
		{ name: { pt: 'Proteção Celestial', en: 'Celestial Protection' }, desc: { pt: 'Aliados recebem escudo de luz.', en: 'Allies receive a light shield.' } }
	],
	field: { pt: 'Céu Imaculado', en: 'Immaculate Sky' },
	fielddesc: { pt: 'Aliados recebem 6% menos dano enquanto Griffor estiver em campo.', en: 'Allies take 6% less damage while Griffor is on the field.' },
	storyTitle: { pt: 'Origem de Griffor', en: 'Origin of Griffor' },
	story: [
		{ pt: 'Griffor é uma ave lendária, símbolo de pureza e proteção.', en: 'Griffor is a legendary bird, symbol of purity and protection.' },
		{ pt: 'Seu voo inspira coragem e esperança.', en: 'Its flight inspires courage and hope.' }
	],
	blessing: {
		pt: 'Recebe uma bênção genérica.',
		en: 'Receives a generic blessing.'
	}
};

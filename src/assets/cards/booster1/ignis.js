// Card data for Ignis
module.exports = {
	id: 'ignis',
	num: 7,
	height: 1.2,
	weakness: 'agua',
	name: { pt: 'Ignis', en: 'Ignis' },
	type: { pt: 'Ave', en: 'Bird' },
	element: 'fogo',
	img: require('../../img/creatures/ignis_bio.png'),
	color: 'fire',
	hp: 3,
	abilities: [
		{ name: { pt: 'Chama Alada', en: 'Winged Flame' }, desc: { pt: 'Causa 20 de dano ao inimigo.', en: 'Deals 20 damage to the enemy.' } },
		{ name: { pt: 'Voo Flamejante', en: 'Flaming Flight' }, desc: { pt: 'Causa 10 de dano extra ao atacar.', en: 'Deals 10 extra damage when attacking.' } }
	],
	field: { pt: 'Céu Flamejante', en: 'Flaming Sky' },
	fielddesc: { pt: 'Aumenta dano de fogo em 6% enquanto Ignis estiver em campo.', en: 'Increases fire damage by 6% while Ignis is on the field.' },
	storyTitle: { pt: 'Origem de Ignis', en: 'Origin of Ignis' },
	story: [
		{ pt: 'Ignis é uma ave de fogo, ágil e feroz.', en: 'Ignis is a fire bird, agile and fierce.' },
		{ pt: 'Seu voo deixa rastros de brasas pelo campo.', en: 'Its flight leaves trails of embers across the field.' }
	]
};

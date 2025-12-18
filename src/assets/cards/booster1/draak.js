// Card data for Draak
module.exports = {
	id: 'draak',
	title: { pt: 'Olhos de esmeralda', en: 'Emerald Eyes' },
	num: 1,
	height: 3.1,
	weakness: 'puro',
	name: { pt: 'Draak', en: 'Draak' },
	type: { pt: 'Draconídeo', en: 'Draconid' },
	element: 'puro',
	img: require('../../img/creatures/draak_bio.png'),
	color: 'pure',
	hp: 5,
	abilities: [
		{
			name: { pt: 'Sopro Etéreo', en: 'Ethereal Breath' },
			desc: { pt: 'Causa 24 de dano ao inimigo.', en: 'Deals 24 damage to the enemy.' }
		},
		{
			name: { pt: 'Escamas Celestes', en: 'Sky Scales' },
			desc: { pt: 'Reduz dano recebido em 8%.', en: 'Reduces damage taken by 8%.' }
		}
	],
	field: { pt: 'Céu Cristalino', en: 'Crystal Sky' },
	fielddesc: {
		pt: 'Aumenta dano de ar em 10% enquanto Draak estiver em campo.',
		en: 'Increases air damage by 10% while Draak is on the field.'
	},
	storyTitle: { pt: 'Origem de Draak', en: 'Origin of Draak' },
	story: [
		{ pt: 'Draak é um jovem draconídeo nascido nas nuvens eternas.', en: 'Draak is a young draconid born in the eternal clouds.' },
		{ pt: 'Sua energia leve e instável o torna imprevisível e poderoso.', en: 'Its light and unstable energy makes it unpredictable and powerful.' }
	]
};

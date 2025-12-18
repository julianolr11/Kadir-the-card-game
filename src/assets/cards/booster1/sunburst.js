// Card data for Sunburst
module.exports = {
	id: 'sunburst',
	num: 14,
	height: 1.4,
	weakness: 'terra',
	name: { pt: 'Sunburst', en: 'Sunburst' },
	type: { pt: 'Criatura Sombria', en: 'Shadow Creature' },
	element: 'agua',
	img: require('../../img/creatures/sunburst_bio.jpeg'),
	color: 'water',
	hp: 5,
	abilities: [
		{
			name: { pt: 'Explosão Solar', en: 'Solar Burst' },
			desc: { pt: 'Libera energia acumulada causando 28 de dano.', en: 'Releases stored energy dealing 28 damage.' }
		},
		{
			name: { pt: 'Luz Drenante', en: 'Draining Light' },
			desc: { pt: 'Drena 10 de vida do inimigo à noite.', en: 'Drains 10 HP from the enemy at night.' }
		}
	],
	field: { pt: 'Pântano Luminescente', en: 'Luminescent Swamp' },
	fielddesc: {
		pt: 'Criaturas sombrias causam +1 de dano por turno enquanto Sunburst estiver em campo.',
		en: 'Shadow creatures deal +1 damage per turn while Sunburst is on the field.'
	},
	storyTitle: { pt: 'O Predador Solar', en: 'The Solar Predator' },
	story: [
		{
			pt: 'Sunburst absorve luz solar durante o dia para armazenar energia.',
			en: 'Sunburst absorbs sunlight during the day to store energy.'
		},
		{
			pt: 'À noite, usa seu brilho fosforescente para confundir e capturar presas.',
			en: 'At night, it uses its phosphorescent glow to confuse and capture prey.'
		},
		{
			pt: 'Seu brilho pode ser visto à distância, muitas vezes confundido com luzes guias.',
			en: 'Its glow can be seen from afar, often mistaken for guiding lights.'
		}
	],
	blessing: {
		pt: 'Recebe uma bênção genérica.',
		en: 'Receives a generic blessing.'
	}
};

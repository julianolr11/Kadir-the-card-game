// Card data for Lunethal
module.exports = {
	id: 'lunethal',
	title: { pt: 'O Dragão do Lago Lunar', en: 'Dragon of the Lunar Lake' },
	num: 19,
	height: 3.4,
	weakness: 'terra',
	name: { pt: 'Lunethal', en: 'Lunethal' },
	type: { pt: 'Draconídeo', en: 'Draconic' },
	element: 'agua',
	img: require('../../img/creatures/lunethal_bio.png'),
	color: 'water',
	hp: 6,
	abilities: [
		{
			name: { pt: 'Maré Crescente', en: 'Rising Tide' },
			desc: {
				pt: 'Causa 22 de dano ao inimigo e aumenta a defesa de Lunethal em 1 ponto.',
				en: 'Deals 22 damage to the enemy and increases Lunethal’s defense by 1.'
			}
		},
		{
			name: { pt: 'Sopro Lunar', en: 'Lunar Breath' },
			desc: {
				pt: 'Causa 18 de dano e tem chance de reduzir o ataque do inimigo.',
				en: 'Deals 18 damage and has a chance to reduce the enemy’s attack.'
			}
		}
	],
	field: { pt: 'Reflexo do Lago', en: 'Lake Reflection' },
	fielddesc: {
		pt: 'Criaturas de água recebem 8% a mais de defesa enquanto Lunethal estiver em campo.',
		en: 'Water creatures gain 8% more defense while Lunethal is on the field.'
	},
	storyTitle: { pt: 'Lenda de Lunethal', en: 'Legend of Lunethal' },
	story: [
		{
			pt: 'Lunethal habita lagos ancestrais iluminados pela lua, emergindo apenas quando o equilíbrio das águas é ameaçado.',
			en: 'Lunethal dwells in ancient moonlit lakes, emerging only when the balance of waters is threatened.'
		},
		{
			pt: 'Diz-se que suas escamas refletem a lua cheia, tornando-o quase invisível nas noites silenciosas.',
			en: 'It is said that its scales reflect the full moon, making it nearly invisible on silent nights.'
		}
	],
	blessing: {
		pt: 'Recebe uma bênção genérica.',
		en: 'Receives a generic blessing.'
	}
};

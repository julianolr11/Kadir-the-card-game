// Card data for Landor
module.exports = {
	id: 'landor',
	title: { pt: 'Vento do Norte', en: 'Northern Wind' },
	num: 15,
	height: 1.8,
	weakness: 'terra',
	name: { pt: 'Landor', en: 'Landor' },
	type: { pt: 'Ave', en: 'Bird' },
	element: 'ar',
	img: require('../../img/creatures/landor_bio.png'),
	color: 'air',
	hp: 4,
	abilities: [
		{
			name: { pt: 'Lâmina do Norte', en: 'Northern Blade' },
			desc: {
				pt: 'Causa 22 de dano ao inimigo com ventos cortantes.',
				en: 'Deals 22 damage to the enemy with cutting winds.'
			}
		},
		{
			name: { pt: 'Rajada Ascendente', en: 'Updraft Gust' },
			desc: {
				pt: 'Causa 14 de dano e empurra o inimigo, reduzindo sua eficácia no próximo turno.',
				en: 'Deals 14 damage and disrupts the enemy, reducing its effectiveness next turn.'
			}
		}
	],
	field: { pt: 'Correntes Boreais', en: 'Boreal Currents' },
	fielddesc: {
		pt: 'Aumenta a velocidade das criaturas de ar em 8% enquanto Landor estiver em campo.',
		en: 'Increases air creatures speed by 8% while Landor is on the field.'
	},
	storyTitle: { pt: 'O Guardião dos Ventos', en: 'Guardian of the Winds' },
	story: [
		{
			pt: 'Landor vaga pelos céus do norte, guiando correntes invisíveis com precisão ancestral.',
			en: 'Landor roams the northern skies, guiding invisible currents with ancient precision.'
		},
		{
			pt: 'Seu voo silencioso é sentido antes de ser visto, anunciando mudança e movimento.',
			en: 'Its silent flight is felt before it is seen, heralding change and motion.'
		}
	],
	blessing: {
		pt: 'Recebe uma bênção genérica.',
		en: 'Receives a generic blessing.'
	}
};

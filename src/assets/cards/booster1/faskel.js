// Card data for Faskel
module.exports = {
	id: 'faskel',
	title: { pt: 'Arauto dos Ventos Eternos', en: 'Herald of the Eternal Winds' },
	num: 18,
	height: 2.1,
	weakness: 'terra',
	name: { pt: 'Faskel', en: 'Faskel' },
	type: { pt: 'Criatura Mística', en: 'Mystic Creature' },
	element: 'ar',
	img: require('../../img/creatures/faskel_bio.png'),
	color: 'air',
	hp: 5,
	abilities: [
		{
			name: { pt: 'Galope Celeste', en: 'Celestial Gallop' },
			desc: {
				pt: 'Causa 20 de dano e aumenta a velocidade das criaturas de ar aliadas.',
				en: 'Deals 20 damage and increases the speed of allied air creatures.'
			}
		},
		{
			name: { pt: 'Asas do Zéfiro', en: 'Zephyr Wings' },
			desc: {
				pt: 'Evita o próximo ataque recebido ao se envolver em correntes de vento.',
				en: 'Evades the next incoming attack by wrapping itself in wind currents.'
			}
		}
	],
	field: { pt: 'Brisa do Alvorecer', en: 'Dawn Breeze' },
	fielddesc: {
		pt: 'Criaturas do elemento ar recebem +8% de esquiva enquanto Faskel estiver em campo.',
		en: 'Air element creatures gain +8% evasion while Faskel is on the field.'
	},
	storyTitle: { pt: 'Lenda de Faskel', en: 'Legend of Faskel' },
	story: [
		{
			pt: 'Diz-se que Faskel nasce onde o primeiro vento da manhã toca as montanhas.',
			en: 'It is said Faskel is born where the first morning wind touches the mountains.'
		},
		{
			pt: 'Seu galope ecoa como um presságio de mudança e liberdade.',
			en: 'Its gallop echoes as an omen of change and freedom.'
		}
	],
	blessing: {
		pt: 'Recebe uma bênção genérica.',
		en: 'Receives a generic blessing.'
	}
};

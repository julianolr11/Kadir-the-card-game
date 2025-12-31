// Card data for Arguilia
module.exports = {
	id: 'arguilia',
	title: { pt: 'Espírito Ancestral do Rio', en: 'Ancestral River Spirit' },
	num: 17,
	height: 2.4,
	weakness: 'terra',
	name: { pt: 'Arguilia', en: 'Arguilia' },
	type: { pt: 'Ave', en: 'Bird' },
	element: 'agua',
	img: require('../../img/creatures/arguilia_bio.webp'),
	color: 'water',
	hp: 5,
	abilities: [
		{
			name: { pt: 'Asas do Fluxo', en: 'Wings of Flow' },
			cost: 1,
			desc: {
				pt: 'Causa 20 de dano e concede esquiva aumentada neste turno.',
				en: 'Deals 20 damage and grants increased evasion this turn.'
			}
		},
		{
			name: { pt: 'Véu das Águas', en: 'Veil of Waters' },
			cost: 1,
			desc: {
				pt: 'Aliados recebem redução de dano por 1 turno.',
				en: 'Allies receive damage reduction for 1 turn.'
			}
		}
	],
	field: { pt: 'Rio Sagrado', en: 'Sacred River' },
	fielddesc: {
		pt: 'Criaturas de água recebem 7% menos dano enquanto Arguilia estiver em campo.',
		en: 'Water creatures take 7% less damage while Arguilia is on the field.'
	},
	storyTitle: { pt: 'A Voz dos Rios Eternos', en: 'The Voice of Eternal Rivers' },
	story: [
		{
			pt: 'Arguilia é um espírito antigo que nasce onde rios sagrados cruzam terras intocadas.',
			en: 'Arguilia is an ancient spirit born where sacred rivers cross untouched lands.'
		},
		{
			pt: 'Seu canto guia viajantes, purifica águas corrompidas e mantém o equilíbrio do mundo.',
			en: 'Its song guides travelers, purifies corrupted waters, and preserves the balance of the world.'
		}
	],
	blessing: {
		pt: 'Recebe uma bênção genérica.',
		en: 'Receives a generic blessing.'
	}
};

// Card data for Raptauros
module.exports = {
	id: 'raptauros',
	title: { pt: 'O Predador das Dunas', en: 'The Dune Predator' },
	num: 16,
	height: 2.6,
	weakness: 'agua',
	name: { pt: 'Raptauros', en: 'Raptauros' },
	type: { pt: 'Draconídeo', en: 'Draconid' },
	element: 'terra',
	img: require('../../img/creatures/raptauros_bio.png'),
	color: 'earth',
	hp: 5,
	abilities: [
		{
			name: { pt: 'Investida das Dunas', en: 'Dune Charge' },
			desc: {
				pt: 'Causa 24 de dano ao inimigo. Causa dano adicional se Raptauros agir primeiro.',
				en: 'Deals 24 damage. Deals bonus damage if Raptauros acts first.'
			}
		},
		{
			name: { pt: 'Ruptura do Solo', en: 'Ground Rupture' },
			desc: {
				pt: 'Causa 16 de dano e reduz a defesa do inimigo.',
				en: 'Deals 16 damage and reduces the enemy defense.'
			}
		}
	],
	field: { pt: 'Domínio das Areias', en: 'Sand Dominion' },
	fielddesc: {
		pt: 'Criaturas de terra recebem +8% de defesa enquanto Raptauros estiver em campo.',
		en: 'Earth creatures gain +8% defense while Raptauros is on the field.'
	},
	storyTitle: { pt: 'O Caçador do Deserto', en: 'The Desert Hunter' },
	story: [
		{
			pt: 'Raptauros é um draconídeo ancestral que habita mares de areia e ruínas soterradas.',
			en: 'Raptauros is an ancient draconid that inhabits seas of sand and buried ruins.'
		},
		{
			pt: 'Seu corpo blindado e suas garras afiadas fazem dele um predador implacável das dunas.',
			en: 'Its armored body and razor-sharp claws make it a relentless dune predator.'
		}
	],
	blessing: {
		pt: 'Recebe uma bênção genérica.',
		en: 'Receives a generic blessing.'
	}
};

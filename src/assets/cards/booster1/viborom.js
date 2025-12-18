// Card data for Viborom
module.exports = {
	id: 'viborom',
	num: 13,
	height: 9.3,
	weakness: 'terra',
	name: { pt: 'Viborom', en: 'Viborom' },
	type: { pt: 'Reptiloide', en: 'Reptiloid' },
	element: 'agua',
	img: require('../../img/creatures/viborom_bio.png'),
	color: 'water',
	hp: 5,
	abilities: [
		{
			name: { pt: 'Espreita Abissal', en: 'Abyssal Lurk' },
			desc: { pt: 'Causa 26 de dano ao inimigo ao emergir das águas.', en: 'Deals 26 damage to the enemy by emerging from the water.' }
		},
		{
			name: { pt: 'Veneno Líquido', en: 'Liquid Venom' },
			desc: { pt: 'Aplica veneno que causa 6 de dano por turno durante 3 turnos.', en: 'Applies poison that deals 6 damage per turn for 3 turns.' }
		}
	],
	field: { pt: 'Pântano Esquecido', en: 'Forgotten Swamp' },
	fielddesc: {
		pt: 'Inimigos têm sua velocidade reduzida em 25% enquanto Viborom estiver em campo.',
		en: 'Enemies have their speed reduced by 25% while Viborom is on the field.'
	},
	storyTitle: { pt: 'Sussurros do Pântano', en: 'Whispers of the Swamp' },
	story: [
		{ pt: 'Viborom habita pântanos ancestrais onde a água nunca está completamente parada.', en: 'Viborom dwells in ancestral swamps where the water is never completely still.' },
		{ pt: 'Criatura serpentina e silenciosa, seu veneno líquido é temido até mesmo pelos mais poderosos aventureiros.', en: 'A serpentine and silent creature, its liquid venom is feared even by the most powerful adventurers.' }
	],
	blessing: {
		pt: 'Recebe uma bênção genérica.',
		en: 'Receives a generic blessing.'
	}
};

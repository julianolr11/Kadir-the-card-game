// Card data for Virideer
module.exports = {
	id: 'virideer',
	num: 11,
	height: 2.0,
	weakness: 'fogo',
	name: { pt: 'Virideer', en: 'Virideer' },
	type: { pt: 'Mística', en: 'Mystic' },
	element: 'terra',
	img: require('../../img/creatures/virideer_bio.webp'),
	color: 'earth',
	hp: 4,
	abilities: [
		{
			name: { pt: 'Chifre Protetor', en: 'Protective Horn' },
			cost: 1,
			desc: { pt: 'Causa 22 de dano ao inimigo.', en: 'Deals 22 damage to the enemy.' }
		},
		{
			name: { pt: 'Crescimento Rápido', en: 'Rapid Growth' },
			cost: 1,
			desc: { pt: 'Recupera 8 de vida por turno.', en: 'Recovers 8 HP per turn.' }
		}
	],
	field: { pt: 'Floresta Ancestral', en: 'Ancestral Forest' },
	fielddesc: {
		pt: 'Aliados recuperam 2 de vida por turno enquanto Virideer estiver em campo.',
		en: 'Allies recover 2 HP per turn while Virideer is on the field.'
	},
	storyTitle: { pt: 'Origem de Virideer', en: 'Origin of Virideer' },
	story: [
		{
			pt: 'Virideer é uma criatura mística das florestas ancestrais, símbolo de renovação.',
			en: 'Virideer is a mystic creature of the ancestral forests, a symbol of renewal.'
		},
		{
			pt: 'Sua energia vital fortalece todo o campo.',
			en: 'Its vital energy strengthens the entire field.'
		}
	],
	blessing: {
		pt: 'Recebe uma bênção genérica.',
		en: 'Receives a generic blessing.'
	}
};

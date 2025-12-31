// Card data for Mawthorn
module.exports = {
	id: 'mawthorn',
	num: 2,
	height: 4.2,
	weakness: 'terra',
	name: { pt: 'Mawthorn', en: 'Mawthorn' },
	type: { pt: 'Monstro', en: 'Monster' },
	element: 'agua',
	img: require('../../img/creatures/mawthorn_bio.webp'),
	color: 'water',
	hp: 3,
	abilities: [
		{
			name: { pt: 'Garras Abissais', en: 'Abyssal Claws' },
			cost: 1,
			desc: { pt: 'Causa 18 de dano ao inimigo.', en: 'Deals 18 damage to the enemy.' }
		},
		{
			name: { pt: 'Regeneração', en: 'Regeneration' },
			cost: 1,
			desc: { pt: 'Recupera 10 de vida por turno.', en: 'Restores 10 HP per turn.' }
		}
	],
	field: { pt: 'Abismo Profundo', en: 'Deep Abyss' },
	fielddesc: { pt: 'Aliados recuperam 3 de vida por turno enquanto Mawthorn estiver em campo.', en: 'Allies recover 3 HP per turn while Mawthorn is on the field.' },
	storyTitle: { pt: 'Origem de Mawthorn', en: 'Origin of Mawthorn' },
	story: [
		{ pt: 'Mawthorn é um monstro das profundezas, temido por sua voracidade.', en: 'Mawthorn is a deep-sea monster feared for its voracity.' },
		{ pt: 'Sua regeneração é lendária entre as criaturas aquáticas.', en: 'Its regeneration is legendary among aquatic creatures.' }
	]
};

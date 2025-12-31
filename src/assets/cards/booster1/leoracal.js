// Card data for Leoracal
module.exports = {
	id: 'leoracal',
	num: 4,
	height: 1.5,
	weakness: 'ar',
	name: { pt: 'Leoracal', en: 'Leoracal' },
	type: { pt: 'Fera', en: 'Beast' },
	element: 'terra',
	img: require('../../img/creatures/leoracal_bio.webp'),
	color: 'earth',
	hp: 5,
	abilities: [
		{
			name: { pt: 'Rugido Sísmico', en: 'Seismic Roar' },
			cost: 1,
			desc: { pt: 'Causa 26 de dano ao inimigo.', en: 'Deals 26 damage to the enemy.' }
		},
		{
			name: { pt: 'Pele Rochosa', en: 'Rocky Hide' },
			cost: 1,
			desc: { pt: 'Reduz dano recebido em 10%.', en: 'Reduces damage taken by 10%.' }
		}
	],
	field: { pt: 'Solo Sagrado', en: 'Sacred Ground' },
	fielddesc: { pt: 'Aliados recebem 7% menos dano enquanto Leoracal estiver em campo.', en: 'Allies take 7% less damage while Leoracal is on the field.' },
	storyTitle: { pt: 'Origem de Leoracal', en: 'Origin of Leoracal' },
	story: [
		{ pt: 'Leoracal é uma fera de força incomparável, guardiã das terras ancestrais.', en: 'Leoracal is a beast of unmatched strength, guardian of ancient lands.' },
		{ pt: 'Seu rugido ecoa por todo o campo de batalha.', en: 'Its roar echoes across the battlefield.' }
	]
};

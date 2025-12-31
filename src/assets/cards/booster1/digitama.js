// Card data for Digitama
module.exports = {
	id: 'digitama',
	title: { pt: 'Fogo silencioso', en: 'Silent fire' },
	num: 10,
	height: 1.23,
	weakness: 'agua',
	name: { pt: 'Digitama', en: 'Digitama' },
	type: { pt: 'Mística', en: 'Mystic' },
	element: 'fogo',
	img: require('../../img/creatures/digitama_bio.webp'),
	color: 'fire',
	hp: 4,
	abilities: [
		{ name: { pt: 'Chama Mística', en: 'Mystic Flame' }, cost: 1, desc: { pt: 'Causa 25 de dano ao inimigo.', en: 'Deals 25 damage to the enemy.' } },
		{ name: { pt: 'Explosão Arcana', en: 'Arcane Explosion' }, cost: 1, desc: { pt: 'Causa 15 de dano em todos os inimigos.', en: 'Deals 15 damage to all enemies.' } }
	],
	field: { pt: 'Aura Flamejante', en: 'Flaming Aura' },
	fielddesc: { pt: 'Aumenta o dano de fogo em 8% enquanto Digitama estiver em campo.', en: 'Increases fire damage by 8% while Digitama is on the field.' },
	storyTitle: { pt: 'Origem de Digitama', en: 'Origin of Digitama' },
	story: [
		{ pt: 'Digitama é uma criatura mística nascida do fogo primordial, capaz de manipular chamas mágicas.', en: 'Digitama is a mystical creature born from primordial fire, able to manipulate magical flames.' },
		{ pt: 'Sua presença aquece o campo e inspira aliados com energia flamejante.', en: 'Its presence warms the field and inspires allies with fiery energy.' }
	]
};

// Card data for Ekeranth
module.exports = {
	id: 'ekeranth',
	title: { pt: 'Tirano do fogo', en: 'Fire Tyrant' },
	num: 6,
	height: 6.4,
	weakness: 'agua',
	name: { pt: 'Ekeranth', en: 'Ekeranth' },
	type: { pt: 'Draconídeo', en: 'Draconid' },
	element: 'fogo',
	img: require('../../img/creatures/ekeranth_bio.jpg'),
	color: 'fire',
	hp: 4,
	abilities: [
		{ name: { pt: 'Fúria Flamejante', en: 'Flaming Fury' }, desc: { pt: 'Causa 30 de dano ao inimigo.', en: 'Deals 30 damage to the enemy.' } },
		{ name: { pt: 'Chamas Vivas', en: 'Living Flames' }, desc: { pt: 'Causa 10 de dano extra por 2 turnos.', en: 'Deals 10 extra damage for 2 turns.' } }
	],
	field: { pt: 'Solo Vulcânico', en: 'Volcanic Soil' },
	fielddesc: { pt: 'Aumenta dano de fogo em 12% enquanto Ekeranth estiver em campo.', en: 'Increases fire damage by 12% while Ekeranth is on the field.' },
	storyTitle: { pt: 'Origem de Ekeranth', en: 'Origin of Ekeranth' },
	story: [
		{ pt: 'Ekeranth é um draconídeo forjado nas profundezas vulcânicas.', en: 'Ekeranth is a draconid forged in volcanic depths.' },
		{ pt: 'Seu poder flamejante é devastador e imprevisível.', en: 'Its flaming power is devastating and unpredictable.' }
	],
	blessing: {
		pt: 'Recebe uma bênção genérica.',
		en: 'Receives a generic blessing.'
	}
};

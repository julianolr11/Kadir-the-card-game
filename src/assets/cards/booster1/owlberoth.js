// Card data for Owlberoth
module.exports = {
	id: 'owlberoth',
	num: 9,
	height: 3.7,
	weakness: 'puro',
	name: { pt: 'Owlberoth', en: 'Owlberoth' },
	type: { pt: 'Criatura Mística', en: 'Mystic Creature' },
	element: 'puro',
	img: require('../../img/creatures/owlberoth_bio.png'),
	color: 'pure',
	hp: 4,
	abilities: [
		{
			name: { pt: 'Olhar Místico', en: 'Mystic Gaze' },
			desc: { pt: 'Causa 20 de dano ao inimigo.', en: 'Deals 20 damage to the enemy.' }
		},
		{
			name: { pt: 'Voo Noturno', en: 'Night Flight' },
			desc: { pt: 'Aliados recebem bônus de esquiva.', en: 'Allies gain an evasion bonus.' }
		}
	],
	field: { pt: 'Noite Sagrada', en: 'Sacred Night' },
	fielddesc: { pt: 'Aliados têm 8% mais chance de esquiva enquanto Owlberoth estiver em campo.', en: 'Allies have 8% increased evasion while Owlberoth is on the field.' },
	storyTitle: { pt: 'Origem de Owlberoth', en: 'Origin of Owlberoth' },
	story: [
		{ pt: 'Owlberoth é uma criatura mística, guardiã dos segredos da noite.', en: 'Owlberoth is a mystical creature, guardian of the secrets of the night.' },
		{ pt: 'Seu olhar penetra as trevas e revela verdades ocultas.', en: 'Its gaze pierces the darkness and reveals hidden truths.' }
	],
	blessing: {
		pt: 'Recebe uma bênção genérica.',
		en: 'Receives a generic blessing.'
	}
};

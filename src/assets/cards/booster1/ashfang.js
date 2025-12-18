// Card data for Ashfang
module.exports = {
	id: 'ashfang',
	title: { pt: 'Presas vulcânicas', en: 'Volcanic Fangs' },
	num: 12,
	height: 2.7,
	weakness: 'agua',
	name: { pt: 'Ashfang', en: 'Ashfang' },
	type: { pt: 'Fera', en: 'Beast' },
	element: 'fogo',
	img: require('../../img/creatures/ashfang_bio.png'),
	color: 'fire',
	hp: 4,
	abilities: [
		{
			name: { pt: 'Mordida Vulcânica', en: 'Volcanic Bite' },
			desc: { pt: 'Causa 22 de dano ao inimigo.', en: 'Deals 22 damage to the enemy.' }
		},
		{
			name: { pt: 'Fúria das Cinzas', en: 'Ashen Fury' },
			desc: { pt: 'Aumenta o ataque em 10% por 2 turnos.', en: 'Increases attack by 10% for 2 turns.' }
		}
	],
	field: { pt: 'Campos de Cinzas', en: 'Ash Fields' },
	fielddesc: {
		pt: 'Aliados de fogo recebem 6% menos dano enquanto Ashfang estiver em campo.',
		en: 'Fire allies take 6% less damage while Ashfang is on the field.'
	},
	storyTitle: { pt: 'Origem de Ashfang', en: 'Origin of Ashfang' },
	story: [
		{ pt: 'Ashfang emerge das cinzas de antigos vulcões, trazendo destruição e renascimento.', en: 'Ashfang emerges from the ashes of ancient volcanoes, bringing destruction and rebirth.' },
		{ pt: 'Sua presença aquece o campo e inspira aliados a lutar com fervor.', en: 'Its presence warms the field and inspires allies to fight with fervor.' }
	]
};

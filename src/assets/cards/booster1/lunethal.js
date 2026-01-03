// Card data for Lunethal
module.exports = {
	id: 'lunethal',
	title: { pt: 'O Dragão do Lago Lunar', en: 'Dragon of the Lunar Lake' },
	num: 19,
	height: 3.4,
	weakness: 'terra',
	name: { pt: 'Lunethal', en: 'Lunethal' },
	type: { pt: 'Draconídeo', en: 'Draconic' },
	element: 'agua',
	img: require('../../img/creatures/lunethal_bio.webp'),
	color: 'water',
	hp: 6,
	abilities: [
		{
			name: { pt: 'Maré Crescente', en: 'Rising Tide' },
			cost: 1,
			desc: {
				pt: 'Causa 22 de dano ao inimigo e aumenta a defesa de Lunethal em 1 ponto.',
				en: 'Deals 22 damage to the enemy and increases Lunethal’s defense by 1.'
			}
		},
		{
			name: { pt: 'Sopro Lunar', en: 'Lunar Breath' },
			cost: 1,
			desc: {
				pt: 'Causa 18 de dano e tem chance de reduzir o ataque do inimigo.',
				en: 'Deals 18 damage and has a chance to reduce the enemy’s attack.'
			}
		}
	],
	field: { pt: 'Reflexo do Lago', en: 'Lake Reflection' },
	fielddesc: {
		pt: 'Criaturas de água recebem 8% a mais de defesa enquanto Lunethal estiver em campo.',
		en: 'Water creatures gain 8% more defense while Lunethal is on the field.'
	},
	storyTitle: { pt: 'Lenda de Lunethal', en: 'Legend of Lunethal' },
	story: [
		{
			pt: 'Lunethal habita lagos ancestrais iluminados pela lua, emergindo apenas quando o equilíbrio das águas é ameaçado.',
			en: 'Lunethal dwells in ancient moonlit lakes, emerging only when the balance of waters is threatened.'
		},
		{
			pt: 'Diz-se que suas escamas refletem a lua cheia, tornando-o quase invisível nas noites silenciosas.',
			en: 'It is said that its scales reflect the full moon, making it nearly invisible on silent nights.'
		}
	],

	// ===== DADOS ESTENDIDOS (Guardião) =====
	isGuardian: true,
	defaultSkills: [
		{
			id: 'lunethal_skill_1',
			name: { pt: 'Raio Lunar', en: 'Lunar Ray' },
			desc: { pt: 'Causa 20 de dano com poder celestial.', en: 'Deals 20 damage with celestial power.' },
			cost: 1,
			type: 'damage',
		},
		{
			id: 'lunethal_skill_2',
			name: { pt: 'Cura Noturna', en: 'Night Heal' },
			desc: { pt: 'Causa 12 de dano e recupera 8 de vida.', en: 'Deals 12 damage and recovers 8 HP.' },
			cost: 1,
			type: 'damage_heal',
		},
	],
	defaultBlessing: {
		id: 'lunethal_blessing',
		name: { pt: 'Bênção da Lua', en: 'Moon\'s Blessing' },
		desc: { pt: 'Criaturas sagradas ganham +7% de velocidade enquanto Lunethal estiver em campo.', en: 'Holy creatures gain +7% speed while Lunethal is on the field.' },
	},
	unlockTable: [
		{ level: 0, type: 'none' },
		{ level: 1, type: 'skill', id: 'lunethal_skill_3', name: { pt: 'Pulso Celestial', en: 'Celestial Pulse' }, desc: { pt: 'Causa 18 de dano e cura 6 de vida.', en: 'Deals 18 damage and heals 6 HP.' }, cost: 1 },
		{ level: 2, type: 'perk', id: 'HP_PLUS_1' },
		{ level: 3, type: 'none' },
		{ level: 4, type: 'skill', id: 'lunethal_skill_4', name: { pt: 'Manto Protetor', en: 'Protective Mantle' }, desc: { pt: 'Aumenta defesa e cura 12 de vida.', en: 'Increases defense and heals 12 HP.' }, cost: 2 },
		{ level: 5, type: 'skill', id: 'lunethal_skill_5', name: { pt: 'Graça Divina', en: 'Divine Grace' }, desc: { pt: 'Causa 30 de dano e cura todos os aliados.', en: 'Deals 30 damage and heals all allies.' }, cost: 2 },
		{ level: 6, type: 'none' },
		{ level: 7, type: 'perk', id: 'GUARDIAN_KILL_XP_BONUS' },
		{ level: 8, type: 'perk', id: 'HP_PLUS_2' },
		{ level: 9, type: 'skill', id: 'lunethal_skill_6', name: { pt: 'Ressurreição Lunar', en: 'Lunar Resurrection' }, desc: { pt: 'Cura 35 de vida em todos os aliados.', en: 'Heals 35 HP to all allies.' }, cost: 2 },
		{ level: 10, type: 'skill', id: 'lunethal_skill_7', name: { pt: 'Era da Luz Eterna', en: 'Eternal Light Era' }, desc: { pt: 'Supremo: 40 de dano e cura 20 de vida para todos os aliados.', en: 'Ultimate: 40 damage and heals 20 HP to all allies.' }, cost: 3 },
	],
};

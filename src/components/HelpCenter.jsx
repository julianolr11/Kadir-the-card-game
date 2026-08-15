import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import '../styles/help-center.css';

import boosterImage from '../assets/img/card/booster.png';
import coinIcon from '../assets/img/icons/head.png';
import heartIcon from '../assets/img/icons/hearticon.png';
import essenceIcon from '../assets/img/icons/soul-essence.png';
import burnIcon from '../assets/img/icons/burn.png';
import bleedIcon from '../assets/img/icons/bleed.png';
import freezeIcon from '../assets/img/icons/freeze.png';
import poisonIcon from '../assets/img/icons/poison.png';
import sleepIcon from '../assets/img/icons/sleep.png';
import paralyzeIcon from '../assets/img/icons/paralyze.png';
import shieldIcon from '../assets/img/icons/shield.png';
import cardNormalScreenshot from '../assets/img/help/card-normal.png';
import cardHoloScreenshot from '../assets/img/help/card-holo.png';
import cardFullArtScreenshot from '../assets/img/help/card-fullart.png';
import shopRunningScreenshot from '../assets/img/help/shop-running.png';
import menuRunningScreenshot from '../assets/img/help/menu-running.png';
import battleRunningScreenshot from '../assets/img/help/battle-running.png';
import bestiaryRunningScreenshot from '../assets/img/help/bestiary-running.png';
import deckBuilderRunningScreenshot from '../assets/img/help/deck-builder-running.png';
import deckEditorRunningScreenshot from '../assets/img/help/deck-editor-running.png';
import vulcanusField from '../assets/img/scene-board/vulcanus_resultado.webp';
import oceanField from '../assets/img/scene-board/ocean_resultado.webp';
import desertField from '../assets/img/scene-board/desert_resultado.webp';

const CATEGORIES = [
  ['inicio', { pt: 'Primeiros passos', en: 'Getting started' }, '✦'],
  ['navegacao', { pt: 'Navegação', en: 'Navigation' }, '⌘'],
  ['cartas', { pt: 'Cartas e deck', en: 'Cards and deck' }, '◈'],
  ['batalha', { pt: 'Batalha', en: 'Battle' }, '⚔'],
  ['progressao', { pt: 'Progressão', en: 'Progression' }, '↑'],
  ['colecao', { pt: 'Coleção', en: 'Collection' }, '▤'],
];

const GUIDES = [
  {
    id: 'primeira-partida',
    category: 'inicio',
    title: { pt: 'Comece sua primeira partida', en: 'Start your first match' },
    summary: { pt: 'Do menu principal até o primeiro turno.', en: 'From the main menu to your first turn.' },
    keywords: 'começar inicio jogar partida campanha batalha deck controles básico start begin play match campaign battle deck controls basic',
    image: menuRunningScreenshot,
    callout: { pt: 'Menu principal', en: 'Main menu' },
    steps: {
      pt: ['Abra Deck e monte uma formação válida.', 'Clique em Batalhar e escolha Campanha.', 'Selecione seu deck e confirme o confronto.'],
      en: ['Open Deck and build a valid lineup.', 'Click Battle and choose Campaign.', 'Select your deck and confirm the match.'],
    },
    more: {
      pt: ['Um deck precisa de um Guardião e das cartas necessárias para preencher a formação.', 'Na Campanha, cada torre possui uma sequência de adversários e registra seu progresso.', 'Ao entrar na batalha, observe sua mão, o monte de compra, os corações e a essência disponível.'],
      en: ['A deck needs a Guardian and enough cards to fill the lineup.', 'In Campaign, each tower has a sequence of opponents and tracks your progress.', 'When you enter battle, keep an eye on your hand, the draw pile, your hearts and available essence.'],
    },
    tip: { pt: 'Antes da primeira partida, abra cada carta do deck e leia o custo das habilidades.', en: 'Before your first match, open every card in the deck and read each ability\'s cost.' },
  },
  {
    id: 'menu',
    category: 'navegacao',
    title: { pt: 'Navegue pelo menu', en: 'Navigate the menu' },
    summary: { pt: 'Onde encontrar cada área do jogo.', en: 'Where to find every area of the game.' },
    keywords: 'menu navegação shop loja bestiário conquistas deck engrenagem configurações booster navigation store bestiary achievements settings gear',
    image: menuRunningScreenshot,
    callout: { pt: 'Mapa do menu', en: 'Menu map' },
    steps: {
      pt: ['Esquerda: Shop. Direita: Bestiário.', 'Centro: Deck e Batalhar. Acima: Conquistas.', 'A engrenagem abre configurações, ajuda e saída.'],
      en: ['Left: Shop. Right: Bestiary.', 'Center: Deck and Battle. Above: Achievements.', 'The gear icon opens settings, help and exit.'],
    },
    more: {
      pt: ['Shop compra boosters e cartas garantidas usando moedas.', 'Bestiário reúne criaturas, campos e efeitos conhecidos.', 'Conquistas mostra o avanço nas Torres dos Guardiões.', 'Booster Zone abre os pacotes disponíveis no canto do menu.'],
      en: ['Shop buys boosters and guaranteed cards using coins.', 'Bestiary gathers known creatures, fields and effects.', 'Achievements shows your progress through the Guardian Towers.', 'Booster Zone opens the packs available in the corner of the menu.'],
    },
    tip: { pt: 'Use a busca desta ajuda se esquecer onde uma função está localizada.', en: 'Use this help center\'s search if you forget where a feature is located.' },
  },
  {
    id: 'editar-cartas',
    category: 'cartas',
    title: { pt: 'Use a tela de edição', en: 'Use the editing screen' },
    summary: { pt: 'Inspecione a carta e controle sua posição no deck.', en: 'Inspect a card and control its place in the deck.' },
    keywords: 'editar carta deck arrastar remover adicionar guardião habilidade formação edit card drag remove add guardian ability lineup',
    image: deckEditorRunningScreenshot,
    callout: { pt: 'Edição em execução', en: 'Editing in progress' },
    type: 'card',
    steps: {
      pt: ['Abra Deck no centro do menu.', 'Selecione uma carta para ver atributos e habilidades.', 'Adicione ou remova cartas e salve antes de batalhar.'],
      en: ['Open Deck in the center of the menu.', 'Select a card to see its stats and abilities.', 'Add or remove cards and save before battling.'],
    },
    more: {
      pt: ['O Guardião define a identidade principal da formação e possui habilidades próprias.', 'Confira vida, elemento, tipo, fraqueza e custos de essência antes de incluir uma criatura.', 'Cartas de campo mudam o cenário e concedem afinidade; cartas de efeito produzem ações imediatas.', 'As alterações só ficam disponíveis para seleção de batalha depois de salvar.'],
      en: ['The Guardian defines the lineup\'s main identity and has its own abilities.', 'Check HP, element, type, weakness and essence costs before adding a creature.', 'Field cards change the scenery and grant affinity; effect cards produce immediate actions.', 'Changes only become available for battle selection after you save.'],
    },
    tip: { pt: 'Equilibre criaturas, campos e efeitos; um deck composto apenas por criaturas perde flexibilidade.', en: 'Balance creatures, fields and effects; a deck made only of creatures loses flexibility.' },
  },
  {
    id: 'deck-builder',
    category: 'cartas',
    title: { pt: 'Conheça o Deck Builder', en: 'Get to know the Deck Builder' },
    summary: { pt: 'Crie, organize, edite e exclua suas formações.', en: 'Create, organize, edit and delete your lineups.' },
    keywords: 'deck builder meus decks criar editar apagar reciclar arsenal slots formação salvar my decks create edit delete recycle save',
    image: deckBuilderRunningScreenshot,
    callout: { pt: 'Deck Builder em execução', en: 'Deck Builder in progress' },
    steps: {
      pt: ['Abra Deck no centro do menu.', 'Escolha um espaço vazio ou clique em Editar deck.', 'Dê um nome à formação, escolha o Guardião e preencha os slots.', 'Salve para disponibilizar o deck nas batalhas.'],
      en: ['Open Deck in the center of the menu.', 'Choose an empty slot or click Edit deck.', 'Name the lineup, choose the Guardian and fill the slots.', 'Save to make the deck available in battles.'],
    },
    more: {
      pt: ['É possível manter até 4 decks diferentes.', 'Cada cartão da lista mostra nome, Guardião, quantidade de cartas e estado da formação.', 'Reciclar converte cópias que não estão protegidas por decks em moedas.', 'Apagar remove a formação salva, mas não destrói as cartas da coleção.'],
      en: ['You can keep up to 4 different decks.', 'Each entry in the list shows the name, Guardian, card count and lineup status.', 'Recycling converts copies not protected by any deck into coins.', 'Deleting removes the saved lineup, but doesn\'t destroy the cards in your collection.'],
    },
    tip: { pt: 'Mantenha decks com propostas diferentes para alternar rapidamente entre torres e afinidades.', en: 'Keep decks with different purposes so you can quickly switch between towers and affinities.' },
  },
  {
    id: 'limites-deck',
    category: 'cartas',
    title: { pt: 'Limites e regras do deck', en: 'Deck limits and rules' },
    summary: { pt: 'Entenda quantas cartas e formações você pode utilizar.', en: 'Understand how many cards and lineups you can use.' },
    keywords: 'limite máximo numero quantidade cartas deck 20 quatro 4 guardião cópias slots completo limit maximum number amount guardian copies complete',
    image: deckEditorRunningScreenshot,
    callout: { pt: 'Contador e slots do deck', en: 'Deck counter and slots' },
    steps: {
      pt: ['Cada deck precisa ter exatamente 20 cartas.', 'Cada formação deve possuir 1 Guardião definido.', 'Você pode salvar no máximo 4 decks.', 'O contador do editor mostra quantos dos 20 espaços foram preenchidos.'],
      en: ['Each deck needs exactly 20 cards.', 'Each lineup must have exactly 1 Guardian set.', 'You can save up to 4 decks.', 'The editor\'s counter shows how many of the 20 slots are filled.'],
    },
    more: {
      pt: ['Um deck incompleto não pode ser finalizado para batalha.', 'Cada cópia é uma instância real da coleção; uma cópia já usada fica identificada pelo editor.', 'O Guardião é configurado separadamente, mas pertence à identidade daquele deck.', 'Use criaturas, cartas de campo e cartas de efeito para preencher a formação conforme sua estratégia.'],
      en: ['An incomplete deck can\'t be finalized for battle.', 'Each copy is a real instance from your collection; an already-used copy is flagged by the editor.', 'The Guardian is configured separately, but belongs to that deck\'s identity.', 'Use creatures, field cards and effect cards to fill the lineup according to your strategy.'],
    },
    tip: { pt: 'Observe o contador antes de fechar: 20/20 confirma a quantidade, mas você ainda deve revisar o Guardião.', en: 'Check the counter before closing: 20/20 confirms the count, but you should still review the Guardian.' },
  },
  {
    id: 'nivel-perks',
    category: 'cartas',
    title: { pt: 'Níveis, habilidades e perks', en: 'Levels, abilities and perks' },
    summary: { pt: 'Evolua até o nível 10 e amplie as opções do Guardião.', en: 'Level up to 10 and expand your Guardian\'s options.' },
    keywords: 'nivel nível xp experiência perk perks habilidade desbloquear progressão level máximo 10 loadout level experience ability unlock',
    image: deckBuilderRunningScreenshot,
    callout: { pt: 'Progressão do Guardião', en: 'Guardian progression' },
    steps: {
      pt: ['Ganhe XP participando de batalhas.', 'A barra mostra o progresso até o próximo nível.', 'Novas habilidades e perks são liberados nos níveis indicados.', 'No nível 10, a progressão de nível está completa.'],
      en: ['Earn XP by taking part in battles.', 'The bar shows progress toward the next level.', 'New abilities and perks unlock at the indicated levels.', 'At level 10, level progression is complete.'],
    },
    more: {
      pt: ['Cada Guardião possui uma tabela própria de desbloqueios; alguns níveis liberam habilidade, outros perk e alguns não liberam item.', 'Habilidades têm custo de essência e entram nas opções de ataque do Guardião.', 'Perks são bônus passivos, como vida adicional, crítico ou modificadores defensivos.', 'Desbloquear não equipa automaticamente: escolha seu loadout depois.'],
      en: ['Each Guardian has its own unlock table; some levels grant an ability, others a perk, and some grant nothing.', 'Abilities have an essence cost and become part of the Guardian\'s attack options.', 'Perks are passive bonuses, like extra HP, critical hits or defensive modifiers.', 'Unlocking doesn\'t auto-equip: choose your loadout afterward.'],
    },
    tip: { pt: 'Planeje o próximo desbloqueio antes de escolher quais cartas receberão XP ao fim da batalha.', en: 'Plan your next unlock before choosing which cards get XP at the end of a battle.' },
  },
  {
    id: 'normal-vs-guardiao',
    category: 'cartas',
    title: { pt: 'Carta comum x carta Guardião', en: 'Regular card vs. Guardian card' },
    summary: { pt: 'As duas usam a mesma base, mas cumprem funções diferentes.', en: 'Both share the same base, but serve different roles.' },
    keywords: 'diferença carta normal comum guardião guardian criatura benção loadout habilidade perk difference regular blessing',
    image: cardNormalScreenshot,
    callout: { pt: 'Estrutura de uma carta', en: 'Structure of a card' },
    type: 'comparison',
    steps: {
      pt: ['Cartas de criatura normais formam o corpo do deck e são invocadas durante a batalha.', 'O Guardião representa a identidade principal da formação.', 'Guardião possui bênção própria, progressão e loadout configurável.', 'Apenas uma carta pode ser definida como Guardião em cada deck.'],
      en: ['Regular creature cards make up the body of the deck and are summoned during battle.', 'The Guardian represents the lineup\'s main identity.', 'The Guardian has its own blessing, progression and configurable loadout.', 'Only one card can be set as Guardian in each deck.'],
    },
    more: {
      pt: ['Vida, elemento, tipo, fraqueza e habilidades continuam importantes nos dois casos.', 'Criaturas normais utilizam as habilidades apresentadas em sua carta.', 'O Guardião pode desbloquear opções adicionais por nível e escolher quais manter equipadas.', 'A bênção do Guardião aparece destacada na carta e oferece uma característica exclusiva.'],
      en: ['HP, element, type, weakness and abilities still matter in both cases.', 'Regular creatures use the abilities shown on their card.', 'The Guardian can unlock additional options per level and choose which ones to keep equipped.', 'The Guardian\'s blessing is highlighted on the card and grants a unique trait.'],
    },
    tip: { pt: 'Escolha o Guardião pela sinergia da bênção e dos perks com o restante do deck, não apenas pela vida.', en: 'Pick your Guardian for how its blessing and perks synergize with the rest of the deck, not just its HP.' },
  },
  {
    id: 'guia-guardiao',
    category: 'cartas',
    title: { pt: 'Guia exclusivo do Guardião', en: 'Guardian-only guide' },
    summary: { pt: 'Seleção, progressão, bênção e configuração de loadout.', en: 'Selection, progression, blessing and loadout setup.' },
    keywords: 'guardião guardian guia exclusivo selecionar trocar configurar loadout benção bênção habilidades perks xp select swap configure',
    image: cardFullArtScreenshot,
    callout: { pt: 'Carta de Guardião', en: 'Guardian card' },
    type: 'card',
    steps: {
      pt: ['Escolha o Guardião ao criar ou editar o deck.', 'Confira sua bênção e a trilha de níveis.', 'Equipe até 2 habilidades disponíveis.', 'Escolha 1 perk desbloqueado e salve o loadout.'],
      en: ['Choose the Guardian when creating or editing the deck.', 'Check its blessing and the level track.', 'Equip up to 2 available abilities.', 'Choose 1 unlocked perk and save the loadout.'],
    },
    more: {
      pt: ['Habilidades padrão estão disponíveis desde o início; opções extras surgem conforme a tabela daquele Guardião.', 'O perk selecionado pode alterar vida, defesa, crítico ou ganhos de experiência, dependendo do personagem.', 'O loadout salvo acompanha o Guardião e é usado para montar sua versão em batalha.', 'Trocar o Guardião muda a identidade e pode exigir uma nova combinação de cartas e campos.'],
      en: ['Default abilities are available from the start; extra options appear according to that Guardian\'s table.', 'The chosen perk can change HP, defense, critical hits or XP gains, depending on the character.', 'The saved loadout stays with the Guardian and is used to build its battle version.', 'Swapping the Guardian changes the identity and may call for a new combination of cards and fields.'],
    },
    tip: { pt: 'Revise o loadout sempre que subir de nível: um desbloqueio novo pode ser melhor que a opção equipada.', en: 'Review the loadout every time you level up: a new unlock might be better than the equipped option.' },
  },
  {
    id: 'turno',
    category: 'batalha',
    title: { pt: 'Entenda seu turno', en: 'Understand your turn' },
    summary: { pt: 'Comprar, invocar, atacar e encerrar.', en: 'Draw, summon, attack and end.' },
    keywords: 'turno comprar invocar atacar habilidade essência coração fim do turno campo mão turn draw summon attack ability essence heart end',
    image: battleRunningScreenshot,
    callout: { pt: 'Tabuleiro de batalha', en: 'Battle board' },
    steps: {
      pt: ['Compre uma carta no monte.', 'Use essência para invocar ou ativar habilidades.', 'Derrote criaturas: cada eliminação quebra um coração rival.', 'Clique em Fim do turno quando concluir suas ações.'],
      en: ['Draw a card from the deck.', 'Spend essence to summon or activate abilities.', 'Defeat creatures: each kill breaks an opposing heart.', 'Click End Turn once you\'re done with your actions.'],
    },
    more: {
      pt: ['A compra é obrigatória quando o monte possui cartas e sua mão ainda tem espaço.', 'Clique em uma criatura da mão e escolha um espaço livre para invocá-la.', 'Clique em uma criatura no campo para consultar e usar habilidades; cada habilidade informa seu custo.', 'Depois de atacar, a criatura não pode repetir a mesma ação naquele turno.', 'A batalha termina quando o último coração de um dos lados é destruído.'],
      en: ['Drawing is mandatory when the deck has cards and your hand still has room.', 'Click a creature in your hand and choose a free slot to summon it.', 'Click a creature on the field to check and use abilities; each ability shows its cost.', 'After attacking, a creature can\'t repeat the same action that turn.', 'The battle ends when one side\'s last heart is destroyed.'],
    },
    tip: { pt: 'Gaste essência somente depois de verificar todas as criaturas que podem agir.', en: 'Only spend essence after checking every creature that can still act.' },
  },
  {
    id: 'status',
    category: 'batalha',
    title: { pt: 'Buffs e debuffs', en: 'Buffs and debuffs' },
    summary: { pt: 'Reconheça rapidamente todos os efeitos de batalha.', en: 'Quickly recognize every battle effect.' },
    keywords: 'buff debuff status queimar sangramento congelar veneno sono paralisia escudo burn bleed freeze poison sleep paralyze shield',
    image: battleRunningScreenshot,
    callout: { pt: 'Efeitos de status', en: 'Status effects' },
    type: 'status',
    steps: {
      pt: ['Ícones aparecem sobre a criatura afetada.', 'Passe o cursor ou abra a carta para conferir duração e efeito.', 'Planeje o turno antes que efeitos contínuos causem dano.'],
      en: ['Icons appear over the affected creature.', 'Hover or open the card to check duration and effect.', 'Plan your turn before ongoing effects deal damage.'],
    },
    more: {
      pt: ['Queimadura, veneno e sangramento causam pressão ao longo dos turnos.', 'Congelamento, sono e paralisia restringem ações ou habilidades.', 'Escudo é um buff defensivo e absorve dano antes da vida da criatura.', 'A duração restante é atualizada a cada turno; abrir a carta mostra os efeitos ativos com clareza.'],
      en: ['Burn, poison and bleed apply pressure over several turns.', 'Freeze, sleep and paralyze restrict actions or abilities.', 'Shield is a defensive buff and absorbs damage before the creature\'s HP.', 'Remaining duration updates every turn; opening the card clearly shows active effects.'],
    },
    tip: { pt: 'Priorize remover controles como sono e congelamento de criaturas essenciais à sua estratégia.', en: 'Prioritize removing control effects like sleep and freeze from creatures essential to your strategy.' },
  },
  {
    id: 'recursos',
    category: 'batalha',
    title: { pt: 'Vida, essência e campo', en: 'Hearts, essence and field' },
    summary: { pt: 'Os três recursos que decidem uma batalha.', en: 'The three resources that decide a battle.' },
    keywords: 'vida coração essência campo recurso custo perder vitória derrota heart essence field resource cost lose victory defeat',
    image: battleRunningScreenshot,
    callout: { pt: 'Recursos da partida', en: 'Match resources' },
    type: 'resources',
    steps: {
      pt: ['Corações são suas vidas: proteja o último.', 'Essência paga habilidades e invocações.', 'Cartas de campo alteram as regras para ambos os lados.'],
      en: ['Hearts are your lives: protect the last one.', 'Essence pays for abilities and summons.', 'Field cards change the rules for both sides.'],
    },
    more: {
      pt: ['Os corações pertencem ao jogador, não a uma criatura específica.', 'Uma criatura derrotada vai ao cemitério e remove um coração do seu controlador.', 'Essência é mostrada junto ao ícone de cristal e deve cobrir integralmente o custo da ação.', 'O campo é compartilhado: você pode ativá-lo, mas o adversário também pode aproveitar sua afinidade.'],
      en: ['Hearts belong to the player, not to a specific creature.', 'A defeated creature goes to the graveyard and removes a heart from its controller.', 'Essence is shown next to the crystal icon and must fully cover the action\'s cost.', 'The field is shared: you can activate it, but your opponent can also benefit from its affinity.'],
    },
    tip: { pt: 'Quando estiver no último coração, preserve ao menos uma criatura capaz de defender o campo.', en: 'When you\'re down to your last heart, keep at least one creature able to defend the field.' },
  },
  {
    id: 'terrenos-campo',
    category: 'batalha',
    title: { pt: 'Terrenos e vantagem de campo', en: 'Terrains and field advantage' },
    summary: { pt: 'Combine elemento e tipo para fortalecer suas criaturas.', en: 'Match element and type to strengthen your creatures.' },
    keywords: 'terreno campo afinidade vantagem buff bônus dano hp vida elemento tipo vulcanus oceano deserto fogo água terra monstro mística reptiloide terrain field affinity advantage bonus damage fire water earth',
    image: battleRunningScreenshot,
    callout: { pt: 'Campo compartilhado', en: 'Shared field' },
    type: 'field',
    steps: {
      pt: [
        'Jogue uma carta de campo da sua mão; o cenário muda e o terreno passa a valer para os dois jogadores.',
        'Se a criatura combinar com o elemento OU com o tipo do campo, recebe +1 Dano e +1 HP.',
        'Se combinar com o elemento E com o tipo, recebe +2 Dano e +2 HP.',
        'Ao jogar outro campo, o anterior é substituído e enviado ao cemitério de campos.',
      ],
      en: [
        'Play a field card from your hand; the scenery changes and the terrain applies to both players.',
        'If a creature matches the field\'s element OR type, it gets +1 Damage and +1 HP.',
        'If it matches both the element AND the type, it gets +2 Damage and +2 HP.',
        'Playing another field replaces the previous one, sending it to the field graveyard.',
      ],
    },
    more: {
      pt: ['Vulcanus favorece Fogo ou Monstro; criaturas que são Fogo e Monstro recebem o bônus máximo.', 'Oceano favorece Água ou Criatura Mística.', 'Deserto favorece Terra ou Reptiloide.', 'A animação de energia sobre a criatura indica que ela possui afinidade com o novo terreno.', 'Leia elemento e tipo no rodapé da carta para prever a vantagem antes de jogar o campo.'],
      en: ['Vulcanus favors Fire or Monster; creatures that are both Fire and Monster get the maximum bonus.', 'Ocean favors Water or Mystic Creature.', 'Desert favors Earth or Reptile.', 'The energy animation over a creature shows it has affinity with the new terrain.', 'Read the element and type at the bottom of the card to predict the advantage before playing the field.'],
    },
    tip: { pt: 'Não ative um terreno apenas por combinar com uma criatura sua; conte também quantas cartas inimigas serão fortalecidas.', en: 'Don\'t activate a terrain just because it matches one of your creatures; also count how many enemy cards will be strengthened.' },
  },
  {
    id: 'upgrade',
    category: 'progressao',
    title: { pt: 'Normal → Holo → Full Art', en: 'Normal → Holo → Full Art' },
    summary: { pt: 'Evolua a apresentação das suas cartas.', en: 'Upgrade how your cards look.' },
    keywords: 'upgrade melhorar evolução normal holo holográfica full art carta nível xp cópias upgrade improve evolve holographic copies',
    image: cardFullArtScreenshot,
    callout: { pt: 'Caminho de aprimoramento', en: 'Upgrade path' },
    type: 'upgrade',
    steps: {
      pt: ['Abra a carta na coleção e entre na edição.', 'Cumpra os requisitos exibidos para torná-la Holo.', 'Depois da versão Holo, complete o próximo requisito para liberar Full Art.'],
      en: ['Open the card in your collection and enter editing.', 'Meet the displayed requirements to make it Holo.', 'After the Holo version, complete the next requirement to unlock Full Art.'],
    },
    more: {
      pt: ['Normal é a apresentação inicial, com moldura e arte tradicionais.', 'Holo adiciona acabamento holográfico mantendo todas as informações da carta.', 'Full Art amplia a ilustração e reorganiza habilidades e atributos em uma moldura especial.', 'O aprimoramento pertence àquela instância da carta; outras cópias continuam com seu próprio progresso.'],
      en: ['Normal is the starting look, with a traditional frame and art.', 'Holo adds a holographic finish while keeping all the card\'s information.', 'Full Art expands the illustration and reorganizes abilities and stats into a special frame.', 'The upgrade belongs to that specific card instance; other copies keep their own progress.'],
    },
    tip: { pt: 'Confira qual cópia está selecionada antes de investir recursos em um aprimoramento.', en: 'Check which copy is selected before investing resources into an upgrade.' },
  },
  {
    id: 'shop',
    category: 'colecao',
    title: { pt: 'Use o Shop', en: 'Use the Shop' },
    summary: { pt: 'Compre boosters ou garanta uma raridade.', en: 'Buy boosters or lock in a rarity.' },
    keywords: 'shop loja comprar moedas booster pack raro épico lendário oferta preço store buy coins rare epic legendary offer price',
    image: shopRunningScreenshot,
    callout: { pt: 'Vitrine da loja', en: 'Store showcase' },
    type: 'shop',
    steps: {
      pt: ['Escolha uma oferta no catálogo.', 'Confira conteúdo e preço no painel selecionado.', 'Clique em Comprar agora; a entrega entra imediatamente na coleção.'],
      en: ['Choose an offer from the catalog.', 'Check the contents and price on the selected panel.', 'Click Buy now; the delivery is added to your collection immediately.'],
    },
    more: {
      pt: ['Boosters entregam várias cartas aleatórias e podem ampliar a coleção com melhor custo por carta.', 'Packs de 5 e 10 boosters possuem desconto indicado no catálogo.', 'Cartas garantidas removem a incerteza da raridade, mas a criatura recebida continua aleatória.', 'O botão fica indisponível quando o saldo não cobre o preço.'],
      en: ['Boosters deliver several random cards and can grow your collection at a better cost per card.', 'Packs of 5 and 10 boosters have a discount shown in the catalog.', 'Guaranteed cards remove the uncertainty of rarity, but the creature you get is still random.', 'The button becomes unavailable when your balance doesn\'t cover the price.'],
    },
    tip: { pt: 'Use boosters para aumentar a variedade e cartas garantidas quando estiver buscando uma raridade específica.', en: 'Use boosters to increase variety, and guaranteed cards when you\'re after a specific rarity.' },
  },
  {
    id: 'bestiario',
    category: 'colecao',
    title: { pt: 'Consulte o Bestiário', en: 'Check the Bestiary' },
    summary: { pt: 'Conheça criaturas, elementos e histórias.', en: 'Learn about creatures, elements and lore.' },
    keywords: 'bestiário criatura coleção elemento fraqueza história lore encontrar pesquisar bestiary creature collection element weakness search',
    image: bestiaryRunningScreenshot,
    callout: { pt: 'Arquivo de criaturas', en: 'Creature archive' },
    steps: {
      pt: ['Abra o Bestiário no lado direito do menu.', 'Use os filtros para reduzir a lista.', 'Selecione uma criatura para ver afinidade, dados e história.'],
      en: ['Open the Bestiary on the right side of the menu.', 'Use the filters to narrow down the list.', 'Select a creature to see its affinity, stats and lore.'],
    },
    more: {
      pt: ['Criaturas ainda não descobertas aparecem bloqueadas.', 'A seção de criaturas reúne elemento, tipo, atributos e informações narrativas.', 'Cartas de campo mostram cenário, elemento e tipo favorecidos.', 'Cartas de efeito explicam o resultado produzido quando são utilizadas.'],
      en: ['Creatures you haven\'t discovered yet appear locked.', 'The creature section gathers element, type, stats and lore information.', 'Field cards show the scenery, element and type they favor.', 'Effect cards explain the outcome produced when they\'re used.'],
    },
    tip: { pt: 'Consulte o Bestiário antes de uma torre para reconhecer tipos e possíveis afinidades de terreno.', en: 'Check the Bestiary before a tower to recognize types and possible terrain affinities.' },
  },
];

const STATUS_ITEMS = [
  [burnIcon, { pt: 'Queimadura', en: 'Burn' }, { pt: 'Dano contínuo', en: 'Ongoing damage' }],
  [bleedIcon, { pt: 'Sangramento', en: 'Bleed' }, { pt: 'Dano recorrente', en: 'Recurring damage' }],
  [freezeIcon, { pt: 'Congelamento', en: 'Freeze' }, { pt: 'Impede ações', en: 'Blocks actions' }],
  [poisonIcon, { pt: 'Veneno', en: 'Poison' }, { pt: 'Dano por turno', en: 'Damage per turn' }],
  [sleepIcon, { pt: 'Sono', en: 'Sleep' }, { pt: 'Bloqueia a criatura', en: 'Locks the creature' }],
  [paralyzeIcon, { pt: 'Paralisia', en: 'Paralyze' }, { pt: 'Impede habilidades', en: 'Blocks abilities' }],
  [shieldIcon, { pt: 'Escudo', en: 'Shield' }, { pt: 'Absorve dano', en: 'Absorbs damage' }],
];

function GuideVisual({ guide, isEn }) {
  const key = isEn ? 'en' : 'pt';
  return (
    <figure className={`help-guide-visual help-guide-visual-${guide.type || 'default'}`}>
      <img src={guide.image} alt={isEn ? `Visual example: ${guide.title.en}` : `Exemplo visual: ${guide.title.pt}`} />
      <figcaption><span>{isEn ? 'In-game example' : 'Exemplo no jogo'}</span>{guide.callout[key]}</figcaption>
      {guide.type === 'status' && (
        <div className="help-status-grid">
          {STATUS_ITEMS.map(([icon, label, text]) => (
            <div key={label.pt}><img src={icon} alt="" /><span><strong>{label[key]}</strong><small>{text[key]}</small></span></div>
          ))}
        </div>
      )}
      {guide.type === 'resources' && (
        <div className="help-resource-row">
          <span><img src={heartIcon} alt="" /><b>3</b><small>{isEn ? 'Hearts' : 'Vidas'}</small></span>
          <span><img src={essenceIcon} alt="" /><b>4</b><small>{isEn ? 'Essence' : 'Essência'}</small></span>
          <span><b>✦</b><small>{isEn ? 'Active field' : 'Campo ativo'}</small></span>
        </div>
      )}
      {guide.type === 'upgrade' && (
        <div className="help-upgrade-track">
          {[
            ['Normal', cardNormalScreenshot],
            ['Holo', cardHoloScreenshot],
            ['Full Art', cardFullArtScreenshot],
          ].map(([label, screenshot], index) => (
            <React.Fragment key={label}>
              <span className={`help-upgrade-card help-upgrade-card-${index}`}>
                <img src={screenshot} alt={isEn ? `Real screenshot of the Agolir card, ${label} version` : `Captura real da carta Agolir em versão ${label}`} />
                <b>{label}</b>
              </span>
              {index < 2 && <i>→</i>}
            </React.Fragment>
          ))}
        </div>
      )}
      {guide.type === 'shop' && (
        <div className="help-shop-example">
          <img src={boosterImage} alt="Booster" />
          <span><small>{isEn ? 'Single booster' : 'Booster individual'}</small><strong><img src={coinIcon} alt="" /> 200</strong></span>
        </div>
      )}
      {guide.type === 'field' && (
        <div className="help-field-example">
          <div className="help-field-bonus-rule">
            <span><b>{isEn ? <>Element <i>or</i> type</> : <>Elemento <i>ou</i> tipo</>}</b><strong>{isEn ? '+1 Damage · +1 HP' : '+1 Dano · +1 HP'}</strong></span>
            <span><b>{isEn ? <>Element <i>and</i> type</> : <>Elemento <i>e</i> tipo</>}</b><strong>{isEn ? '+2 Damage · +2 HP' : '+2 Dano · +2 HP'}</strong></span>
          </div>
          <div className="help-field-cards">
            {[
              [vulcanusField, 'Vulcanus', { pt: 'Fogo + Monstro', en: 'Fire + Monster' }],
              [oceanField, { pt: 'Oceano', en: 'Ocean' }, { pt: 'Água + Mística', en: 'Water + Mystic' }],
              [desertField, { pt: 'Deserto', en: 'Desert' }, { pt: 'Terra + Reptiloide', en: 'Earth + Reptile' }],
            ].map(([image, name, affinity]) => {
              const displayName = typeof name === 'object' ? name[key] : name;
              return (
                <span key={displayName}>
                  <img src={image} alt={isEn ? `${displayName} terrain` : `Terreno ${displayName}`} />
                  <b>{displayName}</b>
                  <small>{affinity[key]}</small>
                </span>
              );
            })}
          </div>
          <small className="help-field-shared">{isEn ? '⚔ The bonus can also benefit compatible enemy creatures.' : '⚔ O bônus também pode beneficiar criaturas adversárias compatíveis.'}</small>
        </div>
      )}
      {guide.type === 'comparison' && (
        <div className="help-card-comparison">
          <section>
            <span className="help-card-comparison-label">{isEn ? 'Deck creature' : 'Criatura do deck'}</span>
            <img src={cardNormalScreenshot} alt={isEn ? 'Card used as a regular deck creature' : 'Carta utilizada como criatura normal do deck'} />
            <div><small>{isEn ? 'Summoned on the field' : 'Invocada no campo'}</small><small>{isEn ? 'Abilities on the card' : 'Habilidades da carta'}</small></div>
          </section>
          <i aria-hidden>×</i>
          <section className="guardian">
            <span className="help-card-comparison-label">{isEn ? 'Deck Guardian' : 'Guardião do deck'}</span>
            <img src={cardFullArtScreenshot} alt={isEn ? 'Card set as the deck\'s Guardian' : 'Carta configurada como Guardião do deck'} />
            <div><small>{isEn ? '✦ Own blessing' : '✦ Bênção própria'}</small><small>{isEn ? '2 abilities + 1 perk' : '2 habilidades + 1 perk'}</small><small>{isEn ? 'Levels 0–10' : 'Níveis 0–10'}</small></div>
          </section>
        </div>
      )}
    </figure>
  );
}

export default function HelpCenter({ onClose }) {
  const { lang = 'ptbr' } = useContext(AppContext) || {};
  const isEn = lang?.startsWith('en');
  const key = isEn ? 'en' : 'pt';
  const [category, setCategory] = useState('inicio');
  const [query, setQuery] = useState('');

  const normalizedQuery = query.trim().toLocaleLowerCase(isEn ? 'en-US' : 'pt-BR');
  const results = useMemo(() => GUIDES.filter((guide) => {
    if (!normalizedQuery) return guide.category === category;
    const haystack = `${guide.title.pt} ${guide.title.en} ${guide.summary.pt} ${guide.summary.en} ${guide.keywords}`;
    return haystack.toLocaleLowerCase(isEn ? 'en-US' : 'pt-BR').includes(normalizedQuery);
  }), [category, normalizedQuery, isEn]);

  return (
    <div className="help-center" role="dialog" aria-modal="true" aria-label={isEn ? 'Help center' : 'Central de ajuda'}>
      <div className="help-center-backdrop" />
      <header className="help-center-header">
        <div><span>{isEn ? 'Player library' : 'Biblioteca do jogador'}</span><h1>{isEn ? 'Help Center' : 'Central de Ajuda'}</h1></div>
        <label className="help-search">
          <span aria-hidden>⌕</span>
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={isEn ? 'Search: holo, poison, shop...' : 'Pesquisar: holo, veneno, shop...'}
            aria-label={isEn ? 'Search help' : 'Pesquisar na ajuda'}
          />
          {query && <button onClick={() => setQuery('')} aria-label={isEn ? 'Clear search' : 'Limpar busca'}>×</button>}
        </label>
        <button className="help-close" onClick={onClose}><span>{isEn ? 'Close' : 'Fechar'}</span> ×</button>
      </header>

      <div className="help-center-layout">
        <nav className="help-categories" aria-label={isEn ? 'Help categories' : 'Categorias da ajuda'}>
          <small>{isEn ? 'Chapters' : 'Capítulos'}</small>
          {CATEGORIES.map(([id, label, icon]) => (
            <button key={id} className={category === id && !query ? 'active' : ''} onClick={() => { setCategory(id); setQuery(''); }}>
              <i aria-hidden>{icon}</i><span>{label[key]}</span>
              <b>{GUIDES.filter((guide) => guide.category === id).length}</b>
            </button>
          ))}
          <div className="help-quick-tip"><b>{isEn ? '↗ Quick tip' : '↗ Dica rápida'}</b><p>{isEn ? 'You can search by the name of any status, screen or action.' : 'Você pode procurar pelo nome de qualquer status, tela ou ação.'}</p></div>
        </nav>

        <main className="help-results">
          <div className="help-results-heading">
            <div>
              <span>{query ? (isEn ? 'Search results' : 'Resultados da busca') : CATEGORIES.find(([id]) => id === category)?.[1][key]}</span>
              <strong>{results.length} {isEn ? (results.length === 1 ? 'guide' : 'guides') : (results.length === 1 ? 'guia' : 'guias')}</strong>
            </div>
            {query && <p>{isEn ? `Showing content related to "${query}"` : `Mostrando conteúdo relacionado a “${query}”`}</p>}
          </div>
          {results.length ? results.map((guide, index) => (
            <article className="help-guide" key={guide.id} style={{ '--guide-index': index }}>
              <GuideVisual guide={guide} isEn={isEn} />
              <div className="help-guide-copy">
                <span className="help-guide-number">{String(index + 1).padStart(2, '0')}</span>
                <h2>{guide.title[key]}</h2>
                <p>{guide.summary[key]}</p>
                <ol>{guide.steps[key].map((step) => <li key={step}>{step}</li>)}</ol>
                <details className="help-guide-details">
                  <summary><span>{isEn ? 'See detailed explanation' : 'Ver explicação detalhada'}</span><b aria-hidden>+</b></summary>
                  <div>
                    <h3>{isEn ? 'How it works' : 'Como funciona'}</h3>
                    <ul>{guide.more[key].map((item) => <li key={item}>{item}</li>)}</ul>
                    <aside><span aria-hidden>✦</span><p><strong>{isEn ? 'Game tip' : 'Dica de jogo'}</strong>{guide.tip[key]}</p></aside>
                  </div>
                </details>
              </div>
            </article>
          )) : (
            <div className="help-empty">
              <span>⌕</span>
              <h2>{isEn ? 'Nothing found' : 'Nada encontrado'}</h2>
              <p>{isEn ? 'Try words like "holo", "poison", "deck" or "shop".' : 'Tente palavras como “holo”, “veneno”, “deck” ou “shop”.'}</p>
              <button onClick={() => setQuery('')}>{isEn ? 'Clear search' : 'Limpar pesquisa'}</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

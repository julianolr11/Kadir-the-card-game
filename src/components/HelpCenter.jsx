import React, { useMemo, useState } from 'react';
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
  ['inicio', 'Primeiros passos', '✦'],
  ['navegacao', 'Navegação', '⌘'],
  ['cartas', 'Cartas e deck', '◈'],
  ['batalha', 'Batalha', '⚔'],
  ['progressao', 'Progressão', '↑'],
  ['colecao', 'Coleção', '▤'],
];

const GUIDES = [
  {
    id: 'primeira-partida',
    category: 'inicio',
    title: 'Comece sua primeira partida',
    summary: 'Do menu principal até o primeiro turno.',
    keywords: 'começar inicio jogar partida campanha batalha deck controles básico',
    image: menuRunningScreenshot,
    callout: 'Menu principal',
    steps: ['Abra Deck e monte uma formação válida.', 'Clique em Batalhar e escolha Campanha.', 'Selecione seu deck e confirme o confronto.'],
    more: ['Um deck precisa de um Guardião e das cartas necessárias para preencher a formação.', 'Na Campanha, cada torre possui uma sequência de adversários e registra seu progresso.', 'Ao entrar na batalha, observe sua mão, o monte de compra, os corações e a essência disponível.'],
    tip: 'Antes da primeira partida, abra cada carta do deck e leia o custo das habilidades.',
  },
  {
    id: 'menu',
    category: 'navegacao',
    title: 'Navegue pelo menu',
    summary: 'Onde encontrar cada área do jogo.',
    keywords: 'menu navegação shop loja bestiário conquistas deck engrenagem configurações booster',
    image: menuRunningScreenshot,
    callout: 'Mapa do menu',
    steps: ['Esquerda: Shop. Direita: Bestiário.', 'Centro: Deck e Batalhar. Acima: Conquistas.', 'A engrenagem abre configurações, ajuda e saída.'],
    more: ['Shop compra boosters e cartas garantidas usando moedas.', 'Bestiário reúne criaturas, campos e efeitos conhecidos.', 'Conquistas mostra o avanço nas Torres dos Guardiões.', 'Booster Zone abre os pacotes disponíveis no canto do menu.'],
    tip: 'Use a busca desta ajuda se esquecer onde uma função está localizada.',
  },
  {
    id: 'editar-cartas',
    category: 'cartas',
    title: 'Use a tela de edição',
    summary: 'Inspecione a carta e controle sua posição no deck.',
    keywords: 'editar carta deck arrastar remover adicionar guardião habilidade formação',
    image: deckEditorRunningScreenshot,
    callout: 'Edição em execução',
    type: 'card',
    steps: ['Abra Deck no centro do menu.', 'Selecione uma carta para ver atributos e habilidades.', 'Adicione ou remova cartas e salve antes de batalhar.'],
    more: ['O Guardião define a identidade principal da formação e possui habilidades próprias.', 'Confira vida, elemento, tipo, fraqueza e custos de essência antes de incluir uma criatura.', 'Cartas de campo mudam o cenário e concedem afinidade; cartas de efeito produzem ações imediatas.', 'As alterações só ficam disponíveis para seleção de batalha depois de salvar.'],
    tip: 'Equilibre criaturas, campos e efeitos; um deck composto apenas por criaturas perde flexibilidade.',
  },
  {
    id: 'deck-builder',
    category: 'cartas',
    title: 'Conheça o Deck Builder',
    summary: 'Crie, organize, edite e exclua suas formações.',
    keywords: 'deck builder meus decks criar editar apagar reciclar arsenal slots formação salvar',
    image: deckBuilderRunningScreenshot,
    callout: 'Deck Builder em execução',
    steps: ['Abra Deck no centro do menu.', 'Escolha um espaço vazio ou clique em Editar deck.', 'Dê um nome à formação, escolha o Guardião e preencha os slots.', 'Salve para disponibilizar o deck nas batalhas.'],
    more: ['É possível manter até 4 decks diferentes.', 'Cada cartão da lista mostra nome, Guardião, quantidade de cartas e estado da formação.', 'Reciclar converte cópias que não estão protegidas por decks em moedas.', 'Apagar remove a formação salva, mas não destrói as cartas da coleção.'],
    tip: 'Mantenha decks com propostas diferentes para alternar rapidamente entre torres e afinidades.',
  },
  {
    id: 'limites-deck',
    category: 'cartas',
    title: 'Limites e regras do deck',
    summary: 'Entenda quantas cartas e formações você pode utilizar.',
    keywords: 'limite máximo numero quantidade cartas deck 20 quatro 4 guardião cópias slots completo',
    image: deckEditorRunningScreenshot,
    callout: 'Contador e slots do deck',
    steps: ['Cada deck precisa ter exatamente 20 cartas.', 'Cada formação deve possuir 1 Guardião definido.', 'Você pode salvar no máximo 4 decks.', 'O contador do editor mostra quantos dos 20 espaços foram preenchidos.'],
    more: ['Um deck incompleto não pode ser finalizado para batalha.', 'Cada cópia é uma instância real da coleção; uma cópia já usada fica identificada pelo editor.', 'O Guardião é configurado separadamente, mas pertence à identidade daquele deck.', 'Use criaturas, cartas de campo e cartas de efeito para preencher a formação conforme sua estratégia.'],
    tip: 'Observe o contador antes de fechar: 20/20 confirma a quantidade, mas você ainda deve revisar o Guardião.',
  },
  {
    id: 'nivel-perks',
    category: 'cartas',
    title: 'Níveis, habilidades e perks',
    summary: 'Evolua até o nível 10 e amplie as opções do Guardião.',
    keywords: 'nivel nível xp experiência perk perks habilidade desbloquear progressão level máximo 10 loadout',
    image: deckBuilderRunningScreenshot,
    callout: 'Progressão do Guardião',
    steps: ['Ganhe XP participando de batalhas.', 'A barra mostra o progresso até o próximo nível.', 'Novas habilidades e perks são liberados nos níveis indicados.', 'No nível 10, a progressão de nível está completa.'],
    more: ['Cada Guardião possui uma tabela própria de desbloqueios; alguns níveis liberam habilidade, outros perk e alguns não liberam item.', 'Habilidades têm custo de essência e entram nas opções de ataque do Guardião.', 'Perks são bônus passivos, como vida adicional, crítico ou modificadores defensivos.', 'Desbloquear não equipa automaticamente: escolha seu loadout depois.'],
    tip: 'Planeje o próximo desbloqueio antes de escolher quais cartas receberão XP ao fim da batalha.',
  },
  {
    id: 'normal-vs-guardiao',
    category: 'cartas',
    title: 'Carta comum x carta Guardião',
    summary: 'As duas usam a mesma base, mas cumprem funções diferentes.',
    keywords: 'diferença carta normal comum guardião guardian criatura benção loadout habilidade perk',
    image: cardNormalScreenshot,
    callout: 'Estrutura de uma carta',
    type: 'comparison',
    steps: ['Cartas de criatura normais formam o corpo do deck e são invocadas durante a batalha.', 'O Guardião representa a identidade principal da formação.', 'Guardião possui bênção própria, progressão e loadout configurável.', 'Apenas uma carta pode ser definida como Guardião em cada deck.'],
    more: ['Vida, elemento, tipo, fraqueza e habilidades continuam importantes nos dois casos.', 'Criaturas normais utilizam as habilidades apresentadas em sua carta.', 'O Guardião pode desbloquear opções adicionais por nível e escolher quais manter equipadas.', 'A bênção do Guardião aparece destacada na carta e oferece uma característica exclusiva.'],
    tip: 'Escolha o Guardião pela sinergia da bênção e dos perks com o restante do deck, não apenas pela vida.',
  },
  {
    id: 'guia-guardiao',
    category: 'cartas',
    title: 'Guia exclusivo do Guardião',
    summary: 'Seleção, progressão, bênção e configuração de loadout.',
    keywords: 'guardião guardian guia exclusivo selecionar trocar configurar loadout benção bênção habilidades perks xp',
    image: cardFullArtScreenshot,
    callout: 'Carta de Guardião',
    type: 'card',
    steps: ['Escolha o Guardião ao criar ou editar o deck.', 'Confira sua bênção e a trilha de níveis.', 'Equipe até 2 habilidades disponíveis.', 'Escolha 1 perk desbloqueado e salve o loadout.'],
    more: ['Habilidades padrão estão disponíveis desde o início; opções extras surgem conforme a tabela daquele Guardião.', 'O perk selecionado pode alterar vida, defesa, crítico ou ganhos de experiência, dependendo do personagem.', 'O loadout salvo acompanha o Guardião e é usado para montar sua versão em batalha.', 'Trocar o Guardião muda a identidade e pode exigir uma nova combinação de cartas e campos.'],
    tip: 'Revise o loadout sempre que subir de nível: um desbloqueio novo pode ser melhor que a opção equipada.',
  },
  {
    id: 'turno',
    category: 'batalha',
    title: 'Entenda seu turno',
    summary: 'Comprar, invocar, atacar e encerrar.',
    keywords: 'turno comprar invocar atacar habilidade essência coração fim do turno campo mão',
    image: battleRunningScreenshot,
    callout: 'Tabuleiro de batalha',
    steps: ['Compre uma carta no monte.', 'Use essência para invocar ou ativar habilidades.', 'Derrote criaturas: cada eliminação quebra um coração rival.', 'Clique em Fim do turno quando concluir suas ações.'],
    more: ['A compra é obrigatória quando o monte possui cartas e sua mão ainda tem espaço.', 'Clique em uma criatura da mão e escolha um espaço livre para invocá-la.', 'Clique em uma criatura no campo para consultar e usar habilidades; cada habilidade informa seu custo.', 'Depois de atacar, a criatura não pode repetir a mesma ação naquele turno.', 'A batalha termina quando o último coração de um dos lados é destruído.'],
    tip: 'Gaste essência somente depois de verificar todas as criaturas que podem agir.',
  },
  {
    id: 'status',
    category: 'batalha',
    title: 'Buffs e debuffs',
    summary: 'Reconheça rapidamente todos os efeitos de batalha.',
    keywords: 'buff debuff status queimar sangramento congelar veneno sono paralisia escudo burn bleed freeze poison sleep paralyze',
    image: battleRunningScreenshot,
    callout: 'Efeitos de status',
    type: 'status',
    steps: ['Ícones aparecem sobre a criatura afetada.', 'Passe o cursor ou abra a carta para conferir duração e efeito.', 'Planeje o turno antes que efeitos contínuos causem dano.'],
    more: ['Queimadura, veneno e sangramento causam pressão ao longo dos turnos.', 'Congelamento, sono e paralisia restringem ações ou habilidades.', 'Escudo é um buff defensivo e absorve dano antes da vida da criatura.', 'A duração restante é atualizada a cada turno; abrir a carta mostra os efeitos ativos com clareza.'],
    tip: 'Priorize remover controles como sono e congelamento de criaturas essenciais à sua estratégia.',
  },
  {
    id: 'recursos',
    category: 'batalha',
    title: 'Vida, essência e campo',
    summary: 'Os três recursos que decidem uma batalha.',
    keywords: 'vida coração essência campo recurso custo perder vitória derrota',
    image: battleRunningScreenshot,
    callout: 'Recursos da partida',
    type: 'resources',
    steps: ['Corações são suas vidas: proteja o último.', 'Essência paga habilidades e invocações.', 'Cartas de campo alteram as regras para ambos os lados.'],
    more: ['Os corações pertencem ao jogador, não a uma criatura específica.', 'Uma criatura derrotada vai ao cemitério e remove um coração do seu controlador.', 'Essência é mostrada junto ao ícone de cristal e deve cobrir integralmente o custo da ação.', 'O campo é compartilhado: você pode ativá-lo, mas o adversário também pode aproveitar sua afinidade.'],
    tip: 'Quando estiver no último coração, preserve ao menos uma criatura capaz de defender o campo.',
  },
  {
    id: 'terrenos-campo',
    category: 'batalha',
    title: 'Terrenos e vantagem de campo',
    summary: 'Combine elemento e tipo para fortalecer suas criaturas.',
    keywords: 'terreno campo afinidade vantagem buff bônus dano hp vida elemento tipo vulcanus oceano deserto fogo água terra monstro mística reptiloide',
    image: battleRunningScreenshot,
    callout: 'Campo compartilhado',
    type: 'field',
    steps: [
      'Jogue uma carta de campo da sua mão; o cenário muda e o terreno passa a valer para os dois jogadores.',
      'Se a criatura combinar com o elemento OU com o tipo do campo, recebe +1 Dano e +1 HP.',
      'Se combinar com o elemento E com o tipo, recebe +2 Dano e +2 HP.',
      'Ao jogar outro campo, o anterior é substituído e enviado ao cemitério de campos.',
    ],
    more: ['Vulcanus favorece Fogo ou Monstro; criaturas que são Fogo e Monstro recebem o bônus máximo.', 'Oceano favorece Água ou Criatura Mística.', 'Deserto favorece Terra ou Reptiloide.', 'A animação de energia sobre a criatura indica que ela possui afinidade com o novo terreno.', 'Leia elemento e tipo no rodapé da carta para prever a vantagem antes de jogar o campo.'],
    tip: 'Não ative um terreno apenas por combinar com uma criatura sua; conte também quantas cartas inimigas serão fortalecidas.',
  },
  {
    id: 'upgrade',
    category: 'progressao',
    title: 'Normal → Holo → Full Art',
    summary: 'Evolua a apresentação das suas cartas.',
    keywords: 'upgrade melhorar evolução normal holo holográfica full art carta nível xp cópias',
    image: cardFullArtScreenshot,
    callout: 'Caminho de aprimoramento',
    type: 'upgrade',
    steps: ['Abra a carta na coleção e entre na edição.', 'Cumpra os requisitos exibidos para torná-la Holo.', 'Depois da versão Holo, complete o próximo requisito para liberar Full Art.'],
    more: ['Normal é a apresentação inicial, com moldura e arte tradicionais.', 'Holo adiciona acabamento holográfico mantendo todas as informações da carta.', 'Full Art amplia a ilustração e reorganiza habilidades e atributos em uma moldura especial.', 'O aprimoramento pertence àquela instância da carta; outras cópias continuam com seu próprio progresso.'],
    tip: 'Confira qual cópia está selecionada antes de investir recursos em um aprimoramento.',
  },
  {
    id: 'shop',
    category: 'colecao',
    title: 'Use o Shop',
    summary: 'Compre boosters ou garanta uma raridade.',
    keywords: 'shop loja comprar moedas booster pack raro épico lendário oferta preço',
    image: shopRunningScreenshot,
    callout: 'Vitrine da loja',
    type: 'shop',
    steps: ['Escolha uma oferta no catálogo.', 'Confira conteúdo e preço no painel selecionado.', 'Clique em Comprar agora; a entrega entra imediatamente na coleção.'],
    more: ['Boosters entregam várias cartas aleatórias e podem ampliar a coleção com melhor custo por carta.', 'Packs de 5 e 10 boosters possuem desconto indicado no catálogo.', 'Cartas garantidas removem a incerteza da raridade, mas a criatura recebida continua aleatória.', 'O botão fica indisponível quando o saldo não cobre o preço.'],
    tip: 'Use boosters para aumentar a variedade e cartas garantidas quando estiver buscando uma raridade específica.',
  },
  {
    id: 'bestiario',
    category: 'colecao',
    title: 'Consulte o Bestiário',
    summary: 'Conheça criaturas, elementos e histórias.',
    keywords: 'bestiário criatura coleção elemento fraqueza história lore encontrar pesquisar',
    image: bestiaryRunningScreenshot,
    callout: 'Arquivo de criaturas',
    steps: ['Abra o Bestiário no lado direito do menu.', 'Use os filtros para reduzir a lista.', 'Selecione uma criatura para ver afinidade, dados e história.'],
    more: ['Criaturas ainda não descobertas aparecem bloqueadas.', 'A seção de criaturas reúne elemento, tipo, atributos e informações narrativas.', 'Cartas de campo mostram cenário, elemento e tipo favorecidos.', 'Cartas de efeito explicam o resultado produzido quando são utilizadas.'],
    tip: 'Consulte o Bestiário antes de uma torre para reconhecer tipos e possíveis afinidades de terreno.',
  },
];

const STATUS_ITEMS = [
  [burnIcon, 'Queimadura', 'Dano contínuo'],
  [bleedIcon, 'Sangramento', 'Dano recorrente'],
  [freezeIcon, 'Congelamento', 'Impede ações'],
  [poisonIcon, 'Veneno', 'Dano por turno'],
  [sleepIcon, 'Sono', 'Bloqueia a criatura'],
  [paralyzeIcon, 'Paralisia', 'Impede habilidades'],
  [shieldIcon, 'Escudo', 'Absorve dano'],
];

function GuideVisual({ guide }) {
  return (
    <figure className={`help-guide-visual help-guide-visual-${guide.type || 'default'}`}>
      <img src={guide.image} alt={`Exemplo visual: ${guide.title}`} />
      <figcaption><span>Exemplo no jogo</span>{guide.callout}</figcaption>
      {guide.type === 'status' && (
        <div className="help-status-grid">
          {STATUS_ITEMS.map(([icon, label, text]) => (
            <div key={label}><img src={icon} alt="" /><span><strong>{label}</strong><small>{text}</small></span></div>
          ))}
        </div>
      )}
      {guide.type === 'resources' && (
        <div className="help-resource-row">
          <span><img src={heartIcon} alt="" /><b>3</b><small>Vidas</small></span>
          <span><img src={essenceIcon} alt="" /><b>4</b><small>Essência</small></span>
          <span><b>✦</b><small>Campo ativo</small></span>
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
                <img src={screenshot} alt={`Captura real da carta Agolir em versão ${label}`} />
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
          <span><small>Booster individual</small><strong><img src={coinIcon} alt="" /> 200</strong></span>
        </div>
      )}
      {guide.type === 'field' && (
        <div className="help-field-example">
          <div className="help-field-bonus-rule">
            <span><b>Elemento <i>ou</i> tipo</b><strong>+1 Dano · +1 HP</strong></span>
            <span><b>Elemento <i>e</i> tipo</b><strong>+2 Dano · +2 HP</strong></span>
          </div>
          <div className="help-field-cards">
            {[
              [vulcanusField, 'Vulcanus', 'Fogo + Monstro'],
              [oceanField, 'Oceano', 'Água + Mística'],
              [desertField, 'Deserto', 'Terra + Reptiloide'],
            ].map(([image, name, affinity]) => (
              <span key={name}>
                <img src={image} alt={`Terreno ${name}`} />
                <b>{name}</b>
                <small>{affinity}</small>
              </span>
            ))}
          </div>
          <small className="help-field-shared">⚔ O bônus também pode beneficiar criaturas adversárias compatíveis.</small>
        </div>
      )}
      {guide.type === 'comparison' && (
        <div className="help-card-comparison">
          <section>
            <span className="help-card-comparison-label">Criatura do deck</span>
            <img src={cardNormalScreenshot} alt="Carta utilizada como criatura normal do deck" />
            <div><small>Invocada no campo</small><small>Habilidades da carta</small></div>
          </section>
          <i aria-hidden>×</i>
          <section className="guardian">
            <span className="help-card-comparison-label">Guardião do deck</span>
            <img src={cardFullArtScreenshot} alt="Carta configurada como Guardião do deck" />
            <div><small>✦ Bênção própria</small><small>2 habilidades + 1 perk</small><small>Níveis 0–10</small></div>
          </section>
        </div>
      )}
    </figure>
  );
}

export default function HelpCenter({ onClose }) {
  const [category, setCategory] = useState('inicio');
  const [query, setQuery] = useState('');

  const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR');
  const results = useMemo(() => GUIDES.filter((guide) => {
    if (!normalizedQuery) return guide.category === category;
    return `${guide.title} ${guide.summary} ${guide.keywords}`.toLocaleLowerCase('pt-BR').includes(normalizedQuery);
  }), [category, normalizedQuery]);

  return (
    <div className="help-center" role="dialog" aria-modal="true" aria-label="Central de ajuda">
      <div className="help-center-backdrop" />
      <header className="help-center-header">
        <div><span>Biblioteca do jogador</span><h1>Central de Ajuda</h1></div>
        <label className="help-search">
          <span aria-hidden>⌕</span>
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Pesquisar: holo, veneno, shop..."
            aria-label="Pesquisar na ajuda"
          />
          {query && <button onClick={() => setQuery('')} aria-label="Limpar busca">×</button>}
        </label>
        <button className="help-close" onClick={onClose}><span>Fechar</span> ×</button>
      </header>

      <div className="help-center-layout">
        <nav className="help-categories" aria-label="Categorias da ajuda">
          <small>Capítulos</small>
          {CATEGORIES.map(([id, label, icon]) => (
            <button key={id} className={category === id && !query ? 'active' : ''} onClick={() => { setCategory(id); setQuery(''); }}>
              <i aria-hidden>{icon}</i><span>{label}</span>
              <b>{GUIDES.filter((guide) => guide.category === id).length}</b>
            </button>
          ))}
          <div className="help-quick-tip"><b>↗ Dica rápida</b><p>Você pode procurar pelo nome de qualquer status, tela ou ação.</p></div>
        </nav>

        <main className="help-results">
          <div className="help-results-heading">
            <div><span>{query ? 'Resultados da busca' : CATEGORIES.find(([id]) => id === category)?.[1]}</span><strong>{results.length} {results.length === 1 ? 'guia' : 'guias'}</strong></div>
            {query && <p>Mostrando conteúdo relacionado a “{query}”</p>}
          </div>
          {results.length ? results.map((guide, index) => (
            <article className="help-guide" key={guide.id} style={{ '--guide-index': index }}>
              <GuideVisual guide={guide} />
              <div className="help-guide-copy">
                <span className="help-guide-number">{String(index + 1).padStart(2, '0')}</span>
                <h2>{guide.title}</h2>
                <p>{guide.summary}</p>
                <ol>{guide.steps.map((step) => <li key={step}>{step}</li>)}</ol>
                <details className="help-guide-details">
                  <summary><span>Ver explicação detalhada</span><b aria-hidden>+</b></summary>
                  <div>
                    <h3>Como funciona</h3>
                    <ul>{guide.more.map((item) => <li key={item}>{item}</li>)}</ul>
                    <aside><span aria-hidden>✦</span><p><strong>Dica de jogo</strong>{guide.tip}</p></aside>
                  </div>
                </details>
              </div>
            </article>
          )) : (
            <div className="help-empty"><span>⌕</span><h2>Nada encontrado</h2><p>Tente palavras como “holo”, “veneno”, “deck” ou “shop”.</p><button onClick={() => setQuery('')}>Limpar pesquisa</button></div>
          )}
        </main>
      </div>
    </div>
  );
}

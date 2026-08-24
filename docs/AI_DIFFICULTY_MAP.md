# Mapa de decisões e calibração da IA

## 1. Espaço atual do jogo

### Estrutura da partida

- 5 orbes por lado; perder uma criatura normalmente custa 1 orbe.
- 3 espaços de criatura por lado.
- Baralho de 20 cartas e mão limitada a 7.
- +1 essência no início do turno, com limite 10.
- Uma invocação de criatura por turno.
- Cada criatura usa uma habilidade por turno, salvo efeitos que concedam usos adicionais.
- Abater ou sacrificar uma criatura concede essência.
- Tipos de ação: atacar, invocar, jogar campo, jogar efeito, sacrificar e encerrar turno.

### Conteúdo quantificado

- 48 criaturas/Guardiões.
- 47 bênçãos cadastradas.
- 417 habilidades entre golpes básicos, habilidades padrão e desbloqueáveis.
- Custos: 2 habilidades de custo 0, 173 de custo 1, 162 de custo 2, 60 de custo 3 e 20 de custo 4.
- 12 campos.
- 14 cartas de efeito, cada uma com um tipo de efeito diferente.
- 5 elementos: Água (12), Puro (11), Ar (9), Terra (9), Fogo (7).
- 7 tipos: Sombria (9), Monstro (8), Mística (7), Draconídeo (6), Fera (6), Ave (6), Reptiloide (6).

### Relações de combate

- Ciclo elemental: Água vence Fogo; Terra vence Água; Ar vence Terra; Fogo vence Ar.
- Vantagem elemental: +1 de dano; desvantagem: -1.
- Puro é neutro contra os demais e recebe +1 apenas no confronto Puro contra Puro.
- Campos concedem +1 dano/+1 HP por afinidade de elemento ou tipo e +2/+2 quando ambas coincidem.
- Status ofensivos: queimadura, veneno, sangramento, congelamento, paralisia e sono.
- Status/suportes: regeneração, imunidade, escudo, armadura, esquiva, buffs, debuffs e limpeza.

## 2. Árvore completa de decisão por turno

1. Resolver efeitos de início do turno.
2. Avaliar derrota/vitória imediata.
3. Identificar ameaças letais do adversário.
4. Avaliar cartas de efeito.
5. Avaliar substituição do campo.
6. Avaliar invocação e posição.
7. Avaliar bênção gerada pela invocação.
8. Avaliar sacrifício por essência.
9. Gerar combinações atacante × habilidade × alvo.
10. Simular dano, status, escudo, esquiva, morte, essência e orbes.
11. Escolher a sequência de ações com maior valor esperado.
12. Reavaliar o estado após cada ação; não encerrar enquanto houver ação útil.

## 3. Valor estratégico das ações

### Ataque

Pontuar:

- Dano esperado e chance de crítico/esquiva.
- Abate imediato e ganho de essência.
- Redução de orbes.
- Vantagem elemental.
- Status aplicado e duração útil.
- Remoção de escudo/imunidade.
- Risco de contraefeitos e valor perdido por atacar o alvo errado.

### Invocação

Pontuar:

- Vida, dano e habilidades disponíveis com a essência atual.
- Bênção ao entrar em campo.
- Sinergia de elemento/tipo com campo e aliados.
- Cobertura contra elementos inimigos.
- Ocupação do último espaço.
- Risco de morte imediata.

### Campo

Comparar antes de jogar:

- Bônus total concedido à IA.
- Bônus total concedido ao jogador.
- Variação em dano letal e sobrevivência.
- Valor de substituir o campo atual.

`valorCampo = beneficioIA - beneficioJogador - custoDeSubstituicao`

### Sacrifício

Só deve ocorrer quando o +1 de essência cria valor imediato ou evita perda maior.

- Priorizar criatura já usada, incapacitada ou com pouca vida.
- Evitar Guardião, última criatura e peça central de sinergia.
- Considerar habilidade liberada, dano letal e ganho de orbe.
- Comparar valor da criatura perdida com valor da ação desbloqueada.

### Cartas de efeito

Cobertura atual da IA: compra, essência, cura, escudo em área, dano em área e destruição em área.

Ainda precisam de avaliação própria:

- Troca de criaturas.
- Escudo individual.
- Compra do baralho adversário.
- Ressurreição.
- Controle temporário.
- Buff de dano.
- Imunidade.
- Ritual de essência com descarte da mão.

## 4. Problemas da dificuldade atual

O mesmo `campaignBuildLevel` controla simultaneamente:

- raridade/valor máximo do deck;
- habilidades e perks desbloqueados;
- ruído das decisões;
- uso de efeitos;
- sacrifício tático.

Isso torna impossível saber se uma luta ficou difícil por cartas melhores ou por decisões melhores.

Também existem decisões por prioridade fixa: invocar antes de comparar todas as ações, usar campo sem calcular o benefício do adversário e avaliar apenas parte das cartas de efeito.

## 5. Novo modelo de dificuldade

Separar quatro eixos:

1. **Poder do deck**: raridade, valor, nível e qualidade do loadout.
2. **Profundidade de busca**: quantas ações futuras a IA compara.
3. **Precisão**: chance de escolher a melhor opção calculada.
4. **Conhecimento**: quais sistemas a IA sabe usar.

| Nível | Perfil | Busca | Precisão | Sistemas disponíveis |
|---|---|---:|---:|---|
| 0 | Iniciante | ação atual | 45% | ataque e invocação simples |
| 1 | Iniciante | ação atual | 50% | vantagem elemental básica |
| 2 | Aprendiz | ação atual | 58% | seleção de alvo e custo |
| 3 | Aprendiz | ação atual | 64% | efeitos simples |
| 4 | Adepto | 1 ação | 71% | campos e sacrifício óbvio |
| 5 | Ameaça | 1 ação | 77% | status, escudo e abates |
| 6 | Guardião | 2 ações | 83% | sinergias e efeitos com alvo |
| 7 | Guardião | 2 ações | 88% | preservação de peças-chave |
| 8 | Campeão | 2 ações | 92% | sequências efeito → ataque |
| 9 | Campeão | 3 ações | 96% | previsão do próximo turno |
| 10 | Lenda | 3 ações | 99% | todos os sistemas e combos |

Erros de níveis baixos devem escolher a segunda/terceira melhor ação, nunca uma ação inválida ou deixar de atacar quando existe um ataque gratuito e seguro.

## 6. Função de avaliação sugerida

```text
valorEstado =
  30 × diferençaDeOrbes
  + 8 × diferençaDeCriaturas
  + 4 × diferençaDeEssência
  + 2 × diferençaDeCartasNaMão
  + 2 × diferençaDeHPNoCampo
  + valorDeEscudos
  + valorDeStatus
  + valorDeAfinidadeDoCampo
  + ameaçaLetal
  - riscoLetalAdversário
```

Os pesos devem ser ajustados com telemetria, não apenas por sensação.

## 7. Métricas para calibrar

Executar partidas automatizadas por nível e registrar:

- taxa de vitória;
- duração média em turnos;
- dano e orbes perdidos por lado;
- essência gerada, gasta e desperdiçada;
- turnos encerrados com ataque válido disponível;
- cartas paradas na mão;
- campos que beneficiaram mais o adversário;
- sacrifícios e valor obtido depois deles;
- frequência de cada carta/habilidade;
- diferença entre ação escolhida e melhor ação avaliada;
- partidas decididas por bênção, efeito, campo ou vantagem elemental.

Meta inicial de campanha:

- níveis 0–2: 75–90% de vitória do jogador;
- níveis 3–5: 60–75%;
- níveis 6–8: 45–60%;
- níveis 9–10: 30–45% na primeira tentativa.

## 8. Ordem recomendada de implementação

1. Criar gerador único de ações válidas.
2. Criar função pura de avaliação do estado.
3. Substituir prioridades fixas por comparação de ações.
4. Adicionar suporte às 8 cartas de efeito ainda ignoradas.
5. Avaliar campos para ambos os lados.
6. Separar poder do deck e inteligência.
7. Criar simulador de partidas sem interface.
8. Coletar métricas e calibrar os pesos por nível.


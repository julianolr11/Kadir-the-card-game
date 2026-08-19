import { resolveAbility } from './abilityResolver';

describe('resolveAbility', () => {
  it('uses damage written on the card', () => {
    expect(resolveAbility({ cost: 4, desc: { pt: 'Causa 4 de dano e aplica sangramento.' } }).damage).toBe(4);
  });

  it('keeps multiple statuses from one ability', () => {
    const result = resolveAbility({
      desc: { pt: 'Causa 3 de dano, sangramento e congelamento por 2 turnos.' },
    });
    expect(result.statuses.map(status => status.type)).toEqual(['bleed', 'freeze']);
  });

  it('extracts support values', () => {
    expect(resolveAbility({ desc: { pt: 'Recupera 3 de vida.' } }).heal).toBe(3);
    expect(resolveAbility({ desc: { pt: 'Ganha escudo que absorve 2 de dano.' } }).shield).toBe(2);
  });

  it('extracts shield amounts written as "X de escudo" (number before the keyword)', () => {
    expect(resolveAbility({ desc: { pt: 'Concede 1 de escudo a todos os aliados por 1 turno.' } }).shield).toBe(1);
    expect(resolveAbility({ desc: { pt: 'Concede 2 de escudo e +1 resistência por 2 turnos.' } }).shield).toBe(2);
  });

  it('extracts shield amounts with filler words between "escudo" and the number', () => {
    expect(resolveAbility({
      desc: { pt: 'Cria escudo de gelo sombrio: absorve até 3 de dano e reflete 1 de dano ao atacante.' },
    }).shield).toBe(3);
  });

  it('leaves shield null when no quantity is stated', () => {
    expect(resolveAbility({ desc: { pt: 'Ganha um escudo que nega o próximo ataque recebido por 1 rodada.' } }).shield).toBeNull();
    expect(resolveAbility({ desc: { pt: 'Aliados recebem escudo de luz.' } }).shield).toBeNull();
  });

  it('extracts cleanse count from "remove N debuff" text (Albot\'s Purifying Howl)', () => {
    const pt = resolveAbility({ desc: { pt: 'Remove 1 debuff aliado e cura 1 de vida.' } });
    expect(pt.cleanse).toBe(1);
    expect(pt.heal).toBe(1);

    const en = resolveAbility({ desc: { en: 'Removes 1 ally debuff and heals 1 HP.' } });
    expect(en.cleanse).toBe(1);
    expect(en.heal).toBe(1);
  });

  it('extracts cleanse count from "cleanses N debuff" text', () => {
    expect(resolveAbility({
      desc: { en: 'Deals 4 damage and cleanses 1 debuff from the most injured ally.' },
    }).cleanse).toBe(1);
  });

  it('treats "remove all debuffs" as an unlimited cleanse', () => {
    expect(resolveAbility({ desc: { pt: 'Remove todos os debuffs de um aliado.' } }).cleanse).toBe(Infinity);
  });

  it('honors an explicit ability.cleanse field over the text', () => {
    expect(resolveAbility({ cleanse: 2, desc: { pt: 'Cura 2 de vida e remove 1 debuff de um aliado.' } }).cleanse).toBe(2);
  });

  it('leaves cleanse null when the ability has no debuff removal', () => {
    expect(resolveAbility({ desc: { pt: 'Causa 3 de dano ao inimigo.' } }).cleanse).toBeNull();
  });
});

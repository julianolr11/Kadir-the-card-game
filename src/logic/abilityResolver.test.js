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
});

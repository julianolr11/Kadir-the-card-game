const cards = require('./index');
const guardiansData = require('../guardiansData');

describe('card battle contract', () => {
  const guardians = cards.filter(card => card?.isGuardian);

  it('uses the live card catalog for every guardian loadout', () => {
    expect(Object.keys(guardiansData)).toHaveLength(guardians.length);
    guardians.forEach((card) => {
      expect(guardiansData[card.id]).toBeDefined();
      expect(guardiansData[card.id].defaultSkills).toEqual(card.defaultSkills);
      expect(guardiansData[card.id].unlockTable).toEqual(card.unlockTable);
    });
  });

  it('gives every selectable guardian skill an executable description and cost', () => {
    guardians.forEach((card) => {
      const skills = [
        ...(card.defaultSkills || []),
        ...(card.unlockTable || []).filter(unlock => unlock.type === 'skill'),
      ];
      skills.forEach((skill) => {
        expect(skill.id).toBeTruthy();
        expect(skill.name?.pt).toBeTruthy();
        expect(skill.desc?.pt).toBeTruthy();
        expect(typeof skill.cost).toBe('number');
      });
    });
  });

  it('keeps Mawthorn focused on bleed and freeze instead of poison', () => {
    const mawthorn = guardiansData.mawthorn;
    const skills = [
      ...mawthorn.defaultSkills,
      ...mawthorn.unlockTable.filter(unlock => unlock.type === 'skill'),
    ];
    const text = skills.map(skill => `${skill.name.pt} ${skill.desc.pt}`).join(' ').toLowerCase();
    expect(text).not.toMatch(/veneno|tóxic|toxina/);
    expect(text).toMatch(/sangramento/);
    expect(text).toMatch(/congelamento|congela/);
  });

  it('keeps the corrected guardians aligned with their lore and element', () => {
    const selectableText = (id) => {
      const card = guardiansData[id];
      return [
        ...card.defaultSkills,
        ...card.unlockTable.filter(unlock => unlock.type === 'skill' || unlock.type === 'perk'),
      ].map(item => `${item.name?.pt || ''} ${item.desc?.pt || ''}`).join(' ').toLowerCase();
    };

    expect(selectableText('arguilia')).not.toMatch(/picada|teia|neurotoxina|praga|veneno/);
    expect(selectableText('landor')).not.toMatch(/folha|raíz|raizes|planta|casca|espinho/);
    expect(selectableText('leoracal')).not.toMatch(/flamej|chama|fogo|inferno|queima/);
    expect(guardiansData.nihil.story.map(entry => entry.pt).join(' ')).not.toMatch(/Noctyra/);
  });
});

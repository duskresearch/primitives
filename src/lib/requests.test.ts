import { describe, expect, it } from 'vitest';
import roadmap from '@/data/roadmap-ideas.json';
import { ideaMark } from './idea-mark';
import { age, findInCatalogue, normalize, sameIdea } from './requests';

describe('request rules', () => {
  it('normalizes away case, accents, filler and plurals', () => {
    expect(normalize('The Sound tools')).toBe('sound');
    expect(normalize('Café  Colours!')).toBe('cafe colour');
    expect(normalize('Glass')).toBe('glass');
  });

  it('treats a typo as the same idea, but not a different word', () => {
    expect(sameIdea(normalize('Masonary'), normalize('Masonry'))).toBe(true);
    expect(sameIdea(normalize('Sounds'), normalize('Sound'))).toBe(true);
    expect(sameIdea(normalize('Depth'), normalize('Dept'))).toBe(false);
    expect(sameIdea(normalize('Chart'), normalize('Charm'))).toBe(false);
  });

  it('knows what is already live or planned', () => {
    expect(findInCatalogue('contrast')).toMatchObject({ kind: 'live', name: 'Contrast', href: '/color/contrast' });
    expect(findInCatalogue('WCAG')).toMatchObject({ kind: 'live', name: 'Contrast' });
    expect(findInCatalogue('Shadow', 'light')).toMatchObject({ kind: 'live', primitive: 'Light', href: '/light/shadow' });
    expect(findInCatalogue('Noise')).toMatchObject({ kind: 'live', name: 'Noise' });
    expect(findInCatalogue('color scale')).toMatchObject({ primitive: 'Color', name: 'Scale' });
    expect(findInCatalogue('Halftone')).toBeNull();
  });

  it('keeps the roadmap seeds off the catalogue', () => {
    for (const idea of roadmap) expect(findInCatalogue(idea.name, idea.primitive), idea.name).toBeNull();
  });

  it('says how old a suggestion is in words', () => {
    const now = 1_800_000_000;
    expect(age(now - 3600, now)).toBe('today');
    expect(age(now - 86400 * 1.5, now)).toBe('yesterday');
    expect(age(now - 86400 * 5, now)).toBe('5 days ago');
    expect(age(now - 86400 * 21, now)).toBe('3 weeks ago');
  });
});

describe('idea marks', () => {
  it('are the same every time for the same idea, and differ between ideas', () => {
    expect(ideaMark('sound')).toEqual(ideaMark('sound'));
    const distinct = new Set(roadmap.map((i) => JSON.stringify(ideaMark(i.id))));
    expect(distinct.size).toBe(roadmap.length);
  });

  it('stay muted, so they never pass for a primitive mark', () => {
    for (const i of roadmap) {
      const { tint, layers } = ideaMark(i.id);
      expect(tint).toMatch(/^oklch\(0\.9 0\.04 /);
      expect(JSON.stringify(layers)).toMatch(/oklch\(0\.52 0\.1 /);
    }
  });
});

import { describe, expect, it } from 'vitest';
import { moderate } from '.';

const outcome = (name: string, detail?: string) => moderate({ name, detail }).outcome;

describe('moderation', () => {
  it('accepts real design ideas', () => {
    for (const name of ['Sound', 'Depth', 'Color blindness', 'Variable font axes', 'Masonry', 'OKLCH gradients', 'SVG dividers', 'Haptics', 'Focus rings', 'Scroll animations', 'Bento grid', 'Dark mode', 'Emoji'])
      expect(outcome(name), name).toBe('accept');
    expect(outcome('Isotype', 'Pictograms for charts, after Otto Neurath')).toBe('accept');
  });

  it('refuses keyboard mashing and random strings', () => {
    for (const name of ['asdfgh', 'qwerty', 'sdfsdf', 'jkjkjk', 'xkcdq', 'zxcvb', 'aaaaaa', 'lkjlkj', 'fjdkslf', 'poiuy', 'asdasd', 'hjkl', 'bnmbnm', 'dfghjk ok', 'Qqqq'])
      expect(outcome(name), name).toBe('refuse');
  });

  it('refuses NSFW language, including disguised spellings', () => {
    for (const name of ['fuck this', 'sh1t', 'f u c k', 'Penis', 'b00bs', 'dickhead tool'])
      expect(outcome(name), name).toBe('refuse');
    expect(outcome('Grain', 'shit texture')).toBe('refuse');
  });

  it('does not trip on innocent words that contain rude substrings', () => {
    for (const name of ['Scunthorpe', 'Classic shapes', 'Assets', 'Cocktail colors', 'Grasshopper'])
      expect(outcome(name), name).not.toBe('refuse');
  });

  it('refuses links, contacts, markup and noise', () => {
    for (const name of ['buy now at cheap.com', 'https://spam.example', 'www.example', 'me@mail.com', '@handle', 'call 5551234567', '<script>', '!!!!!!', '🔥🔥🔥', 'a'])
      expect(outcome(name), name).toBe('refuse');
  });

  it('refuses things that are not suggestions', () => {
    for (const name of ['test', 'Hello', 'lol', 'n/a', 'idk', 'asdf', 'Something'])
      expect(outcome(name), name).toBe('refuse');
  });

  it('refuses walls of text', () => {
    expect(outcome('please build a thing that does many things for me now')).toBe('refuse');
    expect(outcome('x'.repeat(60))).toBe('refuse');
  });

  it('holds real but off-topic words for review', () => {
    for (const name of ['Pizza', 'Football', 'My cat']) expect(outcome(name), name).toBe('hold');
  });

  it('calms shouting and capitalizes', () => {
    expect(moderate({ name: 'BUILD SHADOWS' })).toMatchObject({ name: 'Build shadows' });
    expect(moderate({ name: 'sound' })).toMatchObject({ name: 'Sound' });
    expect(moderate({ name: 'SVG' })).toMatchObject({ name: 'SVG', outcome: 'accept' });
  });
});

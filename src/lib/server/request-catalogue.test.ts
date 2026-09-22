import { describe, expect, it } from 'vitest';
import { primitives as site } from '../catalogue';
import { primitives as business } from './request-catalogue';

describe('business catalogue', () => {
  it('matches the site meta-based live classification for every instrument', () => {
    expect(business.flatMap((primitive) => primitive.instruments.map((instrument) => [instrument.href, instrument.live])))
      .toEqual(site.flatMap((primitive) => primitive.instruments.map((instrument) => [instrument.href, instrument.live])));
  });
});

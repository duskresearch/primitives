import { describe, expect, it } from 'vitest';
import { blobOwn, cornerOwn, defaults, faviconOwn, formOwn, numeric, parse, pointsString, polygonOwn, serializeWith } from './state';
import { presetPoints } from '@duskresearch/primitives/design/shape';
import tokens from '../../data/tokens.json';
import { withoutDefaults } from '../../lib/query';
import { hex as displayedHex, parseColor } from '@duskresearch/primitives/design/color';
describe('Shape URL state', () => {
  it('round trips an edited preset without dropping generated coordinate precision', () => {
    const points = presetPoints(defaults, 'hexagon');
    points[0].x = 51;
    const q = new URLSearchParams(serializeWith(defaults, {preset:'custom',points:pointsString(points)}));
    expect(polygonOwn(q)).toEqual({preset:'custom',points});
  });
  it('accepts twelve four-decimal points but rejects excess precision and vertex count', () => {
    const points = Array.from({length:12}, (_, i) => ({x:99.9999-i,y:88.8888-i}));
    const read = (value:string) => polygonOwn(new URLSearchParams({preset:'custom',points:value})).points;
    expect(read(pointsString(points))).toEqual(points);
    expect(read('0,0;100,0;50.12345,90')).toBeNull();
    expect(read(pointsString([...points,{x:0,y:0}]))).toBeNull();
  });
  it('does not parse symbolic catalogue values as numbers', () => {
    expect(defaults.foreground).toBe(tokens.color.ink);
    expect(parse(new URLSearchParams('sides=n&radius=r&rotation=deg'))).toEqual(defaults);
    expect(parse(new URLSearchParams())).toEqual(defaults);
  });
  it('bounds hostile input, rounds decimals, and omits no result-setting in setup', () => {
    expect(parse(new URLSearchParams('form=%3Csvg%3E&sides=100&radius=Infinity&rotation=-2'))).toEqual({...defaults,sides:12,rotation:0});
    expect(numeric('8.5',3,12,6)).toBe(9);
    expect(formOwn(new URLSearchParams('inner=.68'))).toEqual({inner:.68});
    const q=new URLSearchParams(serializeWith({...defaults,form:'star',radius:45}, {inner:.68}));
    expect(parse(q).form).toBe('star');expect(formOwn(q).inner).toBe(.68);
  });
  it('preserves polygon order and discards oversized or malformed point strings', () => {
    const raw='0,0;100,0;50,90';
    expect(pointsString(polygonOwn(new URLSearchParams(`points=${raw}`)).points!)).toBe(raw);
    expect(polygonOwn(new URLSearchParams('points=0,0;99,0;999,99')).points).toBeNull();
    expect(polygonOwn(new URLSearchParams(`points=${'9'.repeat(1000)}`)).points).toBeNull();
  });
  it('round trips the other instruments and normalizes hex', () => {
    expect(cornerOwn(new URLSearchParams('cornerRadius=44&smoothing=.65'))).toEqual({cornerRadius:44,smoothing:.65});
    expect(blobOwn(new URLSearchParams('seed=4294967295&complexity=12&irregularity=.35'))).toEqual({seed:4294967295,complexity:12,irregularity:.35});
    expect(parse(new URLSearchParams('foreground=ABCDEF')).foreground).toBe('#abcdef');
    expect(faviconOwn(new URLSearchParams('foreground=ABCDEF&background=%23112233&padding=25'))).toMatchObject({background:'#112233',padding:25});
  });
  it('shares foreground across sibling setups and preserves legacy Favicon links', () => {
    const selected = {...defaults, foreground:'#e85854'};
    const siblingSettings: Record<string, string | number | boolean>[] = [{inner:.5},{cornerRadius:32,smoothing:.75},{seed:12345,complexity:7,irregularity:.24},{background:tokens.color.paper,padding:12,inner:.5}];
    for (const own of siblingSettings) {
      expect(parse(new URLSearchParams(serializeWith(selected, own))).foreground).toBe('#e85854');
    }
    expect(parse(new URLSearchParams('foreground=112233')).foreground).toBe('#112233');
    expect(displayedHex(parseColor(defaults.foreground))).toBe(defaults.foreground);
    expect(displayedHex(parseColor(selected.foreground))).toBe(selected.foreground);
    expect((serializeWith(selected, faviconOwn(new URLSearchParams())).match(/foreground=/g) ?? [])).toHaveLength(1);
    expect(parse(new URLSearchParams('foreground=%3Cscript%3E')).foreground).toBe(tokens.color.ink);
    expect(withoutDefaults(serializeWith(defaults,{inner:.5}),serializeWith(defaults,{inner:.5}))).toBe('');
    expect(withoutDefaults(serializeWith(selected,{inner:.5}),serializeWith(defaults,{inner:.5}))).toBe('foreground=%23e85854');
  });
});

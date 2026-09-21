import { describe,expect,it } from 'vitest';
import { withoutDefaults } from '../../lib/query';
import { curve, defaults, durationOwn, exportOwn, parse, serializeWith, staggerOwn } from './state';
describe('Motion URL state',()=>{
  it('uses numeric deterministic defaults and omits them',()=>{
    expect(parse(new URLSearchParams())).toEqual(defaults);
    expect(withoutDefaults(serializeWith(defaults),serializeWith(defaults))).toBe('');
  });
  it('keeps active and inactive curve parameters between siblings',()=>{
    const selected={...defaults,kind:'spring' as const,mass:2,y1:1.3,duration:440};
    const q=new URLSearchParams(serializeWith(selected,{distance:40}));
    expect(parse(q)).toEqual(selected);expect(curve(parse(q))).toMatchObject({kind:'spring',mass:2});
    expect(exportOwn(q)).toEqual({target:'css'});
    expect(durationOwn(q).distance).toBe(40);
    expect(staggerOwn(q)).toMatchObject({count:6,interval:50});
  });
  it('clamps malformed URL values before passing to operations',()=>{
    const s=parse(new URLSearchParams('kind=<svg>&x1=Infinity&y2=200&mass=-5&duration=foo'));
    expect(s).toMatchObject({kind:'bezier',x1:.25,y2:3,mass:.01,duration:300});
  });
});

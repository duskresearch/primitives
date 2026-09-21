import {describe,expect,it} from 'vitest';
import {withoutDefaults} from '../../lib/query';
import {blurOwn,defaults,elevationOwn,parse,serializeWith,shadowOwn} from './state';
describe('Light URL state',()=>{
  it('round trips shared colors and geometry across sibling tools',()=>{
    const s={...defaults,foreground:'#112233',background:'#abcdef',angle:42};
    const q=new URLSearchParams(serializeWith(s,{radius:24,alpha:.8}));
    expect(parse(q)).toEqual(s);expect(blurOwn(q)).toEqual({radius:24,alpha:.8});
    expect(shadowOwn(q).layers).toBe(3);expect(elevationOwn(q).levels).toBe(5);
    expect(withoutDefaults(serializeWith(defaults),serializeWith(defaults))).toBe('');
  });
  it('rejects color markup and bounds numeric URLs',()=>{expect(parse(new URLSearchParams('foreground=%3Csvg%3E&angle=Infinity&softness=9'))).toMatchObject({foreground:defaults.foreground,angle:315,softness:1});});
});

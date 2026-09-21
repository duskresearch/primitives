import {describe,expect,it} from 'vitest';
import {withoutDefaults} from '../../lib/query';
import {defaults,gradientOwn,parse,serializeWith,textureOwn} from './state';
describe('Noise URL state',()=>{
  it('round trips seed and colors across siblings',()=>{const s={...defaults,seed:4294967295,foreground:'#abcdef'};const q=new URLSearchParams(serializeWith(s,{preset:'clouds',size:512}));expect(parse(q)).toEqual(s);expect(textureOwn(q)).toEqual({preset:'clouds',size:512});expect(gradientOwn(q)).toMatchObject({angle:45});expect(withoutDefaults(serializeWith(defaults),serializeWith(defaults))).toBe('');});
  it('bounds malformed URL data',()=>{expect(parse(new URLSearchParams('seed=Infinity&foreground=%3Csvg%3E&intensity=9'))).toMatchObject({seed:12345,foreground:defaults.foreground,intensity:1});});
});

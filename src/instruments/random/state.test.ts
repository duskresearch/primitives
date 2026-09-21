import {describe,expect,it} from 'vitest';
import {withoutDefaults} from '../../lib/query';
import {bytesFromHex,defaults,diceOwn,parse,rangeOwn,serializeWith,shuffleOwn,uuidOwn} from './state';
describe('Random URL state',()=>{
  it('round trips seed and bounded own fields',()=>{
    const q=new URLSearchParams(serializeWith({seed:4294967295},{lower:-100,upper:100}));
    expect(parse(q).seed).toBe(4294967295);expect(rangeOwn(q)).toEqual({lower:-100,upper:100});
    expect(diceOwn(q)).toEqual({count:2,sides:6});
    expect(withoutDefaults(serializeWith(defaults),serializeWith(defaults))).toBe('');
  });
  it('preserves escaped Unicode list text without executable markup',()=>{
    const text='🟣\n<script>alert(1)</script>',q=new URLSearchParams(serializeWith(defaults,{text}));
    expect(shuffleOwn(q).text).toBe(text);
    expect(()=>serializeWith(defaults,{text:'\ud800'})).not.toThrow();
  });
  it('validates replay bytes and timestamps',()=>{
    const q=new URLSearchParams('version=7&bytes=abcdef0123456789abcdef0123456789&timestamp=1700000000000');
    expect(bytesFromHex(uuidOwn(q).bytes)).toHaveLength(16);
    expect(uuidOwn(new URLSearchParams('bytes=<svg>&timestamp=Infinity')).bytes).toBe('000102030405060708090a0b0c0d0e0f');
  });
});

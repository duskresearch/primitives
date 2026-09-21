import {describe,expect,it} from 'vitest';
import {withoutDefaults} from '../../lib/query';
import {defaults,insetOwn,parse,serializeWith,tokenOwn} from './state';
describe('Space URL state',()=>{
  it('round trips shared settings and omits defaults',()=>{
    const s={...defaults,base:12,mode:'modular' as const,ratio:1.5,steps:10};
    expect(parse(new URLSearchParams(serializeWith(s,{format:'json'})))).toEqual(s);
    expect(withoutDefaults(serializeWith(defaults),serializeWith(defaults))).toBe('');
    expect(tokenOwn(new URLSearchParams('format=json')).format).toBe('json');
  });
  it('bounds hostile URLs and preserves signed margins',()=>{
    expect(parse(new URLSearchParams('base=Infinity&steps=99&ratio=bad'))).toMatchObject({base:8,steps:12,ratio:1.25});
    expect(insetOwn(new URLSearchParams('mt=-24&pt=-100'))).toMatchObject({mt:-24,pt:0});
  });
});

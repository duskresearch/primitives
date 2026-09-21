import {describe,expect,it} from 'vitest';
import {withoutDefaults} from '../../lib/query';
import {defaults,gridOwn,opticalOwn,parse,serializeWith} from './state';
describe('Icon URL state',()=>{
  it('retains shared exemplar, size, stroke and color across siblings',()=>{const s={...defaults,exemplar:'triangle' as const,size:32 as const,stroke:3,foreground:'#abcdef'};const q=new URLSearchParams(serializeWith(s,{scale:1.1,offsetX:2}));expect(parse(q)).toEqual(s);expect(opticalOwn(q,s.size)).toMatchObject({scale:1.1,offsetX:2});expect(gridOwn(q,s.size)).toMatchObject({guides:true});expect(withoutDefaults(serializeWith(defaults),serializeWith(defaults))).toBe('');});
  it('bounds malformed URL values',()=>{expect(parse(new URLSearchParams('size=17&foreground=%3Csvg%3E&stroke=Infinity'))).toEqual(defaults);});
});

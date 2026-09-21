import {describe,expect,it} from 'vitest';
import {withoutDefaults} from '../../lib/query';
import {defaults,parse,serializeWith,stripesOwn,tileOwn} from './state';
describe('Pattern URL state',()=>{
  it('shares motif, size and colors between Tile and Export',()=>{
    const s={...defaults,motif:'triangle' as const,tileSize:96,foreground:'#abcdef'};
    const q=new URLSearchParams(serializeWith(s,{size:.7,rotation:30}));
    expect(parse(q)).toEqual(s);expect(tileOwn(q)).toEqual({size:.7,rotation:30});
    expect(withoutDefaults(serializeWith(defaults),serializeWith(defaults))).toBe('');
  });
  it('rejects markup and bounds stripe width by tile size',()=>{expect(parse(new URLSearchParams('foreground=%3Csvg%3E&tileSize=8'))).toMatchObject({foreground:defaults.foreground,tileSize:8});expect(stripesOwn(new URLSearchParams('width=100'),8).width).toBe(4);});
});

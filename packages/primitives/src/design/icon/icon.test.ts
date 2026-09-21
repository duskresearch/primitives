import {describe,expect,it} from 'vitest';
import {grid,optical,stroke} from './index';
import {InputError} from '../../operation';
const base={exemplar:'square' as const,size:24 as const,stroke:2,foreground:'#1a1a17'};
describe('Icon operations',()=>{
  it('emits optional viewBox keylines but clean no-guide SVG',()=>{
    const guided=grid({...base,padding:2,guides:true}),clean=grid({...base,padding:2,guides:false});
    expect(guided.svg).toContain('stroke-dasharray="2 2"');expect(clean.svg).not.toContain('stroke-dasharray');
    expect(clean.svg).toContain('viewBox="0 0 24 24"');
  });
  it('compares one exemplar with correct non-scaling stroke attribute',()=>{
    const result=stroke({...base,padding:2});
    expect(result.comparisons.map(x=>x.size)).toEqual([16,20,24,32,48]);
    expect(result.fixedSvg).toContain('vector-effect="non-scaling-stroke"');expect(result.scaledSvg).not.toContain('vector-effect');
    expect(result.inset).toBeGreaterThan(base.stroke*24/(2*16));
  });
  it('returns manual optical overlay and clamps transformations inside bounds',()=>{
    const result=optical({...base,padding:2,scale:1.2,offsetX:1,offsetY:-1});
    expect(result.svg).toContain(result.transform);expect(result.overlaySvg).toContain('opacity="0.3"');
    expect(optical({...base,size:16,stroke:4,padding:0,scale:1.2,offsetX:3,offsetY:3}).clamped).toBe(true);
    expect(result.appliedScale*(base.size/2-2)+1).toBeLessThanOrEqual(base.size/2);
  });
  it('rejects hostile colors and invalid dimensions',()=>{
    expect(()=>grid({...base,foreground:'url(x)',padding:2,guides:true})).toThrow(InputError);
    expect(()=>stroke({...base,stroke:Infinity,padding:2})).toThrow(InputError);
    expect(()=>optical({...base,padding:2,scale:2,offsetX:0,offsetY:0})).toThrow(InputError);
  });
});

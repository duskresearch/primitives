import {describe,expect,it} from 'vitest';
import {exportPattern,stripes,tile} from './index';
import {InputError} from '../../operation';
const base={motif:'circle' as const,tileSize:48,foreground:'#1a1a17',background:'#f4f1ea'};
describe('Pattern operations',()=>{
  it('uses identical motif geometry in repeated SVG and one-tile SVG',()=>{
    const answer=tile({...base,size:.5,rotation:45});
    expect(answer.motifSize).toBe(24);expect(answer.clearGap).toBe(24);
    expect(answer.svg).toContain('patternUnits="userSpaceOnUse"');
    expect(answer.svg).toContain('translate(24 24) rotate(45)');
    expect(answer.tileSvg).toContain('translate(24 24) rotate(45)');
    expect(exportPattern({...base,size:.5,rotation:45}).tileSvg).toBe(answer.tileSvg);
  });
  it('makes useful CSS for stripes, dots and checks',()=>{
    for(const style of ['stripes','dots','checks'] as const){const result=stripes({...base,style,width:8,angle:30});expect(result.css).toContain('background-image:');expect(result.css).toContain(`background-size: ${style==='stripes'?'auto':'48px 48px'};`);}
    expect(stripes({...base,style:'stripes',width:8,angle:30}).image).toContain('repeating-linear-gradient(30deg');
  });
  it('rejects invalid colors, oversized complexity and nonfinite numbers',()=>{
    expect(()=>tile({...base,foreground:'url(x)',size:.5,rotation:0})).toThrow(InputError);
    expect(()=>tile({...base,tileSize:257,size:.5,rotation:0})).toThrow(InputError);
    expect(()=>stripes({...base,style:'dots',width:Infinity,angle:0})).toThrow(InputError);
  });
});

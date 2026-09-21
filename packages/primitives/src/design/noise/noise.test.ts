import {describe,expect,it} from 'vitest';
import {grain,gradient,texture} from './index';
import {InputError} from '../../operation';
const base={seed:12345,intensity:.3,foreground:'#1a1a17',background:'#f4f1ea'};
describe('Noise operations',()=>{
  it('embeds a seeded filter source in complete grain SVG',()=>{
    const result=grain({...base,frequency:.6});
    expect(result.svg).toContain('seed="12345"');
    expect(result.svg).toContain('<filter id="noise"');
    expect(result.svg).toContain('filter="url(#noise)"');
    expect(grain({...base,frequency:.6})).toEqual(result);
  });
  it('applies actual noise over an sRGB gradient and embeds it in CSS',()=>{
    const result=gradient({...base,angle:45,frequency:.35});
    expect(result.noiseApplied).toBe(true);expect(result.svg).toContain('<feTurbulence');
    const encoded=result.css.match(/url\("data:image\/svg\+xml,(.*)"\);/)?.[1];
    expect(decodeURIComponent(encoded!)).toBe(result.svg);
    expect(result.fallback).toContain('linear-gradient(45deg');
  });
  it('uses one texture SVG model with explicit size and preset recipe',()=>{
    const result=texture({...base,preset:'paper',size:256});
    expect(result.size).toBe(256);expect(result.frequency).toBe(.11);
    expect(result.svg).toContain('width="256"');
    expect(texture({...base,preset:'paper',size:256})).toEqual(result);
  });
  it('rejects invalid colors, presets and size caps',()=>{
    expect(()=>grain({...base,foreground:'url(x)',frequency:.5})).toThrow(InputError);
    expect(()=>gradient({...base,angle:Infinity,frequency:.5})).toThrow(InputError);
    expect(()=>texture({...base,preset:'paper',size:1025})).toThrow(InputError);
  });
});

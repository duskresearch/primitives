import {describe,expect,it} from 'vitest';
import {blur,elevation,shadow} from './index';
import {InputError} from '../../operation';
const base={foreground:'#1a1a17',background:'#f4f1ea',angle:0,softness:.5};
describe('Light operations',()=>{
  it('makes shadow offsets opposite a light angle and CSS from the same layers',()=>{
    const result=shadow({...base,elevation:10,opacity:.4,layers:2});
    expect(result.layers[1].x).toBe(-10);expect(Math.abs(result.layers[1].y)).toBeLessThan(.01);
    expect(result.css).toContain(`${result.layers[1].x}px ${result.layers[1].y}px ${result.layers[1].blur}px`);
  });
  it('uses consistent shadow parameters for a ladder',()=>{
    const result=elevation({...base,levels:5,step:3,opacity:.35});
    expect(result.levels).toHaveLength(5);expect(result.levels[4].height).toBe(15);
    expect(result.css).toContain('--elevation-5:');
    expect(result.levels[0].css).toBe(shadow({...base,elevation:3,opacity:.35,layers:3}).css);
  });
  it('computes only the named sample composite contrast and fallback',()=>{
    const clear=blur({...base,radius:0,alpha:1});
    expect(clear.contrast).toBeGreaterThan(10);expect(clear.fallback).toBe('background-color: #f4f1ea;');
    expect(clear.css).toContain('backdrop-filter: blur(0px)');
    expect(blur({...base,radius:20,alpha:0}).composite).toBe('rgb(216 212 201)');
  });
  it('rejects invalid colors and nonfinite values',()=>{
    expect(()=>shadow({...base,foreground:'url(x)',elevation:10,opacity:.3,layers:3})).toThrow(InputError);
    expect(()=>shadow({...base,elevation:Infinity,opacity:.3,layers:3})).toThrow(InputError);
    expect(()=>blur({...base,radius:41,alpha:.5})).toThrow(InputError);
  });
});

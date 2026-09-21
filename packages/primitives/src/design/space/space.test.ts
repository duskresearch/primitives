import {describe,expect,it} from 'vitest';
import {inset,scale,shorthand,tokens} from './index';
import {InputError} from '../../operation';
const settings={base:8,mode:'linear' as const,ratio:1.25,steps:4,root:16};
describe('Space operations',()=>{
  it('creates monotonic linear and modular ramps with explicit rounding',()=>{
    expect(scale(settings).values).toEqual([{name:'space-1',pixels:8,rem:.5},{name:'space-2',pixels:16,rem:1},{name:'space-3',pixels:24,rem:1.5},{name:'space-4',pixels:32,rem:2}]);
    expect(scale({...settings,mode:'modular'}).values.map(v=>v.pixels)).toEqual([8,10,12.5,15.63]);
    const edge=scale({...settings,base:1,ratio:1.05,mode:'modular',steps:12});
    expect(edge.values.every((v,i)=>i===0||v.pixels>edge.values[i-1].pixels)).toBe(true);
  });
  it('reduces physical-side CSS shorthands correctly',()=>{
    expect(shorthand({top:8,right:8,bottom:8,left:8})).toBe('8px');
    expect(shorthand({top:8,right:16,bottom:8,left:16})).toBe('8px 16px');
    expect(shorthand({top:8,right:16,bottom:24,left:16})).toBe('8px 16px 24px');
    expect(shorthand({top:8,right:16,bottom:24,left:32})).toBe('8px 16px 24px 32px');
    expect(inset({padding:{top:0,right:0,bottom:0,left:0},margin:{top:-8,right:0,bottom:-8,left:0}}).margin).toBe('-8px 0px');
  });
  it('exports exactly the Scale values in every format',()=>{
    const ramp=scale(settings);
    for(const format of ['css','json','tailwind3'] as const){
      const exported=tokens({...settings,format});
      expect(exported.values).toEqual(ramp.values);
      for(const value of ramp.values)expect(exported.code).toContain(`${value.pixels}px`);
    }
    expect(JSON.parse(tokens({...settings,format:'json'}).code).spacing['3']).toBe('24px');
  });
  it('rejects invalid and nonfinite values',()=>{
    expect(()=>scale({...settings,base:Infinity})).toThrow(InputError);
    expect(()=>scale({...settings,steps:2})).toThrow(InputError);
    expect(()=>inset({padding:{top:-1,right:0,bottom:0,left:0},margin:{top:0,right:0,bottom:0,left:0}})).toThrow(InputError);
  });
});

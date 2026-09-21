import {describe,expect,it} from 'vitest';
import {dice,generator,range,seed,shuffle,unbiased,uuid} from './index';
import {InputError} from '../../operation';
describe('Random operations',()=>{
  it('repeats a named seeded sequence including seed zero',()=>{
    expect(seed({seed:0,count:3}).values).toEqual(seed({seed:0,count:3}).values);
    expect(seed({seed:1,count:3}).values).not.toEqual(seed({seed:2,count:3}).values);
    expect(generator(1)()).toBe(seed({seed:1,count:1}).values[0]);
  });
  it('uses rejection rather than modulo for inclusive range mapping',()=>{
    const samples=[0xffffffff,8],next=()=>samples.shift()!;
    expect(unbiased(next,1,10)).toBe(9); // rejects the first candidate, then maps 8
    expect(range({seed:5,lower:7,upper:7}).value).toBe(7);
    expect(()=>range({seed:5,lower:10,upper:1})).toThrow(InputError);
  });
  it('keeps dice bounds and a sum of actual rolls',()=>{
    const result=dice({seed:12345,count:50,sides:20});
    expect(result.rolls).toHaveLength(50);
    expect(result.rolls.every(n=>n>=1&&n<=20)).toBe(true);
    expect(result.total).toBe(result.rolls.reduce((a,b)=>a+b,0));
    expect(result.maximum).toBe(1000);
  });
  it('shuffles preserving duplicates and Unicode, ignoring blank lines',()=>{
    const result=shuffle({seed:9,text:'🟣\nalpha\n\nalpha\n漢字'});
    expect(result.items.slice().sort()).toEqual(['🟣','alpha','alpha','漢字'].sort());
    expect(shuffle({seed:9,text:'🟣\nalpha\n\nalpha\n漢字'})).toEqual(result);
  });
  it('sets RFC 9562 version and variant bits for v4 and v7',()=>{
    const bytes=Array.from({length:16},(_,i)=>i);
    expect(uuid({version:4,bytes}).value).toBe('00010203-0405-4607-8809-0a0b0c0d0e0f');
    expect(uuid({version:7,bytes,timestamp:0}).value).toBe('00000000-0000-7607-8809-0a0b0c0d0e0f');
    expect(uuid({version:7,bytes,timestamp:2**48-1}).value.slice(0,13)).toBe('ffffffff-ffff');
  });
  it('rejects nonfinite inputs, oversize lists and bad bytes',()=>{
    expect(()=>seed({seed:NaN,count:1})).toThrow(InputError);
    expect(()=>dice({seed:1,count:101,sides:6})).toThrow(InputError);
    expect(()=>shuffle({seed:1,text:'x'.repeat(4097)})).toThrow(InputError);
    expect(()=>uuid({version:4,bytes:Array(16).fill(256)})).toThrow(InputError);
  });
});

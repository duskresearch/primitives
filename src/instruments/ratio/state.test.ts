import {describe,expect,it} from 'vitest';
import {withoutDefaults} from '../../lib/query';
import {aspectOwn,cropOwn,defaults,parse,proportionOwn,serializeWith} from './state';
describe('Ratio URL state',()=>{
  it('round trips shared dimensions across three siblings',()=>{
    const chosen={width:640,height:480},q=new URLSearchParams(serializeWith(chosen,{preset:'portrait'}));
    expect(parse(q)).toEqual(chosen);expect(cropOwn(q).preset).toBe('portrait');
    expect(aspectOwn(q)).toMatchObject({targetWidth:16,targetHeight:9});
    expect(proportionOwn(q).name).toBe('golden');
    expect(withoutDefaults(serializeWith(defaults),serializeWith(defaults))).toBe('');
  });
  it('bounds malformed URLs',()=>{expect(parse(new URLSearchParams('width=Infinity&height=20000'))).toEqual({width:1920,height:16384});expect(cropOwn(new URLSearchParams('focalX=-2&mode=oops'))).toMatchObject({focalX:0,mode:'fill'});});
});

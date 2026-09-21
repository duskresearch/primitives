import {describe,expect,it} from 'vitest';
import {aspect,crop,proportion} from './index';
import {InputError} from '../../operation';
describe('Ratio operations',()=>{
  it('simplifies exact integer ratios and rounds a solved dimension',()=>{
    expect(aspect({width:1920,height:1080,targetWidth:4,targetHeight:5,keep:'width'})).toMatchObject({current:{width:16,height:9},target:{width:4,height:5},solved:{width:1920,height:2400},css:'aspect-ratio: 4 / 5;'});
    expect(aspect({width:101,height:100,targetWidth:16,targetHeight:9,keep:'height'}).solved.width).toBe(178);
  });
  it('distinguishes symbolic ratios from rounded frame dimensions',()=>{
    const golden=proportion({width:1000,height:600,name:'golden',keep:'width'});
    expect(golden.symbol).toBe('(1 + √5) / 2');expect(golden.solved.height).toBe(618);
    expect(proportion({width:600,height:400,name:'threeTwo',keep:'height'}).solved.width).toBe(600);
  });
  it('uses one crop transform for rectangle, area and CSS position',()=>{
    const filled=crop({width:1920,height:1080,preset:'square',mode:'fill',focalX:.5,focalY:.5});
    expect(filled.rect.x).toBeCloseTo(420);
    expect(filled.rect.y).toBeCloseTo(0);
    expect(filled.rect.width).toBeCloseTo(1080);
    expect(filled.rect.height).toBeCloseTo(1080);
    expect(filled.visiblePercent).toBeCloseTo(56.25);
    expect(filled.css).toContain('object-position: 50% 50%');
    expect(filled.svg).toContain(`translate(${filled.transform.offsetX} ${filled.transform.offsetY}) scale(${filled.transform.factor})`);
    expect(crop({width:1920,height:1080,preset:'square',mode:'fit',focalX:.1,focalY:.9}).visiblePercent).toBe(100);
  });
  it('rejects invalid sizes, selections and out-of-bounds solves',()=>{
    expect(()=>aspect({width:0,height:100,targetWidth:1,targetHeight:1,keep:'width'})).toThrow(InputError);
    expect(()=>proportion({width:100,height:16384,name:'root3',keep:'height'})).toThrow(InputError);
    expect(()=>crop({width:100,height:100,preset:'square',mode:'fill',focalX:Infinity,focalY:.5})).toThrow(InputError);
  });
});

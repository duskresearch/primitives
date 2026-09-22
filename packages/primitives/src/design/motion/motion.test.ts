import { describe, expect, it } from 'vitest';
import { bezierAt, duration, ease, exportMotion, sampleSpring, settleSpring, spring, springAt, stagger, type Curve } from './index';
import { InputError } from '../../operation';

const bezier:Extract<Curve,{kind:'bezier'}>={kind:'bezier',x1:.25,y1:.1,x2:.25,y2:1};
describe('Motion operations',()=>{
  it('inverts Bézier time and keeps exact endpoints',()=>{
    expect(bezierAt(bezier,0)).toBe(0);expect(bezierAt(bezier,1)).toBe(1);
    expect(bezierAt(bezier,.5)).toBeCloseTo(.8024,3);
    expect(bezierAt({...bezier,x1:0,y1:0,x2:1,y2:1},.37)).toBeCloseTo(.37,5);
    expect(ease({curve:bezier,duration:300}).samples).toHaveLength(41);
  });
  it('solves each damping regime from the same initial conditions',()=>{
    for(const damping of [4,20,40]){
      const c:Extract<Curve,{kind:'spring'}>={kind:'spring',mass:1,stiffness:100,damping,velocity:2};
      expect(springAt(c,0).position).toBeCloseTo(0,8);
      expect(springAt(c,0).speed).toBeCloseTo(2,8);
      expect(springAt(c,10).position).toBeCloseTo(1,3);
    }
  });
  it('reports nonsettlement and bounded sampled CSS',()=>{
    const c:Extract<Curve,{kind:'spring'}>={kind:'spring',mass:1,stiffness:170,damping:26,velocity:0};
    expect(settleSpring(c).settled).toBe(true);
    const result=spring({curve:c});
    expect(result.points.length).toBeLessThanOrEqual(256);
    expect(result.css).toMatch(/^linear\(/);
    expect(result.maxError).toBeLessThanOrEqual(result.threshold);
    expect(settleSpring({...c,damping:.01}).settled).toBe(false);
    expect(sampleSpring(c,.5).points[0]).toEqual({at:0,value:0});
  });
  it('bounds the duration heuristic and orders stagger starts',()=>{
    expect(duration({distance:0,size:'medium'}).ms).toBe(140);
    expect(duration({distance:400,size:'medium'}).ms).toBe(320);
    expect(stagger({count:3,interval:50,duration:300,order:'end'})).toMatchObject({starts:[100,50,0],total:400});
    expect(stagger({count:5,interval:20,duration:300,order:'center'}).starts).toEqual([60,20,0,40,80]);
  });
  it('maps supported exports while noting runtime spring differences',()=>{
    expect(exportMotion({curve:bezier,duration:300,target:'motion'}).code).toContain('duration: 0.3');
    expect(exportMotion({curve:bezier,duration:300,target:'swiftui'}).code).toContain('.timingCurve(0.25, 0.1, 0.25, 1');
    const c:Extract<Curve,{kind:'spring'}>={kind:'spring',mass:1,stiffness:170,damping:26,velocity:0};
    expect(exportMotion({curve:c,duration:300,target:'swiftui'}).note).toContain('runtime settling may differ');
  });
  it('marks a 10-second CSS sample that has not settled, without conflating approximation error',()=>{
    const c:Extract<Curve,{kind:'spring'}>={kind:'spring',mass:1,stiffness:1,damping:100,velocity:0};
    const result=exportMotion({curve:c,duration:300,target:'css'});
    expect(springAt(c,10).position).toBeLessThan(.1);
    expect(result.note).toMatch(/not settled|unsettled/i);
    expect(result.code).not.toContain('transition-timing-function');
    expect(result.available).toBe(false);
    expect(result.note).toContain('approximation target');
  });
  it('emits the documented SwiftUI spring initializer',()=>{
    const c:Extract<Curve,{kind:'spring'}>={kind:'spring',mass:1,stiffness:170,damping:26,velocity:2};
    const result=exportMotion({curve:c,duration:300,target:'swiftui'});
    expect(result.code).toContain('.interpolatingSpring(mass: 1, stiffness: 170, damping: 26, initialVelocity: 2)');
    expect(result.code).not.toContain('linear(');
  });
  it('rejects invalid and nonfinite inputs',()=>{
    expect(()=>bezierAt({...bezier,x1:NaN},.5)).toThrow(InputError);
    expect(()=>springAt({kind:'spring',mass:0,stiffness:100,damping:20,velocity:0},1)).toThrow(InputError);
    expect(()=>duration({distance:Infinity,size:'small'})).toThrow(InputError);
    expect(()=>stagger({count:31,interval:0,duration:300,order:'start'})).toThrow(InputError);
  });
});

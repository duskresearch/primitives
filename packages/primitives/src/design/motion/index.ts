import { InputError } from '../../operation';

export type Curve = { kind: 'bezier'; x1: number; y1: number; x2: number; y2: number } | { kind: 'spring'; mass: number; stiffness: number; damping: number; velocity: number };
export type MotionInput = { curve: Curve; duration: number };
export const DEFAULT_CURVE: Curve = { kind: 'bezier', x1: .25, y1: .1, x2: .25, y2: 1 };
const finite = (n: number, name: string, min: number, max: number) => { if (!Number.isFinite(n) || n < min || n > max) throw new InputError(`${name} must be between ${min} and ${max}.`); return n; };
export function validateCurve(curve: Curve): Curve {
  if (!curve || typeof curve !== 'object') throw new InputError('Choose a curve.');
  if (curve.kind === 'bezier') {
    finite(curve.x1, 'x1', 0, 1); finite(curve.x2, 'x2', 0, 1); finite(curve.y1, 'y1', -2, 3); finite(curve.y2, 'y2', -2, 3);
  } else if (curve.kind === 'spring') {
    finite(curve.mass, 'Mass', .01, 100); finite(curve.stiffness, 'Stiffness', .01, 1000);
    finite(curve.damping, 'Damping', .01, 1000); finite(curve.velocity, 'Velocity', -100, 100);
  } else throw new InputError('Curve must be bezier or spring.');
  return curve;
}
const fmt = (n: number) => Number(n.toFixed(5)).toString();
const poly = (t: number, a: number, b: number) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t * t * b + t ** 3;
const derivative = (t: number, a: number, b: number) => 3 * (1 - t) ** 2 * a + 6 * (1 - t) * t * (b - a) + 3 * t * t * (1 - b);

/** CSS cubic-bezier: invert x(t), then evaluate y(t). y can overshoot. */
export function bezierAt(curve: Extract<Curve, {kind:'bezier'}>, progress: number): number {
  validateCurve(curve); finite(progress, 'Progress', 0, 1);
  if (progress === 0 || progress === 1) return progress;
  let t = progress;
  for (let i = 0; i < 8; i++) {
    const dx = poly(t, curve.x1, curve.x2) - progress;
    if (Math.abs(dx) < 1e-8) break;
    const slope = derivative(t, curve.x1, curve.x2);
    if (slope < 1e-7) break;
    t = Math.max(0, Math.min(1, t - dx / slope));
  }
  let lo = 0, hi = 1;
  for (let i = 0; i < 35 && Math.abs(poly(t, curve.x1, curve.x2) - progress) > 1e-8; i++) {
    if (poly(t, curve.x1, curve.x2) < progress) lo = t; else hi = t;
    t = (lo + hi) / 2;
  }
  return poly(t, curve.y1, curve.y2);
}

/** Unit displacement from target and velocity, seconds as the time unit. */
export function springAt(curve: Extract<Curve, {kind:'spring'}>, seconds: number): {position:number; speed:number} {
  validateCurve(curve); finite(seconds, 'Time', 0, 60);
  const w = Math.sqrt(curve.stiffness / curve.mass), a = curve.damping / (2 * curve.mass);
  const v = curve.velocity;
  let x: number, dx: number;
  if (a < w - 1e-8) {
    const d = Math.sqrt(w*w-a*a), b = (a-v)/d, e = Math.exp(-a*seconds), c = Math.cos(d*seconds), s = Math.sin(d*seconds);
    x = e * (-c - b*s);
    dx = e * ((a-b*d)*c + (a*b+d)*s);
  } else if (a > w + 1e-8) {
    const d = Math.sqrt(a*a-w*w), r1 = -a+d, r2 = -a-d;
    const c1 = (v+r2)/(r1-r2), c2 = -1-c1;
    x = c1*Math.exp(r1*seconds)+c2*Math.exp(r2*seconds);
    dx = c1*r1*Math.exp(r1*seconds)+c2*r2*Math.exp(r2*seconds);
  } else {
    const b = a-v, e = Math.exp(-a*seconds);
    x = (-1-b*seconds)*e;
    dx = (a-b+a*b*seconds)*e;
  }
  return {position: 1+x, speed: dx};
}
export const springTolerance = { position: .001, speed: .001, maxSeconds: 10 };
export function settleSpring(curve: Extract<Curve, {kind:'spring'}>): {seconds:number; settled:boolean} {
  validateCurve(curve);
  // A fixed scan followed by a full trailing hold rules out an early zero crossing.
  let lastOutside = 0;
  for (let i=0; i<=2000; i++) {
    const t=i*.005, s=springAt(curve,t);
    if (Math.abs(1-s.position)>springTolerance.position || Math.abs(s.speed)>springTolerance.speed) lastOutside=t;
  }
  if (lastOutside>=springTolerance.maxSeconds-.005) return {seconds:10,settled:false};
  return {seconds:Math.max(.005,Number((lastOutside+.005).toFixed(3))),settled:true};
}
export function sampleSpring(curve: Extract<Curve,{kind:'spring'}>, seconds: number, threshold=.002): {points:{at:number;value:number}[]; maxError:number; capped:boolean} {
  validateCurve(curve); finite(seconds,'Duration',.001,10); finite(threshold,'Error threshold',.0001,.1);
  const at=(t:number)=>springAt(curve,t*seconds).position;
  const naturalFrequency=Math.sqrt(curve.stiffness/curve.mass)/(2*Math.PI);
  const segments=Math.min(128,Math.max(8,Math.ceil(naturalFrequency*seconds*8)));
  let points=Array.from({length:segments+1},(_,i)=>({at:i/segments,value:at(i/segments)}));
  let maxError=Infinity;
  for (;;) {
    const next=[points[0]]; maxError=0; let inserted=false;
    for (let i=1;i<points.length;i++) {
      const left=points[i-1],right=points[i],mid=(left.at+right.at)/2;
      const linearAt=(fraction:number)=>left.value+(right.value-left.value)*fraction;
      const err=Math.max(...[.25,.5,.75].map(fraction=>Math.abs(at(left.at+(right.at-left.at)*fraction)-linearAt(fraction))));
      if(err>maxError) maxError=err;
      if(err>threshold && next.length+(points.length-i)<256 && right.at-left.at>1/65536) {next.push({at:mid,value:at(mid)});inserted=true;}
      next.push(right);
    }
    if(!inserted) return {points:next,maxError,capped:maxError>threshold};
    points=next;
  }
}
export const bezierCSS=(curve:Extract<Curve,{kind:'bezier'}>)=>{validateCurve(curve);return `cubic-bezier(${fmt(curve.x1)}, ${fmt(curve.y1)}, ${fmt(curve.x2)}, ${fmt(curve.y2)})`;};
export const linearCSS=(points:{at:number;value:number}[])=>`linear(${points.map(p=>`${fmt(p.value)} ${fmt(p.at*100)}%`).join(', ')})`;
export function ease(input: MotionInput & {samples?:number}) {
  validateCurve(input.curve); if(input.curve.kind!=='bezier') throw new InputError('Ease needs a cubic-bezier curve.');
  finite(input.duration,'Duration',1,5000);
  const count=finite(input.samples??41,'Samples',2,101);
  if(!Number.isInteger(count)) throw new InputError('Samples must be an integer.');
  return {css:bezierCSS(input.curve),duration:input.duration,samples:Array.from({length:count},(_,i)=>({at:i/(count-1),value:bezierAt(input.curve as Extract<Curve,{kind:'bezier'}>,i/(count-1))}))};
}
export function spring(input: {curve:Curve}) {
  validateCurve(input.curve);if(input.curve.kind!=='spring')throw new InputError('Spring needs mass, stiffness and damping.');
  const settling=settleSpring(input.curve), sampled=sampleSpring(input.curve,settling.seconds);
  return {...settling,...sampled,threshold:.002,css:linearCSS(sampled.points),duration:Math.round(settling.seconds*1000)};
}
export function duration(input:{distance:number;size:'small'|'medium'|'large'}) {
  finite(input.distance,'Distance',0,2000);
  const factor={small:.88,medium:1,large:1.15}[input.size];
  if(!factor)throw new InputError('Size must be small, medium or large.');
  // A design heuristic, not a platform formula. Root growth avoids long travel feeling glacial.
  const ms=Math.round(Math.max(100,Math.min(800,(140+9*Math.sqrt(input.distance))*factor))/5)*5;
  return {ms,css:`${ms}ms`,method:'140 + 9 × √distance, size-adjusted and clamped to 100–800 ms'};
}
export function stagger(input:{count:number;interval:number;duration:number;order:'start'|'end'|'center'}) {
  finite(input.count,'Count',1,30);if(!Number.isInteger(input.count))throw new InputError('Count must be an integer.');
  finite(input.interval,'Interval',0,500);finite(input.duration,'Duration',1,5000);
  if(!['start','end','center'].includes(input.order))throw new InputError('Order must be start, end or center.');
  const indices=Array.from({length:input.count},(_,i)=>i);
  if(input.order==='end')indices.reverse();
  if(input.order==='center')indices.sort((a,b)=>Math.abs(a-(input.count-1)/2)-Math.abs(b-(input.count-1)/2)||a-b);
  const starts=Array(input.count).fill(0) as number[];
  indices.forEach((idx,order)=>starts[idx]=order*input.interval);
  return {starts,total:(input.count-1)*input.interval+input.duration,css:starts.map((ms,i)=>`.item:nth-child(${i+1}) { animation-delay: ${fmt(ms)}ms; }`).join('\n')};
}
export function exportMotion(input:MotionInput & {target:'css'|'motion'|'swiftui'}) {
  validateCurve(input.curve);finite(input.duration,'Duration',1,5000);
  if(!['css','motion','swiftui'].includes(input.target))throw new InputError('Unknown export target.');
  if(input.curve.kind==='bezier') {
    const c=input.curve, tuple=`[${fmt(c.x1)}, ${fmt(c.y1)}, ${fmt(c.x2)}, ${fmt(c.y2)}]`;
    const code=input.target==='css'?`transition-timing-function: ${bezierCSS(c)};\ntransition-duration: ${fmt(input.duration)}ms;`:input.target==='motion'?`{ type: "tween", duration: ${fmt(input.duration/1000)}, ease: ${tuple} }`:`.timingCurve(${fmt(c.x1)}, ${fmt(c.y1)}, ${fmt(c.x2)}, ${fmt(c.y2)}, duration: ${fmt(input.duration/1000)})`;
    return {code,note:'Cubic Bézier control points and duration are preserved.',available:true};
  }
  if(input.target==='motion')return {code:`{ type: "spring", mass: ${fmt(input.curve.mass)}, stiffness: ${fmt(input.curve.stiffness)}, damping: ${fmt(input.curve.damping)}, velocity: ${fmt(input.curve.velocity)} }`,note:'Motion spring parameters map directly; runtime termination may differ.',available:true};
  if(input.target==='swiftui')return {code:`.interpolatingSpring(mass: ${fmt(input.curve.mass)}, stiffness: ${fmt(input.curve.stiffness)}, damping: ${fmt(input.curve.damping)}, initialVelocity: ${fmt(input.curve.velocity)})`,note:'SwiftUI receives the four spring parameters. Initial velocity is normalized to the animated property change; runtime settling may differ from this preview.',available:true};
  const sampled=spring({curve:input.curve});
  const approximation=`max sampled error ${fmt(sampled.maxError)}; ${sampled.capped?'approximation target unmet':'within .002 approximation target'}`;
  if(!sampled.settled)return {code:'',note:`Spring not settled by 10s (position ${fmt(springAt(input.curve,10).position)}); ${approximation}. No complete CSS transition is available.`,available:false};
  return {code:`transition-timing-function: ${sampled.css};\ntransition-duration: ${sampled.duration}ms;`,note:`Sampled spring, ${approximation}; settled within position and speed tolerance.`,available:true};
}
export const operations={ease,duration,spring,stagger,export:exportMotion};

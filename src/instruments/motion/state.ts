import type { Curve } from '@duskresearch/primitives/design/motion';

export interface MotionState {
  kind: 'bezier' | 'spring';
  x1: number; y1: number; x2: number; y2: number;
  mass: number; stiffness: number; damping: number; velocity: number;
  duration: number;
}
export const defaults: MotionState = { kind: 'bezier', x1: .25, y1: .1, x2: .25, y2: 1, mass: 1, stiffness: 170, damping: 26, velocity: 0, duration: 300 };
const number = (q: URLSearchParams, key: string, min: number, max: number, fallback: number, places = 2) => {
  const raw = q.get(key);
  if (!raw || raw.length > 24) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Number(n.toFixed(places)))) : fallback;
};
export function parse(q: URLSearchParams): MotionState {
  return {
    kind: q.get('kind') === 'spring' ? 'spring' : 'bezier',
    x1: number(q,'x1',0,1,defaults.x1), y1: number(q,'y1',-2,3,defaults.y1), x2: number(q,'x2',0,1,defaults.x2), y2: number(q,'y2',-2,3,defaults.y2),
    mass: number(q,'mass',.01,100,defaults.mass), stiffness: number(q,'stiffness',.01,1000,defaults.stiffness), damping: number(q,'damping',.01,1000,defaults.damping), velocity: number(q,'velocity',-100,100,defaults.velocity),
    duration: number(q,'duration',1,5000,defaults.duration,0),
  };
}
export function curve(s:MotionState):Curve {
  return s.kind==='bezier' ? {kind:'bezier',x1:s.x1,y1:s.y1,x2:s.x2,y2:s.y2} : {kind:'spring',mass:s.mass,stiffness:s.stiffness,damping:s.damping,velocity:s.velocity};
}
export function serialize(s:MotionState) {return `kind=${s.kind}&x1=${s.x1}&y1=${s.y1}&x2=${s.x2}&y2=${s.y2}&mass=${s.mass}&stiffness=${s.stiffness}&damping=${s.damping}&velocity=${s.velocity}&duration=${s.duration}`;}
export function serializeWith(s:MotionState, own:Record<string,string|number|boolean>={}) {return [serialize(s),...Object.entries(own).map(([k,v])=>`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)].join('&');}
export const easeOwn=(q:URLSearchParams)=>({distance:number(q,'distance',0,1000,240,0)});
export const durationOwn=(q:URLSearchParams)=>({distance:number(q,'distance',0,2000,240,0),size:(['small','medium','large'].includes(q.get('size')??'')?q.get('size'):'medium') as 'small'|'medium'|'large'});
export const staggerOwn=(q:URLSearchParams)=>({count:number(q,'count',1,30,6,0),interval:number(q,'interval',0,500,50,0),order:(['start','end','center'].includes(q.get('order')??'')?q.get('order'):'start') as 'start'|'end'|'center'});
export const exportOwn=(q:URLSearchParams)=>({target:(['css','motion','swiftui'].includes(q.get('target')??'')?q.get('target'):'css') as 'css'|'motion'|'swiftui'});

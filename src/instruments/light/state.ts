import tokens from '../../data/tokens.json';
export interface LightState {foreground:string;background:string;angle:number;softness:number}
export const defaults:LightState={foreground:tokens.color.ink,background:tokens.color.paper,angle:315,softness:.5};
const number=(q:URLSearchParams,key:string,fallback:number,min:number,max:number,places=2)=>{const raw=q.get(key);if(!raw||raw.length>24)return fallback;const n=Number(raw);return Number.isFinite(n)?Math.min(max,Math.max(min,Number(n.toFixed(places)))):fallback;};
const hex=(raw:string|null,fallback:string)=>/^#?[0-9a-f]{6}$/i.test(raw??'')?`#${raw!.replace('#','').toLowerCase()}`:fallback;
export const parse=(q:URLSearchParams):LightState=>({foreground:hex(q.get('foreground'),defaults.foreground),background:hex(q.get('background'),defaults.background),angle:number(q,'angle',defaults.angle,0,360,0),softness:number(q,'softness',defaults.softness,0,1)});
export const serialize=(s:LightState)=>`foreground=${encodeURIComponent(s.foreground)}&background=${encodeURIComponent(s.background)}&angle=${s.angle}&softness=${s.softness}`;
export const serializeWith=(s:LightState,own:Record<string,string|number|boolean>={})=>[serialize(s),...Object.entries(own).map(([k,v])=>`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)].join('&');
export const shadowOwn=(q:URLSearchParams)=>({elevation:number(q,'elevation',12,0,24),opacity:number(q,'opacity',.35,0,1),layers:number(q,'layers',3,1,5,0)});
export const elevationOwn=(q:URLSearchParams)=>({levels:number(q,'levels',5,3,8,0),step:number(q,'step',3,1,3,0),opacity:number(q,'opacity',.35,0,1)});
export const blurOwn=(q:URLSearchParams)=>({radius:number(q,'radius',16,0,40,0),alpha:number(q,'alpha',.72,0,1)});

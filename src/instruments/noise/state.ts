import tokens from '../../data/tokens.json';
export interface NoiseState {seed:number;intensity:number;foreground:string;background:string}
export const defaults:NoiseState={seed:12345,intensity:.3,foreground:tokens.color.ink,background:tokens.color.paper};
const number=(q:URLSearchParams,key:string,fallback:number,min:number,max:number,places=0)=>{const raw=q.get(key);if(!raw||raw.length>24)return fallback;const n=Number(raw);return Number.isFinite(n)?Math.min(max,Math.max(min,Number(n.toFixed(places)))):fallback;};
const hex=(raw:string|null,fallback:string)=>/^#?[0-9a-f]{6}$/i.test(raw??'')?`#${raw!.replace('#','').toLowerCase()}`:fallback;
export const parse=(q:URLSearchParams):NoiseState=>({seed:number(q,'seed',12345,0,4294967295),intensity:number(q,'intensity',.3,0,1,2),foreground:hex(q.get('foreground'),defaults.foreground),background:hex(q.get('background'),defaults.background)});
export const serialize=(s:NoiseState)=>`seed=${s.seed}&intensity=${s.intensity}&foreground=${encodeURIComponent(s.foreground)}&background=${encodeURIComponent(s.background)}`;
export const serializeWith=(s:NoiseState,own:Record<string,string|number|boolean>={})=>[serialize(s),...Object.entries(own).map(([k,v])=>`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)].join('&');
export const grainOwn=(q:URLSearchParams)=>({frequency:number(q,'frequency',.6,.01,1,2)});
export const gradientOwn=(q:URLSearchParams)=>({angle:number(q,'angle',45,0,360,0),frequency:number(q,'frequency',.35,.01,1,2)});
export const textureOwn=(q:URLSearchParams)=>({preset:(['grain','paper','clouds'].includes(q.get('preset')??'')?q.get('preset'):'paper') as 'grain'|'paper'|'clouds',size:number(q,'size',256,64,1024)});

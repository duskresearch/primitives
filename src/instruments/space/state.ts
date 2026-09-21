export interface SpaceState {base:number;mode:'linear'|'modular';ratio:number;steps:number;root:number}
export const defaults:SpaceState={base:8,mode:'linear',ratio:1.25,steps:8,root:16};
const num=(q:URLSearchParams,key:string,fallback:number,min:number,max:number,places=0)=>{
  const raw=q.get(key);if(!raw||raw.length>24)return fallback;
  const n=Number(raw);return Number.isFinite(n)?Math.min(max,Math.max(min,Number(n.toFixed(places)))):fallback;
};
export const parse=(q:URLSearchParams):SpaceState=>({base:num(q,'base',8,1,64),mode:q.get('mode')==='modular'?'modular':'linear',ratio:num(q,'ratio',1.25,1.05,2,2),steps:num(q,'steps',8,3,12),root:num(q,'root',16,8,32)});
export const serialize=(s:SpaceState)=>`base=${s.base}&mode=${s.mode}&ratio=${s.ratio}&steps=${s.steps}&root=${s.root}`;
export const serializeWith=(s:SpaceState,own:Record<string,string|number|boolean>={})=>[serialize(s),...Object.entries(own).map(([k,v])=>`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)].join('&');
export type SideState={pt:number;pr:number;pb:number;pl:number;mt:number;mr:number;mb:number;ml:number};
export const insetDefaults:SideState={pt:16,pr:16,pb:16,pl:16,mt:8,mr:8,mb:8,ml:8};
export const insetOwn=(q:URLSearchParams):SideState=>({pt:num(q,'pt',16,0,256),pr:num(q,'pr',16,0,256),pb:num(q,'pb',16,0,256),pl:num(q,'pl',16,0,256),mt:num(q,'mt',8,-256,256),mr:num(q,'mr',8,-256,256),mb:num(q,'mb',8,-256,256),ml:num(q,'ml',8,-256,256)});
export const tokenOwn=(q:URLSearchParams)=>({format:(['css','json','tailwind3'].includes(q.get('format')??'')?q.get('format'):'css') as 'css'|'json'|'tailwind3'});

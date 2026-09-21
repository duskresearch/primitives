import tokens from '../../data/tokens.json';
export interface IconState {exemplar:'square'|'circle'|'triangle';size:16|20|24|32|48;stroke:number;foreground:string}
export const defaults:IconState={exemplar:'square',size:24,stroke:2,foreground:tokens.color.ink};
const number=(q:URLSearchParams,key:string,fallback:number,min:number,max:number,places=0)=>{const raw=q.get(key);if(!raw||raw.length>24)return fallback;const n=Number(raw);return Number.isFinite(n)?Math.min(max,Math.max(min,Number(n.toFixed(places)))):fallback;};
const hex=(raw:string|null,fallback:string)=>/^#?[0-9a-f]{6}$/i.test(raw??'')?`#${raw!.replace('#','').toLowerCase()}`:fallback;
export const parse=(q:URLSearchParams):IconState=>({exemplar:(['square','circle','triangle'].includes(q.get('exemplar')??'')?q.get('exemplar'):'square') as IconState['exemplar'],size:([16,20,24,32,48].includes(Number(q.get('size')))?Number(q.get('size')):24) as IconState['size'],stroke:number(q,'stroke',2,.5,4,1),foreground:hex(q.get('foreground'),defaults.foreground)});
export const serialize=(s:IconState)=>`exemplar=${s.exemplar}&size=${s.size}&stroke=${s.stroke}&foreground=${encodeURIComponent(s.foreground)}`;
export const serializeWith=(s:IconState,own:Record<string,string|number|boolean>={})=>[serialize(s),...Object.entries(own).map(([k,v])=>`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)].join('&');
export const gridOwn=(q:URLSearchParams,size:number)=>({padding:number(q,'padding',2,0,Math.floor(size/4),1),guides:q.get('guides')==='false'?false:true});
export const strokeOwn=(q:URLSearchParams)=>({padding:number(q,'padding',2,0,6,1)});
export const opticalOwn=(q:URLSearchParams,size:number)=>({padding:number(q,'padding',2,0,Math.floor(size/4),1),scale:number(q,'scale',1,.8,1.2,2),offsetX:number(q,'offsetX',0,-3,3,1),offsetY:number(q,'offsetY',0,-3,3,1)});

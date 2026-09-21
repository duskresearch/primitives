export interface RatioState {width:number;height:number}
export const defaults:RatioState={width:1920,height:1080};
const num=(q:URLSearchParams,key:string,fallback:number,min:number,max:number,places=0)=>{const raw=q.get(key);if(!raw||raw.length>24)return fallback;const value=Number(raw);return Number.isFinite(value)?Math.min(max,Math.max(min,Number(value.toFixed(places)))):fallback;};
export const parse=(q:URLSearchParams):RatioState=>({width:num(q,'width',1920,1,16384),height:num(q,'height',1080,1,16384)});
export const serialize=(s:RatioState)=>`width=${s.width}&height=${s.height}`;
export const serializeWith=(s:RatioState,own:Record<string,string|number|boolean>={})=>[serialize(s),...Object.entries(own).map(([k,v])=>`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)].join('&');
const keep=(q:URLSearchParams)=>q.get('keep')==='height'?'height' as const:'width' as const;
export const aspectOwn=(q:URLSearchParams)=>({targetWidth:num(q,'targetWidth',16,1,1000),targetHeight:num(q,'targetHeight',9,1,1000),keep:keep(q)});
export const proportionOwn=(q:URLSearchParams)=>({name:(['golden','square','root2','root3','threeTwo','fourThree'].includes(q.get('name')??'')?q.get('name'):'golden') as 'golden'|'square'|'root2'|'root3'|'threeTwo'|'fourThree',keep:keep(q)});
export const cropOwn=(q:URLSearchParams)=>({preset:(['square','portrait','story','landscape'].includes(q.get('preset')??'')?q.get('preset'):'square') as 'square'|'portrait'|'story'|'landscape',mode:q.get('mode')==='fit'?'fit' as const:'fill' as const,focalX:num(q,'focalX',.5,0,1,2),focalY:num(q,'focalY',.5,0,1,2)});

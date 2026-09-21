import tokens from '../../data/tokens.json';
export interface PatternState {motif:'circle'|'square'|'triangle';tileSize:number;foreground:string;background:string}
export const defaults:PatternState={motif:'circle',tileSize:48,foreground:tokens.color.ink,background:tokens.color.paper};
const number=(q:URLSearchParams,key:string,fallback:number,min:number,max:number,places=0)=>{const raw=q.get(key);if(!raw||raw.length>24)return fallback;const value=Number(raw);return Number.isFinite(value)?Math.min(max,Math.max(min,Number(value.toFixed(places)))):fallback;};
const color=(raw:string|null,fallback:string)=>/^#?[0-9a-f]{6}$/i.test(raw??'')?`#${raw!.replace('#','').toLowerCase()}`:fallback;
export const parse=(q:URLSearchParams):PatternState=>({motif:(['circle','square','triangle'].includes(q.get('motif')??'')?q.get('motif'):'circle') as PatternState['motif'],tileSize:number(q,'tileSize',48,8,256),foreground:color(q.get('foreground'),defaults.foreground),background:color(q.get('background'),defaults.background)});
export const serialize=(s:PatternState)=>`motif=${s.motif}&tileSize=${s.tileSize}&foreground=${encodeURIComponent(s.foreground)}&background=${encodeURIComponent(s.background)}`;
export const serializeWith=(s:PatternState,own:Record<string,string|number|boolean>={})=>[serialize(s),...Object.entries(own).map(([k,v])=>`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)].join('&');
export const tileOwn=(q:URLSearchParams)=>({size:number(q,'size',.55,.1,.9,2),rotation:number(q,'rotation',0,0,360,0)});
export const stripesOwn=(q:URLSearchParams,tileSize:number)=>({style:(['stripes','dots','checks'].includes(q.get('style')??'')?q.get('style'):'stripes') as 'stripes'|'dots'|'checks',width:number(q,'width',Math.min(8,tileSize/2),1,Math.min(128,tileSize/2)),angle:number(q,'angle',45,0,360,0)});

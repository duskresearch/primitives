export interface RandomState {seed:number}
export const defaults:RandomState={seed:12345};
const num=(q:URLSearchParams,key:string,fallback:number,min:number,max:number)=>{const raw=q.get(key);if(!raw||raw.length>32)return fallback;const value=Number(raw);return Number.isSafeInteger(value)?Math.min(max,Math.max(min,value)):fallback;};
export const parse=(q:URLSearchParams):RandomState=>({seed:num(q,'seed',12345,0,4294967295)});
export const serialize=(s:RandomState)=>`seed=${s.seed}`;
export const serializeWith=(s:RandomState,own:Record<string,string|number|boolean>={})=>{
  const q=new URLSearchParams(serialize(s));
  for(const [key,value] of Object.entries(own))q.set(key,String(value));
  return q.toString();
};
export const seedOwn=(q:URLSearchParams)=>({count:num(q,'count',5,1,100)});
export const rangeOwn=(q:URLSearchParams)=>({lower:num(q,'lower',1,-1_000_000_000,1_000_000_000),upper:num(q,'upper',100,-1_000_000_000,1_000_000_000)});
export const diceOwn=(q:URLSearchParams)=>({count:num(q,'count',2,1,100),sides:num(q,'sides',6,2,1000)});
export const shuffleOwn=(q:URLSearchParams)=>({text:(q.get('text')??'Alpha\nBeta\nGamma').slice(0,4096)});
export const uuidOwn=(q:URLSearchParams)=>({version:q.get('version')==='7'?'7' as const:'4' as const,bytes:/^[\da-f]{32}$/i.test(q.get('bytes')??'')?(q.get('bytes') as string).toLowerCase():'000102030405060708090a0b0c0d0e0f',timestamp:num(q,'timestamp',1700000000000,0,2**48-1)});
export const bytesFromHex=(value:string)=>Array.from({length:16},(_,i)=>Number.parseInt(value.slice(i*2,i*2+2),16));
export const hexFromBytes=(bytes:Uint8Array)=>Array.from(bytes,n=>n.toString(16).padStart(2,'0')).join('');

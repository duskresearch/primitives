import {InputError} from '../../operation';
const U32=0x100000000;
const integer=(value:number,label:string,min:number,max:number)=>{
  if(!Number.isSafeInteger(value)||value<min||value>max)throw new InputError(`${label} must be an integer from ${min} to ${max}.`);
  return value;
};
/** Mulberry32 with explicit uint32 state. Reproducible, not cryptographically secure. */
export function generator(seed:number){
  integer(seed,'Seed',0,U32-1);
  let state=seed;
  return ()=>{
    state=(state+0x6D2B79F5)>>>0;
    let t=Math.imul(state^(state>>>15),1|state);
    t=(t+Math.imul(t^(t>>>7),61|t))^t;
    return (t^(t>>>14))>>>0;
  };
}
export function unbiased(next:()=>number,lower:number,upper:number){
  integer(lower,'Lower bound',-1_000_000_000,1_000_000_000);
  integer(upper,'Upper bound',-1_000_000_000,1_000_000_000);
  if(lower>upper)throw new InputError('Lower bound cannot exceed upper bound.');
  const span=upper-lower+1,limit=Math.floor(U32/span)*span;
  let candidate=next();
  while(candidate>=limit)candidate=next();
  return lower+(candidate%span);
}
export function seed(input:{seed:number;count:number}){
  integer(input.count,'Count',1,100);
  const next=generator(input.seed);
  return {algorithm:'Mulberry32',seed:input.seed,values:Array.from({length:input.count},()=>next())};
}
export function range(input:{seed:number;lower:number;upper:number}){
  const next=generator(input.seed);
  return {value:unbiased(next,input.lower,input.upper),lower:input.lower,upper:input.upper,algorithm:'Mulberry32 with rejection sampling'};
}
export function dice(input:{seed:number;count:number;sides:number}){
  integer(input.count,'Dice count',1,100);integer(input.sides,'Sides',2,1000);
  const next=generator(input.seed);
  const rolls=Array.from({length:input.count},()=>unbiased(next,1,input.sides));
  return {rolls,total:rolls.reduce((sum,n)=>sum+n,0),minimum:input.count,maximum:input.count*input.sides};
}
export function shuffle(input:{seed:number;text:string}){
  if(typeof input.text!=='string'||input.text.length>4096)throw new InputError('List text must have at most 4096 characters.');
  // Whitespace within a nonempty line is preserved; blank lines are ignored.
  const lines=input.text.replace(/\r\n?/g,'\n').split('\n').filter(line=>line.trim().length>0);
  if(lines.length<1||lines.length>100)throw new InputError('Use 1 to 100 nonblank lines.');
  const next=generator(input.seed),items=[...lines];
  for(let i=items.length-1;i>0;i--){const j=unbiased(next,0,i);[items[i],items[j]]=[items[j],items[i]];}
  return {items,text:items.join('\n'),count:items.length,blankLines:'ignored'};
}
export function uuid(input:{version:4|7;bytes:number[];timestamp?:number}){
  if(input.version!==4&&input.version!==7)throw new InputError('UUID version must be 4 or 7.');
  if(!Array.isArray(input.bytes)||input.bytes.length!==16)throw new InputError('UUID needs exactly 16 bytes.');
  const bytes=input.bytes.map((n,i)=>integer(n,`Byte ${i}`,0,255));
  if(input.version===7){
    const timestamp=integer(input.timestamp as number,'Timestamp',0,2**48-1);
    for(let i=5;i>=0;i--)bytes[i]=Math.floor(timestamp/2**(8*(5-i)))&255;
  }
  bytes[6]=(bytes[6]&15)|(input.version<<4);
  bytes[8]=(bytes[8]&63)|128;
  const hex=bytes.map(n=>n.toString(16).padStart(2,'0')).join('');
  return {value:`${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`,version:input.version,bytes};
}
export const operations={seed,range,dice,shuffle,uuid};

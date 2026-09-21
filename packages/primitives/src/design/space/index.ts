import { InputError } from '../../operation';

export interface ScaleInput {base:number; mode:'linear'|'modular'; ratio:number; steps:number; root:number}
export interface Sides {top:number;right:number;bottom:number;left:number}
const bounded=(value:number,label:string,min:number,max:number)=>{
  if(!Number.isFinite(value)||value<min||value>max)throw new InputError(`${label} must be between ${min} and ${max}.`);
  return value;
};
const px=(value:number)=>`${Number(value.toFixed(2))}px`;
export function scale(input:ScaleInput){
  bounded(input.base,'Base',1,64);bounded(input.ratio,'Ratio',1.05,2);bounded(input.steps,'Steps',3,12);bounded(input.root,'Root size',8,32);
  if(!Number.isInteger(input.steps))throw new InputError('Steps must be an integer.');
  if(!['linear','modular'].includes(input.mode))throw new InputError('Mode must be linear or modular.');
  const values=Array.from({length:input.steps},(_,i)=>{
    const raw=input.mode==='linear'?input.base*(i+1):input.base*input.ratio**i;
    const pixels=Number(raw.toFixed(2));
    return {name:`space-${i+1}`,pixels,rem:Number((pixels/input.root).toFixed(4))};
  });
  const css=`:root {\n${values.map(v=>`  --${v.name}: ${px(v.pixels)};`).join('\n')}\n}`;
  return {values,css,rounding:'Pixels round to 2 decimals; rem equivalents use those rounded pixels and 4 decimals.'};
}
export function shorthand(sides:Sides,allowNegative=false){
  for(const [side,value] of Object.entries(sides))bounded(value,side,allowNegative?-256:0,256);
  const {top,right,bottom,left}=sides;
  const values=top===bottom&&right===left?(top===right?[top]:[top,right]):right===left?[top,right,bottom]:[top,right,bottom,left];
  return values.map(px).join(' ');
}
export function inset(input:{padding:Sides;margin:Sides}){
  const padding=shorthand(input.padding),margin=shorthand(input.margin,true);
  return {padding,margin,css:`padding: ${padding};\nmargin: ${margin};`};
}
export function tokens(input:ScaleInput&{format:'css'|'json'|'tailwind3'}){
  const ramp=scale(input);
  if(!['css','json','tailwind3'].includes(input.format))throw new InputError('Format must be CSS, JSON or Tailwind CSS 3.');
  const entries=Object.fromEntries(ramp.values.map((v,i)=>[String(i+1),px(v.pixels)]));
  const code=input.format==='css'?ramp.css:input.format==='json'?JSON.stringify({spacing:entries},null,2):`// Tailwind CSS v3 tailwind.config.js\nmodule.exports = {\n  theme: { extend: { spacing: ${JSON.stringify(entries,null,2)} } }\n};`;
  return {values:ramp.values,code,format:input.format};
}
export const operations={scale,inset,tokens};

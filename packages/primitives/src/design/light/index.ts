import {InputError} from '../../operation';
export interface LightInput {foreground:string;background:string;angle:number;softness:number}
const bounded=(n:number,name:string,min:number,max:number)=>{if(!Number.isFinite(n)||n<min||n>max)throw new InputError(`${name} must be between ${min} and ${max}.`);return n;};
const color=(value:string)=>{if(typeof value!=='string'||!/^#[0-9a-f]{6}$/i.test(value))throw new InputError('Color must be a six-digit hex value.');return value.toLowerCase();};
const channels=(value:string)=>{const hex=color(value);return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));};
const rgba=(value:string,alpha:number)=>`rgb(${channels(value).join(' ')} / ${Number(alpha.toFixed(3))})`;
export function shadow(input:LightInput&{elevation:number;opacity:number;layers:number}){
  color(input.foreground);color(input.background);bounded(input.angle,'Angle',0,360);bounded(input.softness,'Softness',0,1);
  bounded(input.elevation,'Elevation',0,24);bounded(input.opacity,'Opacity',0,1);bounded(input.layers,'Layers',1,5);
  if(!Number.isInteger(input.layers))throw new InputError('Layers must be an integer.');
  const radians=(input.angle+180)*Math.PI/180;
  const layers=Array.from({length:input.layers},(_,i)=>{
    const fraction=(i+1)/input.layers;
    const distance=input.elevation*fraction;
    const x=Number((Math.cos(radians)*distance).toFixed(2));
    const y=Number((Math.sin(radians)*distance).toFixed(2));
    const blur=Number((distance*(.5+input.softness*1.5)).toFixed(2));
    const alpha=Number((input.opacity*(1-fraction*.6)/input.layers).toFixed(3));
    return {x,y,blur,alpha,color:rgba(input.foreground,alpha)};
  });
  const css=`box-shadow: ${layers.map(l=>`${l.x}px ${l.y}px ${l.blur}px 0 ${l.color}`).join(', ')};`;
  return {layers,css,model:'Artistic layered offset and blur; not a physical light simulation.'};
}
export function elevation(input:LightInput&{levels:number;step:number;opacity:number}){
  bounded(input.levels,'Levels',3,8);bounded(input.step,'Step',1,3);bounded(input.opacity,'Opacity',0,1);
  if(!Number.isInteger(input.levels)||!Number.isInteger(input.step))throw new InputError('Levels and step must be integers.');
  const levels=Array.from({length:input.levels},(_,i)=>{
    const height=(i+1)*input.step;
    const output=shadow({...input,elevation:height,opacity:input.opacity,layers:3});
    return {name:`elevation-${i+1}`,height,css:output.css};
  });
  return {levels,css:`:root {\n${levels.map(l=>`  --${l.name}: ${l.css.slice('box-shadow: '.length,-1)};`).join('\n')}\n}`};
}
const linear=(v:number)=>{const n=v/255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4;};
const luminance=(rgb:number[])=>.2126*linear(rgb[0])+.7152*linear(rgb[1])+.0722*linear(rgb[2]);
export function blur(input:LightInput&{radius:number;alpha:number}){
  color(input.foreground);color(input.background);bounded(input.angle,'Angle',0,360);bounded(input.softness,'Softness',0,1);
  bounded(input.radius,'Blur radius',0,40);bounded(input.alpha,'Alpha',0,1);
  const backdrop='#d8d4c9',back=channels(backdrop),tint=channels(input.background),text=channels(input.foreground);
  const composite=tint.map((n,i)=>n*input.alpha+back[i]*(1-input.alpha));
  const lText=luminance(text),lBack=luminance(composite);
  const contrast=(Math.max(lText,lBack)+.05)/(Math.min(lText,lBack)+.05);
  return {css:`background-color: ${rgba(input.background,input.alpha)};\nbackdrop-filter: blur(${input.radius}px);`,fallback:`background-color: ${input.background};`,contrast:Number(contrast.toFixed(2)),sampleBackdrop:backdrop,composite:`rgb(${composite.map(Math.round).join(' ')})`,text:input.foreground};
}
export const operations={shadow,elevation,blur};

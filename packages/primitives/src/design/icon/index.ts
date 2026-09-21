import {InputError} from '../../operation';
export type Exemplar='square'|'circle'|'triangle';
export interface IconInput {exemplar:Exemplar;size:16|20|24|32|48;stroke:number;foreground:string}
const sizes=[16,20,24,32,48];
const bounded=(n:number,label:string,min:number,max:number)=>{if(!Number.isFinite(n)||n<min||n>max)throw new InputError(`${label} must be between ${min} and ${max}.`);return n;};
const validate=(input:IconInput)=>{if(!sizes.includes(input.size))throw new InputError('Canvas size must be 16, 20, 24, 32 or 48.');if(!['square','circle','triangle'].includes(input.exemplar))throw new InputError('Unknown exemplar.');bounded(input.stroke,'Stroke',.5,4);if(typeof input.foreground!=='string'||!/^#[0-9a-f]{6}$/i.test(input.foreground))throw new InputError('Foreground must be six-digit hex.');};
const n=(value:number)=>Number(value.toFixed(3));
function geometry(exemplar:Exemplar,size:number,inset:number,stroke:number,color:string,effect=false){
  const common=`fill="none" stroke="${color}" stroke-width="${n(stroke)}" stroke-linejoin="round" stroke-linecap="round"${effect?' vector-effect="non-scaling-stroke"':''}`;
  const end=n(size-inset),start=n(inset),mid=n(size/2);
  if(exemplar==='circle')return `<circle cx="${mid}" cy="${mid}" r="${n(size/2-inset)}" ${common}/>`;
  if(exemplar==='square')return `<rect x="${start}" y="${start}" width="${n(size-2*inset)}" height="${n(size-2*inset)}" ${common}/>`;
  return `<path d="M${mid} ${start}L${end} ${end}L${start} ${end}Z" ${common}/>`;
}
const svg=(size:number,body:string)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${body}</svg>`;
export function grid(input:IconInput&{padding:number;guides:boolean}){
  validate(input);bounded(input.padding,'Padding',0,Math.floor(input.size/4));
  if(typeof input.guides!=='boolean')throw new InputError('Guides must be on or off.');
  const inset=Math.max(input.padding+input.stroke/2,input.stroke/2);
  const shape=geometry(input.exemplar,input.size,inset,input.stroke,input.foreground);
  const guide=`<g fill="none" stroke="#b8b4a8" stroke-width="0.5" stroke-dasharray="2 2"><rect x="${n(inset)}" y="${n(inset)}" width="${n(input.size-2*inset)}" height="${n(input.size-2*inset)}"/><circle cx="${n(input.size/2)}" cy="${n(input.size/2)}" r="${n(input.size/2-inset)}"/><path d="M${n(inset)} ${n(inset)}L${n(input.size-inset)} ${n(input.size-inset)}M${n(input.size-inset)} ${n(inset)}L${n(inset)} ${n(input.size-inset)}"/></g>`;
  return {svg:svg(input.size,(input.guides?guide:'')+shape),inset,guides:input.guides};
}
export function stroke(input:IconInput&{padding:number}){
  validate(input);bounded(input.padding,'Padding',0,6);
  const base=24;
  // Reserve enough viewBox space for the largest fixed CSS-pixel stroke at 16px.
  const inset=Math.max(input.padding+input.stroke*base/(2*16),input.stroke*base/(2*16));
  if(inset>=base/2)throw new InputError('Stroke and padding leave no drawable geometry.');
  const scaled=svg(base,geometry(input.exemplar,base,inset,input.stroke,input.foreground));
  const fixed=svg(base,geometry(input.exemplar,base,inset,input.stroke,input.foreground,true));
  const comparisons=sizes.map(size=>({size,scaled,fixed}));
  return {comparisons,scaledSvg:scaled,fixedSvg:fixed,css:`.icon { width: ${input.size}px; height: ${input.size}px; }`,inset};
}
export function optical(input:IconInput&{padding:number;scale:number;offsetX:number;offsetY:number}){
  validate(input);bounded(input.padding,'Padding',0,Math.floor(input.size/4));bounded(input.scale,'Scale',.8,1.2);bounded(input.offsetX,'X offset',-3,3);bounded(input.offsetY,'Y offset',-3,3);
  const inset=input.padding+input.stroke/2,extent=input.size/2-inset;
  if(extent<=0)throw new InputError('Stroke and padding leave no drawable geometry.');
  // SVG scales the stroke as well as the path, so bound the painted extent.
  const paintedExtent=extent+input.stroke/2;
  const maxScale=(input.size/2-Math.max(Math.abs(input.offsetX),Math.abs(input.offsetY)))/paintedExtent;
  if(maxScale<=0)throw new InputError('Offsets leave no drawable geometry.');
  const appliedScale=Math.floor(Math.min(input.scale,maxScale)*1000)/1000;
  const nominal=geometry(input.exemplar,input.size,inset,input.stroke,input.foreground);
  const transform=`translate(${n(input.offsetX)} ${n(input.offsetY)}) translate(${n(input.size/2)} ${n(input.size/2)}) scale(${appliedScale}) translate(${n(-input.size/2)} ${n(-input.size/2)})`;
  const adjusted=`<g transform="${transform}">${nominal}</g>`;
  const overlay=svg(input.size,`<g opacity="0.3">${nominal}</g>${adjusted}`);
  return {svg:svg(input.size,adjusted),overlaySvg:overlay,transform,appliedScale,clamped:appliedScale<input.scale};
}
export const operations={grid,stroke,optical};

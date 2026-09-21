import {InputError} from '../../operation';
export type Motif='circle'|'square'|'triangle';
export interface PatternInput {motif:Motif;tileSize:number;foreground:string;background:string}
const finite=(n:number,label:string,min:number,max:number)=>{if(!Number.isFinite(n)||n<min||n>max)throw new InputError(`${label} must be between ${min} and ${max}.`);return n;};
const hex=(value:string)=>{if(typeof value!=='string'||!/^#[0-9a-f]{6}$/i.test(value))throw new InputError('Use a six-digit hex color.');return value.toLowerCase();};
const n=(value:number)=>Number(value.toFixed(3));
export function tile(input:PatternInput&{size:number;rotation:number}){
  if(!['circle','square','triangle'].includes(input.motif))throw new InputError('Unknown motif.');
  finite(input.tileSize,'Tile size',8,256);if(!Number.isInteger(input.tileSize))throw new InputError('Tile size must be an integer.');
  hex(input.foreground);hex(input.background);finite(input.size,'Motif size',.1,.9);finite(input.rotation,'Rotation',0,360);
  const side=n(input.tileSize*input.size),center=input.tileSize/2,half=side/2;
  const shape=input.motif==='circle'?`<circle r="${n(half)}" fill="${input.foreground}"/>`:input.motif==='square'?`<rect x="${n(-half)}" y="${n(-half)}" width="${side}" height="${side}" fill="${input.foreground}"/>`:`<path d="M0 ${n(-half)}L${n(half)} ${n(half)}L${n(-half)} ${n(half)}Z" fill="${input.foreground}"/>`;
  const motif=`<g transform="translate(${center} ${center}) rotate(${input.rotation})">${shape}</g>`;
  // Copy neighboring motifs into the tile so rotated edge crossings match on both sides.
  const wrapped=[-1,0,1].flatMap(y=>[-1,0,1].map(x=>`<g transform="translate(${x*input.tileSize} ${y*input.tileSize})">${motif}</g>`)).join('');
  const tileSvg=`<svg xmlns="http://www.w3.org/2000/svg" width="${input.tileSize}" height="${input.tileSize}" viewBox="0 0 ${input.tileSize} ${input.tileSize}"><rect width="100%" height="100%" fill="${input.background}"/>${wrapped}</svg>`;
  const previewSize=input.tileSize*4;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${previewSize}" height="${previewSize}" viewBox="0 0 ${previewSize} ${previewSize}"><defs><pattern id="tile" patternUnits="userSpaceOnUse" width="${input.tileSize}" height="${input.tileSize}"><rect width="${input.tileSize}" height="${input.tileSize}" fill="${input.background}"/>${wrapped}</pattern></defs><rect width="100%" height="100%" fill="url(#tile)"/></svg>`;
  return {svg,tileSvg,tileSize:input.tileSize,motifSize:side,clearGap:n(input.tileSize-side)};
}
export function stripes(input:PatternInput&{style:'stripes'|'dots'|'checks';width:number;angle:number}){
  hex(input.foreground);hex(input.background);finite(input.tileSize,'Tile size',8,256);
  if(!Number.isInteger(input.tileSize))throw new InputError('Tile size must be an integer.');
  if(!['stripes','dots','checks'].includes(input.style))throw new InputError('Unknown repeat style.');
  finite(input.width,'Stripe or dot width',1,Math.min(128,input.tileSize/2));finite(input.angle,'Angle',0,360);
  const image=input.style==='stripes'?`repeating-linear-gradient(${n(input.angle)}deg, ${input.foreground} 0 ${n(input.width)}px, ${input.background} ${n(input.width)}px ${n(input.width*2)}px)`:input.style==='dots'?`radial-gradient(circle at center, ${input.foreground} 0 ${n(input.width/2)}px, ${input.background} ${n(input.width/2)}px)`: `conic-gradient(${input.foreground} 0 25%, ${input.background} 0 50%, ${input.foreground} 0 75%, ${input.background} 0)`;
  const backgroundSize=input.style==='stripes'?'auto':`${input.tileSize}px ${input.tileSize}px`;
  const css=`background-color: ${input.background};\nbackground-image: ${image};\nbackground-size: ${backgroundSize};`;
  return {css,image,backgroundSize};
}
export function exportPattern(input:PatternInput&{size:number;rotation:number}){
  const model=tile(input);
  return {svg:model.svg,tileSvg:model.tileSvg,pngSize:model.tileSize,filename:'pattern-tile.png',svgFilename:'pattern-repeat.svg'};
}
export const operations={tile,stripes,export:exportPattern};

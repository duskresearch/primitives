import {InputError} from '../../operation';
export interface NoiseInput {seed:number;intensity:number;foreground:string;background:string}
const finite=(value:number,label:string,min:number,max:number)=>{if(!Number.isFinite(value)||value<min||value>max)throw new InputError(`${label} must be between ${min} and ${max}.`);return value;};
const color=(value:string)=>{if(typeof value!=='string'||!/^#[0-9a-f]{6}$/i.test(value))throw new InputError('Color must be six-digit hex.');return value.toLowerCase();};
const validate=(input:NoiseInput)=>{finite(input.seed,'Seed',0,4294967295);if(!Number.isInteger(input.seed))throw new InputError('Seed must be an integer.');finite(input.intensity,'Intensity',0,1);color(input.foreground);color(input.background);};
const fmt=(n:number)=>Number(n.toFixed(4));
function filter(input:NoiseInput,frequency:number,octaves:number){
  const amount=fmt(input.intensity);
  return `<filter id="noise" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="${fmt(frequency)}" numOctaves="${octaves}" seed="${input.seed}" stitchTiles="stitch" result="field"/><feColorMatrix in="field" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${fmt(.2126*amount)} ${fmt(.7152*amount)} ${fmt(.0722*amount)} 0 0" result="mask"/><feFlood flood-color="${input.foreground}" result="ink"/><feComposite in="ink" in2="mask" operator="in" result="grain"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="grain"/></feMerge></filter>`;
}
const svg=(size:number,defs:string,fill:string)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><defs>${defs}</defs><rect width="100%" height="100%" fill="${fill}" filter="url(#noise)"/></svg>`;
export function grain(input:NoiseInput&{frequency:number}){
  validate(input);finite(input.frequency,'Frequency',.01,1);
  const size=256,source=svg(size,filter(input,input.frequency,3),input.background);
  return {svg:source,size,filterSource:filter(input,input.frequency,3),frequency:input.frequency};
}
export function gradient(input:NoiseInput&{angle:number;frequency:number}){
  validate(input);finite(input.angle,'Angle',0,360);finite(input.frequency,'Frequency',.01,1);
  const size=256,rad=input.angle*Math.PI/180;
  const x1=fmt(50-50*Math.sin(rad)),y1=fmt(50+50*Math.cos(rad)),x2=fmt(50+50*Math.sin(rad)),y2=fmt(50-50*Math.cos(rad));
  const gradientDef=`<linearGradient id="ramp" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%" color-interpolation="sRGB"><stop offset="0" stop-color="${input.foreground}"/><stop offset="1" stop-color="${input.background}"/></linearGradient>`;
  const source=svg(size,gradientDef+filter(input,input.frequency,3),'url(#ramp)');
  const css=`background-color: ${input.background};\nbackground-image: url("data:image/svg+xml,${encodeURIComponent(source)}");\nbackground-size: cover;`;
  const fallback=`background-image: linear-gradient(${fmt(input.angle)}deg, ${input.foreground}, ${input.background});`;
  return {svg:source,css,fallback,interpolation:'sRGB',noiseApplied:true};
}
export type TexturePreset='grain'|'paper'|'clouds';
const recipe:Record<TexturePreset,{frequency:number;octaves:number}>={grain:{frequency:.72,octaves:2},paper:{frequency:.11,octaves:4},clouds:{frequency:.018,octaves:4}};
export function texture(input:NoiseInput&{preset:TexturePreset;size:number}){
  validate(input);finite(input.size,'Texture size',64,1024);if(!Number.isInteger(input.size))throw new InputError('Texture size must be an integer.');
  const settings=recipe[input.preset];if(!settings)throw new InputError('Unknown texture preset.');
  const source=svg(input.size,filter(input,settings.frequency,settings.octaves),input.background);
  return {svg:source,size:input.size,preset:input.preset,frequency:settings.frequency,octaves:settings.octaves,filename:`noise-${input.preset}-${input.size}.png`,svgFilename:`noise-${input.preset}-${input.size}.svg`};
}
export const operations={grain,gradient,texture};

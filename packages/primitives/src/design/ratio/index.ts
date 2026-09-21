import {InputError} from '../../operation';
export interface Size {width:number;height:number}
const bounded=(value:number,label:string,min:number,max:number)=>{
  if(!Number.isFinite(value)||value<min||value>max)throw new InputError(`${label} must be between ${min} and ${max}.`);
  return value;
};
const dimension=(size:Size)=>{bounded(size.width,'Width',1,16384);bounded(size.height,'Height',1,16384);if(!Number.isInteger(size.width)||!Number.isInteger(size.height))throw new InputError('Dimensions must be whole pixels.');};
const gcd=(a:number,b:number):number=>b?gcd(b,a%b):a;
export function aspect(input:Size&{targetWidth:number;targetHeight:number;keep:'width'|'height'}){
  dimension(input);bounded(input.targetWidth,'Target ratio width',1,1000);bounded(input.targetHeight,'Target ratio height',1,1000);
  if(!Number.isInteger(input.targetWidth)||!Number.isInteger(input.targetHeight))throw new InputError('Ratio parts must be integers.');
  if(!['width','height'].includes(input.keep))throw new InputError('Keep width or height.');
  const common=gcd(input.width,input.height),targetCommon=gcd(input.targetWidth,input.targetHeight);
  const target={width:input.targetWidth/targetCommon,height:input.targetHeight/targetCommon};
  const solved=input.keep==='width'?{width:input.width,height:Math.round(input.width*target.height/target.width)}:{width:Math.round(input.height*target.width/target.height),height:input.height};
  if(solved.width<1||solved.height<1||solved.width>16384||solved.height>16384)throw new InputError('Solved dimension falls outside 1–16384 px.');
  return {current:{width:input.width/common,height:input.height/common},value:input.width/input.height,target,solved,css:`aspect-ratio: ${target.width} / ${target.height};`,rounding:'The solved dimension rounds to the nearest whole pixel.'};
}
export type ProportionName='golden'|'square'|'root2'|'root3'|'threeTwo'|'fourThree';
const proportions:Record<ProportionName,{label:string;symbol:string;value:number;kind:'irrational'|'rational'}>={
  golden:{label:'Golden',symbol:'(1 + √5) / 2',value:(1+Math.sqrt(5))/2,kind:'irrational'},
  square:{label:'Square',symbol:'1 : 1',value:1,kind:'rational'},
  root2:{label:'Root two',symbol:'√2 : 1',value:Math.SQRT2,kind:'irrational'},
  root3:{label:'Root three',symbol:'√3 : 1',value:Math.sqrt(3),kind:'irrational'},
  threeTwo:{label:'Musical fifth',symbol:'3 : 2',value:1.5,kind:'rational'},
  fourThree:{label:'Musical fourth',symbol:'4 : 3',value:4/3,kind:'rational'},
};
export function proportion(input:Size&{name:ProportionName;keep:'width'|'height'}){
  dimension(input);const relation=proportions[input.name];if(!relation)throw new InputError('Unknown proportion.');
  if(!['width','height'].includes(input.keep))throw new InputError('Keep width or height.');
  const solved=input.keep==='width'?{width:input.width,height:Math.round(input.width/relation.value)}:{width:Math.round(input.height*relation.value),height:input.height};
  if(solved.width<1||solved.height<1||solved.width>16384||solved.height>16384)throw new InputError('Solved dimension falls outside 1–16384 px.');
  return {...relation,solved,actual:solved.width/solved.height,rounding:'One dimension rounds to the nearest whole pixel; the symbolic relationship is exact, the frame is approximate.'};
}
export type CropPreset='square'|'portrait'|'story'|'landscape';
const presets:Record<CropPreset,Size>={square:{width:1,height:1},portrait:{width:4,height:5},story:{width:9,height:16},landscape:{width:16,height:9}};
export function crop(input:Size&{preset:CropPreset;mode:'fit'|'fill';focalX:number;focalY:number}){
  dimension(input);const target=presets[input.preset];if(!target)throw new InputError('Unknown crop preset.');
  if(!['fit','fill'].includes(input.mode))throw new InputError('Mode must be fit or fill.');
  bounded(input.focalX,'Horizontal focal point',0,1);bounded(input.focalY,'Vertical focal point',0,1);
  const outputWidth=300,outputHeight=300*target.height/target.width;
  const factor=input.mode==='fill'?Math.max(outputWidth/input.width,outputHeight/input.height):Math.min(outputWidth/input.width,outputHeight/input.height);
  const renderedWidth=input.width*factor,renderedHeight=input.height*factor;
  const clamp=(n:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,n));
  const offsetX=input.mode==='fit'?(outputWidth-renderedWidth)/2:clamp(outputWidth/2-input.focalX*renderedWidth,outputWidth-renderedWidth,0);
  const offsetY=input.mode==='fit'?(outputHeight-renderedHeight)/2:clamp(outputHeight/2-input.focalY*renderedHeight,outputHeight-renderedHeight,0);
  const rect=input.mode==='fit'?{x:0,y:0,width:input.width,height:input.height}:{x:-offsetX/factor,y:-offsetY/factor,width:outputWidth/factor,height:outputHeight/factor};
  const visiblePercent=input.mode==='fit'?100:100*rect.width*rect.height/(input.width*input.height);
  const positionX=renderedWidth===outputWidth?50:100*offsetX/(outputWidth-renderedWidth);
  const positionY=renderedHeight===outputHeight?50:100*offsetY/(outputHeight-renderedHeight);
  const css=`object-fit: ${input.mode==='fill'?'cover':'contain'};\nobject-position: ${Number(positionX.toFixed(2))}% ${Number(positionY.toFixed(2))}%;`;
  // Fixed built-in composition: four landmarks make the crop apparent without an upload.
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${outputWidth} ${outputHeight}" width="${outputWidth}" height="${outputHeight}"><rect width="100%" height="100%" fill="#f4f1ea"/><g transform="translate(${offsetX} ${offsetY}) scale(${factor})"><rect width="${input.width}" height="${input.height}" fill="#d8d4c9"/><path d="M0 0L${input.width} ${input.height}M${input.width} 0L0 ${input.height}" stroke="#6b6a63" stroke-width="${Math.max(1,Math.min(input.width,input.height)/80)}"/><circle cx="${input.width*.25}" cy="${input.height*.3}" r="${Math.min(input.width,input.height)*.08}" fill="#1a1a17"/><circle cx="${input.width*.75}" cy="${input.height*.65}" r="${Math.min(input.width,input.height)*.12}" fill="#6b6a63"/></g><path d="M${outputWidth/2-10} ${outputHeight/2}h20m-10-10v20" stroke="#1a1a17" stroke-width="2"/></svg>`;
  return {target,rect,visiblePercent,css,svg,transform:{factor,offsetX,offsetY},output:{width:outputWidth,height:outputHeight}};
}
export const operations={aspect,proportion,crop};

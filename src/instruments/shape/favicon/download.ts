import { ico, zip } from '../../../../packages/primitives/src/design/shape/archive';
import type { ReturnTypeFavicon } from './types';

const enc=new TextEncoder();
async function raster(svg:string,size:number):Promise<Uint8Array>{
  const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
  try {
    const image=new Image();
    await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new Error('SVG image could not load.'));image.src=url;});
    const canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;
    const context=canvas.getContext('2d');if(!context)throw new Error('Canvas unavailable.');
    context.drawImage(image,0,0,size,size);
    const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob((b)=>b?resolve(b):reject(new Error('PNG encoding failed.')),'image/png'));
    if(blob.type!=='image/png')throw new Error('PNG encoding unavailable.');
    return new Uint8Array(await blob.arrayBuffer());
  } finally {URL.revokeObjectURL(url);}
}
export async function downloadIconSet(answer:ReturnTypeFavicon):Promise<void>{
  const sizes=[16,32,48,180,192,512] as const;
  const images=await Promise.all(sizes.map((size)=>raster(answer.svg,size)));
  const archive=zip([
    {name:'favicon.svg',bytes:enc.encode(answer.svg)},
    {name:'favicon.ico',bytes:ico(images.slice(0,3).map((bytes,i)=>({size:sizes[i],bytes})))},
    {name:'apple-touch-icon.png',bytes:images[3]}, {name:'icon-192.png',bytes:images[4]}, {name:'icon-512.png',bytes:images[5]},
    {name:'site.webmanifest',bytes:enc.encode(answer.manifest)}, {name:'integration.html',bytes:enc.encode(answer.html)},
  ]);
  const url=URL.createObjectURL(new Blob([archive as BlobPart],{type:'application/zip'}));
  try {const anchor=document.createElement('a');anchor.href=url;anchor.download='shape-icons.zip';document.body.append(anchor);anchor.click();anchor.remove();}
  finally {setTimeout(()=>URL.revokeObjectURL(url),10_000);}
}

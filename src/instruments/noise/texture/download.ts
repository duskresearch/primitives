function save(blob:Blob,filename:string){const url=URL.createObjectURL(blob);try{const anchor=document.createElement('a');anchor.href=url;anchor.download=filename;document.body.append(anchor);anchor.click();anchor.remove();}finally{setTimeout(()=>URL.revokeObjectURL(url),10_000);}}
export function downloadSvg(svg:string,filename:string){save(new Blob([svg],{type:'image/svg+xml'}),filename);}
export async function downloadPng(svg:string,size:number,filename:string){
  if(!Number.isInteger(size)||size<64||size>1024)throw new Error('Texture size must be 64–1024 pixels.');
  const source=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));const image=new Image();
  try{await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new Error('SVG image could not load.'));image.src=source;});
    const canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;const context=canvas.getContext('2d');if(!context)throw new Error('Canvas unavailable.');context.drawImage(image,0,0,size,size);
    const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('PNG encoding failed.')),'image/png'));if(blob.type!=='image/png')throw new Error('PNG encoding unavailable.');save(blob,filename);
  }finally{image.onload=null;image.onerror=null;URL.revokeObjectURL(source);}
}

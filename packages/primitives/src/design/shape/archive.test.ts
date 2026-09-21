import { describe, expect, it } from 'vitest';
// Astro's browser-oriented tsconfig excludes Node declarations; these are test-runtime only.
// @ts-expect-error Node built-in available to Vitest.
import { deflateSync } from 'node:zlib';
// @ts-expect-error Node built-in available to Vitest.
import { writeFileSync } from 'node:fs';
// @ts-expect-error Node built-in available to Vitest.
import process from 'node:process';
import { ico, zip } from './archive';
import { favicon } from './index';
// Fixed one-color fixtures built with the Node test runtime's PNG compression, not production code.
const crc=(data:Uint8Array)=>{let n=-1;for(const byte of data){n^=byte;for(let i=0;i<8;i++)n=(n>>>1)^(-(n&1)&0xedb88320)}return(n^-1)>>>0};
function png(size:number){
  const chunk=(name:string,bytes:Uint8Array)=>{const b=new Uint8Array(12+bytes.length),v=new DataView(b.buffer);v.setUint32(0,bytes.length);b.set(new TextEncoder().encode(name),4);b.set(bytes,8);v.setUint32(8+bytes.length,crc(b.subarray(4,8+bytes.length)));return b};
  const ihdr=new Uint8Array(13),v=new DataView(ihdr.buffer);v.setUint32(0,size);v.setUint32(4,size);ihdr[8]=8;ihdr[9]=6;
  const pixels=new Uint8Array(size*(1+size*4));for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=y*(1+size*4)+1+x*4;pixels.set([20,30,40,255],i)}
  const parts=[Uint8Array.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',deflateSync(pixels)),chunk('IEND',new Uint8Array())];
  const out=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let at=0;for(const part of parts){out.set(part,at);at+=part.length}return out;
}
describe('Shape icon packaging',()=>{
  it('writes valid ICO directory offsets and an independently readable ZIP',()=>{
    const images=[16,32,48].map((size)=>({size,bytes:png(size)}));
    const icon=ico(images),view=new DataView(icon.buffer);
    expect(view.getUint16(4,true)).toBe(3);
    images.forEach((image,i)=>{const at=6+i*16,off=view.getUint32(at+12,true),length=view.getUint32(at+8,true);expect(icon[at]).toBe(image.size);expect(icon.subarray(off,off+length)).toEqual(image.bytes)});
    const content=favicon({form:'triangle',sides:6,radius:40,rotation:0,inner:.5,foreground:'#112233',background:'#f4f1ea',padding:12});
    const encode=new TextEncoder();
    const archive=zip([{name:'favicon.svg',bytes:encode.encode(content.svg)},{name:'favicon.ico',bytes:icon},{name:'apple-touch-icon.png',bytes:png(180)},{name:'icon-192.png',bytes:png(192)},{name:'icon-512.png',bytes:png(512)},{name:'site.webmanifest',bytes:encode.encode(content.manifest)},{name:'integration.html',bytes:encode.encode(content.html)}]);
    expect(new DataView(archive.buffer).getUint32(0,true)).toBe(0x04034b50);
    if(process.env.SHAPE_VERIFY_ARCHIVE)writeFileSync(process.env.SHAPE_VERIFY_ARCHIVE,archive);
  });
  it('refuses incorrect PNG dimensions and unsafe duplicate names',()=>{
    expect(()=>ico([{size:16,bytes:png(1)},{size:32,bytes:png(32)},{size:48,bytes:png(48)}])).toThrow();
    expect(()=>zip([{name:'../a',bytes:new Uint8Array()}])).toThrow();
    expect(()=>zip([{name:'x',bytes:new Uint8Array()},{name:'x',bytes:new Uint8Array()}])).toThrow();
  });
});

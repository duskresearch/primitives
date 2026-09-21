import { InputError } from '../../operation';

export interface ArchiveFile { name: string; bytes: Uint8Array }
const encoder = new TextEncoder();
const u16 = (view: DataView, offset: number, value: number) => view.setUint16(offset, value, true);
const u32 = (view: DataView, offset: number, value: number) => view.setUint32(offset, value >>> 0, true);
const crc32 = (data: Uint8Array) => {
  let crc = -1;
  for (const byte of data) { crc ^= byte; for (let i=0;i<8;i++) crc=(crc>>>1)^(-(crc&1)&0xedb88320); }
  return (crc ^ -1) >>> 0;
};
export function zip(files: ArchiveFile[]): Uint8Array {
  if (!files.length || files.length > 16) throw new InputError('Archive needs 1 to 16 files.');
  const entries = files.map(({name,bytes}) => {
    if (!/^[a-z0-9][a-z0-9.-]{0,60}$/.test(name) || !(bytes instanceof Uint8Array) || bytes.length > 8_000_000) throw new InputError('Invalid archive entry.');
    return { name: encoder.encode(name), bytes, crc: crc32(bytes) };
  });
  if (new Set(files.map((f)=>f.name)).size !== files.length) throw new InputError('Duplicate archive entry.');
  const localSize=entries.reduce((n,e)=>n+30+e.name.length+e.bytes.length,0);
  const centralSize=entries.reduce((n,e)=>n+46+e.name.length,0);
  const out=new Uint8Array(localSize+centralSize+22), v=new DataView(out.buffer);
  let at=0; const offsets:number[]=[];
  for(const e of entries){offsets.push(at);u32(v,at,0x04034b50);u16(v,at+4,20);u16(v,at+6,0x0800);u16(v,at+8,0);u32(v,at+14,e.crc);u32(v,at+18,e.bytes.length);u32(v,at+22,e.bytes.length);u16(v,at+26,e.name.length);at+=30;out.set(e.name,at);at+=e.name.length;out.set(e.bytes,at);at+=e.bytes.length;}
  const centralStart=at;
  entries.forEach((e,i)=>{u32(v,at,0x02014b50);u16(v,at+4,20);u16(v,at+6,20);u16(v,at+8,0x0800);u16(v,at+10,0);u32(v,at+16,e.crc);u32(v,at+20,e.bytes.length);u32(v,at+24,e.bytes.length);u16(v,at+28,e.name.length);u32(v,at+42,offsets[i]);at+=46;out.set(e.name,at);at+=e.name.length;});
  u32(v,at,0x06054b50);u16(v,at+8,entries.length);u16(v,at+10,entries.length);u32(v,at+12,centralSize);u32(v,at+16,centralStart);
  return out;
}
export function ico(pngs: {size:number;bytes:Uint8Array}[]): Uint8Array {
  if(pngs.length!==3 || pngs.some((p,i)=>p.size!==[16,32,48][i] || !(p.bytes instanceof Uint8Array) || p.bytes.length>8_000_000)) throw new InputError('ICO needs PNGs at 16, 32 and 48 pixels.');
  for(const p of pngs){
    const b=p.bytes;
    if(b.length<33 || ![137,80,78,71,13,10,26,10].every((n,i)=>b[i]===n) || b[12]!==73 || b[13]!==72 || b[14]!==68 || b[15]!==82 || new DataView(b.buffer,b.byteOffset,b.byteLength).getUint32(16)!==p.size || new DataView(b.buffer,b.byteOffset,b.byteLength).getUint32(20)!==p.size) throw new InputError('ICO image must be a PNG at its declared size.');
  }
  const out=new Uint8Array(6+16*pngs.length+pngs.reduce((n,p)=>n+p.bytes.length,0)),v=new DataView(out.buffer);
  u16(v,2,1);u16(v,4,pngs.length);let at=6+16*pngs.length;
  pngs.forEach((p,i)=>{const off=6+16*i;out[off]=p.size;out[off+1]=p.size;u16(v,off+4,1);u16(v,off+6,32);u32(v,off+8,p.bytes.length);u32(v,off+12,at);out.set(p.bytes,at);at+=p.bytes.length;});
  return out;
}

import { describe, expect, it } from 'vitest';
import { InputError } from '../../operation';
import { FORMS, blob, corner, favicon, form, polygon, presetPoints, vertices } from './index';
const base = { form: 'triangle' as const, sides: 6, radius: 40, rotation: 0 };
describe('Shape operations', () => {
  it('wraps every Form element in a complete standalone SVG document', () => {
    for (const name of FORMS) {
      const result = form({...base, form:name, inner:.5});
      expect(result.svg).toBe(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${result.element}</svg>`);
    }
  });
  it('keeps star presets inside the editor vertex budget for every shared side count', () => {
    for (let sides = 3; sides <= 12; sides++) {
      const input = {...base, sides};
      const points = presetPoints(input, 'star');
      expect(points).toHaveLength(Math.min(sides, 6) * 2);
      expect(() => polygon({...input, points})).not.toThrow();
      expect(input.sides).toBe(sides);
    }
  });
  it('has reference triangle vertices and closed, finite SVG', () => {
    expect(vertices(base).map((p) => [Number(p.x.toFixed(2)),Number(p.y.toFixed(2))])).toEqual([[50,10],[84.64,70],[15.36,70]]);
    expect(form({...base,inner:.5}).svg).toContain('M50 10 L84.641 70 L15.359 70 Z');
    expect(form({...base,rotation:90,inner:.5}).svg).toContain('M90 50');
    expect(form({...base,form:'circle',inner:.5}).svg).toContain('<circle');
  });
  it('rejects invalid and unbounded forms', () => {
    expect(()=>form({...base,radius:Infinity,inner:.5})).toThrow(InputError);
    expect(()=>form({...base,sides:13,inner:.5})).toThrow(InputError);
    expect(()=>form({...base,inner:NaN})).toThrow(InputError);
  });
  it('exports ordered polygon points and rejects invalid vertices', () => {
    const points=[{x:0,y:0},{x:100,y:0},{x:50,y:100}];
    expect(polygon({...base,points}).css).toBe('clip-path: polygon(0% 0%, 100% 0%, 50% 100%);');
    expect(presetPoints(base,'hexagon')).toHaveLength(6);
    expect(()=>polygon({...base,points:[...points,{x:101,y:0}]})).toThrow(InputError);
    expect(()=>polygon({...base,points:points.slice(0,2)})).toThrow(InputError);
  });
  it('uses CSS Borders 4 exponent and a symmetric, bounded closed path', () => {
    const result=corner({...base,cornerRadius:30,smoothing:1});
    expect(result.exponent).toBe(4);
    expect(result.css).toContain('corner-shape: superellipse(2)');
    expect(result.path.endsWith(' Z')).toBe(true);
    expect(result.points.every(({x,y})=>x>=0&&x<=100&&y>=0&&y<=100)).toBe(true);
    expect(result.points[0]).toEqual({x:30,y:0});
    expect(result.points[17].x).toBeCloseTo(100,5);
    expect(result.points[17].y).toBeCloseTo(30,5);
    expect(result.points[18]).toEqual({x:100,y:70});
    expect(result.points[34].x).toBeCloseTo(70,5);
    expect(result.points[34].y).toBeCloseTo(100,5);
    expect(result.points.every((p,i,a)=>i===0||Math.hypot(p.x-a[i-1].x,p.y-a[i-1].y)<=40.001)).toBe(true);
    expect(corner({...base,cornerRadius:0,smoothing:0}).path).not.toContain('NaN');
    expect(corner({...base,cornerRadius:50,smoothing:1}).path).not.toContain('Infinity');
  });
  it('keeps blob generation deterministic, closed, bounded, and regular at zero variation', () => {
    const input={...base,seed:12345,complexity:12,irregularity:.35};
    const a=blob(input);
    expect(blob(input)).toEqual(a);
    expect(a.path.endsWith(' Z')).toBe(true);
    expect(a.knots.every(({x,y})=>x>=0&&x<=100&&y>=0&&y<=100)).toBe(true);
    expect(blob({...input,seed:12346}).path).not.toBe(a.path);
    expect(blob({...input,irregularity:0}).knots.every((p)=>Math.abs(Math.hypot(p.x-50,p.y-50)-40)<1e-9)).toBe(true);
    expect(()=>blob({...input,seed:-1})).toThrow(InputError);
  });
  it('generates only safe SVG and matching manifest/HTML file names', () => {
    const result=favicon({...base,inner:.5,foreground:'#112233',background:'#f4f1ea',padding:12});
    expect(result.svg).toContain('fill="#112233"');
    expect(result.files).toContain('apple-touch-icon.png');
    expect(JSON.parse(result.manifest).icons.map((x:{src:string})=>x.src)).toEqual(['icon-192.png','icon-512.png']);
    expect(result.html).toContain('href="favicon.ico"');
    expect(()=>favicon({...base,inner:.5,foreground:'<script>',background:'#f4f1ea',padding:12})).toThrow(InputError);
  });
  it('exports the chosen foreground without changing raw geometry paths', () => {
    const chosen = {...base,foreground:'#e85854'};
    expect(form({...chosen,inner:.5}).element).toContain('fill="#e85854"');
    expect(form({...chosen,inner:.5}).svg).toContain('fill="#e85854"');
    expect(corner({...chosen,cornerRadius:32,smoothing:.75}).svg).toContain('fill="#e85854"');
    expect(blob({...chosen,seed:1,complexity:7,irregularity:.24}).svg).toContain('fill="#e85854"');
    expect(polygon({...chosen,points:[{x:0,y:0},{x:100,y:0},{x:50,y:100}]}).coloredCss).toContain('background-color: #e85854;');
    const icon=favicon({...chosen,inner:.5,background:'#f4f1ea',padding:12});
    expect(icon.svg).toContain('fill="#e85854"');
    expect(icon.svg).not.toContain('fill="currentColor"');
    expect(blob({...chosen,seed:1,complexity:7,irregularity:.24}).path).not.toContain('#');
    for (const run of [
      () => form({...chosen,foreground:'<script>',inner:.5}),
      () => corner({...chosen,foreground:'url(javascript:)',cornerRadius:32,smoothing:.75}),
      () => blob({...chosen,foreground:'none',seed:1,complexity:7,irregularity:.24}),
      () => polygon({...chosen,foreground:'<svg>',points:[{x:0,y:0},{x:100,y:0},{x:50,y:100}]}),
      () => favicon({...chosen,foreground:'<script>',inner:.5,background:'#f4f1ea',padding:12}),
    ]) expect(run).toThrow(InputError);
  });
});

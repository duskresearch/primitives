import { InputError } from '../../operation';

const integer = (n: number, name: string, min: number, max: number) => {
  if (!Number.isInteger(n) || n < min || n > max) throw new InputError(`${name} must be an integer from ${min} to ${max}.`);
};
const px = (n: number) => `${n}px`;
export interface GridDimensions { cols: number; gap: number; margin: number; max: number }
export interface ColumnsInput extends GridDimensions { width: number }
export interface ColumnsResult { containerWidth: number; contentWidth: number; trackWidth: number; totalGap: number; outerMargin: number; fits: boolean; overflow: number; css: string }
export function validateGrid(x: GridDimensions) {
  integer(x.cols, 'Columns', 1, 24); integer(x.gap, 'Gap', 0, 64);
  integer(x.margin, 'Margin', 0, 96); integer(x.max, 'Maximum width', 320, 2560);
}
export function columns(x: ColumnsInput): ColumnsResult {
  validateGrid(x); integer(x.width, 'Viewport width', 240, 2560);
  const containerWidth = Math.min(x.width, x.max);
  const contentWidth = Math.max(0, containerWidth - 2 * x.margin);
  const totalGap = (x.cols - 1) * x.gap;
  const trackWidth = (contentWidth - totalGap) / x.cols;
  const css = ['.grid {', '  box-sizing: border-box;', '  width: 100%;', `  max-width: ${px(x.max)};`, '  margin-inline: auto;', `  padding-inline: ${px(x.margin)};`, '  display: grid;', `  grid-template-columns: repeat(${x.cols}, minmax(0, 1fr));`, `  gap: ${px(x.gap)};`, '}'].join('\n');
  return { containerWidth, contentWidth, trackWidth: Math.round(Math.max(0, trackWidth) * 100) / 100, totalGap, outerMargin: (x.width - containerWidth) / 2, fits: trackWidth >= 0, overflow: Math.max(0, totalGap - contentWidth), css };
}

export const BREAKPOINT_NAMES = ['base', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
export type BreakpointName = typeof BREAKPOINT_NAMES[number];
export interface BreakpointsInput extends ColumnsInput { sm: number; md: number; lg: number; xl: number; xxl: number }
export const breakpointColumns = (cols: number) => [1, Math.min(cols, 2), Math.min(cols, 4), Math.min(cols, 6), cols, cols] as const;
export interface BreakpointRange { name: BreakpointName; min: number; max: number | null; cols: number }
export interface BreakpointsResult { active: BreakpointRange; ranges: BreakpointRange[]; css: string }
export function breakpoints(x: BreakpointsInput): BreakpointsResult {
  validateGrid(x); integer(x.width, 'Viewport width', 240, 2560);
  const thresholds = [x.sm, x.md, x.lg, x.xl, x.xxl];
  thresholds.forEach((n, i) => integer(n, BREAKPOINT_NAMES[i + 1], 240, 2560));
  if (thresholds.some((n, i) => i > 0 && n <= thresholds[i - 1])) throw new InputError('Breakpoint widths must be strictly increasing.');
  const counts = breakpointColumns(x.cols);
  const ranges: BreakpointRange[] = BREAKPOINT_NAMES.map((name, i) => ({ name, min: i ? thresholds[i - 1] : 0, max: i < 5 ? thresholds[i] - 1 : null, cols: counts[i] }));
  const base = columns(x).css.replace(`repeat(${x.cols}, minmax(0, 1fr))`, 'repeat(1, minmax(0, 1fr))');
  const css = [base, ...thresholds.map((min, i) => `@media (min-width: ${px(min)}) {\n  .grid { grid-template-columns: repeat(${counts[i + 1]}, minmax(0, 1fr)); }\n}`)].join('\n\n');
  return { active: ranges.reduce((a, r) => x.width >= r.min ? r : a, ranges[0]), ranges, css };
}

export interface BaselineInput { step: number; size: number; leading: number; offset: number }
export interface BaselineResult { aligned: boolean; recommended: number; driftPerLine: number; css: string; stepCss: string; recommendedCss: string }
export function baseline(x: BaselineInput): BaselineResult {
  integer(x.step, 'Step', 2, 24); integer(x.size, 'Font size', 12, 32);
  integer(x.leading, 'Line height', 12, 64); integer(x.offset, 'Offset', 0, x.step - 1);
  const candidates = Array.from({ length: Math.floor(64 / x.step) }, (_, i) => (i + 1) * x.step).filter((n) => n >= x.size && n <= 64);
  const recommended = candidates.reduce((best, n) => Math.abs(n - x.leading) < Math.abs(best - x.leading) ? n : Math.abs(n - x.leading) === Math.abs(best - x.leading) && n > best ? n : best, candidates[0]);
  const driftPerLine = x.leading - recommended;
  return { aligned: driftPerLine === 0 && x.leading >= x.size && x.offset === 0, recommended, driftPerLine, stepCss: px(x.step), recommendedCss: `line-height: ${px(recommended)};`, css: `--baseline-step: ${px(x.step)};\n--baseline-offset: ${px(x.offset)};\nfont-size: ${px(x.size)};\nline-height: ${px(x.leading)};` };
}

export const LAYOUT_PRESETS = ['sidebar', 'holy-grail', 'dashboard'] as const;
export type LayoutPreset = typeof LAYOUT_PRESETS[number];
export interface LayoutInput extends ColumnsInput { preset: LayoutPreset; collapse: number; sidebar: number }
export interface LayoutResult { regions: string[]; desktopAreas: string[][]; mobileAreas: string[][]; css: string; html: string; collapsed: boolean; fits: boolean; overflow: number }
const LAYOUTS: Record<LayoutPreset, { desktop: string[][]; mobile: string[][] }> = {
  sidebar: { desktop: [['header', 'header'], ['sidebar', 'main'], ['footer', 'footer']], mobile: [['header'], ['sidebar'], ['main'], ['footer']] },
  'holy-grail': { desktop: [['header', 'header', 'header'], ['sidebar', 'main', 'aside'], ['footer', 'footer', 'footer']], mobile: [['header'], ['sidebar'], ['main'], ['aside'], ['footer']] },
  dashboard: { desktop: [['header', 'header', 'header'], ['sidebar', 'summary', 'summary'], ['sidebar', 'main', 'aside'], ['footer', 'footer', 'footer']], mobile: [['header'], ['sidebar'], ['summary'], ['main'], ['aside'], ['footer']] },
};
const areaRows = (rows: string[][]) => rows.map((row) => `    "${row.join(' ')}"`).join('\n');
export function layout(x: LayoutInput): LayoutResult {
  validateGrid(x); integer(x.width, 'Viewport width', 240, 2560);
  integer(x.collapse, 'Collapse width', 320, 1600); integer(x.sidebar, 'Sidebar width', 120, 400);
  if (!LAYOUT_PRESETS.includes(x.preset)) throw new InputError('Preset must be sidebar, holy-grail, or dashboard.');
  const { desktop, mobile } = LAYOUTS[x.preset];
  const regions = [...new Set(mobile.flat())];
  const desktopColumns = x.preset === 'sidebar' ? `${px(x.sidebar)} minmax(0, 1fr)` : x.preset === 'holy-grail' ? `${px(x.sidebar)} minmax(0, 1fr) ${px(x.sidebar)}` : `${px(x.sidebar)} minmax(0, 1fr) minmax(0, 1fr)`;
  const css = ['.layout {', '  box-sizing: border-box;', '  width: 100%;', `  max-width: ${px(x.max)};`, '  margin-inline: auto;', `  padding-inline: ${px(x.margin)};`, '  display: grid;', `  gap: ${px(x.gap)};`, '  grid-template-columns: minmax(0, 1fr);', '  grid-template-areas:', areaRows(mobile) + ';', '}', ...regions.map((r) => `.layout > .${r} { grid-area: ${r}; }`), `@media (min-width: ${px(x.collapse)}) {`, '  .layout {', `    grid-template-columns: ${desktopColumns};`, '    grid-template-areas:', areaRows(desktop) + ';', '  }', '}'].join('\n');
  const html = `<div class="layout">\n${regions.map((r) => { const tag = ['header', 'main', 'aside', 'footer'].includes(r) ? r : 'div'; return `  <${tag} class="${r}">${r}</${tag}>`; }).join('\n')}\n</div>`;
  const collapsed = x.width < x.collapse;
  const content = Math.max(0, Math.min(x.width, x.max) - 2 * x.margin);
  const fixed = collapsed ? 0 : x.sidebar * (x.preset === 'holy-grail' ? 2 : 1);
  const gaps = collapsed ? 0 : (desktop[0].length - 1) * x.gap;
  const overflow = Math.max(0, fixed + gaps - content);
  return { regions, desktopAreas: desktop.map((row) => [...row]), mobileAreas: mobile.map((row) => [...row]), css, html, collapsed, fits: overflow === 0, overflow };
}

export const operations = { columns, breakpoints, baseline, layout };

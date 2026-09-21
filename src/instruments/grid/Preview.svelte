<script lang="ts" module>
  export interface PreviewColors { paper: string; ink: string; line: string; accent: string }
</script>
<script lang="ts">
  /** Static, script-free sandbox. CSS and markup come only from Grid operations/tools. */
  import Copy from '@/components/tool/Copy.svelte';
  let { css, width, html, colors, height = 120 }: { css: string; width: number; html: string; colors: PreviewColors; height?: number } = $props();
  let holder: HTMLDivElement;
  let available = $state(0);
  $effect(() => {
    if (!holder) return;
    const observer = new ResizeObserver(([entry]) => (available = entry.contentRect.width));
    observer.observe(holder);
    return () => observer.disconnect();
  });
  const scale = $derived(Math.min(1, (available || 320) / width));
  const logicalHeight = $derived(Math.round(height / scale));
  const srcdoc = $derived(`<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0}*{box-sizing:border-box}body{width:${width}px;height:${logicalHeight}px;background:${colors.paper}}.grid{min-height:${logicalHeight}px;align-content:center}.grid>*{min-width:0;height:${Math.round(logicalHeight * 0.75)}px;background:${colors.accent};box-shadow:inset 0 0 0 1px ${colors.line}}.layout{min-height:${logicalHeight}px}.layout>*{min-width:0;min-height:48px;background:${colors.accent};box-shadow:inset 0 0 0 1px ${colors.line};color:${colors.ink};font:16px sans-serif;padding:12px}${css}</style></head><body>${html}</body></html>`);
</script>

<div class="preview-meta mono"><Copy value={`${width}px`} label="simulated viewport">{width}px simulated viewport</Copy><Copy value={`${Math.round(scale * 100)}%`} label="display scale">{scale < 0.995 ? `${Math.round(scale * 100)}% display scale` : '100% display scale'}</Copy></div>
<div class="preview-holder" bind:this={holder} style:height={`${height}px`}>
  {#key srcdoc}
    <iframe title={`Grid preview at ${width} CSS pixels`} sandbox="" {srcdoc} style:width={`${width}px`} style:height={`${logicalHeight}px`} style:transform={`scale(${scale})`}></iframe>
  {/key}
</div>

<style>
  .preview-meta{display:flex;justify-content:space-between;gap:12px;font-size:11px;color:var(--ink-2)}
  .preview-holder{position:relative;width:100%;min-width:0;overflow:hidden;background:var(--paper);border:1px solid var(--line-2)}
  iframe{position:absolute;top:0;left:0;border:0;transform-origin:top left;pointer-events:none}
</style>

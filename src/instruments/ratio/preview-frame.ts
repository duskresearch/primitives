/** Fit a ratio inside the preview bounds; the browser may shrink width further. */
export function fitPreviewFrame(width: number, height: number, maxWidth: number, maxHeight: number) {
  const scale = Math.min(maxWidth / width, maxHeight / height);
  return { width: width * scale, height: height * scale };
}

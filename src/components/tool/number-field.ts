/** Parse a visible draft without changing a consumer's value on invalid input. */
export function parseNumberField(raw: string, min: number, max: number, integer = false): number | null {
  const trimmed = raw.trim();
  const value = Number(trimmed.replace(',', '.').replace(/[%°]$/, ''));
  return trimmed !== '' && Number.isFinite(value) && value >= min && value <= max && (!integer || Number.isInteger(value)) ? value : null;
}

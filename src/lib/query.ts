// A query without the settings left at their defaults, so shared links stay short:
// primitiv.es/type/scale?ratio=1.618 rather than every value spelled out. Pairs are compared
// as written, since the page's serializer wrote both; a missing one reads as its default.
export function withoutDefaults(query: string, defaults: string): string {
  const unchanged = new Set(defaults.split('&'));
  return query
    .split('&')
    .filter((pair) => pair && !unchanged.has(pair))
    .join('&');
}

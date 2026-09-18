// Builds src/lib/moderation/bigrams.json: log P(next letter | previous letter) over English
// words, with ^ and $ marking word edges. Used to tell words from keyboard mashing. Run
// once on a machine with /usr/share/dict/words (macOS, most Linux); the output is committed.
import { readFileSync, writeFileSync } from 'node:fs';

const words = readFileSync(process.argv[2] ?? '/usr/share/dict/words', 'utf8')
  .split('\n')
  .map((w) => w.trim().toLowerCase())
  .filter((w) => /^[a-z]{2,}$/.test(w));

const symbols = '^abcdefghijklmnopqrstuvwxyz$';
const index = Object.fromEntries([...symbols].map((c, i) => [c, i]));
const counts = symbols.split('').map(() => new Array(symbols.length).fill(1)); // add-one smoothing
for (const w of words) {
  const s = `^${w}$`;
  for (let i = 0; i < s.length - 1; i++) counts[index[s[i]]][index[s[i + 1]]]++;
}
const table = counts.map((row) => {
  const total = row.reduce((a, b) => a + b, 0);
  return row.map((n) => Math.round(Math.log(n / total) * 100) / 100);
});
writeFileSync(
  new URL('../src/lib/moderation/bigrams.json', import.meta.url),
  `${JSON.stringify({ symbols, words: words.length, logp: table })}\n`,
);
console.log(`bigrams from ${words.length} words`);

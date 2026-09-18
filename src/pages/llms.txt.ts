import type { APIRoute } from 'astro';
import { primitives, site } from '@/lib/catalogue';

// A plain index for language models: what each instrument does and the problem it answers.
export const GET: APIRoute = ({ site: origin }) => {
  const url = (path: string) => new URL(path, origin).href;
  const lower = (s = '') => s.charAt(0).toLowerCase() + s.slice(1);
  const shipped = primitives.filter((p) => p.instruments.some((i) => i.live));
  const planned = primitives.filter((p) => !p.instruments.some((i) => i.live));
  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.headline} ${site.subline} Made by ${site.maker}. Every result is a link: instrument state lives in the URL query.`,
    '',
    ...shipped.flatMap((p) => [
      `## ${p.name}`,
      '',
      ...p.instruments.filter((i) => i.live).map((i) => `- [${i.name}](${url(i.href)}): ${i.does}, for when ${lower(i.pain)}.`),
      '',
    ]),
    '## In preparation',
    '',
    ...planned.map((p) => `- [${p.name}](${url(p.href)}): ${p.list}`),
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};

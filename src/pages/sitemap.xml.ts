import type { APIRoute } from 'astro';
import { PAGES, SITE_URL } from '../config';
import { LANGS, DEFAULT_LANG, localize } from '../i18n';

// Every page in every language, each entry listing its language alternates.
export const GET: APIRoute = () => {
  const href = (p: string, lang: (typeof LANGS)[number]) => new URL(localize(p, lang), SITE_URL).href;
  const urls = PAGES.flatMap((p) =>
    LANGS.map((lang) => {
      const alternates = [
        ...LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${href(p, l)}"/>`),
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${href(p, DEFAULT_LANG)}"/>`,
      ].join('\n');
      return `  <url>\n    <loc>${href(p, lang)}</loc>\n${alternates}\n  </url>`;
    }),
  ).join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};

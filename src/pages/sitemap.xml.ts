import type { APIRoute } from 'astro';
import { PAGES, SITE_URL } from '../config';

export const GET: APIRoute = () => {
  const urls = PAGES.map((p) => `  <url><loc>${new URL(p, SITE_URL).href}</loc></url>`).join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};

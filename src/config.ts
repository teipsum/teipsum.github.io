// Site-wide configuration. Values that differ per deployment come from
// PUBLIC_* environment variables (see .env.example); everything else is here.

const env = import.meta.env;

function httpsUrl(value: string | undefined, name: string): string {
  const v = (value ?? '').trim();
  if (!v) return '';
  try {
    const url = new URL(v);
    if (url.protocol === 'https:') return url.href;
  } catch {
    /* fall through */
  }
  console.warn(`[config] ${name} is not an https URL; ignoring it.`);
  return '';
}

export const SITE_URL = 'https://teipsum.com';
export const SITE_NAME = 'TEIPSUM';

/** Where the waitlist form posts. Empty = not accepting requests yet. */
export const WAITLIST_ENDPOINT = httpsUrl(env.PUBLIC_WAITLIST_ENDPOINT, 'PUBLIC_WAITLIST_ENDPOINT');

/** Cloudflare Web Analytics token (public; the one the current site uses). */
export const CF_BEACON_TOKEN = (env.PUBLIC_CF_BEACON_TOKEN || '9fe6f88fa55b4834b34a05601cc3d8bb').trim();

/** Privacy notice effective date, as it should read (set at launch). Empty = no date line. */
export const PRIVACY_EFFECTIVE_DATE = (env.PUBLIC_PRIVACY_EFFECTIVE_DATE ?? '').trim();

/** Company LinkedIn page. Empty = no footer link. */
export const LINKEDIN_URL = httpsUrl(env.PUBLIC_LINKEDIN_URL, 'PUBLIC_LINKEDIN_URL');

export const NAV = [
  { href: '/platform/', label: 'Platform' },
  { href: '/capabilities/', label: 'Capabilities' },
  { href: '/trust/', label: 'Trust' },
  { href: '/technology/', label: 'Technology' },
  { href: '/solutions/', label: 'Solutions' },
  { href: '/company/', label: 'Company' },
] as const;

export const WAITLIST_HREF = '/waitlist/';
export const CTA_LABEL = 'Join the waitlist';
export const PRIVACY_HREF = '/privacy/';

/** Every public page, for the sitemap. */
export const PAGES = ['/', ...NAV.map((n) => n.href), WAITLIST_HREF, PRIVACY_HREF];

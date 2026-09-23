# teipsum.com

The TEIPSUM website, built with [Astro](https://astro.build) as a static site.

## Develop

```sh
npm ci
npm run dev       # local dev server
npm run build     # static output in dist/
npm run preview   # serve dist/ locally
```

Requires Node 22.12 or newer.

## Configuration

Deployment-specific values are read at build time from `PUBLIC_*` environment
variables (see `.env.example`). In GitHub Actions they come from repository
variables of the same name.

| Variable | Purpose | When empty |
| --- | --- | --- |
| `PUBLIC_WAITLIST_ENDPOINT` | HTTPS URL the waitlist form posts to | The form says it is not accepting requests yet and sends nothing |
| `PUBLIC_CF_BEACON_TOKEN` | Cloudflare Web Analytics token (overrides the default) | The site's own token, set in `src/config.ts` |
| `PUBLIC_LINKEDIN_URL` | Company LinkedIn page | No footer link |
| `PUBLIC_PRIVACY_EFFECTIVE_DATE` | Privacy notice effective date, as it should read (for example `October 1, 2026`); set at launch | `/privacy/` shows no date line |

The endpoint's origin is added to the page Content-Security-Policy
(`connect-src`, `form-action`) automatically.

### Waitlist request

`POST` with `Content-Type: application/json`:

```json
{
  "email": "name@company.com",
  "name": "…",
  "organization": "…",
  "role": "executive | it-security | operations | compliance-risk | engineering | other",
  "size": "1–10 | 11–50 | 51–250 | 251–1,000 | 1,000+",
  "industry": "financial-services | healthcare | legal-professional | public-sector | other | \"\"",
  "first_use": "…",
  "consent": true,
  "website": ""
}
```

`website` is a honeypot and is empty for real visitors. Any 2xx response shows
the confirmation; anything else shows an error and keeps the form.

## Deploy

`.github/workflows/deploy.yml` builds on every pull request and, on push to
`main`, deploys `dist/` to GitHub Pages. Pages must be set to deploy from
GitHub Actions.

Set these repository variables before launch:

- `PUBLIC_WAITLIST_ENDPOINT`: until it is set, the form sends nothing.
- `PUBLIC_PRIVACY_EFFECTIVE_DATE`: until it is set, `/privacy/` has no effective date.
- `PUBLIC_LINKEDIN_URL` (optional).

## Social card

`public/og-card-v1.png` and `public/apple-touch-icon.png` are rendered from the
HTML sources in `og/` with `og/render.sh` (headless Chrome).

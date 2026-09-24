// Languages. English lives at the site root and Spanish under /es/; every page
// has a counterpart at the same path in the other language. Page copy lives in
// the page files (src/pages and src/pages/es); the strings shared by the
// layout and components live here, or beside the component that uses them.

export const LANGS = ['en', 'es'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'en';

export function langOf(url: URL): Lang {
  return /^\/es(\/|$)/.test(url.pathname) ? 'es' : 'en';
}

/** The page's path without its language prefix, with a trailing slash. */
export function basePath(pathname: string): string {
  const p = pathname.replace(/\.html$/, '').replace(/\/?$/, '/');
  return p.replace(/^\/es\//, '/');
}

/** A root-relative English path, moved into the given language. */
export function localize(path: string, lang: Lang): string {
  return lang === 'es' ? `/es${path}` : path;
}

/** The copy for the page's language. */
export function pick<T>(url: URL, copy: { en: T; es: NoInfer<T> }): T {
  return copy[langOf(url)];
}

export const UI = {
  en: {
    skip: 'Skip to content',
    menu: 'Menu',
    mainNav: 'Main',
    footerNav: 'Footer',
    langNav: 'Language',
    home: 'TEIPSUM Unica, home',
    cta: 'Join the waitlist',
    ctaHeader: 'Join the waitlist',
    privacy: 'Privacy',
    motto: 'TEIPSUM · Scito te ipsum',
    patents: 'Patents pending',
    early: 'Early access',
    roadmap: 'Roadmap',
    illustrative: 'Illustrative',
    scenario: 'Illustrative scenario',
    ogImage: '/og-card-v1.png',
    ogAlt: 'TEIPSUM · Unica. AI that works for your company, and answers to it.',
    nav: {
      '/platform/': 'Platform',
      '/capabilities/': 'Capabilities',
      '/trust/': 'Trust',
      '/technology/': 'Technology',
      '/solutions/': 'Solutions',
      '/company/': 'Company',
    },
  },
  es: {
    skip: 'Saltar al contenido',
    menu: 'Menú',
    mainNav: 'Principal',
    footerNav: 'Pie de página',
    langNav: 'Idioma',
    home: 'TEIPSUM Unica, inicio',
    cta: 'Únete a la lista de espera',
    // The pinned header button, shortened to fit beside the menu; from 1280 px
    // the header shows the rest of `cta` after it.
    ctaHeader: 'Únete a la lista',
    privacy: 'Privacidad',
    motto: 'Teipsum SA · Scito te ipsum',
    patents: 'Patentes en trámite',
    early: 'Acceso anticipado',
    roadmap: 'Hoja de ruta',
    illustrative: 'Ilustrativo',
    scenario: 'Escenario ilustrativo',
    ogImage: '/og-card-es-v1.png',
    ogAlt: 'TEIPSUM · Unica. IA que trabaja para tu empresa y le rinde cuentas.',
    nav: {
      '/platform/': 'Plataforma',
      '/capabilities/': 'Capacidades',
      '/trust/': 'Confianza',
      '/technology/': 'Tecnología',
      '/solutions/': 'Soluciones',
      '/company/': 'Empresa',
    },
  },
} as const;

/** The language switch: each language's name, as written in that language. */
export const LANG_NAMES: Record<Lang, string> = { en: 'English', es: 'Español' };

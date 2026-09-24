// Waitlist form: accessible client-side validation and submission.
// Posts JSON to the configured endpoint. If no endpoint is configured, it says
// so plainly and sends nothing; it never shows a success it did not get.
// Messages follow the page language (<html lang>); the fields and the request
// are the same in every language.

type Check = (el: HTMLInputElement | HTMLSelectElement) => string;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TIMEOUT_MS = 15000;

const COPY = {
  en: {
    notReady:
      'The waitlist is not accepting requests online yet, so nothing was sent. Please check back soon.',
    network: 'Something went wrong and your request was not sent. Please try again in a moment.',
    rejected: 'We could not accept that request. Please check your details and try again.',
    sending: 'Sending your request…',
    emailEmpty: 'Enter your work email.',
    emailInvalid: 'Enter an email address like name@company.com.',
    name: 'Enter your name.',
    organization: 'Enter your organization.',
    role: 'Choose your role.',
    size: 'Choose your organization size.',
    consent: 'Please confirm we may contact you.',
  },
  es: {
    notReady:
      'La lista de espera todavía no recibe solicitudes en línea, así que no se envió nada. Vuelve a intentarlo pronto.',
    network: 'Algo salió mal y tu solicitud no se envió. Inténtalo de nuevo en un momento.',
    rejected: 'No pudimos aceptar esa solicitud. Revisa tus datos e inténtalo de nuevo.',
    sending: 'Enviando tu solicitud…',
    emailEmpty: 'Escribe tu correo de trabajo.',
    emailInvalid: 'Escribe una dirección de correo como nombre@empresa.com.',
    name: 'Escribe tu nombre.',
    organization: 'Escribe el nombre de tu organización.',
    role: 'Elige tu rol.',
    size: 'Elige el tamaño de tu organización.',
    consent: 'Confirma que podemos contactarte.',
  },
};

const MESSAGES = document.documentElement.lang === 'es' ? COPY.es : COPY.en;

const checks: Record<string, Check> = {
  email: (el) => {
    const v = el.value.trim();
    if (!v) return MESSAGES.emailEmpty;
    if (!EMAIL.test(v) || v.length > 254) return MESSAGES.emailInvalid;
    return '';
  },
  name: (el) => (el.value.trim() ? '' : MESSAGES.name),
  organization: (el) => (el.value.trim() ? '' : MESSAGES.organization),
  role: (el) => (el.value ? '' : MESSAGES.role),
  size: (el) => (el.value ? '' : MESSAGES.size),
  consent: (el) => ((el as HTMLInputElement).checked ? '' : MESSAGES.consent),
};

export function initWaitlist(): void {
  const form = document.getElementById('waitlist-form') as HTMLFormElement | null;
  if (!form) return;

  const endpoint = form.dataset.endpoint ?? '';
  const summary = document.getElementById('error-summary') as HTMLElement;
  const summaryList = summary.querySelector('ul') as HTMLUListElement;
  const status = document.getElementById('form-status') as HTMLElement;
  const confirmation = document.getElementById('confirmation') as HTMLElement;
  const confirmationTitle = document.getElementById('confirmation-title') as HTMLElement;
  const button = form.querySelector('button[type="submit"]') as HTMLButtonElement;

  let attempted = false;
  let sending = false;

  // JavaScript is running, so we validate ourselves with accessible messages.
  form.noValidate = true;

  const field = (name: string) => form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement;

  function setError(name: string, message: string): void {
    const el = field(name);
    const err = document.getElementById(`${el.id}-error`);
    if (!err) return;
    if (message) {
      el.setAttribute('aria-invalid', 'true');
      err.textContent = message;
      err.hidden = false;
    } else {
      el.removeAttribute('aria-invalid');
      err.textContent = '';
      err.hidden = true;
    }
  }

  function validate(): { name: string; id: string; message: string }[] {
    const errors: { name: string; id: string; message: string }[] = [];
    for (const [name, check] of Object.entries(checks)) {
      const el = field(name);
      const message = check(el);
      setError(name, message);
      if (message) errors.push({ name, id: el.id, message });
    }
    return errors;
  }

  function showSummary(errors: { id: string; message: string }[]): void {
    summaryList.replaceChildren(
      ...errors.map(({ id, message }) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${id}`;
        a.textContent = message;
        a.addEventListener('click', (e) => {
          e.preventDefault();
          document.getElementById(id)?.focus();
        });
        li.append(a);
        return li;
      }),
    );
    summary.hidden = false;
    summary.focus();
  }

  function setStatus(message: string): void {
    status.textContent = message;
  }

  function setSending(on: boolean): void {
    sending = on;
    button.setAttribute('aria-disabled', String(on));
  }

  // Update a field's error as the visitor corrects it. Errors only appear on
  // submit, and nothing is re-checked on blur: a blur caused by pressing the
  // submit button must not move the button out from under the pointer. The
  // error summary stays until the next submit for the same reason.
  for (const name of Object.keys(checks)) {
    const el = field(name);
    const recheck = () => {
      if (!attempted || el.getAttribute('aria-invalid') !== 'true') return;
      setError(name, checks[name](el));
    };
    el.addEventListener('input', recheck);
    el.addEventListener('change', recheck);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending) return;
    attempted = true;
    setStatus('');

    const errors = validate();
    if (errors.length) {
      showSummary(errors);
      return;
    }
    summary.hidden = true;

    if (!endpoint) {
      setStatus(MESSAGES.notReady);
      return;
    }

    const data = new FormData(form);
    const text = (k: string) => String(data.get(k) ?? '').trim();
    const payload = {
      email: text('email').toLowerCase(),
      name: text('name'),
      organization: text('organization'),
      role: text('role'),
      size: text('size'),
      industry: text('industry'),
      first_use: text('first_use'),
      consent: data.get('consent') === 'true',
      website: text('website'),
    };

    setSending(true);
    setStatus(MESSAGES.sending);
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
        credentials: 'omit',
        mode: 'cors',
      });
      if (res.ok) {
        form.hidden = true;
        confirmation.hidden = false;
        confirmationTitle.focus();
        return;
      }
      setStatus(res.status >= 400 && res.status < 500 ? MESSAGES.rejected : MESSAGES.network);
    } catch {
      setStatus(MESSAGES.network);
    } finally {
      window.clearTimeout(timer);
      setSending(false);
    }
  });
}

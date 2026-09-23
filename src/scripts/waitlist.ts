// Waitlist form: accessible client-side validation and submission.
// Posts JSON to the configured endpoint. If no endpoint is configured, it says
// so plainly and sends nothing; it never shows a success it did not get.

type Check = (el: HTMLInputElement | HTMLSelectElement) => string;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TIMEOUT_MS = 15000;

const MESSAGES = {
  notReady:
    'The waitlist is not accepting requests online yet, so nothing was sent. Please check back soon.',
  network: 'Something went wrong and your request was not sent. Please try again in a moment.',
  rejected: 'We could not accept that request. Please check your details and try again.',
  sending: 'Sending your request…',
};

const checks: Record<string, Check> = {
  email: (el) => {
    const v = el.value.trim();
    if (!v) return 'Enter your work email.';
    if (!EMAIL.test(v) || v.length > 254) return 'Enter an email address like name@company.com.';
    return '';
  },
  name: (el) => (el.value.trim() ? '' : 'Enter your name.'),
  organization: (el) => (el.value.trim() ? '' : 'Enter your organization.'),
  role: (el) => (el.value ? '' : 'Choose your role.'),
  size: (el) => (el.value ? '' : 'Choose your organization size.'),
  consent: (el) => ((el as HTMLInputElement).checked ? '' : 'Please confirm we may contact you.'),
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

  // Re-check a field as the visitor corrects it, once they have tried to submit.
  for (const name of Object.keys(checks)) {
    const el = field(name);
    const recheck = () => {
      if (!attempted) return;
      setError(name, checks[name](el));
      if (!form.querySelector('[aria-invalid="true"]')) summary.hidden = true;
    };
    el.addEventListener('blur', recheck);
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

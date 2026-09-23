// Mobile menu: Escape closes the open <details> and returns focus to its summary.

export function initMenu(): void {
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const menu = document.querySelector<HTMLDetailsElement>('details.nav-mobile[open]');
    if (!menu) return;
    menu.open = false;
    menu.querySelector('summary')?.focus();
  });
}

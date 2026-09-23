// Draw-in on scroll. Figures marked [data-draw] that start below the fold are
// held back (.undrawn) and released (.drawn) as they come into view. Nothing
// runs when reduced motion is requested, and without this script every
// figure is simply shown as drawn.

const figures = document.querySelectorAll<HTMLElement>('[data-draw]');

if (
  figures.length &&
  'IntersectionObserver' in window &&
  window.matchMedia('(prefers-reduced-motion: no-preference)').matches
) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.replace('undrawn', 'drawn');
        io.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -12% 0px' },
  );

  for (const el of figures) {
    if (el.getBoundingClientRect().top < window.innerHeight) continue;
    el.classList.add('undrawn');
    io.observe(el);
  }
}

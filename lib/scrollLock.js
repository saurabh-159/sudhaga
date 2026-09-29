let locks = 0;
let previous = null;

export function lockBodyScroll() {
  if (typeof document === 'undefined') return () => {};
  locks += 1;
  if (locks === 1) {
    const body = document.body;
    const gap = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    previous = {
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    };
    body.style.overflow = 'hidden';
    if (gap > 0) {
      const current = Number.parseFloat(body.style.paddingRight) || 0;
      body.style.paddingRight = `${current + gap}px`;
    }
  }

  let released = false;
  return () => {
    if (released) return;
    released = true;
    locks = Math.max(0, locks - 1);
    if (locks !== 0 || !previous) return;
    document.body.style.overflow = previous.overflow;
    document.body.style.paddingRight = previous.paddingRight;
    previous = null;
  };
}

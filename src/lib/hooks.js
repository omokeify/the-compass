import * as React from 'react';

export function useParallax(speed = 0.15) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const scroller = el.closest('.main-col');
    if (!scroller) return undefined;

    let raf = 0;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const scRect = scroller.getBoundingClientRect();
      const rel = rect.top - scRect.top - scRect.height / 2;
      el.style.transform = `translate3d(0, ${rel * -speed}px, 0)`;
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    scroller.addEventListener('scroll', onScroll, { passive: true });
    update();

    return () => {
      scroller.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [speed]);

  return ref;
}

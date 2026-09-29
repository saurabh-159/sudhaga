'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const LOOP = [0, 1];
/** Card width (sm) + gap — keep in sync with card classes below */
const CARD_STEP = 300;

const FOCUS_CLASS = {
  top: 'object-top',
  center: 'object-center',
  bottom: 'object-bottom',
};

function itemLabel(count) {
  if (count === 1) return '1 item';
  return `${count} items`;
}

export default function CategoryShowcase({ categories = [] }) {
  const scroller = useRef(null);
  const paused = useRef(false);

  useEffect(() => {
    const element = scroller.current;
    if (!element) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return undefined;

    let frame = 0;
    let last = 0;
    let running = false;

    function tick(now) {
      if (!running) return;
      if (!last) last = now;
      const delta = now - last;
      last = now;

      if (!paused.current) {
        element.scrollLeft += delta * 0.055;
        const half = element.scrollWidth / 2;
        if (half > 0 && element.scrollLeft >= half) element.scrollLeft -= half;
      }

      frame = requestAnimationFrame(tick);
    }

    const observer = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
      last = 0;
      cancelAnimationFrame(frame);
      if (running) frame = requestAnimationFrame(tick);
    });
    observer.observe(element);
    return () => {
      running = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  function nudge(direction) {
    const element = scroller.current;
    if (!element) return;
    const half = element.scrollWidth / 2;
    element.scrollLeft += direction * Math.min(CARD_STEP, Math.max(element.clientWidth * 0.72, 160));
    if (element.scrollLeft >= half) element.scrollLeft -= half;
    if (element.scrollLeft < 0) element.scrollLeft += half;
  }

  function setPaused(next) {
    paused.current = next;
  }

  if (!categories.length) return null;

  return (
    <section className="mb-14">
      <div className="mb-5 flex items-end justify-between gap-4 md:pl-10">
        <div>
          <div className="flex items-center  gap-3">
            <span className="h-px w-8 bg-neutral-900" />
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-900">Collections</p>
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-neutral-950 md:text-[2rem]">Shop by Category</h2>
          <p className="mt-1 text-sm text-neutral-500">Lehnga, style, home, and everything in between.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Previous categories"
            onClick={() => nudge(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 shadow-sm transition hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next categories"
            onClick={() => nudge(1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 shadow-sm transition hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white to-transparent" />

        <div
          ref={scroller}
          className="scrollbar-hide flex gap-4 overflow-x-auto pb-3"
          style={{ scrollbarWidth: 'none' }}
        >
          {LOOP.map((copy) =>
            categories.map((category) => {
              const count = category.count || 0;
              const contain = category.imageFit === 'contain';
              const focusClass = FOCUS_CLASS[category.imageFocus] || 'object-center';

              return (
                <Link
                  key={`${copy}-${category.id}`}
                  href={`/categories/${category.slug}`}
                  aria-hidden={copy === 1 || undefined}
                  tabIndex={copy === 1 ? -1 : undefined}
                  className="group relative aspect-[3/4] w-[calc((100vw-3rem)/2)] shrink-0 overflow-hidden rounded-[1.25rem] shadow-[0_10px_28px_-18px_rgba(0,0,0,0.45)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_-16px_rgba(0,0,0,0.4)] sm:w-[284px]"
                  style={contain ? { backgroundColor: category.imageBg || '#e8e0d6' } : undefined}
                >
                  <img
                    src={category.image}
                    alt={copy === 0 ? category.name : ''}
                    className={`h-full w-full transition duration-700 ease-out group-hover:scale-[1.04] ${
                      contain ? 'object-contain' : `object-cover ${focusClass}`
                    }`}
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent transition duration-300 group-hover:from-black/85" />

                  <span className="absolute inset-x-0 bottom-0 p-3.5 text-white sm:p-4">
                    <span className="mb-2 block text-[10px] font-medium uppercase tracking-[0.16em] text-white/75">
                      {category.blurb}
                    </span>
                    <span className="block text-[1.25rem] font-semibold leading-none tracking-tight sm:text-[1.35rem]">
                      {category.name}
                    </span>
                    <span className="mt-3 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-white/80">{itemLabel(count)}</span>
                      <span className="translate-y-1.5 text-[11px] font-semibold text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        Explore →
                      </span>
                    </span>
                  </span>
                </Link>
              );
            }),
          )}
        </div>
      </div>
    </section>
  );
}

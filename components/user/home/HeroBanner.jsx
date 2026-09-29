'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const INTERVAL = 2800;
const TRANSITION = 'transform 650ms cubic-bezier(0.22, 1, 0.36, 1)';
const GAP = '8px';

function useVisibleCount() {
  const [visible, setVisible] = useState(3);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const apply = () => setVisible(query.matches ? 1 : 3);
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, []);

  return visible;
}

export default function HeroBanner({ slides = [] }) {
  const preferred = useVisibleCount();
  const visible = Math.min(preferred, Math.max(slides.length, 1));
  const [position, setPosition] = useState(visible);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const [startX, setStartX] = useState(null);
  const dragDistance = useRef(0);

  const head = slides.slice(-visible);
  const tail = slides.slice(0, visible);
  const track = [...head, ...slides, ...tail];
  const realIndex = slides.length ? (position - visible + slides.length) % slides.length : 0;
  const atClone = slides.length > 0 && (position < visible || position >= slides.length + visible);
  const step = `(((100% - ${visible - 1} * ${GAP}) / ${visible}) + ${GAP})`;

  useEffect(() => {
    setAnimate(false);
    setPosition(visible);
  }, [visible]);

  useEffect(() => {
    if (paused || atClone) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return undefined;
    const id = setInterval(() => {
      setAnimate(true);
      setPosition((current) => current + 1);
    }, INTERVAL);
    return () => clearInterval(id);
  }, [paused, position, atClone]);

  useEffect(() => {
    if (animate) return undefined;
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setAnimate(true));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [animate]);

  function goBy(stepCount) {
    if (atClone) return;
    setAnimate(true);
    setPosition((current) => current + stepCount);
  }

  function goTo(slideIndex) {
    setAnimate(true);
    setPosition(visible + slideIndex);
  }

  function onTransitionEnd(event) {
    if (event.target !== event.currentTarget || event.propertyName !== 'transform') return;
    if (position >= slides.length + visible) {
      setAnimate(false);
      setPosition(visible);
    } else if (position < visible) {
      setAnimate(false);
      setPosition(position + slides.length);
    }
  }

  function onPointerDown(event) {
    dragDistance.current = 0;
    setStartX(event.clientX);
    event.currentTarget.setPointerCapture(event.pointerId);
    setPaused(true);
  }

  function onPointerUp(event) {
    if (startX == null) return;
    const delta = event.clientX - startX;
    dragDistance.current = Math.abs(delta);
    setStartX(null);
    if (delta > 48) goBy(-1);
    else if (delta < -48) goBy(1);
    if (!event.currentTarget.matches(':hover')) setPaused(false);
  }

  function onCardClick(event) {
    if (dragDistance.current > 48) {
      event.preventDefault();
      dragDistance.current = 0;
    }
  }

  if (!slides.length) return null;

  return (
    <section className="relative -mx-4 mb-12 w-[calc(100%+2rem)]" aria-roledescription="carousel" aria-label="Featured collections">
      <div
        className="overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="flex w-full cursor-grab touch-pan-y active:cursor-grabbing"
          style={{
            gap: GAP,
            transform: `translateX(calc(${-position} * ${step}))`,
            transition: animate ? TRANSITION : 'none',
          }}
          onTransitionEnd={onTransitionEnd}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            setStartX(null);
            setPaused(false);
          }}
        >
          {track.map((slide, slideIndex) => {
            const clone = slideIndex < visible || slideIndex >= slides.length + visible;

            return (
              <Link
                key={`${slide.id}-${slideIndex}`}
                href={slide.href}
                aria-hidden={clone || undefined}
                tabIndex={clone ? -1 : undefined}
                draggable={false}
                onClick={onCardClick}
                className="group relative h-[340px] shrink-0 overflow-hidden sm:h-[460px] md:h-[520px] lg:h-[560px]"
                style={{ width: `calc((100% - ${visible - 1} * ${GAP}) / ${visible})` }}
              >
                <img
                  src={slide.image}
                  alt={clone ? '' : slide.imageAlt}
                  draggable={false}
                  className="h-full w-full select-none object-cover transition duration-700 group-hover:scale-[1.04]"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/80 to-transparent px-4 pb-6 pt-24 text-center">
                  <span className={`block text-xl font-black uppercase tracking-tight text-neutral-950 sm:text-2xl lg:text-[1.7rem] ${slide.accent ? 'italic' : ''}`}>
                    {slide.title}
                  </span>
                  <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-800 sm:text-sm">
                    {slide.subtitle}
                  </span>
                </span>
                {slide.badge && (
                  <span className="absolute right-4 top-4 flex h-[4.5rem] w-[4.5rem] rotate-12 items-center justify-center rounded-full bg-[#ff4f93] px-2 text-center text-[10px] font-bold uppercase leading-tight text-white shadow-md">
                    {slide.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        {slides.map((slide, slideIndex) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`Show ${slide.title}`}
            aria-current={slideIndex === realIndex}
            onClick={() => goTo(slideIndex)}
            className={`rounded-full transition-all duration-300 ${
              slideIndex === realIndex ? 'h-2.5 w-2.5 bg-[#2f6fed]' : 'h-2 w-2 bg-[#c9d7fb] hover:bg-[#9bb6f5]'
            }`}
          />
        ))}
      </div>
    </section>
  );
}

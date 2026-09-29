'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

import 'swiper/css';

const stats = [
  { value: '4.9/5', label: 'Average rating' },
  { value: '10K+', label: 'Happy customers' },
  { value: '98%', label: 'Would recommend' },
  { value: '5000+', label: 'Five-star reviews' },
];

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          className={`h-3.5 w-3.5 ${index < rating ? 'fill-[#c4a574] text-[#c4a574]' : 'text-neutral-200'}`}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

export default function Testimonials({ items = [] }) {
  const swiperRef = useRef(null);
  if (!items.length) return null;

  return (
    <section className="mb-16">
      <div className="mb-8 flex items-end justify-between gap-4 md:pl-10">
        <div className="mx-auto max-w-2xl text-center sm:mx-0 sm:text-left">
          <div className="flex items-center justify-center gap-3 sm:justify-start">
            <span className="h-px w-10 bg-neutral-300" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-500">Customer love</p>
            <span className="h-px w-10 bg-neutral-300 sm:hidden" />
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-neutral-950 md:text-4xl">What our customers say</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-neutral-500 sm:mx-0">
            Real notes from people who wear our festive edits — suits, lehengas, and everyday ethnic.
          </p>
        </div>

        <div className="hidden gap-2 sm:flex">
          <button
            type="button"
            aria-label="Previous reviews"
            onClick={() => swiperRef.current?.slidePrev()}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 shadow-sm transition hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next reviews"
            onClick={() => swiperRef.current?.slideNext()}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 shadow-sm transition hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <Swiper
        modules={[Autoplay]}
        loop={items.length > 6}
        grabCursor
        spaceBetween={12}
        slidesPerView={1.15}
        autoplay={{
          delay: 3200,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 16 },
          1280: { slidesPerView: 3, spaceBetween: 16 },
        }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
      >
        {items.map((item) => (
          <SwiperSlide key={item.id} className="!h-auto">
            <article className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-4 sm:rounded-3xl sm:p-6">
              <Stars rating={item.rating} />
              <p className="mt-4 flex-1 text-sm leading-relaxed text-neutral-700">&ldquo;{item.text}&rdquo;</p>
              <div className="mt-6 flex items-center gap-3 border-t border-neutral-100 pt-5">
                <img src={item.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-neutral-950">{item.name}</p>
                  <p className="mt-0.5 truncate text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">
                    {item.role} · {item.location}
                  </p>
                </div>
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>

      <ul className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-neutral-200 ring-1 ring-neutral-200 md:grid-cols-4">
        {stats.map((stat) => (
          <li key={stat.label} className="bg-white px-4 py-5 text-center">
            <p className="text-2xl font-semibold tracking-tight text-neutral-950">{stat.value}</p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">{stat.label}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

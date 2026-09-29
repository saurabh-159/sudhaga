const PHRASE = 'Flash sale: trendy styles discounted!';

function TickerHalf({ hidden }) {
  return (
    <p className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {Array.from({ length: 6 }, (_, index) => (
        <span
          key={index}
          className="flex items-center text-[11px] font-medium uppercase tracking-[0.22em] text-white"
        >
          <span className="mx-6 text-[13px] tracking-normal text-white/90" aria-hidden>
            —
          </span>
          {PHRASE}
        </span>
      ))}
    </p>
  );
}

export default function OfferCarousel() {
  return (
    <section className="overflow-hidden bg-black" aria-label="Store offers">
      <div className="flex w-max animate-offer-marquee py-2.5 hover:[animation-play-state:paused] motion-reduce:animate-none">
        <TickerHalf />
        <TickerHalf hidden />
      </div>
    </section>
  );
}

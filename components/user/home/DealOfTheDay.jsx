import Link from 'next/link';

const PINK = '#ff4f78';
const YELLOW = '#ffe14a';
const FLAG_COLORS = ['#2f9e44', '#ffe14a', '#ff922b', '#ff8fa3', '#69db7c', '#ffd43b', '#ff6b6b', '#fff3bf'];


function Bunting() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 overflow-hidden" aria-hidden="true">
      <div className="h-px bg-[#f6c945]/80" />
      <div className="flex">
        {Array.from({ length: 36 }, (_, index) => (
          <span
            key={index}
            className="h-4 w-3 shrink-0"
            style={{
              marginLeft: '3px',
              backgroundColor: FLAG_COLORS[index % FLAG_COLORS.length],
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Garland({ side }) {
  const position = side === 'left' ? 'left-3 sm:left-5' : 'right-3 sm:right-5';

  return (
    <div className={`pointer-events-none absolute top-6 z-20 flex flex-col items-center ${position}`} aria-hidden="true">
      <span className="h-8 w-px bg-[#f6c945]" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#ffe14a]" />
      <span className="mt-1 h-2 w-2 rounded-full bg-[#ff9f1c]" />
      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#ffd43b]" />
    </div>
  );
}

function Ornament() {
  return (
    <svg viewBox="0 0 24 24" className="mt-5 h-4 w-4 text-white/85" aria-hidden="true">
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
      <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="0.7" />
      <path
        d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4 18 18M18 6l-1.6 1.6M7.6 16.4 6 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.7"
      />
    </svg>
  );
}

function FestivePanel({ children, className = '' }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[1.75rem] border border-white/30 shadow-[0_16px_40px_rgba(180,30,70,0.14)] ${className}`}
      style={{ backgroundColor: PINK }}
    >
      <Bunting />
      <Garland side="left" />
      <Garland side="right" />
      {children}
    </div>
  );
}

function Banner({ title, subtitle, href }) {
  const content = (
    <div className="px-6 pb-8 pt-10 text-center sm:pb-9 sm:pt-12">
      <h2 className="text-3xl font-bold uppercase tracking-[0.14em] text-white sm:text-4xl">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm italic text-white/95 sm:text-[15px]">{subtitle}</p>
    </div>
  );

  if (!href) return <FestivePanel>{content}</FestivePanel>;

  return (
    <FestivePanel>
      <Link href={href} className="block transition duration-300 hover:brightness-105">
        {content}
      </Link>
    </FestivePanel>
  );
}

function SideImage({ banner, position, hoverPosition }) {
  if (!banner?.image) return null;
  return (
    <Link
      href={banner.href || '/products'}
      className="group relative block h-[340px] overflow-hidden rounded-[1.75rem] shadow-[0_16px_40px_rgba(180,30,70,0.14)] sm:h-[480px] lg:h-[580px]"
    >
      <img
        src={banner.image}
        alt={banner.imageAlt || banner.title || ''}
        className="absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110 group-hover:opacity-0"
        style={{ objectPosition: position }}
      />
      <img
        src={banner.hoverImage || banner.image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-100 group-hover:opacity-100"
        style={{ objectPosition: hoverPosition }}
      />
    </Link>
  );
}

function CenterPanel({ banner }) {
  if (!banner) return null;
  return (
    <FestivePanel className="h-[340px] sm:h-[480px] lg:h-[580px]">
      <div className="flex h-full flex-col items-center justify-center px-6 py-10 text-center sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/80">{banner.badge || 'The festive edit'}</p>
        <h3
          className="mt-4 max-w-[16rem] text-3xl font-extrabold uppercase leading-[1.05] tracking-wide sm:text-4xl"
          style={{ color: YELLOW }}
        >
          {banner.title}
        </h3>
        <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/95">{banner.subtitle}</p>
        <Ornament />
        <Link
          href={banner.href || '/products'}
          className="mt-5 inline-flex items-center rounded-full bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#ff4f78] transition duration-300 hover:bg-[#ffe14a] hover:text-[#3a1020]"
        >
          {banner.cta || 'Shop the edit'}
        </Link>
      </div>
    </FestivePanel>
  );
}

export default function DealOfTheDay({ deal }) {
  const sides = deal?.sides || [];
  const center = deal?.center || null;
  if (!sides.length && !center) return null;

  return (
    <section className="mb-16 flex flex-col gap-4">
      <Banner
        title="Deal of the day"
        subtitle="Festive looks, picked while the offer is still on."
      />
      <div className="grid w-full grid-cols-1 items-stretch gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(260px,0.8fr)_minmax(0,1.25fr)]">
        <SideImage banner={sides[0]} position="center 22%" hoverPosition="center 18%" />
        <CenterPanel banner={center} />
        <SideImage banner={sides[1]} position="center 18%" hoverPosition="center 22%" />
      </div>
      <Banner
        title="Everyday edit"
        subtitle="Versatile picks for workdays, weekends, and daily dressing."
        href="/products"
      />
    </section>
  );
}

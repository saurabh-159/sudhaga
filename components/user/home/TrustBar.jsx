import { Headphones, RefreshCw, ShieldCheck, Truck } from 'lucide-react';

const features = [
  { icon: Truck, title: 'Free shipping', subtitle: 'On orders above ₹999' },
  { icon: RefreshCw, title: 'Easy returns', subtitle: '7-day hassle-free returns' },
  { icon: ShieldCheck, title: 'Secure payments', subtitle: '100% encrypted checkout' },
  { icon: Headphones, title: '24/7 support', subtitle: 'Always here to help' },
];

export default function TrustBar({ variant = 'light' }) {
  const dark = variant === 'dark';

  return (
    <section
      className={
        dark
          ? 'mb-16 overflow-hidden rounded-3xl bg-[#161311]'
          : 'mb-16 overflow-hidden rounded-2xl bg-neutral-200 ring-1 ring-neutral-200'
      }
    >
      <div className={dark ? 'px-6 pt-8 text-center md:px-10 md:pt-10' : 'bg-white px-6 pt-8 text-center'}>
        <div className="flex items-center justify-center gap-3">
          <span className={`h-px w-8 ${dark ? 'bg-[#e7d3b0]' : 'bg-neutral-300'}`} />
          <p
            className={`text-[11px] font-semibold uppercase tracking-[0.28em] ${
              dark ? 'text-[#e7d3b0]' : 'text-neutral-500'
            }`}
          >
            Why shop with us
          </p>
          <span className={`h-px w-8 ${dark ? 'bg-[#e7d3b0]' : 'bg-neutral-300'}`} />
        </div>
        <h3
          className={`mt-3 text-2xl font-medium tracking-tight md:text-3xl ${
            dark ? 'text-[#f7f3ee]' : 'text-neutral-950'
          }`}
        >
          Trusted by thousands of happy customers
        </h3>
      </div>

      <ul className={`mt-8 grid grid-cols-2 md:grid-cols-4 ${dark ? 'bg-white/10' : 'bg-neutral-200'}`}>
        {features.map((feature) => (
          <li
            key={feature.title}
            className={`flex flex-col items-center px-4 py-6 text-center ${dark ? 'bg-[#161311]' : 'bg-white'}`}
          >
            <feature.icon
              className={`h-5 w-5 ${dark ? 'text-[#e7d3b0]' : 'text-neutral-800'}`}
              strokeWidth={1.6}
            />
            <p className={`mt-3 text-sm font-medium ${dark ? 'text-[#f7f3ee]' : 'text-neutral-950'}`}>
              {feature.title}
            </p>
            <p className={`mt-1 text-xs ${dark ? 'text-white/55' : 'text-neutral-500'}`}>{feature.subtitle}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

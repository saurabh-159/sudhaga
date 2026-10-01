import { pageHead } from '@/lib/pageMeta';
import { metaDescription } from '@/lib/site';
import { getStoreProfile } from '@/lib/storeProfile';
import { addressLines } from '@/lib/storeProfileInput';
import { PolicyLinks } from '@/components/user/LegalPage';

export async function generateMetadata() {
  const profile = await getStoreProfile();
  return pageHead({
    title: 'Contact',
    description: metaDescription(profile.contactIntro),
    canonical: '/contact',
  });
}

function Row({ label, children }) {
  return (
    <div>
      <dt className="font-medium text-neutral-950">{label}</dt>
      <dd className="mt-1 text-neutral-600">{children}</dd>
    </div>
  );
}

export default async function ContactPage() {
  const profile = await getStoreProfile();
  const address = addressLines(profile);
  const officerEmail = profile.grievanceEmail || profile.email;
  const officerPhone = profile.grievancePhone;

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-950">Contact</h1>
      <p className="mt-4 text-sm leading-relaxed text-neutral-600">{profile.contactIntro}</p>

      <dl className="mt-8 space-y-4 text-sm">
        <Row label="Seller">{profile.legalName}</Row>
        {address.length ? (
          <Row label="Address">
            {address.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </Row>
        ) : null}
        <Row label="Email">
          <a className="underline" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
        </Row>
        {profile.phone ? (
          <Row label="Phone">
            <a className="underline" href={`tel:${profile.phone}`}>
              {profile.phone}
            </a>
          </Row>
        ) : null}
      </dl>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-neutral-950">Grievance officer</h2>
      <p className="mt-3 text-sm leading-relaxed text-neutral-600">
        For a complaint about an order or this website, contact the grievance officer.
      </p>
      <dl className="mt-4 space-y-4 text-sm">
        <Row label="Designation">{profile.grievanceDesignation}</Row>
        {profile.grievanceName ? <Row label="Name">{profile.grievanceName}</Row> : null}
        <Row label="Email">
          <a className="underline" href={`mailto:${officerEmail}`}>
            {officerEmail}
          </a>
        </Row>
        {officerPhone ? (
          <Row label="Phone">
            <a className="underline" href={`tel:${officerPhone}`}>
              {officerPhone}
            </a>
          </Row>
        ) : null}
      </dl>
      <PolicyLinks />
    </article>
  );
}

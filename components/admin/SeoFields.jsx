import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import AdminFormSection from '@/components/admin/AdminFormSection';

export default function SeoFields({ initial = {}, url = '' }) {
  return (
    <AdminFormSection
      title="Search result"
      description="SEO tasks 1, 2 and 15. These fields are the Google result for this page. Leave them blank to use the name and description above. Schema, sitemap, robots, and the canonical URL are already handled (tasks 5, 6, 7 and 16)."
    >
      {url ? (
        <p className="text-xs text-neutral-500">
          Live URL: {url}. An old ID link for this product redirects here (SEO task 17).
        </p>
      ) : null}
      <Input
        label="Focus keyword"
        name="focusKeyword"
        defaultValue={initial.focusKeyword}
        placeholder="embroidered chanderi suit set"
        hint="SEO task 1. One topic for this page. Do not paste it into every other field."
      />
      <Input
        label="Google title"
        name="seoTitle"
        defaultValue={initial.seoTitle}
        placeholder="Priya Orange Embroidered Chanderi Suit Set"
        hint="SEO task 2. The blue link in Google. Leave blank to use the page name."
      />
      <Textarea
        label="Google description"
        name="metaDescription"
        defaultValue={initial.metaDescription}
        placeholder="Orange chanderi suit set with embroidery, ready for festivals."
        rows={3}
        hint="SEO task 2. The grey text under the link. About 150 characters. Leave blank to use the page description."
      />
      <Input
        label="Image alt text"
        name="imageAlt"
        defaultValue={initial.imageAlt}
        placeholder="Orange embroidered chanderi suit set on a model"
        hint="SEO task 15. A normal sentence describing the photo. Leave blank to use the page name."
      />
    </AdminFormSection>
  );
}

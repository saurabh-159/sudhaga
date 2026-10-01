import ArticleForm from '@/components/admin/ArticleForm';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default function CreateArticle() {
  return (
    <div>
      <AdminPageHeader title="Add article" description="A published article is a server-rendered page at /blog/your-slug." />
      <ArticleForm />
    </div>
  );
}

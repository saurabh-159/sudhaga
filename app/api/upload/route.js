import imagekit from '@/lib/imagekit';
import { requireAdmin } from '@/lib/auth';
import { ok, err, catchErr } from '@/lib/utils';

export async function POST(req) {
  try {
    await requireAdmin();
    const formData = await req.formData();
    const file = formData.get('file');
    if (!file) return err('No file uploaded');

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');

    const result = await imagekit.upload({
      file: base64,
      fileName: file.name || `upload-${Date.now()}`,
      folder: '/sudhaga',
    });

    return ok({ url: result.url, fileId: result.fileId });
  } catch (e) {
    return catchErr(e);
  }
}

import { connectDB } from '@/lib/mongodb';
import Policy from '@/models/Policy';
import { requireAdmin } from '@/lib/auth';
import { ok, err, catchErr } from '@/lib/utils';
import { readPolicyBody } from '@/lib/policyInput';
import { uniquePolicySlug } from '@/lib/policies';

export async function GET(_, { params }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const policy = await Policy.findById(id);
    if (!policy) return err('Page not found', 404);
    return ok(policy);
  } catch (e) {
    return catchErr(e);
  }
}

export async function PUT(req, { params }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const existing = await Policy.findById(id);
    if (!existing) return err('Page not found', 404);

    const input = readPolicyBody(await req.json(), { system: existing.system });
    if (existing.system) {
      input.slug = existing.slug;
      input.system = true;
      input.published = true;
      input.sort = existing.sort;
    } else {
      input.slug = await uniquePolicySlug(input.slug, id);
      input.system = false;
    }

    const policy = await Policy.findByIdAndUpdate(id, input, { new: true, runValidators: true });
    return ok(policy);
  } catch (e) {
    if (e.status) return err(e.message, e.status);
    return catchErr(e);
  }
}

export async function DELETE(_, { params }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const existing = await Policy.findById(id);
    if (!existing) return err('Page not found', 404);
    if (existing.system) return err('This page is required. Edit it instead of deleting it.', 400);
    await existing.deleteOne();
    return ok({ message: 'Deleted' });
  } catch (e) {
    return catchErr(e);
  }
}

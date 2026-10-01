import { connectDB } from '@/lib/mongodb';
import Policy from '@/models/Policy';
import { requireAdmin } from '@/lib/auth';
import { ok, err, catchErr } from '@/lib/utils';
import { readPolicyBody } from '@/lib/policyInput';
import { ensurePolicies, uniquePolicySlug } from '@/lib/policies';

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();
    await ensurePolicies();
    const policies = await Policy.find().sort({ system: -1, sort: 1, createdAt: -1 });
    return ok(policies);
  } catch (e) {
    return catchErr(e);
  }
}

export async function POST(req) {
  try {
    await requireAdmin();
    await connectDB();
    await ensurePolicies();
    const input = readPolicyBody(await req.json());
    input.slug = await uniquePolicySlug(input.slug);
    input.system = false;
    input.sort = 100;
    const policy = await Policy.create(input);
    return ok(policy, 201);
  } catch (e) {
    if (e.status) return err(e.message, e.status);
    return catchErr(e);
  }
}

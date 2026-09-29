import { getHomeContent } from '@/lib/homeContent';
import { ok, catchErr } from '@/lib/utils';

export async function GET() {
  try {
    return ok(await getHomeContent());
  } catch (e) {
    return catchErr(e);
  }
}

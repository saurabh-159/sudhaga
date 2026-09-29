import { connectDB } from '@/lib/mongodb';
import Testimonial from '@/models/Testimonial';
import { requireAdmin } from '@/lib/auth';
import { ok, err, catchErr } from '@/lib/utils';
import { readTestimonialBody } from '@/lib/testimonialInput';

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();
    const reviews = await Testimonial.find().sort({ order: 1, createdAt: -1 });
    return ok(reviews);
  } catch (e) {
    return catchErr(e);
  }
}

export async function POST(req) {
  try {
    await requireAdmin();
    await connectDB();
    const review = await Testimonial.create(readTestimonialBody(await req.json()));
    return ok(review, 201);
  } catch (e) {
    if (e.status) return err(e.message, e.status);
    return catchErr(e);
  }
}

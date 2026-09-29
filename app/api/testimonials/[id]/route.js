import { connectDB } from '@/lib/mongodb';
import Testimonial from '@/models/Testimonial';
import { requireAdmin } from '@/lib/auth';
import { ok, err, catchErr } from '@/lib/utils';
import { readTestimonialBody } from '@/lib/testimonialInput';

export async function GET(_, { params }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const review = await Testimonial.findById(id);
    if (!review) return err('Review not found', 404);
    return ok(review);
  } catch (e) {
    return catchErr(e);
  }
}

export async function PUT(req, { params }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const review = await Testimonial.findByIdAndUpdate(id, readTestimonialBody(await req.json()), {
      new: true,
      runValidators: true,
    });
    if (!review) return err('Review not found', 404);
    return ok(review);
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
    const review = await Testimonial.findByIdAndDelete(id);
    if (!review) return err('Review not found', 404);
    return ok({ message: 'Deleted' });
  } catch (e) {
    return catchErr(e);
  }
}

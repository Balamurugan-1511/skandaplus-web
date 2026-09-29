import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/adminAuth';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    if (!slug) {
      return NextResponse.json(
        { success: false, message: 'Missing course slug.' },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({ where: { slug } });
    if (!course) {
      return NextResponse.json({ success: true, reviews: [], average: null });
    }

    const reviews = await prisma.review.findMany({
      where: { course_id: course.id },
      orderBy: { created_at: 'desc' },
      include: { user: { select: { name: true } } },
    });

    const average = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

    return NextResponse.json({
      success: true,
      average,
      reviews: reviews.map((r) => ({
        id: r.id,
        name: r.user?.name || 'Anonymous',
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at,
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Something went wrong.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const payload = await getSessionUser();

    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Please log in to leave a review.' },
        { status: 401 }
      );
    }

    const { slug, rating, comment } = await request.json();
    const ratingNum = Number(rating);

    if (!slug || !ratingNum || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        { success: false, message: 'A course and a rating from 1-5 are required.' },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({ where: { slug } });
    if (!course) {
      return NextResponse.json({ success: false, message: 'Course not found.' }, { status: 404 });
    }

    const review = await prisma.review.create({
      data: {
        user_id: payload.id,
        course_id: course.id,
        rating: ratingNum,
        comment: comment || null,
      },
    });

    return NextResponse.json({ success: true, id: review.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Something went wrong.' }, { status: 500 });
  }
}

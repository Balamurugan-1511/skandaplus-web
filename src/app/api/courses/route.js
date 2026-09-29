import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

// GET /api/courses            -> active courses only (used by the public Courses page)
// GET /api/courses?all=true   -> every course incl. inactive (used by the admin panel)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('all') === 'true';

    const courses = await prisma.course.findMany({
      where: includeInactive ? undefined : { is_active: true },
      orderBy: { id: 'asc' },
    });

    return NextResponse.json({ success: true, courses });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Something went wrong.' }, { status: 500 });
  }
}

// POST /api/courses -> create a course (admin only; middleware also blocks this, this is a second check)
export async function POST(request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Admin login required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      slug,
      title,
      category,
      course_type,
      description,
      href,
      duration,
      duration_days,
      level,
      price,
      is_active,
    } = body;

    if (!slug || !title || !category || price === undefined) {
      return NextResponse.json(
        { success: false, message: 'slug, title, category and price are required.' },
        { status: 400 }
      );
    }

    // The site only has ONE working course-detail route: /ai-courses/[slug]
    // (it's a generic catch-all that renders any course by slug, regardless
    // of category). There is no /qa-courses, /it-courses, etc. — those
    // aren't real pages, so a course pointed at one would 404 the moment a
    // student clicks it. If a custom link is given, it must still point at
    // the real route for this course; otherwise just leave it blank.
    const expectedHref = `/ai-courses/${slug}`;
    if (href && href !== expectedHref) {
      return NextResponse.json(
        {
          success: false,
          message: `That link doesn't match a real page on the site. Leave "Link" blank to auto-use ${expectedHref}, or enter that exact value.`,
        },
        { status: 400 }
      );
    }
    const cleanHref = expectedHref;

    // How many days a student's access stays valid after payment is
    // confirmed — separate from the free-text "duration" shown on the
    // course page. Defaults to 30 if left blank.
    let cleanDurationDays = 30;
    if (duration_days !== undefined && duration_days !== null && duration_days !== '') {
      const parsedDays = Number(duration_days);
      if (!Number.isFinite(parsedDays) || parsedDays <= 0) {
        return NextResponse.json(
          { success: false, message: 'Access duration (days) must be a positive number.' },
          { status: 400 }
        );
      }
      cleanDurationDays = Math.round(parsedDays);
    }

    const course = await prisma.course.create({
      data: {
        slug,
        title,
        category,
        course_type: course_type || 'training',
        description: description || null,
        href: cleanHref,
        duration: duration || null,
        duration_days: cleanDurationDays,
        level: level || null,
        price,
        is_active: is_active === undefined ? true : !!is_active,
      },
    });

    return NextResponse.json({ success: true, course });
  } catch (error) {
    console.error(error);
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { success: false, message: 'A course with that slug already exists.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ success: false, message: 'Something went wrong.' }, { status: 500 });
  }
}

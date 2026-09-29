import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

// GET /api/courses/:id -> a single course, for the admin page-content editor
// (cover image / what-you'll-learn / curriculum) so it doesn't need to load
// the entire course list just to edit one.
export async function GET(request, { params }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Admin login required.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const course = await prisma.course.findUnique({ where: { id: Number(id) } });
    if (!course) {
      return NextResponse.json({ success: false, message: 'Course not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, course });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Something went wrong.' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Admin login required.' }, { status: 401 });
  }

  try {
    const { id } = await params;
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

    // How many days a student's access stays valid after payment is
    // confirmed. Only changes future calculations — it never retroactively
    // shifts an expiry date already set on an existing enrollment.
    let cleanDurationDays;
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

    // Same guard as course creation: the only real course-detail route is
    // /ai-courses/[slug]. Reject any custom link that doesn't match it so
    // an admin can't accidentally save a broken link (e.g. "/qa-courses/...")
    // that would 404 for every student who clicks it.
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

    const course = await prisma.course.update({
      where: { id: Number(id) },
      data: {
        slug,
        title,
        category,
        course_type,
        description,
        href: cleanHref,
        duration,
        ...(cleanDurationDays !== undefined ? { duration_days: cleanDurationDays } : {}),
        level,
        price,
        is_active,
      },
    });

    return NextResponse.json({ success: true, course });
  } catch (error) {
    console.error(error);
    if (error?.code === 'P2025') {
      return NextResponse.json({ success: false, message: 'Course not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: false, message: 'Something went wrong.' }, { status: 500 });
  }
}

// PATCH /api/courses/:id -> content-only update for the auto-generated
// course page: long_description, what_you_learn, tools, prerequisites,
// who_is_this_for (all string[]) and curriculum (array of
// { week, title, topics: string[] }). Kept separate from PUT so the
// page-content editor doesn't need to resend every base field (slug,
// price, etc.) just to save a curriculum edit.
export async function PATCH(request, { params }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Admin login required.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { what_you_learn, curriculum, long_description, tools, prerequisites, who_is_this_for } =
      await request.json();

    const data = {};

    const stringListFields = {
      what_you_learn,
      long_description,
      tools,
      prerequisites,
      who_is_this_for,
    };
    for (const [key, value] of Object.entries(stringListFields)) {
      if (value === undefined) continue;
      if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
        return NextResponse.json(
          { success: false, message: `${key} must be a list of strings.` },
          { status: 400 }
        );
      }
      data[key] = value.map((s) => s.trim()).filter(Boolean);
    }

    if (curriculum !== undefined) {
      if (
        curriculum !== null &&
        (!Array.isArray(curriculum) ||
          !curriculum.every(
            (m) =>
              m &&
              typeof m.week === 'string' &&
              typeof m.title === 'string' &&
              Array.isArray(m.topics)
          ))
      ) {
        return NextResponse.json(
          { success: false, message: 'curriculum must be a list of { week, title, topics[] }.' },
          { status: 400 }
        );
      }
      data.curriculum = curriculum;
    }

    const course = await prisma.course.update({ where: { id: Number(id) }, data });
    return NextResponse.json({ success: true, course });
  } catch (error) {
    console.error(error);
    if (error?.code === 'P2025') {
      return NextResponse.json({ success: false, message: 'Course not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: false, message: 'Something went wrong.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Admin login required.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.course.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    if (error?.code === 'P2025') {
      return NextResponse.json({ success: false, message: 'Course not found.' }, { status: 404 });
    }
    // Postgres blocks the delete because this course still has enrollments,
    // reviews, or course materials pointing at it — deleting it would orphan
    // that data (including real payment records). Uncheck "Visible on site"
    // instead to hide it from students without losing that history.
    if (error?.code === 'P2003') {
      return NextResponse.json(
        {
          success: false,
          message:
            'This course can\'t be deleted because it already has enrollments, reviews, or materials linked to it (deleting it would erase that history, including payment records). Uncheck "Visible on site" instead to hide it from students.',
        },
        { status: 409 }
      );
    }
    return NextResponse.json({ success: false, message: 'Something went wrong.' }, { status: 500 });
  }
}

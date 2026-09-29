import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { uploadToBucket } from '@/lib/supabaseAdmin';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB, same limit as profile photos

// POST /api/admin/courses/:id/cover-image -> upload a new cover image for a
// course's public detail page and save its URL on the course row. Mirrors
// the existing /api/profile/photo upload pattern.
export async function POST(request, { params }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Admin login required.' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const formData = await request.formData();
    const file = formData.get('image');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, message: 'No image provided.' }, { status: 400 });
    }
    if (!file.type?.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: 'Only image files are allowed.' },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: 'Image must be under 5MB.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase();
    // Fixed filename per course (not timestamped) so re-uploading replaces
    // the old cover instead of piling up unused files in the bucket.
    const path = `course-${id}.${ext}`;

    const publicUrl = await uploadToBucket('course-covers', path, buffer, file.type);

    const course = await prisma.course.update({
      where: { id: Number(id) },
      data: { cover_image_url: publicUrl },
    });

    return NextResponse.json({ success: true, cover_image_url: course.cover_image_url });
  } catch (error) {
    console.error(error);
    if (error?.code === 'P2025') {
      return NextResponse.json({ success: false, message: 'Course not found.' }, { status: 404 });
    }
    return NextResponse.json(
      {
        success: false,
        message: 'Could not upload image. Check Supabase is configured correctly.',
      },
      { status: 500 }
    );
  }
}

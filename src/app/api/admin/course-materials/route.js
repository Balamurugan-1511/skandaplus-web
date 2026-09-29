import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadToBucket } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/adminAuth';

const MAX_SIZE = 25 * 1024 * 1024; // 25MB - PPT/PDF/image files, not video (video is a link only)
const FILE_TYPES = {
  ppt: [
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
  pdf: ['application/pdf'],
  image: ['image/'],
};

// GET /api/admin/course-materials?course_id=<id> -> every material for a course (admin only).
export async function GET(request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Admin login required.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('course_id');
    if (!courseId) {
      return NextResponse.json({ success: false, message: 'Missing course_id.' }, { status: 400 });
    }

    const materials = await prisma.courseMaterial.findMany({
      where: { course_id: Number(courseId) },
      orderBy: [{ sort_order: 'asc' }, { uploaded_at: 'asc' }],
    });

    return NextResponse.json({ success: true, materials });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Something went wrong.' }, { status: 500 });
  }
}

// POST /api/admin/course-materials -> add a material to a course.
// For type = ppt/pdf/image: multipart form with a "file".
// For type = video: JSON body with a "url" (no file upload — just a link).
export async function POST(request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Admin login required.' }, { status: 401 });
  }

  try {
    const contentType = request.headers.get('content-type') || '';

    // Video: just a pasted link, no file involved.
    if (contentType.includes('application/json')) {
      const { course_id, title, type, url } = await request.json();
      if (type !== 'video') {
        return NextResponse.json(
          { success: false, message: 'Only video materials use a link.' },
          { status: 400 }
        );
      }
      if (!course_id || !title || !url) {
        return NextResponse.json(
          { success: false, message: 'Course, title, and a link are required.' },
          { status: 400 }
        );
      }

      const material = await prisma.courseMaterial.create({
        data: { course_id: Number(course_id), title, type: 'video', file_url: url },
      });
      return NextResponse.json({ success: true, material });
    }

    // PPT / PDF / Image: real file upload to Supabase.
    const formData = await request.formData();
    const course_id = formData.get('course_id');
    const title = formData.get('title');
    const type = formData.get('type');
    const file = formData.get('file');

    if (!course_id || !title || !type) {
      return NextResponse.json(
        { success: false, message: 'Course, title, and type are required.' },
        { status: 400 }
      );
    }
    if (!['ppt', 'pdf', 'image'].includes(type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid material type.' },
        { status: 400 }
      );
    }
    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, message: 'No file provided.' }, { status: 400 });
    }

    const allowed = FILE_TYPES[type];
    const matches = allowed.some((prefix) => file.type?.startsWith(prefix));
    if (!matches) {
      return NextResponse.json(
        { success: false, message: `File does not match the selected type (${type}).` },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: 'File must be under 25MB.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.name}`;
    // One bucket total, organized into a folder per course.
    const path = `${course_id}/${safeName}`;
    const publicUrl = await uploadToBucket('course-materials', path, buffer, file.type);

    const material = await prisma.courseMaterial.create({
      data: { course_id: Number(course_id), title, type, file_url: publicUrl },
    });

    return NextResponse.json({ success: true, material });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: 'Could not add material. Check Supabase is configured correctly.',
      },
      { status: 500 }
    );
  }
}

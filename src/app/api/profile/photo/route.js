import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/adminAuth';
import { uploadToBucket } from '@/lib/supabaseAdmin';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB, matches the bucket's own limit

// GET /api/profile/photo -> { photo_url } for the logged-in user, straight
// from the database, so it survives a refresh / a different browser.
export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Please log in.' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { photo_url: true },
  });

  return NextResponse.json({ success: true, photo_url: user?.photo_url || null });
}

// POST /api/profile/photo -> upload a new photo, save its URL on the user row.
export async function POST(request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Please log in.' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('photo');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, message: 'No photo provided.' }, { status: 400 });
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
    // Fixed filename per user (not timestamped) so re-uploading replaces
    // the old photo instead of piling up unused files in the bucket.
    const path = `user-${session.id}.${ext}`;

    const publicUrl = await uploadToBucket('profile-photos', path, buffer, file.type);

    await prisma.user.update({
      where: { id: session.id },
      data: { photo_url: publicUrl },
    });

    return NextResponse.json({ success: true, photo_url: publicUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: 'Could not upload photo. Check Supabase is configured correctly.',
      },
      { status: 500 }
    );
  }
}

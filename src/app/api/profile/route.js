import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/adminAuth';

// GET /api/profile -> the logged-in user's basic info, straight from the database.
export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Please log in.' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { name: true, education: true, dob: true, gender: true },
  });

  return NextResponse.json({ success: true, profile: user });
}

// PUT /api/profile -> update name, education, dob, gender for the logged-in user.
export async function PUT(request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Please log in.' }, { status: 401 });
  }

  try {
    const { fullName, education, dob, gender } = await request.json();

    if (!fullName?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Full name is required.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: session.id },
      data: {
        name: fullName.trim(),
        education: education || null,
        dob: dob || null,
        gender: gender || null,
      },
      select: { name: true, education: true, dob: true, gender: true },
    });

    return NextResponse.json({ success: true, profile: user });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: 'Could not update profile.' },
      { status: 500 }
    );
  }
}

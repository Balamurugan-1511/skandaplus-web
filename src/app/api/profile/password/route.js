import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/adminAuth';
import { verifyPassword, hashPassword } from '@/lib/password';

// POST /api/profile/password -> verify current password, then update to the new one.
export async function POST(request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Please log in.' }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Current and new password are required.' },
        { status: 400 }
      );
    }
    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'New password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
    }

    const valid = await verifyPassword(currentPassword, user.password_hash);
    if (!valid) {
      return NextResponse.json(
        { success: false, message: 'Current password is incorrect.' },
        { status: 401 }
      );
    }

    const newHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: session.id },
      data: { password_hash: newHash },
    });

    return NextResponse.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: 'Could not update password.' },
      { status: 500 }
    );
  }
}

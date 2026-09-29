import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';

export async function POST(request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { success: false, message: 'Token and new password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { reset_token: token } });

    if (!user || !user.reset_token_expiry || user.reset_token_expiry < new Date()) {
      return NextResponse.json(
        { success: false, message: 'This reset link is invalid or has expired.' },
        { status: 400 }
      );
    }

    const password_hash = await hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: { password_hash, reset_token: null, reset_token_expiry: null },
    });

    return NextResponse.json({ success: true, message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Something went wrong.' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { signToken, AUTH_COOKIE } from '@/lib/auth';

export async function POST(request) {
  try {
    const { firstName, lastName, email, password, org, phone } = await request.json();

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields.' },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    const password_hash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        name: `${firstName} ${lastName}`.trim(),
        email: email.toLowerCase(),
        password_hash,
        role: 'student',
        org: org?.trim() || null,
        phone: phone?.trim() || null,
      },
    });

    const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role });

    const response = NextResponse.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });

    response.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Something went wrong.' }, { status: 500 });
  }
}

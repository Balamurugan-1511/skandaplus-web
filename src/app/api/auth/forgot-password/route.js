import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendMail } from '@/lib/mailer';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    // Always return a generic success message, even if the email doesn't
    // exist — this stops people from using this form to check which
    // emails are registered.
    const genericResponse = {
      success: true,
      message: 'If an account exists for that email, a reset link has been generated.',
    };

    if (!user) {
      return NextResponse.json(genericResponse);
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { reset_token: token, reset_token_expiry: expiry },
    });

    const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    const mailResult = await sendMail({
      to: user.email,
      subject: 'Reset your SkandaPlus password',
      html: `
        <p>Hi ${user.name || ''},</p>
        <p>We received a request to reset your password. Click the link below to set a new one:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
      `,
    });

    if (!mailResult.sent) {
      console.log(`[forgot-password] Email not sent (${mailResult.reason}). Reset link for ${user.email}: ${resetLink}`);
    }

    return NextResponse.json({
      ...genericResponse,
      // Only included outside production, and only when the email actually
      // failed to send (e.g. SMTP not configured), so you can still test
      // locally without a working SMTP setup.
      ...(process.env.NODE_ENV !== 'production' && !mailResult.sent ? { devResetLink: resetLink } : {}),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Something went wrong.' }, { status: 500 });
  }
}

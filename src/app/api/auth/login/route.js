import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { signToken, AUTH_COOKIE } from '@/lib/auth';
import { verifyPassword, needsRehash, hashPassword } from '@/lib/password';
import { checkBeforeAttempt, recordFailure, recordSuccess } from '@/lib/loginAttempts';
import { sendMail } from '@/lib/mailer';

// Single generic message for every failure mode — wrong password, unknown
// email, progressive backoff window, and hard lockout all return exactly
// this, with exactly the same status code. Never branch the message on
// which of those it actually was.
const GENERIC_FAIL = { success: false, message: 'Invalid email or password.' };

// A real bcrypt.compare (cost 12) takes roughly this long. We pad the fast
// "blocked before we even touched the DB" paths up to about the same
// duration so a caller timing responses can't easily tell "locked out"
// apart from "wrong password" by latency alone. Not perfect constant-time,
// but it closes the obvious gap.
const TIMING_PAD_MS = 250;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // --- Layer 1: account lockout / progressive backoff ------------------
    // Checked before any DB or bcrypt work. Blocked here for the exact
    // same reason a wrong password is blocked, as far as the client can
    // tell.
    const gate = checkBeforeAttempt(normalizedEmail);
    if (gate.blocked) {
      await sleep(TIMING_PAD_MS);
      return NextResponse.json(GENERIC_FAIL, { status: 401 });
    }
    // -----------------------------------------------------------------------

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      // Record the failure against the submitted email even though no
      // account exists — otherwise "does lockout ever trigger for this
      // email" becomes a way to enumerate valid accounts.
      recordFailure(normalizedEmail);
      await sleep(TIMING_PAD_MS);
      return NextResponse.json(GENERIC_FAIL, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      const { justLocked } = recordFailure(normalizedEmail);
      if (justLocked) {
        // Fire-and-forget-ish, but awaited so errors are caught — a mail
        // failure must never surface as a different response to the
        // client than a normal failed login would.
        await notifyAccountLocked(user);
      }
      return NextResponse.json(GENERIC_FAIL, { status: 401 });
    }

    recordSuccess(normalizedEmail);

    // --- Migration: transparently upgrade weak/legacy hashes -------------
    // We only ever have the plaintext password at the moment of a
    // successful login, so this is the one place a rehash can happen.
    if (needsRehash(user.password_hash)) {
      try {
        const upgradedHash = await hashPassword(password);
        await prisma.user.update({
          where: { id: user.id },
          data: { password_hash: upgradedHash },
        });
      } catch (rehashError) {
        console.error('Password rehash-on-login failed for user id', user.id, rehashError);
      }
    }
    // -----------------------------------------------------------------------

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

// Sends a lockout notification with a reset link, reusing the same
// reset_token/reset_token_expiry fields and flow as forgot-password.
// Never throws — a failed notification must not change the login
// response, and must never be logged with any secret in it.
async function notifyAccountLocked(user) {
  try {
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { reset_token: token, reset_token_expiry: expiry },
    });

    const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    await sendMail({
      to: user.email,
      subject: 'Your SkandaPlus account was temporarily locked',
      html: `
        <p>Hi ${user.name || ''},</p>
        <p>We locked your account for 15 minutes after several failed login attempts.</p>
        <p>If this was you, you can just wait 15 minutes and try again, or reset your password now:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>If this wasn't you, we'd recommend resetting your password as a precaution. This link expires in 1 hour.</p>
      `,
    });
  } catch (err) {
    console.error('[login] Failed to send lockout notification for user id', user.id, err);
  }
}

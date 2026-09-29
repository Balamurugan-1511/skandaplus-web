import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/adminAuth';

// GET /api/saved-jobs -> the logged-in user's saved jobs.
export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Please log in.' }, { status: 401 });
  }

  try {
    const saved = await prisma.savedJob.findMany({
      where: { user_id: session.id },
      orderBy: { saved_at: 'desc' },
      include: { job: true },
    });

    return NextResponse.json({ success: true, saved });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Something went wrong.' }, { status: 500 });
  }
}

// POST /api/saved-jobs -> save a job for the logged-in user. { job_id }
export async function POST(request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Please log in to save a job.' },
      { status: 401 }
    );
  }

  try {
    const { job_id } = await request.json();
    if (!job_id) {
      return NextResponse.json({ success: false, message: 'Missing job.' }, { status: 400 });
    }

    const saved = await prisma.savedJob.upsert({
      where: { user_id_job_id: { user_id: session.id, job_id: Number(job_id) } },
      update: {},
      create: { user_id: session.id, job_id: Number(job_id) },
    });

    return NextResponse.json({ success: true, id: saved.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Something went wrong.' }, { status: 500 });
  }
}

// DELETE /api/saved-jobs -> unsave a job for the logged-in user. { job_id }
export async function DELETE(request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Please log in.' }, { status: 401 });
  }

  try {
    const { job_id } = await request.json();
    if (!job_id) {
      return NextResponse.json({ success: false, message: 'Missing job.' }, { status: 400 });
    }

    await prisma.savedJob.deleteMany({
      where: { user_id: session.id, job_id: Number(job_id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Something went wrong.' }, { status: 500 });
  }
}

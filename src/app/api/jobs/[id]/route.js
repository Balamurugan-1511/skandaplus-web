import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export async function PUT(request, { params }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Admin login required.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      department,
      location,
      work_mode,
      employment_type,
      experience_level,
      description,
      requirements,
      is_active,
    } = body;

    const job = await prisma.job.update({
      where: { id: Number(id) },
      data: {
        title,
        department,
        location,
        work_mode,
        employment_type,
        experience_level,
        description,
        requirements: Array.isArray(requirements) ? requirements : undefined,
        is_active,
      },
    });

    return NextResponse.json({ success: true, job });
  } catch (error) {
    console.error(error);
    if (error?.code === 'P2025') {
      return NextResponse.json({ success: false, message: 'Job not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: false, message: 'Something went wrong.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Admin login required.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.job.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    if (error?.code === 'P2025') {
      return NextResponse.json({ success: false, message: 'Job not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: false, message: 'Something went wrong.' }, { status: 500 });
  }
}

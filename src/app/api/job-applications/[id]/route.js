import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

const ALLOWED_STATUSES = ['new', 'reviewed', 'shortlisted', 'rejected'];

export async function PATCH(request, { params }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Admin login required.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json({ success: false, message: 'Invalid status.' }, { status: 400 });
    }

    const application = await prisma.jobApplication.update({
      where: { id: Number(id) },
      data: { status },
    });

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error(error);
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { success: false, message: 'Application not found.' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: false, message: 'Something went wrong.' }, { status: 500 });
  }
}

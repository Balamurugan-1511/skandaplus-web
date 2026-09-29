import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

// GET /api/enrollments/:id/history — admin only. Returns the full audit
// trail of payment_status changes for one enrollment (oldest first): who
// changed it, what it changed from/to, and any note (e.g. rejection reason).
export async function GET(request, { params }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Admin login required.' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const logs = await prisma.paymentStatusLog.findMany({
      where: { enrollment_id: Number(id) },
      orderBy: { created_at: 'asc' },
    });

    return NextResponse.json({ success: true, logs });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Something went wrong.' }, { status: 500 });
  }
}

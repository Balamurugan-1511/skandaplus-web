import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

// PUT /api/admin/blogs/[id] -> approve ("published") or reject ("rejected") a pending post.
export async function PUT(request, { params }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: 'Admin access required.' },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!['published', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ success: false, message: 'Invalid status.' }, { status: 400 });
    }

    const post = await prisma.blog.update({
      where: { id: Number(id) },
      data: { status },
    });

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Something went wrong.' }, { status: 500 });
  }
}

// DELETE /api/admin/blogs/[id] -> reject and remove a submission entirely.
export async function DELETE(request, { params }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: 'Admin access required.' },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    await prisma.blog.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Something went wrong.' }, { status: 500 });
  }
}

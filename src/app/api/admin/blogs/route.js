import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

// GET /api/admin/blogs -> pending submissions, newest first (admin only).
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Admin login required.' }, { status: 401 });
  }

  try {
    const posts = await prisma.blog.findMany({
      where: { status: 'pending' },
      orderBy: { published_at: 'desc' },
      include: { author: { select: { name: true, email: true } } },
    });

    return NextResponse.json({ success: true, posts });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Something went wrong.' }, { status: 500 });
  }
}

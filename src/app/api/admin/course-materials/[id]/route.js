import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

// DELETE /api/admin/course-materials/[id] -> remove a material (admin only).
// Note: this removes the database row; the underlying file stays in the
// Supabase bucket (harmless, just unused storage) — fine to leave as-is.
export async function DELETE(request, { params }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Admin login required.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.courseMaterial.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Something went wrong.' }, { status: 500 });
  }
}

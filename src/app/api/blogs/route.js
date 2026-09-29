import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/adminAuth';
import { uploadToBucket } from '@/lib/supabaseAdmin';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// GET /api/blogs -> public listing (published only by default).
// GET /api/blogs?status=pending -> used by the admin approval screen.
// GET /api/blogs?mine=1 -> the logged-in user's own submissions, any status.
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const mine = searchParams.get('mine');

    if (mine) {
      const session = await getSessionUser();
      if (!session) {
        return NextResponse.json({ success: false, message: 'Please log in.' }, { status: 401 });
      }
      const posts = await prisma.blog.findMany({
        where: { author_id: session.id },
        orderBy: { published_at: 'desc' },
      });
      return NextResponse.json({ success: true, posts });
    }

    const where = {};
    if (category && category !== 'All') where.category = category;
    // Public visitors only ever see published posts. Only an explicit
    // ?status=pending (used by the admin screen) sees anything else.
    where.status = status === 'pending' ? 'pending' : 'published';

    const posts = await prisma.blog.findMany({
      where,
      orderBy: { published_at: 'desc' },
      include: { author: { select: { name: true } } },
    });

    return NextResponse.json({ success: true, posts });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Something went wrong.' }, { status: 500 });
  }
}

// POST /api/blogs -> a logged-in user submits a blog post. It always lands
// as "pending" here; only the admin approval screen can flip it to "published".
// Sent as multipart FormData (not JSON) so a cover image can be attached in
// the same request — it's optional, a post can still be submitted without one.
export async function POST(request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Please log in to submit a blog post.' },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const title = formData.get('title')?.toString().trim();
    const body = formData.get('body')?.toString().trim();
    const category = formData.get('category')?.toString().trim() || null;
    const excerpt = formData.get('excerpt')?.toString().trim();
    const image = formData.get('image');

    if (!title || !body) {
      return NextResponse.json(
        { success: false, message: 'Title and content are required.' },
        { status: 400 }
      );
    }

    let image_url = null;
    let image_alt = null;
    if (image && typeof image !== 'string' && image.size > 0) {
      if (!image.type?.startsWith('image/')) {
        return NextResponse.json(
          { success: false, message: 'Cover image must be an image file.' },
          { status: 400 }
        );
      }
      if (image.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { success: false, message: 'Cover image must be under 5MB.' },
          { status: 400 }
        );
      }
    }

    const baseSlug = slugify(title) || 'post';
    let slug = baseSlug;
    let suffix = 1;
    while (await prisma.blog.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    if (image && typeof image !== 'string' && image.size > 0) {
      const buffer = Buffer.from(await image.arrayBuffer());
      const ext = (image.name?.split('.').pop() || 'jpg').toLowerCase();
      // Path keyed by slug (not blog id, which doesn't exist yet at this point).
      const path = `${slug}.${ext}`;
      image_url = await uploadToBucket('blog-covers', path, buffer, image.type);
      image_alt = title;
    }

    const post = await prisma.blog.create({
      data: {
        author_id: session.id,
        slug,
        title,
        category,
        excerpt: excerpt || body.slice(0, 160),
        body,
        image_url,
        image_alt,
        status: 'pending',
      },
    });

    return NextResponse.json({
      success: true,
      id: post.id,
      message: 'Submitted for admin approval.',
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Something went wrong.' }, { status: 500 });
  }
}

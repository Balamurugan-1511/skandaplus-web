import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { prisma } from '@/lib/prisma';

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

export async function generateMetadata({ params }) {
  const post = await prisma.blog.findUnique({ where: { slug: params.slug } });
  if (!post) return { title: 'Post Not Found | AI Plus' };
  return { title: `${post.title} | AI Plus Blog`, description: post.excerpt };
}

export default async function BlogPostPage({ params }) {
  const post = await prisma.blog.findUnique({ where: { slug: params.slug } });
  if (!post) notFound();

  const related = await prisma.blog.findMany({
    where: { category: post.category, slug: { not: post.slug } },
    take: 2,
    orderBy: { published_at: 'desc' },
  });

  const bodyParagraphs = post.body.split('\n\n');

  return (
    <div className="font-body text-bodyText">
      <Header />
      <section className="bg-navy py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="inline-block bg-accentBlue text-white text-xs font-body font-medium px-4 py-1.5 rounded-full mb-4">
            {post.category}
          </span>
          <h1 className="font-heading font-bold text-white text-3xl lg:text-4xl mb-4 leading-tight">
            {post.title}
          </h1>
          <p className="font-body text-blue-200 text-sm">{formatDate(post.published_at)}</p>
          <div className="flex items-center justify-center gap-2 mt-5 font-body text-sm text-blue-300">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-white transition-colors">
              Blog
            </Link>
            <span>/</span>
            <span className="text-white truncate max-w-[200px]">{post.title}</span>
          </div>
        </div>
      </section>

      <section className="py-14 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          {post.image_url && (
            <img
              src={post.image_url}
              alt={post.image_alt || post.title}
              className="w-full h-auto rounded-2xl shadow-xl mb-10"
            />
          )}
          <div className="space-y-6 font-body text-bodyText text-base leading-relaxed">
            {bodyParagraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          <div className="mt-12 bg-gray-50 rounded-2xl p-8 text-center">
            <h3 className="font-heading font-semibold text-navy text-xl mb-2">
              Want to go deeper on this topic?
            </h3>
            <p className="font-body text-bodyText text-sm mb-5">
              Talk to our team about which AI Plus course fits your goals.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-accentBlue text-white font-body font-semibold px-7 py-3.5 rounded hover:bg-navy transition-colors"
            >
              Get Free Counselling
            </Link>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-14 bg-gray-50 border-t border-gray-100">
          <div className="max-w-5xl mx-auto px-4">
            <h3 className="font-heading font-semibold text-navy text-xl mb-6">
              More in {post.category}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="bg-white rounded-xl overflow-hidden shadow-card hover:shadow-cardHover transition-all duration-300 group"
                >
                  <img
                    src={r.image_url}
                    alt={r.image_alt || r.title}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="p-5">
                    <h4 className="font-heading font-semibold text-navy text-sm leading-snug group-hover:text-accentBlue transition-colors line-clamp-2">
                      {r.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

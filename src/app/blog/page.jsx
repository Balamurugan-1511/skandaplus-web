'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);

  // Build the filter button list once, from every published post — the API
  // doesn't return a separate category list, so we derive the unique set
  // ourselves. This only runs once on mount, independent of whichever
  // category is currently selected below.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/blogs')
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !data?.success) return;
        const unique = Array.from(
          new Set((data.posts || []).map((p) => p?.category).filter(Boolean))
        );
        setCategories(['All', ...unique]);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(
      `/api/blogs${activeCategory !== 'All' ? `?category=${encodeURIComponent(activeCategory)}` : ''}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.success) setPosts(data.posts || []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeCategory]);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) setSubscribed(true);
  };

  const filteredPosts = posts;

  return (
    <div className="font-body text-bodyText">
      <Header />
      {/* Page Header */}
      <section className="bg-navy py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="font-heading font-bold text-white text-4xl lg:text-5xl mb-4">
            AI & Tech Blog
          </h1>
          <p className="font-body text-blue-200 text-lg max-w-2xl mx-auto">
            Insights, tutorials, and career guides from Pune&apos;s AI training experts.
          </p>
          <div className="flex items-center justify-center gap-2 mt-5 font-body text-sm text-blue-300">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-white">Blog</span>
          </div>
        </div>
      </section>
      {/* Category Filter */}
      <section className="bg-white border-b border-gray-100 py-5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center gap-3">
            {categories?.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-body font-medium transition-colors ${cat === activeCategory ? 'bg-accentBlue text-white' : 'bg-gray-100 text-bodyText hover:bg-accentBlue hover:text-white'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>
      {/* Blog Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <p className="text-center font-body text-bodyText text-base py-10">Loading posts…</p>
          ) : filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {filteredPosts?.map((post) => (
                <article
                  key={post?.slug}
                  className="bg-white rounded-xl overflow-hidden shadow-card hover:shadow-cardHover transition-all duration-300 hover:-translate-y-1 group"
                >
                  <Link href={`/blog/${post?.slug}`} className="block relative overflow-hidden">
                    <img
                      src={post?.image_url}
                      alt={post?.image_alt || post?.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 bg-accentBlue text-white text-xs font-body font-medium px-4 py-1.5 rounded-full">
                      {post?.category}
                    </span>
                  </Link>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs text-bodyText font-body mb-3">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {formatDate(post?.published_at)}
                    </div>
                    <Link href={`/blog/${post?.slug}`}>
                      <h3 className="font-heading font-semibold text-navy text-base leading-snug mb-3 group-hover:text-accentBlue transition-colors line-clamp-2">
                        {post?.title}
                      </h3>
                    </Link>
                    <p className="font-body text-bodyText text-sm leading-relaxed line-clamp-3 mb-4">
                      {post?.excerpt}
                    </p>
                    <Link
                      href={`/blog/${post?.slug}`}
                      className="font-body font-semibold text-accentBlue text-sm hover:text-navy transition-colors"
                    >
                      Read More →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-center font-body text-bodyText text-base py-10">
              No posts in this category yet — check back soon.
            </p>
          )}
        </div>
      </section>
      {/* Newsletter CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-heading font-semibold text-navy text-2xl mb-3">
            Stay Updated with AI Insights
          </h2>
          <p className="font-body text-bodyText text-base mb-6">
            Subscribe to our newsletter for weekly AI tutorials, career tips, and industry news from
            Pune.
          </p>
          {subscribed ? (
            <p className="font-body font-semibold text-accentBlue text-base">
              You&apos;re subscribed! Look out for our next issue.
            </p>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:border-accentBlue"
              />
              <button
                type="submit"
                className="bg-accentBlue text-white font-body font-semibold px-6 py-3 rounded-lg hover:bg-navy transition-colors"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}

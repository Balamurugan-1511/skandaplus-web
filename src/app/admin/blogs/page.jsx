'use client';

import React, { useEffect, useState } from 'react';

export default function AdminBlogsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [expanded, setExpanded] = useState(null);

  const loadPosts = () => {
    setLoading(true);
    fetch('/api/admin/blogs')
      .then((res) => res.json())
      .then((data) => setPosts(data?.posts || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleDecision = async (id, status) => {
    setMessage('');
    const res = await fetch(`/api/admin/blogs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (data?.success) {
      // Approved/rejected posts leave the pending queue immediately.
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } else {
      setMessage(data?.message || 'Could not update this post.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-heading font-bold text-navy text-2xl">Blog Submissions</h1>
        <span className="text-sm font-body text-bodyText">{posts.length} pending</span>
      </div>

      {message && <p className="text-sm text-red-500 mb-4">{message}</p>}

      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        {loading ? (
          <p className="px-4 py-6 text-center text-bodyText text-sm">Loading…</p>
        ) : posts.length === 0 ? (
          <p className="px-4 py-6 text-center text-bodyText text-sm">
            No blog submissions waiting for approval.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {posts.map((post) => (
              <div key={post.id} className="p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3 min-w-0">
                    {post.image_url && (
                      <img
                        src={post.image_url}
                        alt={post.image_alt || post.title}
                        className="w-16 h-16 rounded-lg object-cover border border-gray-200 shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <h3 className="font-heading font-semibold text-navy text-base">
                        {post.title}
                      </h3>
                      <p className="text-xs text-bodyText mt-1">
                        By {post.author?.name || 'Unknown'} ({post.author?.email}) &middot;{' '}
                        {new Date(post.published_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setExpanded(expanded === post.id ? null : post.id)}
                      className="text-xs font-semibold text-accentBlue hover:underline"
                    >
                      {expanded === post.id ? 'Hide content' : 'Read content'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDecision(post.id, 'published')}
                      className="text-xs font-semibold bg-green-100 text-green-700 px-3 py-1.5 rounded-full hover:bg-green-200 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDecision(post.id, 'rejected')}
                      className="text-xs font-semibold bg-red-100 text-red-700 px-3 py-1.5 rounded-full hover:bg-red-200 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
                {expanded === post.id && (
                  <p className="text-sm text-bodyText mt-4 whitespace-pre-wrap border-t border-gray-100 pt-4">
                    {post.body}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

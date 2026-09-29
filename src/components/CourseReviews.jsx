'use client';

import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

export default function CourseReviews({ slug }) {
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const loadReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      if (data?.success) {
        setReviews(data.reviews || []);
        setAverage(data.average);
      }
    } catch {
      // silently ignore — reviews are supplementary content
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setError('Please select a star rating.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, rating, comment }),
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        setSuccess(true);
        setRating(0);
        setComment('');
        loadReviews();
      } else if (res.status === 401) {
        setError('Please log in to leave a review.');
      } else {
        setError(data?.message || 'Something went wrong.');
      }
    } catch {
      setError('Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-heading font-semibold text-navy text-2xl lg:text-3xl">
            Student Reviews
          </h2>
          {average != null && (
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="font-heading font-semibold text-navy text-lg">
                {average.toFixed(1)}
              </span>
              <span className="font-body text-bodyText text-sm">
                ({reviews.length} review{reviews.length === 1 ? '' : 's'})
              </span>
            </div>
          )}
        </div>

        {!loading && reviews.length === 0 && (
          <p className="font-body text-bodyText text-sm mb-8">
            Be the first to review this course.
          </p>
        )}

        {reviews.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
            {reviews.map((r) => (
              <div key={r.id} className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`w-4 h-4 ${n <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                {r.comment && <p className="font-body text-bodyText text-sm mb-3">{r.comment}</p>}
                <p className="font-body text-navy text-xs font-semibold">{r.name}</p>
              </div>
            ))}
          </div>
        )}

        <div className="bg-gray-50 rounded-xl p-6 lg:p-8 max-w-xl">
          <h3 className="font-heading font-semibold text-navy text-base mb-4">Leave a Review</h3>
          {success ? (
            <p className="font-body text-green-700 text-sm">Thanks for your review!</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    aria-label={`Rate ${n} stars`}
                  >
                    <Star
                      className={`w-7 h-7 ${n <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                  </button>
                ))}
              </div>
              <textarea
                rows={3}
                placeholder="Share your experience with this course..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 font-body text-sm text-darkText placeholder-gray-400 focus:outline-none focus:border-accentBlue transition-colors resize-none"
              />
              {error && <p className="text-red-500 text-xs font-body">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="bg-accentBlue text-white font-body font-semibold px-6 py-3 rounded hover:bg-navy transition-colors disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

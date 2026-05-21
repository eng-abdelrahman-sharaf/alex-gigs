'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { apiFetch } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { Star, MessageSquare, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function OrderReviewPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [descr, setDescr] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (rating < 1 || rating > 5) {
      setError('Please choose a rating between 1 and 5 stars.');
      return;
    }

    setLoading(true);

    const res = await apiFetch('/reviews', {
      method: 'POST',
      body: JSON.stringify({
        order_id: id,
        rating,
        descr: descr || 'Wonderful work, very professional.',
        created_by: 'BUYER',
      }),
    });

    if (res.success) {
      setSuccess(true);
    } else {
      setError(res.error || 'Failed to submit the review rating.');
    }
    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-basalt-950 text-slate-100">
        <Navbar />
        <div className="flex-grow flex justify-center items-center">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-gold-500 border-t-transparent"></span>
        </div>
        <Footer />
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col min-h-screen bg-basalt-950 text-slate-100">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-16 px-4">
          <div className="w-full max-w-md rounded-2xl glass-panel p-8 text-center space-y-6 shadow-2xl">
            <div className="mx-auto h-16 w-16 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white font-heading">
                Feedback Submitted!
              </h1>
              <p className="mt-2 text-xs text-slate-400">
                Thank you for rating your freelancer and helping the marketplace grow.
              </p>
            </div>
            <button
              onClick={() => router.push(`/orders/${id}`)}
              className="w-full py-3 rounded-xl bg-gold-500 text-xs font-bold text-basalt-950 hover:bg-gold-400 transition-colors cursor-pointer"
            >
              Back to Order Details
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-basalt-950 text-slate-100">
      <Navbar />

      <main className="flex-grow mx-auto max-w-md w-full px-4 py-16 flex items-center justify-center">
        <div className="w-full rounded-2xl glass-panel p-8 shadow-2xl relative">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 h-20 w-20 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400">
            <Star className="h-8 w-8 fill-gold-500" />
          </div>

          <div className="mt-6 text-center">
            <h1 className="text-2xl font-extrabold tracking-tight text-white font-heading">
              Submit Job Feedback
            </h1>
            <p className="mt-1.5 text-xs text-slate-400">
              Rate your experience for Order Reference ID: #{id}
            </p>
          </div>

          {error && (
            <div className="mt-6 flex items-start space-x-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3.5 text-xs text-red-400">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            
            {/* Star Selector */}
            <div className="text-center space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Quality of deliverables
              </label>
              
              <div className="flex justify-center space-x-2.5">
                {[1, 2, 3, 4, 5].map((starValue) => {
                  const isGold = hoverRating !== null ? starValue <= hoverRating : starValue <= rating;
                  return (
                    <button
                      key={starValue}
                      type="button"
                      onClick={() => setRating(starValue)}
                      onMouseEnter={() => setHoverRating(starValue)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-1 text-slate-600 hover:scale-125 transition-transform outline-none"
                    >
                      <Star className={`h-8 w-8 ${isGold ? 'text-gold-500 fill-gold-500' : 'text-slate-700'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment details */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Detailed Review Comment
              </label>
              <div className="relative flex items-start rounded-xl border border-gold-500/15 bg-basalt-900 focus-within:border-gold-500/40 transition-colors">
                <div className="pl-3.5 pt-3.5 text-slate-500">
                  <MessageSquare className="h-4.5 w-4.5" />
                </div>
                <textarea
                  required
                  placeholder="Describe the responsiveness, skills, code quality, and deliverables accuracy..."
                  value={descr}
                  onChange={(e) => setDescr(e.target.value)}
                  rows={4}
                  className="w-full bg-transparent px-3.5 py-3 text-xs text-slate-200 outline-none resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-xs font-bold text-basalt-950 hover:from-gold-500 hover:to-gold-400 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-gold-500/10 cursor-pointer"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-basalt-950 border-t-transparent"></span>
              ) : (
                <span>Submit Star Review</span>
              )}
            </button>
          </form>

        </div>
      </main>

      <Footer />
    </div>
  );
}

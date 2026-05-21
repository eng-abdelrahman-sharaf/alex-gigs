'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/utils/api';
import { Search, ArrowRight, Star, Briefcase, Users, Layers, Award } from 'lucide-react';

interface Gig {
  id: string;
  title: string;
  descr: string;
  tags?: string[];
  freelancer_id: string;
  freelancer_name?: string;
  freelancer_title?: string;
  price?: string;
  avg_rating?: string | number;
  total_reviews?: string | number;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredGigs, setFeaturedGigs] = useState<Gig[]>([]);
  const [stats, setStats] = useState({
    freelancers: 124,
    gigs: 85,
    orders: 342,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      // Fetch gigs from API
      const res = await apiFetch<Gig[]>('/gigs');
      if (res.success && res.data) {
        // Limit to 3 featured gigs for the homepage
        const list = Array.isArray(res.data) ? res.data : (res.data as any).gigs || [];
        setFeaturedGigs(list.slice(0, 3));
        
        // Calculate mock stats based on database entries if available
        if (list.length > 0) {
          setStats({
            freelancers: Math.max(12, new Set(list.map((g: any) => g.freelancer_id)).size),
            gigs: list.length,
            orders: Math.max(45, list.length * 3),
          });
        }
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/gigs?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const categories = [
    { name: 'Web Development', desc: 'React, Next.js, Node.js REST APIs', icon: Layers, query: 'express' },
    { name: 'Database Design', desc: 'PostgreSQL, SQL optimization, schema styling', icon: Briefcase, query: 'postgres' },
    { name: 'Technical Writing', desc: 'Zod specifications, API documentations', icon: Award, query: 'typescript' },
    { name: 'UI / UX Design', desc: 'Premium glassmorphic user dashboards', icon: Users, query: 'design' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-basalt-950 text-slate-100 selection:bg-gold-500/30 selection:text-gold-400">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32 border-b border-gold-500/10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-basalt-900 via-basalt-950 to-basalt-950">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(245,158,11,0.03),transparent_40%)]"></div>
        <div className="absolute top-1/4 right-1/4 h-72 w-72 rounded-full bg-teal-500/5 blur-3xl"></div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="mx-auto max-w-3xl">
            <span className="inline-flex items-center space-x-1 rounded-full border border-gold-500/30 bg-gold-500/5 px-3 py-1 text-xs font-semibold text-gold-400 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-400 animate-pulse"></span>
              <span>Egypt's Gateway to Elite Freelance Talent</span>
            </span>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl font-heading">
              Hire Elite Egyptian Talent on <span className="bg-gradient-to-r from-gold-400 via-gold-500 to-amber-500 bg-clip-text text-transparent">AlexGigs</span>
            </h1>

            <p className="mt-6 text-lg text-slate-400 max-w-xl mx-auto font-sans leading-relaxed">
              Unlock exceptional Pharaonic-level craftsmanship in development, database schema architecture, and creative visual design.
            </p>

            {/* Majestic Search Bar */}
            <form onSubmit={handleSearchSubmit} className="mt-10 mx-auto max-w-2xl">
              <div className="relative flex items-center p-1 rounded-full bg-basalt-900/90 border border-gold-500/20 shadow-xl shadow-gold-500/5 focus-within:border-gold-500/50 transition-all duration-300">
                <div className="pl-4 text-slate-500">
                  <Search className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  placeholder="Search for APIs, PostgreSQL setups, Frontend dashboards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent px-4 py-3 text-sm text-slate-200 outline-none placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-gold-600 to-gold-500 text-xs font-bold text-basalt-950 hover:from-gold-500 hover:to-gold-400 transition-all duration-200 cursor-pointer shadow-lg shadow-gold-500/10"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-12 border-b border-gold-500/10 bg-basalt-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 text-center">
            <div className="p-6 rounded-2xl glass-panel">
              <div className="text-3xl font-black text-gold-400 font-heading">{stats.freelancers}+</div>
              <div className="mt-1 text-xs uppercase tracking-widest text-slate-400 font-medium">Verified Freelancers</div>
            </div>
            <div className="p-6 rounded-2xl glass-panel">
              <div className="text-3xl font-black text-teal-400 font-heading">{stats.gigs}</div>
              <div className="mt-1 text-xs uppercase tracking-widest text-slate-400 font-medium">Active Digital Services</div>
            </div>
            <div className="p-6 rounded-2xl glass-panel">
              <div className="text-3xl font-black text-gold-400 font-heading">{stats.orders}+</div>
              <div className="mt-1 text-xs uppercase tracking-widest text-slate-400 font-medium">Completed Bookings</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white font-heading">
              Explore Premium Domains
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Browse top-tier skills sourced directly from Alexandria to Aswan
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat, idx) => {
              const IconComp = cat.icon;
              return (
                <Link
                  key={idx}
                  href={`/gigs?search=${cat.query}`}
                  className="p-6 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between h-48 cursor-pointer group"
                >
                  <div className="h-10 w-10 rounded-xl bg-gold-500/10 text-gold-400 flex items-center justify-center border border-gold-500/20 group-hover:bg-gold-500 group-hover:text-basalt-950 transition-all duration-300">
                    <IconComp className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-gold-400 transition-colors font-heading">
                      {cat.name}
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Gigs Section */}
      <section className="py-20 border-t border-gold-500/10 bg-basalt-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white font-heading">
                Top Rated Services
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Highly recommended gigs based on Egyptian standards
              </p>
            </div>
            <Link
              href="/gigs"
              className="flex items-center space-x-1.5 text-xs font-bold text-gold-400 hover:text-gold-300 transition-colors"
            >
              <span>View Catalog</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="mt-12 flex justify-center py-10">
              <span className="h-8 w-8 animate-spin rounded-full border-4 border-gold-500 border-t-transparent"></span>
            </div>
          ) : featuredGigs.length === 0 ? (
            <div className="mt-12 text-center py-16 rounded-2xl glass-panel p-6">
              <p className="text-slate-400 text-sm">No services listed yet.</p>
              <Link
                href="/settings"
                className="mt-4 inline-block px-5 py-2 rounded-full border border-gold-500/30 bg-gold-500/5 text-xs font-semibold text-gold-400 hover:bg-gold-500/15 transition-all"
              >
                Onboard and List the First Gig
              </Link>
            </div>
          ) : (
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
              {featuredGigs.map((gig) => (
                <Link
                  key={gig.id}
                  href={`/gigs/${gig.id}`}
                  className="rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between overflow-hidden cursor-pointer"
                >
                  <div className="p-6">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {gig.tags?.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 text-[10px] font-bold border border-teal-500/15"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <h3 className="mt-4 text-base font-bold text-white line-clamp-2 hover:text-gold-400 transition-colors font-heading">
                      {gig.title}
                    </h3>
                    <p className="mt-2 text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {gig.descr}
                    </p>
                  </div>

                  <div className="border-t border-gold-500/5 bg-basalt-900/60 p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-gold-400">
                      <Star className="h-3.5 w-3.5 fill-gold-500 text-gold-500" />
                      <span>{Number(gig.avg_rating || 0).toFixed(1)}</span>
                      <span className="text-slate-500 font-normal">({gig.total_reviews || 0})</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] block text-slate-500 uppercase tracking-wider font-semibold">
                        Starting at
                      </span>
                      <span className="text-sm font-black text-white">
                        ${gig.price || '45.00'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

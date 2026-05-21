'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { apiFetch } from '@/utils/api';
import { Search, Star, SlidersHorizontal, Tag, RefreshCw } from 'lucide-react';

interface Gig {
  id: string;
  title: string;
  descr: string;
  tags?: string[];
  freelancer_id: string;
  price?: string;
  avg_rating?: string | number;
  total_reviews?: string | number;
}

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const searchVal = searchParams.get('search') || '';
  const tagVal = searchParams.get('tag') || '';

  const [search, setSearch] = useState(searchVal);
  const [selectedTag, setSelectedTag] = useState(tagVal);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync state with URL queries on load/change
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setSelectedTag(searchParams.get('tag') || '');
  }, [searchParams]);

  const loadGigs = async () => {
    setLoading(true);
    let url = `/gigs?`;
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (selectedTag) url += `tag=${encodeURIComponent(selectedTag)}&`;

    const res = await apiFetch<Gig[]>(url);
    if (res.success && res.data) {
      let list = Array.isArray(res.data) ? res.data : (res.data as any).gigs || [];
      
      // Perform client-side pricing filters if specified
      if (priceMin) {
        list = list.filter((g: any) => Number(g.price || 45) >= Number(priceMin));
      }
      if (priceMax) {
        list = list.filter((g: any) => Number(g.price || 45) <= Number(priceMax));
      }

      setGigs(list);
    } else {
      setGigs([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadGigs();
  }, [search, selectedTag, searchParams]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadGigs();
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedTag('');
    setPriceMin('');
    setPriceMax('');
    router.push('/gigs');
  };

  const allTags = ['express', 'postgres', 'typescript', 'nodejs', 'react', 'design', 'translation'];

  return (
    <div className="flex flex-col min-h-screen bg-basalt-950 text-slate-100">
      <Navbar />

      <main className="flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gold-500/10 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white font-heading">
              Egyptian Services Catalog
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Browse top-tier packages crafted by certified professional builders
            </p>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto max-w-md">
            <div className="relative flex items-center w-full rounded-xl border border-gold-500/15 bg-basalt-900 focus-within:border-gold-500/40 transition-colors">
              <input
                type="text"
                placeholder="Search gigs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent px-4 py-2.5 text-xs text-slate-200 outline-none"
              />
              <button 
                onClick={loadGigs}
                className="pr-3 text-slate-400 hover:text-gold-400 transition-colors"
              >
                <Search className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar Filters */}
          <div className="rounded-2xl glass-panel p-6 h-fit space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center space-x-1.5 uppercase tracking-wider font-heading">
                <SlidersHorizontal className="h-4.5 w-4.5 text-gold-400" />
                <span>Filters</span>
              </h2>
              <button
                onClick={handleClearFilters}
                className="text-[10px] text-slate-400 hover:text-gold-400 flex items-center space-x-1 font-semibold transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Price Filter */}
            <form onSubmit={handleFilterSubmit} className="space-y-3.5 border-t border-slate-800 pt-4">
              <h3 className="text-xs font-semibold text-slate-300">Price Budget ($)</h3>
              <div className="grid grid-cols-2 gap-2.5">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="rounded-lg border border-gold-500/10 bg-basalt-900/60 px-3 py-2 text-xs text-slate-200 outline-none focus:border-gold-500/30"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="rounded-lg border border-gold-500/10 bg-basalt-900/60 px-3 py-2 text-xs text-slate-200 outline-none focus:border-gold-500/30"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-gold-500/10 border border-gold-500/25 text-[10px] font-bold text-gold-400 hover:bg-gold-500/20 transition-all uppercase tracking-wider"
              >
                Apply Budget
              </button>
            </form>

            {/* Tags Filters */}
            <div className="border-t border-slate-800 pt-4 space-y-3">
              <h3 className="text-xs font-semibold text-slate-300">Popular Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      const nextTag = selectedTag === tag ? '' : tag;
                      setSelectedTag(nextTag);
                      router.push(`/gigs?tag=${nextTag}`);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold flex items-center space-x-1.5 border transition-all ${
                      selectedTag === tag
                        ? 'bg-teal-500/25 text-teal-400 border-teal-500/40'
                        : 'bg-basalt-900/60 text-slate-400 border-gold-500/10 hover:text-gold-400 hover:border-gold-500/35'
                    }`}
                  >
                    <Tag className="h-3 w-3" />
                    <span>#{tag}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Gigs List */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <span className="h-10 w-10 animate-spin rounded-full border-4 border-gold-500 border-t-transparent"></span>
              </div>
            ) : gigs.length === 0 ? (
              <div className="text-center py-20 rounded-2xl glass-panel p-6">
                <p className="text-slate-400 text-sm">No services matched your search queries.</p>
                <button
                  onClick={handleClearFilters}
                  className="mt-4 px-4 py-2 rounded-full border border-gold-500/30 bg-gold-500/5 text-xs font-semibold text-gold-400 hover:bg-gold-500/15 transition-all"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {gigs.map((gig) => (
                  <Link
                    key={gig.id}
                    href={`/gigs/${gig.id}`}
                    className="rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between overflow-hidden cursor-pointer"
                  >
                    <div className="p-5">
                      <div className="flex flex-wrap gap-1.5">
                        {gig.tags?.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 text-[9px] font-bold border border-teal-500/15"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <h3 className="mt-3.5 text-sm font-bold text-white line-clamp-2 hover:text-gold-400 transition-colors font-heading">
                        {gig.title}
                      </h3>
                      <p className="mt-2 text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
                        {gig.descr}
                      </p>
                    </div>

                    <div className="border-t border-gold-500/5 bg-basalt-900/40 p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-xs font-semibold text-gold-400">
                        <Star className="h-3.5 w-3.5 fill-gold-500 text-gold-500" />
                        <span>{Number(gig.avg_rating || 0).toFixed(1)}</span>
                        <span className="text-slate-500 font-normal">({gig.total_reviews || 0})</span>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] block text-slate-500 uppercase tracking-wider font-semibold">
                          Starting at
                        </span>
                        <span className="text-xs font-black text-white">
                          ${gig.price || '45.00'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function GigsCatalog() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-basalt-950 text-slate-100">
        <Navbar />
        <div className="flex-grow flex justify-center items-center">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-gold-500 border-t-transparent"></span>
        </div>
        <Footer />
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}

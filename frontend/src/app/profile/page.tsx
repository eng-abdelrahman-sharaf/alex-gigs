'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Bookmark, 
  Briefcase, 
  Plus, 
  Star, 
  MapPin, 
  Languages, 
  FileText, 
  PlusCircle, 
  X,
  Clock,
  Coins,
  AlertTriangle
} from 'lucide-react';

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

export default function ProfilePage() {
  const { user, freelancer, activeRole, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [savedGigs, setSavedGigs] = useState<Gig[]>([]);
  const [freelancerGigs, setFreelancerGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Create Gig Form State
  const [gigTitle, setGigTitle] = useState('');
  const [gigDescr, setGigDescr] = useState('');
  const [gigTags, setGigTags] = useState('express, postgres, nodejs');
  const [gigPortfolio, setGigPortfolio] = useState('https://github.com/example/repo');
  const [error, setError] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // Package BASIC State
  const [basicTitle, setBasicTitle] = useState('Express Routing Setup');
  const [basicDescr, setBasicDescr] = useState('Configure router controls and mock data endpoints.');
  const [basicDelivery, setBasicDelivery] = useState(3);
  const [basicPrice, setBasicPrice] = useState('45.00');
  const [basicDeliverables, setBasicDeliverables] = useState('1 Route, Router files');

  // Package STANDARD State
  const [standardTitle, setStandardTitle] = useState('MVC Database Integration');
  const [standardDescr, setStandardDescr] = useState('Model service database API with validation schema validation.');
  const [standardDelivery, setStandardDelivery] = useState(7);
  const [standardPrice, setStandardPrice] = useState('120.00');
  const [standardDeliverables, setStandardDeliverables] = useState('5 Routes, Zod Schemas, Postgres schemas');

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    
    // Load saved/bookmarked gigs
    const savedRes = await apiFetch<Gig[]>('/gigs/saved');
    if (savedRes.success && savedRes.data) {
      const list = Array.isArray(savedRes.data) ? savedRes.data : (savedRes.data as any).gigs || [];
      setSavedGigs(list);
    }

    // Load freelancer listed gigs (all gigs filtered by freelancer ID)
    if (freelancer) {
      const allRes = await apiFetch<Gig[]>('/gigs');
      if (allRes.success && allRes.data) {
        const list = Array.isArray(allRes.data) ? allRes.data : (allRes.data as any).gigs || [];
        const filtered = list.filter((g: any) => String(g.freelancer_id) === String(freelancer.id));
        setFreelancerGigs(filtered);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      loadData();
    }
  }, [isAuthenticated, user, freelancer]);

  const handleCreateGig = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!gigTitle || !gigDescr) {
      setError('Please fill in Gig title and description.');
      return;
    }

    setModalLoading(true);

    const tagsArray = gigTags.split(',').map((t) => t.trim()).filter((t) => t.length > 0);
    const portfolioArray = gigPortfolio.split(',').map((p) => p.trim()).filter((p) => p.length > 0);

    const payload = {
      title: gigTitle,
      descr: gigDescr,
      tags: tagsArray,
      portfolio: portfolioArray,
      packages: [
        {
          type: 'BASIC',
          title: basicTitle,
          descr: basicDescr,
          delivery_time: Number(basicDelivery),
          price: basicPrice,
          deliverables: basicDeliverables.split(',').map((d) => d.trim()).filter((d) => d.length > 0),
        },
        {
          type: 'STANDARD',
          title: standardTitle,
          descr: standardDescr,
          delivery_time: Number(standardDelivery),
          price: standardPrice,
          deliverables: standardDeliverables.split(',').map((d) => d.trim()).filter((d) => d.length > 0),
        }
      ],
    };

    const res = await apiFetch('/gigs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.success) {
      setIsModalOpen(false);
      // Reset form
      setGigTitle('');
      setGigDescr('');
      await loadData();
    } else {
      setError(res.error || 'Failed to create gig service.');
    }
    setModalLoading(false);
  };

  if (authLoading || loading) {
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

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-basalt-950 text-slate-100">
      <Navbar />

      <main className="flex-grow mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Profile header banner */}
        <div className="rounded-2xl bg-gradient-to-r from-basalt-900 via-basalt-900 to-basalt-800 border border-gold-500/10 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white font-heading">
                {user.fname} {user.lname}
              </h1>
              <p className="text-xs text-slate-400">@{user.username}</p>
              
              <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                <span className="flex items-center space-x-1">
                  <MapPin className="h-3.5 w-3.5 text-gold-400" />
                  <span>{user.country || 'Egypt'}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Languages className="h-3.5 w-3.5 text-teal-400" />
                  <span>{user.languages?.join(', ') || 'Arabic, English'}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => router.push('/settings')}
              className="px-4 py-2 rounded-xl border border-gold-500/15 bg-basalt-900 text-xs font-bold text-gold-400 hover:border-gold-500/35 transition-all cursor-pointer"
            >
              Update Credentials
            </button>
            
            {activeRole === 'FREELANCER' && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-xs font-bold text-basalt-950 hover:from-gold-500 hover:to-gold-400 transition-all cursor-pointer shadow-lg shadow-gold-500/10"
              >
                <Plus className="h-4 w-4" />
                <span>Create Gig Service</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mt-8">
          
          {/* Bio Overview */}
          <div className="rounded-2xl glass-panel p-6 h-fit space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-heading">
              Personal Bio
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              " {user.overview || 'Looking for excellent Egyptian freelancer services.'} "
            </p>

            {freelancer && (
              <div className="border-t border-slate-800 pt-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 font-heading flex items-center space-x-1.5">
                  <Briefcase className="h-4 w-4" />
                  <span>Freelancer Summary</span>
                </h3>
                <p className="text-[11px] font-bold text-slate-200">
                  {freelancer.job_title}
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {freelancer.overview}
                </p>
              </div>
            )}
          </div>

          {/* List display */}
          <div className="lg:col-span-2">
            {activeRole === 'BUYER' ? (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-heading flex items-center space-x-2">
                  <Bookmark className="h-4.5 w-4.5 text-gold-400" />
                  <span>Saved & Bookmarked Gigs</span>
                </h2>
                
                {savedGigs.length === 0 ? (
                  <div className="text-center py-12 rounded-2xl glass-panel p-6">
                    <p className="text-slate-400 text-xs">Your bookmark list is empty.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {savedGigs.map((gig) => (
                      <div
                        key={gig.id}
                        onClick={() => router.push(`/gigs/${gig.id}`)}
                        className="rounded-2xl glass-panel glass-panel-hover p-5 flex flex-col justify-between cursor-pointer"
                      >
                        <div>
                          <h3 className="text-sm font-bold text-white line-clamp-1 hover:text-gold-400 font-heading">
                            {gig.title}
                          </h3>
                          <p className="mt-1.5 text-[10px] text-slate-400 line-clamp-2">
                            {gig.descr}
                          </p>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-[11px]">
                          <span className="font-black text-gold-400">${gig.price || '45.00'}</span>
                          <span className="text-slate-500 font-medium">View Gig</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-heading flex items-center space-x-2">
                  <Briefcase className="h-4.5 w-4.5 text-teal-400" />
                  <span>My Listed Services</span>
                </h2>
                
                {freelancerGigs.length === 0 ? (
                  <div className="text-center py-12 rounded-2xl glass-panel p-6">
                    <p className="text-slate-400 text-xs">You haven't listed any gigs yet.</p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="mt-4 px-4 py-2 rounded-full border border-teal-500/30 bg-teal-500/5 text-xs font-semibold text-teal-400 hover:bg-teal-500/15"
                    >
                      Publish First Gig Service
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {freelancerGigs.map((gig) => (
                      <div
                        key={gig.id}
                        onClick={() => router.push(`/gigs/${gig.id}`)}
                        className="rounded-2xl glass-panel glass-panel-hover p-5 flex flex-col justify-between cursor-pointer"
                      >
                        <div>
                          <h3 className="text-sm font-bold text-white line-clamp-1 hover:text-gold-400 font-heading">
                            {gig.title}
                          </h3>
                          <p className="mt-1.5 text-[10px] text-slate-400 line-clamp-2">
                            {gig.descr}
                          </p>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-[11px]">
                          <span className="font-black text-gold-400">${gig.price || '45.00'}</span>
                          <span className="text-slate-500 font-medium">View Active Gig</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Create Gig Modal Form */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-basalt-950/80 p-4 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-2xl rounded-2xl glass-panel p-6 sm:p-8 bg-basalt-900/95 shadow-2xl my-8">
              
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-basalt-800 transition-colors outline-none"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-xl font-extrabold text-white font-heading">
                Publish a New Service Gig
              </h2>
              <p className="text-[11px] text-slate-400 mt-1">
                Configure your service overview details and package tiers BASIC & STANDARD.
              </p>

              {error && (
                <div className="mt-4 flex items-start space-x-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3.5 text-xs text-red-400">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCreateGig} className="mt-6 space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                {/* General Service Details */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gold-400 uppercase tracking-wider font-heading">
                    1. General Service Info
                  </h3>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Gig Service Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Build high-performance Express REST APIs with PostgreSQL"
                      value={gigTitle}
                      onChange={(e) => setGigTitle(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-gold-500/10 bg-basalt-900 px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-gold-500/30"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Service Description
                    </label>
                    <textarea
                      required
                      placeholder="Detail the database designs, model-service architectures, security rules, and packages deliverables included..."
                      value={gigDescr}
                      onChange={(e) => setGigDescr(e.target.value)}
                      rows={3}
                      className="mt-1.5 w-full rounded-xl border border-gold-500/10 bg-basalt-900 p-4 text-xs text-slate-200 outline-none focus:border-gold-500/30 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Tags (Comma-separated)
                      </label>
                      <input
                        type="text"
                        value={gigTags}
                        onChange={(e) => setGigTags(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-gold-500/10 bg-basalt-900 px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-gold-500/30 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Portfolio Repos (Comma-separated)
                      </label>
                      <input
                        type="text"
                        value={gigPortfolio}
                        onChange={(e) => setGigPortfolio(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-gold-500/10 bg-basalt-900 px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-gold-500/30 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* BASIC Package Info */}
                <div className="space-y-4 border-t border-slate-800 pt-6">
                  <h3 className="text-xs font-bold text-gold-400 uppercase tracking-wider font-heading flex items-center space-x-1">
                    <span>2. Basic Package Tier</span>
                    <span className="text-[9px] bg-gold-500/10 text-gold-400 px-1 py-0.5 rounded border border-gold-500/20">BASIC</span>
                  </h3>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Package Title
                      </label>
                      <input
                        type="text"
                        required
                        value={basicTitle}
                        onChange={(e) => setBasicTitle(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-gold-500/10 bg-basalt-900 px-4 py-2 text-xs text-slate-200 outline-none focus:border-gold-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Price ($)
                      </label>
                      <input
                        type="text"
                        required
                        value={basicPrice}
                        onChange={(e) => setBasicPrice(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-gold-500/10 bg-basalt-900 px-4 py-2 text-xs text-slate-200 outline-none focus:border-gold-500/30 font-mono font-bold text-gold-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Description
                      </label>
                      <input
                        type="text"
                        required
                        value={basicDescr}
                        onChange={(e) => setBasicDescr(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-gold-500/10 bg-basalt-900 px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-gold-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Delivery (Days)
                      </label>
                      <input
                        type="number"
                        required
                        value={basicDelivery}
                        onChange={(e) => setBasicDelivery(Number(e.target.value))}
                        className="mt-1.5 w-full rounded-xl border border-gold-500/10 bg-basalt-900 px-4 py-2 text-xs text-slate-200 outline-none focus:border-gold-500/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Deliverables (Comma-separated)
                    </label>
                    <input
                      type="text"
                      required
                      value={basicDeliverables}
                      onChange={(e) => setBasicDeliverables(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-gold-500/10 bg-basalt-900 px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-gold-500/30"
                    />
                  </div>
                </div>

                {/* STANDARD Package Info */}
                <div className="space-y-4 border-t border-slate-800 pt-6">
                  <h3 className="text-xs font-bold text-gold-400 uppercase tracking-wider font-heading flex items-center space-x-1">
                    <span>3. Standard Package Tier</span>
                    <span className="text-[9px] bg-teal-500/10 text-teal-400 px-1 py-0.5 rounded border border-teal-500/20">STANDARD</span>
                  </h3>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Package Title
                      </label>
                      <input
                        type="text"
                        required
                        value={standardTitle}
                        onChange={(e) => setStandardTitle(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-gold-500/10 bg-basalt-900 px-4 py-2 text-xs text-slate-200 outline-none focus:border-gold-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Price ($)
                      </label>
                      <input
                        type="text"
                        required
                        value={standardPrice}
                        onChange={(e) => setStandardPrice(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-gold-500/10 bg-basalt-900 px-4 py-2 text-xs text-slate-200 outline-none focus:border-gold-500/30 font-mono font-bold text-gold-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Description
                      </label>
                      <input
                        type="text"
                        required
                        value={standardDescr}
                        onChange={(e) => setStandardDescr(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-gold-500/10 bg-basalt-900 px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-gold-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Delivery (Days)
                      </label>
                      <input
                        type="number"
                        required
                        value={standardDelivery}
                        onChange={(e) => setStandardDelivery(Number(e.target.value))}
                        className="mt-1.5 w-full rounded-xl border border-gold-500/10 bg-basalt-900 px-4 py-2 text-xs text-slate-200 outline-none focus:border-gold-500/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Deliverables (Comma-separated)
                    </label>
                    <input
                      type="text"
                      required
                      value={standardDeliverables}
                      onChange={(e) => setStandardDeliverables(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-gold-500/10 bg-basalt-900 px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-gold-500/30"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={modalLoading}
                  className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-xs font-bold text-basalt-950 hover:from-gold-500 hover:to-gold-400 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {modalLoading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-basalt-950 border-t-transparent"></span>
                  ) : (
                    <span>Publish Gig Service</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

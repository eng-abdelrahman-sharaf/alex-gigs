'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { apiFetch } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { 
  Star, 
  Clock, 
  Check, 
  HelpCircle, 
  Bookmark, 
  Calendar, 
  User, 
  ChevronDown, 
  ChevronUp, 
  FileText 
} from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
}

interface Package {
  id: string;
  type: 'BASIC' | 'STANDARD' | 'PREMIUM';
  title: string;
  descr: string;
  delivery_time: number;
  price: string;
  deliverables: string[];
}

interface GigDetails {
  id: string;
  title: string;
  descr: string;
  tags?: string[];
  portfolio?: string[];
  freelancer_id: string;
  packages: Package[];
  faqs: FAQ[];
  analytics: {
    avg_rating: number;
    total_reviews: number;
    total_lists: number;
  };
}

interface SellerProfile {
  id: string;
  job_title: string;
  overview: string;
  fname: string;
  lname: string;
  country: string;
  languages: string[];
  availability?: {
    start_day: string;
    end_day: string;
    start_hour: string;
    end_hour: string;
  };
}

export default function GigDetail() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  const [gig, setGig] = useState<GigDetails | null>(null);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'BASIC' | 'STANDARD' | 'PREMIUM'>('BASIC');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    async function loadDetails() {
      setLoading(true);
      const res = await apiFetch<GigDetails>(`/gigs/${id}`);
      if (res.success && res.data) {
        const gigData = (res.data as any).gig || res.data;
        setGig(gigData);
        
        // Try to pre-select the first available package type
        if (gigData.packages && gigData.packages.length > 0) {
          setActiveTab(gigData.packages[0].type);
        }

        // Fetch seller details
        const sellerRes = await apiFetch<SellerProfile>(`/freelancers/profile/${gigData.freelancer_id}`);
        if (sellerRes.success && sellerRes.data) {
          const sellerData = (sellerRes.data as any).freelancer || sellerRes.data;
          setSeller(sellerData);
        }
      }
      setLoading(false);
    }
    loadDetails();
  }, [id]);

  // Check if saved
  useEffect(() => {
    async function checkSavedStatus() {
      if (!isAuthenticated) return;
      const res = await apiFetch<any[]>('/gigs/saved');
      if (res.success && res.data) {
        const list = Array.isArray(res.data) ? res.data : (res.data as any).gigs || [];
        const isPresent = list.some((g: any) => String(g.id) === String(id));
        setIsSaved(isPresent);
      }
    }
    checkSavedStatus();
  }, [id, isAuthenticated]);

  const handleSaveToggle = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setSaveLoading(true);
    const endpoint = isSaved ? `/gigs/${id}/unsave` : `/gigs/${id}/save`;
    const res = await apiFetch(endpoint, { method: 'POST' });
    if (res.success) {
      setIsSaved(!isSaved);
    }
    setSaveLoading(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-basalt-950 text-slate-100">
        <Navbar />
        <div className="flex-grow flex justify-center items-center">
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-gold-500 border-t-transparent"></span>
        </div>
        <Footer />
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="flex flex-col min-h-screen bg-basalt-950 text-slate-100">
        <Navbar />
        <div className="flex-grow flex flex-col justify-center items-center py-20">
          <p className="text-sm text-slate-400">Gig not found.</p>
          <button
            onClick={() => router.push('/gigs')}
            className="mt-4 px-4 py-2 rounded-full bg-gold-500 text-xs font-bold text-basalt-950"
          >
            Back to Catalog
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // Find active package
  const activePackage = gig.packages?.find((p) => p.type === activeTab);

  return (
    <div className="flex flex-col min-h-screen bg-basalt-950 text-slate-100">
      <Navbar />

      <main className="flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Left Column: Gig Details */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {gig.tags?.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 text-[10px] font-bold border border-teal-500/15 animate-pulse"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                
                {/* Save Toggle */}
                <button
                  onClick={handleSaveToggle}
                  disabled={saveLoading}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${
                    isSaved
                      ? 'bg-gold-500/15 text-gold-400 border-gold-500/30'
                      : 'bg-basalt-900 border-gold-500/10 text-slate-400 hover:text-gold-400 hover:border-gold-500/30'
                  }`}
                >
                  <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-gold-400' : ''}`} />
                  <span>{isSaved ? 'Bookmarked' : 'Bookmark'}</span>
                </button>
              </div>

              <h1 className="text-3xl font-extrabold text-white font-heading leading-tight">
                {gig.title}
              </h1>

              <div className="flex items-center space-x-2 text-xs font-semibold text-gold-400">
                <Star className="h-4.5 w-4.5 fill-gold-500 text-gold-500" />
                <span>{Number(gig.analytics?.avg_rating || 0).toFixed(1)}</span>
                <span className="text-slate-500 font-normal">({gig.analytics?.total_reviews || 0} reviews)</span>
                <span className="text-slate-700">•</span>
                <span className="text-slate-500 font-normal">{gig.analytics?.total_lists || 0} saves</span>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-2xl glass-panel p-6 space-y-4">
              <h2 className="text-base font-bold text-white uppercase tracking-wider font-heading">
                Service Description
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {gig.descr}
              </p>
            </div>

            {/* FAQ Section */}
            {gig.faqs && gig.faqs.length > 0 && (
              <div className="rounded-2xl glass-panel p-6 space-y-4">
                <h2 className="text-base font-bold text-white uppercase tracking-wider font-heading flex items-center space-x-2">
                  <HelpCircle className="h-5 w-5 text-gold-400" />
                  <span>Frequently Asked Questions</span>
                </h2>
                
                <div className="space-y-3">
                  {gig.faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="border border-slate-800 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                        className="w-full flex justify-between items-center px-4 py-3.5 bg-basalt-900/60 text-left text-xs font-semibold text-slate-200 hover:text-gold-400 transition-colors outline-none"
                      >
                        <span>{faq.question}</span>
                        {openFaqIndex === idx ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      
                      {openFaqIndex === idx && (
                        <div className="px-4 py-3 bg-basalt-950/40 text-[11px] text-slate-400 border-t border-slate-800/60 leading-relaxed">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seller profile card */}
            {seller && (
              <div className="rounded-2xl glass-panel p-6 space-y-5">
                <h2 className="text-base font-bold text-white uppercase tracking-wider font-heading">
                  About The Seller
                </h2>

                <div className="flex items-start space-x-4 border-b border-slate-800 pb-4">
                  <div className="h-12 w-12 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">
                      {seller.fname} {seller.lname}
                    </h3>
                    <p className="text-[11px] text-gold-400 font-semibold">{seller.job_title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{seller.country}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {seller.overview}
                </p>

                {/* Availability info */}
                {seller.availability && (
                  <div className="mt-4 flex items-center space-x-3 rounded-xl border border-teal-500/10 bg-teal-500/5 p-3 text-xs text-teal-400">
                    <Calendar className="h-4.5 w-4.5" />
                    <div>
                      <span className="font-semibold block">Active Availability Schedule</span>
                      <span className="text-[10px] text-slate-400">
                        {seller.availability.start_day} to {seller.availability.end_day} (
                        {seller.availability.start_hour.substring(0, 5)} - {seller.availability.end_hour.substring(0, 5)})
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Packages Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl glass-panel p-5 sticky top-20 shadow-2xl bg-basalt-900/90">
              {/* Tab Selector */}
              <div className="grid grid-cols-3 gap-1 rounded-xl bg-basalt-950 p-1 border border-slate-800">
                {['BASIC', 'STANDARD', 'PREMIUM'].map((type) => {
                  const exists = gig.packages?.some((p) => p.type === type);
                  return (
                    <button
                      key={type}
                      onClick={() => exists && setActiveTab(type as any)}
                      disabled={!exists}
                      className={`py-2 rounded-lg text-[10px] font-bold uppercase transition-all tracking-wider ${
                        !exists
                          ? 'opacity-30 cursor-not-allowed text-slate-600'
                          : activeTab === type
                          ? 'bg-gold-500 text-basalt-950 shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>

              {/* Package Content */}
              {activePackage ? (
                <div className="mt-6 space-y-5">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-base font-extrabold text-white font-heading">
                      {activePackage.title}
                    </h3>
                    <span className="text-xl font-black text-gold-400">
                      ${activePackage.price}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed min-h-[50px]">
                    {activePackage.descr}
                  </p>

                  <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
                    <Clock className="h-4.5 w-4.5 text-gold-400" />
                    <span>{activePackage.delivery_time} Days Delivery</span>
                  </div>

                  {/* Deliverables List */}
                  <div className="space-y-2 border-t border-slate-800 pt-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Deliverables included:
                    </h4>
                    <ul className="space-y-2">
                      {activePackage.deliverables?.map((item, i) => (
                        <li key={i} className="flex items-start space-x-2 text-xs text-slate-300">
                          <Check className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Checkout CTA */}
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        router.push('/login');
                      } else {
                        router.push(`/checkout?packageId=${activePackage.id}`);
                      }
                    }}
                    className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-xs font-bold text-basalt-950 hover:from-gold-500 hover:to-gold-400 hover:shadow-lg hover:shadow-gold-500/20 transition-all duration-200 cursor-pointer"
                  >
                    <span>Book Package</span>
                  </button>
                </div>
              ) : (
                <div className="mt-6 text-center py-6 text-xs text-slate-500">
                  Package tier not available for this gig.
                </div>
              )}
            </div>
          </div>
          
        </div>
      </main>

      <Footer />
    </div>
  );
}

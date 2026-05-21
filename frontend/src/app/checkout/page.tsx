'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { apiFetch } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { CreditCard, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

function SecureCheckout() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  const packageId = searchParams.get('packageId') || '';

  const [additionalDetails, setAdditionalDetails] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!packageId) {
      setError('Invalid Package Selection.');
      return;
    }

    if (cardNumber.length < 16 || cardCvv.length < 3 || !cardExpiry || !cardName) {
      setError('Please fill in valid simulated credit card details.');
      return;
    }

    setLoading(true);

    const res = await apiFetch('/orders', {
      method: 'POST',
      body: JSON.stringify({
        package_id: packageId,
        payment_method: 'CARD',
        additional_details: additionalDetails || 'Standard booking specifications.',
      }),
    });

    if (res.success && res.data) {
      const order = res.data.order || res.data;
      setOrderId(order.id);
      setSuccess(true);
    } else {
      setError(res.error || 'Failed to place booking order.');
    }
    setLoading(false);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 16);
    setCardNumber(val);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 2) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setCardExpiry(val);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardCvv(val);
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
                Booking Placed!
              </h1>
              <p className="mt-2 text-xs text-slate-400">
                Your payment simulation was processed. Order reference ID: #{orderId}
              </p>
            </div>
            <button
              onClick={() => router.push('/orders')}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-xs font-bold text-basalt-950 hover:from-gold-500 hover:to-gold-400 transition-all cursor-pointer"
            >
              <span>Go to Orders Dashboard</span>
              <ArrowRight className="h-4.5 w-4.5" />
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

      <main className="flex-grow mx-auto max-w-3xl w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="border-b border-gold-500/10 pb-6 mb-8">
          <h1 className="text-3xl font-extrabold text-white font-heading">
            Secure Service Booking
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Simulate your card invoice details below to initiate package development
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start space-x-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3.5 text-xs text-red-400">
            <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 md:grid-cols-2">
          
          {/* Card Details */}
          <div className="rounded-2xl glass-panel p-6 space-y-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-heading flex items-center space-x-2">
              <CreditCard className="h-4.5 w-4.5 text-gold-400" />
              <span>Simulated Payment</span>
            </h2>

            {/* Simulated Credit Card Graphic */}
            <div className="rounded-xl bg-gradient-to-br from-gold-600 via-amber-500 to-teal-600 p-5 text-basalt-950 space-y-6 shadow-lg border border-gold-400/20">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-basalt-950/70">ALEXGIGS SECURE</span>
                <span className="text-[10px] font-bold text-basalt-950/60">Simulator</span>
              </div>
              <div className="text-base font-mono tracking-widest text-basalt-950">
                {cardNumber.replace(/(\d{4})/g, '$1 ').trim() || '•••• •••• •••• ••••'}
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[7px] uppercase font-bold text-basalt-950/60 block">Card Holder</span>
                  <span className="text-[10px] font-black uppercase tracking-wider">{cardName || 'YOUR FULL NAME'}</span>
                </div>
                <div>
                  <span className="text-[7px] uppercase font-bold text-basalt-950/60 block">Expires</span>
                  <span className="text-[10px] font-mono font-bold">{cardExpiry || 'MM/YY'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Mohamed Sharaf"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gold-500/10 bg-basalt-900 px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-gold-500/30"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Card Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="4000123456789010"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  className="mt-1.5 w-full rounded-xl border border-gold-500/10 bg-basalt-900 px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-gold-500/30 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={handleExpiryChange}
                    className="mt-1.5 w-full rounded-xl border border-gold-500/10 bg-basalt-900 px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-gold-500/30 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    CVV
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="•••"
                    value={cardCvv}
                    onChange={handleCvvChange}
                    className="mt-1.5 w-full rounded-xl border border-gold-500/10 bg-basalt-900 px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-gold-500/30 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="rounded-2xl glass-panel p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-heading flex items-center space-x-2">
                <ShieldCheck className="h-4.5 w-4.5 text-teal-400" />
                <span>Job Requirements</span>
              </h2>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Additional Details / Specifications
                </label>
                <textarea
                  placeholder="Provide precise details, URLs, schema guidelines, or instructions to guide the developer..."
                  value={additionalDetails}
                  onChange={(e) => setAdditionalDetails(e.target.value)}
                  rows={6}
                  className="mt-1.5 w-full rounded-xl border border-gold-500/10 bg-basalt-900 p-4 text-xs text-slate-200 outline-none focus:border-gold-500/30 resize-none"
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
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Authorize Booking Payment</span>
                </>
              )}
            </button>
          </div>

        </form>
      </main>

      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
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
      <SecureCheckout />
    </Suspense>
  );
}

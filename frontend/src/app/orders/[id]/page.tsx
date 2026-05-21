'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { apiFetch } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  Truck, 
  Check, 
  ArrowLeft, 
  FileText, 
  User, 
  AlertTriangle 
} from 'lucide-react';

interface OrderDetails {
  id: string;
  buyer_id: string;
  package_id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'CHANGES_REQUIRED';
  payment_method: string;
  price: string;
  additional_details?: string;
  created_at: string;
  delivered_at?: string;
  package_title?: string;
  package_descr?: string;
  gig_id?: string;
  gig_title?: string;
  freelancer_id?: string;
  buyer_username?: string;
  freelancer_name?: string;
}

export default function OrderDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { activeRole, isAuthenticated, loading: authLoading } = useAuth();
  
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated]);

  const loadOrderDetails = async () => {
    setLoading(true);
    setError('');
    const res = await apiFetch<OrderDetails>(`/orders/${id}`);
    if (res.success && res.data) {
      const orderData = (res.data as any).order || res.data;
      setOrder(orderData);
    } else {
      setError(res.error || 'Failed to load order timeline details.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadOrderDetails();
    }
  }, [id, isAuthenticated]);

  const handleUpdateStatus = async (nextStatus: string) => {
    const res = await apiFetch(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: nextStatus }),
    });

    if (res.success) {
      await loadOrderDetails();
      if (nextStatus === 'COMPLETED' && activeRole === 'BUYER') {
        router.push(`/orders/${id}/review`);
      }
    } else {
      setError(res.error || 'Failed to update order status');
    }
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

  if (!order) {
    return (
      <div className="flex flex-col min-h-screen bg-basalt-950 text-slate-100">
        <Navbar />
        <div className="flex-grow flex flex-col justify-center items-center py-20">
          <p className="text-sm text-slate-400">Order not found.</p>
          <button
            onClick={() => router.push('/orders')}
            className="mt-4 px-4 py-2 rounded-full bg-gold-500 text-xs font-bold text-basalt-950"
          >
            Back to Dashboard
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // Timeline steps
  const steps = [
    { key: 'PENDING', label: 'Order Booked', desc: 'Awaiting developer accept', icon: Clock },
    { key: 'IN_PROGRESS', label: 'In Development', desc: 'Code writing & database integration', icon: FileText },
    { key: 'DELIVERED', label: 'Work Delivered', desc: 'Ready for buyer verification', icon: Truck },
    { key: 'COMPLETED', label: 'Order Completed', desc: 'Assets approved & closed', icon: CheckCircle },
  ];

  // Calculate active index
  const activeStepKeys = ['PENDING', 'IN_PROGRESS', 'DELIVERED', 'COMPLETED'];
  let currentStepIndex = activeStepKeys.indexOf(order.status);
  if (order.status === 'CANCELLED') currentStepIndex = -1;

  return (
    <div className="flex flex-col min-h-screen bg-basalt-950 text-slate-100">
      <Navbar />

      <main className="flex-grow mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Back Link */}
        <button
          onClick={() => router.push('/orders')}
          className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-gold-400 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Orders</span>
        </button>

        {error && (
          <div className="mb-6 flex items-start space-x-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3.5 text-xs text-red-400">
            <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Details (Left) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl glass-panel p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Order Reference ID #{order.id}</span>
                  <h1 className="text-xl font-extrabold text-white mt-1 font-heading">
                    {order.gig_title || 'Software Integration'}
                  </h1>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Price</span>
                  <span className="text-lg font-black text-gold-400">${order.price}</span>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-4 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 uppercase tracking-wider font-semibold text-[9px] block">Payment Method</span>
                  <span className="text-slate-300 font-semibold">{order.payment_method}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase tracking-wider font-semibold text-[9px] block">Order Date</span>
                  <span className="text-slate-300">{new Date(order.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Buyer Specifications */}
            <div className="rounded-2xl glass-panel p-6 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-heading">
                Client Specifications
              </h2>
              <div className="bg-basalt-900/50 p-4 rounded-xl border border-gold-500/5 text-xs text-slate-300 italic whitespace-pre-wrap leading-relaxed">
                "{order.additional_details || 'No specifications provided.'}"
              </div>
            </div>

            {/* Package details */}
            {order.package_title && (
              <div className="rounded-2xl glass-panel p-6 space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-heading">
                  Booked Package: {order.package_title}
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {order.package_descr}
                </p>
              </div>
            )}
          </div>

          {/* Timeline & Actions (Right) */}
          <div className="space-y-6">
            
            {/* Visual Timeline Tracking */}
            <div className="rounded-2xl glass-panel p-6 space-y-6">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-heading">
                Order Timeline
              </h2>

              {order.status === 'CANCELLED' ? (
                <div className="rounded-xl border border-red-500/10 bg-red-500/5 p-4 text-xs text-red-400 flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  <div>
                    <span className="font-bold block">Order Cancelled</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">This booking order has been terminated.</span>
                  </div>
                </div>
              ) : (
                <div className="relative pl-6 space-y-8 border-l border-slate-800">
                  {steps.map((step, idx) => {
                    const StepIcon = step.icon;
                    const isDone = idx <= currentStepIndex;
                    const isActive = idx === currentStepIndex;

                    return (
                      <div key={step.key} className="relative">
                        {/* Timeline Node Point */}
                        <div className={`absolute -left-[31px] top-0 h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all ${
                          isDone 
                            ? 'bg-gold-500 border-gold-400 text-basalt-950 scale-110 shadow-md shadow-gold-500/20' 
                            : 'bg-basalt-900 border-slate-700 text-slate-600'
                        }`}>
                          {isDone ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : null}
                        </div>

                        {/* Text */}
                        <div className="space-y-1">
                          <h3 className={`text-xs font-bold leading-none ${
                            isActive ? 'text-gold-400 font-black' : isDone ? 'text-slate-200' : 'text-slate-500'
                          }`}>
                            {step.label}
                          </h3>
                          <p className="text-[10px] text-slate-400 leading-normal">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
              <div className="rounded-2xl glass-panel p-6 space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
                  Timeline Action Center
                </h2>

                {activeRole === 'BUYER' && (
                  <div className="space-y-2.5">
                    {order.status === 'DELIVERED' && (
                      <button
                        onClick={() => handleUpdateStatus('COMPLETED')}
                        className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-xs font-bold text-basalt-950 hover:from-gold-500 hover:to-gold-400 transition-all cursor-pointer"
                      >
                        <span>Approve & Complete Order</span>
                      </button>
                    )}
                    {order.status === 'PENDING' && (
                      <button
                        onClick={() => handleUpdateStatus('CANCELLED')}
                        className="w-full py-2.5 rounded-xl border border-red-500/25 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                      >
                        Cancel Booking Order
                      </button>
                    )}
                  </div>
                )}

                {activeRole === 'FREELANCER' && (
                  <div className="space-y-2.5">
                    {order.status === 'PENDING' && (
                      <button
                        onClick={() => handleUpdateStatus('IN_PROGRESS')}
                        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-all cursor-pointer"
                      >
                        Accept Order Booking
                      </button>
                    )}
                    {order.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleUpdateStatus('DELIVERED')}
                        className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-xs font-bold text-white transition-all cursor-pointer"
                      >
                        Deliver Finished Work
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

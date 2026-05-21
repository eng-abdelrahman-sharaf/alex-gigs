'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { apiFetch } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Package, 
  User, 
  RefreshCw 
} from 'lucide-react';

interface Order {
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
  gig_title?: string;
  buyer_username?: string;
}

export default function OrdersDashboard() {
  const { activeRole, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated]);

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    
    // Choose endpoint based on current activeRole
    const endpoint = activeRole === 'FREELANCER' ? '/orders/freelancer' : '/orders/buyer';
    const res = await apiFetch<Order[]>(endpoint);
    
    if (res.success && res.data) {
      const list = Array.isArray(res.data) ? res.data : (res.data as any).orders || [];
      setOrders(list);
    } else {
      setOrders([]);
      // Don't show error if it's just empty, but show if it's a real failure
      if (res.error && res.error !== 'Unauthorized') {
        setError(res.error);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [activeRole, isAuthenticated]);

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    const res = await apiFetch(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: nextStatus }),
    });

    if (res.success) {
      loadOrders();
    } else {
      alert(res.error || 'Failed to update order status');
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'IN_PROGRESS':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'DELIVERED':
        return 'bg-teal-500/10 text-teal-400 border-teal-500/20 animate-pulse';
      case 'COMPLETED':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
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

  return (
    <div className="flex flex-col min-h-screen bg-basalt-950 text-slate-100">
      <Navbar />

      <main className="flex-grow mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gold-500/10 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white font-heading">
              {activeRole === 'FREELANCER' ? 'Freelance Bookings' : 'My Purchases'}
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Manage status tracks, timeline completions, and payments for active gigs
            </p>
          </div>

          <button
            onClick={loadOrders}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gold-500/10 border border-gold-500/25 text-xs font-bold text-gold-400 hover:bg-gold-500/20 transition-all cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reload Dashboard</span>
          </button>
        </div>

        {error && (
          <div className="mt-6 flex items-start space-x-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3.5 text-xs text-red-400">
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-gold-500 border-t-transparent"></span>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 rounded-2xl glass-panel p-6 mt-8">
            <Package className="h-10 w-10 text-gold-500/40 mx-auto" />
            <p className="text-slate-400 text-sm mt-3">No orders found under this view.</p>
            {activeRole === 'BUYER' && (
              <Link
                href="/gigs"
                className="mt-4 inline-block px-4 py-2 rounded-full bg-gold-500 text-xs font-bold text-basalt-950 hover:bg-gold-400 transition-colors"
              >
                Browse Gigs
              </Link>
            )}
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Order #{order.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-white">
                    {order.gig_title || 'Database Setup & REST API'}
                  </h3>
                  
                  {order.additional_details && (
                    <p className="text-[10px] text-slate-400 line-clamp-1 italic">
                      " {order.additional_details} "
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-500">
                    <span className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(order.created_at).toLocaleDateString()}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Package className="h-3 w-3" />
                      <span className="font-semibold text-slate-400">{order.package_title || 'Package Standard'}</span>
                    </span>
                    {activeRole === 'FREELANCER' && order.buyer_username && (
                      <span className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>Buyer: @{order.buyer_username}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  <div className="text-right flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 pt-2 md:pt-0 border-slate-800">
                    <span className="text-[9px] block text-slate-500 uppercase font-semibold">Total Price</span>
                    <span className="text-sm font-black text-white">${order.price}</span>
                  </div>

                  {/* Actions for Freelancer */}
                  {activeRole === 'FREELANCER' && (
                    <div className="flex space-x-2">
                      {order.status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'IN_PROGRESS')}
                          className="px-3.5 py-2 rounded-lg bg-blue-500/10 border border-blue-500/25 text-[10px] font-bold text-blue-400 hover:bg-blue-500/20 transition-all cursor-pointer"
                        >
                          Accept Order
                        </button>
                      )}
                      {order.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                          className="px-3.5 py-2 rounded-lg bg-teal-500/10 border border-teal-500/25 text-[10px] font-bold text-teal-400 hover:bg-teal-500/20 transition-all cursor-pointer"
                        >
                          Deliver Work
                        </button>
                      )}
                    </div>
                  )}

                  {/* View Details Timeline button */}
                  <Link
                    href={`/orders/${order.id}`}
                    className="flex items-center justify-center space-x-1 px-4 py-2 rounded-lg border border-gold-500/15 bg-basalt-900 text-[10px] font-bold text-gold-400 hover:border-gold-500/30 transition-all text-center"
                  >
                    <span>View Timeline</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

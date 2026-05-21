import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gold-500/10 bg-basalt-950 px-4 py-10 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <span className="text-xl font-bold tracking-wider text-gold-500 font-heading">
              ALEX<span className="text-teal-400">GIGS</span>
            </span>
            <p className="mt-4 max-w-md text-xs leading-relaxed text-slate-400">
              The premier Egyptian Freelance Marketplace. Connecting elite local developers, translators, designers, and creatives with high-growth businesses and projects worldwide. Inspired by Alexandria's legacy of knowledge and commerce.
            </p>
          </div>
          
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gold-400">Categories</h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link href="/gigs?search=API" className="hover:text-teal-400 transition-colors">Software Engineering</Link>
              </li>
              <li>
                <Link href="/gigs?search=Design" className="hover:text-teal-400 transition-colors">Creative & Design</Link>
              </li>
              <li>
                <Link href="/gigs?search=Translation" className="hover:text-teal-400 transition-colors">Translation & Writing</Link>
              </li>
              <li>
                <Link href="/gigs?search=Video" className="hover:text-teal-400 transition-colors">Video & Animation</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gold-400">Platform</h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link href="/gigs" className="hover:text-teal-400 transition-colors">Explore Gigs</Link>
              </li>
              <li>
                <Link href="/settings" className="hover:text-teal-400 transition-colors">Become a Freelancer</Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-teal-400 transition-colors">Your Workspace</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} AlexGigs. Built in Egypt. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Local Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

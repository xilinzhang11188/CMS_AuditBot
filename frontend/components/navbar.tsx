"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ShieldCheck, LayoutDashboard, History, Settings, LogOut } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'History', href: '/history', icon: History },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-blue-600 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:shadow-teal-500/40 transition-all duration-300">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                CMS Auto-Auditor
              </span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-white/10 text-white shadow-sm"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <item.icon className={cn("w-4 h-4 mr-2", isActive ? "text-teal-400" : "text-slate-500")} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 p-[1px]">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">SC</span>
                </div>
              </div>
              <div className="text-sm">
                <p className="text-white font-medium">Dr. Sarah Chen</p>
                <p className="text-xs text-slate-400">Primary Care</p>
              </div>
            </div>
            <button className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

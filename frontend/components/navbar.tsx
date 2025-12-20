"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ShieldCheck, LayoutDashboard, History, Settings, LogOut, LogIn, UserPlus, Users, FileText } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Role-based navigation items
  const getNavItems = () => {
    if (user?.role === 'manager') {
      return [
        { name: 'Management', href: '/', icon: Users },
        { name: 'Settings', href: '/settings', icon: Settings },
      ];
    }
    return [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      { name: 'New Audit', href: '/audit/new', icon: FileText },
      { name: 'History', href: '/history', icon: History },
      { name: 'Settings', href: '/settings', icon: Settings },
    ];
  };

  const navItems = getNavItems();

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

          {user ? (
            <>
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
                      <span className="text-xs font-bold text-white">
                        {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm">
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-xs text-slate-400">
                      {user.role === 'manager' ? 'Manager' : 'Provider'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={logout}
                  className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}


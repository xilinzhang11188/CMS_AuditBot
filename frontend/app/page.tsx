"use client";

import React from 'react';
import Dashboard from './dashboard-page';
import ManagementDashboard from './management-dashboard';
import { LandingPage } from '@/components/landing-page';
import { useAuth } from '@/lib/auth-context';

export default function Page() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  // Route based on user role
  if (user.role === 'manager') {
    return <ManagementDashboard />;
  }

  return <Dashboard />;
}

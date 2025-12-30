"use client";

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, FileText, AlertTriangle, CheckCircle, TrendingUp, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fetchAudits, fetchOrganizationQuota, Audit } from '@/lib/api';

import { useAuth } from '@/lib/auth-context';

export default function Dashboard() {
  const { user } = useAuth();
  const [auditHistory, setAuditHistory] = useState<Audit[]>([]);
  const [quotaUsed, setQuotaUsed] = useState(0);
  const [quotaLimit, setQuotaLimit] = useState(100);
  const [loading, setLoading] = useState(true);

  // Load audit history and quota from backend
  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        
        // Fetch audits and quota in parallel
        const [audits, quota] = await Promise.all([
          fetchAudits(10, 0),
          fetchOrganizationQuota()
        ]);
        
        setAuditHistory(audits);
        setQuotaUsed(quota.used);
        setQuotaLimit(quota.limit);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadDashboardData();
    }
  }, [user]);

  // Calculate stats
  const totalAudits = auditHistory.length;
  const highRisk = auditHistory.filter(a => a.riskLevel === 'high').length;
  const avgScore = totalAudits > 0 ? Math.round(auditHistory.reduce((acc, curr) => acc + curr.riskScore, 0) / totalAudits) : 0;
  const quotaRemaining = quotaLimit - quotaUsed;
  
  // Get recent audits (top 3)
  const recentAudits = auditHistory.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-teal-500/30">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
              Welcome back, {user?.name || 'Doctor'}
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl">
              {loading ? (
                <span className="inline-flex items-center">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Loading dashboard...
                </span>
              ) : (
                <>
                  Your average audit score is <span className="text-teal-400 font-semibold">{avgScore}</span> this month.
                  You have <span className="text-white font-semibold">{quotaRemaining}</span> audits remaining ({quotaUsed}/{quotaLimit} used).
                </>
              )}
            </p>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-white/5">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 font-medium">Total Audits</p>
                  <h3 className="text-3xl font-bold text-white mt-1">{totalAudits}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-white/5">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 font-medium">Avg Audit Score</p>
                  <h3 className="text-3xl font-bold text-white mt-1">{avgScore}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-teal-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-white/5">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 font-medium">High Risk Found</p>
                  <h3 className="text-3xl font-bold text-white mt-1">{highRisk}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/audit/new">
              <Card className="bg-gradient-to-br from-teal-600 to-blue-600 border-none h-full hover:shadow-lg hover:shadow-teal-500/20 transition-all cursor-pointer group">
                <CardContent className="p-6 flex items-center justify-between h-full">
                  <div>
                    <h3 className="text-xl font-bold text-white">New Audit</h3>
                    <p className="text-teal-100 text-sm mt-1">Start analysis</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Recent Audits</h2>
              <Link href="/history">
                <Button variant="ghost" size="sm" className="text-teal-400">
                  View All <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentAudits.length > 0 ? (
                recentAudits.map((audit, index) => (
                  <Link key={audit.id} href={`/audit/${audit.id}`}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <Card className="hover:bg-white/5 transition-colors cursor-pointer border-white/5">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center",
                              audit.riskLevel === 'low' ? "bg-teal-500/10 text-teal-400" :
                              audit.riskLevel === 'medium' ? "bg-amber-500/10 text-amber-400" :
                              "bg-red-500/10 text-red-400"
                            )}>
                              {audit.riskLevel === 'low' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                            </div>
                            <div>
                              <h4 className="font-medium text-white">CCM Code {audit.codeId}</h4>
                              <p className="text-sm text-slate-400">
                                {new Date(audit.createdAt).toLocaleDateString()} • {audit.clinicalConditions.slice(0, 2).join(', ')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                              audit.riskLevel === 'low' ? "bg-teal-500/10 text-teal-400" :
                              audit.riskLevel === 'medium' ? "bg-amber-500/10 text-amber-400" :
                              "bg-red-500/10 text-red-400"
                            )}>
                              {audit.riskLevel} Risk
                            </span>
                            <p className="text-sm font-bold text-white mt-1">{audit.riskScore}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Link>
                ))
              ) : (
                <Card className="border-white/5">
                  <CardContent className="p-8 text-center">
                    <p className="text-slate-400">No audits yet. Create your first audit to get started!</p>
                    <Link href="/audit/new">
                      <Button className="mt-4">
                        <Plus className="w-4 h-4 mr-2" />
                        New Audit
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Quick Tips</h2>
            <Card className="bg-gradient-to-b from-slate-800 to-slate-900 border-white/5">
              <CardContent className="p-6 space-y-6">
                <div className="flex space-x-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex-shrink-0 flex items-center justify-center">
                    <span className="text-blue-400 font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-1">Time Documentation</h4>
                    <p className="text-sm text-slate-400">Always explicitly state the total time spent on CCM activities for the month.</p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex-shrink-0 flex items-center justify-center">
                    <span className="text-blue-400 font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-1">Care Plan Updates</h4>
                    <p className="text-sm text-slate-400">Note any revisions to the comprehensive care plan, or state that it was reviewed.</p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex-shrink-0 flex items-center justify-center">
                    <span className="text-blue-400 font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-1">Two Conditions</h4>
                    <p className="text-sm text-slate-400">Ensure at least two chronic conditions are listed and their status is updated.</p>
                  </div>
                </div>
                
                <Button variant="secondary" className="w-full mt-4">
                  View All Guidelines
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}



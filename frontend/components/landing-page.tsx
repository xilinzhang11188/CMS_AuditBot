"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ShieldCheck, FileText, CheckCircle, ArrowRight, Zap, Lock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Navbar Placeholder (since real navbar is in layout, but we might want a specific one for landing) */}
      {/* We'll rely on the main Navbar which we will update to handle logged out state */}

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]" />
          <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 border border-white/10 text-teal-400 text-sm font-medium mb-6 backdrop-blur-sm">
                <span className="flex h-2 w-2 rounded-full bg-teal-400 mr-2 animate-pulse"></span>
                Now supporting 2024 CMS Requirements
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                Eliminate CMS Clawback Risk with AI Auditing
              </h1>
              <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                Proactively analyze your chronic care management documentation against CMS requirements. Identify missing elements before you bill.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-full shadow-xl shadow-teal-500/20">
                    Start Free Audit <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-full">
                    Sign In
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-20 relative"
          >
            <div className="relative rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
              <div className="p-2 border-b border-white/10 flex items-center space-x-2 bg-slate-900/80">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <div className="h-4 w-3/4 bg-slate-800 rounded animate-pulse" />
                  <div className="h-4 w-full bg-slate-800 rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-slate-800 rounded animate-pulse" />
                  <div className="h-32 w-full bg-slate-800/50 rounded border border-white/5 p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span className="text-xs text-slate-400">Clinical Note.pdf</span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 w-full bg-slate-700 rounded" />
                      <div className="h-2 w-full bg-slate-700 rounded" />
                      <div className="h-2 w-2/3 bg-slate-700 rounded" />
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <div className="rounded-xl bg-slate-950 border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white">Audit Results</h3>
                        <p className="text-sm text-slate-400">CCM Code 99490</p>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-medium flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        High Risk
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/10">
                        <div className="flex items-start">
                          <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center mr-3 flex-shrink-0">
                            <span className="text-red-400 font-bold text-xs">!</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-red-200">Missing Care Plan Revision</h4>
                            <p className="text-xs text-slate-400 mt-1">Documentation does not indicate that the care plan was established, implemented, revised, or monitored.</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-teal-500/5 border border-teal-500/10">
                        <div className="flex items-start">
                          <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center mr-3 flex-shrink-0">
                            <CheckCircle className="w-3 h-3 text-teal-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-teal-200">Time Requirement Met</h4>
                            <p className="text-xs text-slate-400 mt-1">25 minutes of clinical staff time documented.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-900/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Providers Trust Auto-Auditor</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Stop worrying about audits and focus on patient care. Our intelligent system handles the compliance heavy lifting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-teal-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Instant Analysis</h3>
              <p className="text-slate-400">
                Upload your clinical notes and get a comprehensive audit risk assessment in under 30 seconds.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">CMS Compliance</h3>
              <p className="text-slate-400">
                Rules engine updated regularly with the latest CMS Local Coverage Determination (LCD) requirements.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Reduce Clawbacks</h3>
              <p className="text-slate-400">
                Identify and fix documentation gaps before you bill, significantly reducing the risk of revenue loss.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/20 to-blue-900/20" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to secure your revenue?</h2>
          <p className="text-xl text-slate-300 mb-10">
            Join the waitlist today and get 20 free audits per month. No credit card required.
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-10 py-6 rounded-full shadow-xl shadow-teal-500/20">
              Get Started for Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">CMS Auto-Auditor</span>
          </div>
          <div className="text-slate-500 text-sm">
            © 2024 CMS Auto-Auditor. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Download, ArrowLeft, FileText, AlertOctagon, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { CCM_CODES } from '@/lib/data';

export default function AuditResult() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, we would fetch by ID. 
    // For this demo, we'll try to get the 'currentAudit' from localStorage
    // or find it in history if the ID matches.
    const current = localStorage.getItem('currentAudit');
    const history = JSON.parse(localStorage.getItem('auditHistory') || '[]');
    
    let foundResult = null;
    
    if (current) {
      const parsed = JSON.parse(current);
      if (parsed.id === params.id) {
        foundResult = parsed;
      }
    }
    
    if (!foundResult) {
      foundResult = history.find(r => r.id === params.id);
    }

    if (foundResult) {
      setResult(foundResult);
    } else {
      // Fallback for demo if refreshed and lost state (since we don't have a real backend)
      // Redirect to history or show error
      // For now, let's just redirect to dashboard
      router.push('/');
    }
    setLoading(false);
  }, [params.id, router]);

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;
  if (!result) return null;

  const codeDetails = CCM_CODES.find(c => c.id === result.codeId);

  const getRiskColor = (level) => {
    switch(level) {
      case 'High': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'Medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Low': return 'text-teal-400 bg-teal-500/10 border-teal-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/history">
            <Button variant="ghost" className="pl-0 hover:pl-2 transition-all">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to History
            </Button>
          </Link>
          <div className="flex space-x-3">
            <Button variant="secondary">
              <Download className="w-4 h-4 mr-2" /> Export PDF
            </Button>
            <Link href="/audit/new">
              <Button>New Audit</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Score & Summary */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-white/10 overflow-hidden relative">
                <div className={cn("absolute top-0 left-0 w-full h-2", 
                  result.riskLevel === 'High' ? 'bg-red-500' : 
                  result.riskLevel === 'Medium' ? 'bg-amber-500' : 'bg-teal-500'
                )} />
                <CardContent className="p-8 text-center">
                  <h2 className="text-lg font-medium text-slate-400 mb-6">Audit Risk Assessment</h2>
                  
                  <div className="relative w-48 h-48 mx-auto mb-6 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-slate-800"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 88}
                        strokeDashoffset={2 * Math.PI * 88 * (1 - result.riskScore / 100)}
                        className={cn(
                          result.riskLevel === 'High' ? 'text-red-500' : 
                          result.riskLevel === 'Medium' ? 'text-amber-500' : 'text-teal-500'
                        )}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-bold text-white">{result.riskScore}%</span>
                      <span className={cn("text-sm font-bold uppercase mt-1 px-2 py-0.5 rounded-full", getRiskColor(result.riskLevel))}>
                        {result.riskLevel} Risk
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-left bg-white/5 rounded-lg p-4">
                    <div>
                      <p className="text-xs text-slate-400 uppercase">CCM Code</p>
                      <p className="font-bold text-white text-lg">{result.codeId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase">Date</p>
                      <p className="font-bold text-white text-lg">{new Date(result.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-white/10">
                <CardHeader>
                  <CardTitle>Clinical Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.clinicalConditions.map((condition, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm border border-blue-500/20">
                        {condition}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column: Detailed Findings */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertOctagon className="w-5 h-5 text-red-400 mr-2" />
                    Missing Requirements ({result.missingRequirements.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.missingRequirements.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <CheckCircle className="w-12 h-12 text-teal-500 mx-auto mb-3" />
                      <p>Great job! No missing requirements detected.</p>
                    </div>
                  ) : (
                    result.missingRequirements.map((item, index) => (
                      <div key={index} className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-0.5">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-bold text-red-200">{item.requirement}</h4>
                            <p className="text-sm text-slate-300 mt-1">{item.explanation}</p>
                            
                            <div className="mt-3 bg-slate-900/50 rounded p-3 border border-white/5">
                              <p className="text-xs text-teal-400 font-bold uppercase mb-1">Suggestion</p>
                              <p className="text-sm text-slate-300 italic">"{item.suggestion}"</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-teal-400 mr-2" />
                    Met Requirements ({result.metRequirements.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {result.metRequirements.map((req, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-teal-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300 text-sm">{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

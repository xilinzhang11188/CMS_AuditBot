"use client";

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Download, ArrowLeft, FileText, AlertOctagon, Info, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { fetchAuditById, Audit } from '@/lib/api';

interface AuditResult {
  id: string;
  date: string;
  codeId: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  riskScore: number;
  clinicalConditions: string[];
  missingRequirements: Array<{
    requirement: string;
    explanation: string;
    suggestion: string;
  }>;
  metRequirements: string[];
  noteText?: string;
}

export default function AuditResult() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAudit() {
      try {
        setLoading(true);
        setError(null);
        const audit = await fetchAuditById(params.id as string);
        setResult(audit);
      } catch (err) {
        console.error('Failed to fetch audit:', err);
        setError(err instanceof Error ? err.message : 'Failed to load audit');
      } finally {
        setLoading(false);
      }
    }
    if (params.id) {
      loadAudit();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
          <p className="text-slate-400">Loading audit...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold">Failed to Load Audit</h2>
          <p className="text-slate-400">{error}</p>
          <Link href="/history">
            <Button>Back to History</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const getRiskColor = (level: string) => {
    switch(level.toLowerCase()) {
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'low': return 'text-teal-400 bg-teal-500/10 border-teal-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getRiskLevelDisplay = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1);
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
                  result.riskLevel === 'high' ? 'bg-red-500' :
                  result.riskLevel === 'medium' ? 'bg-amber-500' : 'bg-teal-500'
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
                          result.riskLevel === 'high' ? 'text-red-500' :
                          result.riskLevel === 'medium' ? 'text-amber-500' : 'text-teal-500'
                        )}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-bold text-white">{result.riskScore}</span>
                      <span className={cn("text-sm font-bold uppercase mt-1 px-2 py-0.5 rounded-full", getRiskColor(result.riskLevel))}>
                        {getRiskLevelDisplay(result.riskLevel)} Risk
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
                      <p className="font-bold text-white text-lg">{new Date(result.createdAt).toLocaleDateString()}</p>
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
                    {result.clinicalConditions.map((condition: string, i: number) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm border border-blue-500/20">
                        {condition}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Clinical Note Preview */}
            {result.noteText && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Card className="border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="w-5 h-5 text-blue-400 mr-2" />
                      Clinical Note (PHI Stripped)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-white/5 max-h-64 overflow-y-auto">
                      <p className="text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                        {result.noteText}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-xs text-slate-500">
                      <Info className="w-3 h-3 mr-1" />
                      Patient identifiable information has been removed for privacy
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
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
                    result.missingRequirements.map((item: any, index: number) => (
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
                              <p className="text-sm text-slate-300 italic">&ldquo;{item.suggestion}&rdquo;</p>
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
                    {result.metRequirements.map((req: string, index: number) => (
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

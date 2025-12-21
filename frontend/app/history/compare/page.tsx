"use client";

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { compareAudits, Audit } from '@/lib/api';

export default function ComparePage() {
  const searchParams = useSearchParams();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComparisonData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const ids = searchParams.getAll('ids');
        
        if (ids.length === 0) {
          setError('No audits selected for comparison');
          setLoading(false);
          return;
        }
        
        if (ids.length > 3) {
          setError('Maximum 3 audits can be compared at once');
          setLoading(false);
          return;
        }
        
        const comparedAudits = await compareAudits(ids);
        setAudits(comparedAudits);
      } catch (err) {
        console.error('Failed to fetch comparison data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load comparison data');
      } finally {
        setLoading(false);
      }
    };

    fetchComparisonData();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-teal-400" />
          <p className="text-slate-400">Loading comparison...</p>
        </div>
      </div>
    );
  }

  if (error || audits.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">{error || 'No audits found'}</h2>
          <p className="text-slate-400 mb-4">
            {error || 'The selected audits could not be loaded'}
          </p>
          <Link href="/history">
            <Button>Back to History</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/history">
              <Button variant="ghost" className="mr-4 pl-0 hover:pl-2 transition-all">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-white">Audit Comparison</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {audits.map((audit) => (
            <Card key={audit.id} className="border-white/10 bg-slate-900/50 flex flex-col">
              <CardHeader className="border-b border-white/5 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">{new Date(audit.createdAt).toLocaleDateString()}</p>
                    <CardTitle className="text-xl">Code {audit.codeId}</CardTitle>
                  </div>
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center border-4",
                    audit.riskLevel === 'high' ? "border-red-500/20 text-red-500" :
                    audit.riskLevel === 'medium' ? "border-amber-500/20 text-amber-500" :
                    "border-teal-500/20 text-teal-500"
                  )}>
                    <span className="font-bold text-sm">{audit.riskScore}%</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 flex-grow space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-400 uppercase mb-2">Risk Level</h4>
                  <span className={cn(
                    "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize",
                    audit.riskLevel === 'low' ? "bg-teal-500/10 text-teal-400" :
                    audit.riskLevel === 'medium' ? "bg-amber-500/10 text-amber-400" :
                    "bg-red-500/10 text-red-400"
                  )}>
                    {audit.riskLevel === 'low' ? <CheckCircle className="w-4 h-4 mr-2" /> : <AlertTriangle className="w-4 h-4 mr-2" />}
                    {audit.riskLevel} Risk
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-400 uppercase mb-2">Conditions</h4>
                  <div className="flex flex-wrap gap-2">
                    {audit.clinicalConditions.map((c, i) => (
                      <span key={i} className="px-2 py-1 rounded bg-slate-800 text-xs text-slate-300 border border-white/5">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-400 uppercase mb-2">Missing Requirements</h4>
                  {audit.missingRequirements && audit.missingRequirements.length > 0 ? (
                    <ul className="space-y-2">
                      {audit.missingRequirements.map((req, i) => (
                        <li key={i} className="flex items-start text-sm text-red-300 bg-red-500/5 p-2 rounded border border-red-500/10">
                          <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                          <span>{req.requirement}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex items-center text-teal-400 text-sm bg-teal-500/5 p-2 rounded border border-teal-500/10">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      All requirements met
                    </div>
                  )}
                </div>
              </CardContent>
              <div className="p-6 pt-0 mt-auto">
                <Link href={`/audit/${audit.id}`} className="w-full">
                  <Button variant="secondary" className="w-full">View Full Report</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

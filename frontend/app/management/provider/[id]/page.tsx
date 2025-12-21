"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, FileText, Calendar, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { fetchProviderDetail, ProviderDetail } from '@/lib/api';

export default function ProviderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const providerId = params.id as string;
  
  const [providerData, setProviderData] = useState<ProviderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProvider() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProviderDetail(providerId);
        setProviderData(data);
      } catch (err: any) {
        console.error('Failed to fetch provider:', err);
        setError(err.message || 'Failed to load provider details');
        
        // If access denied, redirect to dashboard
        if (err.message.includes('Access denied') || err.message.includes('Manager role required')) {
          router.push('/dashboard');
        }
      } finally {
        setLoading(false);
      }
    }

    if (providerId) {
      loadProvider();
    }
  }, [providerId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !providerData) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  {error || 'Provider Not Found'}
                </h3>
                <Button onClick={() => router.push('/')} className="mt-4">
                  Return to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const provider = providerData.provider;
  const audits = providerData.audits;
  const lastAudit = audits.length > 0 ? audits[0] : null;

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'High':
        return <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/20">High Risk</Badge>;
      case 'Medium':
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20">Medium Risk</Badge>;
      case 'Low':
        return <Badge variant="outline" className="bg-teal-500/10 text-teal-400 border-teal-500/20">Low Risk</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="mb-6 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Management Dashboard
        </Button>

        {/* Provider Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
              {provider.name.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{provider.name}</h1>
              <p className="text-slate-400">{provider.email}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Audits</CardTitle>
              <FileText className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{provider.auditCount}</div>
              <p className="text-xs text-slate-500 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Average Risk Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-teal-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{provider.avgRiskScore.toFixed(1)}%</div>
              <p className="text-xs text-slate-500 mt-1">Across all audits</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">High Risk Audits</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{provider.highRiskCount}</div>
              <p className="text-xs text-slate-500 mt-1">Require attention</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Last Audit</CardTitle>
              <Calendar className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {lastAudit
                  ? new Date(lastAudit.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : 'N/A'
                }
              </div>
              <p className="text-xs text-slate-500 mt-1">Most recent</p>
            </CardContent>
          </Card>
        </div>

        {/* Audit History */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Audit History</CardTitle>
            <CardDescription className="text-slate-400">
              Complete audit history for {provider.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {audits.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  No audits found for this provider
                </div>
              ) : (
                audits.map((audit) => (
                  <Link
                    key={audit.id}
                    href={`/audit/${audit.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="text-center min-w-[80px]">
                          <div className="text-sm text-slate-400">Date</div>
                          <div className="text-white font-medium">
                            {new Date(audit.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>

                        <div className="text-center min-w-[80px]">
                          <div className="text-sm text-slate-400">Code</div>
                          <div className="text-white font-medium">{audit.codeId}</div>
                        </div>

                        <div className="flex-1">
                          <div className="text-sm text-slate-400">Conditions</div>
                          <div className="text-white">{audit.clinicalConditions.join(', ') || 'N/A'}</div>
                        </div>

                        <div className="text-center min-w-[100px]">
                          <div className="text-sm text-slate-400">Score</div>
                          <div className="text-2xl font-bold text-white">{audit.riskScore}%</div>
                        </div>

                        <div className="min-w-[120px]">
                          {getRiskBadge(audit.riskLevel.charAt(0).toUpperCase() + audit.riskLevel.slice(1))}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { Navbar } from '@/components/navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Filter, AlertTriangle, CheckCircle, Eye, Calendar, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { fetchManagementAudits, fetchProviders, AuditWithProvider, ProviderStats } from '@/lib/api';

function AllAuditsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [audits, setAudits] = useState<AuditWithProvider[]>([]);
  const [providers, setProviders] = useState<ProviderStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalAudits, setTotalAudits] = useState(0);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProvider, setFilterProvider] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Check for query parameters and set initial filters
  useEffect(() => {
    const riskParam = searchParams.get('risk');
    if (riskParam && ['High', 'Medium', 'Low'].includes(riskParam)) {
      setFilterRisk(riskParam);
    }
  }, [searchParams]);

  // Get month parameter for title
  const monthParam = searchParams.get('month');
  const getPageTitle = () => {
    if (monthParam) {
      const date = new Date(monthParam + '-01');
      const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      return `Audits for ${monthName}`;
    }
    return 'All Audits';
  };

  // Load providers for filter dropdown
  useEffect(() => {
    async function loadProviders() {
      try {
        const data = await fetchProviders();
        setProviders(data);
      } catch (err: any) {
        console.error('Failed to fetch providers:', err);
      }
    }
    loadProviders();
  }, []);

  // Load audits when filters change
  useEffect(() => {
    async function loadAudits() {
      try {
        setLoading(true);
        setError(null);
        
        const params: any = {
          page: currentPage,
          limit: itemsPerPage
        };
        
        if (filterProvider !== 'all') params.providerId = filterProvider;
        if (filterRisk !== 'all') params.riskLevel = filterRisk;
        if (startDate) params.startDate = new Date(startDate).toISOString();
        if (endDate) params.endDate = new Date(endDate).toISOString();
        
        const data = await fetchManagementAudits(params);
        setAudits(data.audits);
        setTotalAudits(data.total);
      } catch (err: any) {
        console.error('Failed to fetch audits:', err);
        setError(err.message || 'Failed to load audits');
        
        // If access denied, redirect to dashboard
        if (err.message.includes('Access denied') || err.message.includes('Manager role required')) {
          router.push('/dashboard');
        }
      } finally {
        setLoading(false);
      }
    }

    loadAudits();
  }, [filterProvider, filterRisk, startDate, endDate, currentPage, router]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterProvider, filterRisk, startDate, endDate]);

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
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="mb-4 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Management Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-white mb-2">{getPageTitle()}</h1>
          <p className="text-slate-400">
            {monthParam
              ? `Audit history for ${new Date(monthParam + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} across all providers`
              : 'Complete audit history across all providers in your organization'
            }
          </p>
        </div>

        {/* Filters */}
        <Card className="bg-slate-900 border-slate-800 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              {/* First Row: Search, Provider, Risk */}
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by provider, code, or condition..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Provider Filter */}
                <select
                  value={filterProvider}
                  onChange={(e) => setFilterProvider(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Providers</option>
                  {providers.map(provider => (
                    <option key={provider.id} value={provider.id}>{provider.name}</option>
                  ))}
                </select>

                {/* Risk Filter */}
                <select
                  value={filterRisk}
                  onChange={(e) => setFilterRisk(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="High">High Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="Low">Low Risk</option>
                </select>
              </div>

              {/* Second Row: Date Range */}
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span>Date Range:</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="flex-1">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Start Date"
                    />
                  </div>
                  <div className="flex items-center justify-center text-slate-500">
                    <span>to</span>
                  </div>
                  <div className="flex-1">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="End Date"
                    />
                  </div>
                  {(startDate || endDate) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setStartDate('');
                        setEndDate('');
                      }}
                      className="text-slate-400 hover:text-white"
                    >
                      Clear Dates
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pagination Info */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-slate-400">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
            ) : (
              <>Showing {totalAudits > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, totalAudits)} of {totalAudits} audits</>
            )}
          </div>
        </div>

        {/* Audits Table */}
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-slate-400 font-medium">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Provider</th>
                    <th className="px-6 py-4">CCM Code</th>
                    <th className="px-6 py-4">Conditions</th>
                    <th className="px-6 py-4">Risk Level</th>
                    <th className="px-6 py-4">Score</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-teal-400 mx-auto" />
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-red-400">
                        {error}
                      </td>
                    </tr>
                  ) : audits.length > 0 ? (
                    audits.map((audit) => (
                      <tr key={audit.audit.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-slate-300">
                          {new Date(audit.audit.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/management/provider/${audit.audit.userId}`}
                            className="text-teal-400 hover:text-teal-300 font-medium"
                          >
                            {audit.providerName}
                          </Link>
                        </td>
                        <td className="px-6 py-4 font-medium text-white">
                          {audit.audit.codeId}
                        </td>
                        <td className="px-6 py-4 text-slate-300">
                          {audit.audit.clinicalConditions.join(', ') || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          {getRiskBadge(audit.audit.riskLevel.charAt(0).toUpperCase() + audit.audit.riskLevel.slice(1))}
                        </td>
                        <td className="px-6 py-4 font-bold text-white">
                          {audit.audit.riskScore}%
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/audit/${audit.audit.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                        No audits found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination Controls */}
        {!loading && totalAudits > itemsPerPage && (
          <div className="mt-6 flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-50"
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-50"
            >
              ← Previous
            </Button>
            
            <div className="flex items-center space-x-2">
              {Array.from({ length: Math.ceil(totalAudits / itemsPerPage) }, (_, i) => i + 1)
                .filter(page => {
                  // Show first page, last page, current page, and pages around current
                  const totalPages = Math.ceil(totalAudits / itemsPerPage);
                  return page === 1 ||
                         page === totalPages ||
                         (page >= currentPage - 1 && page <= currentPage + 1);
                })
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="text-slate-500">...</span>
                    )}
                    <Button
                      variant={currentPage === page ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "min-w-[40px]",
                        currentPage === page
                          ? "bg-teal-500 text-white hover:bg-teal-600"
                          : "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
                      )}
                    >
                      {page}
                    </Button>
                  </React.Fragment>
                ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalAudits / itemsPerPage), prev + 1))}
              disabled={currentPage === Math.ceil(totalAudits / itemsPerPage)}
              className="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-50"
            >
              Next →
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.ceil(totalAudits / itemsPerPage))}
              disabled={currentPage === Math.ceil(totalAudits / itemsPerPage)}
              className="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-50"
            >
              Last
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Loading audits...</h2>
        </div>
      </div>
    </div>
  );
}

export default function AllAuditsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AllAuditsPageContent />
    </Suspense>
  );
}
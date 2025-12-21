"use client";

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Search, Filter, Trash2, Eye, CheckCircle, AlertTriangle, GitCompare, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { fetchAuditHistory, deleteAudit, Audit } from '@/lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function HistoryPage() {
  const router = useRouter();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);

  const loadAudits = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchAuditHistory({
        search: searchTerm,
        riskLevel: riskFilter,
        page,
        limit
      });
      setAudits(result.audits);
      setTotal(result.total);
    } catch (err) {
      console.error('Failed to fetch audit history:', err);
      setError(err instanceof Error ? err.message : 'Failed to load audit history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudits();
  }, [page, searchTerm, riskFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this audit?')) {
      return;
    }

    try {
      await deleteAudit(id);
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
      // Reload audits after deletion
      await loadAudits();
    } catch (err) {
      console.error('Failed to delete audit:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete audit');
    }
  };

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds([...selectedIds, id]);
      } else {
        alert("You can compare up to 3 audits at a time.");
      }
    }
  };

  const handleCompare = () => {
    if (selectedIds.length < 2) return;
    const params = new URLSearchParams();
    selectedIds.forEach(id => params.append('ids', id));
    router.push(`/history/compare?${params.toString()}`);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1); // Reset to first page on search
  };

  const handleRiskFilter = (value: string) => {
    setRiskFilter(value === 'all' ? '' : value);
    setPage(1); // Reset to first page on filter
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Audit History</h1>
            <p className="text-slate-400 mt-1">Review and manage your past clinical documentation audits.</p>
          </div>
          <div className="flex gap-3">
             {selectedIds.length > 0 && (
              <Button 
                variant="primary" 
                onClick={handleCompare}
                disabled={selectedIds.length < 2}
                className={cn(selectedIds.length < 2 ? "opacity-50 cursor-not-allowed" : "")}
              >
                <GitCompare className="w-4 h-4 mr-2" /> 
                Compare ({selectedIds.length})
              </Button>
            )}
            <Link href="/audit/new">
              <Button>New Audit</Button>
            </Link>
          </div>
        </div>

        <Card className="border-white/10 bg-slate-900/50">
          <CardHeader className="border-b border-white/5 pb-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search by condition..." 
                  className="w-full bg-slate-800 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={riskFilter || 'all'} onValueChange={handleRiskFilter}>
                  <SelectTrigger className="w-[140px] bg-slate-800 border-white/10">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Risk Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risks</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-400">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3" />
                <p>{error}</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-slate-400 font-medium">
                      <tr>
                        <th className="px-6 py-4 w-10">
                          <span className="sr-only">Select</span>
                        </th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">CCM Code</th>
                        <th className="px-6 py-4">Conditions</th>
                        <th className="px-6 py-4">Risk Level</th>
                        <th className="px-6 py-4">Score</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {audits.length > 0 ? (
                        audits.map((audit) => (
                          <tr key={audit.id} className={cn("hover:bg-white/5 transition-colors", selectedIds.includes(audit.id) ? "bg-teal-500/5" : "")}>
                            <td className="px-6 py-4">
                              <input 
                                type="checkbox" 
                                className="rounded border-slate-600 bg-slate-800 text-teal-500 focus:ring-teal-500/50"
                                checked={selectedIds.includes(audit.id)}
                                onChange={() => toggleSelection(audit.id)}
                              />
                            </td>
                            <td className="px-6 py-4 text-slate-300">
                              {new Date(audit.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 font-medium text-white">
                              {audit.codeId}
                            </td>
                            <td className="px-6 py-4 text-slate-300">
                              <div className="flex flex-wrap gap-1">
                                {audit.clinicalConditions.slice(0, 2).map((c, i) => (
                                  <span key={i} className="px-2 py-0.5 rounded-full bg-slate-800 text-xs border border-white/10">
                                    {c}
                                  </span>
                                ))}
                                {audit.clinicalConditions.length > 2 && (
                                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs border border-white/10">
                                    +{audit.clinicalConditions.length - 2}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={cn(
                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                audit.riskLevel === 'low' ? "bg-teal-500/10 text-teal-400" :
                                audit.riskLevel === 'medium' ? "bg-amber-500/10 text-amber-400" :
                                "bg-red-500/10 text-red-400"
                              )}>
                                {audit.riskLevel === 'low' ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                                {audit.riskLevel.charAt(0).toUpperCase() + audit.riskLevel.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-bold text-white">
                              {audit.riskScore}%
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Link href={`/audit/${audit.id}`}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </Link>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                  onClick={() => handleDelete(audit.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                            No audit history found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
                    <div className="text-sm text-slate-400">
                      Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} results
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (page <= 3) {
                            pageNum = i + 1;
                          } else if (page >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = page - 2 + i;
                          }
                          return (
                            <Button
                              key={pageNum}
                              variant={page === pageNum ? "default" : "secondary"}
                              size="sm"
                              onClick={() => setPage(pageNum)}
                              className="w-8"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

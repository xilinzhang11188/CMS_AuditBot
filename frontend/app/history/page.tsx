"use client";

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MOCK_AUDIT_HISTORY } from '@/lib/data';
import { Search, Filter, Trash2, Eye, ArrowUpDown, CheckCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Load history from local storage or use mock if empty
    const stored = localStorage.getItem('auditHistory');
    if (stored) {
      setHistory(JSON.parse(stored));
    } else {
      setHistory(MOCK_AUDIT_HISTORY);
      localStorage.setItem('auditHistory', JSON.stringify(MOCK_AUDIT_HISTORY));
    }
  }, []);

  const filteredHistory = history.filter(item => 
    item.codeId.includes(searchTerm) || 
    item.clinicalConditions.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = (id) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem('auditHistory', JSON.stringify(newHistory));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Audit History</h1>
            <p className="text-slate-400 mt-1">Review and manage your past clinical documentation audits.</p>
          </div>
          <Link href="/audit/new">
            <Button>New Audit</Button>
          </Link>
        </div>

        <Card className="border-white/10 bg-slate-900/50">
          <CardHeader className="border-b border-white/5 pb-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search by code or condition..." 
                  className="w-full bg-slate-800 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm">
                  <Filter className="w-4 h-4 mr-2" /> Filter
                </Button>
                <Button variant="secondary" size="sm">
                  <ArrowUpDown className="w-4 h-4 mr-2" /> Sort
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-slate-400 font-medium">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">CCM Code</th>
                    <th className="px-6 py-4">Conditions</th>
                    <th className="px-6 py-4">Risk Level</th>
                    <th className="px-6 py-4">Score</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((audit) => (
                      <tr key={audit.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-slate-300">
                          {new Date(audit.date).toLocaleDateString()}
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
                            audit.riskLevel === 'Low' ? "bg-teal-500/10 text-teal-400" :
                            audit.riskLevel === 'Medium' ? "bg-amber-500/10 text-amber-400" :
                            "bg-red-500/10 text-red-400"
                          )}>
                            {audit.riskLevel === 'Low' ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                            {audit.riskLevel}
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
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        No audit history found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

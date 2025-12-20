"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, FileText } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/navbar';

// Mock data for providers in the organization
const mockProviders = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    email: 'sarah.chen@citymedical.com',
    role: 'Primary Care Physician',
    auditsThisMonth: 18,
    averageRiskScore: 85,
    highRiskAudits: 2,
    lastAuditDate: '2024-01-15',
    trend: 'up'
  },
  {
    id: '2',
    name: 'Dr. James Wilson',
    email: 'james.wilson@citymedical.com',
    role: 'Internal Medicine',
    auditsThisMonth: 22,
    averageRiskScore: 92,
    highRiskAudits: 0,
    lastAuditDate: '2024-01-16',
    trend: 'up'
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    email: 'emily.rodriguez@citymedical.com',
    role: 'Family Medicine',
    auditsThisMonth: 15,
    averageRiskScore: 78,
    highRiskAudits: 4,
    lastAuditDate: '2024-01-14',
    trend: 'down'
  },
  {
    id: '4',
    name: 'Dr. Michael Chang',
    email: 'michael.chang@citymedical.com',
    role: 'Geriatric Medicine',
    auditsThisMonth: 20,
    averageRiskScore: 88,
    highRiskAudits: 1,
    lastAuditDate: '2024-01-16',
    trend: 'stable'
  }
];

export default function ManagementDashboard() {
  const { user } = useAuth();

  const totalAudits = mockProviders.reduce((sum, p) => sum + p.auditsThisMonth, 0);
  const avgOrgRiskScore = Math.round(
    mockProviders.reduce((sum, p) => sum + p.averageRiskScore, 0) / mockProviders.length
  );
  const totalHighRisk = mockProviders.reduce((sum, p) => sum + p.highRiskAudits, 0);
  const providersCount = mockProviders.length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Management Dashboard</h1>
            <p className="text-slate-400">
              Welcome back, {user?.name} - {user?.organization}
            </p>
          </div>
          <Link href="/management/all-audits">
            <Button className="bg-teal-600 hover:bg-teal-700">
              <FileText className="w-4 h-4 mr-2" />
              All Audit History
            </Button>
          </Link>
        </div>

        {/* Organization Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Providers</CardTitle>
              <Users className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{providersCount}</div>
              <p className="text-xs text-slate-500 mt-1">Active in organization</p>
            </CardContent>
          </Card>

          <Link href={`/management/all-audits?month=${new Date().toISOString().slice(0, 7)}`}>
            <Card className="bg-slate-900 border-slate-800 cursor-pointer hover:bg-slate-800 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Audits This Month</CardTitle>
                <Clock className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{totalAudits}</div>
                <p className="text-xs text-slate-500 mt-1">Across all providers • Click to view all</p>
              </CardContent>
            </Card>
          </Link>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Avg Risk Score</CardTitle>
              <TrendingUp className={cn(
                "h-4 w-4",
                avgOrgRiskScore >= 90 ? "text-teal-400" :
                avgOrgRiskScore >= 70 ? "text-amber-400" :
                "text-red-400"
              )} />
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold",
                avgOrgRiskScore >= 90 ? "text-teal-400" :
                avgOrgRiskScore >= 70 ? "text-amber-400" :
                "text-red-400"
              )}>
                {avgOrgRiskScore}%
              </div>
              <p className={cn(
                "text-xs mt-1",
                avgOrgRiskScore >= 90 ? "text-teal-400" :
                avgOrgRiskScore >= 70 ? "text-amber-400" :
                "text-red-400"
              )}>
                +5% from last month
              </p>
            </CardContent>
          </Card>

          <Link href="/management/all-audits?risk=High">
            <Card className="bg-slate-900 border-slate-800 cursor-pointer hover:bg-slate-800 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">High Risk Audits</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{totalHighRisk}</div>
                <p className="text-xs text-slate-500 mt-1">Require attention • Click to view</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Providers List */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Provider Performance</CardTitle>
            <CardDescription className="text-slate-400">
              Click on a provider to view their detailed audit history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockProviders.map((provider) => (
                <Link
                  key={provider.id}
                  href={`/management/provider/${provider.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors border border-slate-700 hover:border-slate-600">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-blue-600 flex items-center justify-center text-white font-bold">
                        {provider.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{provider.name}</h3>
                        <p className="text-sm text-slate-400">{provider.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-sm text-slate-400">Audits</div>
                        <div className="text-lg font-semibold text-white">{provider.auditsThisMonth}</div>
                      </div>

                      <div className="text-center">
                        <div className="text-sm text-slate-400">Avg Score</div>
                        <div className="flex items-center space-x-1">
                          <span className={cn(
                            "text-lg font-semibold",
                            provider.averageRiskScore >= 90 ? "text-teal-400" :
                            provider.averageRiskScore >= 70 ? "text-amber-400" :
                            "text-red-400"
                          )}>
                            {provider.averageRiskScore}%
                          </span>
                          {provider.trend === 'up' && <TrendingUp className={cn(
                            "w-4 h-4",
                            provider.averageRiskScore >= 90 ? "text-teal-400" :
                            provider.averageRiskScore >= 70 ? "text-amber-400" :
                            "text-red-400"
                          )} />}
                          {provider.trend === 'down' && <TrendingDown className={cn(
                            "w-4 h-4",
                            provider.averageRiskScore >= 90 ? "text-teal-400" :
                            provider.averageRiskScore >= 70 ? "text-amber-400" :
                            "text-red-400"
                          )} />}
                        </div>
                      </div>

                      <div className="text-center min-w-[100px]">
                        {provider.highRiskAudits > 0 ? (
                          <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/20">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {provider.highRiskAudits} High Risk
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-teal-500/10 text-teal-400 border-teal-500/20">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            All Clear
                          </Badge>
                        )}
                      </div>

                      <Button variant="ghost" size="sm" className="text-teal-400 hover:text-teal-300">
                        View Details →
                      </Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
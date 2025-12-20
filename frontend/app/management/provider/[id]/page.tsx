"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, FileText, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';

// Mock provider data
const mockProviderData: Record<string, any> = {
  '1': {
    id: '1',
    name: 'Dr. Sarah Chen',
    email: 'sarah.chen@citymedical.com',
    role: 'Primary Care Physician',
    auditsThisMonth: 18,
    averageRiskScore: 85,
    highRiskAudits: 2,
    lastAuditDate: '2024-01-15',
    trend: 'up',
    auditHistory: [
      { id: 'a1', date: '2024-01-15', code: '99490', riskLevel: 'Low', riskScore: 95, conditions: 'Diabetes, Hypertension' },
      { id: 'a2', date: '2024-01-14', code: '99439', riskLevel: 'High', riskScore: 65, conditions: 'CHF, COPD' },
      { id: 'a3', date: '2024-01-13', code: '99491', riskLevel: 'Medium', riskScore: 78, conditions: 'Diabetes' },
      { id: 'a4', date: '2024-01-12', code: '99490', riskLevel: 'Low', riskScore: 92, conditions: 'Hypertension' },
      { id: 'a5', date: '2024-01-11', code: '99437', riskLevel: 'High', riskScore: 58, conditions: 'Multiple Chronic Conditions' },
    ]
  },
  '2': {
    id: '2',
    name: 'Dr. James Wilson',
    email: 'james.wilson@citymedical.com',
    role: 'Internal Medicine',
    auditsThisMonth: 22,
    averageRiskScore: 92,
    highRiskAudits: 0,
    lastAuditDate: '2024-01-16',
    trend: 'up',
    auditHistory: [
      { id: 'b1', date: '2024-01-16', code: '99490', riskLevel: 'Low', riskScore: 94, conditions: 'Diabetes' },
      { id: 'b2', date: '2024-01-15', code: '99491', riskLevel: 'Low', riskScore: 90, conditions: 'Hypertension, Diabetes' },
      { id: 'b3', date: '2024-01-14', code: '99490', riskLevel: 'Low', riskScore: 93, conditions: 'COPD' },
    ]
  },
  '3': {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    email: 'emily.rodriguez@citymedical.com',
    role: 'Family Medicine',
    auditsThisMonth: 15,
    averageRiskScore: 78,
    highRiskAudits: 4,
    lastAuditDate: '2024-01-14',
    trend: 'down',
    auditHistory: [
      { id: 'c1', date: '2024-01-14', code: '99490', riskLevel: 'High', riskScore: 62, conditions: 'Diabetes' },
      { id: 'c2', date: '2024-01-13', code: '99439', riskLevel: 'High', riskScore: 68, conditions: 'CHF' },
      { id: 'c3', date: '2024-01-12', code: '99491', riskLevel: 'Medium', riskScore: 75, conditions: 'Hypertension' },
    ]
  },
  '4': {
    id: '4',
    name: 'Dr. Michael Chang',
    email: 'michael.chang@citymedical.com',
    role: 'Geriatric Medicine',
    auditsThisMonth: 20,
    averageRiskScore: 88,
    highRiskAudits: 1,
    lastAuditDate: '2024-01-16',
    trend: 'stable',
    auditHistory: [
      { id: 'd1', date: '2024-01-16', code: '99490', riskLevel: 'Low', riskScore: 91, conditions: 'Multiple Chronic Conditions' },
      { id: 'd2', date: '2024-01-15', code: '99487', riskLevel: 'Medium', riskScore: 82, conditions: 'Complex Care Management' },
      { id: 'd3', date: '2024-01-14', code: '99491', riskLevel: 'High', riskScore: 70, conditions: 'Dementia, Diabetes' },
    ]
  }
};

export default function ProviderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const providerId = params.id as string;
  const provider = mockProviderData[providerId];

  if (!provider) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Provider Not Found</h1>
          <Button onClick={() => router.push('/')}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

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
              <p className="text-slate-400">{provider.role} • {provider.email}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Audits This Month</CardTitle>
              <FileText className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{provider.auditsThisMonth}</div>
              <p className="text-xs text-slate-500 mt-1">Total completed</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Average Risk Score</CardTitle>
              {provider.trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-teal-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{provider.averageRiskScore}%</div>
              <p className={`text-xs mt-1 ${provider.trend === 'up' ? 'text-teal-400' : 'text-red-400'}`}>
                {provider.trend === 'up' ? '+3% from last month' : '-5% from last month'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">High Risk Audits</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{provider.highRiskAudits}</div>
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
                {new Date(provider.lastAuditDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
              {provider.auditHistory.map((audit: any) => (
                <div
                  key={audit.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="text-center min-w-[80px]">
                      <div className="text-sm text-slate-400">Date</div>
                      <div className="text-white font-medium">
                        {new Date(audit.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>

                    <div className="text-center min-w-[80px]">
                      <div className="text-sm text-slate-400">Code</div>
                      <div className="text-white font-medium">{audit.code}</div>
                    </div>

                    <div className="flex-1">
                      <div className="text-sm text-slate-400">Conditions</div>
                      <div className="text-white">{audit.conditions}</div>
                    </div>

                    <div className="text-center min-w-[100px]">
                      <div className="text-sm text-slate-400">Score</div>
                      <div className="text-2xl font-bold text-white">{audit.riskScore}%</div>
                    </div>

                    <div className="min-w-[120px]">
                      {getRiskBadge(audit.riskLevel)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
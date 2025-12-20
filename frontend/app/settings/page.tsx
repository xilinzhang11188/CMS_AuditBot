"use client";

import React from 'react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Building, Shield, LogOut } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Account Settings</h1>

        <div className="space-y-6">
          <Card className="border-white/10">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 p-[2px]">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">SC</span>
                  </div>
                </div>
                <div>
                  <Button variant="secondary" size="sm">Change Avatar</Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Full Name</label>
                  <div className="flex items-center px-3 py-2 bg-slate-900 border border-white/10 rounded-lg">
                    <User className="w-4 h-4 text-slate-500 mr-2" />
                    <input type="text" value="Dr. Sarah Chen" className="bg-transparent border-none focus:outline-none text-white w-full" readOnly />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Email Address</label>
                  <div className="flex items-center px-3 py-2 bg-slate-900 border border-white/10 rounded-lg">
                    <Mail className="w-4 h-4 text-slate-500 mr-2" />
                    <input type="email" value="sarah.chen@medpractice.com" className="bg-transparent border-none focus:outline-none text-white w-full" readOnly />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Organization</label>
                  <div className="flex items-center px-3 py-2 bg-slate-900 border border-white/10 rounded-lg">
                    <Building className="w-4 h-4 text-slate-500 mr-2" />
                    <input type="text" value="City Medical Group" className="bg-transparent border-none focus:outline-none text-white w-full" readOnly />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Role</label>
                  <div className="flex items-center px-3 py-2 bg-slate-900 border border-white/10 rounded-lg">
                    <Shield className="w-4 h-4 text-slate-500 mr-2" />
                    <input type="text" value="Primary Care Physician" className="bg-transparent border-none focus:outline-none text-white w-full" readOnly />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10">
            <CardHeader>
              <CardTitle>Subscription & Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Monthly Audits Used</span>
                  <span className="text-white font-medium">5 / 20</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-teal-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-lg border border-white/5">
                <div>
                  <p className="font-medium text-white">Free Tier</p>
                  <p className="text-sm text-slate-400">Limited to 20 audits/month</p>
                </div>
                <Button variant="outline" className="text-teal-400 border-teal-500/50">Upgrade Plan</Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button variant="danger" className="flex items-center">
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Building, Shield, LogOut, Loader2, Check } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { fetchUserProfile, updateUserProfile, changePassword, UserProfile } from '@/lib/api';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // State for user profile
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // State for profile editing
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // State for password change
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Fetch user profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await fetchUserProfile();
      setProfile(profileData);
      setEditName(profileData.name);
      setEditEmail(profileData.email);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    try {
      setSavingProfile(true);
      const updateData: any = {};
      
      if (editName !== profile?.name) {
        updateData.name = editName;
      }
      
      if (editEmail !== profile?.email) {
        updateData.email = editEmail;
      }

      if (Object.keys(updateData).length === 0) {
        setIsEditingProfile(false);
        return;
      }

      await updateUserProfile(updateData);
      
      toast.success('Profile updated successfully');
      
      // Reload profile to get updated data
      await loadProfile();
      setIsEditingProfile(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setEditName(profile?.name || '');
    setEditEmail(profile?.email || '');
    setIsEditingProfile(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setChangingPassword(true);
      await changePassword({
        currentPassword,
        newPassword,
      });
      
      toast.success('Password changed successfully');
      
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
        <Navbar />
        <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
          </div>
        </main>
      </div>
    );
  }

  const quotaPercentage = profile ? (profile.quotaUsed / profile.quotaLimit) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Account Settings</h1>

        <div className="space-y-6">
          {/* Profile Information Card */}
          <Card className="border-white/10">
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Profile Information</h2>
                {!isEditingProfile && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditingProfile(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 p-[2px]">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {profile?.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-slate-400">Full Name</Label>
                  {isEditingProfile ? (
                    <Input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="bg-slate-900 border-white/10"
                    />
                  ) : (
                    <div className="flex items-center px-3 py-2 bg-slate-900 border border-white/10 rounded-lg">
                      <User className="w-4 h-4 text-slate-500 mr-2" />
                      <span className="text-white">{profile?.name}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm text-slate-400">Email Address</Label>
                  {isEditingProfile ? (
                    <Input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="bg-slate-900 border-white/10"
                    />
                  ) : (
                    <div className="flex items-center px-3 py-2 bg-slate-900 border border-white/10 rounded-lg">
                      <Mail className="w-4 h-4 text-slate-500 mr-2" />
                      <span className="text-white">{profile?.email}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm text-slate-400">Organization ID</Label>
                  <div className="flex items-center px-3 py-2 bg-slate-900 border border-white/10 rounded-lg">
                    <Building className="w-4 h-4 text-slate-500 mr-2" />
                    <span className="text-white">{profile?.organizationId}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm text-slate-400">Role</Label>
                  <div className="flex items-center px-3 py-2 bg-slate-900 border border-white/10 rounded-lg">
                    <Shield className="w-4 h-4 text-slate-500 mr-2" />
                    <span className="text-white capitalize">{profile?.role}</span>
                  </div>
                </div>
              </div>

              {isEditingProfile && (
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={savingProfile}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="bg-teal-500 hover:bg-teal-600"
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Password Change Card */}
          <Card className="border-white/10">
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Change Password</h2>
                {!isChangingPassword && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsChangingPassword(true)}
                  >
                    Change Password
                  </Button>
                )}
              </div>
            </CardHeader>
            {isChangingPassword && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="bg-slate-900 border-white/10"
                    placeholder="Enter current password"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-slate-900 border-white/10"
                    placeholder="Enter new password (min 8 characters)"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-slate-900 border-white/10"
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    disabled={changingPassword}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleChangePassword}
                    disabled={changingPassword}
                    className="bg-teal-500 hover:bg-teal-600"
                  >
                    {changingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Changing...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Change Password
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Subscription & Usage Card */}
          <Card className="border-white/10">
            <CardHeader className="border-b border-white/5 pb-4">
              <h2 className="text-xl font-semibold text-white">Subscription & Usage</h2>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Monthly Audits Used</span>
                  <span className="text-white font-medium">
                    {profile?.quotaUsed} / {profile?.quotaLimit}
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div 
                    className="bg-teal-500 h-2 rounded-full transition-all" 
                    style={{ width: `${Math.min(quotaPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-lg border border-white/5">
                <div>
                  <p className="font-medium text-white">Current Plan</p>
                  <p className="text-sm text-slate-400">
                    {profile?.quotaLimit} audits/month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sign Out Button */}
          <div className="flex justify-end">
            <Button 
              variant="destructive" 
              className="flex items-center" 
              onClick={logout}
            >
              <LogOut className="w-4 h-4 mr-2" /> 
              Sign Out
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

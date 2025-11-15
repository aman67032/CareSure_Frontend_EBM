'use client';

import { useEffect, useState } from 'react';
import { authAPI } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    emergency_contact: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      setProfile(response.data.caregiver);
      setFormData({
        name: response.data.caregiver.name || '',
        phone: response.data.caregiver.phone || '',
        emergency_contact: response.data.caregiver.emergency_contact || '',
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await authAPI.updateProfile(formData);
      alert('Profile updated successfully!');
      loadProfile();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
          <div className="text-amber-800">Loading...</div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 py-8 relative overflow-hidden">
      {/* Blurred background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-300/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-300/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-rose-300/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-rose-500 to-violet-600 bg-clip-text text-transparent mb-8 drop-shadow-sm">
          Settings
        </h1>

        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-200/50 p-6">
          <h2 className="text-xl font-semibold text-amber-900 mb-6">Account Settings</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-amber-800">
                Email
              </label>
              <input
                type="email"
                id="email"
                disabled
                value={profile?.email || ''}
                className="mt-1 block w-full px-3 py-2 border border-orange-200/50 rounded-md bg-white/50 backdrop-blur-sm text-amber-700/60"
              />
              <p className="mt-1 text-sm text-amber-700/70">Email cannot be changed</p>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-amber-800">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                required
                className="mt-1 block w-full px-3 py-2 border border-orange-200/50 rounded-md shadow-sm bg-white/70 backdrop-blur-sm text-amber-900 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-amber-800">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                className="mt-1 block w-full px-3 py-2 border border-orange-200/50 rounded-md shadow-sm bg-white/70 backdrop-blur-sm text-amber-900 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="emergency_contact" className="block text-sm font-medium text-amber-800">
                Emergency Contact
              </label>
              <input
                type="text"
                id="emergency_contact"
                className="mt-1 block w-full px-3 py-2 border border-orange-200/50 rounded-md shadow-sm bg-white/70 backdrop-blur-sm text-amber-900 placeholder-amber-400/50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                placeholder="Name and phone number"
                value={formData.emergency_contact}
                onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-violet-500 to-violet-600 text-white px-6 py-2 rounded-lg hover:from-violet-600 hover:to-violet-700 disabled:opacity-50 transition-all shadow-lg font-medium backdrop-blur-sm"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}


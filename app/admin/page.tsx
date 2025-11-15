'use client';

import { useEffect, useState } from 'react';
import AdminGuard from '@/components/AdminGuard';
import { adminAPI } from '@/lib/api';

interface Stats {
  totalCaregivers: number;
  totalPatients: number;
  activeMedications: number;
  unreadAlerts: number;
}

interface Caregiver {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  caregiver_name: string;
  caregiver_email: string;
  created_at: string;
}

interface Medication {
  id: number;
  name: string;
  strength: string;
  patient_name: string;
  caregiver_name: string;
  is_active: boolean;
}

interface Alert {
  id: number;
  alert_type: string;
  title: string;
  severity: string;
  patient_name: string;
  is_read: boolean;
  created_at: string;
}

interface Activity {
  id: number;
  name: string;
  email: string;
  last_activity: string;
  activity_type: string;
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'caregivers' | 'patients' | 'medications' | 'alerts' | 'activity'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError(null);
      const [statsRes, caregiversRes, patientsRes, medicationsRes, alertsRes, activityRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getCaregivers(),
        adminAPI.getPatients(),
        adminAPI.getMedications(),
        adminAPI.getAlerts(),
        adminAPI.getLoginActivity(),
      ]);

      setStats(statsRes.data.stats);
      setCaregivers(caregiversRes.data.caregivers || []);
      setPatients(patientsRes.data.patients || []);
      setMedications(medicationsRes.data.medications || []);
      setAlerts(alertsRes.data.alerts || []);
      setActivity(activityRes.data.activity || []);
    } catch (error: any) {
      console.error('Failed to load admin data:', error);
      
      // Handle 403 Forbidden error
      if (error.response?.status === 403) {
        setError('Access Denied: You do not have admin privileges. Please contact the administrator to grant admin access to your account.');
      } else if (error.response?.status === 401) {
        setError('Authentication required: Please log in again.');
      } else {
        setError(`Failed to load admin data: ${error.response?.data?.error || error.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
          <div className="text-slate-300">Loading admin data...</div>
        </div>
      </AdminGuard>
    );
  }

  if (error) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-red-400 mb-2">Access Error</h2>
                  <p className="text-slate-300 mb-4">{error}</p>
                  {error.includes('403') || error.includes('Access Denied') ? (
                    <div className="bg-slate-800/50 rounded-lg p-4 mt-4">
                      <p className="text-slate-400 text-sm mb-2">
                        <strong>To gain admin access:</strong>
                      </p>
                      <ul className="text-slate-400 text-sm space-y-1 list-disc list-inside">
                        <li>Your email must be added to the admin list in the backend</li>
                        <li>Default admin emails: admin@jklu.edu.in, admin@caresure.com</li>
                        <li>Or set ADMIN_EMAILS environment variable in backend</li>
                        <li>Contact your system administrator to add your email</li>
                      </ul>
                    </div>
                  ) : null}
                  <button
                    onClick={() => {
                      setError(null);
                      setLoading(true);
                      loadData();
                    }}
                    className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 via-blue-500 to-violet-500 bg-clip-text text-transparent mb-8">
            Admin Panel
          </h1>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl shadow-lg p-6 border border-slate-600">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-500/20 rounded-lg">
                    <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.totalCaregivers}</div>
                <div className="text-slate-400">Total Caregivers</div>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl shadow-lg p-6 border border-slate-600">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.totalPatients}</div>
                <div className="text-slate-400">Total Patients</div>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl shadow-lg p-6 border border-slate-600">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-violet-500/20 rounded-lg">
                    <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.activeMedications}</div>
                <div className="text-slate-400">Active Medications</div>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl shadow-lg p-6 border border-slate-600">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-500/20 rounded-lg">
                    <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.unreadAlerts}</div>
                <div className="text-slate-400">Unread Alerts</div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl shadow-lg border border-slate-600 mb-6">
            <div className="flex border-b border-slate-600 overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'caregivers', label: 'Caregivers' },
                { id: 'patients', label: 'Patients' },
                { id: 'medications', label: 'Medications' },
                { id: 'alerts', label: 'Alerts' },
                { id: 'activity', label: 'Login Activity' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-b-2 border-violet-500 text-violet-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl shadow-lg border border-slate-600 p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-4">System Overview</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-white mb-2">Recent Activity</h3>
                      <p className="text-slate-400 text-sm">Last 24 hours activity summary</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-white mb-2">Privacy Notice</h3>
                      <p className="text-slate-400 text-sm">All sensitive data is masked for privacy protection</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'caregivers' && (
              <div>
                <h2 className="text-2xl font-semibold text-white mb-4">Caregivers ({caregivers.length})</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-600">
                        <th className="pb-3 text-slate-300 font-semibold">ID</th>
                        <th className="pb-3 text-slate-300 font-semibold">Name</th>
                        <th className="pb-3 text-slate-300 font-semibold">Email</th>
                        <th className="pb-3 text-slate-300 font-semibold">Phone</th>
                        <th className="pb-3 text-slate-300 font-semibold">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {caregivers.map((cg) => (
                        <tr key={cg.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                          <td className="py-3 text-slate-300">{cg.id}</td>
                          <td className="py-3 text-white">{cg.name}</td>
                          <td className="py-3 text-slate-400">{cg.email}</td>
                          <td className="py-3 text-slate-400">{cg.phone}</td>
                          <td className="py-3 text-slate-400">{new Date(cg.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'patients' && (
              <div>
                <h2 className="text-2xl font-semibold text-white mb-4">Patients ({patients.length})</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-600">
                        <th className="pb-3 text-slate-300 font-semibold">ID</th>
                        <th className="pb-3 text-slate-300 font-semibold">Name</th>
                        <th className="pb-3 text-slate-300 font-semibold">Age</th>
                        <th className="pb-3 text-slate-300 font-semibold">Gender</th>
                        <th className="pb-3 text-slate-300 font-semibold">Caregiver</th>
                        <th className="pb-3 text-slate-300 font-semibold">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map((p) => (
                        <tr key={p.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                          <td className="py-3 text-slate-300">{p.id}</td>
                          <td className="py-3 text-white">{p.name}</td>
                          <td className="py-3 text-slate-400">{p.age || 'N/A'}</td>
                          <td className="py-3 text-slate-400">{p.gender || 'N/A'}</td>
                          <td className="py-3 text-slate-400">{p.caregiver_name}</td>
                          <td className="py-3 text-slate-400">{new Date(p.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'medications' && (
              <div>
                <h2 className="text-2xl font-semibold text-white mb-4">Medications ({medications.length})</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-600">
                        <th className="pb-3 text-slate-300 font-semibold">ID</th>
                        <th className="pb-3 text-slate-300 font-semibold">Name</th>
                        <th className="pb-3 text-slate-300 font-semibold">Strength</th>
                        <th className="pb-3 text-slate-300 font-semibold">Patient</th>
                        <th className="pb-3 text-slate-300 font-semibold">Caregiver</th>
                        <th className="pb-3 text-slate-300 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medications.map((m) => (
                        <tr key={m.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                          <td className="py-3 text-slate-300">{m.id}</td>
                          <td className="py-3 text-white">{m.name}</td>
                          <td className="py-3 text-slate-400">{m.strength || 'N/A'}</td>
                          <td className="py-3 text-slate-400">{m.patient_name}</td>
                          <td className="py-3 text-slate-400">{m.caregiver_name}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded text-xs ${m.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                              {m.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'alerts' && (
              <div>
                <h2 className="text-2xl font-semibold text-white mb-4">Alerts ({alerts.length})</h2>
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border-l-4 ${
                        alert.severity === 'high'
                          ? 'border-orange-500 bg-orange-500/10'
                          : alert.severity === 'medium'
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-violet-500 bg-violet-500/10'
                      } bg-slate-700/30`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-white">{alert.title}</div>
                          <div className="text-sm text-slate-400 mt-1">
                            {alert.patient_name} • {new Date(alert.created_at).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            alert.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                            alert.severity === 'medium' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-violet-500/20 text-violet-400'
                          }`}>
                            {alert.severity}
                          </span>
                          {!alert.is_read && (
                            <span className="px-2 py-1 rounded text-xs bg-violet-500/20 text-violet-400">
                              Unread
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div>
                <h2 className="text-2xl font-semibold text-white mb-4">Login Activity ({activity.length})</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-600">
                        <th className="pb-3 text-slate-300 font-semibold">ID</th>
                        <th className="pb-3 text-slate-300 font-semibold">Name</th>
                        <th className="pb-3 text-slate-300 font-semibold">Email</th>
                        <th className="pb-3 text-slate-300 font-semibold">Activity</th>
                        <th className="pb-3 text-slate-300 font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activity.map((a) => (
                        <tr key={a.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                          <td className="py-3 text-slate-300">{a.id}</td>
                          <td className="py-3 text-white">{a.name}</td>
                          <td className="py-3 text-slate-400">{a.email}</td>
                          <td className="py-3 text-slate-400 capitalize">{a.activity_type}</td>
                          <td className="py-3 text-slate-400">{new Date(a.last_activity).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}


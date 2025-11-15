'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { patientAPI, alertAPI, reportAPI } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';

interface Patient {
  id: number;
  name: string;
  age: number;
  medication_count: number;
  today_taken: number;
  today_missed: number;
}

interface Alert {
  id: number;
  alert_type: string;
  title: string;
  message: string;
  severity: string;
  patient_name: string;
  created_at: string;
}

export default function DashboardPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [patientsRes, alertsRes] = await Promise.all([
        patientAPI.getAll(),
        alertAPI.getAll({ is_read: 'false', limit: 5 }),
      ]);

      setPatients(patientsRes.data.patients || []);
      setAlerts(alertsRes.data.alerts || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-rose-500 to-violet-600 bg-clip-text text-transparent mb-8 drop-shadow-sm">
          Dashboard
        </h1>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-orange-200/50 hover:border-orange-400 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-400/20 to-orange-500/20 rounded-xl backdrop-blur-sm">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-amber-900 mb-1">{patients.length}</div>
            <div className="text-amber-700/80">Total Patients</div>
          </div>
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-rose-200/50 hover:border-rose-400 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-rose-400/20 to-rose-500/20 rounded-xl backdrop-blur-sm">
                <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-amber-900 mb-1">
              {alerts.filter(a => a.alert_type === 'missed_dose').length}
            </div>
            <div className="text-amber-700/80">Missed Alerts Today</div>
          </div>
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-violet-200/50 hover:border-violet-400 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-violet-400/20 to-violet-500/20 rounded-xl backdrop-blur-sm">
                <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-amber-900 mb-1">{alerts.length}</div>
            <div className="text-amber-700/80">Unread Alerts</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Patients List */}
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-200/50">
            <div className="p-6 border-b border-orange-200/50 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-amber-900">Patients</h2>
              <Link
                href="/patients/add"
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 text-sm font-medium transition-all shadow-lg hover:shadow-orange-500/50 backdrop-blur-sm"
              >
                Add Patient
              </Link>
            </div>
            <div className="p-6">
              {patients.length === 0 ? (
                <div className="text-center py-8 text-amber-700/70">
                  <p className="mb-4">No patients yet</p>
                  <Link
                    href="/patients/add"
                    className="text-violet-600 hover:text-violet-700 font-medium"
                  >
                    Add your first patient →
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {patients.map((patient) => (
                    <Link
                      key={patient.id}
                      href={`/patients/${patient.id}`}
                      className="block p-4 border border-orange-200/50 rounded-xl bg-white/50 backdrop-blur-sm hover:bg-white/70 hover:border-violet-400 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-amber-900">{patient.name}</h3>
                          <p className="text-sm text-amber-700/70">Age: {patient.age}</p>
                          <p className="text-sm text-amber-700/70">
                            Medications: {patient.medication_count || 0}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-emerald-600 font-medium">
                            Taken: {patient.today_taken || 0}
                          </div>
                          <div className="text-sm text-orange-600 font-medium">
                            Missed: {patient.today_missed || 0}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-violet-200/50">
            <div className="p-6 border-b border-violet-200/50 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-amber-900">Recent Alerts</h2>
              <Link
                href="/alerts"
                className="text-violet-600 hover:text-violet-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            <div className="p-6">
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-amber-700/70">
                  No alerts
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-xl border-l-4 backdrop-blur-sm ${
                        alert.severity === 'high'
                          ? 'border-orange-500 bg-orange-100/50'
                          : alert.severity === 'medium'
                          ? 'border-rose-500 bg-rose-100/50'
                          : 'border-violet-500 bg-violet-100/50'
                      } hover:shadow-lg transition-all`}
                    >
                      <div className="font-semibold text-amber-900">{alert.title}</div>
                      <div className="text-sm text-amber-800/70 mt-1">{alert.message}</div>
                      <div className="text-xs text-amber-700/60 mt-2">
                        {alert.patient_name} • {new Date(alert.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}


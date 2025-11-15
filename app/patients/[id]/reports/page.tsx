'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { reportAPI } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';

interface AdherenceData {
  date: string;
  medication_id: number;
  medication_name: string;
  total_doses: number;
  taken_doses: number;
  missed_doses: number;
  late_doses: number;
  adherence_percentage: number;
}

interface Summary {
  total_doses: number;
  taken_doses: number;
  missed_doses: number;
  overall_adherence: number;
}

export default function PatientReportsPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  
  const [adherenceData, setAdherenceData] = useState<AdherenceData[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadReports();
  }, [patientId, dateRange]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await reportAPI.getAdherence(patientId, {
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
      });
      
      setAdherenceData(response.data.adherence_data || []);
      setSummary(response.data.summary || null);
    } catch (err: any) {
      console.error('Failed to load reports:', err);
      setError(err.response?.data?.error || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="text-violet-600 hover:text-violet-700 mb-4 font-semibold transition-colors hover:bg-white/50 px-3 py-1 rounded-lg backdrop-blur-sm"
            >
              ← Back
            </button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-rose-500 to-violet-600 bg-clip-text text-transparent drop-shadow-sm">
              Adherence Reports
            </h1>
          </div>

          {/* Date Range Filter */}
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-200/50 p-6 mb-6">
            <h2 className="text-xl font-semibold text-amber-900 mb-4">Filter by Date Range</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-2">Start Date</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-orange-200/50 rounded-xl bg-white/70 backdrop-blur-sm text-amber-900 focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-2">End Date</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-orange-200/50 rounded-xl bg-white/70 backdrop-blur-sm text-amber-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={loadReports}
                  className="w-full bg-gradient-to-r from-violet-500 to-violet-600 text-white px-6 py-2 rounded-xl hover:from-violet-600 hover:to-violet-700 transition-all shadow-lg hover:shadow-xl font-semibold"
                >
                  Apply Filter
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-100/70 border border-red-300/50 text-red-800 px-4 py-3 rounded-xl mb-6 backdrop-blur-sm">
              {error}
            </div>
          )}

          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-violet-200/50">
                <div className="text-3xl font-bold text-violet-600 mb-2">
                  {summary.total_doses}
                </div>
                <div className="text-amber-800/70 font-medium">Total Doses</div>
              </div>
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-emerald-200/50">
                <div className="text-3xl font-bold text-emerald-600 mb-2">
                  {summary.taken_doses}
                </div>
                <div className="text-amber-800/70 font-medium">Taken</div>
              </div>
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-orange-200/50">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {summary.missed_doses}
                </div>
                <div className="text-amber-800/70 font-medium">Missed</div>
              </div>
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-rose-200/50">
                <div className="text-3xl font-bold text-rose-600 mb-2">
                  {Math.round(summary.overall_adherence)}%
                </div>
                <div className="text-amber-800/70 font-medium">Adherence</div>
              </div>
            </div>
          )}

          {/* Adherence Data Table */}
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-200/50 p-6">
            <h2 className="text-2xl font-bold text-amber-900 mb-6">Daily Adherence</h2>
            {loading ? (
              <div className="text-center py-12 text-amber-800">Loading...</div>
            ) : adherenceData.length === 0 ? (
              <div className="text-center py-12 text-amber-700/70">
                <div className="text-4xl mb-4">📊</div>
                <p className="text-lg">No adherence data found for the selected date range</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-orange-200/50">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-amber-900">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-amber-900">Medication</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-amber-900">Total</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-amber-900">Taken</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-amber-900">Missed</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-amber-900">Adherence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adherenceData.map((row, index) => (
                      <tr key={index} className="border-b border-orange-200/30 hover:bg-white/50 transition-colors">
                        <td className="px-4 py-3 text-amber-800/80">{formatDate(row.date)}</td>
                        <td className="px-4 py-3 text-amber-900 font-medium">{row.medication_name}</td>
                        <td className="px-4 py-3 text-center text-amber-800/70">{row.total_doses}</td>
                        <td className="px-4 py-3 text-center text-emerald-600 font-semibold">{row.taken_doses}</td>
                        <td className="px-4 py-3 text-center text-orange-600 font-semibold">{row.missed_doses}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                            row.adherence_percentage >= 90 ? 'bg-emerald-100 text-emerald-800' :
                            row.adherence_percentage >= 70 ? 'bg-orange-100 text-orange-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {Math.round(row.adherence_percentage)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}


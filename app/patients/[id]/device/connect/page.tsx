'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { deviceAPI } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';

export default function ConnectDevicePage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  
  const [formData, setFormData] = useState({
    device_id: '',
    device_name: '',
    connection_type: 'wifi',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSuccess(false);

    try {
      await deviceAPI.connect(patientId, formData);
      setSuccess(true);
      setTimeout(() => {
        router.push(`/patients/${patientId}/device`);
      }, 2000);
    } catch (err: any) {
      console.error('Failed to connect device:', err);
      setError(err.response?.data?.error || 'Failed to connect device. Please try again.');
    } finally {
      setLoading(false);
    }
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

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="text-violet-600 hover:text-violet-700 mb-4 font-semibold transition-colors hover:bg-white/50 px-3 py-1 rounded-lg backdrop-blur-sm"
            >
              ← Back
            </button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-rose-500 to-violet-600 bg-clip-text text-transparent drop-shadow-sm">
              Connect Device
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-200/50 p-6">
            {error && (
              <div className="bg-red-100/70 border border-red-300/50 text-red-800 px-4 py-3 rounded-xl mb-6 backdrop-blur-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-emerald-100/70 border border-emerald-300/50 text-emerald-800 px-4 py-3 rounded-xl mb-6 backdrop-blur-sm">
                Device connected successfully! Redirecting...
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="device_id" className="block text-sm font-semibold text-amber-900 mb-2">
                  Device ID *
                </label>
                <input
                  type="text"
                  id="device_id"
                  required
                  className="mt-1 block w-full px-4 py-3 border border-orange-200/50 rounded-xl shadow-sm bg-white/70 backdrop-blur-sm text-amber-900 placeholder-amber-400/50 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400 transition-all"
                  placeholder="Enter device ID"
                  value={formData.device_id}
                  onChange={(e) => setFormData({ ...formData, device_id: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="device_name" className="block text-sm font-semibold text-amber-900 mb-2">
                  Device Name
                </label>
                <input
                  type="text"
                  id="device_name"
                  className="mt-1 block w-full px-4 py-3 border border-orange-200/50 rounded-xl shadow-sm bg-white/70 backdrop-blur-sm text-amber-900 placeholder-amber-400/50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all"
                  placeholder="e.g., Smart Pill Box 1"
                  value={formData.device_name}
                  onChange={(e) => setFormData({ ...formData, device_name: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="connection_type" className="block text-sm font-semibold text-amber-900 mb-2">
                  Connection Type
                </label>
                <select
                  id="connection_type"
                  className="mt-1 block w-full px-4 py-3 border border-orange-200/50 rounded-xl shadow-sm bg-white/70 backdrop-blur-sm text-amber-900 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all"
                  value={formData.connection_type}
                  onChange={(e) => setFormData({ ...formData, connection_type: e.target.value })}
                >
                  <option value="wifi">WiFi</option>
                  <option value="bluetooth">Bluetooth</option>
                  <option value="cellular">Cellular</option>
                </select>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                type="submit"
                disabled={loading || success}
                className="flex-1 bg-gradient-to-r from-violet-500 to-violet-600 text-white px-6 py-3 rounded-xl hover:from-violet-600 hover:to-violet-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl font-semibold backdrop-blur-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting...
                  </span>
                ) : success ? (
                  'Connected!'
                ) : (
                  'Connect Device'
                )}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-orange-200/50 rounded-xl hover:bg-white/80 hover:border-orange-300 text-amber-800 font-semibold transition-all shadow-sm hover:shadow-md backdrop-blur-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
}


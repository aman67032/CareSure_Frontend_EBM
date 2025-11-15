'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { deviceAPI } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';

interface Device {
  id: number;
  device_id: string;
  device_name: string;
  connection_type: string;
  is_connected: boolean;
  battery_level: number;
  last_sync: string;
  compartments: Array<{
    id: number;
    compartment_number: number;
    medication_id: number;
    medication_name: string;
  }>;
  recent_events: Array<{
    id: number;
    event_type: string;
    description: string;
    timestamp: string;
  }>;
}

export default function PatientDevicePage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDevice();
  }, [patientId]);

  const loadDevice = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await deviceAPI.getByPatient(patientId);
      setDevice(response.data.device);
    } catch (err: any) {
      console.error('Failed to load device:', err);
      setError(err.response?.data?.error || 'Failed to load device information');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
              Device Management
            </h1>
          </div>

          {error && (
            <div className="bg-red-100/70 border border-red-300/50 text-red-800 px-4 py-3 rounded-xl mb-6 backdrop-blur-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12 text-amber-800">Loading...</div>
          ) : !device ? (
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-200/50 p-12 text-center">
              <div className="text-6xl mb-6">📱</div>
              <h2 className="text-2xl font-bold text-amber-900 mb-4">No Device Connected</h2>
              <p className="text-amber-800/70 mb-6">Connect a medication reminder device to get started</p>
              <Link
                href={`/patients/${patientId}/device/connect`}
                className="inline-block bg-gradient-to-r from-violet-500 to-violet-600 text-white px-8 py-3 rounded-xl hover:from-violet-600 hover:to-violet-700 transition-all shadow-lg hover:shadow-xl font-semibold"
              >
                Connect Device
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Device Status Card */}
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-200/50 p-6">
                <h2 className="text-2xl font-bold text-amber-900 mb-6">Device Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-orange-200/50">
                    <div className="text-sm text-amber-700/70 mb-1">Device Name</div>
                    <div className="font-semibold text-amber-900 text-lg">{device.device_name || 'Unnamed Device'}</div>
                  </div>
                  <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-orange-200/50">
                    <div className="text-sm text-amber-700/70 mb-1">Connection Status</div>
                    <div className="font-semibold text-amber-900 text-lg">
                      {device.is_connected ? (
                        <span className="text-emerald-600">Connected</span>
                      ) : (
                        <span className="text-rose-600">Disconnected</span>
                      )}
                    </div>
                  </div>
                  <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-orange-200/50">
                    <div className="text-sm text-amber-700/70 mb-1">Battery Level</div>
                    <div className="font-semibold text-amber-900 text-lg">{device.battery_level || 0}%</div>
                  </div>
                  <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-orange-200/50">
                    <div className="text-sm text-amber-700/70 mb-1">Last Sync</div>
                    <div className="font-semibold text-amber-900 text-sm">{formatDate(device.last_sync)}</div>
                  </div>
                </div>
              </div>

              {/* Compartments */}
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-violet-200/50 p-6">
                <h2 className="text-2xl font-bold text-amber-900 mb-6">Compartments</h2>
                {device.compartments && device.compartments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {device.compartments.map((comp) => (
                      <div
                        key={comp.id}
                        className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-violet-200/50 hover:border-violet-400 hover:shadow-lg transition-all"
                      >
                        <div className="text-sm text-amber-700/70 mb-1">Compartment {comp.compartment_number}</div>
                        <div className="font-semibold text-amber-900">
                          {comp.medication_name || 'Empty'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-amber-700/70">
                    <p>No compartments assigned</p>
                  </div>
                )}
              </div>

              {/* Recent Events */}
              {device.recent_events && device.recent_events.length > 0 && (
                <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-rose-200/50 p-6">
                  <h2 className="text-2xl font-bold text-amber-900 mb-6">Recent Events</h2>
                  <div className="space-y-3">
                    {device.recent_events.map((event) => (
                      <div
                        key={event.id}
                        className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-orange-200/50"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold text-amber-900">{event.event_type}</div>
                            <div className="text-sm text-amber-800/70 mt-1">{event.description}</div>
                          </div>
                          <div className="text-xs text-amber-700/60">{formatDate(event.timestamp)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <Link
                  href={`/patients/${patientId}/device/connect`}
                  className="bg-gradient-to-r from-violet-500 to-violet-600 text-white px-6 py-3 rounded-xl hover:from-violet-600 hover:to-violet-700 transition-all shadow-lg hover:shadow-xl font-semibold"
                >
                  Update Device
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}


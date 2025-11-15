'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { patientSelfAPI } from '@/lib/api';
import PatientAuthGuard from '@/components/PatientAuthGuard';
import { removeToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  relationship?: string;
  allergies?: string;
  medical_conditions?: string;
  emergency_contact?: string;
  doctor_name?: string;
  doctor_contact?: string;
}

interface Stats {
  today: {
    taken: number;
    missed: number;
    pending: number;
  };
  totalMedications: number;
  adherence7Days: number;
}

interface Dose {
  id: number;
  medication_name: string;
  strength: string;
  dose_per_intake: string;
  scheduled_time: string;
  status: string;
  time_slot: string;
  food_rule: string;
}

interface Medication {
  id: number;
  name: string;
  strength: string;
  dose_per_intake: string;
  frequency: string;
  time_slots: string;
}

export default function PatientDashboardPage() {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [todayDoses, setTodayDoses] = useState<Dose[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Test if backend is accessible
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://careure-ebm-backend.onrender.com/api';
      try {
        const healthCheck = await fetch(`${apiUrl}/health`);
        if (!healthCheck.ok) {
          throw new Error('Backend server is not responding');
        }
      } catch (healthError) {
        setError('Unable to connect to server. Please check your internet connection.');
        setLoading(false);
        return;
      }

      const [profileRes, statsRes, dosesRes, medsRes] = await Promise.all([
        patientSelfAPI.getProfile(),
        patientSelfAPI.getStats(),
        patientSelfAPI.getTodayDoses(),
        patientSelfAPI.getMedications(),
      ]);

      setPatient(profileRes.data.patient);
      setStats(statsRes.data);
      setTodayDoses(dosesRes.data.doses || []);
      setMedications(medsRes.data.medications || []);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      if (err.response?.status === 404) {
        setError('Patient routes not found. Please restart the backend server to load the new patient routes.');
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Authentication failed. Please log in again.');
        setTimeout(() => {
          router.push('/patient/login');
        }, 2000);
      } else {
        setError(err.response?.data?.error || 'Failed to load dashboard data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkTaken = async (doseId: number) => {
    try {
      await patientSelfAPI.markDoseTaken(doseId.toString());
      loadDashboardData(); // Reload data
    } catch (err: any) {
      console.error('Failed to mark dose as taken:', err);
      alert(err.response?.data?.error || 'Failed to mark dose as taken');
    }
  };

  const handleMarkMissed = async (doseId: number) => {
    try {
      await patientSelfAPI.markDoseMissed(doseId.toString());
      loadDashboardData(); // Reload data
    } catch (err: any) {
      console.error('Failed to mark dose as missed:', err);
      alert(err.response?.data?.error || 'Failed to mark dose as missed');
    }
  };

  const handleLogout = () => {
    removeToken();
    router.push('/patient/login');
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'taken':
        return 'bg-emerald-100 border-emerald-300 text-emerald-800';
      case 'missed':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'pending':
        return 'bg-rose-100 border-rose-300 text-rose-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  if (loading) {
    return (
      <PatientAuthGuard>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
          <div className="text-amber-800">Loading...</div>
        </div>
      </PatientAuthGuard>
    );
  }

  return (
    <PatientAuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 relative overflow-hidden">
        {/* Blurred background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-300/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-300/30 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-rose-300/20 rounded-full blur-3xl"></div>
        </div>

        {/* Navbar */}
        <nav className="bg-white/80 backdrop-blur-xl shadow-md border-b border-orange-200/60 sticky top-0 z-50 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="CareSure Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 via-rose-500 to-violet-600 bg-clip-text text-transparent drop-shadow-sm">
                    CareSure
                  </h1>
                  <span className="text-xs text-amber-800/70 font-medium">Patient Portal</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {patient && (
                  <span className="text-amber-800/80 font-medium hidden sm:inline">
                    Welcome, {patient.name}
                  </span>
                )}
                <button
                  onClick={handleLogout}
                  className="text-amber-800/80 hover:text-orange-600 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:bg-orange-50/70 hover:shadow-sm border border-transparent hover:border-orange-200/50"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-8">
          {error && (
            <div className="bg-red-100/70 border border-red-300/50 text-red-800 px-4 py-3 rounded-xl mb-6 backdrop-blur-sm">
              {error}
            </div>
          )}

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-emerald-200/50 hover:border-emerald-400 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <div className="text-3xl font-bold text-emerald-600 mb-2">
                  {stats.today.taken}
                </div>
                <div className="text-amber-800/70 font-medium">Taken Today</div>
              </div>
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-orange-200/50 hover:border-orange-400 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {stats.today.missed}
                </div>
                <div className="text-amber-800/70 font-medium">Missed Today</div>
              </div>
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-rose-200/50 hover:border-rose-400 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <div className="text-3xl font-bold text-rose-600 mb-2">
                  {stats.today.pending}
                </div>
                <div className="text-amber-800/70 font-medium">Pending</div>
              </div>
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-violet-200/50 hover:border-violet-400 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <div className="text-3xl font-bold text-violet-600 mb-2">
                  {stats.adherence7Days}%
                </div>
                <div className="text-amber-800/70 font-medium">7-Day Adherence</div>
              </div>
            </div>
          )}

          {/* Quick Info Cards */}
          {patient && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-violet-200/50 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-2xl">👤</div>
                  <div>
                    <div className="text-sm text-amber-700/70">Patient Info</div>
                    <div className="font-semibold text-amber-900">{patient.name}</div>
                    <div className="text-xs text-amber-700/60">{patient.age} years • {patient.gender}</div>
                  </div>
                </div>
              </div>
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-200/50 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-2xl">💊</div>
                  <div>
                    <div className="text-sm text-amber-700/70">Total Medications</div>
                    <div className="font-semibold text-amber-900 text-xl">{stats?.totalMedications || 0}</div>
                  </div>
                </div>
              </div>
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-rose-200/50 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-2xl">📊</div>
                  <div>
                    <div className="text-sm text-amber-700/70">Overall Adherence</div>
                    <div className="font-semibold text-amber-900 text-xl">{stats?.adherence7Days || 0}%</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Today's Schedule */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-200/50 p-6">
              <h2 className="text-2xl font-bold text-amber-900 mb-6">Today's Schedule</h2>
              {todayDoses.length === 0 ? (
                <div className="text-center py-12 text-amber-700/70">
                  <div className="text-4xl mb-4">📅</div>
                  <p className="text-lg">No medications scheduled for today</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayDoses.map((dose) => (
                    <div
                      key={dose.id}
                      className={`border rounded-xl p-4 ${getStatusColor(dose.status)} backdrop-blur-sm`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{dose.medication_name}</h3>
                          <p className="text-sm opacity-80">
                            {dose.strength} • {dose.dose_per_intake}
                          </p>
                          <p className="text-sm opacity-70 mt-1">
                            {formatTime(dose.scheduled_time)} • {dose.time_slot}
                            {dose.food_rule && ` • ${dose.food_rule}`}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize ${
                          dose.status === 'taken' ? 'bg-emerald-200 text-emerald-900' :
                          dose.status === 'missed' ? 'bg-orange-200 text-orange-900' :
                          'bg-rose-200 text-rose-900'
                        }`}>
                          {dose.status}
                        </span>
                      </div>
                      {dose.status === 'pending' && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleMarkTaken(dose.id)}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg hover:shadow-xl"
                          >
                            Mark as Taken
                          </button>
                          <button
                            onClick={() => handleMarkMissed(dose.id)}
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg hover:shadow-xl"
                          >
                            Mark as Missed
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* My Medications */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-violet-200/50 p-6">
              <h2 className="text-2xl font-bold text-amber-900 mb-6">My Medications</h2>
              {medications.length === 0 ? (
                <div className="text-center py-12 text-amber-700/70">
                  <div className="text-4xl mb-4">💊</div>
                  <p className="text-lg">No medications added yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {medications.map((med) => (
                    <div
                      key={med.id}
                      className="border border-orange-200/50 rounded-xl p-4 bg-white/50 backdrop-blur-sm hover:bg-white/70 hover:border-violet-400 hover:shadow-lg transition-all"
                    >
                      <h3 className="font-semibold text-amber-900 text-lg">{med.name}</h3>
                      <p className="text-sm text-amber-800/70 mt-1">
                        {med.strength} • {med.dose_per_intake}
                      </p>
                      <p className="text-sm text-amber-700/60 mt-1">
                        Frequency: {med.frequency}
                      </p>
                      {med.time_slots && (
                        <p className="text-sm text-amber-700/60 mt-1">
                          Times: {med.time_slots}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Additional Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upcoming Doses (Next 3 Days) */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-violet-200/50 p-6">
              <h2 className="text-xl font-bold text-amber-900 mb-4">Upcoming Doses</h2>
              <div className="space-y-3">
                {todayDoses
                  .filter(dose => dose.status === 'pending')
                  .slice(0, 3)
                  .map((dose) => (
                    <div key={dose.id} className="bg-white/50 backdrop-blur-sm p-3 rounded-xl border border-violet-200/50">
                      <div className="font-semibold text-amber-900 text-sm">{dose.medication_name}</div>
                      <div className="text-xs text-amber-700/70 mt-1">
                        {formatTime(dose.scheduled_time)} • {dose.time_slot}
                      </div>
                    </div>
                  ))}
                {todayDoses.filter(dose => dose.status === 'pending').length === 0 && (
                  <div className="text-center py-6 text-amber-700/70 text-sm">
                    <div className="text-2xl mb-2">✅</div>
                    <p>All doses for today are completed!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Information */}
            {patient && (
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-rose-200/50 p-6">
                <h2 className="text-xl font-bold text-amber-900 mb-4">My Profile</h2>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-amber-700/70">Name</div>
                    <div className="font-semibold text-amber-900">{patient.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-amber-700/70">Age</div>
                    <div className="font-semibold text-amber-900">{patient.age} years</div>
                  </div>
                  <div>
                    <div className="text-xs text-amber-700/70">Gender</div>
                    <div className="font-semibold text-amber-900 capitalize">{patient.gender}</div>
                  </div>
                  {patient.relationship && (
                    <div>
                      <div className="text-xs text-amber-700/70">Relationship</div>
                      <div className="font-semibold text-amber-900">{patient.relationship}</div>
                    </div>
                  )}
                  {patient.allergies && (
                    <div>
                      <div className="text-xs text-amber-700/70">Allergies</div>
                      <div className="font-semibold text-amber-900 text-sm">{patient.allergies}</div>
                    </div>
                  )}
                  {patient.emergency_contact && (
                    <div>
                      <div className="text-xs text-amber-700/70">Emergency Contact</div>
                      <div className="font-semibold text-amber-900 text-sm">{patient.emergency_contact}</div>
                    </div>
                  )}
                  {patient.doctor_name && (
                    <div>
                      <div className="text-xs text-amber-700/70">Doctor</div>
                      <div className="font-semibold text-amber-900 text-sm">{patient.doctor_name}</div>
                      {patient.doctor_contact && (
                        <div className="text-xs text-amber-700/60">{patient.doctor_contact}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-emerald-200/50 p-6">
              <h2 className="text-xl font-bold text-amber-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    const pendingDoses = todayDoses.filter(d => d.status === 'pending');
                    if (pendingDoses.length > 0) {
                      const nextDose = pendingDoses[0];
                      handleMarkTaken(nextDose.id);
                    } else {
                      alert('No pending doses to mark as taken');
                    }
                  }}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-3 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl font-semibold text-sm"
                >
                  Mark Next Dose as Taken
                </button>
                <div className="text-xs text-amber-700/70 text-center pt-2">
                  {todayDoses.filter(d => d.status === 'pending').length} pending dose(s) remaining
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity / Medication History */}
          <div className="mt-8 bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-200/50 p-6">
            <h2 className="text-2xl font-bold text-amber-900 mb-6">Recent Activity</h2>
            <div className="space-y-3">
              {todayDoses
                .filter(dose => dose.status === 'taken' || dose.status === 'missed')
                .slice(0, 5)
                .map((dose) => (
                  <div
                    key={dose.id}
                    className={`flex items-center justify-between p-4 rounded-xl border ${
                      dose.status === 'taken'
                        ? 'bg-emerald-50/50 border-emerald-200/50'
                        : 'bg-orange-50/50 border-orange-200/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`text-2xl ${dose.status === 'taken' ? 'text-emerald-600' : 'text-orange-600'}`}>
                        {dose.status === 'taken' ? '✅' : '⚠️'}
                      </div>
                      <div>
                        <div className="font-semibold text-amber-900">{dose.medication_name}</div>
                        <div className="text-sm text-amber-700/70">
                          {formatTime(dose.scheduled_time)} • {dose.status === 'taken' ? 'Taken' : 'Missed'}
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      dose.status === 'taken'
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-orange-200 text-orange-900'
                    }`}>
                      {dose.status === 'taken' ? 'Completed' : 'Missed'}
                    </span>
                  </div>
                ))}
              {todayDoses.filter(dose => dose.status === 'taken' || dose.status === 'missed').length === 0 && (
                <div className="text-center py-8 text-amber-700/70">
                  <div className="text-3xl mb-2">📝</div>
                  <p>No activity recorded yet today</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PatientAuthGuard>
  );
}


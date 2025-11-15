'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { patientAPI } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';
import { removeToken } from '@/lib/auth';

interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  medication_count: number;
  today_taken: number;
  today_missed: number;
}

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const response = await patientAPI.getAll();
      setPatients(response.data.patients || []);
    } catch (error) {
      console.error('Failed to load patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    router.push('/login');
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
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/dashboard" className="flex items-center gap-3">
                  <Image
                    src="/logo.png"
                    alt="CareSure Logo"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                  <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 via-rose-500 to-violet-600 bg-clip-text text-transparent drop-shadow-sm hover:from-orange-500 hover:via-rose-400 hover:to-violet-500 transition-all duration-300">
                    CareSure
                  </span>
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold transition-all duration-300 border-transparent text-amber-800/80 hover:text-orange-600 hover:border-orange-300/50"
                >
                  Dashboard
                </Link>
                <Link
                  href="/patients"
                  className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold transition-all duration-300 border-rose-500 text-rose-600 shadow-sm"
                >
                  Patients
                </Link>
                <Link
                  href="/alerts"
                  className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold transition-all duration-300 border-transparent text-amber-800/80 hover:text-violet-600 hover:border-violet-300/50"
                >
                  Alerts
                </Link>
                <Link
                  href="/settings"
                  className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold transition-all duration-300 border-transparent text-amber-800/80 hover:text-violet-600 hover:border-violet-300/50"
                >
                  Settings
                </Link>
              </div>
            </div>
            <div className="flex items-center">
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-rose-500 to-violet-600 bg-clip-text text-transparent drop-shadow-sm">
            Patients
          </h1>
          <Link
            href="/patients/add"
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-orange-500/50 font-medium backdrop-blur-sm"
          >
            Add New Patient
          </Link>
        </div>

        {patients.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-200/50 p-12 text-center">
            <div className="text-6xl mb-4">👤</div>
            <h2 className="text-2xl font-semibold text-amber-900 mb-2">No patients yet</h2>
            <p className="text-amber-700/70 mb-6">
              Start by adding your first patient to manage their medications
            </p>
            <Link
              href="/patients/add"
              className="inline-block bg-gradient-to-r from-violet-500 to-violet-600 text-white px-6 py-3 rounded-lg hover:from-violet-600 hover:to-violet-700 transition-all shadow-lg font-medium backdrop-blur-sm"
            >
              Add Patient
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patients.map((patient) => (
              <Link
                key={patient.id}
                href={`/patients/${patient.id}`}
                className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-200/50 p-6 hover:border-violet-400 hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-amber-900">{patient.name}</h3>
                    <p className="text-amber-700/70">
                      {patient.age} years old • {patient.gender}
                    </p>
                  </div>
                </div>
                <div className="border-t border-orange-200/50 pt-4 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-amber-700/70">Medications:</span>
                    <span className="font-semibold text-violet-600">{patient.medication_count || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-amber-700/70">Today Taken:</span>
                    <span className="text-emerald-600 font-semibold">{patient.today_taken || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-amber-700/70">Today Missed:</span>
                    <span className="text-orange-600 font-semibold">{patient.today_missed || 0}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
    </AuthGuard>
  );
}


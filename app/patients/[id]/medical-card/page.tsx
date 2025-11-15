'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { medicalCardAPI } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';

interface MedicalCard {
  id: number;
  qr_code: string;
  consent_given: boolean;
  expires_at: string;
  patient: {
    id: number;
    name: string;
    age: number;
    gender: string;
    allergies: string;
    medical_conditions: string;
  };
  medications: Array<{
    id: number;
    name: string;
    strength: string;
    dose_per_intake: string;
    frequency: string;
    time_slots: string;
  }>;
}

export default function MedicalCardPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  
  const [card, setCard] = useState<MedicalCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    loadCard();
  }, [patientId]);

  const loadCard = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await medicalCardAPI.get(patientId);
      setCard(response.data.card);
    } catch (err: any) {
      console.error('Failed to load medical card:', err);
      setError(err.response?.data?.error || 'Failed to load medical card');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!consentGiven) {
      setError('Please provide consent to generate the medical card');
      return;
    }

    setError('');
    setGenerating(true);

    try {
      const response = await medicalCardAPI.generate(patientId, { consent_given: true });
      setCard(response.data.card);
    } catch (err: any) {
      console.error('Failed to generate medical card:', err);
      setError(err.response?.data?.error || 'Failed to generate medical card');
    } finally {
      setGenerating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="text-violet-600 hover:text-violet-700 mb-4 font-semibold transition-colors hover:bg-white/50 px-3 py-1 rounded-lg backdrop-blur-sm"
            >
              ← Back
            </button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-rose-500 to-violet-600 bg-clip-text text-transparent drop-shadow-sm">
              Medical Card
            </h1>
          </div>

          {error && (
            <div className="bg-red-100/70 border border-red-300/50 text-red-800 px-4 py-3 rounded-xl mb-6 backdrop-blur-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12 text-amber-800">Loading...</div>
          ) : !card ? (
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-200/50 p-8">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🏥</div>
                <h2 className="text-2xl font-bold text-amber-900 mb-4">No Medical Card Generated</h2>
                <p className="text-amber-800/70 mb-6">
                  Generate a medical card with QR code that can be scanned by healthcare providers
                </p>
              </div>

              <div className="bg-amber-50/70 border border-amber-200/50 rounded-xl p-4 mb-6">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-1 mr-3 w-5 h-5 text-violet-600 focus:ring-violet-400 rounded"
                  />
                  <span className="text-sm text-amber-800/80">
                    I consent to sharing my medical information through this medical card. 
                    The QR code will allow healthcare providers to access essential medical information in emergencies.
                  </span>
                </label>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!consentGiven || generating}
                className="w-full bg-gradient-to-r from-violet-500 to-violet-600 text-white px-6 py-3 rounded-xl hover:from-violet-600 hover:to-violet-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl font-semibold"
              >
                {generating ? 'Generating...' : 'Generate Medical Card'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Card Info */}
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-200/50 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-amber-900 mb-2">Medical Card</h2>
                    <p className="text-amber-800/70">QR Code: <span className="font-mono font-semibold">{card.qr_code}</span></p>
                    <p className="text-sm text-amber-700/60 mt-1">Expires: {formatDate(card.expires_at)}</p>
                  </div>
                  <div className="bg-gradient-to-r from-violet-500 to-violet-600 text-white px-4 py-2 rounded-xl text-sm font-semibold">
                    Active
                  </div>
                </div>
              </div>

              {/* Patient Info */}
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-violet-200/50 p-6">
                <h3 className="text-xl font-bold text-amber-900 mb-4">Patient Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-amber-700/70 mb-1">Name</div>
                    <div className="font-semibold text-amber-900">{card.patient.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-amber-700/70 mb-1">Age</div>
                    <div className="font-semibold text-amber-900">{card.patient.age} years</div>
                  </div>
                  <div>
                    <div className="text-sm text-amber-700/70 mb-1">Gender</div>
                    <div className="font-semibold text-amber-900 capitalize">{card.patient.gender}</div>
                  </div>
                  {card.patient.allergies && (
                    <div>
                      <div className="text-sm text-amber-700/70 mb-1">Allergies</div>
                      <div className="font-semibold text-amber-900">{card.patient.allergies}</div>
                    </div>
                  )}
                  {card.patient.medical_conditions && (
                    <div className="col-span-2">
                      <div className="text-sm text-amber-700/70 mb-1">Medical Conditions</div>
                      <div className="font-semibold text-amber-900">{card.patient.medical_conditions}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Medications */}
              {card.medications && card.medications.length > 0 && (
                <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-rose-200/50 p-6">
                  <h3 className="text-xl font-bold text-amber-900 mb-4">Current Medications</h3>
                  <div className="space-y-3">
                    {card.medications.map((med) => (
                      <div
                        key={med.id}
                        className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-orange-200/50"
                      >
                        <div className="font-semibold text-amber-900">{med.name}</div>
                        <div className="text-sm text-amber-800/70 mt-1">
                          {med.strength} • {med.dose_per_intake} • {med.frequency}
                        </div>
                        {med.time_slots && (
                          <div className="text-xs text-amber-700/60 mt-1">Times: {med.time_slots}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* QR Code Display */}
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-200/50 p-6 text-center">
                <h3 className="text-xl font-bold text-amber-900 mb-4">QR Code</h3>
                <div className="bg-white p-6 rounded-xl inline-block border-2 border-violet-200">
                  <div className="w-48 h-48 bg-gray-100 rounded flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📱</div>
                      <div className="text-xs text-amber-700/60 font-mono">{card.qr_code}</div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-amber-800/70 mt-4">
                  Healthcare providers can scan this QR code to access medical information
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}


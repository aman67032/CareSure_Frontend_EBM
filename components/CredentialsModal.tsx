'use client';

import { useState } from 'react';

interface CredentialsModalProps {
  email: string;
  password: string;
  patientName: string;
  onClose: () => void;
}

export default function CredentialsModal({ email, password, patientName, onClose }: CredentialsModalProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  const copyToClipboard = (text: string, type: 'email' | 'password') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full border border-orange-200/50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 via-rose-500 to-violet-600 bg-clip-text text-transparent">
              Patient Created Successfully!
            </h2>
            <p className="text-amber-700/70 mt-2">Save these credentials for <span className="font-semibold">{patientName}</span></p>
          </div>

          {/* Warning */}
          <div className="bg-amber-50/70 border border-amber-200/50 rounded-xl p-4 mb-6 backdrop-blur-sm">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-amber-800/80">
                <strong>Important:</strong> These credentials will only be shown once. Please save them securely and share with the patient.
              </p>
            </div>
          </div>

          {/* Credentials */}
          <div className="space-y-4 mb-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-2">Email Address</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={email}
                  readOnly
                  onFocus={(e) => e.target.select()}
                  className="flex-1 px-4 py-3 bg-white/70 border border-orange-200/50 rounded-xl text-amber-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 select-all"
                />
                <button
                  onClick={() => copyToClipboard(email, 'email')}
                  className="px-4 py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-xl transition-all shadow-lg hover:shadow-xl font-semibold"
                >
                  {copiedEmail ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-2">Password</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={password}
                  readOnly
                  onFocus={(e) => e.target.select()}
                  className="flex-1 px-4 py-3 bg-white/70 border border-orange-200/50 rounded-xl text-amber-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 select-all"
                />
                <button
                  onClick={() => copyToClipboard(password, 'password')}
                  className="px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition-all shadow-lg hover:shadow-xl font-semibold"
                >
                  {copiedPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-violet-500 to-violet-600 text-white px-6 py-3 rounded-xl hover:from-violet-600 hover:to-violet-700 transition-all shadow-lg hover:shadow-xl font-semibold"
            >
              I've Saved These
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


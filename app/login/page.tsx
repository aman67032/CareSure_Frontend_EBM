'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import { setToken } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirectTo, setRedirectTo] = useState('/dashboard');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordChangeData, setPasswordChangeData] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  
  // Get redirect URL from query parameters (with security validation)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');
      if (redirect) {
        // Validate redirect URL - only allow internal routes (starting with /)
        // Prevent open redirect vulnerabilities
        if (redirect.startsWith('/') && !redirect.startsWith('//')) {
          setRedirectTo(redirect);
        }
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login with:', { email: formData.email });
      
      // Test connection first
      try {
        const healthCheck = await fetch('http://localhost:5000/api/health');
        if (!healthCheck.ok) {
          throw new Error('Backend server is not responding');
        }
      } catch (healthError) {
        setError('Unable to connect to server. Please ensure the backend is running on port 5000.');
        setLoading(false);
        return;
      }
      
      const response = await authAPI.login(formData);
      console.log('Login response:', response.data);
      
      if (response.data.token) {
        // Save token to localStorage
        setToken(response.data.token);
        console.log('Token saved, redirecting to:', redirectTo);
        
        // Use window.location for reliable redirect after login
        // Small delay ensures token is saved to localStorage first
        // Redirect to the intended page (from query param) or default to dashboard
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 100);
      } else {
        setError('No token received from server');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      // Handle different error types
      let errorMessage = 'Login failed. Please check your credentials and try again.';
      
      if (err.response) {
        // Server responded with error
        if (err.response.status === 400) {
          // Validation error
          const validationErrors = err.response.data?.errors;
          if (validationErrors && Array.isArray(validationErrors)) {
            errorMessage = validationErrors.map((e: any) => e.msg || e.message).join(', ');
          } else {
            errorMessage = err.response.data?.error || 'Please check your input fields.';
          }
        } else if (err.response.status === 401) {
          // Authentication error
          errorMessage = err.response.data?.error || 'Invalid email or password. Please try again.';
        } else if (err.response.status === 500) {
          // Server error
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = err.response.data?.error || errorMessage;
        }
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'Unable to connect to server. Please check if the backend is running.';
      } else {
        // Error setting up the request
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError('');
    setPasswordChangeSuccess(false);

    if (passwordChangeData.newPassword !== passwordChangeData.confirmPassword) {
      setPasswordChangeError('New passwords do not match');
      return;
    }

    if (passwordChangeData.newPassword.length < 6) {
      setPasswordChangeError('Password must be at least 6 characters long');
      return;
    }

    setPasswordChangeLoading(true);

    try {
      await authAPI.changePassword({
        email: passwordChangeData.email.trim(),
        currentPassword: passwordChangeData.currentPassword,
        newPassword: passwordChangeData.newPassword,
      });

      setPasswordChangeSuccess(true);
      setPasswordChangeData({
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      // Close modal after 2 seconds and show success message
      setTimeout(() => {
        setShowChangePassword(false);
        setPasswordChangeSuccess(false);
      }, 2000);
    } catch (err: any) {
      setPasswordChangeError(err.response?.data?.error || 'Failed to change password. Please try again.');
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img 
              src="/logo.png" 
              alt="CareSure Logo" 
              className="h-20 w-auto drop-shadow-lg"
            />
          </div>
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-orange-400 via-blue-400 to-violet-400 bg-clip-text text-transparent drop-shadow-lg">
            Sign in to CareSure
          </h2>
                 <p className="mt-4 text-center text-sm text-slate-300">
                   Or{' '}
                   <Link href="/signup" className="font-medium text-blue-300 hover:text-blue-200 transition-colors">
                     create a new account
                   </Link>
                 </p>
                 <p className="mt-2 text-center text-sm text-slate-400">
                   Are you a patient?{' '}
                   <Link href="/patient/login" className="font-medium text-violet-300 hover:text-violet-200 transition-colors">
                     Patient Login
                   </Link>
                 </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg backdrop-blur-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-slate-500 placeholder-slate-400 text-white rounded-lg bg-slate-700/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:z-10 transition-all shadow-inner"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-slate-500 placeholder-slate-400 text-white rounded-lg bg-slate-700/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400 focus:z-10 transition-all shadow-inner"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setShowChangePassword(true);
                setPasswordChangeData({ ...passwordChangeData, email: formData.email });
              }}
              className="text-sm text-blue-300 hover:text-blue-200 transition-colors"
            >
              Change Password?
            </button>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-orange-400 via-blue-400 to-violet-400 hover:from-orange-300 hover:via-blue-300 hover:to-violet-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 disabled:opacity-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-blue-400/60 brightness-110"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full border border-slate-600/50 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-400 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-400 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                  Change Password
                </h2>
                <button
                  onClick={() => {
                    setShowChangePassword(false);
                    setPasswordChangeError('');
                    setPasswordChangeSuccess(false);
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {passwordChangeSuccess && (
                <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 px-4 py-3 rounded-xl mb-4 backdrop-blur-sm">
                  Password changed successfully! You can now login with your new password.
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                {passwordChangeError && !passwordChangeSuccess && (
                  <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl backdrop-blur-sm text-sm">
                    {passwordChangeError}
                  </div>
                )}

                <div>
                  <label htmlFor="changeEmail" className="block text-sm font-medium text-slate-200 mb-2">
                    Email
                  </label>
                  <input
                    id="changeEmail"
                    type="email"
                    required
                    className="w-full px-4 py-3 border border-slate-500 rounded-xl bg-slate-700/70 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={passwordChangeData.email}
                    onChange={(e) => setPasswordChangeData({ ...passwordChangeData, email: e.target.value })}
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-200 mb-2">
                    Current Password
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    required
                    className="w-full px-4 py-3 border border-slate-500 rounded-xl bg-slate-700/70 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
                    value={passwordChangeData.currentPassword}
                    onChange={(e) => setPasswordChangeData({ ...passwordChangeData, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-slate-200 mb-2">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border border-slate-500 rounded-xl bg-slate-700/70 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                    value={passwordChangeData.newPassword}
                    onChange={(e) => setPasswordChangeData({ ...passwordChangeData, newPassword: e.target.value })}
                    placeholder="Enter new password (min 6 characters)"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-200 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border border-slate-500 rounded-xl bg-slate-700/70 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
                    value={passwordChangeData.confirmPassword}
                    onChange={(e) => setPasswordChangeData({ ...passwordChangeData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={passwordChangeLoading || passwordChangeSuccess}
                    className="flex-1 bg-gradient-to-r from-violet-500 to-violet-600 text-white px-6 py-3 rounded-xl hover:from-violet-600 hover:to-violet-700 transition-all shadow-lg hover:shadow-xl font-semibold disabled:opacity-50"
                  >
                    {passwordChangeLoading ? 'Changing...' : passwordChangeSuccess ? 'Success!' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


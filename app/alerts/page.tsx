'use client';

import { useEffect, useState } from 'react';
import { alertAPI } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';

interface Alert {
  id: number;
  alert_type: string;
  title: string;
  message: string;
  severity: string;
  patient_name: string;
  is_read: boolean;
  created_at: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, [filter]);

  const loadAlerts = async () => {
    try {
      const params: any = {};
      if (filter !== 'all') {
        if (filter === 'unread') {
          params.is_read = 'false';
        } else {
          params.type = filter;
        }
      }
      const response = await alertAPI.getAll(params);
      setAlerts(response.data.alerts || []);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await alertAPI.markRead(id.toString());
      loadAlerts();
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await alertAPI.markAllRead();
      loadAlerts();
    } catch (error) {
      console.error('Failed to mark all alerts as read:', error);
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-orange-500 bg-orange-100/50';
      case 'medium':
        return 'border-rose-500 bg-rose-100/50';
      default:
        return 'border-violet-500 bg-violet-100/50';
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-rose-500 to-violet-600 bg-clip-text text-transparent drop-shadow-sm">
            Alerts
          </h1>
          <button
            onClick={markAllAsRead}
            className="bg-gradient-to-r from-violet-500 to-violet-600 text-white px-4 py-2 rounded-lg hover:from-violet-600 hover:to-violet-700 text-sm font-medium transition-all shadow-lg backdrop-blur-sm"
          >
            Mark All as Read
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-violet-200/50 mb-6">
          <div className="flex border-b border-violet-200/50">
            {['all', 'unread', 'missed_dose', 'low_stock', 'low_battery'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  filter === tab
                    ? 'border-b-2 border-violet-600 text-violet-600 bg-violet-50/50'
                    : 'text-amber-700/70 hover:text-amber-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1).replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-200/50 p-12 text-center">
              <div className="text-6xl mb-4">🔔</div>
              <h2 className="text-2xl font-semibold text-amber-900 mb-2">No alerts</h2>
              <p className="text-amber-700/70">You're all caught up!</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border-l-4 p-6 ${getSeverityColor(alert.severity)} ${
                  !alert.is_read ? 'ring-2 ring-violet-400/50' : ''
                } border border-orange-200/50 hover:border-violet-400 hover:shadow-2xl transition-all`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-amber-900">{alert.title}</h3>
                      {!alert.is_read && (
                        <span className="bg-violet-500 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-amber-800/80 mb-2">{alert.message}</p>
                    <div className="text-sm text-amber-700/60">
                      {alert.patient_name} • {new Date(alert.created_at).toLocaleString()}
                    </div>
                  </div>
                  {!alert.is_read && (
                    <button
                      onClick={() => markAsRead(alert.id)}
                      className="ml-4 text-violet-600 hover:text-violet-700 text-sm font-medium transition-colors"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}


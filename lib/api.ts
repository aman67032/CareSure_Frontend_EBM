import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log network errors
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      console.error('Network error: Unable to connect to backend server');
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  changePassword: (data: { email: string; currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),
};

// Patient Auth APIs
export const patientAuthAPI = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/patient/login', data),
  changePassword: (data: { email: string; currentPassword: string; newPassword: string }) =>
    api.post('/auth/patient/change-password', data),
};

// Patient APIs (for authenticated patients - self-service)
export const patientSelfAPI = {
  getProfile: () => api.get('/patient/profile'),
  getMedications: () => api.get('/patient/medications'),
  getTodayDoses: () => api.get('/patient/doses/today'),
  markDoseTaken: (doseId: string, notes?: string) => api.post(`/patient/doses/${doseId}/taken`, { notes }),
  markDoseMissed: (doseId: string) => api.post(`/patient/doses/${doseId}/missed`),
  getStats: () => api.get('/patient/stats'),
};

// Patient APIs (for caregivers managing patients)
export const patientAPI = {
  getAll: () => api.get('/patients'),
  getById: (id: string) => api.get(`/patients/${id}`),
  create: (data: any) => api.post('/patients', data),
  update: (id: string, data: any) => api.put(`/patients/${id}`, data),
  delete: (id: string) => api.delete(`/patients/${id}`),
};

// Medication APIs
export const medicationAPI = {
  getByPatient: (patientId: string) => api.get(`/medications/patient/${patientId}`),
  getById: (id: string) => api.get(`/medications/${id}`),
  create: (patientId: string, data: any) => api.post(`/medications/patient/${patientId}`, data),
  createFromOCR: (patientId: string, data: any) => api.post(`/medications/patient/${patientId}/ocr`, data),
  update: (id: string, data: any) => api.put(`/medications/${id}`, data),
  delete: (id: string) => api.delete(`/medications/${id}`),
};

// Reminder APIs
export const reminderAPI = {
  getByMedication: (medicationId: string) => api.get(`/reminders/medication/${medicationId}`),
  setReminders: (medicationId: string, data: any) => api.post(`/reminders/medication/${medicationId}`, data),
  getToday: (patientId: string) => api.get(`/reminders/patient/${patientId}/today`),
  markTaken: (doseId: string, data?: any) => api.post(`/reminders/dose/${doseId}/taken`, data),
  markMissed: (doseId: string) => api.post(`/reminders/dose/${doseId}/missed`),
};

// Device APIs
export const deviceAPI = {
  getByPatient: (patientId: string) => api.get(`/devices/patient/${patientId}`),
  connect: (patientId: string, data: any) => api.post(`/devices/patient/${patientId}/connect`, data),
  assignCompartment: (patientId: string, data: any) => api.post(`/devices/patient/${patientId}/compartment`, data),
};

// Alert APIs
export const alertAPI = {
  getAll: (params?: any) => api.get('/alerts', { params }),
  markRead: (id: string) => api.put(`/alerts/${id}/read`),
  markAllRead: () => api.put('/alerts/read-all'),
  getUnreadCount: () => api.get('/alerts/unread-count'),
};

// Report APIs
export const reportAPI = {
  getAdherence: (patientId: string, params?: any) => api.get(`/reports/patient/${patientId}/adherence`, { params }),
  getDoses: (patientId: string, params?: any) => api.get(`/reports/patient/${patientId}/doses`, { params }),
  getDashboard: (patientId: string) => api.get(`/reports/patient/${patientId}/dashboard`),
};

// Medical Card APIs
export const medicalCardAPI = {
  generate: (patientId: string, data: any) => api.post(`/medical-cards/patient/${patientId}/generate`, data),
  get: (patientId: string) => api.get(`/medical-cards/patient/${patientId}`),
  getByQR: (qrCode: string) => api.get(`/medical-cards/qr/${qrCode}`),
};

// Document APIs
export const documentAPI = {
  getByPatient: (patientId: string) => api.get(`/documents/patient/${patientId}`),
  upload: (patientId: string, formData: FormData) => api.post(`/documents/patient/${patientId}/upload`, formData),
  delete: (id: string) => api.delete(`/documents/${id}`),
};

// Admin APIs
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getCaregivers: () => api.get('/admin/caregivers'),
  getPatients: () => api.get('/admin/patients'),
  getMedications: () => api.get('/admin/medications'),
  getAlerts: () => api.get('/admin/alerts'),
  getLoginActivity: () => api.get('/admin/login-activity'),
};

export default api;


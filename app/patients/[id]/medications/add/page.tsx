'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { medicationAPI, reminderAPI } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';

export default function AddMedicationPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  
  const [formData, setFormData] = useState({
    name: '',
    strength: '',
    dose_per_intake: '',
    frequency: '',
    food_rule: '',
    duration_days: '',
    notes: '',
    timeSlots: [''] as string[], // Array of time slots
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create medication first
      const medResponse = await medicationAPI.create(patientId, {
        name: formData.name,
        strength: formData.strength,
        dose_per_intake: formData.dose_per_intake,
        frequency: formData.frequency,
        food_rule: formData.food_rule,
        duration_days: formData.duration_days ? parseInt(formData.duration_days) : null,
        notes: formData.notes,
      });

      const medicationId = medResponse.data.medication.id;

      // If time slots are provided, create reminders
      const validTimeSlots = formData.timeSlots.filter(slot => slot.trim() !== '');
      if (validTimeSlots.length === 0) {
        setError('Please provide at least one medication time slot. Medications need scheduled times to appear in today\'s schedule.');
        setLoading(false);
        return;
      }

      // Create reminders for each time slot
      const reminders = validTimeSlots.map(timeSlot => {
        // Parse time slot (e.g., "09:00" or "9:00 AM")
        let exactTime = timeSlot.trim();
        // Convert to 24-hour format if needed
        if (exactTime.includes('AM') || exactTime.includes('PM')) {
          const [time, period] = exactTime.split(/(AM|PM)/i);
          const [hours, minutes] = time.trim().split(':').map(Number);
          let hour24 = hours;
          if (period.toUpperCase() === 'PM' && hours !== 12) hour24 = hours + 12;
          if (period.toUpperCase() === 'AM' && hours === 12) hour24 = 0;
          exactTime = `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        } else {
          // Ensure format is HH:MM
          const [hours, minutes] = exactTime.split(':').map(Number);
          if (isNaN(hours) || isNaN(minutes)) {
            throw new Error(`Invalid time format: ${timeSlot}. Please use format like "09:00" or "2:00 PM"`);
          }
          exactTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }

        return {
          time_slot: timeSlot.trim(),
          exact_time: exactTime,
          food_rule: formData.food_rule || null,
          notify_device: true,
          notify_mobile: true,
        };
      });

      // Set reminders which will automatically create doses
      console.log('Creating reminders with data:', { medicationId, reminders });
      const reminderResponse = await reminderAPI.setReminders(medicationId.toString(), { reminders });
      console.log('Reminders created successfully:', reminderResponse.data);

      router.push(`/patients/${patientId}`);
    } catch (err: any) {
      console.error('Failed to add medication:', err);
      setError(err.response?.data?.error || 'Failed to add medication. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addTimeSlot = () => {
    setFormData({
      ...formData,
      timeSlots: [...formData.timeSlots, ''],
    });
  };

  const removeTimeSlot = (index: number) => {
    setFormData({
      ...formData,
      timeSlots: formData.timeSlots.filter((_, i) => i !== index),
    });
  };

  const updateTimeSlot = (index: number, value: string) => {
    const newTimeSlots = [...formData.timeSlots];
    newTimeSlots[index] = value;
    setFormData({
      ...formData,
      timeSlots: newTimeSlots,
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
        
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="text-violet-600 hover:text-violet-700 mb-4 font-semibold transition-colors hover:bg-white/50 px-3 py-1 rounded-lg backdrop-blur-sm"
            >
              ← Back
            </button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-rose-500 to-violet-600 bg-clip-text text-transparent drop-shadow-sm">
              Add Medication
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-200/50 p-6">
            {error && (
              <div className="bg-red-100/70 border border-red-300/50 text-red-800 px-4 py-3 rounded-xl mb-6 backdrop-blur-sm">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-amber-900 mb-2">
                  Medication Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  className="mt-1 block w-full px-4 py-3 border border-orange-200/50 rounded-xl shadow-sm bg-white/70 backdrop-blur-sm text-amber-900 placeholder-amber-400/50 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400 transition-all"
                  placeholder="e.g., Aspirin"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="strength" className="block text-sm font-semibold text-amber-900 mb-2">
                    Strength
                  </label>
                  <input
                    type="text"
                    id="strength"
                    className="mt-1 block w-full px-4 py-3 border border-orange-200/50 rounded-xl shadow-sm bg-white/70 backdrop-blur-sm text-amber-900 placeholder-amber-400/50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all"
                    placeholder="e.g., 100mg"
                    value={formData.strength}
                    onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="dose_per_intake" className="block text-sm font-semibold text-amber-900 mb-2">
                    Dose per Intake
                  </label>
                  <input
                    type="text"
                    id="dose_per_intake"
                    className="mt-1 block w-full px-4 py-3 border border-orange-200/50 rounded-xl shadow-sm bg-white/70 backdrop-blur-sm text-amber-900 placeholder-amber-400/50 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all"
                    placeholder="e.g., 1 tablet"
                    value={formData.dose_per_intake}
                    onChange={(e) => setFormData({ ...formData, dose_per_intake: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="frequency" className="block text-sm font-semibold text-amber-900 mb-2">
                    Frequency
                  </label>
                  <input
                    type="text"
                    id="frequency"
                    className="mt-1 block w-full px-4 py-3 border border-orange-200/50 rounded-xl shadow-sm bg-white/70 backdrop-blur-sm text-amber-900 placeholder-amber-400/50 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400 transition-all"
                    placeholder="e.g., Twice daily"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="food_rule" className="block text-sm font-semibold text-amber-900 mb-2">
                    Food Rule
                  </label>
                  <select
                    id="food_rule"
                    className="mt-1 block w-full px-4 py-3 border border-orange-200/50 rounded-xl shadow-sm bg-white/70 backdrop-blur-sm text-amber-900 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all"
                    value={formData.food_rule}
                    onChange={(e) => setFormData({ ...formData, food_rule: e.target.value })}
                  >
                    <option value="">Select</option>
                    <option value="before_meal">Before Meal</option>
                    <option value="after_meal">After Meal</option>
                    <option value="with_meal">With Meal</option>
                    <option value="empty_stomach">Empty Stomach</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="duration_days" className="block text-sm font-semibold text-amber-900 mb-2">
                  Duration (Days)
                </label>
                <input
                  type="number"
                  id="duration_days"
                  min="1"
                  className="mt-1 block w-full px-4 py-3 border border-orange-200/50 rounded-xl shadow-sm bg-white/70 backdrop-blur-sm text-amber-900 placeholder-amber-400/50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all"
                  placeholder="e.g., 30"
                  value={formData.duration_days}
                  onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-semibold text-amber-900 mb-2">
                  Notes
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  className="mt-1 block w-full px-4 py-3 border border-orange-200/50 rounded-xl shadow-sm bg-white/70 backdrop-blur-sm text-amber-900 placeholder-amber-400/50 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all resize-none"
                  placeholder="Additional instructions or notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              {/* Time Slots Section */}
              <div className="border-t border-orange-200/50 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-semibold text-amber-900">
                    Medication Times *
                  </label>
                  <button
                    type="button"
                    onClick={addTimeSlot}
                    className="text-violet-600 hover:text-violet-700 text-sm font-semibold px-3 py-1 rounded-lg hover:bg-violet-50/50 transition-all"
                  >
                    + Add Time
                  </button>
                </div>
                <p className="text-xs text-amber-700/70 mb-4">
                  Set the times when this medication should be taken (e.g., 09:00, 2:00 PM)
                </p>
                <div className="space-y-3">
                  {formData.timeSlots.map((slot, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="text"
                        required={index === 0}
                        className="flex-1 px-4 py-3 border border-orange-200/50 rounded-xl shadow-sm bg-white/70 backdrop-blur-sm text-amber-900 placeholder-amber-400/50 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400 transition-all"
                        placeholder="e.g., 09:00 or 2:00 PM"
                        value={slot}
                        onChange={(e) => updateTimeSlot(index, e.target.value)}
                      />
                      {formData.timeSlots.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTimeSlot(index)}
                          className="text-rose-600 hover:text-rose-700 px-3 py-2 rounded-lg hover:bg-rose-50/50 transition-all font-semibold"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-violet-500 to-violet-600 text-white px-6 py-3 rounded-xl hover:from-violet-600 hover:to-violet-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl font-semibold backdrop-blur-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </span>
                ) : (
                  'Add Medication'
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


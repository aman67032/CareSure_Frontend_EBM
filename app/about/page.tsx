'use client';

import AuthGuard from '@/components/AuthGuard';

export default function AboutPage() {
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
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-rose-500 to-violet-600 bg-clip-text text-transparent mb-8 drop-shadow-sm">
          About CareSure
        </h1>

        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-200/50 p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-amber-900 mb-4">Our Mission</h2>
            <p className="text-amber-800/80 leading-relaxed">
              CareSure is a smart medication management system designed to help caregivers stay 
              informed while ensuring elders stay safe. We understand the challenges of managing 
              medications for loved ones, and our platform provides the tools and peace of mind 
              you need.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-amber-900 mb-4">Key Features</h2>
            <ul className="space-y-3 text-amber-800/80">
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                <span><strong>Patient Management:</strong> Easily add and manage patient profiles with essential medical information.</span>
              </li>
              <li className="flex items-start">
                <span className="text-violet-600 mr-2">•</span>
                <span><strong>Medication Tracking:</strong> Keep track of all medications, dosages, and schedules in one place.</span>
              </li>
              <li className="flex items-start">
                <span className="text-rose-600 mr-2">•</span>
                <span><strong>Smart Reminders:</strong> Automated reminders ensure medications are taken on time.</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                <span><strong>Real-time Alerts:</strong> Get instant notifications about missed doses, low medication supplies, and important health events.</span>
              </li>
              <li className="flex items-start">
                <span className="text-violet-600 mr-2">•</span>
                <span><strong>Medical Records:</strong> Store and access medical cards, documents, and health reports securely.</span>
              </li>
              <li className="flex items-start">
                <span className="text-rose-600 mr-2">•</span>
                <span><strong>Comprehensive Reports:</strong> Generate detailed reports on medication adherence and health trends.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-amber-900 mb-4">How It Works</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-orange-100/50 to-orange-200/50 backdrop-blur-sm rounded-xl border border-orange-300/50">
                <h3 className="font-semibold text-amber-900 mb-2">1. Create Patient Profiles</h3>
                <p className="text-amber-800/70">Add your loved ones as patients with their basic information and medical history.</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-violet-100/50 to-violet-200/50 backdrop-blur-sm rounded-xl border border-violet-300/50">
                <h3 className="font-semibold text-amber-900 mb-2">2. Add Medications</h3>
                <p className="text-amber-800/70">Input all medications with dosages, frequencies, and special instructions.</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-rose-100/50 to-rose-200/50 backdrop-blur-sm rounded-xl border border-rose-300/50">
                <h3 className="font-semibold text-amber-900 mb-2">3. Set Up Reminders</h3>
                <p className="text-amber-800/70">Configure automated reminders to ensure medications are taken on schedule.</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-orange-100/50 to-violet-100/50 backdrop-blur-sm rounded-xl border border-orange-300/50">
                <h3 className="font-semibold text-amber-900 mb-2">4. Monitor & Respond</h3>
                <p className="text-amber-800/70">Stay informed through real-time alerts and track medication adherence through comprehensive reports.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-amber-900 mb-4">Why CareSure?</h2>
            <p className="text-amber-800/80 leading-relaxed">
              Managing medications for elderly loved ones can be overwhelming. CareSure simplifies 
              this process by providing a centralized platform where caregivers can monitor medication 
              schedules, receive timely alerts, and maintain comprehensive health records. Our goal is 
              to give you peace of mind while ensuring the safety and well-being of those you care for.
            </p>
          </section>

          <section className="pt-6 border-t border-orange-200/50">
            <h2 className="text-2xl font-semibold text-amber-900 mb-4">Contact & Support</h2>
            <p className="text-amber-800/80">
              If you have any questions or need assistance, please visit the Settings page to access 
              support options or contact our team.
            </p>
          </section>
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}


import Link from 'next/link';
import FloatingLines from '@/components/lines_bg';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white relative overflow-hidden">
      {/* Animated Lines Background */}
      <div className="absolute inset-0 z-0">
        <FloatingLines
          linesGradient={['#FF6B35', '#F7931E', '#FFA500']}
          enabledWaves={['top', 'middle', 'bottom']}
          lineCount={[4, 6, 4]}
          lineDistance={[5, 5, 5]}
          animationSpeed={0.5}
          interactive={true}
          parallax={true}
          parallaxStrength={0.3}
          bendStrength={-0.8}
          bendRadius={8.0}
          mixBlendMode="multiply"
        />
      </div>
      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="text-center">
          <div className="mb-6 sm:mb-8 flex justify-center">
            <img 
              src="/logo.png" 
              alt="CareSure Logo" 
              className="h-32 sm:h-40 md:h-44 w-auto drop-shadow-lg"
            />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 drop-shadow-lg px-4">
            CareSure: Smart Medication Management
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white mb-6 sm:mb-8 max-w-2xl mx-auto font-semibold drop-shadow-md px-4">
            Caregivers stay informed. Elders stay safe.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <Link
              href="/login"
              className="w-full sm:w-auto bg-orange-600 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition shadow-lg min-h-[44px] flex items-center justify-center touch-manipulation active:scale-95"
            >
              Caregiver Login
            </Link>
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-white text-orange-600 px-6 sm:px-8 py-3 rounded-lg font-semibold border-2 border-orange-600 hover:bg-orange-50 transition shadow-lg min-h-[44px] flex items-center justify-center touch-manipulation active:scale-95"
            >
              Sign Up
            </Link>
            <Link
              href="/patient/login"
              className="w-full sm:w-auto bg-violet-600 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-violet-700 transition shadow-lg min-h-[44px] flex items-center justify-center touch-manipulation active:scale-95"
            >
              Patient Login
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 sm:mt-16 md:mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div 
            className="group p-6 sm:p-8 rounded-2xl transition-all duration-500 hover:scale-105 hover:bg-white/10 backdrop-blur-sm cursor-pointer border-2 border-transparent hover:border-orange-400/50 touch-manipulation active:scale-95"
            style={{ 
              transformStyle: 'preserve-3d',
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <div className="mb-4 sm:mb-6 transform transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12 w-12 h-12 sm:w-16 sm:h-16 mx-auto">
              <svg className="w-full h-full text-white group-hover:text-orange-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white group-hover:text-orange-200 transition-colors duration-300">
              Smart Reminders
            </h3>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed group-hover:text-white transition-colors duration-300">
              Automated medication reminders with device integration and mobile notifications
            </p>
            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-12 h-1 bg-orange-400 rounded-full"></div>
            </div>
          </div>
          
          <div 
            className="group p-8 rounded-2xl transition-all duration-500 hover:scale-105 hover:bg-white/10 backdrop-blur-sm cursor-pointer border-2 border-transparent hover:border-orange-400/50"
            style={{ 
              transformStyle: 'preserve-3d',
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <div className="mb-6 transform transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12 w-16 h-16 mx-auto">
              <svg className="w-full h-full text-white group-hover:text-orange-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-orange-200 transition-colors duration-300">
              Real-Time Monitoring
            </h3>
            <p className="text-white/90 leading-relaxed group-hover:text-white transition-colors duration-300">
              Track medication adherence in real-time with detailed reports and analytics
            </p>
            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-12 h-1 bg-orange-400 rounded-full"></div>
            </div>
          </div>
          
          <div 
            className="group p-8 rounded-2xl transition-all duration-500 hover:scale-105 hover:bg-white/10 backdrop-blur-sm cursor-pointer border-2 border-transparent hover:border-orange-400/50"
            style={{ 
              transformStyle: 'preserve-3d',
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <div className="mb-6 transform transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12 w-16 h-16 mx-auto">
              <svg className="w-full h-full text-white group-hover:text-orange-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-orange-200 transition-colors duration-300">
              Adherence Tracking
            </h3>
            <p className="text-white/90 leading-relaxed group-hover:text-white transition-colors duration-300">
              Monitor medication compliance with comprehensive adherence reports
            </p>
            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-12 h-1 bg-orange-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <p className="font-semibold">&copy; 2024 CareSure. All rights reserved.</p>
          <div className="mt-4 space-x-4">
            <Link href="/privacy" className="hover:text-orange-200 font-medium">Privacy</Link>
            <Link href="/contact" className="hover:text-orange-200 font-medium">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

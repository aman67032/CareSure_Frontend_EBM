'use client';

import React, { Suspense, useEffect, useState, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Html } from '@react-three/drei';
import * as THREE from 'three';
import { animate } from 'animejs';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AuthGuard from '@/components/AuthGuard';
import { patientAPI, deviceAPI } from '@/lib/api';

gsap.registerPlugin(ScrollTrigger);

// Camera position configurations for each section
const cameraPositions: Record<string, { position: [number, number, number]; target: [number, number, number]; rotation: number }> = {
  section1: { position: [0, 2, 5], target: [0, 1.5, 0], rotation: 0 },
  section2: { position: [0, 3, 4], target: [0, 2, 0], rotation: 0 },
  section3: { position: [0, 0, -5], target: [0, 0, -1.5], rotation: Math.PI },
  section4: { position: [0, 2, 5], target: [0, 1.5, 0], rotation: 0 },
  section5: { position: [3, 1.5, 3], target: [0, 0, 0], rotation: Math.PI / 4 },
  section6: { position: [0, 2, 5], target: [0, 1, 0], rotation: 0 },
  section7: { position: [-4, 1, 0], target: [-2, 0, 0], rotation: Math.PI / 2 },
  section8: { position: [0, -2, 4], target: [0, -1, 0], rotation: Math.PI },
  section9: { position: [0, 2, 5], target: [0, 1, 0], rotation: 0 },
  section10: { position: [0, 2, 5], target: [0, 1, 0], rotation: 0 },
};

// Interactive Annotation Component for 3D space
function ModelAnnotation({ 
  position, 
  label, 
  description, 
  isActive,
  onClick 
}: { 
  position: [number, number, number]; 
  label: string; 
  description: string;
  isActive: boolean;
  onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const annotationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (annotationRef.current) {
      if (isActive || hovered) {
        gsap.to(annotationRef.current, {
          scale: 1.1,
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      } else {
        gsap.to(annotationRef.current, {
          scale: 1,
          opacity: 0.7,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    }
  }, [isActive, hovered]);

  return (
    <Html position={position} center>
      <div 
        ref={annotationRef}
        className={`transition-all cursor-pointer ${
          isActive || hovered 
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-2xl' 
            : 'bg-white/90 backdrop-blur-sm text-gray-900 shadow-lg'
        } px-4 py-3 rounded-xl border-2 ${
          isActive ? 'border-white' : 'border-gray-300'
        } max-w-xs`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onClick}
        style={{ opacity: isActive ? 1 : 0.7 }}
      >
        <div className="font-bold text-sm mb-1">{label}</div>
        <div className={`text-xs ${isActive || hovered ? 'text-white/90' : 'text-gray-700'}`}>
          {description}
        </div>
      </div>
    </Html>
  );
}

// 3D Model Component
function Model({ url, activeSection }: { url: string; activeSection: string | null }) {
  const { scene } = useGLTF(url);
  const meshRef = useRef<THREE.Group>(null);
  const rotationRef = useRef(0);
  const targetRotationRef = useRef(0);
  const animationRef = useRef<any>(null);

  useEffect(() => {
    if (!activeSection || !meshRef.current) return;
    const config = cameraPositions[activeSection];
    if (config) {
      targetRotationRef.current = config.rotation;
      if (animationRef.current) {
        animationRef.current.pause();
      }
      animationRef.current = animate(rotationRef, {
        current: targetRotationRef.current,
        duration: 1500,
        easing: 'easeInOutQuad',
        update: () => {
          if (meshRef.current) {
            meshRef.current.rotation.y = rotationRef.current;
          }
        }
      });
    }
  }, [activeSection]);

  useFrame(() => {
    if (meshRef.current && !activeSection) {
      meshRef.current.rotation.y += 0.005;
      rotationRef.current = meshRef.current.rotation.y;
    }
  });

  return <primitive ref={meshRef} object={scene} scale={1} position={[0, 0, 0]} />;
}

// Camera Controller
function CameraController({ activeSection, controlsRef }: { activeSection: string | null; controlsRef: React.RefObject<any> }) {
  const { camera } = useThree();
  const animationRef = useRef<any>(null);

  useEffect(() => {
    if (!activeSection) return;
    const config = cameraPositions[activeSection];
    if (!config) return;

    if (animationRef.current) {
      animationRef.current.pause();
    }

    const currentPos = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
    const targetPos = { x: config.position[0], y: config.position[1], z: config.position[2] };

    animationRef.current = animate(currentPos, {
      ...targetPos,
      duration: 2000,
      easing: 'easeInOutQuad',
      update: () => {
        camera.position.set(currentPos.x, currentPos.y, currentPos.z);
        camera.lookAt(config.target[0], config.target[1], config.target[2]);
      }
    });

    if (controlsRef.current) {
      const currentTarget = {
        x: controlsRef.current.target.x,
        y: controlsRef.current.target.y,
        z: controlsRef.current.target.z,
      };
      animate(currentTarget, {
        x: config.target[0],
        y: config.target[1],
        z: config.target[2],
        duration: 2000,
        easing: 'easeInOutQuad',
        update: () => {
          controlsRef.current.target.set(currentTarget.x, currentTarget.y, currentTarget.z);
          controlsRef.current.update();
        }
      });
    }
  }, [activeSection, camera, controlsRef]);

  return null;
}

// Scene Component with annotations
function Scene({ activeSection, onSectionChange, selectedPrototype }: { activeSection: string | null; onSectionChange: (section: string) => void; selectedPrototype: 'prototype1' | 'prototype2' }) {
  const controlsRef = useRef<any>(null);

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      <pointLight position={[-10, -10, -5]} intensity={0.8} />
      <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={1} />
      <Suspense fallback={
        <Html center>
          <div className="text-white font-semibold text-xl">Loading 3D model...</div>
        </Html>
      }>
        <Model 
          url={selectedPrototype === 'prototype1' ? '/unffsxgvtitled.glb' : '/hitem3d (1).glb'} 
          activeSection={activeSection} 
        />
      </Suspense>
      <CameraController activeSection={activeSection} controlsRef={controlsRef} />
      
      {/* Interactive Annotations */}
      {activeSection === 'section1' && (
        <>
          <ModelAnnotation 
            position={[0, 1.5, 0]} 
            label={selectedPrototype === 'prototype1' ? "Compartment Tray" : "Grid Compartments"} 
            description={selectedPrototype === 'prototype1' ? "White blocks hold blister strips" : "8-28 compartments in grid layout with flip-top lids"}
            isActive={true}
            onClick={() => onSectionChange('section1')}
          />
          {selectedPrototype === 'prototype1' && (
            <>
              <ModelAnnotation 
                position={[0.8, 1.5, 0.3]} 
                label="Green LED" 
                description="Current dose indicator"
                isActive={true}
              />
              <ModelAnnotation 
                position={[-0.8, 1.5, 0.3]} 
                label="Red LED" 
                description="Missed/wrong dose alert"
                isActive={true}
              />
            </>
          )}
          {selectedPrototype === 'prototype2' && (
            <>
              <ModelAnnotation 
                position={[0.8, 1.5, 0.3]} 
                label="Flip-Top Lid" 
                description="Individual transparent lids with soft-close hinges"
                isActive={true}
              />
              <ModelAnnotation 
                position={[-0.8, 1.5, 0.3]} 
                label="Foam-Magnet Sensor" 
                description="Detects pill removal via magnet position shift"
                isActive={true}
              />
            </>
          )}
        </>
      )}
      
      {activeSection === 'section2' && (
        <ModelAnnotation 
          position={[0, 2, 0]} 
          label={selectedPrototype === 'prototype1' ? "Main Lid & Sensor" : "Individual Lids"} 
          description={selectedPrototype === 'prototype1' ? "Magnetic/Hall effect sensor" : "Flip-top lids with child-resistant locks"}
          isActive={true}
        />
      )}
      
      {activeSection === 'section3' && (
        <ModelAnnotation 
          position={[0, 0, -1.5]} 
          label={selectedPrototype === 'prototype1' ? "Electronics Chamber" : "Central Electronics Panel"} 
          description={selectedPrototype === 'prototype1' ? "ESP32, WiFi, Power, Buzzer" : "OLED/LCD screen, buttons, ESP32, battery management"}
          isActive={true}
        />
      )}
      
      {activeSection === 'section5' && selectedPrototype === 'prototype2' && (
        <ModelAnnotation 
          position={[0, -0.5, 0]} 
          label="Hall-Effect Sensor PCB" 
          description="Detects magnet movement when pill is removed"
          isActive={true}
        />
      )}

      {activeSection === 'section7' && (
        <ModelAnnotation 
          position={[-2, 0, 0]} 
          label="Back Panel" 
          description="USB-C, QR Code, Battery"
          isActive={true}
        />
      )}

      {activeSection === 'section8' && (
        <ModelAnnotation 
          position={[0, -1, 0]} 
          label="Base & Mount" 
          description="Anti-slip feet, Ventilation"
          isActive={true}
        />
      )}

      {activeSection === 'section10' && (
        <ModelAnnotation 
          position={[0, 2, 0]} 
          label="Prototype Setup" 
          description="Arduino/ESP32 Development Guide"
          isActive={true}
        />
      )}
      
      <OrbitControls 
        ref={controlsRef} 
        enablePan 
        enableZoom 
        enableRotate 
        minDistance={2} 
        maxDistance={12}
        autoRotate={!activeSection}
        autoRotateSpeed={0.5}
      />
      <Environment preset="sunset" />
    </>
  );
}

interface DeviceCompartment {
  id: number;
  compartment_number: number;
  medication_id: number;
  medication_name: string;
}

interface Patient {
  id: number;
  name: string;
  device?: { compartments: DeviceCompartment[] };
}

const hardwareSections = [
  { id: 'section1', title: 'Compartment Area', icon: '📦', color: 'from-orange-500 to-rose-500' },
  { id: 'section2', title: 'Main Lid & Sensor', icon: '🔓', color: 'from-violet-500 to-purple-500' },
  { id: 'section3', title: 'Electronics Chamber', icon: '⚡', color: 'from-blue-500 to-cyan-500' },
  { id: 'section4', title: 'LED Matrix', icon: '💡', color: 'from-yellow-500 to-amber-500' },
  { id: 'section5', title: 'Sensor System', icon: '🔍', color: 'from-emerald-500 to-teal-500' },
  { id: 'section6', title: 'Cloud Connection', icon: '☁️', color: 'from-indigo-500 to-blue-500' },
  { id: 'section7', title: 'Back Panel', icon: '🔌', color: 'from-pink-500 to-rose-500' },
  { id: 'section8', title: 'Base & Mount', icon: '🏠', color: 'from-slate-500 to-gray-500' },
  { id: 'section9', title: 'How It Works', icon: '⚙️', color: 'from-purple-500 to-violet-500' },
  { id: 'section10', title: 'Prototype Setup', icon: '🔧', color: 'from-green-500 to-emerald-500' },
];

export default function HardwarePage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [deviceCompartments, setDeviceCompartments] = useState<DeviceCompartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>('section1');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedPrototype, setSelectedPrototype] = useState<'prototype1' | 'prototype2'>('prototype1');
  
  const viewerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPatients();
    
    // GSAP entrance animation for 3D viewer
    if (canvasRef.current) {
      gsap.from(canvasRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 1.5,
        ease: 'power3.out',
        delay: 0.3
      });
    }
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

  const loadDeviceCompartments = async (patientId: string) => {
    try {
      const response = await deviceAPI.getByPatient(patientId);
      setDeviceCompartments(response.data.device?.compartments || []);
    } catch (error) {
      console.error('Failed to load device compartments:', error);
      setDeviceCompartments([]);
    }
  };

  const handlePatientSelect = async (patient: Patient) => {
    setSelectedPatient(patient);
    if (patient.id) {
      await loadDeviceCompartments(patient.id.toString());
    }
  };

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    if (viewerRef.current) {
      viewerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const toggleFullscreen = () => {
    if (!viewerRef.current) return;
    
    if (!isFullscreen) {
      if (viewerRef.current.requestFullscreen) {
        viewerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
        {/* Minimal Hero */}
        <div className="relative py-4 sm:py-6 md:py-8 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent leading-tight">
              Hardware Blueprint
            </h1>
            <p className="text-gray-400 text-sm sm:text-base md:text-lg mb-4 sm:mb-6">
              Interactive 3D exploration of the CareSure Smart Medicine Box
            </p>
            
            {/* Prototype Selector */}
            <div className="mb-4 sm:mb-6">
              <div className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-xl rounded-full p-1 border border-white/20 shadow-xl">
                <button
                  onClick={() => setSelectedPrototype('prototype1')}
                  className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 min-h-[44px] touch-manipulation ${
                    selectedPrototype === 'prototype1'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg scale-105'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="mr-1.5">📦</span>
                  <span className="hidden sm:inline">Prototype 1</span>
                  <span className="sm:hidden">P1</span>
                </button>
                <button
                  onClick={() => setSelectedPrototype('prototype2')}
                  className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 min-h-[44px] touch-manipulation ${
                    selectedPrototype === 'prototype2'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="mr-1.5">🧠</span>
                  <span className="hidden sm:inline">Prototype 2</span>
                  <span className="sm:hidden">P2</span>
                </button>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-2 ml-2">
                {selectedPrototype === 'prototype1' 
                  ? 'Basic 8-compartment design with LED indicators'
                  : 'Advanced grid-based design (8-28 compartments) with foam-magnet sensors'}
              </p>
            </div>
            
            {/* Purchase Button - Hero */}
            <div className="mb-4 sm:mb-6">
              <a
                href="https://payments.cashfree.com/forms?code=dfweg"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white font-bold px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-base md:text-lg shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-500/70 transition-all duration-300 hover:scale-105 transform min-h-[44px] touch-manipulation"
                onClick={(e) => {
                  // Add animation on click
                  gsap.to(e.currentTarget, {
                    scale: 0.95,
                    duration: 0.1,
                    yoyo: true,
                    repeat: 1,
                    ease: 'power2.inOut'
                  });
                }}
              >
                <span className="text-xl sm:text-2xl">🛒</span>
                <span className="hidden sm:inline">Purchase CareSure Device</span>
                <span className="sm:hidden">Purchase Device</span>
                <span className="text-lg sm:text-xl">→</span>
              </a>
            </div>
            
            {/* Compact Section Pills - Mobile Optimized */}
            <div className="flex flex-wrap gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 -mx-4 sm:mx-0 px-4 sm:px-0">
              {hardwareSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleSectionClick(section.id)}
                  className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 min-h-[44px] touch-manipulation whitespace-nowrap ${
                    activeSection === section.id
                      ? `bg-gradient-to-r ${section.color} text-white shadow-lg scale-105`
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 backdrop-blur-sm border border-white/10 active:scale-95'
                  }`}
                >
                  <span className="mr-1">{section.icon}</span>
                  <span className="hidden sm:inline">{section.title}</span>
                  <span className="sm:hidden">{section.title.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Full-Screen 3D Viewer Section */}
        <div ref={viewerRef} className="relative w-full" style={{ height: isFullscreen ? '100vh' : 'calc(100vh - 200px)', minHeight: '400px' }}>
          <div ref={canvasRef} className="absolute inset-0 w-full h-full">
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
              <Scene activeSection={activeSection} onSectionChange={setActiveSection} selectedPrototype={selectedPrototype} />
            </Canvas>
          </div>

          {/* Floating Controls Overlay - Top Right - Mobile Optimized */}
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 md:top-6 md:right-6 z-50 flex flex-col gap-2 sm:gap-3 max-w-[calc(100%-1rem)] sm:max-w-none">
            {/* Purchase Button - Floating */}
            <a
              href="https://payments.cashfree.com/forms?code=dfweg"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white font-bold px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 rounded-xl shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-500/70 transition-all duration-300 hover:scale-105 transform text-center backdrop-blur-xl border border-white/20 text-xs sm:text-sm min-h-[44px] touch-manipulation"
              onClick={(e) => {
                gsap.to(e.currentTarget, {
                  scale: 0.95,
                  duration: 0.1,
                  yoyo: true,
                  repeat: 1,
                  ease: 'power2.inOut'
                });
              }}
            >
              <span className="text-base sm:text-lg mr-1 sm:mr-2">🛒</span>
              <span className="hidden sm:inline">Purchase Device</span>
              <span className="sm:hidden">Buy</span>
            </a>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="bg-black/60 backdrop-blur-xl px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-white/20 hover:bg-black/80 transition-all text-white text-xs sm:text-sm font-semibold min-h-[44px] touch-manipulation active:scale-95"
            >
              <span className="hidden sm:inline">{isFullscreen ? '⤓ Exit Fullscreen' : '⤢ Fullscreen'}</span>
              <span className="sm:hidden">{isFullscreen ? '⤓' : '⤢'}</span>
            </button>

            {/* Patient Selection - Floating Panel - Mobile Optimized */}
            <div className="bg-black/60 backdrop-blur-xl rounded-xl p-3 sm:p-4 border border-white/20 shadow-2xl min-w-[200px] sm:min-w-[280px] max-w-[calc(100vw-1rem)]">
              <h3 className="text-xs sm:text-sm font-bold mb-2 sm:mb-3 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Select Patient
              </h3>
              {loading ? (
                <div className="text-gray-400 text-xs">Loading...</div>
              ) : patients.length === 0 ? (
                <div className="text-gray-400 text-xs">No patients available</div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {patients.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => handlePatientSelect(patient)}
                      className={`w-full text-left px-3 py-2.5 sm:py-2 rounded-lg transition-all text-xs sm:text-sm min-h-[44px] touch-manipulation active:scale-95 ${
                        selectedPatient?.id === patient.id
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      {patient.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Compartments - Floating Panel */}
            {selectedPatient && (
              <div className="bg-black/60 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-2xl min-w-[280px] max-h-64 overflow-y-auto">
                <h3 className="text-sm font-bold mb-3 bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
                  Compartments
                </h3>
                {deviceCompartments.length === 0 ? (
                  <div className="text-center py-4 text-gray-400 text-xs">
                    <div className="text-2xl mb-1">📦</div>
                    <p>No compartments assigned</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {deviceCompartments.map((comp) => (
                      <div
                        key={comp.id}
                        className="bg-white/5 p-3 rounded-lg border border-white/10 hover:border-purple-500/50 transition-all"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-white text-xs">
                            Compartment {comp.compartment_number}
                          </span>
                          <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
                            #{comp.compartment_number}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          <span className="font-medium">Medication:</span>{' '}
                          {comp.medication_name || (
                            <span className="text-gray-500 italic">Empty</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Floating Info Panel - Bottom Left - Mobile Optimized */}
          <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 md:bottom-6 md:left-6 z-50 flex flex-col gap-2 sm:gap-3 max-w-[calc(100%-1rem)] sm:max-w-sm md:max-w-md">
            <div className="bg-black/60 backdrop-blur-xl rounded-xl p-3 sm:p-4 border border-white/20 shadow-2xl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm sm:text-base md:text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {hardwareSections.find(s => s.id === activeSection)?.title || '3D Model Viewer'}
                </h3>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                  selectedPrototype === 'prototype1' 
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                    : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                }`}>
                  {selectedPrototype === 'prototype1' ? 'P1' : 'P2'}
                </span>
              </div>
              <p className="text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3 leading-relaxed">
                {activeSection === 'section1' && (
                  selectedPrototype === 'prototype1' 
                    ? '8 compartments arranged in two rows, each designed to hold blister strips with LED indicators.'
                    : '8-28 compartments in a grid layout (4×7 or 2×4 matrix). Each compartment has individual flip-top transparent lids with color-coded indicators. Size per slot: ~35×35mm, 15-20mm depth. Optional Braille markings for visually impaired users.'
                )}
                {activeSection === 'section2' && (
                  selectedPrototype === 'prototype1'
                    ? 'Magnetic/Hall effect sensor detects when the entire lid opens, providing timestamp for logs.'
                    : 'Individual flip-top lids for each compartment with soft-close hinges, small locking notch for child resistance, and indented area for finger grip. Made of translucent ABS/polycarbonate (medical-grade plastic).'
                )}
                {activeSection === 'section3' && (
                  selectedPrototype === 'prototype1'
                    ? 'Contains ESP32 microcontroller, power management, WiFi module, and buzzer for alerts.'
                    : 'Central electronics panel on front with OLED/LCD screen (1.3-2 inch) showing date, time, battery %, Wi-Fi status, and next scheduled medicine. Three push buttons: manual dose override, Wi-Fi reset, and settings/menu. ESP32 microcontroller (Wi-Fi + BLE), battery management IC + Li-ion cell, piezo buzzer, and LED drivers.'
                )}
                {activeSection === 'section4' && (
                  selectedPrototype === 'prototype1'
                    ? 'LED matrix shows status: Green for current dose, Red for missed/wrong, Yellow for override.'
                    : 'LED indicators near each compartment. Green LED for current dose time, Red for missed/wrong attempt, Yellow/Flashing for caregiver override. Optional LED strip under lid lip for additional brightness. Visual cues above/beside each lid.'
                )}
                {activeSection === 'section5' && (
                  selectedPrototype === 'prototype1'
                    ? 'Lid sensor and per-compartment sensors detect openings and track adherence.'
                    : 'Foam + magnet sensor system: Compressible silicone foam pad (~4-5mm thick) with neodymium magnet embedded in center at bottom of each compartment. Hall-effect sensor PCB sits directly under each magnet. When pill is removed, foam decompresses, magnet position shifts, and sensor detects movement. Minimal wiring routed below via thin 2-layer PCB.'
                )}
                {activeSection === 'section6' && (
                  selectedPrototype === 'prototype1'
                    ? 'Real-time synchronization with cloud platform for schedule updates and adherence tracking.'
                    : 'Wi-Fi module connects to cloud via MQTT or HTTPS. Box pulls medication schedule updates hourly or on demand. Logs sensor-triggered events (pill removed, lid opened). Sends real-time confirmation to caregiver dashboard. BLE for local device pairing.'
                )}
                {activeSection === 'section7' && (
                  selectedPrototype === 'prototype1'
                    ? 'USB-C charging port, QR code sticker, and battery access cover on the back panel.'
                    : 'Back or side panel features: USB-C charging port, battery access cover (optional), speaker outlet holes for buzzer/voice alerts, QR code sticker for box pairing (Box ID), and Wi-Fi status LED (blinking/solid).'
                )}
                {activeSection === 'section8' && (
                  selectedPrototype === 'prototype1'
                    ? 'Rubber anti-slip feet for safety and ventilation spacing to prevent heat build-up.'
                    : 'Base includes: Ventilation holes to avoid overheating, four rubber feet to prevent sliding, and mounting slots (optional wall-mount version). Dimensions: Width ~20-30cm, Height ~6-8cm, Depth ~14-18cm (for 4×7 grid).'
                )}
                {activeSection === 'section9' && (
                  selectedPrototype === 'prototype1'
                    ? 'Complete workflow from caregiver schedule setup to patient dose events and cloud logging.'
                    : 'For each dose time: Box sounds buzzer for 10-30 seconds, corresponding compartment LED turns GREEN. If no activity detected in 10 mins → missed dose alert, LED turns RED. Complete workflow from caregiver schedule setup to patient dose events and cloud logging with real-time updates.'
                )}
                {activeSection === 'section10' && (
                  selectedPrototype === 'prototype1'
                    ? 'Step-by-step guide to build a prototype using Arduino/ESP32 for demonstration and testing purposes.'
                    : 'Advanced prototype features: Foam-magnet detection system, grid-based compartment layout, individual lid sensors, OLED/LCD display, multiple button controls. Step-by-step guide to build using Arduino/ESP32 with Hall sensors and foam pads for demonstration and testing purposes.'
                )}
              </p>
              <div className="text-xs text-gray-400 space-y-1">
                <p className="hidden sm:block">🖱️ <strong>Rotate:</strong> Left click + drag</p>
                <p className="sm:hidden">👆 <strong>Rotate:</strong> Touch + drag</p>
                <p className="hidden sm:block">🔍 <strong>Zoom:</strong> Scroll wheel</p>
                <p className="sm:hidden">🔍 <strong>Zoom:</strong> Pinch</p>
                <p className="hidden sm:block">↔️ <strong>Pan:</strong> Right click + drag</p>
                <p className="sm:hidden">↔️ <strong>Pan:</strong> Two fingers + drag</p>
              </div>
            </div>

            {/* Purchase Button - Bottom Left - Mobile Optimized */}
            <a
              href="https://payments.cashfree.com/forms?code=dfweg"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white font-bold px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-500/70 transition-all duration-300 hover:scale-105 transform text-center backdrop-blur-xl border border-white/20 flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px] touch-manipulation"
              onClick={(e) => {
                gsap.to(e.currentTarget, {
                  scale: 0.95,
                  duration: 0.1,
                  yoyo: true,
                  repeat: 1,
                  ease: 'power2.inOut'
                });
              }}
            >
              <span className="text-lg sm:text-xl">🛒</span>
              <span className="hidden sm:inline">Purchase CareSure Device</span>
              <span className="sm:hidden">Purchase Device</span>
              <span className="text-base sm:text-lg">→</span>
            </a>
          </div>

          {/* Section Navigation - Bottom Center - Mobile Optimized */}
          <div className="absolute bottom-2 sm:bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-black/60 backdrop-blur-xl rounded-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 border border-white/20 shadow-2xl max-w-[calc(100vw-1rem)] overflow-x-auto">
              <div className="flex gap-1 sm:gap-2">
                {hardwareSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => handleSectionClick(section.id)}
                    className={`p-2 sm:p-2.5 rounded-full transition-all duration-300 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation active:scale-95 ${
                      activeSection === section.id
                        ? `bg-gradient-to-r ${section.color} text-white shadow-lg scale-110`
                        : 'bg-white/10 text-gray-400 hover:bg-white/20'
                    }`}
                    title={section.title}
                  >
                    <span className="text-base sm:text-lg">{section.icon}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Section Content - Below 3D Viewer */}
        {activeSection && (
          <div className="py-20 px-6 bg-gradient-to-b from-transparent to-gray-900/50">
            <div className="max-w-4xl mx-auto">
              {/* Purchase CTA Banner */}
              <div className="mb-8 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 backdrop-blur-xl rounded-3xl p-6 border border-emerald-500/30 shadow-2xl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Ready to Get Started?</h3>
                    <p className="text-gray-300">Purchase your CareSure Smart Medicine Box today</p>
                  </div>
                  <a
                    href="https://payments.cashfree.com/forms?code=dfweg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white font-bold px-8 py-4 rounded-full shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-500/70 transition-all duration-300 hover:scale-105 transform flex items-center gap-3 whitespace-nowrap"
                    onClick={(e) => {
                      gsap.to(e.currentTarget, {
                        scale: 0.95,
                        duration: 0.1,
                        yoyo: true,
                        repeat: 1,
                        ease: 'power2.inOut'
                      });
                    }}
                  >
                    <span className="text-2xl">🛒</span>
                    <span>Purchase Now</span>
                    <span className="text-xl">→</span>
                  </a>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-3xl p-10 border border-white/10 shadow-2xl">
                {activeSection === 'section1' && (
                  <div>
                    <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">
                      📦 Compartment Area
                    </h3>
                    <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                      Your 3D model shows <strong className="text-white">8 compartments arranged in two rows</strong>. Each compartment is designed to hold one type of medicine (blister strip).
                    </p>
                    <div className="space-y-4">
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h4 className="font-bold text-white mb-3 text-xl">Compartment Tray (White Block)</h4>
                        <ul className="text-gray-300 space-y-2">
                          <li>• Holds one type of medicine (blister strip)</li>
                          <li>• Capacity depends on medicine size</li>
                          <li>• Rigid plastic so strips stay aligned</li>
                        </ul>
                      </div>
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h4 className="font-bold text-white mb-3 text-xl">LED Indicators</h4>
                        <ul className="text-gray-300 space-y-2">
                          <li>• <span className="text-emerald-400 font-semibold">Green LED</span> = Compartment assigned for current dose</li>
                          <li>• <span className="text-rose-400 font-semibold">Red LED</span> = Missed dose / Wrong time attempt / Error alert</li>
                          <li>• LED lights are placed on top for easy visibility for elderly</li>
                        </ul>
                      </div>
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h4 className="font-bold text-white mb-3 text-xl">Compartment Micro-Switch / Hall Sensor</h4>
                        <ul className="text-gray-300 space-y-2">
                          <li>• Hidden inside the small vertical support near each compartment</li>
                          <li>• Detects opening/closing of the compartment</li>
                          <li>• Sends "Compartment X opened" to microcontroller</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'section2' && (
                  <div>
                    <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                      🔓 Main Lid & Lid Sensor
                    </h3>
                    <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                      The full top cover opens in one piece. This is the large flat white plate covering the entire system in your 3D model.
                    </p>
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                      <h4 className="font-bold text-white mb-3 text-xl">Lid Sensor (Magnetic / Hall Effect)</h4>
                      <ul className="text-gray-300 space-y-2">
                        <li>• Detects when the entire lid is opened</li>
                        <li>• Used to differentiate lid opened at correct time vs wrong time</li>
                        <li>• Provides timestamp for logs</li>
                      </ul>
                    </div>
                  </div>
                )}

                {activeSection === 'section3' && (
                  <div>
                    <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      ⚡ Electronics Chamber
                    </h3>
                    <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                      The black panel on the front contains the electronic system. Located behind the black front panel in your 3D model.
                    </p>
                    <div className="space-y-4">
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h4 className="font-bold text-white mb-3 text-xl">A. Microcontroller Unit (ESP32)</h4>
                        <ul className="text-gray-300 space-y-2">
                          <li>• Processes all sensor input</li>
                          <li>• Controls LEDs + buzzer</li>
                          <li>• Connects to WiFi</li>
                          <li>• Manages communication with cloud</li>
                        </ul>
                      </div>
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h4 className="font-bold text-white mb-3 text-xl">B. Power Management Module</h4>
                        <ul className="text-gray-300 space-y-2">
                          <li>• Li-ion battery pack</li>
                          <li>• Charging circuit (TP4056 or on-board BMS)</li>
                          <li>• Voltage regulators (5V → 3.3V)</li>
                          <li>• Battery % detection</li>
                        </ul>
                      </div>
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h4 className="font-bold text-white mb-3 text-xl">C. WiFi Module & D. Buzzer</h4>
                        <ul className="text-gray-300 space-y-2">
                          <li>• Built-in ESP32 WiFi connects device to cloud</li>
                          <li>• Receives medication schedule</li>
                          <li>• Loud piezo buzzer triggers during scheduled dose time</li>
                          <li>• Alerts caregiver if unanswered</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'section4' && (
                  <div>
                    <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                      💡 LED Matrix Unit
                    </h3>
                    <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                      The LEDs above each compartment follow specific patterns. In your model, each compartment has two dots — green & red — showing the LED placement.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-emerald-500/10 p-6 rounded-2xl border border-emerald-500/30">
                        <div className="flex items-center mb-2">
                          <div className="w-4 h-4 bg-emerald-500 rounded-full mr-2"></div>
                          <span className="font-semibold text-white">Green LED</span>
                        </div>
                        <p className="text-gray-300 text-sm">Compartment assigned for current dose</p>
                      </div>
                      <div className="bg-rose-500/10 p-6 rounded-2xl border border-rose-500/30">
                        <div className="flex items-center mb-2">
                          <div className="w-4 h-4 bg-rose-500 rounded-full mr-2"></div>
                          <span className="font-semibold text-white">Red LED</span>
                        </div>
                        <p className="text-gray-300 text-sm">Missed/Incorrect dose or error alert</p>
                      </div>
                      <div className="bg-amber-500/10 p-6 rounded-2xl border border-amber-500/30">
                        <div className="flex items-center mb-2">
                          <div className="w-4 h-4 bg-amber-500 rounded-full mr-2 animate-pulse"></div>
                          <span className="font-semibold text-white">Yellow/Flashing</span>
                        </div>
                        <p className="text-gray-300 text-sm">Caregiver override mode</p>
                      </div>
                      <div className="bg-slate-500/10 p-6 rounded-2xl border border-slate-500/30">
                        <div className="flex items-center mb-2">
                          <div className="w-4 h-4 bg-slate-400 rounded-full mr-2"></div>
                          <span className="font-semibold text-white">Off</span>
                        </div>
                        <p className="text-gray-300 text-sm">Idle state - no active reminder</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'section5' && (
                  <div>
                    <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                      🔍 Sensor System Overview
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h4 className="font-bold text-white mb-3 text-xl">1. Lid Sensor (Primary adherence sensor)</h4>
                        <ul className="text-gray-300 space-y-2">
                          <li>• Magnets + Hall effect sensor</li>
                          <li>• Detects main lid open/close</li>
                          <li>• Provides primary adherence tracking</li>
                        </ul>
                      </div>
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h4 className="font-bold text-white mb-3 text-xl">2. Compartment Sensor</h4>
                        <p className="text-gray-300 mb-2">Each compartment includes:</p>
                        <ul className="text-gray-300 space-y-2 ml-4">
                          <li>• Micro-switch OR</li>
                          <li>• Magnetic hall sensor + tiny magnet</li>
                        </ul>
                        <p className="text-gray-300 mt-4 mb-2">Used to detect:</p>
                        <ul className="text-gray-300 space-y-2 ml-4">
                          <li>• Exactly which compartment was opened</li>
                          <li>• When it was accessed</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'section6' && (
                  <div>
                    <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
                      ☁️ Cloud + App Connection Flow
                    </h3>
                    <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                      Explaining what happens when sensors trigger and how data flows between the device and caregiver app.
                    </p>
                    <div className="space-y-4">
                      <div className="bg-purple-500/10 p-6 rounded-2xl border-l-4 border-purple-500">
                        <h4 className="font-bold text-white mb-2 text-xl">1. Caregiver Sets Schedule on App</h4>
                        <div className="text-gray-300 space-y-1">
                          <p>→ Schedule syncs to cloud</p>
                          <p>→ Cloud sends notifications to box at specific times</p>
                          <p>→ Box only wakes during relevant schedule</p>
                        </div>
                      </div>
                      <div className="bg-emerald-500/10 p-6 rounded-2xl border-l-4 border-emerald-500">
                        <h4 className="font-bold text-white mb-2 text-xl">2. Patient Time Comes</h4>
                        <div className="text-gray-300 space-y-1">
                          <p>→ Buzzer starts</p>
                          <p>→ Correct compartment LED turns green</p>
                          <p>→ Lid sensor triggers once opened</p>
                          <p>→ Compartment sensor triggers when correct tray is opened</p>
                        </div>
                      </div>
                      <div className="bg-blue-500/10 p-6 rounded-2xl border-l-4 border-blue-500">
                        <h4 className="font-bold text-white mb-2 text-xl">3. Box Logs the Event</h4>
                        <p className="text-gray-300 mb-2">Data sent to cloud:</p>
                        <ul className="text-gray-300 space-y-1 ml-4">
                          <li>• Lid open timestamp</li>
                          <li>• Compartment number opened</li>
                          <li>• Time difference from scheduled dose</li>
                          <li>• Signal strength & battery level</li>
                        </ul>
                      </div>
                      <div className="bg-orange-500/10 p-6 rounded-2xl border-l-4 border-orange-500">
                        <h4 className="font-bold text-white mb-2 text-xl">4. Caregiver Dashboard Updates</h4>
                        <p className="text-gray-300 mb-2">Shows:</p>
                        <ul className="text-gray-300 space-y-1 ml-4">
                          <li>• Medicine taken ✓</li>
                          <li>• Missed dose ⚠</li>
                          <li>• Wrong compartment opened ⚠</li>
                          <li>• Low stock alert 📦</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'section7' && (
                  <div>
                    <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                      🔌 Back/Left Side Panel
                    </h3>
                    <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                      In your 3D model, this would be placed on the left back wall.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h4 className="font-bold text-white mb-2 text-xl">1. USB-C Charging Port</h4>
                        <p className="text-gray-300 text-sm">For charging the Li-ion battery</p>
                      </div>
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h4 className="font-bold text-white mb-2 text-xl">2. QR Code Sticker</h4>
                        <p className="text-gray-300 text-sm">Used to link the box to caregiver's account</p>
                      </div>
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h4 className="font-bold text-white mb-2 text-xl">3. Battery Access Cover</h4>
                        <p className="text-gray-300 text-sm">For replacement/service</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'section8' && (
                  <div>
                    <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-slate-400 to-gray-400 bg-clip-text text-transparent">
                      🏠 Under the Box (Mount & Stability)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h4 className="font-bold text-white mb-2 text-xl">1. Rubber Anti-Slip Feet</h4>
                        <p className="text-gray-300 text-sm">For elderly safety - prevents device from sliding</p>
                      </div>
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h4 className="font-bold text-white mb-2 text-xl">2. Ventilation Spacing</h4>
                        <p className="text-gray-300 text-sm">To prevent heat build-up from electronics</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'section9' && (
                  <div>
                    <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                      ⚙️ How It Works - Step by Step
                    </h3>
                    <div className="space-y-4">
                      {[
                        { num: 1, title: 'Main Overview', desc: 'This is the CareSure Smart Medicine Box with 8 compartments, each designed for Indian blister packs.', bgClass: 'bg-emerald-500/10', borderClass: 'border-emerald-500', textClass: 'text-emerald-400' },
                        { num: 2, title: 'Compartment Zone', desc: 'These white strips are the medicine trays. Green and red LEDs indicate the status — green for dose time and red for missed/wrong access.', bgClass: 'bg-blue-500/10', borderClass: 'border-blue-500', textClass: 'text-blue-400' },
                        { num: 3, title: 'Sensors', desc: 'Every compartment includes a micro-switch sensor to detect openings. A hall sensor near the lid detects when the entire box is opened.', bgClass: 'bg-purple-500/10', borderClass: 'border-purple-500', textClass: 'text-purple-400' },
                        { num: 4, title: 'Electronics Section', desc: 'This front panel houses the microcontroller, WiFi module, battery management system, and buzzer.', bgClass: 'bg-orange-500/10', borderClass: 'border-orange-500', textClass: 'text-orange-400' },
                        { num: 5, title: 'Dose Event', desc: 'When it\'s time for a medicine: The buzzer sounds, the correct compartment glows green, opening the compartment sends a \'dose taken\' signal to the caregiver app.', bgClass: 'bg-rose-500/10', borderClass: 'border-rose-500', textClass: 'text-rose-400' },
                        { num: 6, title: 'Connectivity', desc: 'The entire box syncs in real-time with the CareSure cloud platform.', bgClass: 'bg-violet-500/10', borderClass: 'border-violet-500', textClass: 'text-violet-400' },
                      ].map((step) => (
                        <div key={step.num} className={`${step.bgClass} p-6 rounded-2xl border-l-4 ${step.borderClass}`}>
                          <div className="flex items-start">
                            <span className={`text-3xl font-bold ${step.textClass} mr-4`}>{step.num}</span>
                            <div>
                              <h4 className="font-bold text-white mb-2 text-xl">{step.title}</h4>
                              <p className="text-gray-300 text-sm">{step.desc}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === 'section10' && (
                  <div>
                    <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                      🔧 Prototype Setup Guide (Arduino/ESP32)
                    </h3>
                    <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                      Since the production device isn't available yet, you can build a working prototype using Arduino/ESP32 for demonstration and testing. This guide will help you create a functional prototype that connects to the CareSure platform.
                    </p>

                    {/* Components Needed */}
                    <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-6 rounded-2xl border-l-4 border-blue-500 mb-6">
                      <h4 className="text-2xl font-bold text-white mb-4">📦 Components You'll Need</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                          <h5 className="font-bold text-white mb-3">Microcontroller (Choose One):</h5>
                          <ul className="text-gray-300 space-y-2 text-sm">
                            <li>• <strong>ESP32 Development Board</strong> (Recommended - has WiFi built-in)</li>
                            <li>• ESP8266 NodeMCU (Alternative, cheaper)</li>
                            <li>• ESP32-C3 (Low power option)</li>
                            <li>• Arduino Uno + ESP8266 WiFi module (if using Arduino)</li>
                          </ul>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                          <h5 className="font-bold text-white mb-3">Sensors & Components:</h5>
                          <ul className="text-gray-300 space-y-2 text-sm">
                            <li>• 1x Hall Effect Sensor (A3144) - for lid detection</li>
                            <li>• 8x Micro-switches or 8x Hall sensors - for compartments</li>
                            <li>• 8x Green LEDs + 8x Red LEDs (or RGB LEDs)</li>
                            <li>• 1x Piezo Buzzer</li>
                            <li>• Resistors (220Ω for LEDs, 10kΩ pull-up for sensors)</li>
                            <li>• Breadboard, jumper wires, USB cable</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Step-by-Step Setup */}
                    <div className="space-y-6">
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <div className="flex items-start">
                          <span className="text-3xl font-bold text-green-400 mr-4">1</span>
                          <div className="flex-1">
                            <h4 className="font-bold text-white mb-3 text-xl">Hardware Wiring</h4>
                            <div className="space-y-3">
                              <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/30">
                                <h5 className="font-semibold text-white mb-2">Lid Sensor (Hall Effect):</h5>
                                <ul className="text-gray-300 text-sm space-y-1 ml-4">
                                  <li>• VCC → 3.3V</li>
                                  <li>• GND → GND</li>
                                  <li>• OUT → GPIO pin (e.g., GPIO 2) with 10kΩ pull-up resistor</li>
                                </ul>
                              </div>
                              <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/30">
                                <h5 className="font-semibold text-white mb-2">Compartment Sensors (8x):</h5>
                                <ul className="text-gray-300 text-sm space-y-1 ml-4">
                                  <li>• Connect each micro-switch/ Hall sensor to separate GPIO pins</li>
                                  <li>• Example pins: GPIO 4, 5, 16, 17, 18, 19, 21, 22</li>
                                  <li>• Use 10kΩ pull-up resistors for each sensor</li>
                                  <li>• GND → Common GND, VCC → 3.3V</li>
                                </ul>
                              </div>
                              <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/30">
                                <h5 className="font-semibold text-white mb-2">LEDs (16x - 8 Green + 8 Red):</h5>
                                <ul className="text-gray-300 text-sm space-y-1 ml-4">
                                  <li>• Connect each LED through 220Ω resistor to GPIO pins</li>
                                  <li>• Use PWM-capable pins for brightness control</li>
                                  <li>• Example: GPIO 12-15, 25-27 for LEDs</li>
                                  <li>• Common cathode or individual control</li>
                                </ul>
                              </div>
                              <div className="bg-orange-500/10 p-4 rounded-lg border border-orange-500/30">
                                <h5 className="font-semibold text-white mb-2">Buzzer:</h5>
                                <ul className="text-gray-300 text-sm space-y-1 ml-4">
                                  <li>• Positive → GPIO pin (e.g., GPIO 26)</li>
                                  <li>• Negative → GND</li>
                                  <li>• Can use transistor for louder buzzer</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <div className="flex items-start">
                          <span className="text-3xl font-bold text-green-400 mr-4">2</span>
                          <div className="flex-1">
                            <h4 className="font-bold text-white mb-3 text-xl">Software Setup</h4>
                            <div className="space-y-3">
                              <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/30">
                                <h5 className="font-semibold text-white mb-2">Install Arduino IDE:</h5>
                                <ul className="text-gray-300 text-sm space-y-1 ml-4">
                                  <li>• Download Arduino IDE from arduino.cc</li>
                                  <li>• Go to File → Preferences → Additional Board Manager URLs</li>
                                  <li>• Add: <code className="bg-black/30 px-2 py-1 rounded">https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json</code></li>
                                  <li>• Tools → Board → Boards Manager → Search "ESP32" → Install</li>
                                </ul>
                              </div>
                              <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/30">
                                <h5 className="font-semibold text-white mb-2">Install Required Libraries:</h5>
                                <ul className="text-gray-300 text-sm space-y-1 ml-4">
                                  <li>• <strong>WiFi.h</strong> - Built-in (ESP32)</li>
                                  <li>• <strong>HTTPClient.h</strong> - Built-in (ESP32)</li>
                                  <li>• <strong>ArduinoJson</strong> - Sketch → Include Library → Manage Libraries → Search "ArduinoJson"</li>
                                  <li>• <strong>TimeLib</strong> - For time management</li>
                                  <li>• <strong>WiFiManager</strong> (Optional) - For easy WiFi setup</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <div className="flex items-start">
                          <span className="text-3xl font-bold text-green-400 mr-4">3</span>
                          <div className="flex-1">
                            <h4 className="font-bold text-white mb-3 text-xl">Basic Code Structure</h4>
                            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 mb-3">
                              <pre className="text-xs text-gray-300 overflow-x-auto">
{`#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// WiFi Credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// API Endpoint
const char* apiUrl = "http://localhost:5000/api/devices";

// Pin Definitions
const int LID_SENSOR = 2;
const int COMPARTMENTS[8] = {4, 5, 16, 17, 18, 19, 21, 22};
const int GREEN_LEDS[8] = {12, 13, 14, 15, 25, 26, 27, 32};
const int RED_LEDS[8] = {33, 34, 35, 36, 37, 38, 39, 40};
const int BUZZER = 26;

void setup() {
  Serial.begin(115200);
  
  // Initialize pins
  pinMode(LID_SENSOR, INPUT_PULLUP);
  for(int i=0; i<8; i++) {
    pinMode(COMPARTMENTS[i], INPUT_PULLUP);
    pinMode(GREEN_LEDS[i], OUTPUT);
    pinMode(RED_LEDS[i], OUTPUT);
  }
  pinMode(BUZZER, OUTPUT);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi Connected!");
}

void loop() {
  // Check lid sensor
  if(digitalRead(LID_SENSOR) == LOW) {
    sendEvent("lid_opened");
  }
  
  // Check compartment sensors
  for(int i=0; i<8; i++) {
    if(digitalRead(COMPARTMENTS[i]) == LOW) {
      sendEvent("compartment_opened", i+1);
    }
  }
  
  delay(100);
}

void sendEvent(String eventType, int compartment = 0) {
  HTTPClient http;
  http.begin(apiUrl);
  http.addHeader("Content-Type", "application/json");
  
  DynamicJsonDocument doc(1024);
  doc["event_type"] = eventType;
  doc["compartment"] = compartment;
  doc["timestamp"] = millis();
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  int httpResponseCode = http.POST(jsonString);
  http.end();
}`}
                              </pre>
                            </div>
                            <p className="text-gray-300 text-sm mt-3">
                              This is a basic structure. You'll need to add schedule checking, LED control, buzzer logic, and proper API authentication.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <div className="flex items-start">
                          <span className="text-3xl font-bold text-green-400 mr-4">4</span>
                          <div className="flex-1">
                            <h4 className="font-bold text-white mb-3 text-xl">Connect to CareSure Backend</h4>
                            <div className="space-y-3">
                              <div className="bg-emerald-500/10 p-4 rounded-lg border border-emerald-500/30">
                                <h5 className="font-semibold text-white mb-2">Device Registration:</h5>
                                <ul className="text-gray-300 text-sm space-y-1 ml-4">
                                  <li>• First, register your device with the backend API</li>
                                  <li>• POST to: <code className="bg-black/30 px-2 py-1 rounded">/api/devices/register</code></li>
                                  <li>• Send: device_id (use ESP32 MAC address), device_name</li>
                                  <li>• Receive: auth_token for future API calls</li>
                                </ul>
                              </div>
                              <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/30">
                                <h5 className="font-semibold text-white mb-2">API Endpoints to Implement:</h5>
                                <ul className="text-gray-300 text-sm space-y-1 ml-4">
                                  <li>• <strong>GET</strong> <code className="bg-black/30 px-2 py-1 rounded">/api/devices/schedule</code> - Get medication schedule</li>
                                  <li>• <strong>POST</strong> <code className="bg-black/30 px-2 py-1 rounded">/api/devices/events</code> - Send sensor events</li>
                                  <li>• <strong>GET</strong> <code className="bg-black/30 px-2 py-1 rounded">/api/devices/status</code> - Check device status</li>
                                </ul>
                              </div>
                              <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/30">
                                <h5 className="font-semibold text-white mb-2">Authentication:</h5>
                                <ul className="text-gray-300 text-sm space-y-1 ml-4">
                                  <li>• Include auth_token in HTTP headers: <code className="bg-black/30 px-2 py-1 rounded">Authorization: Bearer YOUR_TOKEN</code></li>
                                  <li>• Store token in ESP32 EEPROM or flash memory</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <div className="flex items-start">
                          <span className="text-3xl font-bold text-green-400 mr-4">5</span>
                          <div className="flex-1">
                            <h4 className="font-bold text-white mb-3 text-xl">Testing & Calibration</h4>
                            <ul className="text-gray-300 space-y-2 text-sm">
                              <li>• Test each sensor individually using Serial Monitor</li>
                              <li>• Calibrate sensor thresholds (adjust pull-up resistors if needed)</li>
                              <li>• Test LED indicators - verify all 16 LEDs work</li>
                              <li>• Test buzzer at different frequencies/volumes</li>
                              <li>• Verify WiFi connection stability</li>
                              <li>• Test API communication - send test events, receive schedules</li>
                              <li>• Monitor Serial output for debugging</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="bg-amber-500/10 p-6 rounded-2xl border border-amber-500/30">
                        <h4 className="font-bold text-white mb-3 text-xl">⚠️ Important Notes for Prototyping:</h4>
                        <ul className="text-gray-300 space-y-2 text-sm">
                          <li>• <strong>Device ID:</strong> Use ESP32 MAC address as unique device identifier</li>
                          <li>• <strong>QR Code:</strong> Generate a test QR code with device ID, or manually enter device ID in app</li>
                          <li>• <strong>Power:</strong> Use USB power for testing; add battery + TP4056 charger for portable prototype</li>
                          <li>• <strong>Enclosure:</strong> Use cardboard box or 3D printed case to simulate actual device</li>
                          <li>• <strong>Security:</strong> Use HTTPS for production; HTTP is fine for local testing</li>
                          <li>• <strong>Physical Setup:</strong> Create 8 compartments using cardboard dividers or 3D printed parts</li>
                          <li>• <strong>Mount Sensors:</strong> Place sensors at appropriate positions (lid hinge, compartment openings)</li>
                        </ul>
                      </div>

                      <div className="bg-gradient-to-r from-indigo-500/10 to-blue-500/10 p-6 rounded-2xl border-l-4 border-indigo-500">
                        <h4 className="font-bold text-white mb-3 text-xl">📡 Connection Flow for Prototype:</h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-gray-300">
                            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">1</div>
                            <span>ESP32 powers on → Connects to WiFi</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-300 ml-4">
                            <span className="text-green-400">↓</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-300">
                            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">2</div>
                            <span>Device registers with backend → Gets device_id and auth_token</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-300 ml-4">
                            <span className="text-green-400">↓</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-300">
                            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">3</div>
                            <span>Caregiver manually links device_id in app (or scans test QR code)</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-300 ml-4">
                            <span className="text-green-400">↓</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-300">
                            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">4</div>
                            <span>Device polls backend for schedules → Receives medication schedule</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-300 ml-4">
                            <span className="text-green-400">↓</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-300">
                            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">5</div>
                            <span>Device sends sensor events → Backend updates caregiver dashboard</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="py-8 px-6 border-t border-white/10">
          <div className="max-w-7xl mx-auto text-center text-gray-400">
            <p>CareSure Hardware Blueprint & 3D Model Explanation</p>
          </div>
        </footer>
      </div>
    </AuthGuard>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Activity, 
  Shield, 
  QrCode, 
  ClipboardList, 
  Stethoscope, 
  Users, 
  CheckCircle, 
  Send, 
  HeartHandshake, 
  ShieldCheck,
  FileCheck
} from 'lucide-react';

interface PublicLandingProps {
  onNavigate: (page: 'landing' | 'login' | 'register' | 'forgot-password' | 'dashboard') => void;
}

export default function PublicLanding({ onNavigate }: PublicLandingProps) {
  const [contactEmail, setContactEmail] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail || !contactName) return;
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setContactEmail('');
      setContactName('');
      setContactMsg('');
    }, 4000);
  };

  return (
    <div id="landing-container" className="min-h-screen bg-white text-slate-800 font-sans selection:bg-sky-500/10">
      
      {/* NAVIGATION BAR - STICKY ON SCROLL */}
      <nav id="landing-navbar" className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-250">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('landing')}>
              <div className="bg-sky-500 text-white p-2 rounded-xl shadow-xs">
                <Activity className="h-5 w-5" />
              </div>
              <span className="font-sans font-bold text-xl tracking-tight text-slate-900">
                Med<span className="text-sky-500">Link</span> <span className="text-slate-500 font-medium text-base">Identity</span>
              </span>
            </div>
            
            {/* Simple Menu */}
            <div className="hidden md:flex space-x-8 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <a href="#overview" className="hover:text-sky-500 transition-colors">Home</a>
              <a href="#features" className="hover:text-sky-500 transition-colors">Features</a>
              <a href="#benefits" className="hover:text-sky-500 transition-colors">Benefits</a>
              <a href="#workflow" className="hover:text-sky-500 transition-colors">How It Works</a>
              <a href="#contact" className="hover:text-sky-500 transition-colors">Contact</a>
            </div>

            {/* Right Side Buttons */}
            <div className="flex items-center gap-3">
              <button 
                id="btn-nav-login"
                onClick={() => onNavigate('login')}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
              >
                Login
              </button>
              <button 
                id="btn-nav-register"
                onClick={() => onNavigate('register')}
                className="px-4 py-2 text-sm font-semibold text-white bg-sky-500 hover:bg-sky-600 rounded-lg shadow-sm transition-all cursor-pointer"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section id="overview" className="relative bg-white py-16 md:py-24 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-sky-600 bg-sky-50 rounded-full border border-sky-100/60">
                <ShieldCheck className="h-4.5 w-4.5 text-sky-500" /> Patient-Centered Healthcare Network
              </span>
              
              <h1 className="text-4xl sm:text-5xl lg:text-5xl font-sans font-extrabold text-slate-900 leading-tight tracking-tight">
                Smarter Healthcare, <span className="text-sky-500">Better Patient Care</span>
              </h1>
              
              <p className="text-slate-600 text-base sm:text-lg font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
                A secure and modern healthcare platform connecting patients and doctors in one organized medical system.
              </p>
              
              <p className="text-slate-505 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Manage medical records, access emergency healthcare information, and improve patient care through a fast and secure digital experience.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button 
                  id="btn-hero-start"
                  onClick={() => onNavigate('register')}
                  className="w-full sm:w-auto px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl shadow-lg shadow-sky-100 cursor-pointer transition-all hover:translate-y-[-1px]"
                >
                  Create Account
                </button>
                <button 
                  id="btn-hero-login"
                  onClick={() => onNavigate('login')}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-755 font-semibold border border-slate-205 rounded-xl shadow-xs cursor-pointer transition-all"
                >
                  Access Dashboard
                </button>
              </div>
            </div>

            {/* Right Visual Patient Card segment */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="absolute inset-0 bg-sky-200/20 blur-3xl rounded-full"></div>
              
              <div className="relative bg-white p-6 rounded-2xl shadow-xl border border-slate-200 max-w-sm w-full space-y-5">
                
                {/* Clean Patient Title Block */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 font-bold text-sm">AS</div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Ahmed Salah</h4>
                      <p className="text-xs text-slate-500 font-mono">ID: MID-789410</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 text-[9px] font-mono font-bold bg-emerald-50 text-emerald-600 rounded-full uppercase tracking-wider border border-emerald-100">
                    Verified Patient
                  </span>
                </div>
                
                {/* Clinical Metadata */}
                <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-150 text-xs text-slate-600">
                  <div className="flex justify-between items-center border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-400 font-medium">Medical ID:</span>
                    <span className="font-mono text-slate-800 font-bold">MID-789410</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-400 font-medium">Blood Type:</span>
                    <span className="font-bold text-slate-850">O+</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-400 font-medium">Emergency Contact:</span>
                    <span className="text-slate-800 font-semibold text-right">Sarah Salah</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Allergies:</span>
                    <span className="font-bold text-amber-600">Penicillin</span>
                  </div>
                </div>

                {/* Professional QR code preview */}
                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-150 space-y-2">
                  <QrCode className="h-24 w-24 text-slate-700 stroke-[1.5]" />
                  <div className="text-center">
                    <h5 className="text-xs font-bold text-slate-800">Medical QR Identity</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Quick patient identification for authorized healthcare providers.</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* TRUST INDICATORS SECTION */}
      <section className="bg-slate-50 py-16 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-1 mb-10">
            <h3 className="text-xs font-bold uppercase tracking-widest text-sky-600 font-mono">Platform Safeguards</h3>
            <h2 className="text-2xl sm:text-3xl font-sans font-bold text-slate-900 leading-tight">Patient Safety & Care Coordination</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white p-6 rounded-xl border border-slate-250/80 shadow-sm space-y-2">
              <div className="bg-sky-50 text-sky-600 p-2.5 rounded-lg w-10 h-10 flex items-center justify-center">
                <QrCode className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Faster Patient Identification</h4>
              <p className="text-slate-505 text-xs leading-relaxed">
                Quick access to patient medical profiles through QR verification.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-250/80 shadow-sm space-y-2">
              <div className="bg-sky-50 text-sky-600 p-2.5 rounded-lg w-10 h-10 flex items-center justify-center">
                <ClipboardList className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Organized Medical Records</h4>
              <p className="text-slate-505 text-xs leading-relaxed">
                Securely manage visits, prescriptions, lab results, and treatment history.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-250/80 shadow-sm space-y-2">
              <div className="bg-sky-50 text-sky-600 p-2.5 rounded-lg w-10 h-10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Emergency Medical Access</h4>
              <p className="text-slate-505 text-xs leading-relaxed">
                Instant emergency information for critical situations.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-250/80 shadow-sm space-y-2">
              <div className="bg-sky-50 text-sky-600 p-2.5 rounded-lg w-10 h-10 flex items-center justify-center">
                <FileCheck className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Secure Audit Trail</h4>
              <p className="text-slate-505 text-xs leading-relaxed">
                HIPAA-compliant logs tracking every medical chart view.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-sky-600 font-bold text-xs uppercase tracking-widest font-mono">Features overview</span>
            <h2 className="text-3xl sm:text-4xl font-sans font-extrabold text-slate-900">
              Everything You Need in One Healthcare Platform
            </h2>
            <p className="text-slate-505 text-sm sm:text-base leading-relaxed">
              Built to simplify communication between patients, doctors, and health administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-3">
              <div className="h-10 w-10 bg-white rounded-lg border border-slate-200/80 flex items-center justify-center text-sky-500 shadow-3xs">
                <QrCode className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Smart Medical QR Card</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Patients receive a personal QR medical identity for faster hospital check-ins and emergency access.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-3">
              <div className="h-10 w-10 bg-white rounded-lg border border-slate-200/80 flex items-center justify-center text-sky-500 shadow-3xs">
                <ClipboardList className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Electronic Medical Records</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Doctors manage diagnoses, prescriptions, lab reports, and treatment plans securely.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-3">
              <div className="h-10 w-10 bg-white rounded-lg border border-slate-200/80 flex items-center justify-center text-sky-500 shadow-3xs">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Role-Based Access</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Each user role has secure and appropriate permissions.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-3">
              <div className="h-10 w-10 bg-white rounded-lg border border-slate-200/80 flex items-center justify-center text-sky-500 shadow-3xs">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Emergency Medical Information</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Critical health details remain available when needed most.
              </p>
            </div>

            {/* Card 5 */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-3">
              <div className="h-10 w-10 bg-white rounded-lg border border-slate-200/80 flex items-center justify-center text-sky-500 shadow-3xs">
                <FileCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Digital Prescriptions</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Generate and authorize prescriptions instantly with automated pharmacy tracking codes.
              </p>
            </div>

            {/* Card 6 */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-3">
              <div className="h-10 w-10 bg-white rounded-lg border border-slate-200/80 flex items-center justify-center text-sky-500 shadow-3xs">
                <Stethoscope className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Doctor Workflow Optimization</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Doctors can quickly search patients, update records, and review visit history.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section id="benefits" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left intro copy */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-sky-600 font-bold text-xs uppercase tracking-widest font-mono">Platform Benefits</span>
              
              <h2 className="text-3xl sm:text-4xl font-sans font-extrabold text-slate-900 leading-tight">
                Why Healthcare Teams Choose MedLink
              </h2>
              
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Designed to simplify healthcare coordination and reduce unnecessary administrative delays.
              </p>
              
              <div className="space-y-4 pt-2">
                <div className="flex gap-3">
                  <div className="mt-1 h-5 w-5 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-mono font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Reduced Admin Delay</h4>
                    <p className="text-slate-505 text-xs">Faster coordination between care centers and medical record offices keeps clinical teams focused on diagnosis.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="mt-1 h-5 w-5 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-mono font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Organized Patient Timelines</h4>
                    <p className="text-slate-505 text-xs">Consolidates medical milestones, emergency allergy notices, and prescriptions in a unified lookup list.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right benefits card grid */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-[9px] font-mono font-bold text-sky-500 uppercase tracking-widest">Speed</span>
                <h4 className="font-bold text-slate-900 text-sm">Faster Check-In Process</h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Doctors can quickly access patient profiles using QR identification.
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-[9px] font-mono font-bold text-sky-500 uppercase tracking-widest">Emergency Care</span>
                <h4 className="font-bold text-slate-900 text-sm">Better Emergency Response</h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Critical medical information is available immediately.
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-[9px] font-mono font-bold text-sky-500 uppercase tracking-widest">Medical History</span>
                <h4 className="font-bold text-slate-900 text-sm">Organized Health Records</h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  All visits, diagnoses, prescriptions, and reports stay in one place.
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-[9px] font-mono font-bold text-sky-500 uppercase tracking-widest">Security</span>
                <h4 className="font-bold text-slate-900 text-sm">Secure Data Encryption</h4>
                <p className="text-slate-505 text-xs leading-relaxed">
                  All EMR charts are stored with industry-grade, HIPAA-compliant encryption algorithms.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ROLE SHOWCASE SECTION */}
      <section className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-2 mb-12">
            <span className="text-sky-600 font-bold text-xs uppercase tracking-widest font-mono font-bold">Collaborators</span>
            <h2 className="text-2xl sm:text-3xl font-sans font-extrabold text-slate-900">Custom Built Role Workspace Solutions</h2>
            <p className="text-slate-505 text-sm">Tailored interfaces and actions matching every stakeholder's clinical requirements.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[9px] font-mono font-bold text-sky-600 bg-sky-50 px-2 py-0.5 border border-sky-100 rounded-full">PHYSICIANS</span>
              <h3 className="font-bold text-slate-900 text-sm pt-2">For Doctors</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Quickly access patient history, prescriptions, and treatment plans.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[9px] font-mono font-bold text-sky-600 bg-sky-50 px-2 py-0.5 border border-sky-100 rounded-full">INDIVIDUALS</span>
              <h3 className="font-bold text-slate-900 text-sm pt-2">For Patients</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Track medical history, prescriptions, appointments, and emergency information.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[9px] font-mono font-bold text-sky-600 bg-sky-50 px-2 py-0.5 border border-sky-100 rounded-full">ADMINISTRATION</span>
              <h3 className="font-bold text-slate-900 text-sm pt-2">For Administrators</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Manage users, approvals, departments, and system activity.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="workflow" className="py-20 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-16">
            <span className="text-sky-600 font-bold text-xs uppercase tracking-widest font-mono font-bold">Simple Flow</span>
            <h2 className="text-3xl font-sans font-extrabold text-slate-900">How MedLink Works</h2>
            <p className="text-slate-500 text-sm">
              Use a simple 4-step healthcare workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs relative">
              <span className="text-xs font-mono font-bold text-sky-500 bg-sky-50 border border-sky-100 px-2 py-1 rounded">Step 1</span>
              <h4 className="font-bold text-slate-800 text-sm mt-4 mb-1">Create Your Account</h4>
              <p className="text-slate-500 text-xs leading-relaxed">Register and complete your medical profile.</p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs relative">
              <span className="text-xs font-mono font-bold text-sky-500 bg-sky-50 border border-sky-100 px-2 py-1 rounded">Step 2</span>
              <h4 className="font-bold text-slate-800 text-sm mt-4 mb-1">Add Emergency Info</h4>
              <p className="text-slate-500 text-xs leading-relaxed">Add blood type, allergies, medications, and emergency contact details.</p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs relative">
              <span className="text-xs font-mono font-bold text-sky-500 bg-sky-50 border border-sky-100 px-2 py-1 rounded">Step 3</span>
              <h4 className="font-bold text-slate-800 text-sm mt-4 mb-1">Access Your Medical QR Card</h4>
              <p className="text-slate-500 text-xs leading-relaxed">Receive a personal QR identity for faster medical access.</p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs relative">
              <span className="text-xs font-mono font-bold text-sky-500 bg-sky-50 border border-sky-100 px-2 py-1 rounded">Step 4</span>
              <h4 className="font-bold text-slate-800 text-sm mt-4 mb-1">Secure Healthcare Coordination</h4>
              <p className="text-slate-500 text-xs leading-relaxed">Doctors and authorized staff can securely access medical records when needed.</p>
            </div>

          </div>
        </div>
      </section>

      {/* TESTIMONIAL SECTION */}
      <section className="bg-white py-16 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <div className="inline-flex bg-sky-50 text-sky-600 p-2.5 rounded-full border border-sky-100">
            <HeartHandshake className="h-6 w-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-sans font-bold text-slate-900 leading-tight">
            Built for Better Healthcare Experiences
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed font-sans">
            MedLink helps improve healthcare coordination by reducing paperwork, improving patient accessibility, and organizing medical information in one secure environment.
          </p>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="py-20 bg-slate-50">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 sm:p-10 space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-sans font-bold text-slate-900">Contact Us</h2>
              <p className="text-slate-505 text-xs leading-relaxed">
                Have questions or need support? Send us a message and our team will respond as soon as possible.
              </p>
            </div>

            {contactSubmitted ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 font-semibold rounded-xl text-center border border-emerald-200 text-xs">
                ✓ Message received successfully. One of our support consultants will follow up with you.
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Full Name" 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-lg text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="Email Address" 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-lg text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Message</label>
                  <textarea 
                    rows={4}
                    required
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    placeholder="Message" 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-lg text-xs text-slate-800 resize-none font-sans"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold rounded-lg shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-sky-600"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-10 text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="bg-sky-500 text-white p-1.5 rounded-lg">
                <Activity className="h-4 w-4" />
              </div>
              <span className="font-bold text-slate-850 text-sm font-sans tracking-tight">
                MedLink <span className="text-sky-500 font-extrabold">Identity</span>
              </span>
            </div>
            
            {/* Links */}
            <div className="flex gap-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <a href="#overview" className="hover:text-slate-600 transition-colors">About</a>
              <a href="#features" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-600 transition-colors">Support</a>
              <a href="#contact" className="hover:text-slate-600 transition-colors">Contact</a>
            </div>

          </div>
          
          <div className="border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
            <p>© 2026 MedLink Healthcare System. All Rights Reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}

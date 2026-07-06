import React, { useState, useEffect } from "react";
import { 
  getActiveFirebaseMode, 
  setActiveFirebaseMode, 
  userFirebaseConfig, 
  sandboxFirebaseConfig 
} from "../lib/firebase";
import { lastFirebaseError, clearLastFirebaseError } from "../lib/firestoreService";
import { Database, ShieldAlert, Sparkles, AlertTriangle, Layers, Copy, Check, RefreshCw } from "lucide-react";

interface FirebaseStatusPanelProps {
  onRefresh?: () => void;
}

export const FirebaseStatusPanel: React.FC<FirebaseStatusPanelProps> = ({ onRefresh }) => {
  const [activeMode, setActiveMode] = useState<"sandbox" | "production">(getActiveFirebaseMode());
  const [errorText, setErrorText] = useState<string | null>(lastFirebaseError);
  const [copied, setCopied] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);

  useEffect(() => {
    // Keep internal error check in sync
    const interval = setInterval(() => {
      setErrorText(lastFirebaseError);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleModeSwitch = (mode: "sandbox" | "production") => {
    clearLastFirebaseError();
    setActiveFirebaseMode(mode);
  };

  const copyRules = () => {
    const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;
    navigator.clipboard.writeText(rules);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentProjectId = activeMode === "production" ? userFirebaseConfig.projectId : sandboxFirebaseConfig.projectId;

  return (
    <div id="firebase-status-panel" className="w-full bg-[#0F172A] text-[#F8FAFC] py-3.5 px-4 rounded-xl border border-slate-800 shadow-xl max-w-4xl mx-auto my-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left column: Status indicators */}
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${errorText ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
            <Database className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm tracking-wide text-slate-100">Firebase Bridge Diagnostics</h3>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                activeMode === "production" 
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-400/20' 
                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/20'
              }`}>
                {activeMode === "production" ? "Your Custom Project" : "AI Studio Sandbox"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              Active Project: <code className="text-slate-200 bg-slate-800/80 px-1.5 py-0.5 rounded font-mono text-[11px]">{currentProjectId}</code>
            </p>
          </div>
        </div>

        {/* Right column: Action controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {errorText && activeMode === "production" && (
            <button 
              id="fix-rules-btn"
              onClick={() => setIsExpanding(!isExpanding)}
              className="text-xs bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 font-medium px-3 py-1.5 rounded-lg border border-amber-500/30 transition-all flex items-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              How to fix permissions?
            </button>
          )}

          <div className="flex items-center gap-1.5 bg-slate-800/60 p-1 rounded-lg border border-slate-700">
            <button
              id="switch-prod-db-btn"
              onClick={() => handleModeSwitch("production")}
              className={`text-xs px-3 py-1.25 rounded-md font-medium transition-all ${
                activeMode === "production"
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Custom Project
            </button>
            <button
              id="switch-sandbox-db-btn"
              onClick={() => handleModeSwitch("sandbox")}
              className={`text-xs px-3 py-1.25 rounded-md font-medium transition-all ${
                activeMode === "sandbox"
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Developer Sandbox
            </button>
          </div>

          {onRefresh && (
            <button
              id="refresh-db-status-btn"
              onClick={onRefresh}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all"
              title="Verify Database Connections"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Embedded Warning Banner if Firestore fails */}
      {errorText && (
        <div className="mt-3.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <span className="font-semibold text-red-300">Firebase Permission Warning:</span> {errorText}
            {activeMode === "production" ? (
              <p className="mt-1 text-[#94A3B8]">
                Your custom database <code className="text-red-300 font-mono text-[11px]">graduation-project-ed7ea</code> has secure default Rules routing.
                Click the <b className="text-amber-400 font-medium">"How to fix permissions"</b> button above to view matching security declarations, or switch to the <b className="text-sky-400 hover:underline cursor-pointer font-medium" onClick={() => handleModeSwitch("sandbox")}>Developer Sandbox</b> mode to immediately test registration & database capabilities!
              </p>
            ) : (
              <p className="mt-1 text-[#94A3B8]">
                An issue was encountered loading resources from the sandbox database. The system is operating seamlessly with a secure offline cache fallback in the meantime.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Expanded Security Rules Instructions Drawer */}
      {isExpanding && activeMode === "production" && (
        <div className="mt-4 pt-4 border-t border-slate-800 animate-in slide-in-from-top-2 duration-300">
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
            <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              Configure Firestore Rules to enable Production storage
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              To store patient registrations, medical appointments, and prescriptions in your custom Firebase Console, you must allow public reads/writes during development. Follow these steps:
            </p>
            
            <ol className="list-decimal text-xs text-slate-300 ml-4 mt-3.5 space-y-2">
              <li>Open your <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-sky-400 hover:underline font-medium">Firebase Console</a> and select your project <b>graduation-project-ed7ea</b>.</li>
              <li>Navigate to the <b>Firestore Database</b> section from the sidebar navigation.</li>
              <li>Click on the <b>"Rules"</b> tab at the top of the interface.</li>
              <li>Replace the existing rules with the template below and click <b>Publish</b>:</li>
            </ol>

            <div className="relative mt-4 bg-black/40 p-3 rounded-lg border border-slate-700/60 font-mono text-[11px] text-emerald-400">
              <button 
                id="copy-firebase-rules-btn"
                onClick={copyRules}
                className="absolute top-2 right-2 p-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded font-sans text-xs flex items-center gap-1 border border-slate-700 transition"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <pre className="overflow-x-auto whitespace-pre">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /\${document=**} {
      allow read, write: if true;
    }
  }
}`}
              </pre>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-[11px] text-slate-500 italic">
                *Note: You may also need to enable the "Email/Password" provider in your Firebase Console &gt; Authentication &gt; Sign-in method tab.
              </p>
              <button
                id="close-instructions-btn"
                onClick={() => setIsExpanding(false)}
                className="text-xs hover:text-slate-100 text-slate-400 transition"
              >
                Dismiss Instructions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

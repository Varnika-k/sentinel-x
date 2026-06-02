import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, ChevronRight, ChevronLeft, Target, Shield, Activity, Sparkles, 
  Terminal, Server, CheckCircle2, Bookmark, Flame, Zap
} from 'lucide-react';

interface GuidedOnboardingTourProps {
  onClose: () => void;
  onEnterSimulation: () => void;
  onEnterCommandCenter: () => void;
}

export function GuidedOnboardingTour({ onClose, onEnterSimulation, onEnterCommandCenter }: GuidedOnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const steps = [
    {
      title: 'OPERATIONAL COMMAND BRIEFING',
      subtitle: 'CONTEXT, MISSION, & VISION',
      icon: Target,
      tag: 'BRIEFING_v4',
      content: (
        <div className="space-y-4 font-sans text-slate-300 leading-relaxed text-[11.5px]">
          <div className="bg-[#11162d]/50 p-3.5 border border-indigo-500/15 rounded-lg space-y-2">
            <span className="font-mono text-[9px] text-indigo-400 font-bold tracking-widest uppercase block border-b border-indigo-500/5 pb-1">Primary Mandate</span>
            <p className="italic">"SentinelX is not another dashboard. It is a unified, business-aware cyber operating and orchestration platform coordinating continuous compliance, structural resilience, and sub-second lateral breach containment."</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <h5 className="font-mono text-[10px] text-slate-200 font-black tracking-wider uppercase flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
                The Secure Mission
              </h5>
              <p className="text-[11px] text-slate-400">Bridge high-volume endpoint syslogs into strategic lines of business risk metrics, protecting confidential data without disrupting critical customer-facing transactions.</p>
            </div>
            <div className="space-y-1">
              <h5 className="font-mono text-[10px] text-slate-200 font-black tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                The Resilient Vision
              </h5>
              <p className="text-[11px] text-slate-400">Achieve completely autonomous, self-healing enterprise network topologies where zero-day outbreaks are contained inside micro-quarantine boundaries before lateral infection begins.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'TACTICAL SUBSYSTEM WALKTHROUGH',
      subtitle: 'THE THREE STAGES OF CYBER CONVERGENCE',
      icon: Server,
      tag: 'DATA_PIPELINES',
      content: (
        <div className="space-y-3.5 font-sans text-slate-400 leading-relaxed text-[11.5px]">
          <p className="text-slate-300">Our enterprise operating model decouples ingestion from decisioning, processing high-throughput telemetry streams through three clear system stages:</p>
          
          <div className="space-y-2 bg-[#020511] p-3 rounded-lg border border-border/10 font-sans">
            <div className="flex gap-3 items-start">
              <div className="w-5 h-5 rounded-full bg-indigo-950 flex items-center justify-center font-mono text-[10px] text-indigo-400 shrink-0 font-bold border border-indigo-500/20">1</div>
              <div>
                <strong className="text-slate-200 block text-[11px] uppercase font-mono">Sensory Layer Ingestion</strong>
                <span className="text-[11px]">Suricata parses perimeter network protocols while Falco agents capture system calls on host servers, fusing logs onto standard Redis streams.</span>
              </div>
            </div>

            <div className="flex gap-3 items-start border-t border-border/5 pt-2">
              <div className="w-5 h-5 rounded-full bg-indigo-950 flex items-center justify-center font-mono text-[10px] text-indigo-400 shrink-0 font-bold border border-indigo-500/20">2</div>
              <div>
                <strong className="text-slate-200 block text-[11px] uppercase font-mono">Topological Risk Graphing</strong>
                <span className="text-[11px]">The Graph Engine processes links, dependencies, owners, and clearances, updating general health ratings and calculating SLA exposure (USD/hour).</span>
              </div>
            </div>

            <div className="flex gap-3 items-start border-t border-border/5 pt-2">
              <div className="w-5 h-5 rounded-full bg-indigo-950 flex items-center justify-center font-mono text-[10px] text-indigo-400 shrink-0 font-bold border border-indigo-500/20">3</div>
              <div>
                <strong className="text-slate-200 block text-[11px] uppercase font-mono">Autonomic Containment</strong>
                <span className="text-[11px]">If policy thresholds are breached, the Autonomous Response layers automatically sever connections, quarantining infected nodes within milliseconds.</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'STANDARD ANALYST TRIAGE DRILL',
      subtitle: 'HOW TO MONITOR, SCANS, AND QUARANTINE INTRUSIONS',
      icon: Terminal,
      tag: 'SIMULATOR_WORKFLOW',
      content: (
        <div className="space-y-4 font-sans text-slate-300 leading-normal text-[11.5px]">
          <p className="text-slate-400">When security sensors detect network or kernel violations, follow this standard triage protocol inside the Battlespace simulator:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-[#121c43]/40 border border-indigo-500/15 p-3 rounded-lg space-y-1">
              <span className="font-mono text-[8px] text-indigo-400 font-bold block uppercase">Step 01: Audit Alerts</span>
              <p className="text-[11px] text-slate-400">Watch the bottom Activity Register feed for incoming Falco anomalous system call warnings or Suricata signature breaches.</p>
            </div>

            <div className="bg-[#121c43]/40 border border-indigo-500/15 p-3 rounded-lg space-y-1">
              <span className="font-mono text-[8px] text-indigo-400 font-bold block uppercase">Step 02: Scan Server</span>
              <p className="text-[11px] text-slate-400">Click any blinking red/orange server node. Review the diagnosis card listing software versions, owners, and clearances.</p>
            </div>

            <div className="bg-[#121c43]/40 border border-indigo-500/15 p-3 rounded-lg space-y-1">
              <span className="font-mono text-[8px] text-indigo-400 font-bold block uppercase">Step 03: Isolate Edge</span>
              <p className="text-[11px] text-slate-400">Under server controls, clicking **Neural Isolation** severs edge links, confining threats without affecting adjacent nodes.</p>
            </div>
          </div>

          <div className="p-3 bg-[#030614] border border-dashed border-[#00ffd1]/20 rounded-lg flex items-center gap-3 text-slate-400">
            <Flame className="w-6 h-6 text-[#00ffd1] shrink-0 animate-pulse" />
            <p className="text-[10px]"><strong>PRO TIP:</strong> If things spiral out of hand, toggle "Auto-Remediation" mode in the control desk to let our autonomic engines handle quarantines automatically.</p>
          </div>
        </div>
      )
    },
    {
      title: 'OPERATOR ROLE SELECTION',
      subtitle: 'CHOOSE YOUR MISSION PARAMETERS',
      icon: Shield,
      tag: 'ENGAGE_PORTAL',
      content: (
        <div className="space-y-4 font-sans leading-relaxed text-slate-300">
          <p className="text-slate-400 text-[11.5px]">Your onboarding orientation is now complete. Select your target entry vector below to synchronize your active sessions:</p>
          
          <div className="grid grid-cols-2 gap-3.5">
            <button 
              onClick={() => {
                onClose();
                onEnterSimulation();
              }}
              className="p-4 bg-[#050a22] border border-indigo-500/25 rounded-xl hover:border-indigo-400/50 hover:bg-[#070e30]/50 transition text-left space-y-1.5 focus:outline-none cursor-pointer group"
            >
              <div className="flex justify-between items-center">
                <span className="font-mono text-[9px] text-[#00ffd1] font-bold block uppercase tracking-wider">01 // OPERATIONS MODE</span>
                <span className="text-[10px] group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <h5 className="font-black text-white text-[12px] uppercase font-mono tracking-wide">Launch Sandbox Twin</h5>
              <p className="text-[11px] text-slate-400 leading-snug">Test security boundaries. Select scenario packages, trigger intrusions and dry-run isolation playbooks in our real-time simulator.</p>
            </button>

            <button 
              onClick={() => {
                onClose();
                onEnterCommandCenter();
              }}
              className="p-4 bg-[#050a22] border border-indigo-500/25 rounded-xl hover:border-indigo-400/50 hover:bg-[#070e30]/50 transition text-left space-y-1.5 focus:outline-none cursor-pointer group"
            >
              <div className="flex justify-between items-center">
                <span className="font-mono text-[9px] text-indigo-400 font-bold block uppercase tracking-wider">02 // STRATEGIC MODE</span>
                <span className="text-[10px] group-hover:translate-x-1 transition-transform">→</span>
              </div>
              <h5 className="font-black text-white text-[12px] uppercase font-mono tracking-wide">Enter Command Center</h5>
              <p className="text-[11px] text-slate-400 leading-snug">Monitor global health indexes. Track automated compliance drifts, SLA exposures, financial loss rates, and access intelligence records.</p>
            </button>
          </div>
        </div>
      )
    }
  ];

  const currentData = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-void/90 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-[#04081c] border border-indigo-500/30 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.15)] flex flex-col max-h-[85vh]">
        {/* Header Block */}
        <div className="p-5 border-b border-border/10 bg-[#060c28] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <currentData.icon className="w-5 h-5 text-indigo-400 animate-pulse" />
            <div>
              <span className="text-[8px] text-indigo-400 font-mono tracking-widest font-black uppercase bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-500/20">{currentData.tag}</span>
              <h3 className="font-bold text-[11px] text-white font-mono uppercase tracking-wider mt-1">{currentData.title}</h3>
              <p className="text-[9px] text-slate-500 font-mono tracking-wider uppercase mt-px">{currentData.subtitle}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/5 rounded border border-transparent hover:border-border/10 text-slate-500 hover:text-white transition"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-[#030615] relative custom-scrollbar">
          {/* Subtle background grid scanlines */}
          <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none" />
          <div className="relative z-10">
            {currentData.content}
          </div>
        </div>

        {/* Footer Navigation controls */}
        <div className="p-4 bg-[#060c28] border-t border-border/10 flex justify-between items-center h-16">
          <div className="flex gap-1">
            {steps.map((_, idx) => (
              <span 
                key={idx} 
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep ? 'bg-[#00ffd1] w-4' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-4 py-1.5 bg-transparent text-slate-400 border border-border/20 text-[9px] font-mono hover:text-white hover:border-slate-500 rounded transition flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft size={12} />
                BACK
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="px-4 py-1.5 bg-indigo-600 text-white border border-indigo-400 text-[9px] font-mono font-bold hover:bg-indigo-500 rounded transition flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.3)]"
              >
                CONTINUE
                <ChevronRight size={12} />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-5 py-1.5 bg-[#00ffd1] text-[#030615] border border-emerald-400 text-[9px] font-mono font-black hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] rounded transition cursor-pointer uppercase"
              >
                Acknowledge & Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

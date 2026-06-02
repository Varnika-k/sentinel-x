import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Lock, Activity, Users, Zap, Search, ArrowRight, Server, Brain, 
  Cpu, Network, FileText, Terminal as TerminalIcon, Eye, Globe, ChevronRight, 
  ShieldAlert, Download, RotateCcw, Target, ShieldOff, HelpCircle, Sparkles, BookOpen, CheckCircle2
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

// Core Subcomponents Imports
import { GuidedOnboardingTour } from '../features/GuidedOnboardingTour';
import { InteractiveArchitectureExplorer } from '../features/InteractiveArchitectureExplorer';
import { CapabilitiesCatalog } from '../features/CapabilitiesCatalog';
import { CompetitivePositioning } from '../features/CompetitivePositioning';
import { FeatureDiscoverySystem } from '../features/FeatureDiscoverySystem';

export interface LandingPageProps {
  onEnterSimulation: () => void;
  onEnterCommandCenter: () => void;
  onOpenManual: () => void;
  operatorRole?: string;
  activeTenant?: string;
}

export function LandingPage({ 
  onEnterSimulation,
  onEnterCommandCenter,
  onOpenManual,
  operatorRole = 'Administrator',
  activeTenant = 'CORE_INTEL_US_EAST'
}: LandingPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroCanvasRef = useRef<HTMLCanvasElement>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [selectedManual, setSelectedManual] = useState<string>('getting-started');

  // Hero Canvas Particle Animation (Real-time network graph simulation)
  useEffect(() => {
    const canvas = heroCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const nodes: any[] = [];
    for (let i = 0; i < 40; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.5 + 0.5,
        color: i % 2 === 0 ? '#6366f1' : '#00FFD1'
      });
    }

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, width, height);

      nodes.forEach((node, i) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dist = Math.hypot(node.x - other.x, node.y - other.y);
          if (dist < 180) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.08 * (1 - dist / 180)})`;
            ctx.stroke();
          }
        }
      });
      requestAnimationFrame(animate);
    }

    animate();
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const manualFiles = [
    {
      id: 'getting-started',
      title: 'Getting Started Guide',
      subtitle: 'INITIAL ACCESS & INTERFACE NAVIGATION',
      content: `Welcome to the SentinelX Operational Orientation. This module outlines initial systems access, layout partitioning, and navigational configurations:

1. INITIAL ACCESS & LOG IN
  * Access Terminal: Power up standard local or container hosts, matching the port boundaries (usually http://localhost:3000).
  * Session Synchronization: Pick your active role parameter (e.g. Administrator, Auditor, Analyst) and choose your target active Tenant directory (e.g. CORE_INTEL). Click "Initialize Session" to enter.

2. PORTAL SEGMENTATION
  * Landing Hub Explorer: The tactical home view compiling system metrics, capabilities tax, competitive grids, and structural documentation.
  * Sandbox Twin Simulator: The active cyber operations playground where operators launch malware outbreaks to stress-test firewall boundaries.
  * Command Oversight Center: The executive glass-pane monitoring persistent financial loss rates (USD/hr), SLA metrics, compliance logs, and employee contacts.

3. COGNITIVE HUD SECTIONS
  * Command Console: Real-time network matrices detailing physical packet transactions between servers.
  * AI Diagnostics Terminal: Continuous summaries explaining how current breaches occurred and steps required to restore security.`
    },
    {
      id: 'operator-guide',
      title: 'Operator Guide',
      subtitle: 'SIMULATION PHYSICS & DEFENSE CONFIGS',
      content: `This operations guide defines guidelines for running attack campaigns and configuring threat parameters inside the Sandbox Twin Simulator:

1. OPERATING CYBER SIMULATIONS
  * Accessing Sandbox: From the Landing page, click the prominent "LAUNCH BATTLESPACE" action.
  * Choosing Campaigns: Select preset campaigns (e.g., Ransomware outbreak on core databases, DDoS capacity floods on boundary routers).

2. TRACKING DATA PATHS
  * White Packet Arcs: Nominal high-tempo system communication.
  * Blinking Red Alert Panels: Active systems under compromised siege.
  * Isolated Blue Cells: Quarantined nodes safely severed from topological endpoints to contain lateral spread.

3. CONFIGURING PARAMETERS
  * Simulation Speed: Shift speeds (0.5x, 1x, 2x) to test stealth intrusions vs extreme volume storms.
  * Spread Velocity: Tweak malware infection speeds to model novel Zero-Day lateral movements.
  * Reset Sandbox: Revert the network topology graph to nominal baseline states (all nodes set to Green).`
    },
    {
      id: 'analyst-guide',
      title: 'Analyst Guide',
      subtitle: 'INCIDENT ANOMALY DETECTION & MANUAL TRIAGE',
      content: `This SOP details standard triaging protocols for security intelligence analysts seeking to isolate lateral infection streams:

1. SPOTTING ADVERSARIAL DRIFT
  * Activity Panel Ingest: Constantly monitor the bottom Activity log register. Look for syslog flags marked Suricata or Falco.
  * Target Server Diagnosis: Click any orange (Warning) or red (Compromised) host box.

2. RUN DEEP NETWORK SCANS
  * Review the compiled host details card:
    - Software Patch Indexes: Exposes deprecated bundles or outdated libraries.
    - Owner Credentials Level: Checks directories to trace which administrator is registered.
    - Direct Linked Neighbors: Highlights connected downstream dependencies.

3. INITIATE CELL NEURAL ISOLATION
  * Quarantine Mandate: Click "INITIATE NEURAL ISOLATION" on the triage command drawer.
  * Containment Verification: The node turns Deep Blue, all its inter-node paths are immediately severed on the map, safeguarding sensitive assets from lateral extraction.`
    },
    {
      id: 'executive-guide',
      title: 'Executive Guide',
      subtitle: 'BUSINESS SLA & FINANCIAL IMPACT MONITORING',
      content: `This high-altitude handbook is customized for Chief Information Security Officers (CISOs), risk officers, and enterprise directors:

1. TRACING STRATEGIC BUSINESS IMPACT
  * Uptime Index: Monitor general indicators summarizing Corporate operational health and zero-trust postures.
  * Financial Damage Estimates: If major payroll or production servers are isolated, the Enterprise OS multiplies hourly outages to compile a "USD/Hour Financial Impact Score."

2. AI REASONING AUDITS
  * Semantic Summaries: In the AI Reasoning tab, read concise strategic blocks compiled by Gemini explaining vulnerabilities and estimated liabilities.
  * Forensic History: Review the historical directory to audit administrative action lists and incident rollbacks for regulatory compliance board meetings.`
    },
    {
      id: 'governance-guide',
      title: 'Governance Guide',
      subtitle: 'ZERO-TRUST BOUNDARIES & COMPLIANCE POSTURES',
      content: `Auditing guidelines for verifying compliance structures and configurations against legislative-corporate criteria:

1. ZERO-TRUST TOPOLOGY CHECKPOINTS
  * Path Segmentation Auditing: Continuous checks verifying that public perimeter hosts do not link directly to core payroll or backup databases.
  * Software drift indexes: Scan version indices comparing active cluster host configs against the central security baseline directories.

2. ADJUSTING POLICIES
  * Access Control Deck: Toggle between audited security depths (e.g. relaxed, normal, ironclad).
  * Signature validations: Audit administrators clearances directories to catch privilege escalations.`
    },
    {
      id: 'deployment-guide',
      title: 'Deployment Guide',
      subtitle: 'AGENT BOOTSTRAPPING & SYS STRUCTURING',
      content: `Technical documentation detailing how to configure SentinelX Ingest Agents across live networks:

1. PREREQUISITES
  * Standard OS platform: CentOS 8+, Ubuntu 20.04+, or Windows Server.
  * Execution libraries: Node.js v18+, Redis v6+ database structures.

2. HOST-LEVEL AGENT CONFIGURATIONS
  * Falco Docker Ingestion: Installs kernel stream listeners to track directories configuration writes.
  * Suricata Network Probes: Monitors packet queries on border load balancers, forwarding normalized events onto Redis queues.

3. LOCAL DEPLOYMENT COMMANDS
  * Package setup: Run 'npm install' inside root workspace.
  * Launch server: Compile via 'npm run build' followed by 'npm start' to boot Express & Vite channels on port 3000.`
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting Guide',
      subtitle: 'DIAGNOSTIC WORKFLOWS & RESOLUTIONS',
      content: `Runbook detailing diagnostic solutions for telemetry freezes and error registers:

1. OFFLINE DAEMON DIALOGS
  * Symptom: Monitoring widgets display static or offline elements.
  * Resolution: Open bottom "Diagnostics Drawer". Ensure local telemetry thread signals are dispatching regular Heartbeat pulses.

2. PERMIT RESOLUTIONS (FIREBASE ERROR)
  * Symptom: Simulation logs failing to save due to database permission restrictions.
  * Resolution: Verify active operator profiles. Confirm that local firestore rules conform to the standard security rule definitions.

3. ISOLATED NODE RECOVERIES (BLUE HOST RESTORE)
  * Symptom: A server host node remains Blue and offline after containment.
  * Resolution: Click the node, select "RESTORE NETWORK EDGE" in controls. This will re-attach the surrounding routes, restoring nominal Green status.`
    }
  ];

  const currentManualFile = manualFiles.find(m => m.id === selectedManual) || manualFiles[0];

  return (
    <div ref={containerRef} className="bg-void text-text-primary px-px select-none relative pb-1">
      {/* 1. Nav Area */}
      <nav className="fixed top-0 left-0 right-0 z-[100] h-20 border-b border-border/15 bg-void/85 backdrop-blur-xl flex items-center justify-between px-6 md:px-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent-cyan animate-pulse" />
            <div className="font-display font-black text-[13px] tracking-[4px] text-white uppercase font-heading">
              SENTINEL <span className="text-accent-cyan">//</span> X
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 px-2 rounded text-[8px] font-mono leading-none">
            <span className="text-[#00ffd1] font-bold">{operatorRole.toUpperCase()}</span>
            <span className="text-slate-500">@</span>
            <span className="text-white font-bold">{activeTenant.replace(/_/g, ' ')}</span>
          </div>
        </div>
        
        <div className="hidden lg:flex items-center gap-10 font-mono text-[9px]">
          {[
            { label: 'PLATFORM', id: '#platform' },
            { label: 'SUB-SYSTEMS', id: '#interactive-architecture' },
            { label: 'CAPABILITIES', id: '#capabilities' },
            { label: 'STRATEGIC MATRIX', id: '#strategic-matrix' },
            { label: 'TAXONOMY INDEX', id: '#taxonomy-index' },
            { label: 'MANUALS', id: '#manual-room' },
            { label: 'ROADMAP', id: '#roadmap-timeline' },
          ].map(link => (
            <a 
              key={link.label}
              href={link.id}
              className="tracking-[2px] text-slate-400 hover:text-[#00ffd1] transition-colors uppercase font-medium"
            >
              {link.label}
            </a>
          ))}
        </div>

        <button 
           onClick={() => document.getElementById('manual-room')?.scrollIntoView({ behavior: 'smooth' })}
           className="px-5 py-2 border border-[#00ffd1]/30 text-[#00ffd1] font-display text-[9px] tracking-[3px] font-bold hover:bg-[#00ffd1]/10 transition-colors uppercase rounded"
        >
          VIEW MANUALS
        </button>
      </nav>

      {/* 2. Panoramic Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 overflow-hidden px-6">
        <canvas ref={heroCanvasRef} className="absolute inset-0 z-0 opacity-30 pointer-events-none" />
        
        <div className="relative z-10 text-center max-w-5xl space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-mono text-[8px] md:text-[9px] tracking-[7px] text-[#00ffd1] uppercase"
          >
            // UNIFIED ADVERSARIAL SIMULATION & AUTONOMIC COORDINATION
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-sans font-black text-[clamp(36px,8vw,80px)] leading-[0.95] text-white tracking-tighter uppercase"
          >
            SENTINEL <span className="text-[#00ffd1]">X</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-mono text-[9px] md:text-[11px] tracking-[5px] text-indigo-400 uppercase"
          >
            ENTERPRISE RESILIENCE OPERATING SYSTEM
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-sans text-[12px] md:text-[13px] leading-relaxed text-slate-400 max-w-2xl mx-auto tracking-wide font-medium"
          >
            SentinelX is the unified orchestration, governance, operational intelligence, and decision model coordinating enterprise cybersecurity. It merges real-time telemetry from Suricata and Falco agents with dynamic risk-scoring models, offering proactive structural simulations and sub-second automated quarantine containment.
          </motion.p>

          {/* Epic Command Interface Buttons Grid */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-4 pt-4"
          >
             <button 
                onClick={onEnterSimulation}
                className="px-8 py-4 bg-indigo-600 border border-indigo-400 text-white font-mono font-bold text-[10px] tracking-[3px] hover:bg-indigo-500 rounded transition duration-200 cursor-pointer shadow-[0_0_25px_rgba(99,102,241,0.35)]"
             >
               LAUNCH SANDBOX TWIN
             </button>
             <button 
                onClick={onEnterCommandCenter}
                className="px-8 py-4 bg-[#050a22] border border-[#00ffd1]/30 text-[#00ffd1] font-mono font-bold text-[10px] tracking-[3px] hover:bg-[#00ffd1]/10 rounded transition duration-200 cursor-pointer"
             >
               ENTER COMMAND SYSTEM
             </button>
             <button 
                onClick={() => setShowOnboarding(true)}
                className="px-8 py-4 bg-emerald-950/40 border border-[#00ffd1]/20 text-[#00ffd1] font-mono font-bold text-[10px] tracking-[3px] hover:bg-emerald-950/60 rounded transition duration-200 cursor-pointer flex items-center gap-1.5"
             >
               <Sparkles className="w-4 h-4 text-[#00ffd1]" />
               START ONBOARDING
             </button>
          </motion.div>

          {/* High-Contrast Hero Stats */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 max-w-4xl mx-auto border-t border-border/15"
          >
            {[
              { val: '21 PLATFORM SYSTEM CAPABILITIES', label: 'TAXONOMY CATALOG' },
              { val: '10 CORE SUBSYSTEM LAYERS', label: 'PIPELINE ARCHITECTURE' },
              { val: '7 MASTER CONSOLE MANUALS', label: 'OPERATIONS RUNBOOKS' },
              { val: 'PHASES 01-05 INTEL VECTOR', label: 'ROADMAP TIMELINE' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-[#04081c]/60 border border-border/10 p-3 rounded-lg text-center flex flex-col justify-center h-16">
                <span className="font-mono font-black text-[10px] text-white tracking-wider uppercase">{stat.val}</span>
                <span className="font-mono text-[8px] tracking-[1.5px] text-slate-500 mt-1 uppercase font-bold">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3. Narrative Platform Panel */}
      <section id="platform" className="py-24 bg-[#020512] border-y border-border/10">
         <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
               <div className="bg-[#030615] border border-border/15 p-6 rounded-xl space-y-4 flex flex-col justify-between hover:border-indigo-500/20 transition">
                  <div className="space-y-2">
                     <span className="font-mono text-[8px] tracking-[3px] text-[#00ffd1] uppercase block">// REAL-TIME MULTI-SOURCE INGEST</span>
                     <h3 className="font-sans text-[18px] font-bold text-white tracking-tight uppercase">TELEMETRY FUSION</h3>
                  </div>
                  <p className="font-sans text-[11.5px] leading-relaxed text-slate-400">
                     Fuses low-level system-calls and socket connections from Suricata and Falco daemons into a standardized messaging event broker pool, eliminating silos and capturing early indicators of lateral movement.
                  </p>
               </div>
               
               <div className="bg-[#030615] border border-border/15 p-6 rounded-xl space-y-4 flex flex-col justify-between hover:border-indigo-500/20 transition">
                  <div className="space-y-2">
                     <span className="font-mono text-[8px] tracking-[3px] text-indigo-400 uppercase block">// CORPORATE RELATION SCHEMAS</span>
                     <h3 className="font-sans text-[18px] font-bold text-white tracking-tight uppercase">DEPENDENCY & OWNERSHIP</h3>
                  </div>
                  <p className="font-sans text-[11.5px] leading-relaxed text-slate-400">
                     Binds logical server nodes directly to personnel records, business lines, and database dependencies. Exposes critical application chains and outlines owner clearances instantly during triage.
                  </p>
               </div>

               <div className="bg-[#030615] border border-border/15 p-6 rounded-xl space-y-4 flex flex-col justify-between hover:border-indigo-500/20 transition">
                  <div className="space-y-2">
                     <span className="font-mono text-[8px] tracking-[3px] text-emerald-400 uppercase block">// SLA RISK CALCULATIONS</span>
                     <h3 className="font-sans text-[18px] font-bold text-white tracking-tight uppercase">ENTERPRISE STATE ENGINE</h3>
                  </div>
                  <p className="font-sans text-[11.5px] leading-relaxed text-slate-400">
                     Continually audits security vulnerabilities and translates host outage data directly into real-time business loss metrics (USD/Hr), giving risk supervisors an analytical basis for quarantine decisions.
                  </p>
               </div>
            </div>
         </div>
      </section>

      {/* 4. Subsystem Explorer Section */}
      <section className="py-24 bg-[#030615] relative">
         <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
              <span className="font-mono text-[8px] tracking-[4px] text-indigo-400 uppercase">// FULL-STACK DATA FLOWS</span>
              <h2 className="font-sans text-2xl font-black text-white uppercase tracking-tight">PLATFORM INTERACTIVE BLUEPRINT</h2>
              <p className="text-[11px] text-slate-500 font-mono">Walk through SentinelX layers and review the input-output routing pipeline schemas.</p>
            </div>
            {/* Renders System Sub-architectures */}
            <InteractiveArchitectureExplorer />
         </div>
      </section>

      {/* 5. Comprehensive Capabilities Catalog */}
      <section id="capabilities" className="py-24 bg-[#020512] border-y border-border/10">
         <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
              <span className="font-mono text-[8px] tracking-[4px] text-[#00ffd1] uppercase">// TACTICAL CAPABILITIES MATRIX</span>
              <h2 className="font-sans text-2xl font-black text-white uppercase tracking-tight">COMPREHENSIVE CAPABILITIES INDEX</h2>
              <p className="text-[11px] text-slate-500 font-mono">Examine the 21 security, compliance, search, and AI core algorithms powering the suite.</p>
            </div>
            {/* Renders dynamic capability tags */}
            <CapabilitiesCatalog />
         </div>
      </section>

      {/* 6. Strategic Competitive Matrix */}
      <section id="strategic-matrix" className="py-24 bg-[#030615]">
         <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
              <span className="font-mono text-[8px] tracking-[4px] text-[#00ffd1] uppercase">// INDUSTRY POSITIONING</span>
              <h2 className="font-sans text-2xl font-black text-white uppercase tracking-tight">COMPETITIVE STAMP COMPARE</h2>
              <p className="text-[11px] text-slate-500 font-mono">Verify our shared capabilities, differentiators, and strategic advantages vs Microsoft, Splunk, Wiz, and EDR suites.</p>
            </div>
            {/* Renders Competitive Matrix Grid */}
            <CompetitivePositioning />
         </div>
      </section>

      {/* 7. Feature Discovery Taxonomy Node */}
      <section id="taxonomy-index" className="py-24 bg-[#020512] border-t border-border/10">
         <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
              <span className="font-mono text-[8px] tracking-[4px] text-indigo-400 uppercase">// CENTRALIZED SYSTEM ENVOYS</span>
              <h2 className="font-sans text-2xl font-black text-white uppercase tracking-tight">FEATURE DISCOVERY HUB</h2>
              <p className="text-[11px] text-slate-500 font-mono">Locate workflows, integration paths, simulation cases, and directory modules based on targeted query attributes.</p>
            </div>
            {/* Renders Discovery Index */}
            <FeatureDiscoverySystem />
         </div>
      </section>

      {/* 8. Interactive Command Manual Reader (Getting Started to Troubleshoot Runbooks) */}
      <section id="manual-room" className="py-24 bg-[#030615] border-t border-border/10">
         <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
              <span className="font-mono text-[8px] tracking-[4px] text-[#00ffd1] uppercase">// SECURE DOCUMENTATION PARLOUR</span>
              <h2 className="font-sans text-2xl font-black text-white uppercase tracking-tight">INTEGRATED ROADMAPS & MANUAL READERS</h2>
              <p className="text-[11px] text-slate-500 font-mono">Inspect regulatory procedures, operations manual runbooks, deployment guides, and disaster recoveries.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 bg-[#020511] border border-border/15 rounded-2xl p-6">
              {/* Document Sidebar Selector */}
              <div className="lg:col-span-1 space-y-1 bg-[#04081c] p-3 rounded-xl border border-border/10">
                <span className="font-mono text-[8px] text-slate-500 font-bold block mb-2 px-1 uppercase">7 CONSOLE MANUALS</span>
                {manualFiles.map(file => (
                  <button
                    key={file.id}
                    onClick={() => setSelectedManual(file.id)}
                    className={cn(
                      "w-full text-left p-2.5 rounded font-mono text-[9px] outline-none flex items-center justify-between transition cursor-pointer border",
                      selectedManual === file.id 
                        ? 'bg-indigo-950/40 text-indigo-300 border-indigo-400/40' 
                        : 'bg-transparent border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-100'
                    )}
                  >
                    <span className="truncate uppercase font-bold">{file.title}</span>
                    <ChevronRight size={12} className={cn("transition-transform", selectedManual === file.id ? 'translate-x-[2px]' : '')} />
                  </button>
                ))}
              </div>

              {/* Console Document Terminal Viewer */}
              <div id="console-terminal-viewer" className="lg:col-span-3 bg-[#030614] border border-border/30 rounded-xl p-5 md:p-7 flex flex-col justify-between h-[360px] overflow-hidden">
                <div className="flex items-center justify-between border-b border-border/10 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <div>
                      <span className="text-[8px] text-slate-500 font-mono block">SYS_SECURITY_DOCUMENT</span>
                      <h4 className="text-[11px] font-black text-white font-mono uppercase">{currentManualFile.title}</h4>
                      <p className="text-[8px] text-indigo-400 font-mono uppercase mt-0.5">{currentManualFile.subtitle}</p>
                    </div>
                  </div>
                  <span className="font-mono text-[8px] px-1.5 py-0.5 bg-indigo-950/40 border border-indigo-500/20 text-indigo-400 rounded">v4.4.1</span>
                </div>

                <div className="flex-1 overflow-y-auto text-[11px] text-slate-300 leading-normal font-sans py-1 pr-1 custom-scrollbar whitespace-pre-wrap">
                  {currentManualFile.content}
                </div>

                <div className="border-t border-border/10 pt-3 flex justify-between items-center text-[9px] text-slate-500 font-mono">
                  <span>DIRECTORY: /docs/manual/{currentManualFile.id}.md</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    VERIFIED COMPLIANT
                  </span>
                </div>
              </div>
            </div>
         </div>
      </section>

      {/* 9. High-Contrast Strategic Roadmap Timeline */}
      <section id="roadmap-timeline" className="py-24 bg-[#020512]">
         <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="text-center max-w-2xl mx-auto mb-20 space-y-2">
              <span className="font-mono text-[8px] tracking-[4px] text-indigo-400 uppercase">// ROADMAP FORWARD</span>
              <h2 className="font-sans text-2xl font-black text-white uppercase tracking-tight">SENTINELX FIVE-PHASE INTEL TIMELINE</h2>
              <p className="text-[11px] text-slate-500 font-mono">Strategic milestones defining the future of self-healing cyber boundaries.</p>
            </div>

            <div className="relative pl-8 md:pl-12 space-y-10 max-w-4xl mx-auto">
               <div className="absolute left-[3px] top-4 bottom-4 w-px bg-border/20" />
               {[
                 { title: 'PHASE 01: SIMULATOR STAGES FOUNDATION', tag: 'DEPLOYED', desc: 'Core server modeling and interactive graph map topologies rendering SVG connection arcs.' },
                 { title: 'PHASE 02: TELEMETRY & INGEST NORMALIZATION', tag: 'DEPLOYED', desc: 'Normalized syslog streaming, integrating Suricata boundary signatures and Falco daemon watchers.' },
                 { title: 'PHASE 03: BUSINESS CONVERGENCE & RISK SCORINGS', tag: 'DEPLOYED / BETA', desc: 'Exposing SLA outage damages per hour inside the Enterprise OS and binding employees directory clearances.' },
                 { title: 'PHASE 04: COGNITIVE AI REASONINGS STUDIOS', tag: 'INTEGRATED', desc: 'Gemini NLP log consolidation, producing summary logs and procedural advisories inside diagnostic hubs.' },
                 { title: 'PHASE 05: AUTONOMIC LOCALIZED QUARANTINES', tag: 'ENFORCING', desc: 'Sub-second micro-segment isolation playbooks to decouple nodes automatically when breaches are verified.' },
               ].map((phase, i) => (
                 <div key={phase.title} className="relative group">
                    <div className="absolute -left-[11px] top-1.5 w-2 h-2 rotate-45 border border-indigo-400 bg-void z-10 group-hover:bg-[#00ffd1] group-hover:border-[#00ffd1] transition-colors" />
                    <div className="space-y-1 font-sans">
                       <span className="font-mono text-[8px] tracking-[2px] text-[#00ffd1] px-1.5 py-0.5 bg-[#0a181b] border border-emerald-500/20 uppercase rounded">[{phase.tag}]</span>
                       <h4 className="font-mono font-bold text-[12px] text-white uppercase tracking-tight pt-1">{phase.title}</h4>
                       <p className="text-[11px] text-[#94a3b8] max-w-3xl leading-relaxed">{phase.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* 10. Panorama Bottom CTA Block */}
      <section className="py-32 bg-[#020511] relative overflow-hidden flex items-center justify-center border-t border-border/10">
          <div className="absolute inset-0 pointer-events-none opacity-[0.02] overflow-hidden flex items-center justify-center">
             <div className="font-sans text-[clamp(80px,25vw,300px)] font-black text-white whitespace-nowrap select-none">SENTINEL X</div>
          </div>

          <div className="relative z-10 text-center px-6 space-y-6">
             <h2 className="font-sans font-black text-[clamp(24px,4vw,44px)] text-white tracking-tight mb-4 uppercase">
               READY TO OPERATE THE BATTLESPACE?
             </h2>
             <p className="font-sans text-[12.5px] leading-relaxed text-slate-400 max-w-xl mx-auto uppercase tracking-wide">
               Take command of corporate boundaries, simulation sandboxes, and strategic governance layers.
             </p>
             <div className="flex justify-center gap-4">
               <button 
                  onClick={onEnterSimulation}
                  className="px-10 py-5 bg-[#00ffd1] text-void font-sans font-black text-[10px] tracking-[3px] hover:shadow-[0_0_40px_rgba(0,255,209,0.4)] transition rounded cursor-pointer"
               >
                 LAUNCH SIMULATOR SANDBOX
               </button>
               <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="px-10 py-5 bg-transparent border border-border/20 hover:border-slate-400 hover:text-white transition rounded font-mono text-[9px] tracking-[2px] cursor-pointer"
               >
                 BACK TO TOP
               </button>
             </div>
          </div>
      </section>

      {/* 11. Custom Panel Footer */}
      <footer className="py-12 bg-void border-t border-border/10">
         <div className="max-w-7xl mx-auto px-6 md:px-10 text-center space-y-10">
            <div className="flex flex-col md:flex-row items-center justify-between border-b border-border/5 pb-8 gap-4">
               <div className="flex items-center gap-2">
                 <Shield className="w-5 h-5 text-[#00ffd1] opacity-60" />
                 <div className="font-display font-black text-[13px] tracking-[4px] text-white opacity-60 uppercase font-heading">
                   SENTINEL <span className="text-[#00ffd1]">//</span> X
                 </div>
               </div>

               <div className="flex gap-8 text-[9px] font-mono text-slate-500">
                  {['PLATFORM', 'SUB-SYSTEMS', 'CAPABILITIES', 'TAXONOMY INDEX'].map(link => (
                    <a key={link} href={`#${link.toLowerCase().replace(' ', '-')}`} className="hover:text-slate-200 transition-colors uppercase">
                      {link}
                    </a>
                  ))}
               </div>
            </div>

            <div className="font-mono text-[8px] tracking-[1px] text-slate-500 max-w-4xl mx-auto leading-loose uppercase">
              SENTINELX // AUTONOMOUS ENTERPRISE CYBER RESILIENCE ORCHESTRATOR // VERSION 4.4 // STANDALONE SIMULATION PLATFORM<br />
              © 2026 PROTECT THE CORE — LICENSED FOR INTEGRATION TESTING & COMPLIANCE EVALUATION
            </div>
         </div>
      </footer>

      {/* Embedded Guided Onboarding Dialog Overlay */}
      <AnimatePresence>
        {showOnboarding && (
          <GuidedOnboardingTour 
            onClose={() => setShowOnboarding(false)} 
            onEnterSimulation={onEnterSimulation}
            onEnterCommandCenter={onEnterCommandCenter}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

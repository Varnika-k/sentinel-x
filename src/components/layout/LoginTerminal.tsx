import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { 
  Shield, Activity, Cpu, Network, Database, KeyRound, Eye, Lock, 
  ShieldAlert, CheckCircle2, ArrowRight, Terminal as TerminalIcon, Users, 
  Globe, ChevronRight, Server, Brain, Compass, TrendingUp, BarChart3, 
  Layers, Zap, AlertTriangle, RefreshCw, Sliders, Download, Search, 
  FileText, Sparkles, Milestone, LineChart, BookOpen, Clock, Settings, Command
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function LoginTerminal({ onComplete }: { onComplete: (role: string, tenant: string) => void }) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedRole, setSelectedRole] = useState<string>('Administrator');
  const [selectedTenant, setSelectedTenant] = useState<string>('CORE_INTEL_US_EAST');
  const [activeCapIndex, setActiveCapIndex] = useState<number>(0);
  const [bootProgress, setBootProgress] = useState<number>(0);
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [bootFinished, setBootFinished] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Live Metric Countups for Screen 1
  const [securityScore, setSecurityScore] = useState(0);
  const [readinessScore, setReadinessScore] = useState(0);
  const [governanceScore, setGovernanceScore] = useState(0);
  const [nodeCount, setNodeCount] = useState(0);
  const [ingestRate, setIngestRate] = useState(0);

  // UTC Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Capabilities Catalog Carousel
  const capabilities = [
    {
      title: 'Enterprise Intelligence',
      icon: GraphIcon,
      desc: 'Aggregates enterprise-wide microservices, networks, and operational hierarchies to provide the C-suite with continuous, unified architectural situational awareness.',
      tag: 'COGNITIVE CORE'
    },
    {
      title: 'Identity Intelligence',
      icon: Users,
      desc: 'Links network endpoints, virtual servers, and databases with payroll records, security clearance levels, and active workforce profiles in real time.',
      tag: 'RBAC MAPPING'
    },
    {
      title: 'Governance Intelligence',
      icon: Shield,
      desc: 'Audits deployment packages, code repositories, and IAM structures against international compliance frameworks (SOC2, ISO27001, FedRAMP).',
      tag: 'CONTINUOUS REASONING'
    },
    {
      title: 'AI Reasoning',
      icon: Brain,
      desc: 'Leverages advanced neural semantics to synthesize logs, discover configuration drift, explain breach vectors, and draft precise remediation actions.',
      tag: 'GEMINI COGNITION'
    },
    {
      title: 'Digital Twin',
      icon: Layers,
      desc: 'Maintains an active, virtualized structural map of all infrastructure assets, allowing safe, sandboxed scenario testing without disrupting actual services.',
      tag: 'SIMULATION CORE'
    },
    {
      title: 'Threat Intelligence',
      icon: ShieldAlert,
      desc: 'Monitors low-level kernel event telemetry streams in real time, auto-matching Suricata payload rules and Falco system-call warnings.',
      tag: 'REAL-TIME HEURISTICS'
    },
    {
      title: 'Operational Intelligence',
      icon: TrendingUp,
      desc: 'Ingests performance statistics, calculating ongoing business impacts (outages, latency decays) in real-time USD/Hour liability indexes.',
      tag: 'SLA TRACKER'
    },
    {
      title: 'Enterprise Search',
      icon: Search,
      desc: 'Provides deep taxonomy lookup engines capable of locating container configurations, network neighbours, or asset registries via structured multi-variable queries.',
      tag: 'VECTOR SEARCH'
    },
    {
      title: 'Dependency Intelligence',
      icon: Network,
      desc: 'Traces operational dependencies across database hubs, microservers, and routing meshes to forecast blast radiuses and single points of failure.',
      tag: 'PERSISTIZED GRAPHS'
    },
    {
      title: 'Impact Simulation',
      icon: Sliders,
      desc: 'Allows security responders to trigger zero-day ransomware bursts, DDoS congestion grids, and network split-brains on virtual topographies to stress test defense modes.',
      tag: 'BATTLEFIELD STRESS'
    },
    {
      title: 'Autonomous Response',
      icon: Zap,
      desc: 'Executes sub-second cyber isolation rules, immediately quarantining compromised nodes within deep blue neural layers and severing active transport lines.',
      tag: 'AUTONOMIC DECOUPLING'
    },
    {
      title: 'Enterprise Data Fabric',
      icon: Database,
      desc: 'Maintains consistent state synchronization across all distributed clusters, operational caches, and diagnostic terminals.',
      tag: 'SECURE PERSISTENCE'
    }
  ];

  // Rotate capabilities carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCapIndex(prev => (prev + 1) % capabilities.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Screen 1: Real-time Metric Animations on Mount or Selection
  useEffect(() => {
    if (currentStep === 0) {
      let start: number | null = null;
      const duration = 1500;
      const step = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress); // Exponential ease out

        setSecurityScore(Number((ease * 94.8).toFixed(1)));
        setReadinessScore(Number((ease * 99.98).toFixed(2)));
        setGovernanceScore(Math.floor(ease * 92));
        setNodeCount(Math.floor(ease * 1482));
        setIngestRate(Math.floor(ease * 2840));

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };
      requestAnimationFrame(step);
    }
  }, [currentStep]);

  // Screen 4: Boot Engine Sequence Log Timing
  useEffect(() => {
    if (currentStep === 3) {
      setBootProgress(0);
      setBootLogs([]);
      setBootFinished(false);

      const logLines = [
        { msg: "INJECTING UNIFIED TELEMETRY INGESTION MESH...", duration: 400 },
        { msg: "CONNECTING REDIS STREAM CHANNELS & MEMORY STORE... OK", duration: 300 },
        { msg: "PRE-STAGING ZERO-TRUST COMPLIANCE REASONING ENVOYS...", duration: 500 },
        { msg: "SPAWNING DIGITAL TWIN GRAPH TOPOLOGY MESH... 100%", duration: 400 },
        { msg: "ESTABLISHING PERSISTENT ENTERPRISE DATA PERSISTENCE...", duration: 300 },
        { msg: "LAUNCHING AUTONOMIC ISOLATION PLAYBOOKS... INITIALIZED", duration: 500 },
        { msg: "SYNCHRONIZING SEMANTIC AI ADVISORY CHANNELS [GEMINI SDK]...", duration: 500 },
        { msg: "SENTINELX ENTERPRISE OPERATING SYSTEM ACTIVE // BOOT COMPLETE.", duration: 300 }
      ];

      let currentIndex = 0;
      let totalTime = 0;

      const runLog = () => {
        if (currentIndex < logLines.length) {
          const current = logLines[currentIndex];
          setBootLogs(prev => [...prev, current.msg]);
          currentIndex++;
          
          const progressPct = Math.floor((currentIndex / logLines.length) * 100);
          setBootProgress(progressPct);

          setTimeout(runLog, current.duration);
        } else {
          setBootFinished(true);
          // Automatically proceed to final authorization screen after brief delay
          setTimeout(() => {
            setCurrentStep(4);
          }, 1200);
        }
      };

      setTimeout(runLog, 200);
    }
  }, [currentStep]);

  // Profiles List
  const profilesList = [
    {
      id: 'CORE_INTEL_US_EAST',
      label: 'Core Intelligence Corp',
      region: 'US-EAST (Virginia-1)',
      employees: '14,250 Active Accounts',
      apps: '342 Microservices',
      databases: '88 Persistent Clusters',
      cloud: '2,400 Compute Node Pools',
      risk: 'Muted (12%)',
      status: 'Nominal Operations',
      governance: 'AAA Certified',
      accent: 'border-accent-cyan/30 text-accent-cyan bg-accent-cyan/5'
    },
    {
      id: 'ALPHA_PARTNERS_GLOBAL',
      label: 'Alpha Government Solutions',
      region: 'FedGov Secure Cloud',
      employees: '82,900 Active Personnel',
      apps: '1,120 GovCloud Clusters',
      databases: '450 Encrypted Vaults',
      cloud: '9,820 Nodes',
      risk: 'Elevated (34%)',
      status: 'Enhanced Defensive Scan Active',
      governance: 'AA+ FedRAMP Posture',
      accent: 'border-accent-indigo/30 text-accent-blue bg-accent-blue/5'
    },
    {
      id: 'DEMO_SANDBOX_LAB',
      label: 'Vulnerability Simulation Lab',
      region: 'Isolated Node Twin',
      employees: '120 Sandbox Operators',
      apps: '24 Testing Stacks',
      databases: '8 Controlled DB Twins',
      cloud: '42 Sandboxes',
      risk: 'Severe Drill (89%)',
      status: 'Ransomware Simulation Active',
      governance: 'Sandbox Mode / Unrestricted',
      accent: 'border-state-danger/30 text-state-danger bg-state-danger/5'
    }
  ];

  // Immersive Role Experiences
  const rolesList = [
    {
      id: 'Administrator',
      label: 'Incident Commander & Systems Director',
      mission: 'Coordinate enterprise systems architecture, adjust policy levels, and trigger manual node containment overrides across the entire operational grid.',
      authority: 'Level 5 (Maximum Cryptographic Write Credentials)',
      visibility: 'Full global system topology, security configurations, database logs, and asset catalogs.',
      capabilities: 'Active quarantine triggers, node restoration, live performance tuning, compliance auditing.',
      scope: 'Global Multi-Region Production Clusters & Border Gateways.',
      icon: Command
    },
    {
      id: 'Security Analyst',
      label: 'Defense Analyst / Intelligence Officer',
      mission: 'Investigate low-level network system events, audit alert streams, diagnose vulnerability matrices, and track lateral incident propagation.',
      authority: 'Level 3 (Read-Only Telemetry Triage and Audit Authority)',
      visibility: 'Real-time telemetry streams, Suricata event logs, Falco alerts, dependency metrics.',
      capabilities: 'Target host inspection, security report exports, AI diagnostics verification.',
      scope: 'Application Perimeters, Edge Gateways, and Internal Node Topographies.',
      icon: Shield
    },
    {
      id: 'Incident Commander',
      label: 'Active Incident Commander',
      mission: 'Direct containment campaigns under high-tension intrusion bursts, authorize mass playbooks, and coordinate emergency workspace responses.',
      authority: 'Level 4 (Direct Isolation Playbook Deployment Authority)',
      visibility: 'Critical business dependency grids, team contacts, financial SLA outage risks.',
      capabilities: 'Trigger direct neural container isolating clusters, dispatch threat briefs.',
      scope: 'Active Breach Zones, Host Groups, and Downstream Database Subnets.',
      icon: KeyRound
    },
    {
      id: 'Executive Observer',
      label: 'Executive CISO / Officer',
      mission: 'Monitor aggregate enterprise uptime indexes, business continuity, regulatory compliance states, and financial outage liability estimates.',
      authority: 'Level 2 (Executive Strategic Information Access)',
      visibility: 'Real-time Enterprise OS financial loss clocks (USD/Hr), high-altitude risk graphs.',
      capabilities: 'C-suite summary reports, regulatory compliance audit grids, audit logs.',
      scope: 'High-Altitude Strategic and Financial Risk Indexing dashboards.',
      icon: Eye
    },
    {
      id: 'Governance Officer',
      label: 'Chief Risk & Governance Officer',
      mission: 'Verify organizational adherence to safety policies, update zero-trust regulatory filters, and inspect directory patch compliance drift.',
      authority: 'Level 4 (Policy Verification & Workspace Clearance Audit)',
      visibility: 'Workforce intelligence grids, software vulnerability directories, access lists.',
      capabilities: 'Access control editing, patch compliance audits, system compliance score tuning.',
      scope: 'Regulatory Compliance Frameworks and Security Clearance Registries.',
      icon: Users
    }
  ];

  const currentProfile = profilesList.find(p => p.id === selectedTenant) || profilesList[0];
  const currentRole = rolesList.find(r => r.id === selectedRole) || rolesList[0];

  return (
    <div className="fixed inset-0 bg-void z-[5000] flex flex-col justify-between font-mono text-text-primary selection:bg-accent-cyan/20 overflow-hidden">
      
      {/* Dynamic CSS styles for animations inside React */}
      <style>{`
        @keyframes dash-flow {
          to { stroke-dashoffset: -20; }
        }
        .anime-dash {
          stroke-dasharray: 6, 6;
          animation: dash-flow 2s linear infinite;
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        .scanline-effect {
          animation: scanline 8s linear infinite;
        }
        @keyframes text-flux {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; text-shadow: 0 0 15px rgba(0,242,255,0.4); }
        }
        .text-flux-accent {
          animation: text-flux 2.5s infinite;
        }
      `}</style>

      {/* Futuristic Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] z-[5001] opacity-35" />
      <div className="absolute left-0 top-0 w-full h-[1px] bg-accent-cyan/10 scanline-effect pointer-events-none z-[5001]" />

      {/* Cyber Grid Background */}
      <div className="absolute inset-0 cyber-grid pointer-events-none opacity-20" />

      {/* TOP STATUS BAR ACCENTS */}
      <header className="h-[54px] border-b border-border bg-surface/85 backdrop-blur-md flex items-center justify-between px-6 z-10 shrink-0 select-none">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-accent-cyan rounded-full animate-ping-precision" />
            <span className="font-sans font-black text-[12px] tracking-[4px] text-white">SENTINEL</span>
            <span className="font-sans font-black text-[12px] tracking-[4px] text-accent-cyan text-glow-precision">// X</span>
          </div>
          <span className="text-[9px] text-[#5A7FA8] border-l border-border pl-4 hidden md:inline uppercase tracking-widest leading-none font-bold">
            OS BUILD v4.4 // CORE INTEGRATION PLATFORM
          </span>
        </div>

        {/* Live system telemetrics */}
        <div className="flex items-center gap-6 text-[10px]">
          <div className="hidden lg:flex items-center gap-2 text-slate-500 font-medium">
            <Activity size={12} className="text-accent-cyan animate-pulse" />
            <span className="uppercase tracking-wider">TUNNEL: SECRET_AES_256 // CRYPT_TUNNEL_ESTABLISHED</span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary font-bold">
            <Clock size={12} className="text-accent-indigo" />
            <span className="font-mono tracking-wider text-[11px] text-white">{currentTime || '08:39:29 UTC'}</span>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT CONTAINER */}
      <main className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 relative min-h-0">
        
        {/* LEFT COLUMN: ARCHITECTURE MAP, ROTATING CAPABILITIES & ROADMAPS */}
        <section className="lg:col-span-5 xl:col-span-4 border-r border-[#1e2535] bg-[#05070d]/90 p-6 flex flex-col justify-between overflow-y-auto custom-scrollbar gap-8">
          
          {/* Logo / System Manifesto Introduction */}
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <Sparkles size={14} className="text-accent-cyan animate-pulse text-glow-precision" />
              <span className="text-[10px] font-sans font-extrabold tracking-[2px] text-accent-cyan uppercase">
                ENTERPRISE OPERATING SYSTEM
              </span>
            </div>
            <h2 className="text-[17px] font-sans font-black leading-tight text-white tracking-tight uppercase">
              UNIVERSAL SYSTEM REASONING
            </h2>
            <p className="text-[11px] leading-relaxed text-text-secondary font-sans font-medium mt-1">
              SentinelX represents a major shift from legacy incident detection. It maps enterprise topologies as an active virtual twin, translating raw signal telemetry into instant strategic compliance, outage analysis, and autonomic quarantine containment.
            </p>
          </div>

          {/* DYNAMIC ARCHITECTURE MAP VISUALIZATION */}
          <div className="bg-panel/20 border border-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/15">
              <span className="text-[9.5px] font-bold tracking-wider text-slate-200 uppercase flex items-center gap-1.5">
                <Compass size={13} className="text-accent-cyan" />
                SYSTEM COGNITIVE ARCHITECTURE
              </span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-state-safe rounded-full animate-pulse" />
                <span className="text-[8px] text-state-safe font-bold">SCHEMATIC MESH ACTIVE</span>
              </div>
            </div>

            {/* Simulated Architecture Graph Flow using SVG & CSS Paths */}
            <div className="relative py-2 flex justify-center">
              <svg width="280" height="150" viewBox="0 0 280 150" className="w-full h-auto">
                {/* Horizontal Paths with active flowing packet strokes */}
                <path d="M 30,50 L 140,50" stroke="#1d2d44" strokeWidth="1.5" fill="none" />
                <path d="M 140,50 L 250,50" stroke="#1d2d44" strokeWidth="1.5" fill="none" />
                <path d="M 30,110 L 140,110" stroke="#1d2d44" strokeWidth="1.5" fill="none" />
                <path d="M 140,110 L 250,110" stroke="#1d2d44" strokeWidth="1.5" fill="none" />
                
                {/* Interconnection Paths */}
                <path d="M 30,50 L 30,110" stroke="#10b981" strokeWidth="1" fill="none" className="anime-dash" strokeDashoffset="10" />
                <path d="M 140,50 L 140,110" stroke="#00f2ff" strokeWidth="1" fill="none" className="anime-dash" />
                <path d="M 250,50 L 250,110" stroke="#6366f1" strokeWidth="1" fill="none" className="anime-dash" strokeDashoffset="5" />

                {/* Nodes with custom positions & status glows */}
                {/* 1. Telemetry */}
                <circle cx="30" cy="50" r="14" fill="#030610" stroke="#10b981" strokeWidth="1.5" className="anime-glow" />
                <text x="30" y="54" textAnchor="middle" fill="#10b981" fontSize="8" fontWeight="bold" fontFamily="monospace">TEL</text>
                
                {/* 2. Data Fabric */}
                <circle cx="140" cy="50" r="14" fill="#030610" stroke="#00f2ff" strokeWidth="1.5" />
                <text x="140" y="54" textAnchor="middle" fill="#00f2ff" fontSize="8" fontWeight="bold" fontFamily="monospace">DF</text>

                {/* 3. Enterprise OS */}
                <circle cx="250" cy="50" r="14" fill="#030610" stroke="#6366f1" strokeWidth="1.5" />
                <text x="250" y="54" textAnchor="middle" fill="#6366f1" fontSize="8" fontWeight="bold" fontFamily="monospace">OS</text>

                {/* 4. Governance */}
                <circle cx="30" cy="110" r="14" fill="#030610" stroke="#a855f7" strokeWidth="1.5" />
                <text x="30" y="114" textAnchor="middle" fill="#a855f7" fontSize="8" fontWeight="bold" fontFamily="monospace">GOV</text>

                {/* 5. AI Reasoning */}
                <circle cx="140" cy="110" r="14" fill="#030610" stroke="#f59e0b" strokeWidth="1.5" className="anime-glow" />
                <text x="140" y="114" textAnchor="middle" fill="#f59e0b" fontSize="8" fontWeight="bold" fontFamily="monospace">AI</text>

                {/* 6. Command Center */}
                <circle cx="250" cy="110" r="14" fill="#0a0d1a" stroke="#fff" strokeWidth="2" />
                <text x="250" y="114" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="monospace">CMD</text>
              </svg>
            </div>

            {/* Custom Interactive flow titles definitions */}
            <div className="grid grid-cols-3 gap-1 content-center text-[8px] tracking-tight font-mono text-slate-500 uppercase font-black text-center mt-2 pt-1 border-t border-border/10">
              <div>
                <span className="text-state-safe block">1 TELEMETRY</span>
                <span className="text-slate-600 block mt-0.5">Suricata / Falco Ingest</span>
              </div>
              <div>
                <span className="text-accent-cyan block">2 ENTP_FABRIC</span>
                <span className="text-slate-600 block mt-0.5">Real-time DB Sync</span>
              </div>
              <div>
                <span className="text-accent-indigo block">3 SENTINEL_OS</span>
                <span className="text-slate-600 block mt-0.5">SLA Loss Estimates</span>
              </div>
            </div>
          </div>

          {/* ROTATING CAPABILITIES CAROUSEL */}
          <div className="bg-panel/40 border border-border rounded-lg p-5 flex flex-col justify-between gap-3 relative min-h-[148px]">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-bold tracking-wider text-slate-200 uppercase flex items-center gap-1.5">
                <Sliders size={13} className="text-accent-indigo" />
                TACTICAL CAPABILITY COMPASS
              </span>
              <span className="text-[8px] bg-accent-indigo/10 text-accent-indigo border border-accent-indigo/20 px-1.5 py-0.5 rounded uppercase font-bold">
                {capabilities[activeCapIndex].tag}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeCapIndex}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.3 }}
                className="space-y-1"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-white/5 rounded">
                    {(() => {
                      const IconComp = capabilities[activeCapIndex].icon;
                      return <IconComp size={14} className="text-accent-cyan" />;
                    })()}
                  </div>
                  <h4 className="text-[12px] font-sans font-bold text-white uppercase tracking-tight">
                    {capabilities[activeCapIndex].title}
                  </h4>
                </div>
                <p className="text-[11px] leading-relaxed text-text-secondary font-sans font-medium mt-1">
                  {capabilities[activeCapIndex].desc}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center gap-1.5 pt-1">
              {capabilities.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveCapIndex(idx)}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all duration-300",
                    activeCapIndex === idx ? "bg-accent-cyan w-3" : "bg-slate-700 hover:bg-slate-500"
                  )}
                />
              ))}
            </div>
          </div>

          {/* ROADMAP FORECAST FORESIGHT */}
          <div className="bg-panel/20 border border-border rounded-lg p-5">
            <span className="text-[9.5px] font-white font-bold tracking-wider text-slate-200 uppercase flex items-center gap-1.5 mb-3">
              <Milestone size={13} className="text-accent-cyan" />
              SENTINELX FIVE-PHASE INTEL ROADMAP
            </span>
            <div className="grid grid-cols-2 gap-2 text-[9px] font-sans font-medium">
              <div className="p-2 border border-border bg-[#0b0e14] rounded">
                <span className="text-accent-cyan font-bold block">// PH_01 - 03</span>
                <span className="text-white font-extrabold uppercase select-none block mt-0.5">INTEGRATED</span>
                <span className="text-[8.5px] text-text-secondary font-mono">Dynamic Topography & SLA metrics.</span>
              </div>
              <div className="p-2 border border-[#a855f7]/20 bg-[#a855f7]/5 rounded">
                <span className="text-[#a855f7] font-bold block">// PH_04 - 05</span>
                <span className="text-white font-extrabold uppercase block mt-0.5">DECOUPLE PROTOTYPE</span>
                <span className="text-[8.5px] text-text-secondary font-mono">Autonomic isolation and AI diagnostics.</span>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: REENGINEERED PROGRESSIVE COMMISSIONING DECK */}
        <section className="lg:col-span-7 xl:col-span-8 p-6 flex flex-col justify-between overflow-y-auto custom-scrollbar h-full bg-[#030408]/95">
          
          {/* STEP HEADER NAVIGATION PROGRESS BULLETS */}
          <div className="border-b border-border pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 select-none shrink-0">
            <div>
              <span className="text-[9px] text-[#5A7FA8] font-bold tracking-widest block uppercase">
                COMMISSIONING STEP 0{currentStep + 1} // 05
              </span>
              <h3 className="text-[14px] font-sans font-black text-white uppercase tracking-tight mt-0.5">
                {currentStep === 0 && "ENTERPRISE REAL-TIME HEALTH INDEX"}
                {currentStep === 1 && "TARGET CORPORATE DIRECTORY LEVEL"}
                {currentStep === 2 && "OPERATOR MANDATE & ASSIGNED DOSSIER"}
                {currentStep === 3 && "AUTONOMIC DEPLOYMENT COMPILATION"}
                {currentStep === 4 && "EXECUTIVE CONTROL DELEGATION SUMMARY"}
              </h3>
            </div>

            {/* Visual Mini Progress Timeline */}
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3, 4].map((step) => (
                <button
                  key={step}
                  onClick={() => {
                    // Prevent skipping bootstrap page manually
                    if (step === 3 || currentStep === 3) return;
                    setCurrentStep(step);
                  }}
                  disabled={step === 3 || currentStep === 3}
                  className={cn(
                    "px-2.5 py-1 text-[9px] font-bold font-mono transition-all border shrink-0",
                    currentStep === step 
                      ? "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/50" 
                      : step < currentStep 
                        ? "bg-emerald-950/20 text-state-safe border-state-safe/30" 
                        : "bg-[#0b0e14] text-slate-500 border-border hover:border-slate-500"
                  )}
                >
                  0{step + 1}
                </button>
              ))}
            </div>
          </div>

          {/* CENTRAL WORKSPACE ACCORDING TO GUIDED SCREEN */}
          <div className="flex-1 my-6 overflow-y-auto custom-scrollbar pr-1 min-h-[340px] flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                
                {/* SCREEN 1: ENTERPRISE OVERVIEW STATS */}
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <div className="bg-[#0b0e14] border border-border p-4 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div>
                        <span className="text-[8px] bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 px-2 py-0.5 rounded font-black max-w-max uppercase tracking-wider block mb-1">
                          COGNITIVE INSITE ENVOY STATUS
                        </span>
                        <h4 className="text-[14px] font-sans font-extrabold text-white uppercase tracking-tight">
                          NOMINAL CORPORATE TELEMETRY INGESTED AT SCALE
                        </h4>
                        <p className="text-[11px] text-text-secondary leading-relaxed font-sans font-medium mt-1">
                          The SentinelX telemetry engine is scanning live microsegments. Review continuous health indicators showing resilience levels across security boundaries, compliance posturing, and data persists.
                        </p>
                      </div>
                      <div className="px-4 py-2 border border-state-safe/20 bg-state-safe/5 rounded text-center shrink-0">
                        <span className="text-[9px] text-state-safe font-mono uppercase block">OPERATIONAL INTEGRITY</span>
                        <span className="text-[15px] text-white font-black block tracking-widest mt-0.5">SECURE</span>
                      </div>
                    </div>

                    {/* Animated counters grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
                      {[
                        { title: 'Security Resilience Index', value: `${securityScore}%`, tag: 'OPTIMIZED', color: 'text-state-safe' },
                        { title: 'Corporate Workload Readiness', value: `${readinessScore}%`, tag: 'EXCELLENT', color: 'text-[#00f2ff]' },
                        { title: 'Regulatory Compliance Core', value: `${governanceScore}/100`, tag: 'COMPLIANT', color: 'text-accent-indigo' },
                        { title: 'Tracked Core Infrastructure Nodes', value: nodeCount.toLocaleString(), tag: 'GLOBAL_MESH', color: 'text-white' },
                        { title: 'Ecosystem Telemetry Streams', value: `${ingestRate} EV/SEC`, tag: 'LIVE_INGEST', color: 'text-[#f59e0b]' },
                        { title: 'System-Wide Threat Level', value: '0.12x RISK', tag: 'MINIMUM', color: 'text-[#6366f1]' }
                      ].map((item, index) => (
                        <div key={index} className="bg-panel border border-border rounded p-4 flex flex-col justify-between gap-2 hover:border-[#1e2535] transition">
                          <div>
                            <span className="text-[8px] tracking-widest text-[#5A7FA8] font-mono block uppercase">{item.title}</span>
                            <span className={cn("text-[20px] font-sans font-black tracking-tight block mt-1", item.color)}>
                              {item.value}
                            </span>
                          </div>
                          <span className="text-[8.5px] font-bold text-slate-500 font-mono tracking-widest">
                            ➔ {item.tag}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SCREEN 2: SELECT ENTERPRISE (Profiles Selection) */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <p className="text-[11px] leading-relaxed text-text-secondary font-sans font-medium mb-3">
                      Select target Institutional Directory layer. SentinelX isolates telemetry pipelines into dedicated container environments, ensuring multi-site data structures are synchronized in real time.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {profilesList.map((pf) => {
                        const isSelected = selectedTenant === pf.id;
                        return (
                          <button
                            key={pf.id}
                            type="button"
                            onClick={() => setSelectedTenant(pf.id)}
                            className={cn(
                              "p-4 rounded-lg text-left border flex flex-col justify-between transition-all duration-300 relative block w-full outline-none",
                              isSelected 
                                ? "bg-panel/60 border-accent-cyan text-white shadow-[0_0_15px_rgba(0,255,209,0.06)]" 
                                : "bg-panel/10 border-border/80 text-text-secondary hover:border-border-bright hover:bg-white/5"
                            )}
                          >
                            <div className="flex items-center justify-between w-full mb-1">
                              <span className="text-[11.5px] font-sans font-extrabold uppercase tracking-tight">{pf.label}</span>
                              <div className={cn("w-1.5 h-1.5 rounded-full", isSelected ? "bg-accent-cyan animate-pulse" : "bg-slate-700")} />
                            </div>
                            <span className="text-[8.5px] text-[#5A7FA8] font-mono block uppercase">{pf.region}</span>
                            
                            <hr className="my-2.5 border-border/10" />

                            <div className="space-y-1 text-[9px] font-mono select-none">
                              <div className="flex justify-between">
                                <span className="text-slate-500 uppercase">EMPLOYEES:</span>
                                <span className="text-slate-300 font-bold">{pf.employees.split(' ')[0]}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">SERVICES:</span>
                                <span className="text-slate-300 font-bold">{pf.apps.split(' ')[0]}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">RISK INDEX:</span>
                                <span className={cn("font-bold", pf.risk.includes('Severe') ? 'text-state-danger' : pf.risk.includes('Elevated') ? 'text-state-warning' : 'text-state-safe')}>
                                  {pf.risk}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Show selected profile details block */}
                    <div className="bg-[#0b0e14] border border-border rounded-lg p-5 mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Database size={13} className="text-accent-cyan" />
                        <span className="text-[9.5px] font-sans font-bold text-slate-200 uppercase">
                          TARGET CLUSTER METRICS INGESTED: {currentProfile.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-[9px] font-mono mt-1 pr-6">
                        <div>
                          <span className="text-slate-500 block">DB CLUSTERS:</span>
                          <span className="text-white font-bold block mt-0.5">{currentProfile.databases}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">CLOUD ASSETS:</span>
                          <span className="text-white font-bold block mt-0.5">{currentProfile.cloud}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">COMPLIANCE DECK:</span>
                          <span className="text-accent-cyan font-bold block mt-0.5">{currentProfile.governance}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">SYSTEM STATUS:</span>
                          <span className="text-slate-300 font-bold block mt-0.5">{currentProfile.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SCREEN 3: OPERATOR PROFILE (Clearence Role Selection) */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <p className="text-[11px] leading-relaxed text-text-secondary font-sans font-medium mb-3">
                      Commissioning security clearances binds cryptographic identities directly to access policies. Select your assigned operator dossier below to update visibility parameters.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pb-1">
                      {rolesList.map((role) => {
                        const IconComponent = role.icon;
                        const isSelected = selectedRole === role.id;
                        return (
                          <button
                            key={role.id}
                            type="button"
                            onClick={() => setSelectedRole(role.id)}
                            className={cn(
                              "p-3 rounded-lg border text-center flex flex-col items-center gap-2 transition-all duration-300 outline-none block w-full",
                              isSelected 
                                ? "bg-panel/60 border-accent-cyan text-white shadow-[0_0_15px_rgba(0,255,209,0.06)]" 
                                : "bg-panel/10 border-border/80 text-text-secondary hover:border-border-bright hover:bg-white/5"
                            )}
                          >
                            <div className={cn(
                              "w-8 h-8 rounded flex items-center justify-center border",
                              isSelected ? "bg-accent-cyan/10 border-accent-cyan/40 text-accent-cyan" : "bg-white/5 border-white/10 text-text-secondary"
                            )}>
                              <IconComponent size={14} />
                            </div>
                            <span className="text-[9.5px] font-sans font-black block uppercase tracking-tight leading-none text-center">
                              {role.id.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Blueprint operator dossier panel */}
                    <div className="bg-[#0b0e14] border border-[#1e2535] rounded-xl p-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 px-3 py-1 bg-[#232a3d]/40 border-b border-l border-border rounded-bl font-mono text-[8.5px] text-accent-cyan font-bold uppercase">
                        {currentRole.authority.split(' (')[0]}
                      </div>

                      <div className="flex items-center gap-2 mb-3 border-b border-border/15 pb-2">
                        <TerminalIcon size={14} className="text-accent-cyan animate-pulse" />
                        <h4 className="text-[11.5px] font-sans font-extrabold text-white uppercase tracking-tight">
                          DELEGATED MANDATE: {currentRole.label.toUpperCase()}
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] font-sans">
                        <div className="space-y-2.5">
                          <div>
                            <span className="text-slate-500 font-mono text-[8px] tracking-wider block uppercase">MISSION BRIEF:</span>
                            <p className="text-text-secondary font-medium leading-relaxed uppercase mt-0.5">{currentRole.mission}</p>
                          </div>
                          <div>
                            <span className="text-slate-500 font-mono text-[8px] tracking-wider block uppercase">OPERATIVE LIMIT LIMIT:</span>
                            <p className="text-text-secondary font-medium uppercase mt-0.5">{currentRole.visibility}</p>
                          </div>
                        </div>

                        <div className="space-y-2.5 border-t md:border-t-0 md:border-l border-border/15 pt-3 md:pt-0 md:pl-4">
                          <div>
                            <span className="text-slate-500 font-mono text-[8px] tracking-wider block uppercase">VISIBILITY CAPACITY:</span>
                            <p className="text-[#00f2ff] font-medium leading-relaxed uppercase mt-0.5">{currentRole.capabilities}</p>
                          </div>
                          <div>
                            <span className="text-slate-500 font-mono text-[8px] tracking-wider block uppercase">PRIMARY OPERATIONAL SCOPE:</span>
                            <p className="text-text-secondary font-medium uppercase mt-0.5">{currentRole.scope}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SCREEN 4: PLATFORM INITIALIZATION */}
                {currentStep === 3 && (
                  <div className="py-8 flex flex-col items-center justify-center space-y-6">
                    <div className="relative">
                      {/* Spinning core */}
                      <div className="w-20 h-20 rounded-full border-2 border-t-accent-cyan border-accent-cyan/10 animate-spin" />
                      <Lock className="absolute inset-0 m-auto w-6 h-6 text-accent-cyan animate-pulse" />
                    </div>

                    <div className="w-full max-w-lg space-y-3">
                      {/* Bootstrap progression meter */}
                      <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400">
                        <span>ESTABLISHING ENVIRONMENT ENGINE</span>
                        <span className="text-accent-cyan">{bootProgress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-border-bright/25 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent-cyan transition-all duration-300 shadow-[0_0_12px_rgba(0,255,209,0.5)]"
                          style={{ width: `${bootProgress}%` }}
                        />
                      </div>

                      {/* Display boot diagnostics output terminal */}
                      <div className="bg-[#05070d] border border-border p-3 rounded h-32 overflow-y-auto font-mono text-[9px] text-slate-300 space-y-1 custom-scrollbar">
                        {bootLogs.map((log, index) => (
                          <div key={index} className="flex gap-2 text-glow-precision">
                            <span className="text-slate-600 block shrink-0">[{index.toString().padStart(2, '0')}]</span>
                            <span className={cn(
                              "font-bold",
                              log.includes('OK') || log.includes('COMPLETE') || log.includes('INITIALIZED') ? "text-state-safe" : "text-white"
                            )}>
                              {log}
                            </span>
                          </div>
                        ))}
                        <div className="w-1.5 h-3 bg-accent-cyan animate-pulse mt-1" />
                      </div>
                    </div>
                  </div>
                )}

                {/* SCREEN 5: COMMAND CENTER PREVIEW (Checkout summary) */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-accent-cyan/5 border border-accent-cyan/20 rounded-lg">
                      <h4 className="text-[12.5px] font-sans font-black text-white uppercase tracking-tight flex items-center gap-1.5">
                        <CheckCircle2 size={15} className="text-accent-cyan" />
                        OPERATOR PROFILE CRYPTOGRAPHIC ENVELOPE VERIFIED
                      </h4>
                      <p className="text-[11px] leading-relaxed text-text-secondary font-sans font-medium mt-1">
                        Systems configured and verified against sovereign corporate networks. SentinelX zero-trust boundary containment protocols are locked and ready in host memory files.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Clearance Dossier Summary */}
                      <div className="bg-panel border border-border p-4 rounded-lg flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <KeyRound size={13} className="text-accent-indigo" />
                            <span className="text-[9.5px] font-sans font-bold text-slate-200 uppercase">
                              SESSION VERIFICATION CREDENTIALS
                            </span>
                          </div>
                          <div className="space-y-2 mt-2">
                            <div className="text-[9.5px]">
                              <span className="text-slate-500 block font-mono">ASSIGNED COMMAND ROLE:</span>
                              <span className="text-white font-extrabold uppercase block">{currentRole.label.split(' / ')[0]}</span>
                            </div>
                            <div className="text-[9.5px]">
                              <span className="text-slate-500 block font-mono">ENFORCEABLE POLICY AUTHORITY:</span>
                              <span className="text-accent-cyan font-bold block">{currentRole.authority}</span>
                            </div>
                            <div className="text-[9.5px]">
                              <span className="text-slate-500 block font-mono">COGNITIVE VISIBILITY:</span>
                              <span className="text-slate-300 block leading-tight">{currentRole.capabilities}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Target Architecture Stats brief */}
                      <div className="bg-panel border border-border p-4 rounded-lg flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Server size={13} className="text-accent-cyan" />
                            <span className="text-[9.5px] font-sans font-bold text-slate-200 uppercase">
                              ENVIRONMENT COOPERATIVE SCHEMAS
                            </span>
                          </div>
                          <div className="space-y-1 mt-2 text-[9px] font-mono">
                            <div className="flex justify-between py-0.5 border-b border-border/10">
                              <span className="text-slate-500">TARGET INSTITUTION:</span>
                              <span className="text-white font-bold">{currentProfile.label}</span>
                            </div>
                            <div className="flex justify-between py-0.5 border-b border-border/10">
                              <span className="text-slate-500">SUBNET ZONE:</span>
                              <span className="text-accent-cyan font-bold">{selectedTenant.replace(/_/g, ' ')}</span>
                            </div>
                            <div className="flex justify-between py-0.5 border-b border-border/10">
                              <span className="text-slate-500">WORKSTATIONS / APPS:</span>
                              <span className="text-white font-bold">{currentProfile.apps}</span>
                            </div>
                            <div className="flex justify-between py-0.5 border-b border-border/10">
                              <span className="text-slate-500">PERSISTENCE VAULTS:</span>
                              <span className="text-white font-bold">{currentProfile.databases}</span>
                            </div>
                            <div className="flex justify-between py-0.5 border-b border-border/10">
                              <span className="text-slate-500">COMPLIANCE DEEPNESS:</span>
                              <span className="text-state-safe font-bold">{currentProfile.governance}</span>
                            </div>
                            <div className="flex justify-between py-0.5">
                              <span className="text-slate-500">OPERATIONAL STATUS:</span>
                              <span className="text-slate-300 font-bold">{currentProfile.status}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* COMPOSITE INTERACTIVE NAVIGATION CONTROLS DECK */}
          <footer className="border-t border-border pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-auto shrink-0">
            <div className="text-left py-1 select-none">
              <span className="text-[7.5px] text-slate-500 font-mono tracking-widest block uppercase">
                SECURITY COMPLIANCE DIRECTIVE
              </span>
              <p className="text-[8px] text-[#5A7FA8] font-bold block uppercase mt-0.5">
                IDENTITY DEPLOYMENT PROTOCOLS BOUND BY AES_256 CRYPTOGRAPHIC INTEGRITY
              </p>
            </div>

            <div className="flex items-center gap-3">
              {currentStep > 0 && currentStep !== 3 && (
                <button
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="px-5 py-3 hover:bg-white/5 text-slate-400 hover:text-white border border-border/80 text-[10px] font-bold tracking-widest uppercase transition rounded"
                >
                  PREVIOUS SEC
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  onClick={() => {
                    if (currentStep === 0) {
                      setCurrentStep(1);
                    } else if (currentStep === 1) {
                      setCurrentStep(2);
                    } else if (currentStep === 2) {
                      // Boot Sequence triggers automatically
                      setCurrentStep(3);
                    }
                  }}
                  className="px-8 py-3 bg-[#0a0d14] border border-accent-cyan/40 hover:border-accent-cyan hover:bg-accent-cyan/5 text-accent-cyan hover:text-white font-bold text-[10px] tracking-widest uppercase transition rounded shadow-[0_0_12px_rgba(0,242,255,0.06)] cursor-pointer text-glow-precision flex items-center gap-1"
                >
                  {currentStep === 0 && "CONFIGURE TARGET PROFILE"}
                  {currentStep === 1 && "COMMIT IDENTITY DOSSIER"}
                  {currentStep === 2 && "INITIALIZE COGNITIVE ENGINE"}
                  <ArrowRight size={11} className="ml-1" />
                </button>
              ) : currentStep === 4 ? (
                <button
                  type="button"
                  onClick={() => onComplete(selectedRole, selectedTenant)}
                  className="px-10 py-3.5 bg-accent-cyan text-void hover:bg-white font-sans font-black text-[10px] tracking-[0.25em] uppercase transition-all duration-300 rounded shadow-[0_0_25px_rgba(0,242,255,0.35)] cursor-pointer hover:shadow-[0_0_35px_rgba(255,255,255,0.4)] flex items-center gap-1.5"
                >
                  LAUNCH SENTINELX OPERATING SYSTEM
                  <ArrowRight size={12} fill="currentColor" />
                </button>
              ) : null}
            </div>
          </footer>
        </section>

      </main>

      {/* FOOTER CLASSIFIED LABEL */}
      <footer className="h-[38px] border-t border-border bg-[#030408]/90 flex items-center justify-between px-6 z-10 shrink-0 select-none">
        <span className="text-[7.5px] text-slate-600 font-mono tracking-widest uppercase">
          AUTHORIZED ACCESS ONLY // LEVEL 5 SECURITY DIRECTIVE REQUIRED // UNIFIED INTEL LAYER
        </span>
        <span className="text-[7.5px] text-slate-600 font-mono tracking-widest uppercase hidden md:inline">
          © 2026 PROTECT THE CORE — SECURITY RESILIENCE DIRECTIVE
        </span>
      </footer>
    </div>
  );
}

// Minimalistic Custom Graphic Icon helper for Capabilities Card
function GraphIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M2 12h20" />
    </svg>
  );
}

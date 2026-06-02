import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Server, Shield, Database, Radio, Share2, Brain, Activity, 
  Map, Clipboard, Sparkles, CheckCircle2, ArrowRight, Layers
} from 'lucide-react';

interface SubsystemNode {
  id: string;
  name: string;
  label: string;
  icon: any;
  purpose: string;
  responsibilities: string[];
  inputs: string[];
  outputs: string[];
  dependencies: string[];
  operationalRole: string;
}

export function InteractiveArchitectureExplorer() {
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>('telemetry');

  const subsystems: SubsystemNode[] = [
    {
      id: 'telemetry',
      name: 'Telemetry Sources',
      label: 'FALCO & SURICATA PROBES',
      icon: Radio,
      purpose: 'Capture and stream granular system-call events and deep packet log structures.',
      responsibilities: [
        'Ingest host-level kernel operations via Falco daemon tools.',
        'Parse perimeter network queries via Suricata stream logs.',
        'Normalize unstructured syslog indices.'
      ],
      inputs: ['Raw kernel processes', 'Network packets', 'Ingress gateway queries'],
      outputs: ['Clean, unfiltered system events'],
      dependencies: ['Suricata engine', 'Linux kernel modules', 'Docker / Kubernetes host APIs'],
      operationalRole: 'The initial sensory layer of SentinelX, catching indicators of intrusion.'
    },
    {
      id: 'connectors',
      name: 'Universal Connectors',
      label: 'PLATFORM AGENT INGESTION MESH',
      icon: Share2,
      purpose: 'Provide standard gateway integrations to map cloud, local logs, and LDAP directories.',
      responsibilities: [
        'Bridge diverse logging sources into standard high-tempo event loops.',
        'Fetch human identities from corporate active directory registers.',
        'Translate cloud provider alerts into local schemas.'
      ],
      inputs: ['Clean, unfiltered system events', 'Active Directory logs'],
      outputs: ['Standardized security alerts'],
      dependencies: ['Syslog-ng receivers', 'Secure LDAP keys API'],
      operationalRole: 'Bridges physical infrastructure to SentinelX semantic representations.'
    },
    {
      id: 'eventbus',
      name: 'Event Bus Layer',
      label: 'REDIS-BACKED BROKER CORE',
      icon: Activity,
      purpose: 'A real-time pub/sub network dispatch ensuring zero-latency coordinate propagation.',
      responsibilities: [
        'Broadcast host breach events to adjacent intelligence components.',
        'Preserve event delivery orders.',
        'Synchronize simulator ticks across UI subscribers.'
      ],
      inputs: ['Standardized security alerts', 'Simulated operator events'],
      outputs: ['Active telemetry messages stream'],
      dependencies: ['InMemory Event Bus', 'Redis Streams services'],
      operationalRole: 'The central nervous system, driving event-driven responsiveness.'
    },
    {
      id: 'datafabric',
      name: 'Enterprise Data Fabric',
      label: 'DATABASES & SECURE REGISTRY',
      icon: Database,
      purpose: 'Manage long-term log storage, credential registries, and active state compliance databases.',
      responsibilities: [
        'Secure host metadata registries.',
        'Audit historical security logs.',
        'Sync state files with persistent database instances.'
      ],
      inputs: ['Active telemetry messages stream', 'Compliance audits'],
      outputs: ['Historic query logs', 'Personnel ownership mappings'],
      dependencies: ['Firestore / PostgreSQL instances', 'Redis query engines'],
      operationalRole: 'Secures and manages global structured data storage and history directories.'
    },
    {
      id: 'graphengine',
      name: 'Graph Intelligence',
      label: 'DYNAMIC TOPOLOGY RESOLVER',
      icon: Layers,
      purpose: 'Convert directory and application relationships into a real-time reactive graph.',
      responsibilities: [
        'Map logical ties between DB servers, frontends, and backups.',
        'Track active vulnerability thresholds per zone.',
        'Deliver graph nodes coordinate mappings in real-time.'
      ],
      inputs: ['Standardized security alerts', 'Personnel ownership mappings'],
      outputs: ['Active network graph states'],
      dependencies: ['Heuristic risk scoring equations'],
      operationalRole: 'Provides physical structural awareness of assets and lines of business.'
    },
    {
      id: 'enterpriseos',
      name: 'Enterprise OS',
      label: 'POLICY DECISION HUB',
      icon: Server,
      purpose: 'Coordinate business SLA evaluation, outage impact simulation, and strategic scores.',
      responsibilities: [
        'Translate network server outages into USD/hour loss ratios.',
        'Calculate continuous global readiness, SLA compliance ratings.',
        'Trigger automatic containment routines when scoring drops below SLA indexes.'
      ],
      inputs: ['Active network graph states', 'Compliance audits'],
      outputs: ['Global health scores', 'Active alert vectors'],
      dependencies: ['Compliance Engine API', 'SLA metrics models'],
      operationalRole: 'The business brain, converting dry tech vectors into strategic decisions.'
    },
    {
      id: 'governance',
      name: 'Governance Engine',
      label: 'AUTOMATED COMPLIANCE AUDITOR',
      icon: Clipboard,
      purpose: 'Validate zero-trust compliance posture, network segmentation boundaries, and active owner permissions.',
      responsibilities: [
        'Scan for direct public links triggering risk breaches.',
        'Audit administrator access privileges.',
        'Compare software releases against vulnerability catalogs.'
      ],
      inputs: ['Active network graph states'],
      outputs: ['Compliance audits', 'Governance scores'],
      dependencies: ['SLA registry definitions'],
      operationalRole: 'Maintains alignment with strict operational security boundaries.'
    },
    {
      id: 'aiintel',
      name: 'AI Intelligence',
      label: 'COGNITIVE REASONING CONTROLLER',
      icon: Brain,
      purpose: 'Provide strategic mitigation advice and natural-language summaries explaining threat details.',
      responsibilities: [
        'Synthesize raw syslog lists into natural-language timelines.',
        'Offer guided playbooks to incident response analysts.',
        'Process semantic natural-language searches on infrastructure assets.'
      ],
      inputs: ['Active telemetry messages stream', 'Global health scores'],
      outputs: ['AI-authored incident summaries', 'Mitigation advisories'],
      dependencies: ['Gemini API via @google/genai SDK', 'Enterprise Memory Registers'],
      operationalRole: 'Automates context compilation, explaining how and why alerts occurred.'
    },
    {
      id: 'digitaltwin',
      name: 'Digital Twin Sandpit',
      label: 'SADBOX RISK SIMULATOR',
      icon: Sparkles,
      purpose: 'Run risk scenarios (Ransomware, DDoS, internal leaks) safely in a sandbox.',
      responsibilities: [
        'Model the speed of horizontal threat propagation.',
        'Predict estimated collateral risk to sensitive assets.',
        'Dry-run quarantines to track business survivability.'
      ],
      inputs: ['Active network graph states', 'Simulated operator events'],
      outputs: ['Simulated cascading impacts', 'Optimal quarantine boundaries'],
      dependencies: ['SIR mathematical models'],
      operationalRole: 'A secure sandpit for proactive threat hunting and stress tests.'
    },
    {
      id: 'commandcenter',
      name: 'Command Center',
      label: 'UNIFIED CONTROL CONSOLE',
      icon: Shield,
      purpose: 'The central operations console containing real-time maps, timelines, and triage deck.',
      responsibilities: [
        'Represent unified diagnostic dashboards in real-time.',
        'Receive and dispatch administrative manual intervention clicks.',
        'Expose telemetry diagnostic logs for direct developer verification.'
      ],
      inputs: ['Global health scores', 'AI-authored incident summaries', 'Active network graph states'],
      outputs: ['Simulated operator events', 'Mitigation commands'],
      dependencies: ['Responsive web interfaces', 'D3.js visualization engines'],
      operationalRole: 'The primary cockpit for operational oversight and manual override commands.'
    },
    {
      id: 'opsmap',
      name: 'Operations Map',
      label: 'VISUAL TOPOLOGY CANVAS',
      icon: Map,
      purpose: 'A dynamic graphical overlay mapping the physical connections and lateral attack paths on screen.',
      responsibilities: [
        'Trace active network traffic frequencies visually.',
        'Highlight compromised entities in red glow states.',
        'Isolate files and path edges dynamically when commanded.'
      ],
      inputs: ['Active network graph states', 'Mitigation commands'],
      outputs: ['User selections', 'Scanned node coordinates'],
      dependencies: ['D3 force simulation models'],
      operationalRole: 'The active physical viewport into server layouts and ongoing cyber battles.'
    }
  ];

  const connections = [
    { from: 'telemetry', to: 'connectors', label: 'Raw Stream' },
    { from: 'connectors', to: 'eventbus', label: 'Sync Logs' },
    { from: 'eventbus', to: 'datafabric', label: 'Persistence' },
    { from: 'eventbus', to: 'graphengine', label: 'Topology Delta' },
    { from: 'datafabric', to: 'graphengine', label: 'Metadata Link' },
    { from: 'graphengine', to: 'enterpriseos', label: 'Uptime Sync' },
    { from: 'graphengine', to: 'governance', label: 'Policy Audits' },
    { from: 'governance', to: 'enterpriseos', label: 'Readiness Metrics' },
    { from: 'enterpriseos', to: 'aiintel', label: 'Criticality State' },
    { from: 'enterpriseos', to: 'digitaltwin', label: 'Mirrored Assets' },
    { from: 'aiintel', to: 'commandcenter', label: 'Summaries Feed' },
    { from: 'enterpriseos', to: 'commandcenter', label: 'Uptime Pulse' },
    { from: 'graphengine', to: 'opsmap', label: 'Topology Graph' },
    { from: 'commandcenter', to: 'opsmap', label: 'Admin Command' }
  ];

  const currentModule = subsystems.find(s => s.id === selectedSubsystem) || subsystems[0];

  return (
    <div id="interactive-architecture" className="bg-[#030615] border border-border/40 rounded-xl p-6 text-xs font-mono text-slate-300">
      <div className="flex justify-between items-center border-b border-border/15 pb-4 mb-6">
        <div>
          <h3 className="text-sm font-semibold text-white font-sans uppercase">Tactical System Architecture Explorer</h3>
          <p className="text-[10px] text-slate-500 font-mono">Interactive telemetry and pipeline flow map. Click any module box to inspect schemas and operational details.</p>
        </div>
        <span className="px-2 py-0.5 bg-indigo-950/40 text-indigo-400 border border-indigo-500/20 rounded font-mono text-[10px]">FLOW ARCHITECTURE MODE</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Side: Interactive System Core Diagram Grid */}
        <div className="lg:col-span-3 bg-[#020511] border border-border/20 rounded-xl p-5 flex flex-col justify-between space-y-6 relative overflow-hidden min-h-[480px]">
          {/* Subtle grid background scanlines */}
          <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
          
          <div className="z-10 text-[9px] text-[#00ffd1] uppercase tracking-wider border-b border-[#00ffd1]/20 pb-1.5 flex justify-between">
            <span>SentinelX Integrated Data Plane Pipelines</span>
            <span>Click modules below</span>
          </div>

          <div className="grid grid-cols-3 gap-3 relative z-10 py-1">
            {/* Row 1: INGEST */}
            <div className="col-span-3 grid grid-cols-3 gap-3">
              {subsystems.filter(s => ['telemetry', 'connectors', 'eventbus'].includes(s.id)).map(sub => {
                const Icon = sub.icon;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubsystem(sub.id)}
                    className={`p-3.5 rounded-lg border text-left flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                      selectedSubsystem === sub.id 
                        ? 'bg-indigo-950/50 border-indigo-400 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.25)]' 
                        : 'bg-[#04081c] border-border/20 hover:border-indigo-500/45 hover:bg-[#070c2a]/40'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <Icon className={`w-4 h-4 ${selectedSubsystem === sub.id ? 'text-indigo-400' : 'text-slate-500'}`} />
                      <span className="text-[8px] text-slate-500 font-bold tracking-tight">INGEST</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-[10px] text-slate-200 line-clamp-1">{sub.name}</h4>
                      <p className="text-[8px] text-slate-500 font-mono mt-0.5 mt-px line-clamp-1 truncate">{sub.label.split(' ')[0]}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* In-between connection line indicators */}
            <div className="col-span-3 flex justify-around text-slate-600 text-[10px] select-none">
              <span>⬇</span>
              <span>⬇</span>
              <span>⬇</span>
            </div>

            {/* Row 2: DATA & RESOLVER */}
            <div className="col-span-3 grid grid-cols-3 gap-3">
              {subsystems.filter(s => ['datafabric', 'graphengine', 'governance'].includes(s.id)).map(sub => {
                const Icon = sub.icon;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubsystem(sub.id)}
                    className={`p-3.5 rounded-lg border text-left flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                      selectedSubsystem === sub.id 
                        ? 'bg-indigo-950/50 border-indigo-400 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.25)]' 
                        : 'bg-[#04081c] border-border/20 hover:border-indigo-500/45 hover:bg-[#070c2a]/40'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <Icon className={`w-4 h-4 ${selectedSubsystem === sub.id ? 'text-indigo-400' : 'text-slate-500'}`} />
                      <span className="text-[8px] text-slate-500 font-bold tracking-tight">RESOLVER</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-[10px] text-slate-200 line-clamp-1">{sub.name}</h4>
                      <p className="text-[8px] text-slate-500 font-mono mt-0.5 line-clamp-1 truncate">{sub.label.split(' ')[0]}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* In-between connection line indicators */}
            <div className="col-span-3 flex justify-around text-slate-600 text-[10px] select-none">
              <span>⬇</span>
              <span>⬇</span>
              <span>⬇</span>
            </div>

            {/* Row 3: DECISION & SIMULATE */}
            <div className="col-span-3 grid grid-cols-3 gap-3">
              {subsystems.filter(s => ['enterpriseos', 'aiintel', 'digitaltwin'].includes(s.id)).map(sub => {
                const Icon = sub.icon;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubsystem(sub.id)}
                    className={`p-3.5 rounded-lg border text-left flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                      selectedSubsystem === sub.id 
                        ? 'bg-indigo-950/50 border-indigo-400 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.25)]' 
                        : 'bg-[#04081c] border-border/20 hover:border-indigo-500/45 hover:bg-[#070c2a]/40'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <Icon className={`w-4 h-4 ${selectedSubsystem === sub.id ? 'text-indigo-400' : 'text-slate-500'}`} />
                      <span className="text-[8px] text-slate-500 font-bold tracking-tight">COGNITION</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-[10px] text-slate-200 line-clamp-1">{sub.name}</h4>
                      <p className="text-[8px] text-slate-500 font-mono mt-0.5 line-clamp-1 truncate">{sub.label.split(' ')[0]}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* In-between connection line indicators */}
            <div className="col-span-3 flex justify-around text-slate-600 text-[10px] select-none">
              <span>⬇</span>
              <span>⬇</span>
              <span>⬇</span>
            </div>

            {/* Row 4: GLASS PANES AND ACTIVE MAP */}
            <div className="col-span-3 grid grid-cols-2 gap-3">
              {subsystems.filter(s => ['commandcenter', 'opsmap'].includes(s.id)).map(sub => {
                const Icon = sub.icon;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubsystem(sub.id)}
                    className={`p-3.5 rounded-lg border text-left flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                      selectedSubsystem === sub.id 
                        ? 'bg-indigo-950/50 border-indigo-400 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.25)]' 
                        : 'bg-[#04081c] border-border/20 hover:border-indigo-500/45 hover:bg-[#070c2a]/40'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <Icon className={`w-4 h-4 ${selectedSubsystem === sub.id ? 'text-indigo-400' : 'text-slate-500'}`} />
                      <span className="text-[8px] text-slate-500 font-bold tracking-tight">OVERSIGHT</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-[10px] text-slate-200 line-clamp-1">{sub.name}</h4>
                      <p className="text-[8px] text-slate-500 font-mono mt-0.5 line-clamp-1 truncate">{sub.label.split(' ')[0]}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mini active connections ledger */}
          <div className="border-t border-border/10 pt-3 text-[9px] text-slate-500 flex justify-between items-center">
            <span>ACTIVE SYSTEM INTERCONNECTIONS: {connections.length} HIGH-SPEED ENVOYS</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              STATUS: NOMINAL
            </span>
          </div>
        </div>

        {/* Right Side: High-density diagnostic reader panel */}
        <div id="subsystem-diagnostic-pane" className="lg:col-span-2 bg-[#050a21] border border-border/30 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="border-b border-border/10 pb-2">
              <span className="text-[8px] text-indigo-400 font-mono block">SYSTEM METRICS SCHEMA</span>
              <h3 className="text-sm font-bold text-white font-sans uppercase flex items-center gap-1.5">
                <currentModule.icon className="w-4 h-4 text-indigo-400" />
                {currentModule.name}
              </h3>
              <p className="text-[9px] text-slate-400 font-mono mt-0.5">{currentModule.label}</p>
            </div>

            {/* Core Purpose Paragraph */}
            <div className="space-y-1">
              <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wide">Purpose & Mandate</span>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{currentModule.purpose}</p>
            </div>

            {/* Dynamic I/O specifications */}
            <div className="grid grid-cols-2 gap-3 py-1 bg-[#020510] p-2.5 rounded border border-border/15">
              <div>
                <span className="text-[8px] text-slate-500 font-mono block">INPUT ARRAYS</span>
                <ul className="list-disc pl-3 text-[9px] text-slate-400 space-y-0.5 font-sans leading-relaxed">
                  {currentModule.inputs.map((inp, idx) => (
                    <li key={idx}>{inp}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-[8px] text-slate-500 font-mono block">OUTPUT STREAM</span>
                <ul className="list-disc pl-3 text-[9px] text-slate-400 space-y-0.5 font-sans leading-relaxed">
                  {currentModule.outputs.map((out, idx) => (
                    <li key={idx}>{out}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Responsibilities list */}
            <div className="space-y-1.5">
              <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wide">Principal Subsystem Responsibilities</span>
              <div className="space-y-1">
                {currentModule.responsibilities.map((resp, idx) => (
                  <div key={idx} className="flex gap-1.5 items-start text-[10px] text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00ffd1] shrink-0 mt-0.5" />
                    <span className="font-sans leading-normal">{resp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dependencies block */}
            <div className="space-y-1 pt-1.5 border-t border-border/10">
              <span className="text-[9px] text-slate-500 font-mono block uppercase">Operational Dependencies</span>
              <div className="flex flex-wrap gap-1 text-[9px] font-mono">
                {currentModule.dependencies.map((dep, idx) => (
                  <span key={idx} className="px-1.5 py-0.5 rounded bg-indigo-950/40 text-indigo-300 border border-indigo-500/10">
                    {dep}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Operational advice action footer */}
          <div className="bg-[#030614] p-3 rounded-lg border border-[#00ffd1]/10 border-dashed text-[10px] space-y-1.5 font-sans">
            <span className="font-mono text-[9px] font-bold text-[#00ffd1] block uppercase tracking-wide">OPERATIONAL MANDATE INDEX</span>
            <p className="text-slate-400 font-sans leading-relaxed text-[11px]">{currentModule.operationalRole}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

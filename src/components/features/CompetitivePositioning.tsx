import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, Shield, Sparkles, Check, X, ShieldCheck, 
  HelpCircle, Zap, Target, TrendingUp, Info
} from 'lucide-react';

interface CompetitorProfile {
  id: string;
  name: string;
  category: string;
  sharedCapabilities: string[];
  differentiators: string[];
  uniqueSentinelXAdvantage: string;
  strategicPositioning: string;
}

export function CompetitivePositioning() {
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>('sentinel');

  const competitors: CompetitorProfile[] = [
    {
      id: 'sentinel',
      name: 'Microsoft Sentinel',
      category: 'Legacy SIEM/SOAR',
      sharedCapabilities: [
        'Centralized cloud-native syslog ingestion logs',
        'Standard rules-driven alert correlations',
        'Multi-vector query search systems'
      ],
      differentiators: [
        'Deterministic lateral attack simulation (SentinelX models exactly how breaches spread tick-by-tick)',
        'Business operating system layer modeling financial damage per hour',
        'Zero-trust topological checking automatic controls'
      ],
      uniqueSentinelXAdvantage: 'SentinelX bridges direct IT parameters to C-suite financial loss metrics, mapping direct application-to-database lineages.',
      strategicPositioning: 'While Microsoft Sentinel is an excellent retrospective search index, SentinelX operates as an active, business-aware cyber battlespace simulation and containment loop.'
    },
    {
      id: 'splunk',
      name: 'Splunk Enterprise Security',
      category: 'Data Lake & Logs Analytics',
      sharedCapabilities: [
        'Silo-busting centralized logging indexes',
        'Custom dashboard builder widgets',
        'High-density diagnostics streams'
      ],
      differentiators: [
        'Autonomic containment response playbooks (SentinelX severs graph connections instantly)',
        'Digital Twin simulation sandbox to model outages without production risk',
        'Gemini LLM reasoning summaries integrated into terminals'
      ],
      uniqueSentinelXAdvantage: 'SentinelX includes built-in cyber-warfare scenarios (DDoS, Ransomware, Insider) allowing teams to proactively stress-test their configurations.',
      strategicPositioning: 'Splunk requires complex query setups to retroactively find breaches. SentinelX provides interactive, visual topology mapping to catch threats live on-screen.'
    },
    {
      id: 'qradar',
      name: 'IBM QRadar',
      category: 'Enterprise SIEM',
      sharedCapabilities: [
        'Heuristic network packet summaries',
        'Multi-tenant enterprise partitions',
        'Auditable administrative timelines'
      ],
      differentiators: [
        'Modern React & lightweight Node telemetry mesh structure',
        'Vulnerability status indexes mapped dynamically to direct lines of business UI layouts',
        'Personnel directories map administrators to database owners instantly'
      ],
      uniqueSentinelXAdvantage: 'SentinelX removes legacy SIEM hardware footprints, operating on light container environments linked to standard Redis streams.',
      strategicPositioning: 'QRadar focuses extensively on regulatory retention reporting. SentinelX focuses on rapid containment automation to stop active zero-day propagation.'
    },
    {
      id: 'crowdstrike',
      name: 'CrowdStrike Falcon',
      category: 'Endpoint Detection & Response (EDR)',
      sharedCapabilities: [
        'Granular endpoint host-level event stream catches',
        'Automated file quarantines on servers',
        'Syslog normalizations'
      ],
      differentiators: [
        'Exposes the complete corporate mapping topology, not just isolated endpoints',
        'Models inter-node network data-flows and edge dependencies',
        'Decoupled simulation environment does not risk blue-screens'
      ],
      uniqueSentinelXAdvantage: 'SentinelX models organizational dependency structures, calculating compliance risks across lines of business if critical hosts are isolated.',
      strategicPositioning: 'CrowdStrike acts at the physical process level of endpoints. SentinelX acts at the logical enterprise layer, coordinating full-subnet structural integrity.'
    },
    {
      id: 'wiz',
      name: 'Wiz',
      category: 'Cloud Security Posture Management (CSPM)',
      sharedCapabilities: [
        'Cross-platform multi-cloud asset inventories',
        'Interactive graph representations of connected resources',
        'Compliance and vulnerability checklists'
      ],
      differentiators: [
        'Live system-call and socket telemetry ingestion (via Falco / Suricata streams)',
        'Active on-screen mitigation commands to sever paths',
        'Interactive battlespace simulation gameplay features'
      ],
      uniqueSentinelXAdvantage: 'SentinelX fuses real-time network packet activity with cloud configurations to model live attacks, whereas CSPM tools audit static snapshots.',
      strategicPositioning: 'Wiz audits vulnerabilities and highlights risks in static cloud files. SentinelX is a dynamic virtual operating system managing high-tempo actions.'
    },
    {
      id: 'darktrace',
      name: 'Darktrace',
      category: 'AI-driven Network Security',
      sharedCapabilities: [
        'Heuristic network traffic anomaly alerts',
        'Self-learning network baseline creations',
        'Automated defensive actions'
      ],
      differentiators: [
        'Gemini AI diagnostic logs explaining exactly why systems are flagged',
        'Detailed business impact scoring maps showing SLA outage damage',
        'Clear, open-box playbooks that preserve operator override signatures'
      ],
      uniqueSentinelXAdvantage: 'SentinelX matches threat patterns to internal personnel files and compliance guidelines, exposing which managers must coordinate resolutions.',
      strategicPositioning: 'Darktrace operates as a closed-box blackbox router. SentinelX provides fully transparent, auditable compliance paths paired with interactive simulations.'
    }
  ];

  const currentComp = competitors.find(c => c.id === selectedCompetitor) || competitors[0];

  return (
    <div id="competitive-positioning" className="bg-[#030615] border border-border/40 rounded-xl p-6 text-xs font-mono text-slate-300">
      <div className="flex justify-between items-center border-b border-border/15 pb-4 mb-6">
        <div>
          <h3 className="text-sm font-semibold text-white font-sans uppercase">Enterprise Strategic Positioning & Comparative Matrix</h3>
          <p className="text-[10px] text-slate-500 font-mono">Understand how SentinelX compares against legacy SIEMs, EDRs, and cloud security suites across the industry.</p>
        </div>
        <span className="px-2.5 py-0.5 bg-indigo-950/40 text-indigo-400 border border-indigo-500/20 rounded font-mono text-[10px]">competitive intelligence</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Selector Menu */}
        <div className="lg:col-span-1 space-y-1.5">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-2 px-1">COMPETITING PLATFORMS</span>
          {competitors.map(comp => (
            <button
              key={comp.id}
              onClick={() => setSelectedCompetitor(comp.id)}
              className={`w-full text-left p-3 rounded-lg border transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                selectedCompetitor === comp.id 
                  ? 'bg-indigo-950/45 border-indigo-500/40 text-indigo-300' 
                  : 'bg-[#04081c] border-border/15 text-slate-400 hover:bg-[#070c2a]/40 hover:text-slate-200'
              }`}
            >
              <Building2 className={`w-4 h-4 shrink-0 ${selectedCompetitor === comp.id ? 'text-indigo-400' : 'text-slate-500'}`} />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[10px] text-slate-200 truncate uppercase">{comp.name}</div>
                <div className="text-[8px] text-slate-500 mt-0.5 truncate uppercase">{comp.category}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Diagnostic Compare Board */}
        <div className="lg:col-span-3 bg-[#020511] border border-border/20 rounded-xl p-5 space-y-4">
          <div className="border-b border-border/10 pb-2 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
            <div>
              <span className="text-[8px] text-indigo-400 font-mono block uppercase">Strategic analysis vs.</span>
              <h4 className="text-sm font-bold text-slate-200 font-sans uppercase">{currentComp.name}</h4>
            </div>
            <span className="px-2 py-0.5 bg-[#121c42] text-indigo-300 border border-indigo-500/20 rounded text-[9px] font-mono uppercase">
              {currentComp.category}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Shared capabilities list */}
            <div className="bg-[#04081c] p-4 rounded-lg border border-border/10 space-y-2.5">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wide block flex items-center gap-1.5 font-mono">
                <Check className="w-4.5 h-4.5 text-emerald-400" />
                Shared Capabilities
              </span>
              <div className="space-y-1.5">
                {currentComp.sharedCapabilities.map((cap, idx) => (
                  <div key={idx} className="flex gap-2 items-start text-[10px] text-slate-400 font-sans">
                    <span className="text-slate-500">•</span>
                    <span>{cap}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Differentiators list */}
            <div className="bg-[#050a22]/50 p-4 rounded-lg border border-indigo-500/10 space-y-2.5">
              <span className="text-[9px] text-[#00ffd1] font-bold uppercase tracking-wide block flex items-center gap-1.5 font-mono">
                <Zap className="w-4 h-4 text-[#00ffd1]" />
                SentinelX Differentiators
              </span>
              <div className="space-y-1.5">
                {currentComp.differentiators.map((diff, idx) => (
                  <div key={idx} className="flex gap-2 items-start text-[10px] text-slate-200 font-sans">
                    <span className="text-[#00ffd1] font-bold">✓</span>
                    <span>{diff}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Unique advantage callout */}
          <div className="bg-indigo-950/15 border border-indigo-500/20 p-4 rounded-lg space-y-2 font-sans">
            <span className="text-[9px] text-indigo-400 font-bold block uppercase font-mono flex items-center gap-1.5">
              <Target className="w-4 h-4 text-indigo-400" />
              Unique Strategic Advantage
            </span>
            <p className="text-slate-300 leading-relaxed text-[11.5px]">{currentComp.uniqueSentinelXAdvantage}</p>
          </div>

          {/* Core positioning narrative */}
          <div className="bg-slate-900/40 p-4 rounded-lg space-y-1.5 font-sans border border-border/10">
            <span className="text-[9.5px] text-slate-400 font-bold block uppercase font-mono flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-slate-400" />
              Strategic Positioning Summary
            </span>
            <p className="text-slate-400 leading-relaxed text-[11.5px] italic">"{currentComp.strategicPositioning}"</p>
          </div>
        </div>
      </div>
    </div>
  );
}

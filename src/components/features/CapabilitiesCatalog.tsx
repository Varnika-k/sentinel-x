import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, Shield, Globe, ShieldAlert, Database, Search, 
  Activity, Users, Sparkles, Server, CheckCircle2, AlertTriangle, Play, HelpCircle
} from 'lucide-react';

interface ComponentCapability {
  name: string;
  purpose: string;
  benefits: string[];
  useCases: string[];
  dependencies: string[];
  status: 'ACTIVE_ONLINE' | 'STANDBY_READY' | 'ENFORCING';
}

interface CapabilityGroup {
  id: string;
  title: string;
  icon: any;
  description: string;
  capabilities: ComponentCapability[];
}

export function CapabilitiesCatalog() {
  const [activeGroupId, setActiveGroupId] = useState<string>('intel');
  const [catalogSearch, setCatalogSearch] = useState<string>('');

  const groups: CapabilityGroup[] = [
    {
      id: 'intel',
      title: 'Enterprise Intelligence',
      icon: Sparkles,
      description: 'Translates raw low-level security indicators into strategic corporate-level knowledge schemas.',
      capabilities: [
        {
          name: 'Enterprise Knowledge Fabric',
          purpose: 'Model organizational entities (employees, devices, services) and track relationships semantically.',
          benefits: ['Expose critical connection pathways', 'Map key administrative ownership profiles', 'Assess upstream vulnerabilities dynamically'],
          useCases: ['Investigating potential lateral infection endpoints', 'Validating systems security clearance alignment'],
          dependencies: ['Graph Intelligence Engine', 'Metadata Storage Core'],
          status: 'ACTIVE_ONLINE'
        },
        {
          name: 'Dependency Intelligence',
          purpose: 'Map microservice links to ensure real-time awareness of cascading infrastructural failure vectors.',
          benefits: ['Lower diagnostic verification overhead', 'Instantly trace database parent routers', 'Calculate realistic outage risk boundaries'],
          useCases: ['Dry-running database migration windows', 'Estimating active failure blast radii'],
          dependencies: ['Universal Connector Framework'],
          status: 'ACTIVE_ONLINE'
        }
      ]
    },
    {
      id: 'secops',
      title: 'Security Operations',
      icon: Shield,
      description: 'Provides tactical intrusion detection, real-time alert logs, and centralized SOC tools.',
      capabilities: [
        {
          name: 'Enterprise Command Center',
          purpose: 'A single administrative glass-pane displaying maps, diagnostic terminals, and active incident lists.',
          benefits: ['Instant visibility on ongoing infections', 'Zero UI fatigue high-density HUD', 'Direct override mitigation controls'],
          useCases: ['Handling active zero-day attacks', 'General operations monitoring'],
          dependencies: ['Core Event Bus', 'D3 Visualizers'],
          status: 'ACTIVE_ONLINE'
        },
        {
          name: 'Operations Map',
          purpose: 'Dynamic SVG topology canvas visualizing real-time packet transmissions and compromised state glow alerts.',
          benefits: ['Trace attack propagation directions physically', 'Coordinate-scaled layout adjusts with zoom limits'],
          useCases: ['Visualizing structural breaches during active incidents'],
          dependencies: ['Graph Intelligence Engine'],
          status: 'ACTIVE_ONLINE'
        }
      ]
    },
    {
      id: 'gov',
      title: 'Governance & SLA',
      icon: Server,
      description: 'Enforces operational secure boundaries, verifies patches, and tracks corporate uptime goals.',
      capabilities: [
        {
          name: 'Governance Intelligence',
          purpose: 'Validate organizational compliance, privilege distribution, and system versions dynamically.',
          benefits: ['Continuous zero-trust audits', 'Proactive identification of credential drifting'],
          useCases: ['Validating database encryption compliance benchmarks', 'Assessing software safety states'],
          dependencies: ['Enterprise Operating System'],
          status: 'ENFORCING'
        },
        {
          name: 'SLA Readiness Auditor',
          purpose: 'Correlate host downtime metrics into compliance breach risk scores (0-100%).',
          benefits: ['Track precise contract exposures', 'Quantify legal-compliance safety levels before failures'],
          useCases: ['Drafting strategic outage mitigation priorities'],
          dependencies: ['Enterprise State Engine'],
          status: 'ENFORCING'
        }
      ]
    },
    {
      id: 'identity',
      title: 'Identity Intelligence',
      icon: Users,
      description: 'Exposes user folders, maps security clearance structures, and stops credential abuse propagation.',
      capabilities: [
        {
          name: 'Ownership Intelligence',
          purpose: 'Resolve dynamic owners (e.g. employee contacts, departments) connected to cluster hosts.',
          benefits: ['Instant triage dispatch metrics', 'Trace direct responsibility levels', 'Minimize remediation contact latency'],
          useCases: ['Contacting active developers regarding compromised systems in their domain'],
          dependencies: ['Secure LDAP Connector API'],
          status: 'ACTIVE_ONLINE'
        },
        {
          name: 'Identity Access Auditor',
          purpose: 'Track privilege drifts on service accounts and verify that no administrator privileges have expired.',
          benefits: ['Prevent silent horizontal progression via hijacked credentials', 'Expose unused high-privilege keys'],
          useCases: ['Insider risk auditing', 'Assessing over-privileged third-party integrations API'],
          dependencies: ['Telemetry Fabric Normalizer'],
          status: 'ACTIVE_ONLINE'
        }
      ]
    },
    {
      id: 'search',
      title: 'Enterprise Search',
      icon: Search,
      description: 'Allows operators to run complex, multi-layer searches across registries, directories, and databases.',
      capabilities: [
        {
          name: 'Unified Query Engine',
          purpose: 'Perform instant lookup commands matching names, database keys, or subnet IP arrays.',
          benefits: ['Eliminate file catalog silos', 'Retrieve operational connections instantly on a single input'],
          useCases: ['Locating all systems owned by specific resigned personnel'],
          dependencies: ['Enterprise Data Fabric', 'Redis streams'],
          status: 'ACTIVE_ONLINE'
        }
      ]
    },
    {
      id: 'twin',
      title: 'Digital Twin Simulations',
      icon: Sparkles,
      description: 'A mathematical sandbox environment modeling horizontal attack propagations and outage stress.',
      capabilities: [
        {
          name: 'Resilience Simulator',
          purpose: 'Run "what-if" campaigns to model malware lateral drift dynamics securely.',
          benefits: ['Zero risk to customer uptime', 'Measure secure boundary effectiveness and isolation boundaries'],
          useCases: ['Testing defense survivability on mirrored core architectures'],
          dependencies: ['SIR mathematical models'],
          status: 'ACTIVE_ONLINE'
        },
        {
          name: 'Collateral Blast Forecaster',
          purpose: 'Forecast downstream impacts and estimated corporate loss ratios in monetary values.',
          benefits: ['Empirical and financial business risk projections'],
          useCases: ['Strategic cyber insurance audits', 'Reviewing disaster-recovery priorities'],
          dependencies: ['Enterprise OS Engine'],
          status: 'ACTIVE_ONLINE'
        }
      ]
    },
    {
      id: 'ai',
      title: 'AI Reasoning Studio',
      icon: Terminal,
      description: 'Utilizes Gemini-powered cognitive blocks to compile incident summaries and strategic advisories.',
      capabilities: [
        {
          name: 'Cognitive Summarizer',
          purpose: 'Distill voluminous technical alerts into short, scannable natural-language logs.',
          benefits: ['Minimize analysis fatigue', 'Empowers non-technical executives during critical events'],
          useCases: ['Assembling post-incident diagnostic timelines'],
          dependencies: ['Gemini API via @google/genai'],
          status: 'ACTIVE_ONLINE'
        },
        {
          name: 'Strategic Advisory Node',
          purpose: 'Generate structured mitigation workflows (isolation steps, patching coordinates).',
          benefits: ['Guided remediation paths for junior security analysts'],
          useCases: ['Automated remediation planning during outages'],
          dependencies: ['Gemini API', 'Enterprise Memory Registers'],
          status: 'ACTIVE_ONLINE'
        }
      ]
    },
    {
      id: 'fabric',
      title: 'Enterprise Data Fabric',
      icon: Database,
      description: 'The secure global persistence layer synchronization, coordinating relational databases and state caches.',
      capabilities: [
        {
          name: 'State Cache Synchronizer',
          purpose: 'Coordinates real-time operations records across distributed edge directories.',
          benefits: ['Guarantees reliable persistence', 'Maintains state consistency during sudden outages'],
          useCases: ['Saving complex simulation parameters for team review'],
          dependencies: ['Firestore broker integrations', 'Redis Streams'],
          status: 'ACTIVE_ONLINE'
        }
      ]
    },
    {
      id: 'telemetry',
      title: 'Telemetry Fusion Mesh',
      icon: Activity,
      description: 'Fuses granular system-call metrics and network logs from Suricata and Falco probes.',
      capabilities: [
        {
          name: 'Multi-Source Fusion Normalizer',
          purpose: 'Parse heterogeneous network signatures and security signals into standardized incident events.',
          benefits: ['Clean, normalized event streams', 'Removes duplicate logging noise'],
          useCases: ['Correlating suspicious logins with public network access attempts'],
          dependencies: ['Falco & Suricata Agents'],
          status: 'ACTIVE_ONLINE'
        }
      ]
    },
    {
      id: 'response',
      title: 'Response Orchestration',
      icon: ShieldAlert,
      description: 'Automates direct isolation commands and access block scripts to quarantine lateral infections.',
      capabilities: [
        {
          name: 'Autonomic Containment Controller',
          purpose: 'Execute sub-second isolation playbooks once critical threshold violations occur.',
          benefits: ['Zero-interval lateral blockade', 'Reduces ransomware propagation blast radii to near-zero'],
          useCases: ['Quarantining database subnets once a breach is flagged on boundary routers'],
          dependencies: ['Graph Intelligence Engine', 'Mitigation scripts registry'],
          status: 'ACTIVE_ONLINE'
        }
      ]
    }
  ];

  const filteredGroups = useMemo(() => {
    if (!catalogSearch.trim()) return groups;
    return groups.map(g => {
      const matchedCaps = g.capabilities.filter(c => 
        c.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        c.purpose.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        c.benefits.some(b => b.toLowerCase().includes(catalogSearch.toLowerCase()))
      );
      return { ...g, capabilities: matchedCaps };
    }).filter(g => g.capabilities.length > 0);
  }, [catalogSearch]);

  const activeGroup = useMemo(() => {
    return groups.find(g => g.id === activeGroupId) || groups[0];
  }, [activeGroupId]);

  return (
    <div id="capabilities-catalog" className="bg-[#030615] border border-border/40 rounded-xl p-6 text-xs font-mono text-slate-300">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-border/15 pb-4 mb-6">
        <div>
          <h3 className="text-sm font-semibold text-white font-sans uppercase">Unified Platform Capabilities Center</h3>
          <p className="text-[10px] text-slate-500 font-mono">Comprehensive index of the 21 major capabilities driving SentinelX autonomic cyber resilience.</p>
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search capabilities..."
            className="bg-[#020511] border border-border/30 rounded py-1.5 px-3 pl-8 text-[11px] font-mono outline-none focus:border-indigo-500/50 transition w-60 text-slate-200"
            value={catalogSearch}
            onChange={(e) => setCatalogSearch(e.target.value)}
          />
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Category selector list */}
        <div className="lg:col-span-1 space-y-1.5">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-2 px-1">SECURITY LAYER TAXONOMY</span>
          {groups.map(group => {
            const Icon = group.icon;
            const isSelected = activeGroupId === group.id && !catalogSearch;
            return (
              <button
                key={group.id}
                disabled={!!catalogSearch}
                onClick={() => setActiveGroupId(group.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-200 flex items-center gap-3 cursor-pointer ${
                  catalogSearch ? 'opacity-40 cursor-not-allowed bg-transparent border-transparent' :
                  isSelected 
                    ? 'bg-indigo-950/45 border-indigo-500/40 text-indigo-300' 
                    : 'bg-[#04081c] border-border/15 text-slate-400 hover:bg-[#070c2a]/40 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[10px] text-slate-200 truncate uppercase">{group.title}</div>
                  <div className="text-[8px] text-slate-500 mt-0.5 truncate uppercase">{group.capabilities.length} Capabilities</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Side: Active Category Items or Search Results */}
        <div className="lg:col-span-3 space-y-4">
          {catalogSearch && (
            <div className="text-[10px] text-slate-400 mb-2 font-mono uppercase bg-[#090f23]/30 p-2 border border-border/15 rounded">
              SEARCH RESULTS MATCHING: "{catalogSearch}" — {filteredGroups.reduce((acc, g) => acc + g.capabilities.length, 0)} MATED PLATFORM SYSTEMS DISCOVERED
            </div>
          )}

          <div className="space-y-4">
            {(catalogSearch ? filteredGroups : [activeGroup]).map(gr => (
              <div key={gr.id} className="space-y-4">
                {catalogSearch && (
                  <div className="flex items-center gap-2 text-[10px] text-indigo-400 font-bold tracking-tight border-b border-border/10 pb-1 uppercase">
                    <gr.icon className="w-3.5 h-3.5" />
                    <span>{gr.title}</span>
                  </div>
                )}
                
                {!catalogSearch && (
                  <div className="p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-lg text-slate-300 mb-4 font-sans leading-relaxed text-[12px]">
                    <h4 className="font-bold text-white mb-1 uppercase font-mono text-[10px] flex items-center gap-1.5 text-indigo-400">
                      <activeGroup.icon className="w-4 h-4" />
                      About {activeGroup.title}
                    </h4>
                    {activeGroup.description}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gr.capabilities.map((cap, cidx) => (
                    <div key={cidx} className="bg-[#04081c]/70 border border-border/20 hover:border-border/40 transition p-4 rounded-xl space-y-3.5 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start border-b border-border/10 pb-2">
                          <h4 className="font-bold text-slate-100 text-[11px] font-mono leading-tight">{cap.name}</h4>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-mono tracking-tight font-bold ${
                            cap.status === 'ENFORCING' ? 'bg-amber-950 text-amber-300 border border-amber-500/20 animate-pulse' : 'bg-emerald-950 text-[#00ffd1] border border-emerald-500/25'
                          }`}>
                            {cap.status}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[8px] text-slate-500 font-bold block uppercase font-mono">Purpose</span>
                          <p className="text-[11px] text-slate-300 leading-normal font-sans">{cap.purpose}</p>
                        </div>

                        <div className="space-y-1 py-1">
                          <span className="text-[8px] text-slate-500 font-bold block uppercase font-mono">Strategic Benefits</span>
                          <div className="space-y-0.5">
                            {cap.benefits.map((ben, idx) => (
                              <div key={idx} className="flex gap-1.5 items-start text-[10px] text-slate-400 font-sans">
                                <span className="text-[#00ffd1] select-none">✔</span>
                                <span className="leading-normal">{ben}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[8px] text-slate-500 font-bold block uppercase font-mono">Validated Use Cases</span>
                          <div className="space-y-0.5">
                            {cap.useCases.map((uc, idx) => (
                              <div key={idx} className="flex gap-1.5 items-start text-[10px] text-slate-400 font-sans">
                                <span className="text-indigo-400 select-none">›</span>
                                <span className="leading-normal italic">{uc}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-border/10 pt-2 text-[9px] text-slate-500 font-mono flex flex-wrap gap-x-3 gap-y-1">
                        <span>Dependencies:</span>
                        {cap.dependencies.map((dep, idx) => (
                          <strong key={idx} className="text-slate-400">{dep}</strong>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            ))}

            {catalogSearch && filteredGroups.length === 0 && (
              <div className="p-8 text-center border border-dashed border-border/40 rounded-xl text-slate-500 font-mono">
                No matching platform capabilities discovered in our indexing catalog. Try adjusting terms.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

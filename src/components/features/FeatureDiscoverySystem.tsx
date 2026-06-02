import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Compass, Search, Tag, Server, Shield, Brain, Database, Link, Briefcase, 
  Workflow, CheckCircle, HelpCircle, ArrowUpRight
} from 'lucide-react';

interface DiscoveryItem {
  name: string;
  type: 'feature' | 'module' | 'capability' | 'workflow' | 'integration' | 'use-case';
  layer: string;
  description: string;
  targetLink: string;
  details: string;
}

export function FeatureDiscoverySystem() {
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('all');
  const [activeLayerFilter, setActiveLayerFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const discoveryDb: DiscoveryItem[] = [
    {
      name: 'Ransomware Attack Modeling',
      type: 'use-case',
      layer: 'Digital Twin Sandbox',
      description: 'Model automated lateral encryption campaigns traversing database subnets.',
      targetLink: 'Simulation View / Scenarios',
      details: 'Evaluates file lock propagation, firewall integrity boundaries, and operational health consequences tick-by-tick.'
    },
    {
      name: 'Direct Quarantine Severing',
      type: 'workflow',
      layer: 'Autonomous Response',
      description: 'Immediate isolation of infected application coordinates on the network topology.',
      targetLink: 'Isolate Host Node Command',
      details: 'Removes edge links from the Graph Intelligence Engine, shielding database directories from malicious lateral queries.'
    },
    {
      name: 'Falco Syscall Agent Ingest',
      type: 'integration',
      layer: 'Telemetry Ingestion Mesh',
      description: 'Connect local or cloud kernel operations logs to standard local event streams.',
      targetLink: 'Telemetry Diagnostics',
      details: 'Captures namespace violations, write-configuration failures, and privilege escalations inside Kubernetes host systems.'
    },
    {
      name: 'Suricata Signature Alert Normalization',
      type: 'integration',
      layer: 'Telemetry Ingestion Mesh',
      description: 'Ingest raw network protocols, signature matches, and traffic spikes.',
      targetLink: 'Event Panel',
      details: 'Converts unstructured network warnings into structured local Event entities containing mapped severity tiers.'
    },
    {
      name: 'SLA Business Outage Projections',
      type: 'capability',
      layer: 'Enterprise OS Core',
      description: 'Calculate monetary damage totals (USD/hour) under active server outages.',
      targetLink: 'Enterprise OS Layout',
      details: 'Translates host-down downtime into real-time financial risk metrics, balancing security quarantines with client SLA guidelines.'
    },
    {
      name: 'Gemini NLP Log Consolidation',
      type: 'module',
      layer: 'AI Intelligence Studio',
      description: 'Summarize extensive technical logs into clear, readable strategic advisory paragraphs.',
      targetLink: 'AI Reasoning Studio',
      details: 'Reduces SOC analysis fatigue by delivering plain-English descriptions of how breach incidents unfolded.'
    },
    {
      name: 'Interactive System Architecture Explorer',
      type: 'feature',
      layer: 'Command Center Deck',
      description: 'Visualize cross-subsystem dependencies, structural routes, and data flows in real-time.',
      targetLink: 'Architecture Map Tab',
      details: 'Clickable schematic mapping out relationships from sensory telemetry layers up to final glass-pane panels.'
    },
    {
      name: 'Competitor Compare Positioning Matrix',
      type: 'feature',
      layer: 'Product Positioning Hub',
      description: 'Detailed analysis of SentinelX advantages vs Microsoft Sentinel, Splunk, CrowdStrike, and Wiz.',
      targetLink: 'Competitive Analysis',
      details: 'Breaks down shared security baselines, differentiators, and strategic postures.'
    },
    {
      name: 'DDoS Capacity Attack Scenario',
      type: 'use-case',
      layer: 'Digital Twin Sandbox',
      description: 'Test server survivability under high-velocity packet ingestion stress.',
      targetLink: 'Launch DDoS Campaign',
      details: 'Simulates connection exhausts to identify bottleneck routers before production workloads deploy.'
    },
    {
      name: 'Insider Privilege Access Drift Audit',
      type: 'workflow',
      layer: 'Identity Intelligence',
      description: 'Track over-permissioned supports accounts or credentials reuse anomalies.',
      targetLink: 'Governance Board',
      details: 'Flags direct access risks by matching Active Directory personnel logs with internal database credentials permissions.'
    },
    {
      name: 'Zero-Trust Network Checkpoints',
      type: 'capability',
      layer: 'Governance Engine',
      description: 'Proactively audits network configurations to flag unauthorized public-to-private links.',
      targetLink: 'Enterprise OS compliance',
      details: 'Ensures that ingress gateways are separated from databases by firewalls, and calculates a dynamic compliance rating.'
    }
  ];

  const filteredItems = useMemo(() => {
    return discoveryDb.filter(item => {
      const typeMatches = activeTypeFilter === 'all' || item.type === activeTypeFilter;
      const layerMatches = activeLayerFilter === 'all' || item.layer === activeLayerFilter;
      const termMatches = !searchTerm.trim() || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.layer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase());
      return typeMatches && layerMatches && termMatches;
    });
  }, [activeTypeFilter, activeLayerFilter, searchTerm]);

  const uniqueLayers = useMemo(() => {
    return Array.from(new Set(discoveryDb.map(item => item.layer)));
  }, []);

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'use-case': return 'bg-cyan-950/40 text-cyan-400 border border-cyan-500/10';
      case 'workflow': return 'bg-purple-950/40 text-purple-400 border border-purple-500/10';
      case 'integration': return 'bg-amber-950/40 text-amber-400 border border-amber-500/10';
      case 'capability': return 'bg-emerald-950/40 text-[#00ffd1] border border-emerald-500/10';
      case 'module': return 'bg-sky-950/40 text-sky-400 border border-sky-500/10';
      default: return 'bg-blue-950/40 text-blue-400 border border-blue-500/10';
    }
  };

  return (
    <div id="feature-discovery" className="bg-[#030615] border border-border/40 rounded-xl p-6 text-xs font-mono text-slate-300">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-border/15 pb-4 mb-6">
        <div>
          <h3 className="text-sm font-semibold text-white font-sans uppercase">Unified Corporate Capabilities & Workflow Discovery Center</h3>
          <p className="text-[10px] text-slate-500 font-mono">Navigate administrative systems, inspect technical integrations, and explore incident workflows.</p>
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search taxonomy database..."
            className="bg-[#020511] border border-border/30 rounded py-1.5 px-3 pl-8 text-[11px] font-mono outline-none focus:border-indigo-500/50 transition w-64 text-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-500" />
        </div>
      </div>

      <div className="space-y-4">
        {/* Filter categories */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border/5 pb-3">
          <span className="text-[8.5px] text-slate-500 font-bold uppercase mr-2 flex items-center gap-1">
            <Tag className="w-3 h-3 text-slate-500" />
            Taxonomy:
          </span>
          {[
            { id: 'all', label: 'ALL CRITERIA' },
            { id: 'feature', label: 'FEATURES' },
            { id: 'module', label: 'MODULES' },
            { id: 'capability', label: 'CAPABILITIES' },
            { id: 'workflow', label: 'WORKFLOWS' },
            { id: 'integration', label: 'INTEGRATIONS' },
            { id: 'use-case', label: 'USE CASES' }
          ].map(tag => (
            <button
              key={tag.id}
              onClick={() => setActiveTypeFilter(tag.id)}
              className={`p-1 px-2 rounded-md font-mono text-[9px] uppercase border transition cursor-pointer ${
                activeTypeFilter === tag.id 
                  ? 'bg-indigo-600 border-indigo-400 text-white font-semibold' 
                  : 'bg-[#04081c] border-border/20 text-slate-400 hover:bg-[#070c2a]/40 hover:text-slate-200'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* Filter by layers */}
        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
          <span className="text-[8.5px] text-slate-500 font-bold uppercase mr-2 flex items-center gap-1">
            <Server className="w-3 h-3 text-slate-500" />
            Enterprise Subsystem:
          </span>
          <button
            onClick={() => setActiveLayerFilter('all')}
            className={`p-0.5 px-2 rounded font-mono text-[8px] uppercase border transition cursor-pointer ${
              activeLayerFilter === 'all' 
                ? 'bg-[#182352] text-indigo-300 border-indigo-500/40' 
                : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            All Subsystems
          </button>
          {uniqueLayers.map(layer => (
            <button
              key={layer}
              onClick={() => setActiveLayerFilter(layer)}
              className={`p-0.5 px-2 rounded font-mono text-[8px] uppercase border transition cursor-pointer ${
                activeLayerFilter === layer 
                  ? 'bg-[#182352] text-indigo-300 border-indigo-500/40' 
                  : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {layer}
            </button>
          ))}
        </div>

        {/* Discovery Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {filteredItems.map((item, idx) => (
            <div key={idx} className="bg-[#04081c]/60 border border-border/20 p-4 rounded-xl flex flex-col justify-between space-y-4 hover:border-indigo-500/30 transition-all">
              <div className="space-y-2.5">
                <div className="flex justify-between items-start gap-2">
                  <span className={`px-2 py-0.5 rounded font-mono uppercase text-[8px] font-bold ${getTypeStyle(item.type)}`}>
                    {item.type.replace('-', ' ')}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono text-right truncate max-w-40 uppercase">
                    {item.layer}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-100 text-[11px] font-mono leading-tight">{item.name}</h4>
                  <p className="text-[10px] text-slate-400 font-sans mt-1.5 leading-normal">{item.description}</p>
                </div>

                <div className="bg-[#020511] p-2 rounded border border-border/10">
                  <span className="text-[8px] text-slate-500 font-bold block uppercase font-mono mb-0.5">TECHNICAL MECHANICS</span>
                  <p className="text-[10px] text-slate-400 font-sans leading-relaxed">{item.details}</p>
                </div>
              </div>

              <div className="border-t border-border/5 pt-2 flex justify-between items-center text-[9px] font-mono">
                <span className="text-slate-500">Quick link:</span>
                <strong className="text-indigo-400 font-sans text-[10px] flex items-center gap-1">
                  {item.targetLink}
                  <ArrowUpRight className="w-3 h-3 text-indigo-500" />
                </strong>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="col-span-3 p-10 text-center border border-dashed border-border/30 rounded-xl text-slate-500 font-mono">
              No tactical blueprints discovered matching the selected filter criteria. Try reset filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

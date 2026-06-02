import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Activity, Shield, Brain, Sparkles, Database, Users, Building, 
  Search, ShieldAlert, DollarSign, TrendingUp, Layers, Play, CheckCircle, 
  HelpCircle, RefreshCw, X, ArrowRight, Server, Globe, FileText, AlertTriangle
} from 'lucide-react';

interface HealthMetrics {
  overallScore: number;
  operational: number;
  security: number;
  governance: number;
  business: number;
  infrastructure: number;
  workforce: number;
  trust: number;
  dependency: number;
}

interface ExecutiveState {
  timestamp: string;
  workforceCount: number;
  activeApplicationsCount: number;
  connectedDatabasesCount: number;
  infrastructureUtilization: number;
  governanceScore: number;
  activeIncidentsCount: number;
  activeCustomersImpacted: number;
  operationalState: 'NOMINAL' | 'DEGRADED' | 'CRITICAL' | 'EMERGENCY';
  activeThreatLevel: 'LOW' | 'GUARDED' | 'ELEVATED' | 'HIGH' | 'SEVERE';
}

interface TimelineEvent {
  id: string;
  category: 'incident' | 'deployment' | 'governance' | 'operational' | 'infrastructure' | 'identity' | 'business';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  initiator: string;
  affectedBU: string;
}

interface MemoryRecord {
  id: string;
  timestamp: string;
  incidentType: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  mitigated: boolean;
  recurringCounter: number;
}

interface SubsystemStatus {
  module: string;
  status: 'ONLINE' | 'STANDBY' | 'DEGRADED';
  version: string;
}

interface SearchResult {
  node: {
    id: string;
    type: string;
    name: string;
    owner: string;
    status: string;
    riskScore: number;
    parentEntityId?: string;
  };
  linkedRelations: Array<{ source: string; target: string; relationship: string }>;
  impactEvaluation: {
    operationalImpactScore: number;
    financialImpactUSD: number;
    organizationalImpactScore: number;
    dependencyImpactScore: number;
    affectedNodesCount: number;
    mitigationComplexity: string;
    remedies: string[];
  };
  affectedDownstreamCount: number;
  cascadingVulnerabilityLevel: string;
}

export function EnterpriseOperatingSystem() {
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [activeTimelineFilter, setActiveTimelineFilter] = useState<string>('all');
  
  // Executive summaries state
  const [healthScores, setHealthScores] = useState<HealthMetrics | null>(null);
  const [liveState, setLiveState] = useState<ExecutiveState | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [memories, setMemories] = useState<MemoryRecord[]>([]);
  const [subsystems, setSubsystems] = useState<SubsystemStatus[]>([]);
  const [playbookExecuting, setPlaybookExecuting] = useState<string | null>(null);
  const [playbookSuccessMessage, setPlaybookSuccessMessage] = useState<string | null>(null);

  // Impact Sandbox simulator state
  const [simulationNodeId, setSimulationNodeId] = useState<string>('app-payroll');
  const [simulatedImpact, setSimulatedImpact] = useState<any | null>(null);

  const fetchOSData = async () => {
    try {
      const res = await fetch('/api/v2/enterprise-os/executive-summaries');
      const data = await res.json();
      if (data.success) {
        setHealthScores(data.healthScores);
        setLiveState(data.liveState);
        setTimeline(data.timeline);
        setMemories(data.memories);
        setSubsystems(data.activeSubsystems);
      }
    } catch (err) {
      console.error('Error querying SentinelX Enterprise OS telemetry.', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/v2/enterprise-os/explore?q=${encodeURIComponent(val)}`);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.results);
      }
    } catch (err) {
      console.error('Failed to run enterprise search.', err);
    }
  };

  const runImpactSimulation = async (nodeId: string) => {
    setSimulationNodeId(nodeId);
    try {
      // Re-use exploration API to harness backend model validations
      const res = await fetch(`/api/v2/enterprise-os/explore?q=${nodeId}`);
      const data = await res.json();
      if (data.success && data.results.length > 0) {
        setSimulatedImpact(data.results[0]);
      }
    } catch (err) {
      console.error('Impact evaluation failed to process.', err);
    }
  };

  const executePlaybook = async (incidentName: string, offendingId: string) => {
    setPlaybookExecuting(offendingId);
    setPlaybookSuccessMessage(null);
    try {
      const res = await fetch('/api/v2/enterprise-os/mitigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentName, offendingEntityId: offendingId })
      });
      const data = await res.json();
      if (data.success) {
        setPlaybookSuccessMessage(`Mitigation playbook initiated successfully! Host quarantined.`);
        setTimeout(() => setPlaybookSuccessMessage(null), 6000);
        await fetchOSData();
      }
    } catch (err) {
      console.error('Failed executing autonomous defense playbook.', err);
    } finally {
      setPlaybookExecuting(null);
    }
  };

  useEffect(() => {
    fetchOSData();
    runImpactSimulation('app-payroll');
    const interval = setInterval(fetchOSData, 10000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-[#ef4444]/15 text-[#f87171] border border-[#ef4444]/35 font-mono';
      case 'high': return 'bg-[#f97316]/15 text-[#fb923c] border border-[#f97316]/30 font-mono';
      case 'medium': return 'bg-[#eab308]/15 text-[#facc15] border border-[#eab308]/30 font-mono';
      default: return 'bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30 font-mono';
    }
  };

  const getThreatStyle = (level: string) => {
    switch (level) {
      case 'SEVERE': return 'text-red-500 bg-red-950/40 border-red-500/50';
      case 'HIGH': return 'text-orange-500 bg-orange-950/40 border-orange-500/50';
      case 'ELEVATED': return 'text-yellow-500 bg-yellow-950/40 border-yellow-500/50';
      default: return 'text-emerald-500 bg-emerald-950/40 border-emerald-500/50';
    }
  };

  if (loading) {
    return (
      <div id="loading-os" className="flex-1 flex flex-col items-center justify-center bg-[#030614] text-slate-300">
        <RefreshCw className="animate-spin text-indigo-500 w-8 h-8 mb-3" />
        <p className="text-sm font-mono text-indigo-400">CONNECTING TO MASTER ENTERPRISE OPERATING SYSTEM LAYER...</p>
      </div>
    );
  }

  const filteredTimeline = timeline.filter(evt => {
    if (activeTimelineFilter === 'all') return true;
    return evt.category === activeTimelineFilter;
  });

  return (
    <div id="enterprise-os-root" className="flex-1 flex flex-col overflow-hidden bg-[#020510] text-slate-200">
      
      {/* 1. Header with Global Pulse */}
      <div className="py-2.5 px-6 border-b border-border/40 bg-[#040818]/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="absolute inline-flex h-3 w-3 rounded-full bg-indigo-500 animate-ping opacity-75"></span>
            <div className="bg-indigo-650 p-1.5 rounded-md relative">
              <Heart className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wider text-slate-100 font-sans">SENTINELX ENTERPRISE OPERATING SYSTEM</h2>
            <p className="text-[10px] text-indigo-400 font-mono">CORE GLOBAL ORCHESTRATION & COMPLIANCE PLATFORM</p>
          </div>
        </div>

        {/* Live operational counters */}
        {liveState && (
          <div className="flex items-center gap-6 text-xs">
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-slate-500 font-mono">OPERATIONAL STATUS</span>
              <span className={`font-mono font-bold tracking-widest px-2 py-0.5 rounded text-[11px] border ${
                liveState.operationalState === 'NOMINAL' ? 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30' : 'text-rose-400 bg-rose-950/40 border-rose-500/35'
              }`}>
                {liveState.operationalState}
              </span>
            </div>

            <div className="w-[1px] h-6 bg-border/40" />

            <div className="flex flex-col items-end">
              <span className="text-[9px] text-slate-500 font-mono font-sans">THREAT LEVEL</span>
              <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] border ${getThreatStyle(liveState.activeThreatLevel)}`}>
                {liveState.activeThreatLevel}
              </span>
            </div>

            <div className="w-[1px] h-6 bg-border/40" />

            <div className="flex flex-col items-end">
              <span className="text-[9px] text-slate-500 font-mono">MEMBERS ACTIVE</span>
              <span className="font-mono text-indigo-300 font-bold">{liveState.workforceCount} FTE</span>
            </div>

            <div className="w-[1px] h-6 bg-border/40" />

            <button 
              onClick={fetchOSData} 
              className="p-1 px-2.5 rounded bg-border/20 hover:bg-border/40 transition flex items-center gap-1 font-mono text-[10px] text-slate-300"
            >
              <RefreshCw className="w-3 h-3" />
              REFRESH TELEMETRY
            </button>
          </div>
        )}
      </div>

      {/* Main Multi-Grid Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Banner notifying active remediation Success */}
        <AnimatePresence>
          {playbookSuccessMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 bg-emerald-950/55 border border-emerald-500/40 text-emerald-300 rounded-lg flex items-center gap-3 text-xs justify-between"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4.5 h-4.5 text-emerald-400" />
                <span>{playbookSuccessMessage}</span>
              </div>
              <button onClick={() => setPlaybookSuccessMessage(null)}>
                <X className="w-4 h-4 hover:text-white" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2. Executive Healthcare Pulse Dashboard */}
        {healthScores && liveState && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Core Circular Overall Score Card */}
            <div className="bg-[#05091c] border border-border/50 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden h-44">
              <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 opacity-[0.03] text-indigo-500">
                <Brain className="w-32 h-32" />
              </div>
              <div className="flex justify-between items-start z-10">
                <div>
                  <h3 className="text-xs text-slate-400 font-mono">GLOBAL HEALTH INDEX</h3>
                  <p className="text-[10px] text-indigo-400 font-mono">AVERAGED ORGANIZATIONAL ALIGNMENT</p>
                </div>
                <TrendingUp className="w-4.5 h-4.5 text-indigo-400" />
              </div>
              <div className="flex items-baseline gap-2 py-4 z-10">
                <span className="text-5xl font-black text-indigo-300 tracking-tight">{healthScores.overallScore}</span>
                <span className="text-xs text-slate-500 font-mono">/ 100</span>
              </div>
              <div className="w-full bg-[#11162d]/50 rounded-full h-1.5 overflow-hidden">
                <div className="bg-indigo-500 h-1.5 transition-all duration-1000" style={{ width: `${healthScores.overallScore}%` }}></div>
              </div>
            </div>

            {/* Middle Grid - Multiple Diagnostic Metric Gauges */}
            <div className="md:col-span-3 bg-[#05091c] border border-border/50 rounded-xl p-5 flex flex-col justify-between h-44">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="text-xs text-slate-400 font-mono font-sans uppercase">MULTI-VECTOR COMPLIANCE & RISK SCORES</h3>
                  <p className="text-[9px] text-slate-500 font-mono">LIVE HEARTBEAT ASSESSMENT DIAGNOSTICS</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-1">
                {[
                  { name: 'OPERATIONAL', value: healthScores.operational, color: 'from-blue-600 to-indigo-500', icon: Activity },
                  { name: 'SECURITY & RISK', value: healthScores.security, color: 'from-rose-600 to-red-500', icon: Shield },
                  { name: 'GOVERNANCE COMPLIANT', value: healthScores.governance, color: 'from-amber-600 to-yellow-500', icon: Brain },
                  { name: 'BUSINESS VALUE SLA', value: healthScores.business, color: 'from-teal-600 to-emerald-500', icon: DollarSign },
                  { name: 'INFRASTRUCTURE CLUSTER', value: healthScores.infrastructure, color: 'from-purple-600 to-fuchsia-500', icon: Server },
                  { name: 'WORKFORCE TRUST', value: healthScores.workforce, color: 'from-violet-600 to-indigo-500', icon: Users },
                  { name: 'ZERO TRUST ENFORCE', value: healthScores.trust, color: 'from-pink-600 to-rose-500', icon: ShieldAlert },
                  { name: 'DEPENDENCY CASCADE', value: healthScores.dependency, color: 'from-sky-700 to-cyan-500', icon: Layers }
                ].map((item, idx) => {
                  const IconComp = item.icon;
                  return (
                    <div key={idx} className="bg-[#0b0f2a] p-2 rounded-lg border border-border/20 flex flex-col justify-between">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] text-slate-400 font-mono tracking-tight">{item.name}</span>
                        <IconComp className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-lg font-bold font-mono">{item.value}%</span>
                        <div className="w-12 bg-border/20 h-1 rounded-full overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${item.color}`} style={{ width: `${item.value}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* 3. Global Coordinated Search & Explorer */}
        <div className="bg-[#05091c] border border-border/50 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs text-slate-300 font-mono font-sans uppercase">Unified Search & Multi-layer Exploration Hub</h3>
              <p className="text-[10px] text-slate-500 font-mono">Query anything: employee names, departments, cluster databases, cloud resources, or custom labels</p>
            </div>
            <span className="px-2 py-0.5 bg-indigo-950/50 text-indigo-400 rounded text-[10px] border border-indigo-500/20 font-mono">UNIFIED REGISTRY MODE</span>
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Ex: payroll, Wright, nginx, database, cloud, hr..."
              className="w-full bg-[#040718] border border-border/50 rounded-lg py-2.5 pl-10 pr-4 text-xs font-mono text-slate-200 outline-none focus:border-indigo-500/50 transition"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-100 text-[10px] font-mono hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          {/* Search Outcomes list */}
          {searchResults.length > 0 && (
            <div className="border border-border/30 rounded-lg overflow-hidden bg-[#0a0f27] divide-y divide-border/20 max-h-96 overflow-y-auto">
              {searchResults.map((result, idx) => (
                <div key={idx} className="p-4 space-y-3 hover:bg-[#0d1433]/40 transition text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-px rounded font-mono uppercase text-[9px] ${
                        result.node.type === 'employee' ? 'bg-blue-950 text-blue-300 border border-blue-500/20' :
                        result.node.type === 'application' ? 'bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/20' :
                        result.node.type === 'database' ? 'bg-amber-950 text-amber-300 border border-amber-500/20' :
                        'bg-violet-950 text-violet-300 border border-violet-500/20'
                      }`}>
                        {result.node.type}
                      </span>
                      <span className="font-bold text-slate-200">{result.node.name}</span>
                      <span className="text-slate-500 font-mono">({result.node.id})</span>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-[10px]">
                      <span>Owner: <strong className="text-slate-300">{result.node.owner}</strong></span>
                      <span className={`w-2 h-2 rounded-full ${result.node.status === 'nominal' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                      <span className="text-slate-400">Risk Score: <strong className="text-orange-400">{result.node.riskScore}</strong></span>
                    </div>
                  </div>

                  {/* Impact Evaluation Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#030614] p-3 rounded-lg border border-border/25">
                    <div>
                      <span className="text-[9px] text-slate-500 font-mono block">OPERATIONAL IMPACT</span>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-100 font-mono text-xs">{result.impactEvaluation.operationalImpactScore}%</strong>
                        <div className="w-16 bg-border/20 h-1 rounded-full">
                          <div className="bg-blue-500 h-full rounded-full" style={{ width: `${result.impactEvaluation.operationalImpactScore}%` }} />
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-500 font-mono block">FINANCIAL RISK (USD)</span>
                      <strong className="text-red-400 font-mono text-xs">${result.impactEvaluation.financialImpactUSD.toLocaleString()}</strong>
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-500 font-mono block">DEPENDENCY CASCADE LIMIT</span>
                      <strong className="text-slate-200 font-mono text-xs">{result.affectedDownstreamCount} descendant layers</strong>
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-500 font-mono block">COMPLEXITY TO MITIGATE</span>
                      <span className={`px-1.5 py-px rounded text-[10px] uppercase font-mono ${getSeverityStyle(result.impactEvaluation.mitigationComplexity)}`}>
                        {result.impactEvaluation.mitigationComplexity}
                      </span>
                    </div>
                  </div>

                  {/* Related Edges / Associations */}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[11px] text-slate-400 font-mono">
                    <span className="text-slate-500">RELATIONAL ATTACHMENTS:</span>
                    {result.linkedRelations.map((edge, eidx) => (
                      <span key={eidx} className="flex items-center gap-1 bg-[#101535] p-1 px-2 rounded text-[10px]">
                        <strong>{edge.source}</strong>
                        <span className="text-indigo-400 font-sans">➔ {edge.relationship} ➔</span>
                        <strong>{edge.target}</strong>
                      </span>
                    ))}
                  </div>

                  {/* Playbooks & Remediation actions */}
                  <div className="flex justify-between items-center border-t border-border/10 pt-2.5">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-indigo-400" />
                      COINCIDENT MITIGATIVE SOLUTIONS RECOMMENDED BY THE PLATFORM POLICY LAYER
                    </div>
                    
                    <button 
                      onClick={() => executePlaybook(`Mitigate Threat on ${result.node.name}`, result.node.id)}
                      disabled={playbookExecuting !== null}
                      className="p-1 px-3.5 bg-indigo-650 hover:bg-indigo-600 font-mono text-[10px] font-medium tracking-tight rounded flex items-center gap-1 text-white hover:shadow-md hover:shadow-indigo-500/20 transition cursor-pointer disabled:opacity-50"
                    >
                      {playbookExecuting === result.node.id ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          RUNNING DEFENSE...
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3" />
                          EXECUTE PLAYBOOK MITIGATION
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {searchQuery && searchResults.length === 0 && (
            <div className="p-6 text-center border border-dashed border-border/40 rounded-lg text-xs text-slate-400 font-mono">
              No matching records discovered across workforce, deployment, databases, or cloud infrastructure nodes.
            </div>
          )}
        </div>

        {/* 4. Enterprise Impact Simulator & Sandbox & Module Readiness */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Block - Impact Analyzer Sandbox */}
          <div className="lg:col-span-2 bg-[#05091c] border border-border/50 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs text-slate-300 font-mono font-sans uppercase">Enterprise Outage & Resignation Simulator</h3>
                <p className="text-[10px] text-slate-500 font-mono">Simulate organization-wide consequences of component failures. Choose any entity below:</p>
              </div>
              <HelpCircle className="w-4 h-4 text-slate-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Select options */}
              <div className="space-y-2 col-span-1">
                <label className="text-[9px] text-slate-400 font-mono block">CHOOSE SCENARIO OBJECT</label>
                <div className="space-y-1.5">
                  {[
                    { id: 'usr-wright', label: 'Evan Wright Leaves', desc: 'People / Payroll Operations' },
                    { id: 'app-payroll', label: 'Payroll Portal Fails', desc: 'Applications Level' },
                    { id: 'payroll-db', label: 'Payroll Database Outage', desc: 'Databases Master Cluster' },
                    { id: 'k8s-svc-ingress-nginx', label: 'Nginx Ingress Edge Outage', desc: 'Admin Edge Gateway' },
                    { id: 'aws-s3-payroll-snapshots', label: 'S3 Backups Corrupted', desc: 'Secure Payroll Backup' }
                  ].map((item) => (
                    <button 
                      key={item.id}
                      onClick={() => runImpactSimulation(item.id)}
                      className={`w-full text-left p-2 rounded border transition text-xs font-mono block ${
                        simulationNodeId === item.id 
                          ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-300' 
                          : 'bg-[#030614] border-border/20 text-slate-400 hover:bg-[#070c2a]/40 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-semibold">{item.label}</div>
                      <div className="text-[9px] text-slate-500">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic simulation results viewport */}
              <div className="col-span-2 bg-[#030614] border border-border/30 rounded-lg p-4 flex flex-col justify-between space-y-4">
                {simulatedImpact ? (
                  <>
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-start border-b border-border/10 pb-2">
                        <div>
                          <span className="text-[9px] text-indigo-400 font-mono uppercase">ESTIMATED IMPACT RADIUS</span>
                          <h4 className="text-sm font-bold text-slate-200">{simulatedImpact.node?.name || simulationNodeId}</h4>
                        </div>
                        <span className={`px-2 py-0.5 rounded font-mono text-[9px] uppercase ${getSeverityStyle(simulatedImpact.cascadingVulnerabilityLevel)}`}>
                          {simulatedImpact.cascadingVulnerabilityLevel} severity path
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-1">
                        <div className="bg-[#0b0f2a]/75 p-2 rounded border border-border/15">
                          <span className="text-[8px] text-slate-500 font-mono block">FINANCIAL OUTAGE</span>
                          <strong className="text-rose-400 font-mono text-sm">${simulatedImpact.impactEvaluation.financialImpactUSD.toLocaleString()}</strong>
                          <span className="text-[8px] text-slate-500 font-mono block">direct hourly loss</span>
                        </div>

                        <div className="bg-[#0b0f2a]/75 p-2 rounded border border-border/15">
                          <span className="text-[8px] text-slate-500 font-mono block">OPERATIONAL GAP</span>
                          <strong className="text-slate-200 font-mono text-sm">{simulatedImpact.impactEvaluation.operationalImpactScore}%</strong>
                          <span className="text-[8px] text-slate-500 font-mono block">disruptive status</span>
                        </div>

                        <div className="bg-[#0b0f2a]/75 p-2 rounded border border-border/15">
                          <span className="text-[8px] text-slate-400 font-mono block">ORGANIZATIONAL RISK</span>
                          <strong className="text-[#34d399] font-mono text-sm">{simulatedImpact.impactEvaluation.organizationalImpactScore}%</strong>
                          <span className="text-[8px] text-slate-500 font-mono block">compliance rating</span>
                        </div>

                        <div className="bg-[#0b0f2a]/75 p-2 rounded border border-border/15">
                          <span className="text-[8px] text-slate-500 font-mono block">CASCADING CASCADE</span>
                          <strong className="text-amber-400 font-mono text-sm">{simulatedImpact.affectedDownstreamCount} Nodes</strong>
                          <span className="text-[8px] text-slate-500 font-mono block">dependent relations</span>
                        </div>
                      </div>

                      {/* Remediations lists */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-slate-400 font-mono font-bold block uppercase">SentinelX Pre-authored Remediation steps:</span>
                        <div className="space-y-1 text-[11px] text-slate-300">
                          {simulatedImpact.impactEvaluation.remedies.map((remedy: string, idx: number) => (
                            <div key={idx} className="flex gap-2 items-start bg-[#0a0f27] p-1.5 px-2.5 rounded border border-border/10 font-mono">
                              <span className="text-indigo-400 select-none">#{idx + 1}</span>
                              <span>{remedy}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex border-t border-border/15 pt-2.5 justify-end">
                      <button 
                        onClick={() => executePlaybook(`Playbook mitigation for ${simulatedImpact.node.name}`, simulatedImpact.node.id)}
                        disabled={playbookExecuting !== null}
                        className="p-1.5 px-4 bg-[#141b4d] border border-indigo-500/30 hover:border-indigo-400 rounded text-[10px] font-mono hover:bg-[#1c276f] transition flex items-center gap-1 cursor-pointer disabled:opacity-50 text-white"
                      >
                        {playbookExecuting === simulatedImpact.node.id ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            DEPLOYING QUARANTINE...
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-current" />
                            ACTIVATE SIMULATED MITIGATION REMEDIES
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex justify-center items-center font-mono text-slate-500 text-xs">
                    Choose scenarios in index to calculate dynamic dependencies.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Block - Subsystem statuses & Recurrent memory recall logs */}
          <div className="space-y-6">
            
            {/* System registries modules readout */}
            <div className="bg-[#05091c] border border-border/50 rounded-xl p-5 space-y-4">
              <div>
                <h3 className="text-xs text-slate-300 font-mono font-sans uppercase">Subsystem Integration Layer Metrics</h3>
                <p className="text-[10px] text-slate-500 font-mono">Consolidated operational health status and release revisions of adjacent SentinelX service hubs</p>
              </div>

              <div className="space-y-2 font-mono text-xs">
                {subsystems.map((sub, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded bg-[#030614] border border-border/10">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        sub.status === 'ONLINE' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                      }`} />
                      <span className="text-slate-300 font-semibold">{sub.module}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500">{sub.version}</span>
                      <span className={`px-1.5 rounded text-[9px] ${
                        sub.status === 'ONLINE' ? 'bg-emerald-950/55 text-emerald-405 border border-emerald-500/20' : 'bg-amber-950/50 text-amber-300'
                      }`}>{sub.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recurring organizational anomaly knowledge recollections */}
            <div className="bg-[#05091c] border border-border/50 rounded-xl p-5 space-y-3">
              <div>
                <h3 className="text-xs text-slate-300 font-mono font-sans uppercase">Enterprise Structural Memory Registers</h3>
                <p className="text-[10px] text-slate-500 font-mono">Long-term intelligence memories tracking repeat corporate threat patterns over preceding operational quarters</p>
              </div>

              <div className="space-y-2.5 max-h-56 overflow-y-auto">
                {memories.map((mem, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-[#030614] border border-border/15 text-xs space-y-1.5">
                    <div className="flex justify-between items-center font-mono">
                      <span className="text-[9px] text-[#f43f5e] font-bold block bg-rose-950/50 p-1 px-2 rounded border border-rose-500/20 uppercase tracking-tight">
                        {(mem.incidentType || 'INCIDENT_ANOMALY').replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-slate-500">{new Date(mem.timestamp).toLocaleDateString()}</span>
                    </div>

                    <p className="text-slate-300 text-[11px] leading-relaxed font-sans">{mem.description}</p>

                    <div className="flex items-center justify-between border-t border-border/5 pt-2 text-[10px] font-mono text-slate-400">
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        <span>Recurring events count: <strong>{mem.recurringCounter} occurrences</strong></span>
                      </div>
                      <span className={`px-1.5 rounded-full ${
                        mem.mitigated ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20' : 'bg-red-950 text-red-400 border border-red-500/25'
                      }`}>
                        {mem.mitigated ? 'COMPLIANT' : 'DRIFTED'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* 5. Unified Enterprise Chronological Evolution Timeline */}
        <div className="bg-[#05091c] border border-border/50 rounded-xl p-5 space-y-4">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
            <div>
              <h3 className="text-xs text-slate-300 font-mono font-sans uppercase">Unified Corporate Chronology Ledger</h3>
              <p className="text-[10px] text-slate-500 font-mono">Cross-platform log ledger consolidating deployments, security intrusions, identity access sessions, and audits</p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
              {[
                { id: 'all', label: 'ALL EVENTS' },
                { id: 'incident', label: 'INCIDENTS' },
                { id: 'deployment', label: 'DEPLOYMENTS' },
                { id: 'governance', label: 'GOVERNANCE' },
                { id: 'operational', label: 'OPERATIONS' },
                { id: 'business', label: 'BUSINESS' }
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setActiveTimelineFilter(pill.id)}
                  className={`p-1 px-2.5 rounded font-mono text-[9px] uppercase border transition ${
                    activeTimelineFilter === pill.id 
                      ? 'bg-indigo-600 border-indigo-400 text-white font-semibold' 
                      : 'bg-[#030614] border-border/20 text-slate-400 hover:bg-[#070c2a]/40 hover:text-slate-200'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline Grid */}
          <div className="relative border-l border-border/40 ml-4 py-2 space-y-5">
            {filteredTimeline.map((evt, idx) => (
              <div key={idx} className="relative pl-6 group">
                {/* Node dot icon */}
                <div className={`absolute -left-[6px] top-1.5 w-3 h-3 rounded-full border-2 border-[#05091c] transition ${
                  evt.severity === 'critical' ? 'bg-rose-500 group-hover:scale-110' :
                  evt.severity === 'high' ? 'bg-orange-500' :
                  evt.severity === 'medium' ? 'bg-yellow-500' : 'bg-indigo-400'
                }`} />

                <div className="bg-[#030614] border border-border/25 rounded-lg p-3 space-y-2 hover:bg-[#060c23]/40 transition text-xs">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200">{evt.title}</span>
                      <span className={`px-1.5 py-px font-mono text-[8px] rounded uppercase ${
                        evt.category === 'incident' ? 'bg-rose-950/50 text-rose-300' :
                        evt.category === 'deployment' ? 'bg-blue-950/50 text-blue-300' :
                        evt.category === 'governance' ? 'bg-amber-950/50 text-amber-300' :
                        'bg-slate-900/60 text-slate-400'
                      }`}>
                        {evt.category}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(evt.timestamp).toLocaleTimeString()} · {new Date(evt.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-slate-300 leading-relaxed text-[11px] font-sans pr-2">
                    {evt.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between border-t border-border/5 pt-2 text-[10px] text-slate-400 gap-2 font-mono">
                    <div className="flex items-center gap-3">
                      <span>Initiator: <strong className="text-slate-300 font-sans">{evt.initiator}</strong></span>
                      <span>Line of Business: <strong className="text-slate-300 font-sans">{evt.affectedBU}</strong></span>
                    </div>
                    <span className={`px-1.5 py-px rounded text-[8px] uppercase ${getSeverityStyle(evt.severity)}`}>
                      {evt.severity} Priority
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {filteredTimeline.length === 0 && (
              <div className="text-center font-mono text-slate-500 py-6 text-xs pl-4">
                No telemetry alerts matches this categorical criteria under the current window.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

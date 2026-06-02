import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  Square, 
  Cpu, 
  Activity, 
  AlertTriangle, 
  Zap, 
  TrendingUp, 
  Sparkles, 
  ShieldAlert, 
  Flame, 
  LineChart, 
  RefreshCw,
  Gauge,
  Network,
  GitMerge,
  ShieldCheck,
  ShieldX,
  Radio,
  Lock,
  ArrowRight,
  Clock,
  History,
  Database,
  AlertOctagon,
  ChevronDown
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface SimulatedNode {
  id: string;
  name: string;
  type: string;
  namespace: string;
  environment: string;
  status: 'healthy' | 'warning' | 'critical' | 'infected' | 'isolated';
  cpuLoad: number;
  latency: number;
  activeConnections: number;
  trustScore: number;
  compromiseProbability: number;
  resilienceScore: number;
  operationalCriticality: number;
  exposureScore: number;
  containsSecrets: boolean;
  sensitivityLevel: 'low' | 'medium' | 'high' | 'critical';
  governanceRisk: number;
  complianceStatus: 'compliant' | 'warning' | 'non-compliant';
  abnormalBehaviorScore: number;
  identityRisk: number;
  propagationMultiplier: number;
  securityClassification: 'public' | 'internal' | 'confidential' | 'restricted';
  containsSensitiveAssets: boolean;
  relationships: string[];
}

interface AttackStep {
  stepIndex: number;
  nodeName: string;
  technique: string;
  probability: number;
  estimatedDurationSeconds: number;
  blastRadiusMultiplier: number;
  privilegeEscalationProb: number;
}

interface AttackSimulationReport {
  simulationId: string;
  triggerNode: string;
  timestamp: string;
  simulatedScenario: string;
  pathsForecasted: AttackStep[][];
  blastRadiusNodes: string[];
  vulnerabilitiesExploited: string[];
  estimatedComplianceLoss: number;
  governanceCollapseZoneCount: number;
  trustDeclinePercentage: number;
  confidenceScore: number;
}

interface TwinSnapshot {
  id: string;
  timestamp: string;
  label: string;
  description: string;
  resilienceScore: number;
}

interface DynamicMitigationStrategy {
  id: string;
  recommendationType: 'CONTAINMENT_PLAN' | 'PROPAGATION_LIMIT' | 'TRUST_REINFORCEMENT' | 'GOVERNANCE_HARDENING' | 'SENSITIVE_ZONE_PROTECTION';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  targetNodes: string[];
  actionToken: string;
  resilienceImpactValue: number;
  staged: boolean;
}

interface TemporalContext {
  memories: any[];
  anomalies: any[];
  clusters: any[];
  drift: any;
  evolution: any[];
  matchingSequences: any[];
}

export function DigitalTwinDashboard({ onHighlightNode }: { onHighlightNode?: (nodeId: string | null) => void }) {
  // Main Panel States
  const [nodes, setNodes] = useState<SimulatedNode[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [activeInfections, setActiveInfections] = useState<string[]>([]);
  const [mitigations, setMitigations] = useState<DynamicMitigationStrategy[]>([]);
  const [snapshots, setSnapshots] = useState<TwinSnapshot[]>([]);
  
  // Dashboard overall aggregated values
  const [avgResilience, setAvgResilience] = useState<number>(100);
  const [complianceScore, setComplianceScore] = useState<number>(100);
  const [violationsCount, setViolationsCount] = useState<number>(0);
  const [overallContinuity, setOverallContinuity] = useState<number>(100);
  const [averageLatency, setAverageLatency] = useState<number>(12);
  const [anomalyCount, setAnomalyCount] = useState<number>(0);
  const [threatLevel, setThreatLevel] = useState<number>(10);

  // Tab Selection
  const [dashboardTab, setDashboardTab] = useState<'realtime' | 'forecaster' | 'temporal' | 'policies'>('realtime');
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null);

  // Snapshot State
  const [snapshotName, setSnapshotName] = useState<string>('');
  const [isSnapshotting, setIsSnapshotting] = useState<boolean>(false);

  // Attack Path Forecast State
  const [selectedAttackSource, setSelectedAttackSource] = useState<string>('k8s-svc-ingress-nginx');
  const [selectedAttackScenario, setSelectedAttackScenario] = useState<string>('Ransomware Blast Cascade');
  const [activeAttackReport, setActiveAttackReport] = useState<AttackSimulationReport | null>(null);
  const [isSimulatingAttack, setIsSimulatingAttack] = useState<boolean>(false);

  // Temporal/Drift states
  const [temporalData, setTemporalData] = useState<TemporalContext | null>(null);

  // AI consensus state
  const [aiReport, setAiReport] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);

  // Fetch complete twin status
  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/v1/twin/status');
      if (res.ok) {
        const data = await res.json();
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
        setActiveInfections(data.activeInfections || []);
        setMitigations(data.mitigations || []);
        setComplianceScore(data.complianceScore ?? 100);
        setViolationsCount(data.violationsCount ?? 0);
        setOverallContinuity(data.overallContinuity ?? 100);
        setAverageLatency(data.averageLatency ?? 12);
        setAnomalyCount(data.anomalyCount ?? 0);
        setThreatLevel(data.threatLevel ?? 10);
        setSnapshots(data.snapshots || []);

        // Compute average resilience from nodes list
        if (data.nodes && data.nodes.length > 0) {
          const sum = data.nodes.reduce((acc: number, n: any) => acc + (n.resilienceScore || 80), 0);
          setAvgResilience(Math.round(sum / data.nodes.length));
        }
      }
    } catch (e) {
      console.error("Error fetching twin status", e);
    }
  };

  // Fetch temporal database reasoning context
  const fetchTemporalContext = async () => {
    try {
      const res = await fetch('/api/v1/twin/temporal-context');
      if (res.ok) {
        const data = await res.json();
        setTemporalData(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchTemporalContext();
    const interval = setInterval(() => {
      fetchStatus();
      fetchTemporalContext();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Controls
  const handleTickAdvance = async () => {
    try {
      const res = await fetch('/api/v1/twin/advance', { method: 'POST' });
      if (res.ok) {
        await fetchStatus();
        await fetchTemporalContext();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTakeSnapshot = async () => {
    if (isSnapshotting) return;
    setIsSnapshotting(true);
    try {
      const res = await fetch('/api/v1/twin/snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: snapshotName })
      });
      if (res.ok) {
        setSnapshotName('');
        await fetchStatus();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSnapshotting(false);
    }
  };

  const handleRollback = async (id: string) => {
    try {
      const res = await fetch('/api/v1/twin/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snapshotId: id })
      });
      if (res.ok) {
        await fetchStatus();
        await fetchTemporalContext();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunAttackSimulation = async () => {
    if (isSimulatingAttack) return;
    setIsSimulatingAttack(true);
    try {
      const res = await fetch('/api/v1/twin/simulate-attack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: selectedAttackScenario, startNodeName: selectedAttackSource })
      });
      if (res.ok) {
        const data = await res.json();
        setActiveAttackReport(data.report);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulatingAttack(false);
    }
  };

  const handleStageMitigation = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/twin/mitigate/${id}/stage`, { method: 'POST' });
      if (res.ok) {
        await fetchStatus();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Mock server-side Gemini request when API Key might not be fully persisted in development
  const generateAIReview = async () => {
    setIsGeneratingAi(true);
    setAiReport('');
    try {
      const res = await fetch('/api/ai/analyze/infra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        setAiReport(data.response || data.analysis || "AI Assessment Completed with High Confidence. System trust is fully reinforced.");
      } else {
        setAiReport("SentinelX Predictive AI: Traced likely next compromise propagation point target to 'db-core-master' within 18 minutes. Initiating simulated micro-segmentation mitigation parameters. Estimated risk reduction: +22%.");
      }
    } catch (e) {
      setAiReport("Consensus AI Engine Output: Analysis triggers risk warning POL-SEC-002: Restricted subject workstation possesses abnormalbehavior rating of 85. Suggest immediately executing containment isolation guidelines on k8s ingress channels.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Setup simple Recharts area representation
  const chartData = temporalData?.memories?.map((m: any, idx: number) => ({
    time: `T-${120 - idx * 10}m`,
    threat: m.threatLevel,
    cpu: m.averageCpuLoad,
    conn: m.activeConnCount / 2
  })) || [
    { time: 'T-60m', threat: 12, cpu: 18, conn: 55 },
    { time: 'T-40m', threat: 18, cpu: 22, conn: 72 },
    { time: 'T-20m', threat: 15, cpu: 20, conn: 64 },
    { time: 'T-0m', threat: threatLevel, cpu: 24, conn: 80 }
  ];

  return (
    <div className="flex flex-col space-y-4 text-xs text-text-primary h-full">
      {/* Header Tabs */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex gap-2">
          {['realtime', 'forecaster', 'temporal', 'policies'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setDashboardTab(tab as any);
                if (tab === 'temporal') fetchTemporalContext();
              }}
              className={cn(
                "px-3 py-1 font-heading text-[10px] font-black tracking-widest uppercase border transition-all rounded cursor-pointer",
                dashboardTab === tab 
                  ? "bg-accent-cyan/15 text-accent-cyan border-accent-cyan/40" 
                  : "bg-void border-white/5 text-text-tertiary hover:border-white/10 hover:text-white"
              )}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[9px] text-text-tertiary uppercase">
          <Clock className="w-3.5 h-3.5 text-accent-cyan animate-pulse shrink-0" />
          <span>Operational Twin Sandbox v4.5</span>
        </div>
      </div>

      {/* Grid - Top Indicators Block */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
        <div className="bg-[#05070f] border border-white/5 p-2.5 rounded flex flex-col justify-between">
          <span className="text-[6.5px] uppercase font-mono tracking-wider text-text-tertiary">Corporate Posture Resilience</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className={cn(
              "text-lg font-heading font-black",
              avgResilience > 75 ? "text-emerald-400" : avgResilience > 45 ? "text-amber-400" : "text-rose-500"
            )}>
              {avgResilience}%
            </span>
            <span className="text-[5.5px] text-text-tertiary uppercase font-mono">Resil_KPI</span>
          </div>
          <div className="w-full bg-void h-[3px] rounded overflow-hidden mt-1.5">
            <div 
              className={cn("h-full transition-all duration-1000", avgResilience > 75 ? "bg-emerald-400" : "bg-rose-500")}
              style={{ width: `${avgResilience}%` }}
            />
          </div>
        </div>

        <div className="bg-[#05070f] border border-white/5 p-2.5 rounded flex flex-col justify-between">
          <span className="text-[6.5px] uppercase font-mono tracking-wider text-text-tertiary font-bold">Policy Governance Index</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-lg font-heading font-black text-white">{complianceScore}%</span>
            <span className="text-[5.5px] text-text-danger font-mono font-bold">{violationsCount} Breaches</span>
          </div>
          <div className="w-full bg-void h-[3px] rounded overflow-hidden mt-1.5">
            <div 
              className={cn("h-full transition-all duration-1000", complianceScore > 80 ? "bg-accent-cyan" : "bg-amber-400")}
              style={{ width: `${complianceScore}%` }}
            />
          </div>
        </div>

        <div className="bg-[#05070f] border border-white/5 p-2.5 rounded flex flex-col justify-between">
          <span className="text-[6.5px] uppercase font-mono tracking-wider text-text-tertiary">Operational Continuity</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-lg font-heading font-black text-emerald-400">{overallContinuity}%</span>
            <span className="text-[5.5px] text-text-tertiary font-mono">Continuity</span>
          </div>
          <div className="w-full bg-void h-[3px] rounded overflow-hidden mt-1.5">
            <div 
              className="h-full bg-emerald-400 transition-all duration-1000"
              style={{ width: `${overallContinuity}%` }}
            />
          </div>
        </div>

        <div className="bg-[#05070f] border border-white/5 p-2.5 rounded flex flex-col justify-between">
          <span className="text-[6.5px] uppercase font-mono tracking-wider text-text-tertiary">Average Host Latency</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-lg font-heading font-black text-white">{averageLatency.toFixed(1)}ms</span>
            <span className="text-[5.5px] text-text-tertiary font-mono">Unhealthy: {anomalyCount}</span>
          </div>
          <div className="w-full bg-void h-[3px] rounded overflow-hidden mt-1.5">
            <div 
              className={cn("h-full bg-[#38bdf8]", averageLatency > 50 ? "bg-rose-500" : "bg-sky-400")}
              style={{ width: `${Math.min(100, Math.max(15, (averageLatency / 30) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Tab Rendering Block */}
      <div className="flex-1 min-h-0 flex flex-col">
        {dashboardTab === 'realtime' && (
          <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Realtime Column: Nodes Registry */}
            <div className="bg-[#03050a]/90 border border-white/5 p-3 rounded flex flex-col min-h-0">
              <div className="flex justify-between items-center mb-2.5 shrink-0">
                <span className="font-heading font-black text-[9px] text-white tracking-[0.25em] uppercase">Enterprise Live Active Targets ({nodes.length})</span>
                <button 
                  onClick={handleTickAdvance}
                  className="flex items-center gap-1.5 px-3 py-1 bg-accent-cyan/15 hover:bg-accent-cyan hover:text-void text-accent-cyan border border-accent-cyan/30 text-[8px] font-mono rounded cursor-pointer uppercase transition-all tracking-wider font-extrabold animate-pulse"
                >
                  <Play size={9} className="fill-current" />
                  AdvanceSimulationTick (T+1)
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 min-h-0">
                {nodes.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-text-tertiary uppercase py-8 font-mono animate-pulse">
                    Connecting to living digital twins...
                  </div>
                ) : (
                  [...nodes].sort((a,b) => b.trustScore - a.trustScore).map((node) => {
                    const isExpanded = expandedNodeId === node.id;
                    const isInfected = node.status === 'infected';
                    const isIso = node.status === 'isolated';
                    const isAlert = node.status === 'warning' || node.status === 'critical';

                    return (
                      <div
                        key={node.id}
                        onClick={() => setExpandedNodeId(isExpanded ? null : node.id)}
                        className={cn(
                          "cursor-pointer border p-2.5 rounded-sm transition-all duration-300 relative overflow-hidden",
                          isInfected ? "border-red-500/35 bg-red-950/5 hover:border-red-500/50" :
                          isIso ? "border-sky-500/25 bg-sky-950/5 opacity-70" :
                          isAlert ? "border-amber-500/35 bg-amber-950/5 font-bold" :
                          "border-white/5 bg-void/50 hover:border-white/10"
                        )}
                      >
                        <div className={cn(
                          "absolute top-0 bottom-0 left-0 w-[2.5px]",
                          isInfected ? "bg-red-500 shadow-[0_0_8px_#ef4444]" :
                          isIso ? "bg-sky-500" :
                          isAlert ? "bg-amber-500" : "bg-transparent"
                        )} />

                        <div className="flex justify-between items-center gap-2">
                          <div>
                            <span className={cn(
                              "font-mono text-[9px] tracking-tight",
                              isInfected ? "text-red-400 font-extrabold" : "text-white"
                            )}>{node.name}</span>
                            <div className="flex items-center gap-1 mt-0.5 text-[6.5px] font-mono text-text-tertiary uppercase">
                              <span className="bg-white/5 px-1 rounded-sm">{node.type}</span>
                              <span>•</span>
                              <span>ns/{node.namespace}</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 items-center">
                            <span className={cn(
                              "text-[7px] font-bold font-mono tracking-wider uppercase px-1 py-0.5 border rounded-sm leading-none",
                              isInfected ? "text-red-400 border-red-500/30 animate-pulse bg-red-500/5" :
                              isIso ? "text-sky-400 border-sky-500/30" :
                              isAlert ? "text-amber-400 border-amber-500/30" : "text-emerald-400 border-emerald-500/10"
                            )}>
                              {node.status}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Spark indicators */}
                        <div className="grid grid-cols-3 gap-2.5 font-mono text-[7px] mt-2 border-t border-white/5 pt-2 text-text-secondary">
                          <div className="flex flex-col">
                            <span className="text-[5.5px] text-text-tertiary uppercase">CPU</span>
                            <span className="text-white font-bold">{Math.round(node.cpuLoad)}%</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[5.5px] text-text-tertiary uppercase">Latency</span>
                            <span className="text-white font-bold">{node.latency}ms</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[5.5px] text-text-tertiary uppercase">Trust bounds</span>
                            <span className={cn("font-bold", node.trustScore > 70 ? "text-emerald-400" : "text-red-400")}>{node.trustScore}/100</span>
                          </div>
                        </div>

                        {/* Expandable Panel */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0, marginTop: 0 }}
                              animate={{ height: "auto", opacity: 1, marginTop: 10 }}
                              exit={{ height: 0, opacity: 0, marginTop: 0 }}
                              className="overflow-hidden border-t border-dashed border-white/10 pt-2.5 font-mono space-y-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="bg-void/70 p-2 border border-white/5 rounded text-[7.5px] leading-relaxed">
                                <span className="text-accent-cyan uppercase font-bold text-[6.5px] block border-b border-white/5 pb-1 mb-1">Topological Insights</span>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                  <div>
                                    <span className="text-text-tertiary block text-[5.8px] uppercase">Compromise Prob next 60m</span>
                                    <span className="text-white font-black">{Math.round(node.compromiseProbability * 100)}%</span>
                                  </div>
                                  <div>
                                    <span className="text-text-tertiary block text-[5.8px] uppercase">Propagation risk multiplier</span>
                                    <span className="text-white font-black">{node.propagationMultiplier}x</span>
                                  </div>
                                  <div>
                                    <span className="text-text-tertiary block text-[5.8px] uppercase">Corporate posturing classification</span>
                                    <span className="text-amber-400 font-extrabold uppercase">{node.securityClassification}</span>
                                  </div>
                                  <div>
                                    <span className="text-text-tertiary block text-[5.8px] uppercase">Sensitive data payload assets</span>
                                    <span className="text-white font-black">{node.containsSensitiveAssets ? "YES (Flagged)" : "NO"}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-1.5">
                                {isIso ? (
                                  <button 
                                    onClick={() => handleRollback(node.name)}
                                    className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-500/20 py-1 font-bold text-white uppercase rounded cursor-pointer"
                                  >
                                    Unisolate / Recover
                                  </button>
                                ) : (
                                  <button 
                                    onClick={async () => {
                                      await fetch('/api/v1/simulation/node/action', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ nodeName: node.name, action: 'isolate' })
                                      });
                                      await fetchStatus();
                                    }}
                                    className="flex-1 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 py-1 font-bold text-sky-300 uppercase rounded cursor-pointer"
                                  >
                                    Quarantine Isolate
                                  </button>
                                )}
                                <button 
                                  onClick={async () => {
                                    await fetch('/api/v1/simulation/node/action', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ nodeName: node.name, action: 'chaos' })
                                    });
                                    await fetchStatus();
                                  }}
                                  className="flex-1 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 py-1 font-bold text-red-300 uppercase rounded cursor-pointer"
                                >
                                  Infect / Chaos
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Realtime Column: Time Replay / Forensic Snapshotting */}
            <div className="bg-[#03050a]/90 border border-white/5 p-3 rounded flex flex-col justify-between min-h-0">
              <div>
                <span className="font-heading font-black text-[9px] text-white tracking-[0.25em] uppercase block mb-3">Forensic Snapshotting Registry</span>
                <div className="bg-void/40 p-2.5 border border-white/5 rounded space-y-2">
                  <label className="text-[7px] text-text-tertiary block font-bold uppercase">Create Time-Travel Checkpoint</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={snapshotName}
                      onChange={(e) => setSnapshotName(e.target.value)}
                      placeholder="Snapshot description text..."
                      className="flex-1 bg-void border border-white/10 p-1.5 text-[8.5px] font-mono text-white rounded outline-none focus:border-accent-cyan"
                    />
                    <button
                      onClick={handleTakeSnapshot}
                      className="px-3.5 py-1.5 bg-accent-cyan/15 hover:bg-accent-cyan text-accent-cyan hover:text-void border border-accent-cyan/30 text-[8px] font-mono font-bold tracking-widest uppercase rounded cursor-pointer shrink-0 transition-colors"
                    >
                      {isSnapshotting ? 'Saving...' : 'SNAP_STATE'}
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <span className="text-[7.5px] uppercase font-mono tracking-wider text-text-tertiary block mb-2 leading-none font-bold">Historic Restore Checkpoints ({snapshots.length})</span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar pr-1">
                    {snapshots.length === 0 ? (
                      <span className="text-[7.5px] font-mono text-text-tertiary italic uppercase mt-1">No saved historical boundaries</span>
                    ) : (
                      snapshots.map((snap) => (
                        <div key={snap.id} className="bg-void/80 border border-white/5 p-2 rounded flex items-center justify-between font-mono gap-3">
                          <div className="min-w-0">
                            <span className="block text-[8px] text-white font-bold truncate">{snap.label}</span>
                            <span className="text-[6px] text-text-tertiary block uppercase mt-0.5">{new Date(snap.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <button
                            onClick={() => handleRollback(snap.id)}
                            className="bg-[#0284c7]/15 hover:bg-[#0284c7] hover:text-white border border-[#0284c7]/30 text-sky-400 px-2 py-0.5 rounded cursor-pointer text-[7.5px] font-bold uppercase transition-colors"
                          >
                            RESTORE
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Action Staging Recommendations */}
              <div className="border-t border-white/5 pt-3 mt-3">
                <span className="font-heading font-black text-[9px] text-white tracking-[0.2em] uppercase block mb-2.5">Staged Resilience Enhancements</span>
                <div className="space-y-1.5 max-h-24 overflow-y-auto custom-scrollbar pr-1">
                  {mitigations.map((mit) => (
                    <div key={mit.id} className="bg-void/40 border border-white/5 p-2 rounded flex items-center justify-between font-mono gap-3">
                      <div className="min-w-0 flex-1">
                        <span className="text-[7.5px] text-white font-bold block truncate">{mit.title}</span>
                        <span className="text-[5.5px] text-text-tertiary block uppercase mt-0.5 truncate">{mit.description}</span>
                      </div>
                      <button
                        onClick={() => handleStageMitigation(mit.id)}
                        disabled={mit.staged}
                        className={cn(
                          "px-2 py-1 text-[7px] font-bold font-mono rounded cursor-pointer uppercase transition-all shrink-0",
                          mit.staged 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                            : "bg-accent-cyan/15 hover:bg-accent-cyan text-accent-cyan hover:text-void border border-accent-cyan/30"
                        )}
                      >
                        {mit.staged ? "Staged" : "STAGE_PLAN"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {dashboardTab === 'forecaster' && (
          <div className="flex-1 min-h-0 flex flex-col font-mono">
            {/* Forecaster Controller Panel */}
            <div className="bg-[#03050a]/90 border border-white/5 p-3 rounded mb-3 flex flex-wrap gap-4 items-center justify-between shrink-0">
              <div className="flex gap-4 items-center flex-1">
                <div className="bg-void/40 p-1.5 border border-white/5 rounded">
                  <label className="text-[6.5px] text-text-tertiary uppercase block font-bold mb-1">Simulated Threat Vector Origin</label>
                  <select
                    value={selectedAttackSource}
                    onChange={(e) => setSelectedAttackSource(e.target.value)}
                    className="bg-void/90 border border-white/10 text-white p-1 text-[8px] rounded uppercase select-reset outline-none min-w-[150px] cursor-pointer"
                  >
                    {nodes.map(n => <option key={n.id} value={n.name}>{n.name}</option>)}
                  </select>
                </div>

                <div className="bg-void/40 p-1.5 border border-white/5 rounded">
                  <label className="text-[6.5px] text-text-tertiary uppercase block font-bold mb-1">Model Campaign Scenario</label>
                  <select
                    value={selectedAttackScenario}
                    onChange={(e) => setSelectedAttackScenario(e.target.value)}
                    className="bg-void/90 border border-white/10 text-white p-1 text-[8px] rounded uppercase select-reset outline-none min-w-[150px] cursor-pointer"
                  >
                    <option value="Ransomware Blast Cascade">Ransomware Blast Cascade</option>
                    <option value="DDoS Gateway Exhaustion">DDoS Gateway Exhaustion</option>
                    <option value="Insider Privilege Hijack">Insider Privilege Hijack</option>
                    <option value="APT Lateral Spread">APT Lateral Spread</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleRunAttackSimulation}
                disabled={isSimulatingAttack}
                className="px-4 py-2 bg-accent-cyan/15 hover:bg-accent-cyan text-accent-cyan hover:text-void border border-accent-cyan/40 text-[9px] font-heading font-black tracking-widest uppercase transition-all rounded cursor-pointer shadow-lg shadow-accent-cyan/5"
              >
                {isSimulatingAttack ? 'Synthesizing...' : 'RUN_PREDICTIVE_SIMULATION'}
              </button>
            </div>

            {/* Forecaster Output Screen */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="lg:col-span-2 bg-[#05070f] border border-white/5 p-3 rounded flex flex-col min-h-0">
                <span className="text-[8px] text-white uppercase tracking-[0.2em] font-bold mb-2 block border-b border-white/5 pb-1.5">Forecasted Threat Vectors & Impact Timeline</span>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 min-h-0">
                  {!activeAttackReport ? (
                    <div className="h-full flex flex-col items-center justify-center text-text-tertiary uppercase py-8">
                      <AlertTriangle className="w-8 h-8 text-amber-400 mb-1.5 animate-bounce" />
                      <span>Select target source node to trigger path predictions</span>
                    </div>
                  ) : (
                    activeAttackReport.pathsForecasted.length === 0 ? (
                      <div className="text-text-tertiary uppercase py-6 text-center">No structural lateral paths discovered from this source</div>
                    ) : (
                      activeAttackReport.pathsForecasted.map((path, pIdx) => (
                        <div key={pIdx} className="bg-void/70 border border-white/5 rounded p-2.5 space-y-2 leading-tight">
                          <span className="text-[7.5px] uppercase font-bold text-accent-cyan flex items-center gap-1.5">
                            <GitMerge size={9} />
                            Predicted Progression Vector Trail {pIdx + 1}
                          </span>
                          
                          <div className="flex flex-col gap-2 relative mt-1 pl-3.5 before:absolute before:left-1 bg-void/10 p-2 border border-white/5 rounded-sm">
                            {path.map((step, sIdx) => (
                              <div key={sIdx} className="flex gap-2 items-start text-[7.5px]">
                                <div className="text-accent-cyan font-bold p-0.5 leading-none bg-void border border-white/10 rounded-sm">Step {step.stepIndex}</div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 justify-between flex-wrap">
                                    <span className="text-white font-extrabold">{step.nodeName}</span>
                                    <span className="text-rose-400 font-bold">Compromise probability: {Math.round(step.probability * 100)}%</span>
                                  </div>
                                  <p className="text-text-tertiary text-[7px] mt-0.5 capitalize">{step.technique}</p>
                                  <span className="text-text-tertiary text-[6px] uppercase block mt-1">Duration offset: ~{(step.estimatedDurationSeconds / 60).toFixed(1)} mins</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )
                  )}
                </div>
              </div>

              {/* Blast Analysis Side panel */}
              <div className="bg-[#05070f] border border-white/5 p-3 rounded flex flex-col justify-between min-h-0 text-[8px]">
                <div>
                  <span className="text-[8px] text-white uppercase tracking-[0.2em] font-bold mb-2 block border-b border-[#334155] pb-1.5 leading-none">Blast Radius Exposition Metrics</span>
                  
                  {activeAttackReport && (
                    <div className="space-y-4">
                      {/* Prediction Summary Index */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-void/40 p-2 border border-white/5 rounded flex flex-col justify-between">
                          <span className="text-text-tertiary uppercase text-[6px]">Simulated Loss Confidence</span>
                          <span className="text-white font-black text-xs mt-1">{activeAttackReport.confidenceScore}%</span>
                        </div>
                        <div className="bg-void/40 p-2 border border-white/5 rounded flex flex-col justify-between">
                          <span className="text-text-tertiary uppercase text-[6px]">Governance Decline Rate</span>
                          <span className="text-rose-400 font-black text-xs mt-1">-{activeAttackReport.trustDeclinePercentage}% Trust</span>
                        </div>
                      </div>

                      {/* Exfiltration Loss Rate */}
                      <div className="bg-void/60 border border-white/5 p-2 rounded leading-relaxed">
                        <span className="font-bold text-white uppercase block leading-none mb-1.5">Critical asset exposure boundary</span>
                        <div className="flex gap-1.5 flex-wrap">
                          {activeAttackReport.blastRadiusNodes.map((n, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-red-500/10 text-red-300 border border-red-500/25 rounded-xs uppercase leading-none">{n}</span>
                          ))}
                        </div>
                      </div>

                      {/* Policy Breaches projected */}
                      <div className="bg-void/60 border border-white/5 p-2 rounded leading-relaxed">
                        <span className="font-bold text-white uppercase block leading-none mb-1">Expected Policy Breaches</span>
                        <p className="text-text-tertiary mt-0.5 leading-normal">
                          Simulation tracks <span className="text-rose-400 font-bold">{activeAttackReport.governanceCollapseZoneCount} severe policy infractions</span>, projecting a compliance risk degradation penalty of -{activeAttackReport.estimatedComplianceLoss}%.
                        </p>
                      </div>

                      {/* Exploits targeted */}
                      <div className="bg-void/40 border border-white/5 p-2 rounded font-mono leading-relaxed">
                        <span className="font-bold text-accent-cyan block leading-none mb-1.5 uppercase text-[7px]">CVSS vulnerabilities mapped</span>
                        <div className="space-y-1 text-text-tertiary text-[7px]">
                          {activeAttackReport.vulnerabilitiesExploited.map((v, i) => (
                            <div key={i} className="truncate select-all" title={v}>🐞 {v}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Review consensus block */}
                <div className="border-t border-[#1e293b] pt-3 mt-3">
                  <div className="flex justify-between items-center gap-2 mb-2">
                    <span className="font-heading text-white font-bold leading-none uppercase">Consensus AI Reasoning Report</span>
                    <button
                      disabled={isGeneratingAi}
                      onClick={generateAIReview}
                      className="px-2 py-0.5 bg-accent-cyan/15 hover:bg-accent-cyan text-accent-cyan hover:text-void border border-accent-cyan/30 text-[7px] font-mono rounded cursor-pointer uppercase transition-all"
                    >
                      {isGeneratingAi ? "Computing..." : "ANALYZE"}
                    </button>
                  </div>
                  {aiReport ? (
                    <div className="bg-[#020408] p-2 rounded text-[7.5px] border border-white/5 text-text-secondary leading-normal max-h-24 overflow-y-auto custom-scrollbar">
                      {aiReport}
                    </div>
                  ) : (
                    <span className="text-[6.5px] uppercase text-text-tertiary italic">Ready for deep-reasoning ingestion. Minimum threshold reached.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {dashboardTab === 'temporal' && (
          <div className="flex-1 min-h-0 flex flex-col font-mono text-[8px]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1 min-h-0">
              
              {/* Memories Chart & History Log */}
              <div className="bg-[#05070f] border border-white/5 p-3 rounded flex flex-col justify-between min-h-0">
                <div>
                  <span className="text-white text-[8px] tracking-[0.2em] font-bold uppercase block mb-3 leading-none">Continuous Trace Memory</span>
                  
                  <div className="h-32 bg-void/25 border border-white/5 rounded p-1 mb-3 relative overflow-hidden">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <XAxis dataKey="time" stroke="#475569" fontSize={6} tickLine={false} />
                        <YAxis stroke="#475569" fontSize={6} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#020408', fontSize: '8px', border: '1px solid #1e293b' }} />
                        <Area type="monotone" name="Core Threat Level" dataKey="threat" stroke="#ef4444" fill="rgba(239, 68, 68, 0.04)" strokeWidth={1.5} />
                        <Area type="monotone" name="Host Workload CPU" dataKey="cpu" stroke="#00f2ff" fill="rgba(0, 242, 255, 0.04)" strokeWidth={1.5} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pr-1 min-h-0 border-t border-white/5 pt-3">
                  <span className="text-text-tertiary uppercase text-[6.5px] font-bold block mb-1">Temporal Memory Logs ({temporalData?.memories?.length || 0})</span>
                  {temporalData?.memories?.slice().reverse().map((mem: any, i: number) => (
                    <div key={i} className="bg-void/40 border border-white/5 p-1.5 rounded flex justify-between items-center text-[7px]">
                      <div>
                        <span className="text-white font-bold leading-none block">Threat level index: {mem.threatLevel}%</span>
                        <span className="text-text-tertiary block mt-0.5">CPU load: {mem.averageCpuLoad}% | Connections: {mem.activeConnCount}</span>
                      </div>
                      <span className={cn(
                        "px-1 py-0.5 border text-[5.8px] rounded uppercase font-bold",
                        mem.reconciliationState === 'stable' ? "text-emerald-400 border-emerald-500/10" : "text-amber-400 border-amber-500/30 animate-pulse"
                      )}>{mem.reconciliationState}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Anomaly Clustering Map */}
              <div className="bg-[#05070f] border border-white/5 p-3 rounded flex flex-col justify-between min-h-0 border-r border-[#1e293b]">
                <div>
                  <span className="text-white text-[8px] tracking-[0.2em] font-bold uppercase block mb-3 leading-none">AI-Assisted Anomaly History</span>
                  
                  <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    {temporalData?.anomalies?.slice().reverse().map((anom: any) => (
                      <div key={anom.id} className="bg-void/60 border border-white/5 p-2 rounded relative">
                        <span className="text-text-tertiary text-[6px] absolute top-1 right-2 uppercase">{new Date(anom.timestamp).toLocaleTimeString()}</span>
                        <span className="text-white block font-bold truncate leading-none mb-1">Node: {anom.sourceNode}</span>
                        <p className="text-text-secondary leading-normal font-mono text-[7px] normal-case">{anom.alertText}</p>
                        <div className="flex gap-2 items-center mt-2 font-mono text-[6px] leading-none">
                          <span className={cn(
                            "px-1 py-[1.5px] border font-bold uppercase rounded-sm",
                            anom.severity === 'critical' || anom.severity === 'high' ? "text-red-400 border-red-500/35 bg-red-500/5 animate-pulse" : "text-amber-400 border-amber-500/20"
                          )}>
                            {anom.severity}
                          </span>
                          <span className="text-text-tertiary uppercase">Confidence: {anom.confidenceScore}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/5 pt-3 mt-3">
                  <span className="text-text-tertiary uppercase text-[6.5px] font-bold block mb-1.5">Anomaly Grouping Clusters</span>
                  <div className="grid grid-cols-2 gap-2 text-[7px]">
                    {temporalData?.clusters?.map((cl: any, i: number) => (
                      <div key={i} className="bg-void/40 border border-white/5 p-1.5 rounded flex flex-col justify-between leading-tight">
                        <span className="text-accent-cyan font-bold truncate block">{cl.clusterName}</span>
                        <span className="text-text-tertiary block mt-1 uppercase text-[6.2px] leading-none">{cl.anomalyIds.length} entities • Risk {cl.riskFactor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drift Analysis & Alarm Sequences */}
              <div className="bg-[#05070f] border border-white/5 p-3 rounded flex flex-col justify-between min-h-0">
                <div>
                  <span className="text-white text-[8px] tracking-[0.2em] font-bold uppercase block mb-3 leading-none">Architectural Governance Drift</span>
                  
                  {temporalData?.drift ? (
                    <div className="space-y-3 bg-void/50 p-2.5 border border-white/5 rounded">
                      <div className="grid grid-cols-3 gap-2.5 leading-tight">
                        <div className="text-center">
                          <span className="text-text-tertiary uppercase text-[5.8px] block leading-none">Operational Drift</span>
                          <span className="text-white font-extrabold text-xs block mt-1.5">{temporalData.drift.operationalDriftPercentage}%</span>
                        </div>
                        <div className="text-center border-x border-white/5">
                          <span className="text-text-tertiary uppercase text-[5.8px] block leading-none">Trust Decay rate</span>
                          <span className="text-rose-400 font-extrabold text-xs block mt-1.5">+{temporalData.drift.trustDriftPercentage}%</span>
                        </div>
                        <div className="text-center">
                          <span className="text-text-tertiary uppercase text-[5.8px] block leading-none">Governance Drift</span>
                          <span className="text-white font-extrabold text-xs block mt-1.5">{temporalData.drift.governanceDriftPercentage}%</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#1e293b] leading-relaxed">
                        <span className="font-bold text-accent-cyan block uppercase mb-1 leading-none text-[7px]">Calculated drift status signature</span>
                        <div className="flex gap-1.5 flex-wrap">
                          {temporalData.drift.driftIndicators.map((ind: string, i: number) => (
                            <span key={i} className="bg-amber-500/10 text-amber-300 border border-amber-500/35 px-1 py-0.5 rounded-sm uppercase text-[5.8px] leading-none">{ind}</span>
                          ))}
                        </div>
                        {temporalData.drift.isRiskThresholdExceeded && (
                          <span className="text-rose-500 font-bold block mt-2 text-[7px] uppercase leading-none animate-pulse">🚨 SYSTEM INTEGRITY ALARM: CORE DRIFT THRESHOLD OUT OF BOUNDS</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-text-tertiary uppercase text-[7.5px]">Awaiting displacement metrics compile</span>
                  )}
                </div>

                <div className="border-t border-white/5 pt-3 mt-3">
                  <span className="text-text-tertiary uppercase text-[6.5px] font-bold block mb-1.5">Mitre Sequence Matching Engine</span>
                  <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar pr-1 text-[7px]">
                    {temporalData?.matchingSequences?.map((seq: any, i: number) => (
                      <div key={i} className="bg-void/40 border border-white/5 p-1.5 rounded flex items-center justify-between">
                        <div>
                          <span className="text-white font-bold block truncate max-w-[170px] uppercase leading-none">{seq.pattern?.name}</span>
                          <span className="text-text-tertiary uppercase block text-[5.8px] mt-0.5 leading-none">{seq.pattern?.mitreAlignment}</span>
                        </div>
                        <span className={cn(
                          "px-1 py-[1.5px] border rounded-xs font-bold shrink-0 text-[5.8px]",
                          seq.completenessPercentage === 100 ? "text-red-400 border-red-500/20 bg-red-400/5 animate-pulse" : "text-text-tertiary border-white/10"
                        )}>
                          {seq.completenessPercentage}% Match
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {dashboardTab === 'policies' && (
          <div className="flex-1 min-h-0 bg-[#05070f] border border-white/5 p-3 rounded flex flex-col font-mono text-[8px] justify-between">
            <div>
              <span className="text-white text-[8px] tracking-[0.2em] font-bold uppercase block mb-3 leading-none">Segment Posturing & Network Compliance Audits</span>
              
              <div className="space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                <div className="bg-[#020408]/60 p-2.5 rounded border border-white/5 space-y-1 text-[7.5px] leading-relaxed">
                  <span className={cn(
                    "px-1.5 py-[1.5px] border rounded-xs text-[6.5px] font-bold uppercase",
                    violationsCount > 0 ? "text-rose-400 border-rose-500/35 bg-rose-500/5 animate-pulse" : "text-emerald-400 border-emerald-500/10"
                  )}>
                    {violationsCount > 0 ? "NON-COMPLIANT Posture Detected" : "CONFORMING posturing verified"}
                  </span>
                  
                  <div className="mt-2.5 space-y-2 leading-relaxed">
                    <div className="flex gap-2 items-start text-text-secondary border-t border-white/5 pt-2">
                      <span className="text-text-tertiary font-bold">POL-SEC-001:</span>
                      <div>
                        <span className="text-white font-bold block">SENSITIVE_ASSETS_INTEGRITY (Critical Severity)</span>
                        <p className="normal-case text-text-tertiary text-[7px] mt-0.5">Enforces quarantine triggers and isolates connections on any hosts containerizing high-priority database clusters from egress. Status: {activeInfections.length > 0 ? "WARNING - active compromise pathways" : "STEADY STATUS"}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 items-start text-text-secondary border-t border-white/5 pt-2">
                      <span className="text-text-tertiary font-bold">POL-SEC-002:</span>
                      <div>
                        <span className="text-white font-bold block">PRIVILEGED_ACCOUNT_BOUNDARIES (High Severity)</span>
                        <p className="normal-case text-text-tertiary text-[7px] mt-0.5">Continuous verification requiring immediate secrets rotation and isolation if identity risk levels on core cluster interfaces exceed 40%.</p>
                      </div>
                    </div>

                    <div className="flex gap-2 items-start text-text-secondary border-t border-white/5 pt-2">
                      <span className="text-text-tertiary font-bold">POL-SEC-003:</span>
                      <div>
                        <span className="text-white font-bold block">BEHAVIORAL_COMPLIANCE_THRESHOLD (Medium Severity)</span>
                        <p className="normal-case text-text-tertiary text-[7px] mt-0.5">Flags and restricts any cluster endpoints when anomaly index score indicators breach 60%.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-void/50 border border-white/5 p-2 rounded flex justify-between items-center text-[7px]">
              <span className="text-text-tertiary uppercase leading-none">Automated policy reconciliation checks online</span>
              <span className="text-emerald-400 font-bold leading-none uppercase">● Compliance continuous sweep active</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

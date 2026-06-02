import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, RefreshCw, AlertTriangle, ShieldCheck, TrendingUp, DollarSign, 
  Users, Server, Shield, FileText, CheckCircle2, X, Brain, HelpCircle, 
  Timer, Landmark, Sparkles, Network, ArrowRight, Gauge, Layers, Info
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  BarChart, Bar, Legend, Cell 
} from 'recharts';

export interface EnterpriseSimulationCenterProps {
  operatorRole?: string;
  activeTenant?: string;
}

interface EnterpriseEntity {
  id: string;
  name: string;
  type: string;
  status: string;
  criticality: string;
  revenuePerHr?: number;
}

interface SimulatedScenarioReport {
  scenarioId: string;
  name: string;
  description: string;
  failedStartingNodes: string[];
  workforce: {
    disabledNodeIds: string[];
    degradedNodeIds: string[];
    recoveryMultiplier: number;
    unauthorizedAccessEvents: Array<{ employeeName: string; action: string; severity: string }>;
    workforceContinuity: number;
  };
  infrastructure: {
    disabledNodeIds: string[];
    degradedNodeIds: string[];
    networkLatencyMs: number;
    dataReplicationSyncPct: number;
    activeInfrastructureSLA: number;
  };
  governance: {
    disabledNodeIds: string[];
    degradedNodeIds: string[];
    complianceScore: number;
    identifiedViolations: Array<{ standard: string; details: string; severity: string }>;
    securityClearanceIndex: number;
  };
  business: {
    operationalContinuity: number;
    financialLossPerHrUSD: number;
    customerImpactScore: number;
    executiveVisibility: string;
    slaBreachRate: number;
    vulnerableRevenueUSD: number;
  };
  timeline: Array<{
    timeframe: string;
    label: string;
    cumulativeCostUSD: number;
    recoveryPercentage: number;
    activeLossRatePerHr: number;
    complianceDriftIndex: number;
    customerSatisfaction: number;
    alertLevel: string;
  }>;
  impactReport: {
    overallResilienceIndex: number;
    operationalRating: string;
    financialScoreUSD: number;
    complianceSeverity: string;
    recoveryFrictionRating: string;
    retrospectives: string[];
    customerFrustrationLevel: string;
  };
  strategicAdvisories: {
    bestResponse: string;
    bestMitigation: string;
    lowestRiskOption: string;
    fastestRecoveryPath: string;
    mostCostEffective: string;
    options: Array<{
      id: string;
      name: string;
      description: string;
      riskRating: 'low' | 'medium' | 'high';
      costUSD: number;
      recoveryHrs: number;
      governanceScore: number;
      operationalContinuity: number;
      tradeoffs: string;
      isRecommended: boolean;
    }>;
  };
  nodesStatus: Array<{ id: string; name: string; type: string; status: 'nominal' | 'degraded' | 'disabled' }>;
  aiConsultationActive: boolean;
  aiAdvisorMessage?: string;
}

export function EnterpriseSimulationCenter({
  operatorRole = 'Executive Administrator',
  activeTenant = 'CORE_GLOBAL_HQ'
}: EnterpriseSimulationCenterProps) {
  // Preset scenarios selection
  const [selectedScenarioType, setSelectedScenarioType] = useState<
    'ransomware_outbreak' | 'cloud_outage' | 'workforce_departure' | 'governance_drift' | 'custom_whatif'
  >('ransomware_outbreak');

  // Custom what-if variables
  const [entities, setEntities] = useState<EnterpriseEntity[]>([]);
  const [selectedCustomTargets, setSelectedCustomTargets] = useState<string[]>([]);
  const [customDescription, setCustomDescription] = useState('');
  
  // Simulation run states
  const [isRunning, setIsRunning] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [report, setReport] = useState<SimulatedScenarioReport | null>(null);
  const [comparisonActive, setComparisonActive] = useState(false);
  const [comparisonReports, setComparisonReports] = useState<SimulatedScenarioReport[]>([]);
  
  // UI Tabs inside simulation center
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'graph' | 'timeline' | 'playbooks' | 'comparison'>('overview');

  // Load available baseline entities on mount for manual multi-selection lists
  useEffect(() => {
    fetch('/api/v2/enterprise-simulation/entities')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setEntities(data.entities);
        }
      })
      .catch(err => console.error('Failed to load baseline simulation entities:', err));
  }, []);

  // Trigger base simulation
  const handleRunSimulation = async () => {
    setIsRunning(true);
    setSimulationProgress(0);
    
    // Smooth cinematic progress ticking
    const interval = setInterval(() => {
      setSimulationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 15;
      });
    }, 120);

    try {
      const res = await fetch('/api/v2/enterprise-simulation/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scenarioType: selectedScenarioType,
          customTargets: selectedScenarioType === 'custom_whatif' ? selectedCustomTargets : [],
          customDescription: selectedScenarioType === 'custom_whatif' ? customDescription : ''
        })
      });
      const data = await res.json();
      
      setTimeout(() => {
        if (data.success) {
          setReport(data.report);
          // If we run a scenario, add it to our list of comparison reports (max 3)
          setComparisonReports(prev => {
            const trimmed = prev.filter(r => r.name !== data.report.name);
            return [data.report, ...trimmed].slice(0, 3);
          });
        }
        setIsRunning(false);
      }, 900); // slight beat to enjoy progress completion
    } catch (err) {
      console.error('Simulation execution failed:', err);
      setIsRunning(false);
    }
  };

  // Run comparative suite automatically for Comparison mode
  const handleTriggerComparison = async () => {
    setIsRunning(true);
    setSimulationProgress(0);
    const interval = setInterval(() => {
      setSimulationProgress(prev => Math.min(100, prev + 20));
    }, 150);

    try {
      const res = await fetch('/api/v2/enterprise-simulation/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scenarioTypes: ['ransomware_outbreak', 'cloud_outage', 'workforce_departure']
        })
      });
      const data = await res.json();
      setTimeout(() => {
        if (data.success) {
          setComparisonReports(data.reports);
          setReport(data.reports[0]); // Default to first for summary
          setActiveSubTab('comparison');
        }
        setIsRunning(false);
      }, 800);
    } catch (err) {
      console.error('Comparison execution failed:', err);
      setIsRunning(false);
    }
  };

  // Toggle custom what-if targets
  const toggleCustomTarget = (id: string) => {
    setSelectedCustomTargets(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Format category titles
  const formatType = (type: string) => {
    return type.toUpperCase().replace('_', ' ');
  };

  return (
    <div className="space-y-6 pt-2 pb-12 px-1 text-left">
      
      {/* 1. TOP OVERVIEW PANEL STRATEGIC CARDS */}
      <div className="p-6 bg-gradient-to-r from-panel/30 to-panel/10 border border-border/80 rounded-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-accent-cyan animate-pulse" />
            <h2 className="text-sm font-black text-white uppercase tracking-widest font-mono">
              SentinelX Enterprise Scenario Simulation & Strategic Continuity Center
            </h2>
          </div>
          <p className="text-[9.5px] text-text-secondary uppercase leading-relaxed">
            Unleash continuous multi-layered graph calculations to simulate cascading failures of human assets, regional cloud compute pipelines, core microservice APIs, and operational policy constraints. Evaluate complex future postures before outages strike.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleTriggerComparison}
            disabled={isRunning}
            className="px-5 py-2.5 bg-void border border-accent-cyan/40 hover:border-accent-cyan text-accent-cyan hover:bg-accent-cyan/15 h-10 text-[9.5px] font-mono font-black tracking-wider transition-all rounded-xs uppercase disabled:opacity-50 cursor-pointer"
          >
            RUN COMPARATIVE BOARD
          </button>
        </div>
      </div>

      {/* 2. CHOOSE PRESET OR SYSTEM BUILDER */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: SCENARIO CONFIGURATION AND TRIGGERING */}
        <div className="p-5 bg-[#040815]/80 border border-border/80 rounded-sm space-y-6">
          <div className="border-b border-border/40 pb-3">
            <span className="text-[10.5px] font-mono font-extrabold text-white uppercase block">
              1. INITIALIZE SCENARIO TEMPLATE
            </span>
            <span className="text-[8px] text-text-tertiary uppercase">Select failure vector patterns</span>
          </div>

          <div className="space-y-3">
            {[
              {
                id: 'ransomware_outbreak',
                title: 'Ransomware Host Outbreak',
                desc: 'Encrypts Aurora SQL transactional nodes cascades checkout gateway interruptions.',
                badge: 'Infrastructure'
              },
              {
                id: 'cloud_outage',
                title: 'AWS us-east-1 Outage Breakdown',
                desc: 'Loss of core regional cluster, Kubernetes hosting systems, and live user routes.',
                badge: 'Multi-Cloud'
              },
              {
                id: 'workforce_departure',
                title: 'Principal DevOps SRE Resignation',
                desc: 'Sudden loss of lead deployment architect. Slows system-wide recovery speeds by 3.5x.',
                badge: 'Workforce Continuity'
              },
              {
                id: 'governance_drift',
                title: 'Zero-Trust Policy Deactivation',
                desc: 'Removal of FIDO2 Okta MFA checks. Initiates immediate SOC2/GDPR compliance infractions.',
                badge: 'Compliance & Audit'
              },
              {
                id: 'custom_whatif',
                title: 'Manual Custom What-If Matrix',
                desc: 'Manually select multiple organizational targets and cascade their business outages.',
                badge: 'Dynamic Synthesis'
              }
            ].map(sc => (
              <div
                key={sc.id}
                onClick={() => setSelectedScenarioType(sc.id as any)}
                className={`p-3 border rounded-sm transition-all text-left group cursor-pointer relative ${
                  selectedScenarioType === sc.id
                    ? 'border-accent-cyan bg-accent-cyan/5'
                    : 'border-border/60 hover:border-white/20 bg-panel/5'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[9.5px] font-mono font-extrabold ${selectedScenarioType === sc.id ? 'text-accent-cyan' : 'text-white'}`}>
                    {sc.title.toUpperCase()}
                  </span>
                  <span className="text-[6.5px] font-mono bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-text-tertiary">
                    {sc.badge.toUpperCase()}
                  </span>
                </div>
                <p className="text-[8px] text-text-secondary leading-normal">{sc.desc}</p>
                {selectedScenarioType === sc.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-accent-cyan" />
                )}
              </div>
            ))}
          </div>

          {/* DYNAMIC METRIC SELECTION (ONLY SHOWS FOR CUSTOM WHAT-IF SCENARIOS) */}
          <AnimatePresence>
            {selectedScenarioType === 'custom_whatif' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-4 border-t border-border/40 space-y-4 overflow-hidden"
              >
                <div>
                  <span className="text-[9px] font-mono text-white block mb-1">CUSTOM FAILURE DESCRIPTION</span>
                  <input
                    type="text"
                    placeholder="E.g. What happens if customer metastores corrupt?"
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    className="w-full bg-void border border-border h-8 pl-3 text-[9.5px] text-white outline-none rounded font-mono uppercase focus:border-accent-cyan/60"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-mono text-white">SELECT DEACTIVATED TARGETS ({selectedCustomTargets.length})</span>
                    {selectedCustomTargets.length > 0 && (
                      <button
                        onClick={() => setSelectedCustomTargets([])}
                        className="text-[7.5px] text-rose-400 hover:underline hover:cursor-pointer"
                      >
                        RESET ALL
                      </button>
                    )}
                  </div>

                  <div className="max-h-52 overflow-y-auto border border-border/60 rounded bg-void/60 divide-y divide-border/20 custom-scrollbar p-1">
                    {entities.map(e => {
                      const isSelected = selectedCustomTargets.includes(e.id);
                      return (
                        <div
                          key={e.id}
                          onClick={() => toggleCustomTarget(e.id)}
                          className={`p-2 hover:bg-white/5 cursor-pointer flex items-center justify-between text-[8.5px] font-mono ${
                            isSelected ? 'bg-accent-cyan/5 text-accent-cyan font-bold' : 'text-text-secondary'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate max-w-[200px]">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              e.criticality === 'critical' ? 'bg-rose-500 animate-pulse' : 'bg-text-tertiary'
                            }`} />
                            <span className="truncate">{e.name.toUpperCase()}</span>
                          </div>
                          <span className="text-[7px] text-text-tertiary border border-white/5 px-1 bg-white/5 uppercase shrink-0">
                            {formatType(e.type)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleRunSimulation}
            disabled={isRunning || (selectedScenarioType === 'custom_whatif' && selectedCustomTargets.length === 0)}
            className="w-full h-11 bg-accent-cyan hover:bg-[#00e1b9] active:scale-[0.98] text-void text-[10.5px] font-black tracking-widest font-mono flex items-center justify-center gap-2 transition-all transition-transform duration-100 rounded-sm uppercase disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-[0_0_15px_rgba(0,255,209,0.15)]"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-void" />
                <span>CASCADE CALCULATION ACTIVE {simulationProgress}%</span>
              </>
            ) : (
              <>
                <Play className="w-4.5 h-4.5 fill-void" />
                <span>EXECUTE CONTINUITY SIMULATION</span>
              </>
            )}
          </button>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE VISUAL FEEDBACK AND EXECUTIVE SUMMARY MAP */}
        <div className="xl:col-span-2 flex flex-col bg-[#040815]/40 border border-border/80 rounded-sm overflow-hidden">
          
          {/* RESULTS SUBNAV VIEWS */}
          <div className="h-11 border-b border-border bg-[#050a18] flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center h-full gap-4">
              {[
                { id: 'overview', label: 'EXECUTIVE SUMMARY', icon: FileText },
                { id: 'graph', label: 'DEPENDENCY CASCADE FEED', icon: Network },
                { id: 'timeline', label: 'COMPOUNDING PROJECTIONS', icon: Timer },
                { id: 'playbooks', label: 'STRATEGIC MITIGATIONS', icon: Sparkles },
                { id: 'comparison', label: 'COMPARATIVE MATRIX', icon: Gauge }
              ].map(sub => {
                const Icon = sub.icon;
                const isActive = activeSubTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSubTab(sub.id as any)}
                    className={`flex items-center gap-2 h-full px-3 text-[9px] font-mono tracking-widest relative transition-all ${
                      isActive ? 'text-accent-cyan' : 'text-text-secondary hover:text-white'
                    }`}
                  >
                    <Icon size={12} />
                    <span>{sub.label}</span>
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent-cyan shadow-[0_0_8px_#00FFD1]" />
                    )}
                  </button>
                );
              })}
            </div>
            {report && (
              <span className="text-[8px] font-mono text-text-tertiary">
                SIM ID: {report.scenarioId.toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {isRunning ? (
              <div className="h-96 flex flex-col items-center justify-center space-y-4">
                <RefreshCw size={24} className="text-accent-cyan animate-spin" />
                <div className="font-mono text-center space-y-1.5 uppercase">
                  <span className="text-[10px] text-white font-extrabold block">TRAVERSING ENTERPRISE MAP NODES...</span>
                  <span className="text-[8px] text-text-tertiary block">COMPUTING CASCADING INTERMITTENT HARD DEPENDECIES...</span>
                </div>
              </div>
            ) : !report ? (
              <div className="h-96 flex flex-col items-center justify-center space-y-4 text-center">
                <AlertTriangle size={24} className="text-accent-blue animate-pulse" />
                <div className="font-mono space-y-2 uppercase max-w-sm">
                  <span className="text-[10px] text-white font-extrabold block">NO SIMULATION REPORT REGISTERED</span>
                  <p className="text-[8.5px] text-text-tertiary leading-loose">
                    Configure your priority organizational targets on the left deck and launch the simulation runtime server to inspect critical business cascade, SLA breaches, and financial recovery paths.
                  </p>
                </div>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                
                {/* SUB TAB 1: EXECUTIVE SUMMARY */}
                {activeSubTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6 text-left"
                  >
                    {/* SCENARIO META */}
                    <div className="flex flex-col gap-1 border-l-2 border-l-accent-cyan pl-4 bg-white/[0.01] p-3 border border-border/30">
                      <span className="text-[11.5px] font-mono font-black text-white">{report.name.toUpperCase()}</span>
                      <p className="text-[8.5px] text-text-secondary leading-relaxed uppercase">{report.description}</p>
                    </div>

                    {/* CORE GAUGES SCORE */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      
                      <div className="p-4 bg-panel/10 border border-border flex flex-col justify-between">
                        <span className="text-[7.5px] text-text-tertiary block font-mono">RESILIENCE IMMUNITY INDEX</span>
                        <div className="flex items-baseline gap-1 mt-2">
                          <span className={`text-[22px] font-black tracking-tight ${
                            report.impactReport.overallResilienceIndex > 75 
                              ? 'text-emerald-400' 
                              : report.impactReport.overallResilienceIndex > 45 
                                ? 'text-amber-400' 
                                : 'text-rose-400'
                          }`}>
                            {report.impactReport.overallResilienceIndex}
                          </span>
                          <span className="text-[9px] text-text-tertiary font-mono">/100</span>
                        </div>
                        <div className="h-1 w-full bg-void rounded-full overflow-hidden mt-2">
                          <div 
                            className={`h-full ${
                              report.impactReport.overallResilienceIndex > 75 
                                ? 'bg-emerald-400' 
                                : report.impactReport.overallResilienceIndex > 45 
                                  ? 'bg-amber-400' 
                                  : 'bg-rose-400'
                            }`}
                            style={{ width: `${report.impactReport.overallResilienceIndex}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-panel/10 border border-border flex flex-col justify-between">
                        <span className="text-[7.5px] text-text-tertiary block font-mono">30-DAY OUTAGE DIRECT COST</span>
                        <div className="flex items-baseline gap-1 mt-2 text-white">
                          <span className="text-xs text-text-tertiary font-bold">$</span>
                          <span className="text-[20px] font-black tracking-tight text-white">
                            {report.impactReport.financialScoreUSD.toLocaleString()}
                          </span>
                        </div>
                        <span className="text-[6.5px] text-text-tertiary font-mono mt-2 block uppercase">
                          CUMULATIVE DIRECT DAMAGE
                        </span>
                      </div>

                      <div className="p-4 bg-panel/10 border border-border flex flex-col justify-between">
                        <span className="text-[7.5px] text-text-tertiary block font-mono">CUSTOMER SATISFACTION</span>
                        <div className="flex items-baseline gap-1 mt-2">
                          <span className={`text-[22px] font-black tracking-tight ${
                            report.business.customerImpactScore > 60 ? 'text-rose-400' : 'text-emerald-400'
                          }`}>
                            {Math.max(12, 100 - report.business.customerImpactScore)}%
                          </span>
                        </div>
                        <span className="text-[7px] text-text-tertiary font-mono block mt-2 truncate">
                          {report.impactReport.customerFrustrationLevel.toUpperCase()}
                        </span>
                      </div>

                      <div className="p-4 bg-panel/10 border border-border flex flex-col justify-between">
                        <span className="text-[7.5px] text-text-tertiary block font-mono">COMPLIANCE SAFETY POSTURE</span>
                        <div className="flex items-baseline gap-1 mt-2">
                          <span className={`text-[22px] font-black tracking-tight ${
                            report.governance.complianceScore > 80 ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {report.governance.complianceScore}
                          </span>
                          <span className="text-[9px] text-text-tertiary font-mono">/100</span>
                        </div>
                        <span className="text-[7px] text-text-tertiary font-mono uppercase block mt-2">
                          {report.governance.identifiedViolations.length} DETECTED DEVIATIONS
                        </span>
                      </div>

                    </div>

                    {/* SUB METRICS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* STATS TABLE */}
                      <div className="p-5 bg-panel/10 border border-border space-y-4">
                        <span className="text-[10px] font-mono font-bold text-white block uppercase border-b border-border/20 pb-2">
                          CORE BUSINESS & OPERATIONAL IMPACTS
                        </span>
                        
                        <div className="space-y-3">
                          {[
                            { label: 'Operational CONTINUITY', value: `${report.business.operationalContinuity}%`, flag: report.business.operationalContinuity < 60 },
                            { label: 'ACTIVE HOURLY REVENUE LOSS', value: `$${Math.round(report.business.financialLossPerHrUSD).toLocaleString()} / hour`, flag: report.business.financialLossPerHrUSD > 2000 },
                            { label: 'SUPPORT SLA INCIDENT ESCALATIONS', value: `${report.business.slaBreachRate}% MISS RATIO`, flag: report.business.slaBreachRate > 40 },
                            { label: 'VULNERABLE REVENUE EXPOSURE', value: `$${report.business.vulnerableRevenueUSD.toLocaleString()} USD`, flag: report.business.vulnerableRevenueUSD > 10000 },
                            { label: 'EXECUTIVE TEAM ACTION ALERT', value: (report.business.executiveVisibility || 'NOMINAL_OPERATIONS').replace(/_/g, ' '), flag: report.business.executiveVisibility === 'BOARD_CRISIS' }
                          ].map((x, idx) => (
                            <div key={idx} className="flex justify-between items-center text-[9px] font-mono pb-2 border-b border-border/10 last:border-b-0">
                              <span className="text-text-tertiary">{x.label.toUpperCase()}</span>
                              <span className={`font-extrabold ${x.flag ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
                                {x.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* COMPLIANCE WARNINGS */}
                      <div className="p-5 bg-panel/10 border border-border space-y-4">
                        <span className="text-[10px] font-mono font-bold text-white block uppercase border-b border-border/20 pb-2">
                          COMPLIANCE INFRACTIONS ({report.governance.identifiedViolations.length})
                        </span>
                        {report.governance.identifiedViolations.length === 0 ? (
                          <div className="text-center py-6 space-y-2 text-emerald-400">
                            <ShieldCheck size={20} className="mx-auto" />
                            <span className="text-[8.5px] font-mono block font-black uppercase">ZERO REGULATORY INFRACTIONS</span>
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-52 overflow-y-auto custom-scrollbar pr-2">
                            {report.governance.identifiedViolations.map((v, i) => (
                              <div key={i} className="p-2.5 bg-void/60 border border-rose-500/10 rounded-xs flex items-start gap-2.5 text-left font-mono">
                                <AlertTriangle size={12} className="text-rose-400 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                  <span className="text-[8px] font-black bg-rose-500/15 text-rose-400 px-1 py-0.5 rounded uppercase">
                                    [REGULATORY ALERT] {v.standard}
                                  </span>
                                  <p className="text-[8px] text-text-secondary leading-relaxed uppercase">{v.details}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>

                    {/* GEMINI AI STRATEGIC BRIEFING COGNITIVE MEMORIES */}
                    {report.aiAdvisorMessage && (
                      <div className="p-6 bg-gradient-to-br from-indigo-950/20 to-void border border-indigo-500/30 rounded-sm space-y-3 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 text-indigo-400 opacity-20">
                          <Brain size={60} />
                        </div>
                        <div className="flex items-center gap-2 border-b border-indigo-500/20 pb-2.5">
                          <Sparkles size={14} className="text-accent-cyan" />
                          <span className="font-mono text-[10px] font-black text-white uppercase">
                            SENTINEL-X AI COGNITIVE STRATEGIC BRIEFING & RECOVERY ADVISORY
                          </span>
                        </div>
                        <div className="text-[9px] text-text-secondary uppercase leading-relaxed font-mono whitespace-pre-wrap select-text markdown-body border-l border-white/5 pl-4 max-h-72 overflow-y-auto custom-scrollbar">
                          {report.aiAdvisorMessage}
                        </div>
                      </div>
                    )}

                    {/* REPORT RETROSPECTIVES BULLETS */}
                    <div className="p-5 bg-panel/10 border border-border space-y-3">
                      <span className="text-[10px] font-mono font-bold text-white block uppercase border-b border-border/20 pb-2">
                        SIMULATED TIMELINE TRIGGERS & PATH SUMMARY
                      </span>
                      <ul className="space-y-2 font-mono text-[8.5px] text-text-secondary">
                        {report.impactReport.retrospectives.map((bullet, i) => (
                          <li key={i} className="flex items-start gap-2 uppercase">
                            <span className="text-accent-cyan mt-0.5">•</span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </motion.div>
                )}

                {/* SUB TAB 2: DEPENDENCY CASCADE TRAILING DIAGRAM */}
                {activeSubTab === 'graph' && (
                  <motion.div
                    key="graph"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div className="p-4 bg-void/60 border border-border/80 flex items-center justify-between font-mono text-[8.5px]">
                      <div className="flex items-center gap-2 text-text-tertiary">
                        <Info size={12} className="text-accent-cyan" />
                        <span>ACTIVE GRAPH TOPOLOGIES CASCADING SIMULATED MAP</span>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-rose-400 font-bold">• DISABLED ({report.nodesStatus.filter(n => n.status === 'disabled').length})</span>
                        <span className="text-amber-400 font-bold">• DEGRADED ({report.nodesStatus.filter(n => n.status === 'degraded').length})</span>
                        <span className="text-emerald-400 font-bold">• NOMINAL ({report.nodesStatus.filter(n => n.status === 'nominal').length})</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
                      {['department', 'employee', 'infrastructure', 'database', 'application', 'business_function', 'governance', 'identity'].map((group) => {
                        const items = report.nodesStatus.filter(n => {
                          const base = entities.find(e => e.id === n.id);
                          return base?.type === group;
                        });

                        if (items.length === 0) return null;

                        return (
                          <div key={group} className="p-4 border border-border bg-[#050917]/70 rounded-xs space-y-3">
                            <span className="text-[9px] font-mono font-black text-white uppercase border-b border-border/20 pb-1.5 block">
                              {formatType(group)}S
                            </span>
                            <div className="space-y-2">
                              {items.map(item => (
                                <div 
                                  key={item.id}
                                  className={`p-2 bg-void border rounded-xs flex items-center justify-between text-[8px] font-mono ${
                                    item.status === 'disabled' 
                                      ? 'border-rose-500/30 text-rose-400 bg-rose-500/[0.02]' 
                                      : item.status === 'degraded'
                                        ? 'border-amber-500/30 text-amber-400 bg-amber-500/[0.02]'
                                        : 'border-border/30 text-emerald-400 bg-emerald-500/[0.02]'
                                  }`}
                                >
                                  <span className="truncate max-w-[150px] uppercase">{item.name}</span>
                                  <span className="text-[6.5px] border border-current px-1 font-extrabold uppercase shrink-0">
                                    {item.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* SUB TAB 3: COMPOUNDING PROJECTIONS CHARTING */}
                {activeSubTab === 'timeline' && (
                  <motion.div
                    key="timeline"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6 text-left"
                  >
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* COST ACCUMULATION CHART */}
                      <div className="p-5 bg-panel/10 border border-border space-y-3">
                        <span className="text-[10px] font-mono font-bold text-white block uppercase">
                          Projected Cumulative Failure Costs USD
                        </span>
                        <div className="h-56">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={report.timeline} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                              <XAxis dataKey="label" stroke="#4a5568" style={{ fontSize: '8px', fontFamily: 'monospace' }} />
                              <YAxis stroke="#4a5568" style={{ fontSize: '8px', fontFamily: 'monospace' }} />
                              <Tooltip contentStyle={{ background: '#0a0d1a', border: '1px solid #2d3748', fontSize: '8px', color: '#fff', textTransform: 'uppercase' }} />
                              <Area type="monotone" dataKey="cumulativeCostUSD" name="Cumulative Costs ($)" stroke="#EF4444" fill="rgba(239, 68, 68, 0.1)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* CLIENT SATISFACTION OUTAGE LOSS */}
                      <div className="p-5 bg-panel/10 border border-border space-y-3">
                        <span className="text-[10px] font-mono font-bold text-white block uppercase">
                          RECOVERY CURVE VS CUSTOMER SATISFACTION DETRIMENT
                        </span>
                        <div className="h-56">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={report.timeline} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                              <XAxis dataKey="label" stroke="#4a5568" style={{ fontSize: '8px', fontFamily: 'monospace' }} />
                              <YAxis stroke="#4a5568" style={{ fontSize: '8px', fontFamily: 'monospace' }} />
                              <Tooltip contentStyle={{ background: '#0a0d1a', border: '1px solid #2d3748', fontSize: '8px', color: '#fff', textTransform: 'uppercase' }} />
                              <Area type="monotone" dataKey="recoveryPercentage" name="Recovery Progress (%)" stroke="#00FFD1" fill="rgba(0, 255, 209, 0.05)" />
                              <Area type="monotone" dataKey="customerSatisfaction" name="Customer Loyalty (%)" stroke="#00E5FF" fill="rgba(0, 229, 255, 0.05)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                    </div>

                    {/* INTERVALS COMPARATIVE LEDGER */}
                    <div className="p-4 bg-[#050a18] border border-border overflow-x-auto rounded-xs">
                      <table className="w-full text-left border-collapse font-mono text-[8.5px]">
                        <thead>
                          <tr className="border-b border-border/40 text-text-tertiary">
                            <th className="pb-2.5 uppercase">TIMEFRAME</th>
                            <th className="pb-2.5 uppercase">CUMULATIVE DIRECT OUTLAY</th>
                            <th className="pb-2.5 uppercase">ACTIVE DOWNTIME LOSS SPEED</th>
                            <th className="pb-2.5 uppercase">RECOVERY THRESHOLD STATUS</th>
                            <th className="pb-2.5 uppercase">SYS DRIFT INDEX</th>
                            <th className="pb-2.5 uppercase">CONCERN ALERT</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/10 text-white">
                          {report.timeline.map((item, idx) => (
                            <tr key={idx} className="hover:bg-white/[0.01]">
                              <td className="py-3 font-bold">{item.label.toUpperCase()}</td>
                              <td className="py-3">${item.cumulativeCostUSD.toLocaleString()}</td>
                              <td className="py-3">${item.activeLossRatePerHr.toLocaleString()} / HR</td>
                              <td className="py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-12 bg-void h-1.5 rounded-full overflow-hidden shrink-0">
                                    <div className="bg-accent-cyan h-full" style={{ width: `${item.recoveryPercentage}%` }} />
                                  </div>
                                  <span>{item.recoveryPercentage}%</span>
                                </div>
                              </td>
                              <td className="py-3 text-text-secondary">{item.complianceDriftIndex}% DRIFT</td>
                              <td className="py-3">
                                <span className={`px-1.5 py-0.5 rounded text-[7px] font-black tracking-wide ${
                                  item.alertLevel === 'CATASTROPHIC'
                                    ? 'bg-rose-500/15 text-rose-400'
                                    : item.alertLevel === 'CRITICAL'
                                      ? 'bg-amber-500/15 text-amber-500'
                                      : 'bg-emerald-500/15 text-emerald-400'
                                }`}>
                                  {item.alertLevel}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                  </motion.div>
                )}

                {/* SUB TAB 4: MITIGATIONS AND ROADMAP ACTIONS */}
                {activeSubTab === 'playbooks' && (
                  <motion.div
                    key="playbooks"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6 text-left"
                  >
                    
                    {/* RECOMMENDED RECOVERY VECTORS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {[
                        { title: 'Best Executive Response', text: report.strategicAdvisories.bestResponse, icon: Shield },
                        { title: 'Priority Drift Mitigation', text: report.strategicAdvisories.bestMitigation, icon: Play },
                        { title: 'Lowest Risk Continuous Path', text: report.strategicAdvisories.lowestRiskOption, icon: CheckCircle2 },
                        { title: 'Fastest Escalated Recovery', text: report.strategicAdvisories.fastestRecoveryPath, icon: Timer },
                        { title: 'Most Cost-Effective Fix', text: report.strategicAdvisories.mostCostEffective, icon: DollarSign }
                      ].map((card, i) => {
                        const Icon = card.icon;
                        return (
                          <div key={i} className="p-4 bg-panel/10 border border-border rounded-xs space-y-2 font-mono">
                            <div className="flex items-center gap-2 text-white">
                              <Icon size={12} className="text-accent-cyan shrink-0" />
                              <span className="text-[9px] font-black uppercase tracking-wider">{card.title}</span>
                            </div>
                            <p className="text-[8px] text-text-secondary leading-relaxed uppercase">{card.text}</p>
                          </div>
                        );
                      })}
                    </div>

                    {/* INTERACTIVE COMPARATIVE ALTERNATIVES SCORING CARD */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-mono font-bold text-white block uppercase">
                        SUGGESTED RECOVERY VECTORS ALTERNATIVES (A VS B VS C)
                      </span>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {report.strategicAdvisories.options.map(opt => (
                          <div 
                            key={opt.id}
                            className={`p-5 border flex flex-col justify-between rounded-sm ${
                              opt.isRecommended 
                                ? 'border-accent-cyan bg-accent-cyan/[0.02]' 
                                : 'border-border bg-panel/10'
                            }`}
                          >
                            <div className="space-y-3 font-mono">
                              <div className="flex justify-between items-center">
                                <span className={`text-[9.5px] font-black ${opt.isRecommended ? 'text-accent-cyan' : 'text-white'}`}>
                                  {opt.name.toUpperCase()}
                                </span>
                                {opt.isRecommended && (
                                  <span className="text-[6.5px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.5 rounded font-black uppercase">
                                    RECOMMENDED
                                  </span>
                                )}
                              </div>
                              <p className="text-[8px] text-text-secondary leading-relaxed uppercase pb-3 border-b border-border/20">
                                {opt.description}
                              </p>

                              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[8.5px]">
                                <div className="flex justify-between">
                                  <span className="text-text-tertiary">RISK PROFILE:</span>
                                  <span className={`font-bold uppercase ${
                                    opt.riskRating === 'high' ? 'text-rose-400' : opt.riskRating === 'medium' ? 'text-amber-400' : 'text-emerald-400'
                                  }`}>{opt.riskRating}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-text-tertiary">EST BUDGET COST:</span>
                                  <span className="text-white font-bold">${opt.costUSD.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-text-tertiary">RECOVERY TIMELINE:</span>
                                  <span className="text-white font-bold">{opt.recoveryHrs} HRS</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-text-tertiary">COMPLIANCE SAFETY:</span>
                                  <span className="text-white font-bold">{opt.governanceScore}/100</span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-5 pt-3 border-t border-border/20 font-mono text-[7.5px] text-text-tertiary leading-relaxed uppercase">
                              <span className="text-white font-bold block mb-1">STRATEGIC TRADEOFFS:</span>
                              {opt.tradeoffs}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </motion.div>
                )}

                {/* SUB TAB 5: COMPARATIVE MULTI-SCENARIOS GRID MATRIX */}
                {activeSubTab === 'comparison' && (
                  <motion.div
                    key="comparison"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6 text-left"
                  >
                    
                    {comparisonReports.length === 0 ? (
                      <div className="p-8 border border-dashed border-border text-center py-12 space-y-3">
                        <AlertTriangle className="mx-auto text-accent-blue animate-pulse" />
                        <div className="space-y-1.5 font-mono text-[9px] uppercase">
                          <span className="text-white block font-black">NO COMPARATIVE REPORTS COMPILED</span>
                          <span className="text-text-tertiary block">Trigger multiple simulations above to construct dynamic comparative grids.</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        
                        {/* CHART VISUALS SIDE-BY-SIDE */}
                        <div className="p-5 bg-panel/10 border border-border space-y-3">
                          <span className="text-[10px] font-mono font-bold text-white block uppercase">
                            Direct Cost Exposure & Continuity Comparisons
                          </span>
                          <div className="h-60">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={comparisonReports} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                                <XAxis dataKey="name" stroke="#4a5568" style={{ fontSize: '7.5px', fontFamily: 'monospace' }} />
                                <YAxis stroke="#4a5568" style={{ fontSize: '7.5px', fontFamily: 'monospace' }} />
                                <Tooltip contentStyle={{ background: '#0a0d1a', border: '1px solid #2d3748', fontSize: '8px' }} />
                                <Legend wrapperStyle={{ fontSize: '7px', fontFamily: 'monospace', textTransform: 'uppercase' }} />
                                <Bar dataKey="impactReport.financialScoreUSD" name="Projected Loss Damage ($)" fill="#EF4444" />
                                <Bar dataKey="business.vulnerableRevenueUSD" name="Revenue Exposed ($)" fill="#00E5FF" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* GRID MATRIX LEDGER */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {comparisonReports.map((cReport, i) => (
                            <div 
                              key={i} 
                              className={`p-5 border rounded-sm font-mono space-y-4 ${
                                cReport.scenarioId === report.scenarioId 
                                  ? 'border-accent-cyan bg-accent-cyan/[0.02]' 
                                  : 'border-border bg-panel/10'
                              }`}
                            >
                              <div className="flex justify-between items-start border-b border-border/20 pb-3">
                                <div>
                                  <span className="text-[9.5px] font-black text-white uppercase block truncate max-w-[170px]">
                                    {cReport.name.split(':')[1]?.trim() || cReport.name}
                                  </span>
                                  <span className="text-[7px] text-text-tertiary uppercase">{cReport.scenarioId}</span>
                                </div>
                                <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded ${
                                  cReport.impactReport.overallResilienceIndex > 65 
                                    ? 'bg-emerald-500/15 text-emerald-400' 
                                    : 'bg-rose-500/15 text-rose-400'
                                }`}>
                                  RESILIENCE INDEX: {cReport.impactReport.overallResilienceIndex}
                                </span>
                              </div>

                              <div className="space-y-2.5 text-[8.5px]">
                                <div className="flex justify-between">
                                  <span className="text-text-tertiary">DIRECT COST (30-DAY):</span>
                                  <span className="text-white font-extrabold">${cReport.impactReport.financialScoreUSD.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-text-tertiary">OPERATIONAL CONTINUITY:</span>
                                  <span className="text-white font-extrabold">{cReport.business.operationalContinuity}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-text-tertiary">COMPLIANCE COMPROMISE:</span>
                                  <span className="text-white font-extrabold">{cReport.governance.complianceScore}/100</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-text-tertiary">CUSTOMER CHURN FRACTION:</span>
                                  <span className="text-rose-400 font-extrabold">{cReport.business.customerImpactScore}% RISK</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-text-tertiary">SLA INCIDENT OUTAGES:</span>
                                  <span className="text-white font-extrabold">{cReport.business.slaBreachRate}% FAILURE</span>
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  setReport(cReport);
                                  setActiveSubTab('overview');
                                }}
                                className="w-full py-2 bg-void border border-border hover:border-accent-cyan/60 transition-colors text-[8px] font-black tracking-widest text-text-secondary hover:text-white rounded-xs uppercase cursor-pointer"
                              >
                                LOAD FULL WORKSPACE SUMMARY
                              </button>
                            </div>
                          ))}
                        </div>

                      </div>
                    )}

                  </motion.div>
                )}

              </AnimatePresence>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
export default EnterpriseSimulationCenter;

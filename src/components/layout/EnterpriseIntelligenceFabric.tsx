import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Network, Search, Users, Server, Database, Cloud, FileCheck, 
  Brain, ShieldAlert, Cpu, Layers, Lock, Eye, RefreshCw, BarChart2, 
  DollarSign, Globe, CornerDownRight, Activity, Info, ShieldX, 
  ChevronRight, ArrowRight, Building2, UserCheck, Sparkles, Send, 
  Clock, AlertTriangle, Plus, Check, Play, Trash2, HelpCircle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Types matched with the server fabric schema
interface FabricEntity {
  id: string;
  name: string;
  type: 'employee' | 'department' | 'application' | 'database' | 'infra_node' | 'governance_rule' | 'cloud_resource';
  metadata: any;
}

interface FabricRelation {
  sourceId: string;
  sourceType: string;
  targetId: string;
  targetType: string;
  relationType: string;
  strength: number;
}

interface AdjacencyResult {
  relation: FabricRelation;
  entity: FabricEntity;
  direction: 'incoming' | 'outgoing';
}

interface ImpactMetrics {
  id: string;
  name: string;
  type: string;
  operationalImpact: number;
  businessCriticality: number;
  governanceSensitivity: number;
  dependencyWeight: number;
  failureImpactScore: number;
  recoveryComplexity: string;
}

interface BlastRadiusResult {
  targetNodeName: string;
  targetNodeType: string;
  blastScore: number;
  strategicImpactSummary: string;
  counts: {
    direct: number;
    indirect: number;
    downstream: number;
    totalCascading: number;
  };
  directImpacted: Array<{ id: string; name: string; type: string }>;
  indirectImpacted: Array<{ id: string; name: string; type: string }>;
  downstreamImpacted: Array<{ id: string; name: string; type: string }>;
}

interface MemoryEntry {
  id: string;
  timestamp: string;
  category: 'incident' | 'governance_leak' | 'bottleneck' | 'access_anomaly';
  title: string;
  description: string;
  mitigationSteps: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

interface SPOF {
  id: string;
  name: string;
  type: string;
  dependencyDepth: number;
  riskScore: number;
  reason: string;
}

interface RiskAssessment {
  enterpriseRiskIndex: number;
  zeroTrustViolationsCount: number;
  zeroTrustViolations: string[];
  singlePointsOfFailure: SPOF[];
  totalTrackedEntities: number;
  totalTrackedRelations: number;
}

interface DependencyChain {
  employeeId: string;
  employeeName: string;
  application: FabricEntity | null;
  database: FabricEntity | null;
  infraNode: FabricEntity | null;
  cloudResource: FabricEntity | null;
  department: FabricEntity | null;
  executiveOwnerName: string;
}

export function EnterpriseIntelligenceFabric() {
  const [subTab, setSubTab] = useState<'explorer' | 'simulation' | 'risk' | 'memory'>('explorer');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Entities lists
  const [entities, setEntities] = useState<FabricEntity[]>([]);
  const [loadingEntities, setLoadingEntities] = useState(false);
  
  // Selected Entity State
  const [selectedEntityId, setSelectedEntityId] = useState<string>('app-ingress-portal');
  const [activeEntity, setActiveEntity] = useState<FabricEntity | null>(null);
  const [adjacencies, setAdjacencies] = useState<AdjacencyResult[]>([]);
  const [impactMetrics, setImpactMetrics] = useState<ImpactMetrics | null>(null);
  const [blastRadius, setBlastRadius] = useState<BlastRadiusResult | null>(null);
  const [dependencyChain, setDependencyChain] = useState<DependencyChain | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // AI Insights State
  const [aiInsights, setAiInsights] = useState<string>('');
  const [generatingAi, setGeneratingAi] = useState(false);

  // Executive Simulation Configuration
  const [simType, setSimType] = useState<'application' | 'database' | 'cloud' | 'department' | 'employee' | 'governance_failure'>('application');
  const [simTargetId, setSimTargetId] = useState<string>('');
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  // Overall Risk State
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [loadingRisk, setLoadingRisk] = useState(false);

  // Memory History Category lists
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [memorySearch, setMemorySearch] = useState('');
  const [loadingMemories, setLoadingMemories] = useState(false);
  
  // Custom Memory Creator Form
  const [newMemCategory, setNewMemCategory] = useState<'incident' | 'governance_leak' | 'bottleneck' | 'access_anomaly'>('incident');
  const [newMemTitle, setNewMemTitle] = useState('');
  const [newMemDesc, setNewMemDesc] = useState('');
  const [newMemSeverity, setNewMemSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [newMemSteps, setNewMemSteps] = useState('');
  const [submittingMemory, setSubmittingMemory] = useState(false);

  // Bootstrapping lists from endpoint
  useEffect(() => {
    fetchEntities();
    fetchRiskAssessment();
    fetchMemories();
  }, []);

  // Sync selected details. Trigger when selectedEntityId changes
  useEffect(() => {
    if (selectedEntityId) {
      fetchEntityDetails(selectedEntityId);
      fetchEmployeeDependency(selectedEntityId);
    }
  }, [selectedEntityId]);

  // Set initial simulation target when simType changes
  useEffect(() => {
    // Find first entity matching that type to auto-configure simulation panel
    const matches = entities.filter(e => {
      if (simType === 'application') return e.type === 'application';
      if (simType === 'database') return e.type === 'database';
      if (simType === 'cloud') return e.type === 'cloud_resource';
      if (simType === 'department') return e.type === 'department';
      if (simType === 'employee') return e.type === 'employee';
      if (simType === 'governance_failure') return e.type === 'governance_rule';
      return false;
    });
    if (matches.length > 0) {
      setSimTargetId(matches[0].id);
    }
  }, [simType, entities]);

  const fetchEntities = async () => {
    try {
      setLoadingEntities(true);
      const res = await fetch(`/api/v2/intelligence/fabric/entities?q=${searchQuery}`);
      const data = await res.json();
      if (data.success) {
        setEntities(data.entities);
        // Default select if not set
        if (data.entities.length > 0 && !selectedEntityId) {
          setSelectedEntityId(data.entities[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch fabric entities', err);
    } finally {
      setLoadingEntities(false);
    }
  };

  const fetchEntityDetails = async (id: string) => {
    try {
      setLoadingDetails(true);
      const res = await fetch(`/api/v2/intelligence/fabric/entities/${id}`);
      const data = await res.json();
      if (data.success) {
        setActiveEntity(data.entity);
        setAdjacencies(data.adjacencies || []);
        setImpactMetrics(data.impact || null);
        setBlastRadius(data.blast || null);
      }
    } catch (err) {
      console.error('Failed to fetch entity details', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const fetchEmployeeDependency = async (id: string) => {
    try {
      const res = await fetch(`/api/v2/intelligence/fabric/dependencies/${id}`);
      const data = await res.json();
      if (data.success) {
        setDependencyChain(data.chain);
      } else {
        setDependencyChain(null);
      }
    } catch (err) {
      setDependencyChain(null);
    }
  };

  const fetchRiskAssessment = async () => {
    try {
      setLoadingRisk(true);
      const res = await fetch('/api/v2/intelligence/fabric/risk');
      const data = await res.json();
      if (data.success) {
        setRiskAssessment(data);
      }
    } catch (err) {
      console.error('Failed to fetch risk metrics', err);
    } finally {
      setLoadingRisk(false);
    }
  };

  const fetchMemories = async () => {
    try {
      setLoadingMemories(true);
      const res = await fetch(`/api/v2/intelligence/fabric/memories?q=${memorySearch}`);
      const data = await res.json();
      if (data.success) {
        setMemories(data.memories);
      }
    } catch (err) {
      console.error('Failed to fetch memories', err);
    } finally {
      setLoadingMemories(false);
    }
  };

  const generateAIReasoning = async (id: string) => {
    try {
      setGeneratingAi(true);
      const res = await fetch('/api/v2/intelligence/fabric/reason', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeId: id })
      });
      const data = await res.json();
      if (data.success) {
        setAiInsights(data.reasoning);
      }
    } catch (err) {
      console.error('AI correlation block failed', err);
    } finally {
      setGeneratingAi(false);
    }
  };

  const executeOutageSimulation = async () => {
    if (!simTargetId) return;
    try {
      setSimulating(true);
      setSimulationResult(null);
      const res = await fetch('/api/v2/intelligence/fabric/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: simType, targetId: simTargetId })
      });
      const data = await res.json();
      if (data.success) {
        setSimulationResult(data.outcome);
        // Refresh memories and risk because simulation appends to history memories!
        fetchMemories();
        fetchRiskAssessment();
      }
    } catch (err) {
      console.error('Outage simulation cascade failed', err);
    } finally {
      setSimulating(false);
    }
  };

  // Helper icons matcher
  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'employee': return Users;
      case 'department': return Building2;
      case 'application': return Layers;
      case 'database': return Database;
      case 'infra_node': return Server;
      case 'governance_rule': return FileCheck;
      case 'cloud_resource': return Cloud;
      default: return HelpCircle;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
      
      {/* 4-COLUMN INNER SYSTEM TABS BAR */}
      <div className="lg:col-span-12 flex items-center justify-between border-b border-border/20 pb-4">
        <div className="flex items-center gap-3">
          <Network className="text-accent-cyan text-lg animate-pulse" />
          <h2 className="text-base font-bold font-mono tracking-widest text-white">SENTINEL_X // KNOWLEDGE_FABRIC_ENGINE</h2>
        </div>
        <div className="flex items-center gap-1 bg-[#050c1f] p-1 border border-border/20 rounded-md">
          {[
            { id: 'explorer', label: 'ENTERPRISE EXPLORER', icon: Search },
            { id: 'simulation', label: 'EXECUTIVE SIMULATION', icon: Play },
            { id: 'risk', label: 'RISK & GRC BOTTLENECKS', icon: ShieldAlert },
            { id: 'memory', label: 'HISTORIC ORGANIZATIONAL MEMORIALS', icon: Brain }
          ].map(sb => {
            const Icon = sb.icon;
            const isAct = subTab === sb.id;
            return (
              <button
                key={sb.id}
                onClick={() => setSubTab(sb.id as any)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-sm font-mono text-[9px] tracking-wider font-bold transition-all uppercase cursor-pointer ${
                  isAct 
                    ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/20' 
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={12} />
                <span>{sb.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* RENDER ACTIVE SUBTAB CONTENT */}
      <div className="lg:col-span-12">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: ENTERPRISE EXPLORER */}
          {subTab === 'explorer' && (
            <motion.div
              key="explorer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              
              {/* SIDEBAR DIRECTORY LISTING (4 COLS) */}
              <div className="lg:col-span-4 space-y-4 flex flex-col">
                <div className="bg-[#05091a]/85 border border-border/40 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white tracking-widest">KNOWLEDGE EXPLORER DIRECTORY</span>
                    <span className="text-[10px] font-mono text-accent-cyan px-2 py-0.5 bg-accent-cyan/10 border border-accent-cyan/15 rounded-md">
                      {entities.length} ASSETS
                    </span>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') fetchEntities();
                      }}
                      placeholder="SEARCH BY EMPLOYEE / DIRECTORY / APPLICATION..."
                      className="w-full text-[10px] font-mono tracking-widest bg-[#02050f]/80 text-white placeholder-text-tertiary px-3 py-2 border rounded border-border/30 focus:border-accent-cyan outline-none transition-all uppercase"
                    />
                    <button 
                      onClick={fetchEntities}
                      className="absolute right-2 top-2 hover:text-accent-cyan text-text-secondary cursor-pointer"
                    >
                      <Search size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 bg-[#05091a]/80 border border-border/25 max-h-[500px] overflow-y-auto custom-scrollbar p-1.5 space-y-1">
                  {loadingEntities ? (
                    <div className="p-8 text-center text-text-tertiary font-mono tracking-wider animate-pulse flex flex-col items-center gap-2">
                      <RefreshCw size={18} className="animate-spin text-accent-cyan" />
                      FETCHING FABRIC GRAPH STATE NODES...
                    </div>
                  ) : entities.length === 0 ? (
                    <div className="p-8 text-center text-text-tertiary font-mono">NO RECORD IDENTIFIED FOR THIS ENTITY PATTERN</div>
                  ) : (
                    entities.map(ent => {
                      const Icon = getEntityIcon(ent.type);
                      const isSelected = selectedEntityId === ent.id;
                      return (
                        <button
                          key={ent.id}
                          onClick={() => {
                            setSelectedEntityId(ent.id);
                            setAiInsights(''); // clean old markdown
                          }}
                          className={`w-full text-left p-3 border transition-all flex items-center justify-between rounded group cursor-pointer ${
                            isSelected 
                              ? 'bg-accent-cyan/10 border-accent-cyan/50 text-accent-cyan' 
                              : 'bg-[#030612]/75 border-border/10 text-text-secondary hover:border-border/30 hover:bg-white/[0.02] hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-3 truncate">
                            <div className={`p-1.5 border rounded ${isSelected ? 'border-accent-cyan/30 bg-accent-cyan/10' : 'border-border/20 bg-[#060c22]'}`}>
                              <Icon size={14} className={isSelected ? 'text-accent-cyan' : 'text-text-tertiary group-hover:text-white'} />
                            </div>
                            <div className="text-left select-text truncate">
                              <div className="font-mono text-[10px] font-bold truncate tracking-widest">{ent.name}</div>
                              <div className="text-[8px] font-mono text-text-tertiary group-hover:text-text-secondary">CLASS: {ent.type.toUpperCase()} // ID: {ent.id}</div>
                            </div>
                          </div>
                          <ChevronRight size={14} className={`shrink-0 transition-transform ${isSelected ? 'translate-x-0.5 text-accent-cyan' : 'text-text-tertiary group-hover:text-white'}`} />
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* ACTIVE SELECTED ENTITY CONTEXT WORKSPACE (8 COLS) */}
              <div className="lg:col-span-8 space-y-8">
                {loadingDetails || !activeEntity ? (
                  <div className="bg-[#05091a]/40 border border-border/20 min-h-[500px] flex flex-col justify-center items-center text-center p-8 text-text-tertiary font-mono tracking-widest animate-pulse gap-3 rounded-lg">
                    <Network size={32} className="animate-spin text-accent-cyan" />
                    DECODING TOPOLOGY BOUNDARIES AND INTEGRATED MEMORY SCHEMES...
                  </div>
                ) : (
                  <div className="space-y-6">
                    
                    {/* CORE HERO SUMMARY BLOCK */}
                    <div className="bg-[#04081c] border border-border/40 p-6 rounded-lg relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                      
                      {/* background decor line */}
                      <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-accent-cyan to-accent-blue" />
                      
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-accent-cyan/10 border border-accent-cyan/20 rounded-md">
                          {(() => {
                            const Icon = getEntityIcon(activeEntity.type);
                            return <Icon size={24} className="text-accent-cyan" />;
                          })()}
                        </div>
                        <div className="select-text">
                          <h3 className="text-sm font-bold font-mono tracking-widest text-white">{activeEntity.name}</h3>
                          <div className="text-[9px] font-mono text-accent-cyan tracking-wider py-0.5 rounded uppercase">
                            SYSTEM ID: <span className="font-mono text-white tracking-widest selection:bg-accent-cyan/30">{activeEntity.id}</span> // TYPE: {activeEntity.type.toUpperCase()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => generateAIReasoning(activeEntity.id)}
                          className={`precision-button flex items-center gap-2 border px-4 py-2 text-[10px] tracking-wider font-mono font-bold cursor-pointer transition-all ${
                            generatingAi 
                              ? 'border-accent-blue/30 bg-accent-blue/15 text-accent-blue animate-pulse' 
                              : 'border-accent-cyan/40 text-accent-cyan hover:bg-accent-cyan/15 hover:text-white shadow-[0_0_12px_rgba(0,255,209,0.1)]'
                          }`}
                        >
                          <Brain size={14} className={generatingAi ? 'animate-spin' : ''} />
                          <span>{generatingAi ? 'AI_REASONING...' : 'AI_INTEL_FUSION'}</span>
                        </button>
                      </div>
                    </div>

                    {/* DYNAMIC DEPENDENCY MAP CASCADE (ONLY SHOWN FOR EMPLOYEES & ASSOCIATED RECS) */}
                    {dependencyChain && (
                      <div className="bg-[#050c26]/90 border border-border/25 p-5 space-y-4 rounded-lg">
                        <div className="flex items-center justify-between border-b border-border/10 pb-2">
                          <div className="flex items-center gap-2">
                            <Activity size={12} className="text-accent-cyan animate-pulse" />
                            <span className="font-mono text-[10px] font-bold text-white tracking-wider">LIVING DEPENDENCY DISCOVERY PATHWAY</span>
                          </div>
                          <span className="text-[8px] font-mono text-text-tertiary">MAPPED AUTOMATICALLY</span>
                        </div>

                        {/* FLOW STEP SEQUENCE */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 items-center">
                          {[
                            { label: 'STAFF', name: dependencyChain.employeeName, active: true, color: 'border-accent-cyan text-accent-cyan bg-accent-cyan/5' },
                            { label: 'APPLICATION', name: dependencyChain.application?.name || 'ORPHAN', active: !!dependencyChain.application, color: 'border-accent-blue text-accent-blue bg-accent-blue/5' },
                            { label: 'DATABASE', name: dependencyChain.database?.name || 'ORPHAN', active: !!dependencyChain.database, color: 'border-emerald-400 text-emerald-400 bg-emerald-400/5' },
                            { label: 'HOST SERVER', name: dependencyChain.infraNode?.name || 'ORPHAN', active: !!dependencyChain.infraNode, color: 'border-orange-400 text-orange-400 bg-orange-400/5' },
                            { label: 'CLOUD LAYER', name: dependencyChain.cloudResource?.name || 'ORPHAN', active: !!dependencyChain.cloudResource, color: 'border-teal-400 text-teal-400 bg-teal-400/5' },
                            { label: 'OWNERSHIP HQ', name: dependencyChain.executiveOwnerName, active: true, color: 'border-fuchsia-400 text-fuchsia-400 bg-fuchsia-400/5' }
                          ].map((step, i) => (
                            <div key={i} className="flex items-center gap-1.5 w-full">
                              <div className={`p-2 border text-center rounded w-full flex flex-col justify-between h-20 ${step.active ? step.color : 'border-border/10 text-text-tertiary opacity-30 bg-[#030611]'}`}>
                                <span className="text-[7px] font-mono font-bold tracking-widest">{step.label}</span>
                                <span className="text-[8.5px] font-bold font-mono truncate tracking-wider">{step.name}</span>
                              </div>
                              {i < 5 && <ArrowRight size={12} className="text-text-tertiary shrink-0 hidden lg:block" />}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI COGNITIVE ASSESSMENT DISPLAY CONTAINER */}
                    {aiInsights && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#080d26] border-2 border-accent-cyan/35 p-6 rounded-lg relative space-y-4"
                      >
                        <div className="absolute right-4 top-4 text-accent-cyan animate-pulse flex items-center gap-1 text-[8.5px] font-mono">
                          <Sparkles size={11} />
                          COGNITIVE INSIGHT ONLINE
                        </div>
                        <div className="flex items-center gap-2 border-b border-border/20 pb-2">
                          <Brain size={16} className="text-accent-cyan" />
                          <h4 className="font-mono text-[11px] font-extrabold text-white tracking-widest">TACTICAL ANALYTICS INSIGHT DECISIONS</h4>
                        </div>
                        <div className="markdown-body select-text text-text-secondary text-[10px] leading-relaxed tracking-wider normal-case font-mono border-l-2 border-accent-cyan/15 pl-4 py-1">
                          <ReactMarkdown>{aiInsights}</ReactMarkdown>
                        </div>
                      </motion.div>
                    )}

                    {/* TWO-COLUMN LOWER DETAIL DASHBOARD */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* SUBPANEL A: STRENGTH AND ADJACENCY RELATIONS */}
                      <div className="bg-[#05091a]/95 border border-border/30 p-5 rounded-lg space-y-4">
                        <div className="flex items-center justify-between border-b border-border/10 pb-2">
                          <span className="font-mono text-[10px] font-bold text-white tracking-widest">TOPOLOGICAL NEIGHBOR CONNECTIONS</span>
                          <span className="text-[8px] font-mono text-text-tertiary">ADJACENCIES: {adjacencies.length}</span>
                        </div>
                        
                        <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar pr-1">
                          {adjacencies.length === 0 ? (
                            <div className="text-center p-8 text-text-tertiary font-mono">NO RECORDED NEIGHBORING LINKS</div>
                          ) : (
                            adjacencies.map((adj, idx) => {
                              const NIcon = getEntityIcon(adj.entity.type);
                              return (
                                <div key={idx} className="p-2.5 bg-[#030612]/90 border border-border/10 rounded flex items-center justify-between hover:border-border/30">
                                  <div className="flex items-center gap-2 truncate">
                                    <NIcon size={12} className="text-text-tertiary" />
                                    <div className="truncate selection:bg-accent-cyan/35">
                                      <span className="font-mono text-[9px] font-bold text-white block truncate leading-none">{adj.entity.name}</span>
                                      <span className="text-[7px] font-mono text-text-tertiary uppercase">ROUTE: {adj.direction.toUpperCase()} // CLASS: {adj.entity.type}</span>
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="text-[9px] font-mono font-bold text-accent-cyan bg-accent-cyan/5 px-2 py-0.5 border border-accent-cyan/15 rounded uppercase">
                                      {adj.relation.relationType.replace('_', ' ')}
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      {/* SUBPANEL B: BUSINESS IMPACT INTELLIGENCE */}
                      <div className="bg-[#05091a]/95 border border-border/30 p-5 rounded-lg space-y-4">
                        <div className="flex items-center justify-between border-b border-border/10 pb-2">
                          <span className="font-mono text-[10px] font-bold text-white tracking-widest">BUSINESS IMPACT RATING</span>
                          <span className="text-[8px] font-mono text-text-tertiary">IMPACT METRIC CONTEXT</span>
                        </div>
                        
                        {impactMetrics ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-3 bg-[#030612] border border-border/10 rounded text-center">
                                <div className="text-[7.5px] font-mono text-text-tertiary">OPERATIONAL IMPACT</div>
                                <div className="text-lg font-bold font-mono text-accent-cyan">{impactMetrics.operationalImpact}/100</div>
                              </div>
                              <div className="p-3 bg-[#030612] border border-border/10 rounded text-center">
                                <div className="text-[7.5px] font-mono text-text-tertiary">BUSINESS CRITICALITY</div>
                                <div className="text-lg font-bold font-mono text-accent-blue">{impactMetrics.businessCriticality}/100</div>
                              </div>
                              <div className="p-3 bg-[#030612] border border-border/10 rounded text-center">
                                <div className="text-[7.5px] font-mono text-text-tertiary">GRC SENSITIVITY</div>
                                <div className="text-lg font-bold font-mono text-emerald-400">{impactMetrics.governanceSensitivity}/100</div>
                              </div>
                              <div className="p-3 bg-[#030612] border border-border/10 rounded text-center">
                                <div className="text-[7.5px] font-mono text-text-tertiary">FAILURE IMPACT SCORE</div>
                                <div className="text-lg font-bold font-mono text-orange-400">{impactMetrics.failureImpactScore}/100</div>
                              </div>
                            </div>

                            <div className="p-2.5 bg-[#030612] border border-border/15 rounded flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Clock size={12} className="text-text-tertiary" />
                                <span className="font-mono text-[8px] text-text-secondary">RECOVERY COMPLEXITY INDEX:</span>
                              </div>
                              <span className="font-mono text-[9px] font-bold text-fuchsia-400 bg-fuchsia-400/10 px-2.5 py-0.5 border border-fuchsia-400/20 rounded uppercase">
                                {impactMetrics.recoveryComplexity.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center p-8 text-text-tertiary font-mono">RECONCILING ASSET VALUE COMPILATIONS...</div>
                        )}
                      </div>

                      {/* SUBPANEL C: ENTERPRISE BLAST RADIUS INTELLIGENCE */}
                      {blastRadius && (
                        <div className="md:col-span-2 bg-[#05091a]/95 border border-border/30 p-5 rounded-lg space-y-4">
                          <div className="flex items-center justify-between border-b border-border/10 pb-2">
                            <span className="font-mono text-[10px] font-bold text-white tracking-widest">ENTERPRISE BLAST RADIUS INTELLIGENCE</span>
                            <span className="text-[8px] font-mono text-state-danger bg-state-danger/10 px-2 py-0.5 border border-state-danger/25 rounded-md">
                              BLAST RATING: {blastRadius.blastScore}%
                            </span>
                          </div>

                          <p className="text-[10px] font-mono text-text-secondary border-l border-state-danger/20 pl-4 py-0.5 select-text normal-case">
                            {blastRadius.strategicImpactSummary}
                          </p>

                          <div className="grid grid-cols-3 gap-2 text-center h-22">
                            <div className="border border-border/10 bg-[#030612] p-2 rounded flex flex-col justify-between">
                              <span className="text-[7px] font-mono text-text-tertiary">DIRECT CASCADE IMPACT</span>
                              <span className="text-base font-bold font-mono text-cyan-400">{blastRadius.counts.direct} NODES</span>
                            </div>
                            <div className="border border-border/10 bg-[#030612] p-2 rounded flex flex-col justify-between">
                              <span className="text-[7px] font-mono text-text-tertiary">INDIRECT IMPACTED</span>
                              <span className="text-base font-bold font-mono text-indigo-400">{blastRadius.counts.indirect} NODES</span>
                            </div>
                            <div className="border border-border/10 bg-[#030612] p-2 rounded flex flex-col justify-between">
                              <span className="text-[7px] font-mono text-text-tertiary">DOWNSTREAM CRITICAL</span>
                              <span className="text-base font-bold font-mono text-fuchsia-400">{blastRadius.counts.downstream} NODES</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 2: EXECUTIVE OUTAGE SIMULATION */}
          {subTab === 'simulation' && (
            <motion.div
              key="simulation"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              
              {/* OUTAGE CONTROL SLATE (5 COLS) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-[#05091a]/95 border border-border/40 p-6 rounded-lg space-y-6">
                  <div className="border-b border-border/10 pb-4">
                    <span className="font-mono text-xs font-bold text-white tracking-widest block">EXECUTIVE SIMULATION DIAL</span>
                    <span className="text-[8.5px] font-mono text-text-tertiary">MODEL THE SYSTEM CONSEQUENCES OF CATASTROPHIC DISRUPTIONS</span>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[8.5px] font-mono text-text-secondary tracking-widest block">SELECT FAILURE CATEGORY</label>
                      <select
                        value={simType}
                        onChange={(e) => setSimType(e.target.value as any)}
                        className="w-full text-[10px] font-mono bg-[#030612] text-white border border-border/30 rounded py-2 px-3 outline-none focus:border-accent-cyan uppercase"
                      >
                        <option value="application">APPLICATION OUTAGE</option>
                        <option value="database">DATABASE INTEGRATION FAILURE</option>
                        <option value="cloud">CLOUD INSTABILITY ZONE</option>
                        <option value="department">DEPARTMENT OPERATIONAL BLOCK</option>
                        <option value="employee">KEY PERSONNEL DEPARTURE</option>
                        <option value="governance_failure">GRC AUDIT DEFAULT FAILURE</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[8.5px] font-mono text-text-secondary tracking-widest block">SPECIFY ACTIVE FAILURE TARGET</label>
                      <select
                        value={simTargetId}
                        onChange={(e) => setSimTargetId(e.target.value)}
                        className="w-full text-[10px] font-mono bg-[#030612] text-white border border-border/30 rounded py-2 px-3 outline-none focus:border-accent-cyan uppercase"
                      >
                        {entities
                          .filter(e => {
                            if (simType === 'application') return e.type === 'application';
                            if (simType === 'database') return e.type === 'database';
                            if (simType === 'cloud') return e.type === 'cloud_resource';
                            if (simType === 'department') return e.type === 'department';
                            if (simType === 'employee') return e.type === 'employee';
                            if (simType === 'governance_failure') return e.type === 'governance_rule';
                            return false;
                          })
                          .map(ent => (
                            <option key={ent.id} value={ent.id}>{ent.name}</option>
                          ))}
                      </select>
                    </div>

                    <button
                      onClick={executeOutageSimulation}
                      disabled={simulating || !simTargetId}
                      className={`w-full py-3.5 px-4 font-mono font-bold text-[10px] tracking-widest border transition-all rounded cursor-pointer ${
                        simulating 
                          ? 'border-state-danger/30 bg-state-danger/15 text-state-danger animate-pulse'
                          : 'border-state-danger/60 text-state-danger hover:bg-state-danger/15 shadow-[0_0_12px_rgba(239,68,68,0.12)]'
                      }`}
                    >
                      {simulating ? 'COMPLETING SIMULATIVE CASCADE ANALYSIS...' : 'EXECUTE INTEGRATED COLLAPSE'}
                    </button>
                  </div>
                </div>
              </div>

              {/* OUTAGE CASCADE REPORT PANEL (7 COLS) */}
              <div className="lg:col-span-7">
                <AnimatePresence mode="wait">
                  {simulationResult ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key="report"
                      className="bg-[#05091a]/95 border-2 border-state-danger/25 p-6 rounded-lg space-y-6"
                    >
                      <div className="flex items-center justify-between border-b border-border/10 pb-4">
                        <div>
                          <span className="font-mono text-[9px] font-medium text-state-danger bg-state-danger/10 border border-state-danger/20 px-2.5 py-0.5 rounded-sm uppercase tracking-widest">
                            CASCADE ANALYSIS COMPLETE
                          </span>
                          <h4 className="text-xs font-mono font-extrabold text-white mt-1 uppercase tracking-widest">
                            OUTAGE REPORT: {simulationResult.simulatedTargetName}
                          </h4>
                        </div>
                        <span className="text-[8px] font-mono text-text-tertiary">SYSTEM METADATA MODEL</span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="border border-border/10 bg-[#030612] p-3 rounded text-center">
                          <span className="text-[7px] font-mono text-text-tertiary block">OPERATIONAL IMPACT</span>
                          <span className="text-base font-bold font-mono text-state-danger">{simulationResult.operationalImpactRating}/100</span>
                        </div>
                        <div className="border border-border/10 bg-[#030612] p-3 rounded text-center">
                          <span className="text-[7px] font-mono text-text-tertiary block">BUSINESS THREAT</span>
                          <span className="text-base font-bold font-mono text-orange-400">{simulationResult.businessCriticalityRating}/100</span>
                        </div>
                        <div className="border border-border/10 bg-[#030612] p-3 rounded text-center">
                          <span className="text-[7px] font-mono text-text-tertiary block">RECOVERY RATING</span>
                          <span className="text-base font-bold font-mono text-indigo-400">{simulationResult.recoveryDifficultyRating}/100</span>
                        </div>
                        <div className="border border-border/10 bg-[#030612] p-3 rounded text-center">
                          <span className="text-[7px] font-mono text-text-tertiary block">DOWNTIME FRAME</span>
                          <span className="text-base font-bold font-mono text-white">{simulationResult.estimatedDownTimeHours} HOURS</span>
                        </div>
                      </div>

                      <div className="p-3 bg-state-danger/5 border border-state-danger/15 rounded flex items-center justify-between">
                        <span className="font-mono text-[8px] text-text-secondary uppercase">CASCADING TARGET BLOCKAGE:</span>
                        <span className="font-mono text-[9.5px] font-bold text-state-danger bg-state-danger/10 px-3 py-0.5 border border-state-danger/20 rounded">
                          {simulationResult.cascadingFailuresCount} ASSET COHORTS
                        </span>
                      </div>

                      <div className="space-y-3">
                        <span className="text-[8.5px] font-mono text-text-tertiary uppercase tracking-widest block font-bold">DISRUPTION PATHWAY CHAINAGE</span>
                        <div className="bg-[#020511] border border-border/10 rounded p-4 space-y-2.5 max-h-[170px] overflow-y-auto custom-scrollbar">
                          {simulationResult.failurePathways.map((path: string, index: number) => (
                            <div key={index} className="flex items-start gap-2 text-[9.5px] font-mono text-text-secondary normal-case leading-relaxed select-text">
                              <span className="text-state-danger font-bold shrink-0">[{index + 1}]</span>
                              <span>{path}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 bg-[#030612] border border-border/15 rounded text-left select-text">
                        <div className="text-[7.5px] font-mono text-text-tertiary uppercase">SLA SYSTEM CONTINUITY ANNOUNCEMENT:</div>
                        <p className="text-[10px] font-mono text-emerald-400 mt-1 italic normal-case">
                          "{simulationResult.systemResileMessage}"
                        </p>
                      </div>

                    </motion.div>
                  ) : (
                    <div className="bg-[#05091a]/40 border border-border/20 min-h-[400px] flex flex-col justify-center items-center text-center p-8 text-text-tertiary font-mono tracking-widest gap-2 rounded-lg">
                      <Clock size={32} className="text-text-tertiary" />
                      AWAITING FAILURE SIMULATION TRIGGER...
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* TAB 3: RISK & GRC BOTTLENECKS */}
          {subTab === 'risk' && (
            <motion.div
              key="risk"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#05091a]/95 border border-border/30 p-5 rounded-lg text-center flex flex-col justify-between h-32">
                  <span className="text-[8px] font-mono text-text-tertiary tracking-widest uppercase">ENTERPRISE RISK INDEX</span>
                  <span className="text-4xl font-extrabold font-mono text-state-danger">
                    {riskAssessment ? riskAssessment.enterpriseRiskIndex : '00'}/100
                  </span>
                  <span className="text-[7.5px] font-mono text-text-secondary">BOUND COUPLING WEIGHTS FUSED</span>
                </div>
                <div className="bg-[#05091a]/95 border border-border/30 p-5 rounded-lg text-center flex flex-col justify-between h-32">
                  <span className="text-[8px] font-mono text-text-tertiary tracking-widest uppercase">ZERO TRUST ACCESS BREACHES</span>
                  <span className="text-4xl font-extrabold font-mono text-yellow-400">
                    {riskAssessment ? riskAssessment.zeroTrustViolationsCount : '0'}
                  </span>
                  <span className="text-[7.5px] font-mono text-text-secondary">ACTIVE BOUNDARY SECURITY BLIPS</span>
                </div>
                <div className="bg-[#05091a]/95 border border-border/30 p-5 rounded-lg text-center flex flex-col justify-between h-32">
                  <span className="text-[8px] font-mono text-text-tertiary tracking-widest uppercase">MONITORED ASSET CLUSTER</span>
                  <span className="text-4xl font-extrabold font-mono text-white">
                    {riskAssessment ? riskAssessment.totalTrackedEntities : '00'}
                  </span>
                  <span className="text-[7.5px] font-mono text-text-secondary">WITH {riskAssessment ? riskAssessment.totalTrackedRelations : '0'} TOPOLOGY RELATIONS</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* SPOF MAP (7 COLS) */}
                <div className="lg:col-span-7 bg-[#05091a]/95 border border border-border/30 p-6 rounded-lg space-y-4">
                  <div className="border-b border-border/10 pb-3 flex justify-between items-center">
                    <div>
                      <span className="font-mono text-xs font-bold text-white tracking-widest block">SINGLE POINTS OF FAILURE (SPOFs)</span>
                      <span className="text-[8px] font-mono text-text-tertiary">ASSETS WHERE FAILURE TRIGGERS HUGE DOWNSTREAM INTERRUPTIONS</span>
                    </div>
                    <AlertTriangle size={14} className="text-state-danger animate-pulse" />
                  </div>

                  <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
                    {riskAssessment && riskAssessment.singlePointsOfFailure.length > 0 ? (
                      riskAssessment.singlePointsOfFailure.map((spof, idx) => {
                        const SIcon = getEntityIcon(spof.type);
                        return (
                          <div key={idx} className="p-4 bg-[#030612]/90 border border-border/15 rounded flex items-start justify-between gap-4 hover:border-state-danger/30">
                            <div className="flex gap-3 min-w-0 select-text">
                              <div className="p-1.5 bg-state-danger/10 border border-state-danger/20 rounded mt-0.5">
                                <SIcon size={13} className="text-state-danger" />
                              </div>
                              <div className="min-w-0 truncate">
                                <div className="font-mono text-[10px] font-bold text-white block truncate leading-none mb-1">{spof.name}</div>
                                <div className="text-[8px] font-mono text-text-secondary uppercase mb-1.5">CONNECTED DEPTH: {spof.dependencyDepth} NEIGHBOR BRANCHES</div>
                                <p className="text-[9px] font-mono text-text-tertiary leading-relaxed normal-case line-clamp-2">{spof.reason}</p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[9.5px] font-mono font-bold text-state-danger bg-state-danger/10 px-2 py-0.5 border border-state-danger/25 rounded">
                                RISK {spof.riskScore}%
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center p-8 text-text-tertiary font-mono">CALCULATING POTENTIAL GRAPH SYSTEM SPOFs...</div>
                    )}
                  </div>
                </div>

                {/* ACCESS SECURITY VIOLATIONS (5 COLS) */}
                <div className="lg:col-span-5 bg-[#05091a]/95 border border-border/30 p-6 rounded-lg space-y-4">
                  <div className="border-b border-border/10 pb-3 flex justify-between items-center">
                    <div>
                      <span className="font-mono text-xs font-bold text-white tracking-widest block">ZERO TRUST ACCESS BOUNDARY LEAKS</span>
                      <span className="text-[8px] font-mono text-text-tertiary">COMPLIANCE OR ISOLATION FAULTS LOGGED RECENTLY</span>
                    </div>
                    <Lock size={14} className="text-yellow-400" />
                  </div>

                  <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar leading-relaxed">
                    {riskAssessment && riskAssessment.zeroTrustViolations.length > 0 ? (
                      riskAssessment.zeroTrustViolations.map((viol, idx) => (
                        <div key={idx} className="p-3 bg-[#030612]/95 border border-l-2 border-yellow-400/40 border-border/10 rounded text-[9.5px] font-mono text-text-secondary normal-case leading-relaxed select-text">
                          <span className="text-yellow-400 font-bold mr-1.5">[BREACH]</span>
                          {viol}
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-8 text-text-tertiary font-mono">COMPLETE COMPLIANCE WITH ACTIVE ACCESS BOUNDARIES SECURED</div>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 4: HISTORIC ORGANIZATIONAL MEMORIALS */}
          {subTab === 'memory' && (
            <motion.div
              key="memory"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              
              {/* BACKWARD HISTORIES LOOKUP (7 COLS) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-[#05091a]/95 border border border-border/30 p-6 rounded-lg space-y-4">
                  <div className="border-b border-border/10 pb-3 flex justify-between items-center">
                    <div>
                      <span className="font-mono text-xs font-bold text-white tracking-widest block">ORGANIZATIONAL MEMORIES LIBRARY</span>
                      <span className="text-[8px] font-mono text-text-tertiary">HISTORIC LESSONS, ACCESS ANOMALIES, AND RECOVERIES REGISTERED</span>
                    </div>
                    <Brain size={14} className="text-accent-cyan" />
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={memorySearch}
                      onChange={(e) => setMemorySearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') fetchMemories();
                      }}
                      placeholder="LOOKUP RECURRING FAULTS / INCIDENT DIRECTORIES..."
                      className="w-full text-[10px] font-mono bg-[#030612] text-white border border-border/30 rounded py-2 px-3 outline-none focus:border-accent-cyan uppercase"
                    />
                    <button 
                      onClick={fetchMemories}
                      className="absolute right-3 top-2.5 hover:text-accent-cyan text-text-tertiary cursor-pointer"
                    >
                      <Search size={12} />
                    </button>
                  </div>

                  <div className="space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
                    {loadingMemories ? (
                      <div className="p-8 text-center text-text-tertiary font-mono tracking-wider animate-pulse">RECALLING DEEP INCIDENT TRACKS...</div>
                    ) : memories.length === 0 ? (
                      <div className="p-8 text-center text-text-tertiary font-mono">NO MEMORIES REGISTERED ON THIS KEYWORD</div>
                    ) : (
                      memories.map((entry) => (
                        <div key={entry.id} className="p-4 bg-[#030612]/95 border border-border/15 rounded space-y-2 hover:border-accent-cyan/20 select-text text-left">
                          <div className="flex items-center justify-between border-b border-border/5 pb-1.5">
                            <span className="text-[9px] font-mono font-bold text-accent-cyan uppercase tracking-widest">
                              {entry.category.replace('_', ' ')} // #{entry.id}
                            </span>
                            <span className={`text-[8px] font-mono px-2 py-0.5 border rounded-sm font-bold uppercase ${
                              entry.severity === 'critical' ? 'text-state-danger border-state-danger/30 bg-state-danger/10 animate-pulse' :
                              entry.severity === 'high' ? 'text-orange-400 border-orange-400/30 bg-orange-400/10' :
                              'text-text-tertiary border-border/20'
                            }`}>
                              {entry.severity}
                            </span>
                          </div>
                          <h5 className="font-mono text-[10px] font-bold text-white tracking-wide uppercase">{entry.title}</h5>
                          <p className="text-[9px] font-mono text-text-secondary leading-normal normal-case">{entry.description}</p>
                          
                          {entry.mitigationSteps.length > 0 && (
                            <div className="pt-2">
                              <span className="text-[7.5px] font-mono text-accent-cyan font-bold uppercase block tracking-wider">MITIGATION SAFEGUARDS</span>
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {entry.mitigationSteps.map((s, si) => (
                                  <span key={si} className="text-[7.5px] font-mono text-text-tertiary bg-white/[0.03] border border-border/12 px-2 py-0.5 rounded cursor-default normal-case">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-[7px] font-mono text-text-tertiary pt-1 border-t border-border/5 mt-2">
                            <span>SESSION LOG TIME: {new Date(entry.timestamp).toUTCString()}</span>
                            <span>STATUS: {entry.resolved ? 'RESOLVED & PATCHED' : 'UNRESOLVED / AUDITED'}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* LOG NEW RECURRING ANOMALICS (5 COLS) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-[#05091a]/95 border border-border/30 p-6 rounded-lg space-y-4 text-left">
                  <div className="border-b border-border/10 pb-3">
                    <span className="font-mono text-xs font-bold text-white tracking-widest block">REPORT RECURRING LEAK / FAULT</span>
                    <span className="text-[8.5px] font-mono text-text-tertiary block">ADD MANUALLY TO HISTORIC RESOLUTION TRAFFIC SYSTEM</span>
                  </div>

                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!newMemTitle || !newMemDesc) return;
                      try {
                        setSubmittingMemory(true);
                        // Call synthetic manual logic or add it to mock memories!
                        // Let's create an endpoint or just add it. Since we created server memories, we can extend it or make a POST endpoint!
                        // Wait, let's look: does a memory post endpoint exist? We can add a simple post endpoint inside main.ts to support dynamic addition!
                        // Wait! Let's check if we have a memory post route in main.ts. No, let's create a POST endpoint `/api/v2/intelligence/fabric/memories` in `main.ts` or make an edit!
                        // Oh, actually, let's verify if we already added a POST route. We didn't, let's add of it to main.ts right now if needed, or we can mock/simulate addition on UI. But writing a real API is our NO MOCK DATA rule!
                        // Let's do a quick edit of main.ts to add the POST endpoint `/api/v2/intelligence/fabric/memories`!
                        // Let's write the fetch first.
                        const res = await fetch('/api/v2/intelligence/fabric/memories', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            category: newMemCategory,
                            title: newMemTitle,
                            description: newMemDesc,
                            severity: newMemSeverity,
                            mitigationSteps: newMemSteps.split(',').map(s => s.trim()).filter(Boolean)
                          })
                        });
                        if (res.ok) {
                          setNewMemTitle('');
                          setNewMemDesc('');
                          setNewMemSteps('');
                          fetchMemories();
                        }
                      } catch (err) {
                        console.error('Failed to log custom violation leak', err);
                      } finally {
                        setSubmittingMemory(false);
                      }
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <label className="text-[8.5px] font-mono text-text-secondary uppercase">CATEGORY</label>
                      <select
                        value={newMemCategory}
                        onChange={(e) => setNewMemCategory(e.target.value as any)}
                        className="w-full text-[10px] font-mono bg-[#030612] text-white border border-border/30 rounded py-2 px-3 outline-none focus:border-accent-cyan uppercase"
                      >
                        <option value="incident">INCIDENT CRASH</option>
                        <option value="governance_leak">GOVERNANCE POLICY EXPOSURE</option>
                        <option value="bottleneck">CAPACITY SYNCHRONIZATION LOCK</option>
                        <option value="access_anomaly">ACCESS POLICY COMPROMISE</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[8.5px] font-mono text-text-secondary uppercase">ANOMALY TITLE</label>
                      <input
                        type="text"
                        value={newMemTitle}
                        onChange={(e) => setNewMemTitle(e.target.value)}
                        placeholder="E.G., REPEATED AZURE INGRESS HANDSHAKE DELAY"
                        className="w-full text-[10px] font-mono bg-[#030612] text-white placeholder-text-tertiary px-3 py-2 border rounded border-border/30 focus:border-accent-cyan outline-none uppercase"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[8.5px] font-mono text-text-secondary uppercase">DETAILED TRACE LOG</label>
                      <textarea
                        value={newMemDesc}
                        onChange={(e) => setNewMemDesc(e.target.value)}
                        placeholder="DESCRIBE RECURRING CRITICAL VIOLATIONS OR EXPOSURES DETECTED IN TOPOLOGICAL SEGMENT..."
                        className="w-full text-[10px] font-mono bg-[#030612] text-white placeholder-text-tertiary px-3 py-2 border rounded border-border/30 focus:border-accent-cyan outline-none h-20 uppercase normal-case"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[8.5px] font-mono text-text-secondary uppercase">SEVERITY LEVEL</label>
                      <select
                        value={newMemSeverity}
                        onChange={(e) => setNewMemSeverity(e.target.value as any)}
                        className="w-full text-[10px] font-mono bg-[#030612] text-white border border-border/30 rounded py-2 px-3 outline-none focus:border-accent-cyan uppercase"
                      >
                        <option value="low">LOW</option>
                        <option value="medium">MEDIUM</option>
                        <option value="high">HIGH</option>
                        <option value="critical">CRITICAL</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[8.5px] font-mono text-text-secondary uppercase">MITIGATION REMEDIALS (COMMA SEPARATED)</label>
                      <input
                        type="text"
                        value={newMemSteps}
                        onChange={(e) => setNewMemSteps(e.target.value)}
                        placeholder="E.G., ROTATED SECRETS, REAPPLIED SECURITY RULES"
                        className="w-full text-[10px] font-mono bg-[#030612] text-white placeholder-text-tertiary px-3 py-2 border rounded border-border/30 focus:border-accent-cyan outline-none uppercase"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingMemory}
                      className="w-full py-2.5 px-4 font-mono font-bold text-[10px] tracking-widest bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/15 transition-all rounded flex items-center justify-center gap-2 uppercase cursor-pointer"
                    >
                      {submittingMemory ? <RefreshCw size={12} className="animate-spin" /> : <Plus size={14} />}
                      LOG IN MEMORY ARCHIVE
                    </button>
                    
                  </form>
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}

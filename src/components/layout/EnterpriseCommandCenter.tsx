
import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useEnterpriseBackend } from '../../hooks/useEnterpriseBackend';
import { 
  Shield, Users, Server, Database, Cloud, AlertTriangle, Search, 
  Brain, FileCheck, CheckCircle2, TrendingUp, Sparkles, Send, 
  ChevronRight, ChevronLeft, Building2, UserCheck, ShieldAlert, Cpu, 
  Layers, Lock, Eye, RefreshCw, BarChart2, DollarSign, Globe, Network, 
  CornerDownRight, Activity, Filter, Info, ShieldX, Key, ArrowRight 
} from 'lucide-react';
import { 
  BUSINESS_UNITS,
  DEPARTMENTS, 
  APPLICATIONS, 
  DATA_ASSETS, 
  INFRA_NODES, 
  GOVERNANCE_VIOLATIONS, 
  CLOUD_REGIONS_STATS, 
  INITIAL_ENTERPRISE_STATS, 
  queryVirtualEmployees, 
  getEmployeeDataById, 
  processExecutiveCopilotQuery,
  STATIC_CORE_EMPLOYEES
} from '../../lib/enterprise-data';
import { Employee, Department, EnterpriseApplication, DataAsset, InfraNode } from '../../types/enterprise';
import { cn } from '../../lib/utils';
import { EnterpriseIntelligenceFabric } from './EnterpriseIntelligenceFabric';
import { EnterpriseDataFabric } from './EnterpriseDataFabric';
import { AIReasoningStudio } from '../features/AIReasoningStudio';
import { EnterpriseOperatingSystem } from '../features/EnterpriseOperatingSystem';
import { EnterpriseSimulationCenter } from '../features/EnterpriseSimulationCenter';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';

export interface EnterpriseCommandCenterProps {
  onBackToLanding: () => void;
  operatorRole?: string;
  activeTenant?: string;
}

export function EnterpriseCommandCenter({
  onBackToLanding,
  operatorRole = 'Executive Administrator',
  activeTenant = 'CORE_GLOBAL_HQ'
}: EnterpriseCommandCenterProps) {
const {
fabricStats,
executiveSummary,
cognition,
users
} = useEnterpriseBackend();


  // Navigation tabs
  const [activeTab, setActiveTab ] = useState<'control' | 'fabric' | 'datafabric' | 'org' | 'workforce' | 'apps' | 'infra' | 'governance' | 'cognition' | 'enterprise-os' | 'enterprise-simulation'>('enterprise-os');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Workforce Filters
  const [wfDept, setWfDept] = useState<string>('');
  const [wfStatus, setWfStatus] = useState<string>('');
  const [wfPage, setWfPage] = useState(0);
  const [wfMaxRisk, setWfMaxRisk] = useState<number>(100);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(STATIC_CORE_EMPLOYEES[0]);
  
  // AI Copilot state
  const [copilotHistory, setCopilotHistory] = useState<Array<{ sender: 'user' | 'system'; text: string; attachment?: any }>>([
    { 
      sender: 'system', 
      text: 'COGNITIVE ARCHITECTURE COMMENCED. Active SentinelX Reasoning Engine is online. You may query the organization map, database sensitivities, access policies, or department risks instantly.' 
    }
  ]);
  const [copilotInput, setCopilotInput] = useState('');
  const [isCopilotThinking, setIsCopilotThinking] = useState(false);
  
  // App & Database Selected Blocks
  const [selectedApp, setSelectedApp] = useState<EnterpriseApplication | null>(APPLICATIONS[0]);
  const [selectedDb, setSelectedDb] = useState<DataAsset | null>(DATA_ASSETS[0]);
  
  // Cloud metrics filter
  const [cloudProvider, setCloudProvider] = useState<'all' | 'aws' | 'gcp' | 'azure'>('all');

  // Org chart state: which business units are expanded
  const [expandedBUs, setExpandedBUs] = useState<string[]>(['Core Infrastructure', 'Cyber Defense & Security']);

  // Dynamic ticking clock
  const [currentTime, setCurrentTime] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTime(d.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute dynamically filtered workforce records (Simulates 100,000+ items seamlessly)
  const workforceResult = useMemo(() => {
    return queryVirtualEmployees(searchQuery, {
      department: wfDept || undefined,
      status: wfStatus || undefined,
      maxRisk: wfMaxRisk !== 100 ? wfMaxRisk : undefined
    }, wfPage, 12);
  }, [searchQuery, wfDept, wfStatus, wfPage, wfMaxRisk]);

  // Handle Search Queries
  const handleUniversalSearch = (txt: string) => {
    setSearchQuery(txt);
    if (activeTab !== 'workforce' && txt) {
      setActiveTab('workforce'); // Jump directly to details catalog where universal query matches everything
    }
  };

  // Expand/Collapse BU in Organizational map
  const toggleBU = (bu: string) => {
    if (expandedBUs.includes(bu)) {
      setExpandedBUs(expandedBUs.filter(b => b !== bu));
    } else {
      setExpandedBUs([...expandedBUs, bu]);
    }
  };

  // Submit AI Copilot Queries
  const handleSendCopilotQuery = (q: string) => {
    if (!q.trim()) return;
    setCopilotHistory(prev => [...prev, { sender: 'user', text: q }]);
    setCopilotInput('');
    setIsCopilotThinking(true);

    (async () => {
  try {
    const res = await fetch('/api/v2/cognition/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: q
      })
    });

    const data = await res.json();

    setCopilotHistory(prev => [
      ...prev,
      {
        sender: 'system',
        text:
          data.answerMarkdown ||
          data.answer ||
          data.response ||
          JSON.stringify(data, null, 2)
      }
    ]);
  } catch (err) {
    console.error(err);

    setCopilotHistory(prev => [
      ...prev,
      {
        sender: 'system',
        text: 'Backend cognition engine unavailable.'
      }
    ]);
  }

  setIsCopilotThinking(false);
})();
  };

  // Recharts theme colors for standard charts
  const THEME_CYAN = '#00FFD1';
  const THEME_BLUE = '#00E5FF';
  const THEME_WARNING = '#EF4444';

  return (
    <div className="bg-[#030611] text-text-primary select-none font-sans min-h-screen relative overflow-x-hidden flex flex-col uppercase text-[11px] leading-relaxed select-none tracking-wider">
      
      {/* GLOWING AMBIENT BACKGROUND ACCENTS */}
      <div className="absolute top-0 left-0 w-full h-[600px] pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-250px] left-[15%] w-[600px] h-[600px] rounded-full bg-accent-cyan/5 blur-[150px] pointer-events-none" />
        <div className="absolute top-[-200px] right-[20%] w-[500px] h-[500px] rounded-full bg-accent-blue/5 blur-[150px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,255,209,0.012)_0%,transparent_70%)]" />
      </div>

      {/* TOP HEAD REGION PORTAL NAVIGATION */}
      <nav className="h-16 border-b border-border bg-[#050917]/90 backdrop-blur-xl flex items-center justify-between px-8 z-50 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Shield className="w-5 h-5 text-accent-cyan" />
              <div className="absolute inset-0 bg-accent-cyan/30 blur-md rounded-full animate-pulse-precision" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-[15px] tracking-[4px] text-white">SENTINEL X</span>
              <span className="text-[7.5px] font-mono text-accent-cyan tracking-[0.3em] font-extrabold leading-none">ENTERPRISE COMMAND CENTER</span>
            </div>
          </div>
          
          <div className="h-4 w-px bg-white/10" />

          <div className="flex items-center gap-2 text-[8px] font-mono text-text-tertiary">
            <span className="bg-white/5 border border-white/10 px-2 py-1 rounded text-white font-bold">{operatorRole.toUpperCase()}</span>
            <span>@</span>
            <span className="text-accent-cyan font-bold bg-accent-cyan/15 border border-accent-cyan/20 px-2 py-1 rounded">{activeTenant}</span>
          </div>
        </div>

        {/* TOP SEARCH FIELD */}
        <div className="hidden lg:flex items-center w-96 bg-void/60 border border-border/80 h-9 px-3 rounded-sm group focus-within:border-accent-cyan/60 transition-colors">
          <Search size={14} className="text-text-tertiary group-focus-within:text-accent-cyan transition-colors" />
          <input 
            type="text" 
            placeholder="UNIVERSAL SEARCH EMPLOYEES, DATA, ASSETS..." 
            value={searchQuery}
            onChange={(e) => handleUniversalSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-white text-[10px] pl-3 h-full font-mono font-semibold placeholder-text-tertiary uppercase"
          />
          {searchQuery && (
            <button 
              onClick={() => handleUniversalSearch('')} 
              className="text-[8px] border border-border px-1.5 py-0.5 hover:bg-white/5 text-text-tertiary hover:text-white"
            >
              CLEAR
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right text-[8.5px] font-mono hidden sm:flex flex-col">
            <span className="text-text-tertiary">SYNCHRONIZED METADATA STATE</span>
            <span className="text-white font-medium">{currentTime || 'SYNCING...'}</span>
          </div>
          <button 
            onClick={onBackToLanding}
            className="px-4 py-2 border border-state-danger/30 text-state-danger hover:bg-state-danger/10 text-[9px] tracking-wider font-bold transition-colors uppercase cursor-pointer"
          >
            DISCONNECT HQ
          </button>
        </div>
      </nav>

      {/* SUBNAV BAR TAB CONTROLS */}
      <div className="h-11 border-b border-border/65 bg-[#040715]/40 flex items-center justify-between px-8 z-40 shrink-0">
        <div className="flex items-center h-full gap-px">
          {[
            { id: 'enterprise-os', label: 'ENTERPRISE OPERATING SYSTEM', icon: Globe },
            { id: 'enterprise-simulation', label: 'STRATEGIC SCENARIO SIMULATOR', icon: Cpu },
            { id: 'cognition', label: 'AI REASONING STUDIO', icon: Brain },
            { id: 'control', label: 'CONTROL DECK', icon: Activity },
            { id: 'fabric', label: 'KNOWLEDGE INTELLIGENCE FABRIC', icon: Sparkles },
            { id: 'datafabric', label: 'ENTERPRISE DATA FABRIC & CONNECTORS', icon: Database },
            { id: 'org', label: 'DIGITAL ORGANIZATION & BU MAP', icon: Building2 },
            { id: 'workforce', label: 'WORKFORCE INTELLIGENCE HUB', icon: Users },
            { id: 'apps', label: 'APPLICATION & DATA ESTATE', icon: Layers },
            { id: 'infra', label: 'CORE INFRASTRUCTURE & MULTICLOUD', icon: Cloud },
            { id: 'governance', label: 'GRC COMPLIANCE & GOVERNANCE', icon: FileCheck }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                }}
                className={cn(
                  "flex items-center gap-2 h-full px-5 text-[9.5px] font-mono font-bold tracking-widest border-r border-border/10 transition-all relative",
                  isActive
                    ? "text-accent-cyan bg-accent-cyan/10"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                )}
              >
                <Icon size={12} className={cn(isActive ? "text-accent-cyan animate-pulse" : "text-text-tertiary")} />
                <span>{tab.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="commandCenterTabLine"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent-cyan shadow-[0_0_8px_#00FFD1]" 
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="hidden xl:flex items-center gap-6 font-mono text-[8.5px] text-text-tertiary">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            <span>OPERATIONAL INDEX: COMPLIANT</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-accent-cyan rounded-full " />
            <span>HQ EVENT SWEEP: STEADY</span>
          </div>
        </div>
      </div>

      {/* CORE WORKSPACE CONTENT AREA WITH COLLAPSIBLE SIDE COPILOT */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* MAIN PANEL CONTENT AREA */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 z-10">

          <AnimatePresence mode="wait">
            
            {/* STRATEGIC SCENARIO SIMULATOR (ENTERPRISE SCENARIO SIMULATION CENTER) */}
            {activeTab === 'enterprise-simulation' && (
              <motion.div
                key="enterprise-simulation-deck"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <EnterpriseSimulationCenter operatorRole={operatorRole} activeTenant={activeTenant} />
              </motion.div>
            )}
            
            {/* 0. INTEL KNOWLEDGE FABRIC (CENTRAL INTELLIGENCE OPERATING SYSTEM LAYER) */}
            {activeTab === 'fabric' && (
              <motion.div
                key="intel-fabric-deck"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                <EnterpriseIntelligenceFabric />
              </motion.div>
            )}

            {/* ENTERPRISE DATA FABRIC & UNIVERSAL CONNECTOR FRAMEWORK */}
            {activeTab === 'datafabric' && (
              <motion.div
                key="enterprise-data-fabric-deck"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                <EnterpriseDataFabric />
              </motion.div>
            )}

            {/* 1. CONTROL DECK (BREATH-TAKING OVERVIEW & EXECUTIVE STATS) */}
            {activeTab === 'control' && (
              <motion.div
                key="control-deck"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                {/* BREATHTAKING GENERAL SCORES OVERVIEW BAR */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                  {[
                    { label: 'ENTERPRISE HEALTH', val: '94%', trend: '+0.5%', desc: 'Unified Node Operations', stat: 94, color: 'text-accent-cyan bg-accent-cyan' },
                    { label: 'GOVERNANCE POSTURE', val: '89%', trend: '+1.2%', desc: 'Compliance Audit GRC', stat: 89, color: 'text-accent-blue bg-accent-blue' },
                    { label: 'STAFF TRUST SCORING', val: '96.5', trend: 'STABLE', desc: 'Active IDP Behavioral Logs', stat: 96, color: 'text-emerald-400 bg-emerald-400' },
                    { label: 'INFRA PLATFORM', val: '91.2%', trend: '-0.3%', desc: 'Load & Capacity Index', stat: 91, color: 'text-cyan-400 bg-cyan-400' },
                    { label: 'DIGITAL TRUST INDEX', val: '98%', trend: 'OPTIMAL', desc: 'Secure Handshake Nodes', stat: 98, color: 'text-teal-400 bg-teal-400' },
                    { label: 'SECURITY RISKS INDEX', val: '22', trend: 'MINIMAL', desc: 'Threat Vector Score', stat: 22, color: 'text-orange-400 bg-orange-400' },
                    { label: 'GRC COMPLIANCE POSTURE', val: '88.5%', trend: '+0.2%', desc: 'Open Violations Check', stat: 88, color: 'text-indigo-400 bg-indigo-400' },
                    { label: 'OPERATIONAL STABILITY', val: '93.8%', trend: 'ACTIVE', desc: 'Overall Symmetrical Load', stat: 93, color: 'text-sky-400 bg-sky-400' }
                  ].map((score, i) => (
                    <div 
                      key={score.label} 
                      className="p-5 bg-panel/30 border border-border/75 rounded-sm hover:border-accent-cyan/25 transition-all relative group flex flex-col justify-between overflow-hidden"
                    >
                      {/* Interactive subtle scale glow on design */}
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-border group-hover:bg-accent-cyan/40 transition-colors" />
                      <div className="space-y-2">
                        <span className="text-[7.5px] font-mono font-bold text-text-tertiary block tracking-[1px]">{score.label}</span>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xl font-display font-extrabold text-white">{score.val}</span>
                          <span className={cn("text-[7.5px] font-mono px-1 rounded-xs font-bold", 
                            score.trend[0] === '+' || score.trend === 'OPTIMAL' || score.trend === 'ACTIVE'
                              ? "bg-emerald-500/10 text-emerald-400" 
                              : score.trend[0] === '-' ? "bg-rose-500/10 text-rose-400" : "bg-white/5 text-text-secondary"
                          )}>{score.trend}</span>
                        </div>
                      </div>

                      {/* Visual Cinematic Grid Graph Placeholder Bar */}
                      <div className="mt-4 w-full bg-white/5 h-1.5 rounded-full overflow-hidden flex">
                        <div className={cn("h-full rounded-full transition-all duration-1000", score.color.split(' ')[1])} style={{ width: `${score.stat}%` }} />
                      </div>
                      <span className="text-[6.5px] text-text-tertiary leading-none mt-2 font-mono block truncate">{score.desc}</span>
                    </div>
                  ))}               </div>

                {/* EXECUTIVE METADATA TOTALS SECTION WITH SPARK CHARTS */}
                <div className="p-6 bg-panel/20 border border-border rounded-sm">
                  <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
                    <div className="flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-accent-cyan-bright" />
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">Executive Overview Summary ledger</h3>
                    </div>
                    <span className="text-[8px] font-mono text-text-tertiary">REAL-TIME DATA SET STABILITY INDEX</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[ 
                      { icon: Users, label: 'GLOBAL EMPLOYEES', val: fabricStats ? fabricStats.activeWorkforceEmployeesCount.toLocaleString() : 'Loading...', trend: '+1.4% Monthly', color: 'text-accent-cyan' },
                      { icon: Building2, label: 'TOTAL DEPARTMENTS', val: fabricStats ? fabricStats.activeDepartmentsCount.toLocaleString() : 'Loading...', trend: 'Stable Hierarchy', color: 'text-accent-blue' },
                      { icon: Layers, label: 'CORPORATE APPLICATIONS', val: fabricStats ? fabricStats.fusedApplicationsCount.toLocaleString() : 'Loading...', trend: 'Compliance Audited', color: 'text-teal-400' },
                      { icon: Database, label: 'DATA REPOSITORIES', val: '6 Repositories', trend: 'Classification Stable', color: 'text-indigo-400' },
                      { icon: Server, label: 'ON-PREM BARE METALS', val: '8 Infrastructure Node Servers', trend: 'Capacity Index: Optimum', color: 'text-sky-400' },
                      { icon: Cloud, label: 'CLOUD RESOURCES DEPLOYED', val: fabricStats ? fabricStats.activeCloudAssetsCount.toLocaleString() : 'Loading...', trend: '99.98% Available', color: 'text-cyan-400' },
                      { icon: Cpu, label: 'INTELLIGENT ENDPOINT DEVICES', val: '204,910 Total', trend: '+142 New Devices', color: 'text-orange-400' },
                      { icon: ShieldAlert, label: 'CRITICAL VALUE ASSETS', val: '4 Restricted Databases', trend: 'Maximum Protection Ring', color: 'text-state-patched' }
                    ].map((stat) => (
                      <div key={stat.label} className="flex gap-4 p-4 hover:bg-white/[0.02] border border-transparent hover:border-border/60 rounded transition-all">
                        <div className={cn("p-3 rounded-xs bg-white/5", stat.color)}>
                          <stat.icon className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[7.5px] text-text-tertiary font-mono block">{stat.label}</span>
                          <div className="text-base font-display font-black text-white">{stat.val}</div>
                          <span className="text-[7.5px] text-emerald-400 font-mono block font-bold">{stat.trend}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* HIGH FIDELITY RECHARTS VISUALIZATION GRIDS */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 pt-8 border-t border-border">
                    
                    {/* Compliance & Postures Analytics */}
                    <div className="space-y-4">
                      <span className="text-[8.5px] font-mono text-text-tertiary block font-bold">OPERATIONAL RISK HISTORY (24H PERIOD)</span>
                      <div className="h-48 bg-void/50 border border-border p-3 rounded">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={[
                            { name: '00:00', risk: 18, trust: 92 },
                            { name: '04:00', risk: 22, trust: 94 },
                            { name: '08:00', risk: 29, trust: 91 },
                            { name: '12:00', risk: 25, trust: 96 },
                            { name: '16:00', risk: 21, trust: 96 },
                            { name: '20:00', risk: 22, trust: 98 },
                            { name: '24:00', risk: 22, trust: 96 }
                          ]}>
                            <XAxis dataKey="name" stroke="#6F7993" fontSize={8} tickLine={false} />
                            <Tooltip contentStyle={{ background: '#050917', border: '1px solid #14203E', fontSize: 10 }} />
                            <Area type="monotone" dataKey="risk" stroke="#EF4444" fill="rgba(239,68,68,0.05)" strokeWidth={2} name="Risk Score Index" />
                            <Area type="monotone" dataKey="trust" stroke="#00FFD1" fill="rgba(0,255,209,0.05)" strokeWidth={2} name="Digital Trust" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Department Performance Allocations */}
                    <div className="space-y-4">
                      <span className="text-[8.5px] font-mono text-text-tertiary block font-bold">DEPARTMENTS RECURRING ALERT RISK MAPPING</span>
                      <div className="h-48 bg-void/50 border border-border p-3 rounded">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={DEPARTMENTS.slice(0, 5).map(d => ({ name: d.name.split(' ')[0], risk: d.riskScore, stability: d.stabilityIndex }))}>
                            <XAxis dataKey="name" stroke="#6F7993" fontSize={8} tickLine={false} />
                            <Tooltip contentStyle={{ background: '#050917', border: '1px solid #14203E', fontSize: 10 }} />
                            <Bar dataKey="risk" fill="#00FFD1" radius={[2, 2, 0, 0]} name="Aggregated Risk" />
                            <Bar dataKey="stability" fill="#00E5FF" radius={[2, 2, 0, 0]} name="Stability Rating" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Sensitive databases cost allocation */}
                    <div className="space-y-4">
                      <span className="text-[8.5px] font-mono text-text-tertiary block font-bold">DATA ESTATE VOLUME ALLOCATION (TB SIZE)</span>
                      <div className="h-48 bg-void/50 border border-border p-3 rounded">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie 
                              data={DATA_ASSETS.map(d => ({ name: d.name, value: d.volumeGb }))}
                              cx="50%"
                              cy="50%"
                              innerRadius="40%"
                              outerRadius="70%"
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {DATA_ASSETS.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index % 3 === 0 ? THEME_CYAN : index % 3 === 1 ? THEME_BLUE : '#F59E0B'} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ background: '#050917', border: '1px solid #14203E', fontSize: 10 }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. DIGITAL ORGANIZATION CHART (EXPANDABLE MAP REPRESENTING CEO DOWNWARDS) */}
            {activeTab === 'org' && (
              <motion.div
                key="org-map"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                <div className="p-6 bg-panel/20 border border-border rounded-sm">
                  <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">Autonomous Symmetrical organizational map Explorer</h3>
                      <p className="text-[9px] text-text-tertiary uppercase font-mono">Interactive exploration layout tracking nodes, heads, and teams.</p>
                    </div>
                    <span className="px-2 py-0.5 border border-accent-cyan/30 text-accent-cyan text-[7.5px] font-mono">MAP LEVEL: CEO ACCESS LEVEL</span>
                  </div>

                  {/* CORE CEO ANCHOR CARD */}
                  <div className="flex flex-col items-center mb-12">
                    <div className="p-6 bg-accent-cyan/10 border border-accent-cyan/60 rounded-sm w-96 text-center shadow-[0_0_20px_rgba(0,255,209,0.1)] relative">
                      <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 bg-accent-cyan text-void font-mono font-black text-[7.5px] px-2 py-0.5 rounded-sm">CHIEF EXECUTIVE</div>
                      <Users className="w-8 h-8 text-accent-cyan mx-auto mb-3 animate-pulse" />
                      <div className="text-xs font-black text-white font-mono uppercase">SERAPHINA VANCE</div>
                      <p className="text-[9px] text-text-secondary mt-1 uppercase">Root Executive Account Authorization Node</p>
                      <div className="flex gap-4 justify-center mt-3 pt-3 border-t border-border/60 text-[8.5px] font-mono text-text-tertiary">
                        <span>Staff: 102k+</span>
                        <span>Risk Target: 2%</span>
                        <span>Trust boundary: SEC CLEAR-V</span>
                      </div>
                    </div>
                  </div>

                  {/* BUSINESS UNITS CONNECTOR ROW */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 relative">
                    {BUSINESS_UNITS.map(bu => {
                      const isExpanded = expandedBUs.includes(bu);
                      const bdept = DEPARTMENTS.filter(d => d.businessUnit === bu);
                      
                      return (
                        <div key={bu} className="flex flex-col">
                          
                          {/* BU HEADER CARD */}
                          <div 
                            onClick={() => toggleBU(bu)}
                            className={cn(
                              "p-4 border rounded-sm transition-all text-center cursor-pointer select-none",
                              isExpanded 
                                ? "border-accent-cyan/55 bg-accent-cyan/5 shadow-[0_0_15px_rgba(0,255,209,0.05)]" 
                                : "border-border/80 bg-panel/20 hover:border-border-bright"
                            )}
                          >
                            <Building2 className={cn("w-5 h-5 mx-auto mb-2", isExpanded ? "text-accent-cyan animate-pulse" : "text-text-tertiary")} />
                            <span className="text-[8.5px] font-mono font-black text-white uppercase block leading-tight mb-2">{bu}</span>
                            <div className="text-[7.5px] text-text-tertiary font-mono">
                              Units: {bdept.length} • Risk Score: {bdept.length > 0 ? Math.round(bdept.reduce((acc, d) => acc + d.riskScore, 0) / bdept.length) : 10}%
                            </div>
                            <span className="text-[7px] text-accent-cyan hover:underline mt-2 inline-block">
                              {isExpanded ? '[ COLLAPSE ]' : '[ EXPLORE ]'}
                            </span>
                          </div>

                          {/* DEPTS COLLAPSIBLE TREE BRANCHES */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-4 pt-4 pl-2 border-l border-border/50 ml-6 mt-2 overflow-hidden"
                              >
                                {bdept.map(dept => (
                                  <div 
                                    key={dept.id} 
                                    onClick={() => {
                                      setWfDept(dept.name);
                                      setActiveTab('workforce');
                                    }}
                                    className="p-3 bg-void/60 border border-border hover:border-accent-cyan/30 rounded-sm transition-all text-left group cursor-pointer"
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[8.5px] font-black text-white uppercase font-mono group-hover:text-accent-cyan transition-colors">{dept.name}</span>
                                      <span className={cn("text-[7px] px-1 font-mono rounded",
                                        dept.riskScore > 45 ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"
                                      )}>RISK {dept.riskScore}%</span>
                                    </div>
                                    <p className="text-[7.5px] text-text-secondary uppercase">Head: {dept.head}</p>
                                    
                                    <div className="mt-2 text-[7px] font-mono text-text-tertiary flex flex-wrap gap-x-2 gap-y-1">
                                      <span>{dept.employeesCount} staff</span>
                                      <span>•</span>
                                      <span>{dept.teams.length} distinct teams</span>
                                    </div>
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>

                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. WORKFORCE HUB (EMPLOYEE SEARCH & RISK INDEX) */}
            {activeTab === 'workforce' && (
              <motion.div
                key="workforce-hub"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                
                {/* INTERACTIVE EMPLOYEES GRID CATALOG PANEL */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* WORKFORCE FILTERS BLOCK */}
                  <div className="p-5 bg-panel/20 border border-border rounded-sm space-y-4">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-accent-cyan" />
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Personnel Directory Index Tracker</h3>
                      </div>
                      <span className="text-[8px] font-mono text-text-tertiary">SWEEP MATCHES: {workforceResult.totalMatches} EMPLOYEES</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Department Select */}
                      <div className="space-y-1">
                        <span className="text-[7.5px] text-text-tertiary block font-mono">DEPARTMENT FILTER</span>
                        <select 
                          value={wfDept} 
                          onChange={(e) => { setWfDept(e.target.value); setWfPage(0); }}
                          className="w-full bg-void border border-border h-8 px-2 outline-none text-white text-[9.5px] font-mono rounded"
                        >
                          <option value="">-- ALL DEPARTMENTS --</option>
                          {DEPARTMENTS.map(d => <option key={d.id} value={d.name}>{d.name.toUpperCase()}</option>)}
                        </select>
                      </div>

                      {/* Status select */}
                      <div className="space-y-1">
                        <span className="text-[7.5px] text-text-tertiary block font-mono">ACTIVITY STATUS</span>
                        <select 
                          value={wfStatus} 
                          onChange={(e) => { setWfStatus(e.target.value); setWfPage(0); }}
                          className="w-full bg-void border border-border h-8 px-2 outline-none text-white text-[9.5px] font-mono rounded"
                        >
                          <option value="">-- ALL STATUS --</option>
                          <option value="active">ACTIVE</option>
                          <option value="idle">IDLE</option>
                          <option value="suspended">SUSPENDED</option>
                        </select>
                      </div>

                      {/* Risk sliding filter */}
                      <div className="space-y-1 md:col-span-2">
                        <div className="flex justify-between text-[7.5px] text-text-tertiary font-mono">
                          <span>MAX RISK INDEX</span>
                          <span className="text-white font-extrabold">{wfMaxRisk}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="10" 
                          max="100" 
                          value={wfMaxRisk} 
                          onChange={(e) => { setWfMaxRisk(Number(e.target.value)); setWfPage(0); }}
                          className="w-full h-1.5 bg-void hover:cursor-pointer rounded-lg accent-accent-cyan"
                        />
                      </div>
                    </div>
                  </div>

                  {/* EMPLOYEES CORE LIST */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {workforceResult.employees.map((emp) => (
                      <div 
                        key={emp.id}
                        onClick={() => setSelectedEmployee(emp)}
                        className={cn(
                          "p-4 border rounded-sm transition-all focus:outline-none cursor-pointer text-left relative",
                          selectedEmployee?.id === emp.id
                            ? "border-accent-cyan bg-accent-cyan/5 shadow-[0_0_15px_rgba(0,255,209,0.06)]"
                            : "border-border/80 bg-panel/10 hover:border-border-bright"
                        )}
                      >
                        {/* Interactive Risk Bar Indicator */}
                        <div className={cn(
                          "absolute top-0 right-4 h-1.5 w-14 rounded-b-xs",
                          emp.riskScore > 45 ? "bg-rose-500" : emp.riskScore > 20 ? "bg-amber-400" : "bg-emerald-400"
                        )} title={`Risk rating ${emp.riskScore}%`} />

                        <div className="text-[10px] font-black text-white uppercase font-sans truncate mb-0.5">{emp.name}</div>
                        <span className="text-[8px] text-accent-blue font-mono block truncate uppercase mb-2">{emp.role}</span>

                        <div className="space-y-1 text-[7.5px] text-text-secondary font-mono pt-2 border-t border-border/50">
                          <div>DEPT: <span className="text-white">{emp.department}</span></div>
                          <div>LOC: <span className="text-white truncate">{emp.location}</span></div>
                          <div className="flex justify-between items-center mt-2">
                            <span className={cn("text-[7px] font-bold px-1 rounded-sm",
                              emp.activityStatus === 'active' ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-500"
                            )}>{emp.activityStatus.toUpperCase()}</span>
                            <span className="text-text-tertiary">Risk: {emp.riskScore}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* PAGINATION PANEL */}
                  <div className="flex items-center justify-between border-t border-border pt-4">
                    <button 
                      disabled={wfPage === 0} 
                      onClick={() => setWfPage(p => Math.max(0, p - 1))}
                      className="px-3 py-1.5 border border-border rounded-sm hover:bg-white/5 font-mono text-[8.5px] uppercase flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={12} />
                      PREVIOUS
                    </button>
                    <span className="font-mono text-[8.5px] text-text-tertiary">PAGE {wfPage + 1} OF {Math.ceil(workforceResult.totalMatches / 12) || 1}</span>
                    <button 
                      disabled={(wfPage + 1) * 12 >= workforceResult.totalMatches} 
                      onClick={() => setWfPage(p => p + 1)}
                      className="px-3 py-1.5 border border-border rounded-sm hover:bg-white/5 font-mono text-[8.5px] uppercase flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      NEXT
                      <ChevronRight size={12} />
                    </button>
                  </div>

                </div>

                {/* DETAILED INSPECTOR INDIVIDUAL SIDE CARD */}
                <div className="p-6 bg-[#040817] border border-border rounded-sm flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-border pb-4">
                      <span className="text-[8.5px] font-mono text-text-tertiary font-bold">STAFF INTEGRITY ANALYSIS</span>
                      <span className="px-1.5 py-0.5 bg-accent-cyan/15 text-accent-cyan rounded-xs text-[7.5px] font-mono font-bold">SEC PROFILE ACTIVE</span>
                    </div>

                    {selectedEmployee ? (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <span className="text-[8px] text-text-tertiary font-mono">{selectedEmployee.id} // LEVEL ROOT RECORD</span>
                          <h2 className="text-base font-display font-black text-white uppercase">{selectedEmployee.name}</h2>
                          <div className="p-2 border border-border bg-void/50 rounded flex justify-between items-center">
                            <div>
                              <span className="text-[7.5px] text-text-tertiary block font-mono">TRUST POSTURE</span>
                              <span className="text-xs font-mono font-black text-emerald-400">{selectedEmployee.trustScore}/100 score</span>
                            </div>
                            <div className="h-6 w-px bg-border" />
                            <div>
                              <span className="text-[7.5px] text-text-tertiary block font-mono">RISK SCORE</span>
                              <span className={cn("text-xs font-mono font-black",
                                selectedEmployee.riskScore > 45 ? "text-rose-400 animate-pulse" : "text-amber-400"
                              )}>{selectedEmployee.riskScore}/100 score</span>
                            </div>
                          </div>
                        </div>

                        {/* Relations metadata */}
                        <div className="space-y-3 font-mono text-[8.5px] divide-y divide-border/40">
                          <div className="flex justify-between py-1.5">
                            <span className="text-text-tertiary">BUSINESS UNIT:</span>
                            <span className="text-white font-bold">{selectedEmployee.businessUnit.toUpperCase()}</span>
                          </div>
                          <div className="flex justify-between py-1.5">
                            <span className="text-text-tertiary">DEPARTMENT:</span>
                            <span className="text-white font-bold">{selectedEmployee.department.toUpperCase()}</span>
                          </div>
                          <div className="flex justify-between py-1.5">
                            <span className="text-text-tertiary">REPORTS TO (MANAGER):</span>
                            <span className="text-white font-bold">{selectedEmployee.manager.toUpperCase()}</span>
                          </div>
                          <div className="flex justify-between py-1.5">
                            <span className="text-text-tertiary">GEOGRAPHIC OFFICE:</span>
                            <span className="text-white font-bold">{selectedEmployee.location.toUpperCase()}</span>
                          </div>
                        </div>

                        {/* Associated Devices list */}
                        <div className="space-y-2 pt-2">
                          <span className="text-[8.5px] font-mono text-text-tertiary block font-bold">SECURE WORKFORCE DEVICES ({selectedEmployee.devices.length})</span>
                          <div className="space-y-1.5">
                            {selectedEmployee.devices.map((dev, i) => (
                              <div key={i} className="p-2 border border-border/70 bg-void/30 rounded flex items-center gap-2">
                                <Cpu className="w-3.5 h-3.5 text-accent-cyan" />
                                <span className="font-mono text-[8px] text-white">{dev}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Credentials access rights */}
                        <div className="space-y-2">
                          <span className="text-[8.5px] font-mono text-text-tertiary block font-bold">IDENTITY DIRECTORY AUTHORIZATIONS ({selectedEmployee.accessRights.length})</span>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedEmployee.accessRights.map((right, i) => (
                              <span key={i} className="px-2 py-0.5 bg-accent-blue/10 border border-accent-blue/30 text-accent-blue rounded-xs font-mono text-[7px]" title="Valid active directory security token">
                                {right}
                              </span>
                            ))}
                            {selectedEmployee.accessRights.length === 0 && (
                              <span className="text-[8px] text-text-tertiary italic">No administrative system access rights assigned.</span>
                            )}
                          </div>
                        </div>

                        {/* Applications Used */}
                        <div className="space-y-2">
                          <span className="text-[8.5px] font-mono text-text-tertiary block font-bold">CONNECTED CLOUD APPLICATIONS USED</span>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedEmployee.applicationsUsed.map((app, i) => (
                              <span key={i} className="px-2 py-0.5 bg-white/5 border border-border text-white rounded-xs font-mono text-[7px]">
                                {app}
                              </span>
                            ))}
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="text-center py-12 text-text-tertiary italic font-mono uppercase">
                        Select an employee card to pull granular operational metadata record logs.
                      </div>
                    )}
                  </div>

                  {selectedEmployee && (
                    <div className="border-t border-border pt-4 mt-6">
                      <button 
                        onClick={() => handleSendCopilotQuery(`Review security anomalies for employee ${selectedEmployee.name}`)}
                        className="w-full py-2.5 bg-accent-cyan text-void font-bold tracking-widest text-[8.5px] rounded hover:shadow-[0_0_15px_rgba(0,255,209,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Sparkles size={12} />
                        LAUNCH COGNITIVE AUDIT REPORT
                      </button>
                    </div>
                  )}

                </div>

              </motion.div>
            )}

            {/* 4. APPLICATION & DATA ESTATE EXPLORER */}
            {activeTab === 'apps' && (
              <motion.div
                key="apps-database"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                {/* APPLICATION DEPENDENCY SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* APP CATALOG ITEMS */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 bg-panel/15 border border-border rounded-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-border pb-4">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-accent-cyan" />
                          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Enterprise Application Dependency Matrix</h3>
                        </div>
                        <span className="text-[8px] font-mono text-text-tertiary">COMPLIANT PORTS MONITORED</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {APPLICATIONS.map((app) => (
                          <div 
                            key={app.id}
                            onClick={() => setSelectedApp(app)}
                            className={cn(
                              "p-4 border rounded-sm transition-all focus:outline-none cursor-pointer relative text-left",
                              selectedApp?.id === app.id
                                ? "border-accent-cyan bg-accent-cyan/5 shadow-[0_0_15px_rgba(0,255,209,0.06)]"
                                : "border-border bg-panel/5 hover:border-border-bright"
                            )}
                          >
                            <div className="flex items-baseline justify-between mb-2">
                              <span className="text-[10px] font-mono font-black text-white uppercase">{app.name}</span>
                              <span className={cn("text-[7.5px] font-mono font-black px-1 rounded",
                                app.riskLevel === 'critical' ? 'bg-rose-500/15 text-rose-400' :
                                app.riskLevel === 'high' ? 'bg-orange-500/15 text-orange-400' : 'bg-emerald-500/15 text-emerald-400'
                              )}>RISK: {app.riskLevel.toUpperCase()}</span>
                            </div>

                            <div className="space-y-1 text-[7.5px] font-mono text-text-secondary pt-2 border-t border-border/40">
                              <div>SYSTEM OWNER: <span className="text-white">{app.owner}</span></div>
                              <div>ACTIVE CONCURRENT USERS: <span className="text-white">{app.usersCount.toLocaleString()} Users</span></div>
                              <div className="flex justify-between mt-2">
                                <span className={cn("text-[7.5px] font-bold px-1 rounded-sm",
                                  app.governanceStatus === 'compliant' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                                )}>{app.governanceStatus.toUpperCase()} GRC</span>
                                <span className="text-text-tertiary">Health index: {app.operationalHealth}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* GRANULAR APP INSPECTOR SIDE CARD + DEPENDENCY LINE CHARTS */}
                  <div className="p-6 bg-panel/30 border border-border rounded-sm space-y-6">
                    <span className="text-[8px] font-mono text-text-tertiary font-black block tracking-widest border-b border-border pb-3">LOGICAL TOPOLOGY DEPENDENCY MAPPER</span>
                    
                    {selectedApp ? (
                      <div className="space-y-6">
                        <div className="space-y-1">
                          <h4 className="text-xs font-black font-sans text-white uppercase">{selectedApp.name}</h4>
                          <span className="text-[8px] font-mono text-text-tertiary">ID: {selectedApp.id}</span>
                        </div>

                        {/* Interactive dynamic visual map representing linkages */}
                        <div className="p-4 bg-void/70 border border-border/80 rounded h-40 flex flex-col justify-between relative font-mono text-[8px] text-text-secondary overflow-hidden">
                          {/* Ambient connection wires */}
                          <div className="absolute top-1/2 left-0 right-0 h-px bg-dashed bg-accent-cyan/15 animate-pulse" />
                          
                          <div className="flex justify-between items-center z-10 relative">
                            <span className="px-2 py-1 bg-accent-blue/15 border border-accent-blue/30 text-accent-blue rounded-xs">RESOURCES GATEWAY</span>
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-[6.5px] text-text-tertiary">LOAD_BUS</span>
                              <Activity size={10} className="text-accent-cyan animate-pulse" />
                            </div>
                            <span className="px-2 py-1 bg-accent-cyan/15 border border-accent-cyan/30 text-accent-cyan rounded-xs">{selectedApp.owner.toUpperCase()}</span>
                          </div>

                          <div className="flex justify-center z-10">
                            <div className="text-center">
                              <span className="text-[7px] text-text-tertiary block">TARGET_APP</span>
                              <span className="text-white font-black">{selectedApp.id}</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center z-10 relative">
                            <div className="flex flex-col">
                              <span className="text-[6.5px] text-text-tertiary leading-none uppercase">Dependencies</span>
                              <span className="text-white mt-1 leading-none">{selectedApp.dependencies.join(', ') || 'N/A'}</span>
                            </div>
                            <div className="flex flex-col text-right">
                              <span className="text-[6.5px] text-text-tertiary leading-none uppercase">Database Rel</span>
                              <span className="text-accent-cyan mt-1 leading-none">{selectedApp.connectedDatabases.join(', ') || 'N/A'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Associated Databases classifications */}
                        <div className="space-y-2">
                          <span className="text-[8.5px] font-mono text-text-tertiary font-bold block">CONNECTED SENSITIVE DATASETS</span>
                          {selectedApp.connectedDatabases.map(dbId => {
                            const dbItem = DATA_ASSETS.find(d => d.id === dbId);
                            if (!dbItem) return null;
                            return (
                              <div key={dbId} className="p-3 bg-void/40 border border-border rounded flex justify-between items-center">
                                <div>
                                  <span className="text-[9px] font-black text-white font-mono block">{dbItem.name}</span>
                                  <span className="text-[7.5px] text-text-tertiary font-mono">Classification: {dbItem.classification}</span>
                                </div>
                                <span className={cn("text-[7.5px] px-1 font-mono font-bold rounded-sm uppercase",
                                  dbItem.sensitivity === 'restricted' ? "bg-red-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"
                                )}>{dbItem.sensitivity}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-text-tertiary italic font-mono">
                        Select an application card to map dependency rings and database handshakes.
                      </div>
                    )}
                  </div>
                </div>

                {/* DATA ESTATE EXPLORER (DATABASES) */}
                <div className="p-6 bg-panel/20 border border-border rounded-sm">
                  <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-indigo-400" />
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">Enterprise Data Estate classifications Ledger</h3>
                    </div>
                    <span className="text-[8px] font-mono text-text-tertiary">RESTRICTED PII ACCESS MATRIX LIMITS</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {DATA_ASSETS.map((asset) => (
                      <div 
                        key={asset.id}
                        onClick={() => setSelectedDb(asset)}
                        className={cn(
                          "p-4 border rounded-sm transition-all focus:outline-none cursor-pointer text-left relative",
                          selectedDb?.id === asset.id
                            ? "border-indigo-500 bg-indigo-500/5 shadow-[0_0_15px_rgba(99,102,241,0.08)]"
                            : "border-border bg-panel/5 hover:border-border-bright"
                        )}
                      >
                        <div className="flex justify-between items-baseline mb-2">
                          <span className="text-[9.5px] font-black text-white font-mono block truncate uppercase">{asset.name}</span>
                          <span className="text-[7.5px] bg-indigo-500/10 text-indigo-400 font-mono font-bold px-1.5 py-0.5">{asset.type.replace('-', ' ')}</span>
                        </div>

                        <div className="space-y-1.5 text-[7.5px] font-mono text-text-secondary pt-2 border-t border-border/40">
                          <div>CLASSIFICATION: <span className="text-white block truncate">{asset.classification}</span></div>
                          <div>SENSITIVITY CLASSIFY: <span className={cn("font-extrabold",
                            asset.sensitivity === 'restricted' ? "text-rose-400" : "text-amber-400"
                          )}>{asset.sensitivity.toUpperCase()}</span></div>
                          <div className="flex justify-between text-text-tertiary mt-2">
                            <span>{asset.accessActivityCount} ACCESSES</span>
                            <span>{asset.volumeGb.toLocaleString()} GB</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* GRANULAR DATABASE EXPLORER DETAILS */}
                  {selectedDb && (
                    <div className="mt-6 p-4 bg-void/50 border border-border rounded flex flex-col md:flex-row justify-between items-baseline md:items-center gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-400" />
                          <h4 className="text-xs font-black text-white font-mono uppercase">{selectedDb.name} Detailed Security Audit Logs</h4>
                        </div>
                        <p className="text-[9px] text-text-secondary leading-relaxed uppercase">
                          This repository houses restricted structural files classified under: <span className="text-white font-bold">{selectedDb.classification}</span>. System is maintained by <span className="text-white font-bold">{selectedDb.owner}</span> inside cloud vaults.
                        </p>
                      </div>

                      <div className="flex gap-4 font-mono text-[9px] text-text-secondary bg-white/[0.02] p-3 border border-white/5 rounded">
                        <div>
                          <span className="text-text-tertiary text-[7.5px] block font-mono">HOURLY QUERY DRIFT</span>
                          <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                            <TrendingUp size={10} />
                            RISING {selectedDb.usageTrend.toUpperCase()}
                          </span>
                        </div>
                        <div className="h-6 w-px bg-border" />
                        <div>
                          <span className="text-text-tertiary text-[7.5px] block font-mono">ESTIMATED STORAGE VALUE</span>
                          <span className="text-white font-black">${(selectedDb.volumeGb * 0.08).toFixed(2)}/MO COLD</span>
                        </div>
                        <div className="h-6 w-px bg-border" />
                        <div>
                          <span className="text-text-tertiary text-[7.5px] block font-mono">SENSITIVE ACCESS DISCOVERY</span>
                          <span className="text-rose-400 font-extrabold">NO ACTIVE EXPLOIT LEAKS</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </motion.div>
            )}

            {/* 5. CORE INFRASTRUCTURE & MULTICLOUD CENTER */}
            {activeTab === 'infra' && (
              <motion.div
                key="infra-multicloud"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                {/* LOCAL INFRASTRUCTURE MAPGRID */}
                <div className="p-6 bg-panel/15 border border-border rounded-sm">
                  <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-accent-cyan" />
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">On-Prem Infrastructure & Virtualized Nodes core</h3>
                    </div>
                    <span className="text-[8px] font-mono text-text-tertiary">LOCAL DAEMON SERVICES HEARTBEAT: COMPLIANT</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {INFRA_NODES.map((srv) => (
                      <div key={srv.id} className="p-4 border border-border/85 bg-panel/10 hover:border-accent-cyan/40 transition-all rounded-sm flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="flex justify-between items-baseline">
                            <span className="text-[10px] font-black text-white font-mono block truncate max-w-[150px] uppercase">{srv.name}</span>
                            <span className="text-[7.5px] bg-white/5 text-text-secondary px-1.5 py-0.5 rounded-sm font-mono uppercase">{srv.type}</span>
                          </div>

                          {/* RAM/CPU bars */}
                          <div className="space-y-1.5 font-mono text-[7px] text-text-secondary">
                            <div className="flex justify-between">
                              <span>CORE PROCESSOR CPU UTIL</span>
                              <span className="text-white">{srv.capacityCpu}%</span>
                            </div>
                            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                              <div className="bg-accent-cyan h-full" style={{ width: `${srv.capacityCpu}%` }} />
                            </div>
                            <div className="flex justify-between mt-1">
                              <span>HOST RAM MEMORY CAPACITY</span>
                              <span className="text-white">{srv.capacityRam}%</span>
                            </div>
                            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                              <div className="bg-accent-blue h-full" style={{ width: `${srv.capacityRam}%` }} />
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[7.5px] text-text-tertiary mt-4 pt-2 border-t border-border/30 font-mono">
                          <span>REG: {srv.region.toUpperCase()}</span>
                          <span className="text-emerald-400 font-extrabold">UPTIME {srv.availability}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* MULTICLOUD OPERATIONS VIEW */}
                <div className="p-6 bg-panel/20 border border-border rounded-sm">
                  <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
                    <div className="flex gap-2 items-center">
                      <Cloud className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">Multi-Cloud global assets allocations map</h3>
                    </div>

                    {/* VPC Provider Selector */}
                    <div className="flex border border-border divide-x divide-border">
                      {['all', 'aws', 'gcp', 'azure'].map(p => (
                        <button 
                          key={p} 
                          onClick={() => setCloudProvider(p as any)}
                          className={cn(
                            "px-3 py-1 text-[7.5px] font-mono hover:bg-white/5 transition-all focus:outline-none uppercase",
                            cloudProvider === p ? "bg-accent-cyan/15 text-accent-cyan" : "text-text-secondary"
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Cloud Maps layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Cloud cost metrics and regions breakdown list */}
                    <div className="lg:col-span-2 space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-3">
                      {CLOUD_REGIONS_STATS.filter(c => cloudProvider === 'all' || c.provider === cloudProvider).map((cRegion, index) => (
                        <div key={index} className="p-4 bg-void/50 border border-border hover:border-accent-cyan/20 rounded flex justify-between items-center transition-all">
                          <div className="flex items-center gap-4">
                            <Cloud className={cn("w-6 h-6",
                              cRegion.provider === 'aws' ? 'text-amber-500' :
                              cRegion.provider === 'gcp' ? 'text-accent-cyan' : 'text-accent-blue'
                            )} />
                            <div>
                              <span className="text-[10px] font-black text-white block uppercase">{cRegion.provider.toUpperCase()} // Region {cRegion.region}</span>
                              <div className="flex gap-4 font-mono text-[7.5px] text-text-tertiary mt-1">
                                <span>{cRegion.instancesCount} active instances</span>
                                <span>•</span>
                                <span>{cRegion.identitySystemCount} ID Auth controllers</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right font-mono text-[8.5px]">
                            <span className="text-white font-extrabold block">${cRegion.monthlyCost.toLocaleString()}/mo billing</span>
                            <span className="text-emerald-400">Throughput: {cRegion.networkThroughputGb} Gb/s</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Premium cinematic map representation mockup overlay */}
                    <div className="p-4 bg-void/80 border border-border rounded h-[300px] flex flex-col justify-between relative overflow-hidden font-mono text-[8px] text-text-secondary">
                      <div className="absolute inset-0 opacity-[0.14] bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.2),transparent_75%)] pointer-events-none" />
                      
                      <div className="flex justify-between items-center z-10">
                        <span className="text-[7.5px] text-text-tertiary font-bold uppercase">GLOBAL CLOUD VPC INGRESS CONTROLLERS</span>
                        <Globe size={13} className="text-accent-cyan animate-pulse" />
                      </div>

                      {/* Mockup nodes rendering global visual flow */}
                      <div className="space-y-3 z-10">
                        <div className="flex justify-between text-[7px]">
                          <span>US-EAST-1_AWS_INGRESS</span>
                          <span className="text-emerald-400">99.9% SECURE ●</span>
                        </div>
                        <div className="flex justify-between text-[7px]">
                          <span>ASIA-EAST1_GCP_INGRESS</span>
                          <span className="text-emerald-400">100.0% COGNITIVE COMP ●</span>
                        </div>
                        <div className="flex justify-between text-[7px]">
                          <span>WESTEUROPE_AZ_INGRESS</span>
                          <span className="text-rose-400">DOCKER CAPACITY WARNING ●</span>
                        </div>
                      </div>

                      <span className="text-[6.5px] leading-relaxed text-text-tertiary uppercase mt-4 block border-t border-border/40 pt-2 z-10">
                        Telemetry streams sync with regional cluster controllers securely over encrypted VPN tunnels.
                      </span>
                    </div>

                  </div>
                </div>
              </motion.div>
            )}

            {/* 6. GRC REPORTING & GOVERNANCE VIOLATIONS */}
            {activeTab === 'governance' && (
              <motion.div
                key="governance-compliance"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                {/* GOVERNANCE VIOLATIONS LIST */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* VIOLATIONS STREAM */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 bg-panel/15 border border-border rounded-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-border pb-4">
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-rose-500" />
                          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Active Policy & Governance Infractions Ledger</h3>
                        </div>
                        <span className="text-[8px] font-mono text-rose-500 font-extrabold">{GOVERNANCE_VIOLATIONS.length} ESCALATIONS DEPLOYED</span>
                      </div>

                      <div className="space-y-4">
                        {GOVERNANCE_VIOLATIONS.map((violation) => (
                          <div 
                            key={violation.id}
                            className={cn(
                              "p-4 border rounded flex flex-col md:flex-row justify-between items-baseline md:items-center gap-4 transition-all relative text-left",
                              violation.severity === 'critical' ? 'border-red-500/20 bg-red-950/5' :
                              violation.severity === 'high' ? 'border-amber-500/20 bg-amber-950/5' : 'border-border bg-panel/5'
                            )}
                          >
                            <div className="space-y-1">
                              <div className="flex gap-2 items-center">
                                <span className={cn(
                                  "text-[8px] font-mono font-black rounded px-1.5 py-0.5 uppercase",
                                  violation.severity === 'critical' ? 'bg-red-500/15 text-rose-400' :
                                  violation.severity === 'high' ? 'bg-amber-500/15 text-amber-500' : 'bg-white/5 text-text-secondary'
                                )}>{violation.severity.toUpperCase()}_THREAT</span>
                                <span className="text-[10px] font-sans font-black text-white uppercase">{violation.title}</span>
                              </div>
                              <p className="text-[8.5px] text-text-secondary font-mono leading-relaxed">
                                Rule violated: <span className="text-white">{violation.ruleViolated}</span>
                              </p>
                              <div className="flex gap-4 font-mono text-[7px] text-text-tertiary">
                                <span>DETECTED: {new Date(violation.detectedAt).toUTCString()}</span>
                                <span>•</span>
                                <span>OWNER: {violation.assignedTo}</span>
                              </div>
                            </div>

                            <div className="flex gap-4 items-center shrink-0 w-full md:w-auto justify-between md:justify-end">
                              <span className={cn("text-[7.5px] font-mono px-2 py-1 rounded border uppercase font-bold",
                                violation.status === 'open' ? 'border-amber-500/30 text-amber-500 bg-amber-500/5' :
                                violation.status === 'investigating' ? 'border-rose-500/30 text-rose-400 bg-rose-500/5 animate-pulse' : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5'
                              )}>{violation.status}</span>

                              <button 
                                onClick={() => handleSendCopilotQuery(`How should we mitigate governance violation ${violation.id} assigned to ${violation.assignedTo}?`)}
                                className="px-3 py-1.5 border border-border text-[8px] hover:bg-white/5 text-text-secondary hover:text-white rounded font-mono uppercase cursor-pointer"
                              >
                                INTEL PLAN
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* COMPLIANCE GUIDELINES / EXECUTIVE STATS RADAR INDEX */}
                  <div className="p-6 bg-[#040817] border border-border rounded-sm space-y-6">
                    <span className="text-[8.5px] font-mono text-text-tertiary block font-bold border-b border-border pb-3 uppercase">GRC Compliance Audit Index summary</span>
                    
                    <div className="space-y-6">
                      <div className="space-y-1.5 font-mono text-[8.5px] text-text-secondary">
                        <div className="flex justify-between">
                          <span>SOX SEC FINANCIAL COMPLIANCE INDEX</span>
                          <span className="text-emerald-400 font-bold">96%</span>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-400 h-full" style={{ width: '96%' }} />
                        </div>

                        <div className="flex justify-between pt-3">
                          <span>GDPR PII PRIVACY DATA CLASSIFIERS</span>
                          <span className="text-amber-400 font-bold">81%</span>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-amber-400 h-full" style={{ width: '81%' }} />
                        </div>

                        <div className="flex justify-between pt-3">
                          <span>SOC2 TELEMETRY MONITOR SUITE</span>
                          <span className="text-accent-cyan font-bold">94%</span>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-accent-cyan h-full" style={{ width: '94%' }} />
                        </div>
                      </div>

                      <div className="p-4 bg-void/50 border border-border rounded text-[9px] text-text-secondary leading-relaxed uppercase">
                        This dashboard provides raw operational indexes summarizing 102k+ active authentication logs without compromising individual credentials. Refer access mitigations to cybersecurity SOC departments over primary VPN.
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {activeTab === 'enterprise-os' && (
              <motion.div
                key="enterprise-os"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex overflow-hidden min-h-0"
              >
                <EnterpriseOperatingSystem />
              </motion.div>
            )}

            {activeTab === 'cognition' && (
              <motion.div
                key="cognition"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex overflow-hidden min-h-0"
              >
                <AIReasoningStudio />
              </motion.div>
            )}

          </AnimatePresence>

        </div>

        {/* COLLAPSIBLE PREMIUM AI EXECUTIVE COPILOT COLUMN */}
        <div className="w-[390px] border-l border-border bg-[#030611]/80 backdrop-blur-xl shrink-0 flex flex-col justify-between overflow-hidden z-20">
          
          {/* COPILOT TITLE BAR */}
          <div className="p-5 border-b border-border bg-panel/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-accent-cyan animate-pulse" />
              <span className="font-mono text-[10px] font-black text-white hover:text-accent-cyan transition-colors cursor-pointer uppercase">SENTINEL-X AI EXECUTIVE COPILOT</span>
            </div>
            <span className="text-[7.5px] bg-[#102a1b] border border-[#217d47] text-accent-cyan font-mono px-1.5 rounded uppercase font-bold">JARVIS PROTOCOL ACTIVE</span>
          </div>

          {/* COPILOT SESSIONS MESSAGES HISTORY */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
            {copilotHistory.map((chat, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "p-3 rounded-xs border text-left flex flex-col gap-2",
                  chat.sender === 'user' 
                    ? 'border-border bg-void/60 text-white ml-8 border-l-2 border-l-accent-blue' 
                    : 'border-border/60 bg-[#050a18]/40 text-text-secondary mr-8 border-l-2 border-l-accent-cyan'
                )}
              >
                <div className="flex items-center gap-1.5 justify-between text-[7px] text-text-tertiary font-mono">
                  <span>{chat.sender === 'user' ? 'OPERATOR COMMAND INPUT' : 'SENTINEL ENGINE REPORT'}</span>
                  <span>0x7F2C...8A1</span>
                </div>
                <div className={cn("text-[9.5px] leading-relaxed uppercase font-mono", chat.sender === 'user' ? "text-white" : "text-text-secondary")}>
                  {chat.text}
                </div>

                {/* Copilot Attached Dynamic Custom Visual Widgets */}
                {chat.attachment && (
                  <div className="mt-2 pt-2 border-t border-border/40 space-y-2">
                    
                    {/* Visual Risk Matrix Map */}
                    {chat.attachment.visualComponentType === 'RISK_MATRIX' && (
                      <div className="p-2.5 bg-void/80 border border-border rounded font-mono text-[8px] space-y-1.5">
                        <span className="text-[7px] text-text-tertiary font-bold block">AUDIT CORRELATION KEY:</span>
                        {chat.attachment.chartsData.slice(0, 4).map((d: any, i: number) => (
                          <div key={i} className="flex justify-between items-center bg-white/[0.01] p-1 border border-white/5 rounded-xs">
                            <span className="truncate max-w-[120px]">{d.name.toUpperCase()}</span>
                            <div className="flex gap-2">
                              <span className={cn("font-bold", d.risk > 45 ? "text-rose-400" : "text-emerald-400")}>RISK: {d.risk}%</span>
                              <span className="text-text-tertiary">VIOLATIONS: {d.violations}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Sensitive DB access path tracker */}
                    {chat.attachment.visualComponentType === 'DATA_FLOW_MAP' && (
                      <div className="p-2.5 bg-void/80 border border-border rounded font-mono text-[8px] space-y-1.5">
                        <span className="text-[7.5px] text-indigo-400 font-bold block">ACCESS ACTIVITY DECRPYTS:</span>
                        {chat.attachment.chartsData.slice(0, 3).map((d: any, i: number) => (
                          <div key={i} className="flex justify-between items-center">
                            <span className="text-white truncate max-w-[150px]">{d.name.toUpperCase()}</span>
                            <span className="text-text-tertiary font-bold">{d.activity} QPS</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* App linkage hierarchy list */}
                    {chat.attachment.visualComponentType === 'DEPENDENCY_GRID' && (
                      <div className="p-2.5 bg-void/80 border border-border rounded font-mono text-[8px] space-y-1.5">
                        <span className="text-[7.5px] text-accent-cyan font-bold block">HIGHEST DEP NODES:</span>
                        {chat.attachment.chartsData.slice(0, 3).map((d: any, i: number) => (
                          <div key={i} className="flex justify-between">
                            <span className="text-white font-bold">{d.name.toUpperCase()}</span>
                            <span className="text-accent-blue font-bold">DEPS: {d.deps} | USERS: {Math.round(d.users)}K</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Violation counts logs */}
                    {chat.attachment.visualComponentType === 'VIOLATION_LEDGER' && (
                      <div className="p-2.5 bg-void/80 border border-border rounded font-mono text-[8px] space-y-1.5">
                        <span className="text-[7.5px] text-rose-400 font-bold block">ACTIVE VIOLATION CLASSIFICATION SCORE:</span>
                        {chat.attachment.chartsData.map((d: any, i: number) => (
                          <div key={i} className="flex justify-between text-text-secondary bg-white/[0.01] p-1 border border-white/5">
                            <span>INFRASTRUCTURE ESCALATION {d.name}</span>
                            <span className={cn("font-bold", d.level > 60 ? "text-rose-400" : "text-amber-400")}>SCORE: {d.level}%</span>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                )}
              </div>
            ))}

            {isCopilotThinking && (
              <div className="p-3 border border-dashed border-border bg-[#050a18]/40 mr-8 text-[9px] text-text-tertiary italic font-mono uppercase flex items-center gap-2">
                <RefreshCw size={11} className="animate-spin text-accent-cyan" />
                <span>SENTINEL ENGINE CLASSIFYING THREAT PATTERNS...</span>
              </div>
            )}
          </div>

          {/* QUICK ANALYTICAL SHORTCUT COGNITIVE TRIGGERS */}
          <div className="p-4 bg-[#050713]/70 border-t border-border">
            <span className="text-[7.5px] font-mono text-text-tertiary block font-bold mb-3 uppercase">AI Executive shortcut analyzers</span>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                { label: "Rising Risk", q: "Show me departments with rising risk." },
                { label: "Asset Access", q: "Which business units access sensitive assets most frequently?" },
                { label: "App Dependency", q: "Which applications have the highest operational dependency?" },
                { label: "GRC Violations", q: "Where are governance violations increasing?" }
              ].map((shortcut, i) => (
                <button
                  key={i}
                  onClick={() => handleSendCopilotQuery(shortcut.q)}
                  className="p-1.5 border border-border hover:border-accent-cyan/40 bg-panel/10 hover:bg-white/5 transition-colors text-[7.5px] text-text-secondary hover:text-white rounded text-left truncate font-mono uppercase cursor-pointer"
                >
                  {shortcut.label}
                </button>
              ))}
            </div>

            {/* COPILOT CHAT ACTION FORM */}
            <div className="flex gap-2 items-center">
              <input 
                type="text" 
                placeholder="ASK AI COPILOT..." 
                value={copilotInput}
                onChange={(e) => setCopilotInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendCopilotQuery(copilotInput)}
                className="flex-1 bg-void border border-border rounded h-9 text-[9.5px] pl-3 text-white uppercase outline-none font-mono font-medium focus:border-accent-cyan/60"
              />
              <button 
                onClick={() => handleSendCopilotQuery(copilotInput)}
                className="w-9 h-9 border border-accent-cyan/50 text-accent-cyan hover:bg-accent-cyan/10 flex items-center justify-center rounded transition-colors cursor-pointer"
              >
                <Send size={12} />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

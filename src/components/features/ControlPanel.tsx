import { motion, AnimatePresence } from 'motion/react';
import { Shield, RotateCcw, AlertTriangle, Users, Bug, Search, FileText, Activity, ChevronDown, Zap, ShieldAlert, Gauge, ShieldCheck, Sliders, Target, Radio } from 'lucide-react';
import { AttackType, ScenarioType, DefenseModule, NetworkNode } from '../../types/simulation';
import { EnterpriseIdentity } from '../../types/iam';
import { cn } from '../../lib/utils';
import { useState, useEffect } from 'react';

export function ControlPanel({ 
  nodes,
  identities = [],
  operatorRole = 'Administrator',
  onEscalateRole,
  onLaunchAttack, 
  onLaunchScenario,
  onActivateDefense, 
  onReset,
  onToggleHeatmap,
  onShowReport,
  showHeatmap,
  selectedNodeId,
  simulationSpeed,
  onSetSimulationSpeed,
  activeDefenseModules,
  onToggleDefenseModule,
  onOpenManual,
  onUpdateNodeVulnerability,
  onUpdateZoneVulnerability,
  onHighlightNode,
  spreadVelocity,
  onSetSpreadVelocity,
  isSimulating,
  onToggleSimulation
}: { 
  nodes: NetworkNode[],
  identities?: EnterpriseIdentity[],
  operatorRole?: string,
  onEscalateRole?: (role: string) => void,
  onLaunchAttack: (type: AttackType, targetId?: string, intensity?: number, identityId?: string) => void,
  onLaunchScenario: (scenario: ScenarioType) => void,
  onActivateDefense: () => void,
  onReset: () => void,
  onToggleHeatmap: () => void,
  onShowReport: () => void,
  showHeatmap: boolean,
  selectedNodeId?: string,
  simulationSpeed: number,
  onSetSimulationSpeed: (speed: number) => void,
  activeDefenseModules: DefenseModule[],
  onToggleDefenseModule: (module: DefenseModule) => void,
  onOpenManual: () => void,
  onUpdateNodeVulnerability: (nodeId: string, vuln: number) => void,
  onUpdateZoneVulnerability: (type: string, vuln: number) => void,
  onHighlightNode?: (nodeId: string | null) => void,
  spreadVelocity: number,
  onSetSpreadVelocity: (velocity: number) => void,
  isSimulating: boolean,
  onToggleSimulation: () => void
}) {
  const [selectedAttack, setSelectedAttack] = useState<AttackType | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [intensity, setIntensity] = useState(0.8);
  const [vulnValue, setVulnValue] = useState(0.5);
  const [nodeVulnValue, setNodeVulnValue] = useState(0.5);
  const [targetNodeId, setTargetNodeId] = useState<string>('');
  const [targetIdentityId, setTargetIdentityId] = useState<string>('');
  const [lastToggled, setLastToggled] = useState<string | null>(null);
  const [activeActions, setActiveActions] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'regional' | 'target'>('regional');

  const [isEscalating, setIsEscalating] = useState(false);
  const isRestrictedRole = operatorRole === 'Security Analyst' || operatorRole === 'Forensic Investigator';

  const handleRequestElevate = async () => {
    setIsEscalating(true);
    await new Promise(r => setTimeout(r, 1200));
    onEscalateRole?.('Administrator');
    setIsEscalating(false);
  };

  // Environmental Tune - Live update
  useEffect(() => {
    if (selectedZone) {
      onUpdateZoneVulnerability(selectedZone, vulnValue);
    }
  }, [vulnValue, selectedZone, onUpdateZoneVulnerability]);

  const triggerActionFeedback = (actionId: string) => {
    setActiveActions(prev => ({ ...prev, [actionId]: true }));
    setTimeout(() => {
      setActiveActions(prev => ({ ...prev, [actionId]: false }));
    }, 600);
  };

  // Sync node vulnerability slider with selection
  useEffect(() => {
    if (selectedNodeId) {
      setTargetNodeId(selectedNodeId);
      const node = nodes.find(n => n.id === selectedNodeId);
      if (node) setNodeVulnValue(node.vulnerability);
    } else if (!targetNodeId && nodes.length > 0) {
      setTargetNodeId(nodes[0].id);
      setNodeVulnValue(nodes[0].vulnerability);
    }
  }, [selectedNodeId, nodes.length]);

  const handleNodeSelect = (id: string) => {
    setTargetNodeId(id);
    const node = nodes.find(n => n.id === id);
    if (node) setNodeVulnValue(node.vulnerability);
  };

  const handleDefenseToggle = (id: DefenseModule) => {
    onToggleDefenseModule(id);
    setLastToggled(id);
    setTimeout(() => setLastToggled(null), 1000);
  };

  const attackTypes: { type: AttackType; label: string; desc: string }[] = [
    { type: 'ransomware', label: 'Ransomware', desc: 'Host locker' },
    { type: 'ddos', label: 'DDoS Spikes', desc: 'Saturate links' },
    { type: 'phishing', label: 'Phishing', desc: 'Credential trap' },
    { type: 'insider', label: 'Insider Leak', desc: 'Privilege abuse' },
    { type: 'zeroday', label: 'Zero-Day', desc: 'Unpatched exploit' },
    { type: 'apt', label: 'APT Foothold', desc: 'Quiet persistence' },
  ];

  const zones: { type: string; label: string }[] = [
    { type: 'gateway', label: 'Gateway' },
    { type: 'database', label: 'Databases' },
    { type: 'firewall', label: 'Firewalls' },
    { type: 'workstation', label: 'Endpoints' },
  ];

  const defenseModules: { id: DefenseModule; label: string; desc: string }[] = [
    { id: 'firewall', label: 'Active Firewall', desc: 'Sever untrusted links' },
    { id: 'neural_isolation', label: 'Neural Isolation', desc: 'Isolate subnet nodes' },
    { id: 'heuristic_scanner', label: 'Heuristic Scan', desc: 'Signature-less scan' },
    { id: 'auto_containment', label: 'Auto Contain', desc: 'Lock infected nodes' },
    { id: 'traffic_scrubbing', label: 'Traffic Scrub', desc: 'DDoS packet wash' },
    { id: 'quantum_hardening', label: 'Quantum Shield', desc: 'Prevent IAM bypass' },
  ];

  const scenarios: { id: ScenarioType; label: string; desc: string }[] = [
    { id: 'corporate_espionage', label: 'ESPIONAGE Campaign', desc: 'Data theft playbook' },
    { id: 'critical_infrastructure', label: 'INFRA Breach', desc: 'SCADA down playbook' },
    { id: 'ransomware_storm', label: 'RANSOM STORM', desc: 'Widespread encryption' }
  ];

  return (
    <div className="flex flex-col gap-5 font-sans pb-6">
      {/* HEADER BAR */}
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
         <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-accent-cyan" />
              <div className="absolute w-6 h-6 bg-accent-cyan/20 blur-md rounded-full animate-pulse-precision" />
            </div>
            <h3 className="text-[10px] font-bold tracking-[0.15em] text-white uppercase">Neural Simulation Controls</h3>
         </div>
         <span className="text-[8px] font-mono px-2 py-0.5 bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan rounded-sm font-bold uppercase tracking-wider">
           Sys_Admin
         </span>
      </div>
      
      <div className="space-y-6">
        {/* SECTION 1: OFFENSIVE TARGETING & EXECUTION */}
        <section className="p-3.5 bg-void/30 border border-border/40 rounded-md space-y-3.5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-state-danger/70 animate-pulse" />
          <div className="flex items-center justify-between pl-1">
            <span className="text-[8.5px] text-text-tertiary font-bold uppercase tracking-[0.15em]">01. Hostile Breach Vectors</span>
            <span className="text-[7.5px] font-mono text-state-danger-bright/70 uppercase tracking-widest font-bold">READY TO DEPLOY</span>
          </div>
          
          <div className="grid grid-cols-3 gap-1.5 pl-1">
            {attackTypes.map((a) => (
               <button
                key={a.type}
                onClick={() => setSelectedAttack(a.type)}
                className={cn(
                  "precision-button py-2 flex flex-col items-center justify-center transition-all duration-200 text-center relative rounded-sm cursor-pointer border border-border/30",
                  selectedAttack === a.type 
                    ? "border-state-danger/60 text-state-danger-bright bg-state-danger/10 shadow-[inner_0_0_8px_rgba(239,68,68,0.15)]" 
                    : "text-text-secondary hover:text-text-primary hover:border-border-bright/30"
                )}
              >
                <span className="text-[9.5px] font-bold">{a.label}</span>
                <span className="text-[6.5px] font-mono tracking-tight opacity-50 uppercase mt-0.5">{a.desc}</span>
              </button>
            ))}
          </div>

          <div className="bg-void/65 p-2.5 border border-border/40 rounded-sm pl-1.5">
             <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Gauge size={11} className="text-text-tertiary" />
                  <span className="text-[8px] text-text-secondary font-bold uppercase tracking-wider">Payload Magnitude</span>
                </div>
                <span className="text-[10px] text-state-danger-bright font-mono font-bold">{(intensity * 100).toFixed(0)}%</span>
             </div>
             <div className="relative flex items-center h-4">
               <input 
                 type="range" 
                 min="0.1" 
                 max="1.0" 
                 step="0.05" 
                 value={intensity} 
                 onChange={(e) => setIntensity(parseFloat(e.target.value))}
                 className="w-full h-1 bg-border/40 rounded-full appearance-none cursor-pointer accent-state-danger focus:outline-none"
               />
             </div>
          </div>

          {isRestrictedRole ? (
            <div className="bg-state-warning/10 border border-state-warning/30 p-3 rounded-sm text-[10px] space-y-2.5 font-mono">
              <div className="flex gap-2 items-center text-state-warning font-extrabold uppercase tracking-wider">
                <AlertTriangle size={12} className="text-state-warning animate-pulse" />
                <span>RESTRICTED WRITE BOUNDARY WARNING</span>
              </div>
              <p className="text-[8.5px] text-text-secondary leading-normal uppercase">
                Clearance authorization level [{operatorRole.toUpperCase()}] limits breach triggers. Access token (RBAC) active.
              </p>
              <button
                type="button"
                onClick={handleRequestElevate}
                disabled={isEscalating}
                className="w-full text-center py-2 bg-state-warning text-void font-extrabold rounded-sm text-[9px] uppercase tracking-wider transition-all hover:bg-white hover:text-void cursor-pointer"
              >
                {isEscalating ? 'CRACKING SYSTEM CRYPTO KEY...' : 'BYPASS RESTRICTIONS (ELEVATE)'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                if (selectedAttack) {
                  onLaunchAttack(selectedAttack, targetNodeId || undefined, intensity, targetIdentityId || undefined);
                  triggerActionFeedback('strike');
                }
              }}
              disabled={!selectedAttack}
              className={cn(
                "w-full h-11 font-bold text-[11px] tracking-[0.2em] transition-all duration-350 flex flex-col items-center justify-center relative overflow-hidden rounded-sm cursor-pointer",
                selectedAttack 
                  ? "bg-state-danger text-white font-inter font-extrabold active:scale-[0.98] hover:bg-state-danger/85 shadow-md shadow-state-danger/10" 
                  : "bg-void/40 text-text-tertiary cursor-not-allowed border border-border/30"
              )}
            >
              <div className="flex items-center gap-1.5 relative z-10 font-black">
                <Zap size={13} fill="currentColor" />
                <span>
                  {targetIdentityId 
                    ? `Execute on Identity [${targetIdentityId.slice(0, 10)}]` 
                    : targetNodeId 
                      ? `Execute on Node [${targetNodeId.slice(0, 10)}]` 
                      : 'Launch Combat Strike'}
                </span>
              </div>
            </button>
          )}
        </section>

        {/* SECTION 2: CONSTANT CYBER DEFENSES / COUNTERMEASURES */}
        <section className="p-3.5 bg-void/30 border border-border/40 rounded-md space-y-3">
          <div className="flex items-center justify-between">
             <span className="text-[8.5px] text-text-tertiary font-bold uppercase tracking-[0.15em]">02. Countermeasure Modules</span>
             <span className="text-[7.5px] font-mono text-accent-cyan/60 uppercase font-bold tracking-wider">SECURE GRID FEED</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {defenseModules.map(module => {
               const isActive = activeDefenseModules.includes(module.id);
               const isJustToggled = lastToggled === module.id;
                return (
                 <button
                  key={module.id}
                  onClick={() => handleDefenseToggle(module.id)}
                  className={cn(
                    "precision-button py-2 px-2.5 flex items-center justify-between group transition-all duration-300 relative rounded-sm cursor-pointer border border-border/30",
                    isActive
                      ? "border-accent-cyan/50 text-accent-cyan bg-accent-cyan/5"
                      : "text-text-secondary hover:text-text-primary hover:border-border-bright/20",
                    isJustToggled && "border-white bg-white/5"
                  )}
                 >
                   <div className="flex items-center gap-2 relative z-10 text-left min-w-0">
                     {isActive ? (
                       <ShieldCheck size={11} className="text-accent-cyan shrink-0" />
                     ) : (
                       <Shield size={11} className="text-text-tertiary/50 shrink-0" />
                     )}
                     <div className="flex flex-col min-w-0">
                       <span className="text-[9px] font-bold tracking-wide uppercase truncate">{module.label}</span>
                       <span className="text-[6px] opacity-40 font-mono tracking-tight truncate uppercase leading-none">{module.desc}</span>
                     </div>
                   </div>
                   <div className={cn(
                     "w-1.5 h-1.5 rounded-full transition-all duration-700 shrink-0 ml-1.5",
                     isActive ? "bg-accent-cyan shadow-[0_0_8px_#00f2ff]" : "bg-text-tertiary/10"
                   )} />
                 </button>
               );
            })}
          </div>
        </section>

        {/* SECTION 3: DE-CLUTTERED WORKSPACE CALIBRATIONS (TABBED OVERLAY) */}
        <section className="p-3.5 bg-void/30 border border-border/40 rounded-md space-y-3">
          {/* Section tab header switcher */}
          <div className="flex items-center justify-between border-b border-border/30 pb-2">
            <span className="text-[8.5px] text-text-tertiary font-bold uppercase tracking-[0.15em]">03. Calibrator Panel</span>
            <div className="flex bg-void/80 p-0.5 rounded-sm border border-border/45">
              <button 
                onClick={() => setActiveTab('regional')}
                className={cn(
                  "px-2 py-0.5 text-[7px] font-mono font-bold tracking-widest uppercase rounded-sm cursor-pointer",
                  activeTab === 'regional' ? "bg-accent-blue/20 text-accent-blue border border-accent-blue/20" : "text-text-secondary"
                )}
              >
                Region
              </button>
              <button 
                onClick={() => setActiveTab('target')}
                className={cn(
                  "px-2 py-0.5 text-[7px] font-mono font-bold tracking-widest uppercase rounded-sm cursor-pointer",
                  activeTab === 'target' ? "bg-accent-cyan/25 text-accent-cyan border border-accent-cyan/25" : "text-text-secondary"
                )}
              >
                Targets
              </button>
            </div>
          </div>

          <div className="min-h-[140px]">
            {activeTab === 'regional' ? (
              <div className="space-y-3.5 animate-fadeIn">
                {/* Zone Vulnerability Tune */}
                <div className="bg-void/45 p-2 rounded-sm border border-border/35">
                  <div className="flex justify-between items-center mb-1 pr-0.5">
                     <span className="text-[8px] text-text-secondary font-bold uppercase tracking-wider">
                       {selectedZone ? `Zone_Flux: ${selectedZone}` : 'Global Subnet Flux'}
                     </span>
                     <span className="text-[10px] text-accent-blue font-mono font-get font-bold">{(vulnValue * 100).toFixed(0)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.0" 
                    max="1.0" 
                    step="0.05" 
                    value={vulnValue} 
                    onChange={(e) => setVulnValue(parseFloat(e.target.value))}
                    className="w-full h-1 bg-void/80 rounded-lg appearance-none cursor-pointer accent-accent-blue"
                  />
                  <div className="grid grid-cols-4 gap-1 mt-2.5">
                     {zones.map(z => (
                      <button
                         key={z.type}
                         onClick={() => {
                           setSelectedZone(z.type);
                           onUpdateZoneVulnerability(z.type, vulnValue);
                           triggerActionFeedback(`zone-${z.type}`);
                         }}
                         className={cn(
                           "py-1.5 text-[7.5px] tracking-tight font-mono font-bold transition-all border border-border/30 rounded-sm cursor-pointer",
                           selectedZone === z.type ? "border-accent-blue text-accent-blue bg-accent-blue/10" : "text-text-tertiary hover:text-text-secondary"
                         )}
                        >
                          {z.label}
                        </button>
                     ))}
                  </div>
                </div>

                {/* Spread Intensity Slider */}
                <div className="bg-void/45 p-2 rounded-sm border border-border/35 pr-0.5">
                   <div className="flex justify-between items-center mb-1">
                      <span className="text-[8px] text-text-secondary font-bold uppercase tracking-wider">Contagion Spread Intensity</span>
                      <span className="text-[10px] text-accent-cyan font-mono font-bold">{spreadVelocity?.toFixed(1)}x</span>
                   </div>
                   <input 
                     type="range" 
                     min="0.1" 
                     max="3.0" 
                     step="0.1" 
                     value={spreadVelocity || 1.0} 
                     onChange={(e) => onSetSpreadVelocity(parseFloat(e.target.value))}
                     className="w-full h-1 bg-void/80 rounded-lg appearance-none cursor-pointer accent-accent-cyan"
                   />
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 animate-fadeIn">
                {/* Specific Node & IAM Targeting Dropdowns */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-[7.5px] text-text-tertiary font-bold uppercase tracking-widest pl-0.5">Anchor Asset</span>
                    <select 
                      value={targetNodeId}
                      onChange={(e) => handleNodeSelect(e.target.value)}
                      className="w-full bg-void border border-border/50 py-1 px-1.5 text-[8.5px] font-mono text-text-primary focus:outline-none focus:border-accent-cyan/50 uppercase rounded-sm"
                    >
                      <option value="">No Target</option>
                      {nodes.map(n => (
                        <option key={n.id} value={n.id}>{n.label.substring(0, 12)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[7.5px] text-text-tertiary font-bold uppercase tracking-widest pl-0.5">Active IAM Identity</span>
                    <select 
                      value={targetIdentityId}
                      onChange={(e) => setTargetIdentityId(e.target.value)}
                      className="w-full bg-void border border-border/50 py-1 px-1.5 text-[8.5px] font-mono text-text-primary focus:outline-none focus:border-accent-cyan/50 uppercase rounded-sm"
                    >
                      <option value="">No Identity</option>
                      {identities.map(i => (
                        <option key={i.id} value={i.id}>{i.name.substring(0, 12)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Target Node Exposure Slider */}
                <div className="bg-void/45 p-2 rounded-sm border border-border/35">
                  <div className="flex justify-between items-center mb-1 pr-0.5">
                     <span className="text-[8px] text-text-secondary font-bold uppercase tracking-wider">Anchor Vuln Exposure</span>
                     <span className="text-[10px] text-accent-cyan font-mono font-bold">{(nodeVulnValue * 100).toFixed(0)}%</span>
                  </div>
                  <input 
                     type="range" 
                     min="0.0" 
                     max="1.0" 
                     step="0.05" 
                     value={nodeVulnValue} 
                     onChange={(e) => {
                       const val = parseFloat(e.target.value);
                       setNodeVulnValue(val);
                       onHighlightNode?.(targetNodeId);
                     }}
                     onBlur={() => onHighlightNode?.(null)}
                     className="w-full h-1 bg-void/80 rounded-lg appearance-none cursor-pointer accent-accent-cyan"
                  />
                  
                  {targetNodeId && (
                    <button
                      onClick={() => {
                        onUpdateNodeVulnerability(targetNodeId, nodeVulnValue);
                        triggerActionFeedback('target-calibrate');
                      }}
                      className="w-full py-1.5 mt-2.5 text-[8px] uppercase tracking-widest font-mono font-black border border-accent-cyan/35 text-accent-cyan hover:bg-accent-cyan/5 transition-all text-center rounded-sm cursor-pointer"
                    >
                      Apply Vuln Override to Asset
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 4: EMERGENCY COMMANDS & STATE SYNCHRONIZATION */}
        <section className="p-3.5 bg-void/30 border border-border/40 rounded-md space-y-3">
          <div className="flex items-center justify-between">
             <span className="text-[8.5px] text-text-tertiary font-bold uppercase tracking-[0.15em]">04. Engine Lifecycle</span>
             <span className="text-[7.5px] font-mono text-state-warning/60 uppercase font-bold tracking-wider">AUTHORITY LEVEL 4</span>
          </div>
          
          <div className="grid grid-cols-3 gap-1.5">
             {/* THE RESUME/PAUSE BUTTON */}
             <button
               onClick={() => {
                 onToggleSimulation();
                 triggerActionFeedback('simulation-toggle');
               }}
               className={cn(
                 "h-12 flex flex-col items-center justify-center gap-1 text-center p-1 cursor-pointer select-none rounded-sm border",
                 isSimulating 
                   ? "border-state-warning/30 text-state-warning hover:bg-state-warning/5 bg-state-warning/[0.02]" 
                   : "border-state-safe/50 text-state-safe bg-state-safe/10 animate-pulse-precision hover:bg-state-safe/20"
               )}
             >
               {isSimulating ? <ShieldAlert size={14} /> : <Zap size={14} />}
               <div className="flex flex-col">
                 <span className="text-[8px] font-bold tracking-tight uppercase leading-none">{isSimulating ? 'PAUSE ENGINE' : 'RESUME ENGINE'}</span>
                 <span className="text-[6px] opacity-50 font-mono scale-[0.9] mt-0.5 lowercase">{isSimulating ? 'halt cycles' : 'trigger feeds'}</span>
               </div>
             </button>

             {/* GLOBAL ALL SYNC */}
             <button
               onClick={() => {
                 nodes.forEach(n => onUpdateNodeVulnerability(n.id, vulnValue));
                 setSelectedZone(null);
                 triggerActionFeedback('global-sync');
               }}
               className={cn(
                 "h-12 flex flex-col items-center justify-center gap-1 text-center p-1 border-accent-blue/30 text-accent-blue hover:bg-accent-blue/10 transition-all rounded-sm border cursor-pointer",
                 activeActions['global-sync'] && "bg-accent-blue text-white"
               )}
             >
               <Activity size={14} />
               <div className="flex flex-col">
                 <span className="text-[8px] font-bold tracking-tight uppercase leading-none">GLOBAL SYNC</span>
                 <span className="text-[6px] opacity-50 font-mono scale-[0.9] mt-0.5 lowercase">align nodes</span>
               </div>
             </button>

             {/* REBOOT PURGE */}
             <button
               onClick={() => {
                 onReset();
                 triggerActionFeedback('emergency-reset');
               }}
               className={cn(
                 "h-12 flex flex-col items-center justify-center gap-1 text-center p-1 border-state-danger/40 text-state-danger hover:bg-state-danger/10 group transition-all rounded-sm border cursor-pointer",
                 activeActions['emergency-reset'] && "bg-state-danger text-white uppercase"
               )}
             >
               <RotateCcw size={14} className="group-hover:rotate-[-45deg] transition-transform" />
               <div className="flex flex-col">
                 <span className="text-[8px] font-bold tracking-tight uppercase leading-none">SYSTEM FLUSH</span>
                 <span className="text-[6px] opacity-50 font-mono scale-[0.9] mt-0.5 lowercase">clean buffer</span>
               </div>
             </button>
          </div>
        </section>

        {/* SECTION 5: FIELD ATTACK CAMPAIGNS (PRESETS) */}
        <section className="p-3.5 bg-void/30 border border-border/40 rounded-md space-y-3">
          <div className="flex items-center justify-between">
             <span className="text-[8.5px] text-text-tertiary font-bold uppercase tracking-[0.15em]">05. Campaign Playbooks</span>
          </div>
          
          <div className="grid grid-cols-3 gap-1.5">
             {scenarios.map(s => (
               <button
                 key={s.id}
                 onClick={() => {
                   onLaunchScenario(s.id);
                   triggerActionFeedback(`scenario-${s.id}`);
                 }}
                 className="precision-button p-2 flex flex-col items-center justify-center gap-1 text-center min-h-[50px] cursor-pointer rounded-sm border border-border/40 hover:border-border-bright/20 transition-all"
               >
                 <Bug size={13} className="text-text-tertiary group-hover:text-text-primary" />
                 <span className="text-[8px] font-bold tracking-tight leading-none text-white">{s.label.split(' ')[0]}</span>
                 <span className="text-[6px] font-mono opacity-40 scale-[0.9] leading-none mt-0.5 uppercase truncate w-full">{s.desc}</span>
               </button>
             ))}
          </div>
        </section>

        {/* SECTION 6: TELEMETRY INJECT PIPELINE PILLS (Compact & Tight) */}
        <section className="p-3.5 bg-void/30 border border-border/40 rounded-md space-y-3">
          <div className="flex items-center justify-between">
             <span className="text-[8.5px] text-text-tertiary font-bold uppercase tracking-[0.15em]">06. Telemetry Ingress Feeds</span>
             <span className="text-[7.5px] font-mono text-accent-cyan/55 uppercase font-bold tracking-wider">PIPELINE DIRECT</span>
          </div>
          
          <div className="grid grid-cols-2 gap-1.5">
             <button
               onClick={async () => {
                 try {
                   const target = targetNodeId || 'pc-admin-hq';
                   const response = await fetch('/api/v1/telemetry/wazuh', {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({
                       timestamp: new Date().toISOString(),
                       rule: { id: "100201", level: 10, description: "Wazuh SIEM alert: privilege escalation suspicious code run in powershell.exe" },
                       agent: { name: target },
                       data: { srcip: "185.220.101.5", user: "administrator", process: "powershell" }
                     })
                   });
                   if (response.ok) {
                     triggerActionFeedback('wazuh-trigger');
                   }
                 } catch (err) {
                   console.error('Wazuh ingest trigger error', err);
                 }
               }}
               className={cn(
                 "py-1.5 flex items-center justify-center gap-1.5 text-center px-1.5 text-[8.5px] tracking-wide font-bold transition-all border border-border/45 rounded-sm hover:bg-accent-cyan/5 cursor-pointer text-text-secondary hover:text-text-primary",
                 activeActions['wazuh-trigger'] && "bg-accent-cyan text-void border-accent-cyan font-black"
               )}
             >
               <Radio size={11} className="shrink-0" />
               Ingest Wazuh
             </button>

             <button
               onClick={async () => {
                 try {
                   const target = targetNodeId || 'N_MAIN_CLUSTER_DB_01';
                   const response = await fetch('/api/v1/telemetry/falco', {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({
                       output: `12:05:33.109312389 Critical Falco alert: File integrity check compromise, unauthorized shadow swap by service account`,
                       priority: "Critical",
                       source: "syscall",
                       tags: ["host-ops", "container-escape"],
                       hostname: target
                     })
                   });
                   if (response.ok) {
                     triggerActionFeedback('falco-trigger');
                   }
                 } catch (err) {
                   console.error('Falco ingest trigger error', err);
                 }
               }}
               className={cn(
                 "py-1.5 flex items-center justify-center gap-1.5 text-center px-1.5 text-[8.5px] tracking-wide font-bold transition-all border border-border/45 rounded-sm hover:bg-accent-cyan/5 cursor-pointer text-text-secondary hover:text-text-primary",
                 activeActions['falco-trigger'] && "bg-accent-cyan text-void border-accent-cyan font-black"
               )}
             >
               <Radio size={11} className="shrink-0 animate-pulse" />
               Ingest Falco
             </button>
          </div>
        </section>
      </div>
    </div>
  );
}

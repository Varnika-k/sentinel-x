import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Shield, Key, AlertTriangle, ChevronRight, Activity, 
  Database, Lock, Globe, Server, CheckCircle, XCircle, 
  LockKeyhole, Terminal, RefreshCw, Layers, Fingerprint, MapPin
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Align with backend UserIdentity, UserSession, and SuspiciousMovement
interface UserIdentity {
  username: string;
  email: string;
  department: string;
  privilegeLevel: 'none' | 'low' | 'medium' | 'high' | 'root_admin';
  baseTrustScore: number;
  currentTrustScore: number;
  riskScore: number;
  insiderThreatConfidence: number;
  activeSessionsCount: number;
  lastActive: string;
  isQuarantined: boolean;
  behavioralAnomalyScore: number;
  complianceViolationsCount: number;
}

interface UserSession {
  sessionId: string;
  username: string;
  startedAt: string;
  ipAddress: string;
  userAgent: string;
  currentNodeId: string;
  tokenValidity: string;
  isCompromised: boolean;
  actionSequence: Array<{
    timestamp: string;
    actionType: string;
    targetAsset: string;
    severity: string;
    zeroTrustVerified: boolean;
  }>;
}

interface SuspiciousMovement {
  movementId: string;
  username: string;
  sessionId: string;
  timestamp: string;
  sourceNodeId: string;
  targetNodeId: string;
  anomalyType: string;
  severity: string;
  mitreTechnique: string;
}

interface SensitiveAudit {
  auditId: string;
  username: string;
  assetNodeId: string;
  timestamp: string;
  classification: string;
  accessResponse: string;
  contextualMultiplier: number;
}

export function IdentityIntelligence() {
  const [identities, setIdentities] = useState<UserIdentity[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('admin-alpha');
  const [userDetails, setUserDetails] = useState<{
    identity: UserIdentity | null;
    sessions: UserSession[];
    incidentDetail: any;
    movements: SuspiciousMovement[];
  }>({ identity: null, sessions: [], incidentDetail: null, movements: [] });

  const [audits, setAudits] = useState<SensitiveAudit[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'tracer' | 'simulator'>('users');
  const [loading, setLoading] = useState(false);

  // Simulation form states
  const [targetNode, setTargetNode] = useState('db-core-master');
  const [actionType, setActionType] = useState('Read Database Crypt');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [bytesVal, setBytesVal] = useState(512000); // Bytes transferred

  const [simulationResult, setSimulationResult] = useState<{
    success: boolean;
    isApproved: boolean;
    verificationLog: string;
    identity: UserIdentity | null;
    incidentReport: any;
  } | null>(null);

  // Available assets list to assert simulation against
  const systemAssets = [
    { id: 'db-core-master', label: 'db-core-master (Critical Crypt Data)', zone: 'DATA_CORE' },
    { id: 'k8s-pod-auth-api-559b', label: 'k8s-pod-auth-api-559b (IAM Router)', zone: 'IDENTITY' },
    { id: 'k8s-pod-payment-gw-88c2', label: 'k8s-pod-payment-gw-88c2 (PCI Ingress)', zone: 'PRODUCTION' },
    { id: 'pc-admin-hq', label: 'pc-admin-hq (Corporate HQ Segment)', zone: 'PERIMETER' },
    { id: 'aws-s3-compliance-bucket', label: 'aws-s3-compliance-bucket (Archival Vault)', zone: 'CLOUD' }
  ];

  const actionsSet = [
    'Read Database Crypt',
    'Write Database Records',
    'Modify Security Policy',
    'Execute Shell Ingress',
    'Renew Auth Token',
    'Dump Credentials Data'
  ];

  // Fetch initial identities list
  const fetchIdentities = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/identity/users');
      const data = await res.json();
      if (data.success && data.users) {
        setIdentities(data.users);
      }
    } catch (err) {
      console.error('Failed to load identities from API', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch detailed user metrics
  const fetchUserDetails = async (username: string) => {
    try {
      const res = await fetch(`/api/v1/identity/users/${username}`);
      const data = await res.json();
      if (data.success) {
        setUserDetails({
          identity: data.identity,
          sessions: data.sessions || [],
          incidentDetail: data.incidentDetail || null,
          movements: data.movements || []
        });
      }
    } catch (err) {
      console.error(`Failed to load detailed profile for ${username}`, err);
    }
  };

  // Fetch global sensitive access logs
  const fetchAudits = async () => {
    try {
      const res = await fetch('/api/v1/identity/audits');
      const data = await res.json();
      if (data.success && data.audits) {
        setAudits(data.audits);
      }
    } catch (err) {
      console.error('Failed to load secure audits', err);
    }
  };

  useEffect(() => {
    fetchIdentities();
    fetchAudits();

    // Setup active poll of secure metrics to stay live
    const pollInterval = setInterval(() => {
      fetchIdentities();
      fetchAudits();
      if (selectedUser) {
        fetchUserDetails(selectedUser);
      }
    }, 4000);

    return () => clearInterval(pollInterval);
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchUserDetails(selectedUser);
    }
  }, [selectedUser]);

  // Handle access simulation submission
  const handleAssertSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch('/api/v1/identity/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: selectedUser,
          currentAssetNodeId: targetNode,
          actionType,
          actionSeverity: severity,
          dataBytes: bytesVal
        })
      });
      const data = await res.json();
      if (data.success) {
        setSimulationResult({
          success: true,
          isApproved: data.isApproved,
          verificationLog: data.verificationLog,
          identity: data.identity,
          incidentReport: data.incidentReport
        });
        // Immediately refresh states
        fetchIdentities();
        fetchUserDetails(selectedUser);
        fetchAudits();
      }
    } catch (err) {
      console.error('Simulation asset assertion failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-void/50 border border-border/40 rounded-xl overflow-hidden backdrop-blur-md relative">
      
      {/* Top Header Controls */}
      <div className="flex items-center justify-between border-b border-border/20 bg-void/80 px-4 py-2 shrink-0">
        <div className="flex items-center gap-2">
          <Fingerprint className="text-accent-cyan w-5 h-5 shadow-[0_0_8px_#00ffc4]" />
          <div>
            <h2 className="text-white text-xs font-bold uppercase tracking-widest leading-none">Identity Intelligence</h2>
            <span className="text-[9px] text-text-tertiary">Zero-Trust Continuous Verification Cockpit</span>
          </div>
        </div>
        <button 
          onClick={() => { fetchIdentities(); fetchAudits(); }}
          className="p-1 hover:bg-white/5 rounded border border-white/5 transition-all text-text-secondary hover:text-white"
          title="Reload metrics"
        >
          <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
        </button>
      </div>

      {/* Primary Tab Bar */}
      <div className="flex border-b border-border/10 bg-void/30 shrink-0 text-center">
        <button 
          onClick={() => setActiveTab('users')}
          className={cn(
            "flex-1 py-2.5 text-[9px] font-bold tracking-widest border-b uppercase transition-all flex items-center justify-center gap-1.5",
            activeTab === 'users' ? "border-accent-cyan text-accent-cyan bg-accent-cyan/5" : "border-transparent text-text-secondary hover:text-white hover:bg-white/5"
          )}
        >
          <Users className="w-3.5 h-3.5" />
          DIRECTIONS & ROLES
        </button>
        <button 
          onClick={() => setActiveTab('tracer')}
          className={cn(
            "flex-1 py-2.5 text-[9px] font-bold tracking-widest border-b uppercase transition-all flex items-center justify-center gap-1.5",
            activeTab === 'tracer' ? "border-accent-cyan text-accent-cyan bg-accent-cyan/5" : "border-transparent text-text-secondary hover:text-white hover:bg-white/5"
          )}
        >
          <Layers className="w-3.5 h-3.5" />
          LATERAL FLIGHT TRACER
        </button>
        <button 
          onClick={() => setActiveTab('simulator')}
          className={cn(
            "flex-1 py-2.5 text-[9px] font-bold tracking-widest border-b uppercase transition-all flex items-center justify-center gap-1.5",
            activeTab === 'simulator' ? "border-accent-cyan text-accent-cyan bg-accent-cyan/5" : "border-transparent text-text-secondary hover:text-white hover:bg-white/5"
          )}
        >
          <LockKeyhole className="w-3.5 h-3.5" />
          ZERO-TRUST ENFORCER
        </button>
      </div>

      {/* Scrollable Work Workspace Body */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
        
        {activeTab === 'users' && (
          <div className="space-y-4">
            
            {/* Identity Grid Selection List */}
            <div className="space-y-2">
              <span className="text-[9px] text-text-tertiary uppercase font-mono block tracking-widest">Active Directory Scoped Identities</span>
              <div className="grid grid-cols-1 gap-2">
                {identities.map(user => (
                  <button
                    key={user.username}
                    onClick={() => setSelectedUser(user.username)}
                    className={cn(
                      "p-2.5 rounded-lg border text-left flex items-center justify-between transition-all relative overflow-hidden group",
                      selectedUser === user.username
                        ? "bg-accent-cyan/10 border-accent-cyan/50 shadow-[0_0_12px_rgba(0,196,255,0.08)]"
                        : "bg-black/30 border-white/5 hover:border-white/15"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] uppercase",
                        user.isQuarantined ? "bg-rose-950/40 border border-rose-500 text-rose-400 animate-pulse" :
                        user.privilegeLevel === 'root_admin' ? "bg-amber-950/40 border border-amber-500 text-amber-400" : "bg-cyan-950/40 border border-cyan-500 text-cyan-400"
                      )}>
                        {user.username.charAt(0)}
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-white uppercase flex items-center gap-1.5">
                          {user.username}
                          {user.isQuarantined && (
                            <span className="px-1 text-[7px] bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded font-normal shrink-0">QUARANTINED</span>
                          )}
                        </div>
                        <span className="text-[8px] text-text-tertiary uppercase italic block">{user.department} &bull; clearance_L{user.privilegeLevel === 'root_admin' ? '5_ROOT' : '3'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span className="text-[8px] text-text-tertiary uppercase block">Zero-Trust</span>
                        <span className={cn(
                          "text-xs font-bold font-mono",
                          user.currentTrustScore < 40 ? "text-rose-400" : user.currentTrustScore < 70 ? "text-amber-400" : "text-emerald-400"
                        )}>{user.currentTrustScore}%</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-text-tertiary uppercase block">Ins_Threat</span>
                        <span className={cn(
                          "text-xs font-bold font-mono",
                          user.insiderThreatConfidence > 75 ? "text-rose-400" : user.insiderThreatConfidence > 40 ? "text-amber-400" : "text-emerald-400"
                        )}>{user.insiderThreatConfidence}%</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected User Profiles Details */}
            {userDetails.identity && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-black/40 border border-white/5 rounded-lg space-y-3 relative z-10"
              >
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-[9px] font-bold text-accent-cyan uppercase tracking-wider font-mono flex items-center gap-1">
                    <Fingerprint className="w-3 h-3" />
                    Cognitive Identity Profile
                  </span>
                  <span className="text-[8px] text-text-tertiary font-mono">Synced IP: 10.150.12.44</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-white/[0.02] border border-white/5 rounded text-center">
                    <span className="text-[8.5px] text-text-tertiary uppercase block">Risk Score</span>
                    <span className={cn("text-sm font-bold font-mono block mt-0.5",
                      userDetails.identity.riskScore > 75 ? "text-rose-400" : userDetails.identity.riskScore > 40 ? "text-amber-400" : "text-emerald-400"
                    )}>{userDetails.identity.riskScore}/100</span>
                  </div>
                  <div className="p-2 bg-white/[0.02] border border-white/5 rounded text-center">
                    <span className="text-[8.5px] text-text-tertiary uppercase block">Anomaly Level</span>
                    <span className="text-xs font-bold text-white font-mono block mt-0.5">{userDetails.identity.behavioralAnomalyScore}%</span>
                  </div>
                  <div className="p-2 bg-white/[0.02] border border-white/5 rounded text-center">
                    <span className="text-[8.5px] text-text-tertiary uppercase block">Violations</span>
                    <span className="text-xs font-bold text-rose-400 font-mono block mt-0.5">{userDetails.identity.complianceViolationsCount} Alerts</span>
                  </div>
                </div>

                {/* Session Data */}
                {userDetails.sessions.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[8px] text-text-tertiary uppercase font-mono block tracking-wider">Active Federated Sessions ({userDetails.sessions.length})</span>
                    {userDetails.sessions.map(s => (
                      <div key={s.sessionId} className="p-2 bg-black/50 border border-white/5 rounded text-[9px] text-text-secondary font-mono space-y-1">
                        <div className="flex justify-between text-white text-[9.5px]">
                          <span className="font-bold flex items-center gap-1"><Server className="w-2.5 h-2.5 text-text-tertiary" /> {s.sessionId}</span>
                          <span className="text-emerald-400 text-[8.5px] uppercase">STATE_{s.tokenValidity === 'valid' ? 'TRUSTED' : 'EXPIRED'}</span>
                        </div>
                        <div className="flex justify-between opacity-75">
                          <span>Edge Node: <span className="text-white">{s.currentNodeId}</span></span>
                          <span>Source IP: {s.ipAddress}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
              </motion.div>
            )}
          </div>
        )}

        {activeTab === 'tracer' && (
          <div className="space-y-4">
            
            {/* Suspicious Movement Tracer */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-text-tertiary uppercase font-mono tracking-widest block">Active Lateral Hop Tracer</span>
                <span className="text-[8.5px] text-rose-400 font-mono">{userDetails.movements.length} Anomaly Jumps Found</span>
              </div>

              <div className="space-y-2">
                {userDetails.movements.map(m => (
                  <div key={m.movementId} className="p-2.5 bg-rose-950/20 border border-rose-500/20 rounded-md space-y-1.5 transition-all text-[9.5px]">
                    <div className="flex justify-between items-center text-white">
                      <span className="font-bold font-mono text-rose-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                        {m.anomalyType.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span className="px-1 text-[7.5px] bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono rounded select-none capitalize">{m.severity} severity</span>
                    </div>
                    
                    <div className="flex items-center gap-2 font-mono text-text-secondary text-[8.5px]">
                      <span className="px-1 py-0.5 bg-white/5 border border-white/10 rounded">{m.sourceNodeId}</span>
                      <ChevronRight className="w-3 h-3 text-text-tertiary" />
                      <span className="px-1 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded text-rose-300">{m.targetNodeId}</span>
                    </div>

                    <p className="text-[8.5px] text-text-tertiary leading-snug">Mapped MITRE Technique Framework alignment: <span className="text-white font-mono font-bold">{m.mitreTechnique}</span> detected lateral proxy tunnel hops during off-operating scheduled hours.</p>
                  </div>
                ))}
                
                {userDetails.movements.length === 0 && (
                  <div className="text-center py-6 text-text-tertiary border border-dashed border-white/5 rounded text-[10px] italic">
                    No abnormal network sector crossings identified for {selectedUser}.
                  </div>
                )}
              </div>
            </div>

            {/* Sensitive Data Crypt Audits */}
            <div className="space-y-2">
              <span className="text-[9px] text-text-tertiary uppercase font-mono tracking-widest block">Critical Zone Resource Audits</span>
              <div className="p-2 bg-black/30 border border-white/5 rounded-md text-[9px] font-mono space-y-2">
                {audits.map(a => (
                  <div key={a.auditId} className="flex justify-between items-start border-b border-white/[0.03] pb-1.5 last:border-0 last:pb-0">
                    <div className="space-y-0.5">
                      <div className="text-white text-[9.5px] flex items-center gap-1">
                        <Database className="w-2.5 h-2.5 text-accent-cyan" />
                        {a.assetNodeId}
                      </div>
                      <div className="text-text-tertiary text-[8px] uppercase">Asserted access by: <span className="text-white">{a.username}</span></div>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        "px-1 py-0.2 rounded text-[7.5px] font-bold block mb-0.5 uppercase",
                        a.accessResponse === 'allowed' ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                      )}>{a.accessResponse}</span>
                      <span className="text-[7.5px] text-text-tertiary block mt-0.5">Risk multiplier: {a.contextualMultiplier}x</span>
                    </div>
                  </div>
                ))}
                {audits.length === 0 && (
                  <div className="text-center py-4 text-text-tertiary text-[10px] italic">No sensitive crypt access recorded on dynamic network graph yet.</div>
                )}
              </div>
            </div>

          </div>
        )}

        {activeTab === 'simulator' && (
          <div className="space-y-4">
            
            {/* Interactive Zero-Trust Enforcer assertions */}
            <div className="p-3 bg-cyan-950/20 border border-accent-cyan/20 rounded-md space-y-3">
              <div className="flex items-center gap-1.5">
                <LockKeyhole className="text-accent-cyan w-4 h-4" />
                <h3 className="text-white text-[10px] font-bold tracking-widest uppercase">Assert Zero-Trust Access Claim</h3>
              </div>
              <p className="text-[8.5px] text-text-secondary leading-snug">Test continuous verification. Choose a user profile and target an action against any operational graph node to evaluate dynamic security thresholds.</p>

              <form onSubmit={handleAssertSimulation} className="space-y-3.5 text-[10px] font-mono">
                <div>
                  <label className="text-text-tertiary block mb-1">USER SUBJECT</label>
                  <select 
                    value={selectedUser} 
                    onChange={e => setSelectedUser(e.target.value)}
                    className="w-full bg-void border border-white/10 rounded px-2 py-1 text-white text-[10px] focus:outline-none focus:border-accent-cyan"
                  >
                    {identities.map(u => (
                      <option key={u.username} value={u.username}>{u.username} ({u.department.toUpperCase()})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-text-tertiary block mb-1">TARGET INFRASTRUCTURE ASSET</label>
                  <select
                    value={targetNode}
                    onChange={e => setTargetNode(e.target.value)}
                    className="w-full bg-void border border-white/10 rounded px-2 py-1 text-white text-[10px] focus:outline-none focus:border-accent-cyan"
                  >
                    {systemAssets.map(a => (
                      <option key={a.id} value={a.id}>{a.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-text-tertiary block mb-1">ACTION INTENT</label>
                    <select
                      value={actionType}
                      onChange={e => setActionType(e.target.value)}
                      className="w-full bg-void border border-white/10 rounded px-1.5 py-1 text-white text-[10px] focus:outline-none focus:border-accent-cyan"
                    >
                      {actionsSet.map(act => (
                        <option key={act} value={act}>{act}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-text-tertiary block mb-1">SEVERITY TIER</label>
                    <select
                      value={severity}
                      onChange={e => setSeverity(e.target.value as any)}
                      className="w-full bg-void border border-white/10 rounded px-1.5 py-1 text-white text-[10px] focus:outline-none focus:border-accent-cyan"
                    >
                      <option value="low">LOW SEVERITY</option>
                      <option value="medium">MEDIUM SEVERITY</option>
                      <option value="high">HIGH SEVERITY</option>
                      <option value="critical">CRITICAL SEVERITY</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-[8.5px] mb-1">
                    <span className="text-text-tertiary">LATERAL DATA SYNC SIZE</span>
                    <span className="text-accent-cyan">{Number((bytesVal / (1024 * 1024)).toFixed(1))} MB</span>
                  </div>
                  <input 
                    type="range" 
                    min={1024 * 1024} 
                    max={1024 * 1024 * 1024 * 2} 
                    value={bytesVal} 
                    onChange={e => setBytesVal(Number(e.target.value))}
                    className="w-full select-none h-1 bg-white/5 rounded-full appearance-none outline-none focus:outline-none accent-accent-cyan"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-1.5 bg-accent-cyan hover:bg-black/90 border border-accent-cyan text-void hover:text-accent-cyan rounded text-[10px] uppercase font-bold tracking-widest transition-all disabled:opacity-50"
                >
                  {loading ? 'ASSERTING ENFORCEMENT TIER...' : 'ASSERT ACCESS PERMISSION'}
                </button>
              </form>
            </div>

            {/* Simulation Assertion results */}
            <AnimatePresence>
              {simulationResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className={cn(
                    "p-3 rounded border text-[9.5px]",
                    simulationResult.isApproved ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-100" : "bg-rose-950/20 border-rose-500/20 text-rose-100"
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-2 border-b border-white/5 pb-1.5">
                    {simulationResult.isApproved ? (
                      <CheckCircle className="text-emerald-400 w-4 h-4 shrink-0" />
                    ) : (
                      <XCircle className="text-rose-400 w-4 h-4 shrink-0" />
                    )}
                    <span className="font-mono text-white text-[10px] font-bold uppercase tracking-wider">
                      Zero-Trust Decision: {simulationResult.isApproved ? "APPROVED" : "BLOCKED BY POLICY"}
                    </span>
                  </div>
                  
                  <p className="font-mono text-[9px] text-text-secondary leading-normal leading-relaxed">{simulationResult.verificationLog}</p>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        )}

      </div>
    </div>
  );
}

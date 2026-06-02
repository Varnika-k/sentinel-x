import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  Target, 
  Fingerprint, 
  Share2, 
  History, 
  ShieldCheck, 
  AlertOctagon,
  Zap,
  Layers,
  ChevronRight,
  Clock,
  TrendingUp,
  Globe,
  Database,
  Search,
  Activity,
  Shield,
  Send,
  Server,
  Lock,
  RefreshCw,
  Radio
} from 'lucide-react';
import { SimulationState } from '../../types/simulation';
import { AttackCampaign, MITREStage } from '../../types/intelligence';
import { cn } from '../../lib/utils';
import { telemetryBus } from '../../telemetry/bus';
import { TelemetryTopic } from '../../telemetry/schemas';

interface IntelligenceHubProps {
  state: SimulationState;
}

export function IntelligenceHub({ state }: IntelligenceHubProps) {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'actors' | 'baselines' | 'cloud_intel' | 'fusion' | 'copilot'>('campaigns');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  // Real-time Threat Fusion Core state
  const [fusionClusters, setFusionClusters] = useState<any[]>([]);
  const [fusionLoading, setFusionLoading] = useState(false);
  const [simulatingConvergence, setSimulatingConvergence] = useState(false);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);

  // Live Copilot & Enterprise Governance States
  const [copilotNodeId, setCopilotNodeId] = useState<string>('k8s-pod-auth-api-559b');
  const [copilotMetadata, setCopilotMetadata] = useState<any>(null);
  const [copilotStreamingText, setCopilotStreamingText] = useState<string>('');
  const [copilotLoading, setCopilotLoading] = useState<boolean>(false);
  const [copilotStreaming, setCopilotStreaming] = useState<boolean>(false);

  // Compliance & Governance matrix stores
  const [complianceMatrix, setComplianceMatrix] = useState<any>(null);
  const [governanceZones, setGovernanceZones] = useState<any>(null);
  const [governanceLoading, setGovernanceLoading] = useState<boolean>(false);

  const fetchFusionClusters = async () => {
    setFusionLoading(true);
    try {
      const res = await fetch('/api/v2/intelligence/fusion/clusters');
      const data = await res.json();
      if (Array.isArray(data)) {
        setFusionClusters(data);
      }
    } catch (e) {
      console.error('Failed to draw fusion clusters', e);
    } finally {
      setFusionLoading(false);
    }
  };

  const triggerConvergenceSimulation = async () => {
    setSimulatingConvergence(true);
    try {
      const res = await fetch('/api/v2/intelligence/fusion/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nodeId: 'pc-admin-hq' })
      });
      const data = await res.json();
      if (data.success) {
        await fetchFusionClusters();
        if (data.finalClusterState) {
          setSelectedClusterId(data.finalClusterState.id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSimulatingConvergence(false);
    }
  };

  useEffect(() => {
    fetchFusionClusters();

    // Live hook subscriptions to websocket updates fanned out over TelemetryBus FUSION_UPDATE topic
    const unsub = telemetryBus.subscribe(TelemetryTopic.FUSION_UPDATE, (envelope: any) => {
      const cluster = envelope.payload || envelope;
      setFusionClusters(prev => {
        const index = prev.findIndex(c => c.id === cluster.id);
        if (index > -1) {
          const next = [...prev];
          next[index] = cluster;
          return next;
        } else {
          return [cluster, ...prev];
        }
      });
    });

    return () => unsub();
  }, []);

  // Shodan & VT UI states
  const [shodanQueryIp, setShodanQueryIp] = useState('104.244.42.1');
  const [shodanResult, setShodanResult] = useState<any>(null);
  const [shodanLoading, setShodanLoading] = useState(false);

  const [vtQueryTarget, setVtQueryTarget] = useState('23.22.201.12');
  const [vtResult, setVtResult] = useState<any>(null);
  const [vtLoading, setVtLoading] = useState(false);

  const [cloudTrailLogs, setCloudTrailLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'cloud_intel' && cloudTrailLogs.length === 0) {
      loadAWSCloudTrail();
    }
  }, [activeTab]);

  const loadAWSCloudTrail = async () => {
    setLogsLoading(true);
    try {
      const res = await fetch('/api/v1/cloud/aws');
      const data = await res.json();
      if (Array.isArray(data)) {
        setCloudTrailLogs(data);
      }
    } catch (e) {
      console.error('Failed to load CloudTrail logs', e);
    } finally {
      setLogsLoading(false);
    }
  };

  const fetchGovernanceInfo = async () => {
    setGovernanceLoading(true);
    try {
      const readinessRes = await fetch('/api/v2/intelligence/governance/readiness');
      const readinessData = await readinessRes.json();
      setComplianceMatrix(readinessData);

      const zonesRes = await fetch('/api/v2/intelligence/governance/zones');
      const zonesData = await zonesRes.json();
      setGovernanceZones(zonesData);
    } catch (err) {
      console.error('Failed to load real-time cybersecurity compliance matrix indices', err);
    } finally {
      setGovernanceLoading(false);
    }
  };

  const triggerLiveCopilotInference = async (nodeId: string) => {
    setCopilotLoading(true);
    setCopilotStreaming(true);
    setCopilotStreamingText('ESTABLISHING SECURE CONNECTION TO COGNITIVE THREAT LOGIC CORE...\n');
    setCopilotMetadata(null);

    try {
      // 1. Fetch deep structured static values representation
      const metaRes = await fetch(`/api/v2/intelligence/ai/reasoning/${nodeId}`);
      if (metaRes.ok) {
        const metadata = await metaRes.json();
        setCopilotMetadata(metadata);
      }

      // 2. Stream real-time analytical narrative
      setCopilotStreamingText('');
      const streamUrl = `/api/v2/intelligence/ai/stream/${nodeId}`;
      const eventSource = new EventSource(streamUrl);

      eventSource.onmessage = (event) => {
        if (event.data === '[DONE]') {
          eventSource.close();
          setCopilotStreaming(false);
          fetchGovernanceInfo(); // update matrix
        } else {
          try {
            const parsed = JSON.parse(event.data);
            if (parsed.content) {
              setCopilotStreamingText((prev) => prev + parsed.content);
            } else if (parsed.error) {
              setCopilotStreamingText((prev) => prev + `\n[INFERENCE STREAM ABORTED: ${parsed.error}]\n`);
              eventSource.close();
              setCopilotStreaming(false);
            }
          } catch (err) {
            // Raw append as fallback
            setCopilotStreamingText((prev) => prev + event.data);
          }
        }
      };

      eventSource.onerror = (err) => {
        console.error('Copilot Stream Connection Interrupted', err);
        eventSource.close();
        setCopilotStreaming(false);
      };

    } catch (err) {
      console.error(err);
      setCopilotStreamingText('CRITICAL: CONNECTION TIMEOUT TO SENTINELX INFRA COGNITIVE AGENT ENGINE.');
      setCopilotStreaming(false);
    } finally {
      setCopilotLoading(false);
    }
  };

  const executeSimulatedQuarantineAction = async (nodeId: string) => {
    try {
      const res = await fetch('/api/v2/intelligence/governance/quarantine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nodeId })
      });
      if (res.ok) {
        // Success, reload indicators
        fetchGovernanceInfo();
        triggerLiveCopilotInference(nodeId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'copilot') {
      fetchGovernanceInfo();
      triggerLiveCopilotInference(copilotNodeId);
    }
  }, [activeTab]);

  const handleQueryShodan = async () => {
    setShodanLoading(true);
    try {
      const res = await fetch(`/api/v1/cloud/shodan?ip=${shodanQueryIp}`);
      const data = await res.json();
      setShodanResult(data);
    } catch (e) {
      console.error(e);
      setShodanResult({ error: 'Query failed' });
    } finally {
      setShodanLoading(false);
    }
  };

  const handleQueryVT = async () => {
    setVtLoading(true);
    try {
      const res = await fetch(`/api/v1/cloud/virustotal?target=${vtQueryTarget}`);
      const data = await res.json();
      setVtResult(data);
    } catch (e) {
      console.error(e);
      setVtResult({ error: 'Query failed' });
    } finally {
      setVtLoading(false);
    }
  };

  const campaigns = state.knowledgeBase.campaigns;
  const selectedCampaign = useMemo(() => 
    campaigns.find(c => c.id === selectedCampaignId),
    [campaigns, selectedCampaignId]
  );

  return (
    <div className="flex flex-col h-full bg-void/40 border border-white/10 rounded-xl overflow-hidden backdrop-blur-xl">
      {/* Engine Status Bar */}
      <div className="bg-void/80 px-4 py-2 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-3 h-3 text-accent-cyan animate-pulse" />
          <span className="text-[10px] font-bold tracking-widest text-white/50 uppercase">Knowledge_Engine_v4.2</span>
        </div>
        <div className="flex items-center gap-4">
          <StatMini label="CORRELATED" value={campaigns.length} color="text-accent-cyan" />
          <StatMini label="THREAT_VECTORS" value={state.knowledgeBase.actors.length} color="text-state-danger" />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex border-b border-white/5 bg-black/20">
        <TabButton active={activeTab === 'campaigns'} onClick={() => setActiveTab('campaigns')} icon={Target} label="CAMPAIGNS" />
        <TabButton active={activeTab === 'actors'} onClick={() => setActiveTab('actors')} icon={Fingerprint} label="ACTORS" />
        <TabButton active={activeTab === 'baselines'} onClick={() => setActiveTab('baselines')} icon={Layers} label="BASELINES" />
        <TabButton active={activeTab === 'cloud_intel'} onClick={() => setActiveTab('cloud_intel')} icon={Globe} label="CLOUD" />
        <TabButton active={activeTab === 'fusion'} onClick={() => setActiveTab('fusion')} icon={Brain} label="FUSION" />
        <TabButton active={activeTab === 'copilot'} onClick={() => setActiveTab('copilot')} icon={ShieldCheck} label="AI COPILOT" />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'campaigns' && (
            <motion.div 
              key="campaigns"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              {campaigns.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center opacity-30">
                  <Share2 className="w-12 h-12 mb-4" />
                  <p className="text-xs uppercase font-bold tracking-widest">No Active Campaigns Detected</p>
                  <p className="text-[10px] mt-2">Correlation engine awaiting telemetry...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {campaigns.map(campaign => (
                    <CampaignCard 
                      key={campaign.id} 
                      campaign={campaign} 
                      selected={selectedCampaignId === campaign.id}
                      onClick={() => setSelectedCampaignId(campaign.id)}
                    />
                  ))}
                </div>
              )}

              {selectedCampaign && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-accent-cyan/5 border border-accent-cyan/20 rounded-lg space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-xs font-black text-accent-cyan tracking-tighter uppercase italic">{selectedCampaign.title} Reconstruction</h3>
                    <div className="text-[10px] font-mono text-white/40">ID_{selectedCampaign.id.slice(0, 8)}</div>
                  </div>

                  {/* MITRE ATT&CK Stages */}
                  <div className="space-y-2">
                    <span className="text-[8px] text-text-secondary uppercase font-bold tracking-widest">Kill_Chain_Reconstruction</span>
                    <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
                      {selectedCampaign.stages.map((stage, idx) => (
                        <div key={stage} className="flex items-center gap-1 shrink-0">
                          <div className="px-2 py-1 bg-void/60 border border-accent-cyan/30 rounded text-[9px] font-mono text-accent-cyan">
                            {stage.replace('-', ' ')}
                          </div>
                          {idx < selectedCampaign.stages.length - 1 && <ChevronRight size={10} className="text-white/20" />}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                    <div className="space-y-1">
                      <span className="text-[8px] text-text-secondary uppercase">Associated_Incidents</span>
                      <div className="font-mono text-xs text-white/80">{selectedCampaign.incidents.length} events</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] text-text-secondary uppercase">Confidence_Rating</span>
                      <div className="font-mono text-xs text-state-safe">{(selectedCampaign.confidenceScore * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'actors' && (
             <motion.div 
              key="actors"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-3"
            >
              {state.knowledgeBase.actors.map(actor => (
                <div key={actor.id} className="p-3 bg-void/60 border border-white/5 rounded-lg group hover:border-state-danger/30 transition-all cursor-crosshair">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-state-danger/10 border border-state-danger/30 rounded flex items-center justify-center text-state-danger">
                        <Fingerprint size={16} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-white/90">{actor.name}</h4>
                        <span className="text-[8px] text-text-secondary uppercase font-mono">{actor.origin}</span>
                      </div>
                    </div>
                    <div className="px-1.5 py-0.5 bg-state-danger/20 rounded text-[9px] font-mono text-state-danger border border-state-danger/20 font-bold">
                      {actor.reputation}% THREAT
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {actor.associatedTechniques.map(t => (
                      <span key={t} className="text-[7px] font-mono px-1 py-0.5 bg-white/5 border border-white/10 rounded text-white/40">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'baselines' && (
             <motion.div 
              key="baselines"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-2">
                <InsightCard title="Recurring Paths" value="PC-1 -> SRV-1" icon={TrendingUp} />
                <InsightCard title="Target Concentration" value="DB-1 (High)" icon={Target} />
              </div>

              <div className="space-y-2 pt-4">
                <h4 className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em] px-1">Infrastructure drift alerts</h4>
                <DriftAlert node="srv-1" message="Unexpected egress to 0xA4F2 detected" severity="high" />
                <DriftAlert node="db-1" message="IAM pattern variance: Service Agent usage spike" severity="medium" />
              </div>
            </motion.div>
          )}

          {activeTab === 'cloud_intel' && (
            <motion.div 
              key="cloud_intel"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-5"
            >
              {/* Managed Streaming Bus Stats */}
              <div className="p-3 bg-void/50 border border-white/5 rounded-lg space-y-2">
                <div className="flex items-center gap-1.5 justify-between">
                  <div className="flex items-center gap-1.5">
                    <Activity size={12} className="text-accent-cyan animate-pulse" />
                    <span className="text-[9px] font-bold tracking-widest text-white/80 uppercase">TACTICAL STREAM STATUS</span>
                  </div>
                  <span className="text-[8px] font-mono font-bold text-state-safe">UPSTASH REDIS ACTIVE</span>
                </div>
                <div className="grid grid-cols-3 gap-1 pt-1">
                  <div className="p-1.5 bg-black/30 border border-white/5 rounded">
                    <span className="block text-[7px] text-white/40">CONN POOL</span>
                    <span className="text-[10px] font-mono text-white/90">NEON SQL</span>
                  </div>
                  <div className="p-1.5 bg-black/30 border border-white/5 rounded">
                    <span className="block text-[7px] text-white/40">THROTTLE</span>
                    <span className="text-[10px] font-mono text-white/90">0.05s TICK</span>
                  </div>
                  <div className="p-1.5 bg-black/30 border border-white/5 rounded">
                    <span className="block text-[7px] text-white/40">BATCH ENGINE</span>
                    <span className="text-[10px] font-mono text-accent-cyan">35 EV/FLUSH</span>
                  </div>
                </div>
              </div>

              {/* Shodan Scan Tool */}
              <div className="p-3 bg-void/30 border border-white/5 rounded-lg space-y-3">
                <div className="flex items-center gap-1.5">
                  <Globe size={12} className="text-accent-cyan" />
                  <span className="text-[9px] font-bold text-white/80 uppercase tracking-widest">SHODAN RECON TARGET</span>
                </div>
                <div className="flex gap-1">
                  <input 
                    type="text" 
                    value={shodanQueryIp} 
                    onChange={(e) => setShodanQueryIp(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1 text-xs font-mono text-white/90 outline-none focus:border-accent-cyan/50" 
                  />
                  <button 
                    onClick={handleQueryShodan}
                    disabled={shodanLoading}
                    className="px-3 py-1 bg-accent-cyan/10 border border-accent-cyan/30 rounded text-[10px] font-bold text-accent-cyan hover:bg-accent-cyan/20 transition-all disabled:opacity-45"
                  >
                    {shodanLoading ? 'SCANNING...' : 'SCAN'}
                  </button>
                </div>
                {shodanResult && (
                  <div className="p-2 bg-black/40 border border-white/5 rounded text-[9px] font-mono text-white/70 space-y-1">
                    <div className="text-accent-cyan font-bold uppercase tracking-wider">{shodanResult.source || 'SHODAN RESULTS'}</div>
                    <p className="text-[10px] leading-relaxed text-white/95">{shodanResult.message}</p>
                    {shodanResult.payload && (
                      <div className="grid grid-cols-2 gap-1 pt-1 border-t border-white/5 text-[8px] opacity-60">
                        <div>ISP: {shodanResult.payload.isp}</div>
                        <div>Target Ports: {shodanResult.payload.ports?.join(', ')}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* VirusTotal Reputation Scanner */}
              <div className="p-3 bg-void/30 border border-white/5 rounded-lg space-y-3">
                <div className="flex items-center gap-1.5">
                  <Shield size={12} className="text-state-warning" />
                  <span className="text-[9px] font-bold text-white/80 uppercase tracking-widest">VIRUSTOTAL ADVERSARY INTEL</span>
                </div>
                <div className="flex gap-1">
                  <input 
                    type="text" 
                    value={vtQueryTarget} 
                    onChange={(e) => setVtQueryTarget(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1 text-xs font-mono text-white/90 outline-none focus:border-state-warning/50" 
                  />
                  <button 
                    onClick={handleQueryVT}
                    disabled={vtLoading}
                    className="px-3 py-1 bg-state-warning/10 border border-state-warning/30 rounded text-[10px] font-bold text-state-warning hover:bg-state-warning/20 transition-all disabled:opacity-45"
                  >
                    {vtLoading ? 'SCANNING...' : 'SCAN'}
                  </button>
                </div>
                {vtResult && (
                  <div className="p-2 bg-black/40 border border-white/5 rounded text-[9px] font-mono text-white/70 space-y-1">
                    <div className="text-state-warning font-bold uppercase tracking-wider">{vtResult.source || 'VIRUSTOTAL'}</div>
                    <p className="text-[10px] leading-relaxed text-white/95">{vtResult.message}</p>
                    {vtResult.payload && (
                      <div className="pt-1 border-t border-white/5 text-[8px] opacity-60 flex justify-between">
                        <span>DETECTIONS: {vtResult.payload.positives} / {vtResult.payload.total}</span>
                        <span className="italic">{vtResult.payload._integration}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* AWS CloudTrail logs feed */}
              <div className="p-3 bg-void/30 border border-white/5 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <Database size={12} className="text-white/50" />
                    <span className="text-[9px] font-bold text-white/80 uppercase tracking-widest">AWS CLOUDTRAIL AUDIT SYNC</span>
                  </div>
                  <button 
                    onClick={loadAWSCloudTrail} 
                    className="text-[8px] text-accent-cyan hover:underline uppercase"
                  >
                    Refresh
                  </button>
                </div>
                <div className="space-y-1.5 max-h-44 overflow-y-auto custom-scrollbar">
                  {logsLoading ? (
                    <div className="text-[9px] font-mono opacity-50 py-3 text-center">Syncing AWS events...</div>
                  ) : cloudTrailLogs.map((log: any, idx: number) => (
                    <div key={idx} className="p-1.5 bg-black/20 border-l border-white/10 rounded-r text-[9px] font-mono text-white/60">
                      <div className="flex justify-between font-bold text-[8px] text-white/80">
                        <span className="text-accent-cyan uppercase">{log.payload?.eventName || 'Audit Log'}</span>
                        <span>{log.payload?.awsRegion}</span>
                      </div>
                      <p className="text-[9px] text-white/50 leading-tight my-0.5">{log.message}</p>
                      <div className="text-[7px] text-white/30 truncate">Target ARN: {log.payload?.userIdentity?.arn || 'N/A'}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'fusion' && (
            <motion.div 
              key="fusion"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              {/* Tactical Control Trigger */}
              <div className="p-3 bg-accent-cyan/5 border border-accent-cyan/15 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <Activity size={12} className="text-accent-cyan animate-pulse" />
                    <span className="text-[9px] font-bold tracking-widest text-white/90 uppercase">MULTISOURCE CONVERGENCE</span>
                  </div>
                  <span className="text-[7.5px] font-mono px-1 py-0.5 bg-accent-cyan/10 border border-accent-cyan/30 rounded text-accent-cyan">STABLE</span>
                </div>
                <p className="text-[9.5px] text-text-secondary leading-normal">
                  Engage live multi-sensor feeds dynamically. Simulate a multi-stage attack on <span className="text-white font-bold font-mono">pc-admin-hq</span> combining Suricata network alerts + Falco escalation container logs.
                </p>
                <button 
                  onClick={triggerConvergenceSimulation}
                  disabled={simulatingConvergence}
                  className="w-full flex items-center justify-center py-1.5 bg-accent-cyan border border-accent-cyan text-void hover:bg-transparent hover:text-accent-cyan font-bold font-mono text-[9.5px] rounded transition-all cursor-crosshair disabled:opacity-50"
                >
                  {simulatingConvergence ? 'FUSING ACTIVE ENVELOPS...' : 'TRIGGER THREAT CONVERGENCE SIMULATION'}
                </button>
              </div>

              {/* Active Clusters List */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">INTELLIGENCE CORRELATION PLOTS ({fusionClusters.length})</h3>
                  <button onClick={fetchFusionClusters} className="text-[8px] text-accent-cyan font-mono hover:underline uppercase">Refresh plots</button>
                </div>

                {fusionClusters.length === 0 ? (
                  <div className="py-8 bg-void/25 border border-white/5 rounded-lg text-center font-mono opacity-40 text-[9.5px] flex flex-col items-center justify-center gap-2">
                    <Brain size={18} className="text-accent-cyan animate-pulse" />
                    <span>AWAITING LIVE SENSORS CORRELATIONS...</span>
                  </div>
                ) : (
                  fusionClusters.map((cluster) => {
                    const isSelected = selectedClusterId === cluster.id;
                    return (
                      <div 
                        key={cluster.id}
                        onClick={() => setSelectedClusterId(isSelected ? null : cluster.id)}
                        className={cn(
                          "p-3 rounded-lg border text-left cursor-pointer transition-all relative overflow-hidden group",
                          isSelected 
                            ? "bg-accent-cyan/10 border-accent-cyan shadow-[0_0_15px_rgba(0,255,209,0.08)]" 
                            : "bg-void/50 border-white/5 hover:border-white/10"
                        )}
                      >
                        {/* Title Bar */}
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full animate-pulse",
                              cluster.overallSeverity === 'critical' || cluster.overallSeverity === 'high' ? "bg-state-danger" : "bg-state-warning"
                            )} />
                            <h4 className="text-xs font-mono font-bold text-white/90 uppercase tracking-tight">{cluster.id}</h4>
                          </div>
                          <div className="flex items-center gap-1">
                            {cluster.sourcesFused.map((src: string) => (
                              <span key={src} className="text-[7.5px] font-mono px-1 py-0.2 bg-white/5 border border-white/10 rounded text-text-secondary">
                                {src}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Progress confidence index */}
                        <div className="space-y-1 mb-2">
                          <div className="flex justify-between text-[8px] font-mono text-text-secondary">
                            <span>FUSION CONFIDENCE</span>
                            <span className={cn(
                              "font-bold",
                              cluster.confidenceScore > 80 ? "text-accent-cyan" : "text-white/60"
                            )}>{cluster.confidenceScore}%</span>
                          </div>
                          <div className="w-full h-1 bg-white/5 rounded overflow-hidden">
                            <div 
                              className="h-full bg-accent-cyan rounded" 
                              style={{ width: `${cluster.confidenceScore}%` }}
                            />
                          </div>
                        </div>

                        <p className="text-[10px] text-text-secondary leading-relaxed font-sans line-clamp-2">
                          {cluster.threatNarrative}
                        </p>

                        {/* Collapsible Details */}
                        {isSelected && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            className="mt-3 pt-3 border-t border-white/5 space-y-2 text-[9.5px] font-mono"
                          >
                            <div className="grid grid-cols-2 gap-2">
                              <InsightCard title="Direct Target Host" value={cluster.nodesAffected.join(', ')} icon={Target} />
                              <InsightCard title="Calculated Blast Exposure" value={`${cluster.blastRadiusScore}%`} icon={TrendingUp} />
                            </div>

                            {cluster.riskAmplified && (
                              <div className="p-1.5 bg-state-danger/10 border border-state-danger/20 rounded flex items-center gap-1.5 text-state-danger text-[8.5px]">
                                <AlertOctagon size={11} className="shrink-0" />
                                <span>CRITICAL COMPLIANCE THREAT: Target triggers a strict security zone violation.</span>
                              </div>
                            )}

                            {cluster.exposureChain && cluster.exposureChain.length > 0 && (
                              <div className="space-y-1 pt-1">
                                <span className="text-[7.5px] font-bold text-text-secondary uppercase tracking-widest block">Exposure chain lateral progression:</span>
                                <div className="flex flex-wrap items-center gap-1">
                                  {cluster.nodesAffected.map((node: string, idx: number) => (
                                    <React.Fragment key={node}>
                                      <span className="px-1 py-0.5 bg-white/5 border border-white/10 rounded text-white/80">{node}</span>
                                      {idx < cluster.nodesAffected.length - 1 && <ChevronRight size={10} className="opacity-40" />}
                                    </React.Fragment>
                                  ))}
                                  {cluster.exposureChain.length > 0 && <ChevronRight size={10} className="opacity-40" />}
                                  {cluster.exposureChain.slice(0, 3).map((node: string, idx: number) => (
                                    <React.Fragment key={node}>
                                      <span className="px-1 py-0.5 bg-white/5 border border-white/10 rounded opacity-60 text-text-secondary">{node}</span>
                                      {idx < cluster.exposureChain.slice(0, 3).length - 1 && <ChevronRight size={10} className="opacity-20" />}
                                    </React.Fragment>
                                  ))}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'copilot' && (
            <motion.div
              key="copilot"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6 text-white"
            >
              {/* Copilot Target Selector */}
              <div className="p-4 bg-void/50 border border-white/5 rounded-xl space-y-4">
                <div className="flex justify-between items-center bg-black/40 px-3 py-2 rounded-lg border border-white/5">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-accent-cyan" />
                    <div>
                      <h4 className="text-xs font-black text-white/90 tracking-wider">AI OPERATIONS COPILOT</h4>
                      <p className="text-[8px] font-mono text-text-secondary">ACTIVE DIRECTORY TOPOLOGY ENGINE ENGAGED</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fetchGovernanceInfo()}
                      className="p-1 px-2 text-[8px] font-mono hover:bg-white/10 text-white/70 border border-white/10 rounded transition-all flex items-center gap-1"
                    >
                      <RefreshCw className="w-2.5 h-2.5 animate-spin-slow" /> REFRESH MATRIX
                    </button>
                  </div>
                </div>

                <span className="text-[8.5px] font-mono font-bold text-text-secondary uppercase tracking-[0.2em] block">SELECT NETWORK TARGET FOR AI REASONING RANGE:</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'k8s-pod-auth-api-559b', name: 'Auth API Pod', icon: Server, color: 'border-accent-cyan/10 text-accent-cyan' },
                    { id: 'pc-admin-hq', name: 'Admin Workstation', icon: Server, color: 'border-state-warning/10 text-state-warning' },
                    { id: 'azure-vm-ad-connector', name: 'Azure AD Bridge', icon: Server, color: 'border-state-danger/10 text-state-danger' }
                  ].map((node) => (
                    <button
                      key={node.id}
                      onClick={() => {
                        setCopilotNodeId(node.id);
                        triggerLiveCopilotInference(node.id);
                      }}
                      className={cn(
                        "p-3 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between gap-2 relative overflow-hidden",
                        copilotNodeId === node.id 
                          ? "bg-white/5 border-accent-cyan shadow-[0_0_15px_rgba(0,255,209,0.06)]"
                          : "bg-void/40 border-white/5 hover:border-white/10 hover:bg-void/70"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <node.icon size={14} className={node.color} />
                        <span className="text-[7.5px] font-mono px-1 py-0.2 bg-white/5 border border-white/10 rounded uppercase tracking-widest text-text-secondary">
                          {node.id === 'k8s-pod-auth-api-559b' ? 'Critical' : 'Security'}
                        </span>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-white/95 truncate">{node.name}</div>
                        <div className="text-[8px] font-mono opacity-50 truncate">{node.id}</div>
                      </div>
                      {copilotNodeId === node.id && (
                        <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-accent-cyan rounded-bl" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Streaming Output & Analysis Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Markdown Stream Typewriter */}
                <div className="md:col-span-2 space-y-4">
                  <div className="p-4 bg-void/60 border border-white/5 rounded-xl min-h-[300px] flex flex-col justify-between relative overflow-hidden">
                    <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Radio className="w-3 h-3 text-state-danger animate-pulse" />
                        <span className="text-[8.5px] font-mono text-state-danger uppercase tracking-[0.15em]">AI REASONING CORE FEEDBACK STREAM</span>
                      </div>
                      {copilotStreaming && (
                        <span className="text-[8px] bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 px-1.5 py-0.5 rounded font-mono animate-pulse">
                          STREAMING LIVE ANALYST...
                        </span>
                      )}
                    </div>

                    <div className="flex-1 font-mono text-[10px] text-white/95 leading-relaxed space-y-2 whitespace-pre-wrap select-text custom-scrollbar max-h-[360px] overflow-y-auto pr-2 bg-black/35 p-3 rounded">
                      {copilotStreamingText || (
                        <span className="text-text-secondary/60 italic">Initiate deep cognitive analytical pass targeting active nodes...</span>
                      )}
                      {copilotStreaming && (
                        <span className="inline-block w-1.5 h-3 bg-accent-cyan ml-1 animate-pulse" />
                      )}
                    </div>

                    {/* Manual Simulated Quarantine Trigger */}
                    {copilotMetadata && (
                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                        <div className="text-[9px] font-mono text-text-secondary">
                          Confidence Index: <span className="text-accent-cyan font-bold">{Math.round((copilotMetadata.confidence || 0.95) * 100)}%</span>
                        </div>
                        <button
                          onClick={() => executeSimulatedQuarantineAction(copilotNodeId)}
                          className="bg-state-warning/10 hover:bg-state-warning/20 text-state-warning border border-state-warning/30 hover:border-state-warning/50 px-3 py-1 rounded text-[8.5px] font-mono uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Shield className="w-3 h-3" /> Simulate Sandbox Isolation
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Key Cyber Compliance Metrics & Mitigation Stagers */}
                <div className="space-y-4">
                  {/* Compliance readiness dials */}
                  <div className="p-4 bg-void/50 border border-white/5 rounded-xl space-y-3">
                    <span className="text-[8.5px] font-mono font-bold text-text-secondary uppercase tracking-[0.15em] block">CONTINUOUS COMPLIANCE AUDIT INDEX</span>
                    
                    {complianceMatrix ? (
                      <div className="space-y-3 font-mono text-[9.5px]">
                        {/* SOC2 */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[9px]">
                            <span className="text-white/80">SOC2 Trust Criteria</span>
                            <span className="font-bold text-accent-cyan">{complianceMatrix.soc2.readinessPercentage}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-black/40 rounded overflow-hidden">
                            <div className="h-full bg-accent-cyan" style={{ width: `${complianceMatrix.soc2.readinessPercentage}%` }} />
                          </div>
                          <p className="text-[8px] text-text-secondary leading-normal">{complianceMatrix.soc2.complianceBrief}</p>
                        </div>

                        {/* HIPAA */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[9px]">
                            <span className="text-white/80">HIPAA PHI Data Secure</span>
                            <span className="font-bold text-state-warning">{complianceMatrix.hipaa.readinessPercentage}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-black/40 rounded overflow-hidden">
                            <div className="h-full bg-state-warning" style={{ width: `${complianceMatrix.hipaa.readinessPercentage}%` }} />
                          </div>
                        </div>

                        {/* PCI-DSS */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[9px]">
                            <span className="text-white/80">PCI-DSS Cardholder Integrity</span>
                            <span className="font-bold text-state-danger">{complianceMatrix.pciDss.readinessPercentage}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-black/40 rounded overflow-hidden">
                            <div className="h-full bg-state-danger" style={{ width: `${complianceMatrix.pciDss.readinessPercentage}%` }} />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] italic text-text-secondary leading-relaxed font-mono py-4 text-center">Evaluating compliance scores...</div>
                    )}
                  </div>

                  {/* Zero-Trust Boundary Leaks / Active simulated quarantines */}
                  <div className="p-4 bg-void/50 border border-white/5 rounded-xl space-y-3">
                    <span className="text-[8.5px] font-mono font-bold text-text-secondary uppercase tracking-[0.15em] block">ZERO-TRUST BORDERS STATUS</span>
                    {governanceZones ? (
                      <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar">
                        {governanceZones.zeroTrustBreaches && governanceZones.zeroTrustBreaches.length > 0 ? (
                          governanceZones.zeroTrustBreaches.map((breach: any) => (
                            <div key={breach.breachId} className="p-2 bg-state-danger/10 border border-state-danger/20 rounded text-[9px] font-mono space-y-1">
                              <div className="flex items-center gap-1.5 text-state-danger font-bold uppercase tracking-tight text-[8.5px]">
                                <AlertOctagon size={11} />
                                <span>BOUNDARY COMPROMISE EXPOSED</span>
                              </div>
                              <div className="text-text-secondary text-[8px]">Transit: {breach.sourceNode} -&gt; {breach.targetNode}</div>
                              <p className="text-[8px] text-white/70 italic bg-black/30 p-1 rounded mt-1 leading-tight">{breach.enforcementActionSimulated}</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 bg-accent-cyan/5 border border-accent-cyan/15 rounded flex items-center gap-1.5 text-accent-cyan text-[9px] font-mono">
                            <ShieldCheck size={13} />
                            <span>ZERO-TRUST BOUNDARY ENFORCED SUCCESSFULLY</span>
                          </div>
                        )}

                        {/* Active simulated quarantines */}
                        {governanceZones.quarantines && governanceZones.quarantines.length > 0 && (
                          <div className="space-y-1.5 pt-2 border-t border-white/5">
                            <span className="text-[7.5px] font-bold text-text-secondary uppercase tracking-widest block font-mono">Active Simulated Quarantines:</span>
                            {governanceZones.quarantines.map((q: any) => (
                              <div key={q.nodeId} className="flex justify-between items-center bg-state-warning/10 border border-state-warning/20 p-2 rounded text-[8.5px] font-mono text-state-warning">
                                <div className="flex items-center gap-1">
                                  <Lock size={10} className="animate-pulse" />
                                  <span>Sandbox: {q.nodeId}</span>
                                </div>
                                <span className="text-[7px] bg-state-warning/10 border border-state-warning/20 rounded px-1">CPU SHIELD</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-[10px] italic text-text-secondary font-mono text-center">Checking dynamic gateways...</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Structured Risk Heat overlay and exposure zones */}
              {copilotMetadata && (
                <div className="p-4 bg-void/50 border border-white/5 rounded-xl space-y-4">
                  <span className="text-[8.5px] font-mono font-bold text-text-secondary uppercase tracking-[0.15em] block">ENTERPRISE RISK HEAT INTELLIGENCE DATA</span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center font-mono">
                    
                    <div className="p-3 bg-black/40 border border-white/5 rounded-lg flex flex-col justify-between items-center gap-2">
                      <span className="text-[8px] text-text-secondary uppercase">Blast Exposure</span>
                      <div className="text-lg font-black text-state-danger">{copilotMetadata.blastRadius}%</div>
                      <span className="text-[7px] text-text-secondary">calculated downshore threat radius</span>
                    </div>

                    <div className="p-3 bg-black/40 border border-white/5 rounded-lg flex flex-col justify-between items-center gap-2 max-w-full overflow-hidden">
                      <span className="text-[8px] text-text-secondary uppercase">Adversary Tactic Mapped</span>
                      <div className="text-xs font-black text-white/90 truncate max-w-full px-1">{copilotMetadata.adversaryBehavior?.mitreAlignment || 'TA0008'}</div>
                      <span className="text-[7px] text-text-secondary">MITRE ATT&amp;CK alignment</span>
                    </div>

                    <div className="p-3 bg-black/40 border border-white/5 rounded-lg flex flex-col justify-between items-center gap-2">
                      <span className="text-[8px] text-text-secondary uppercase">Exposure Pressure</span>
                      <div className="text-lg font-black text-state-warning">{copilotMetadata.propagationProbability}%</div>
                      <span className="text-[7px] text-text-secondary">next-hop progression probability</span>
                    </div>

                    <div className="p-3 bg-black/40 border border-white/5 rounded-lg flex flex-col justify-between items-center gap-2">
                      <span className="text-[8px] text-text-secondary uppercase">Temporal History</span>
                      <div className="text-xs font-black text-accent-cyan uppercase">{copilotMetadata.temporalAnalysis?.frequencyRating || 'LOW_ANOMALY'}</div>
                      <span className="text-[7px] text-text-secondary">anomalies logged: {copilotMetadata.temporalAnalysis?.priorEventsCount || 0} times</span>
                    </div>

                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex-1 flex flex-col items-center justify-center py-3 gap-1.5 transition-all relative overflow-hidden",
        active ? "text-accent-cyan" : "text-text-secondary hover:text-text-primary hover:bg-white/5"
      )}
    >
      <Icon size={14} />
      <span className="text-[8px] font-black tracking-[0.2em]">{label}</span>
      {active && (
        <motion.div 
          layoutId="tab-underline-intel"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-cyan shadow-[0_0_10px_#00FFD1]" 
        />
      )}
    </button>
  );
}

function CampaignCard({ campaign, selected, onClick }: { campaign: AttackCampaign, selected: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full p-4 rounded-lg border text-left transition-all relative overflow-hidden group",
        selected 
          ? "bg-accent-cyan/10 border-accent-cyan shadow-[0_0_20px_rgba(0,255,209,0.1)]" 
          : "bg-void/60 border-white/5 hover:border-white/20"
      )}
    >
      <div className="flex justify-between items-start mb-2 relative z-10">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            campaign.status === 'active' ? "bg-state-danger animate-pulse" : "bg-text-secondary opacity-40"
          )} />
          <h4 className="text-xs font-black uppercase tracking-tight text-white/90">{campaign.title}</h4>
        </div>
        <span className="text-[9px] font-mono text-text-secondary italic">
          {new Date(campaign.lastActivity).toLocaleTimeString()}
        </span>
      </div>

      <div className="flex items-center gap-3 relative z-10">
        <div className="flex -space-x-1">
          {campaign.stages.slice(0, 3).map((s, i) => (
            <div key={s} className="w-4 h-4 rounded-full border border-void flex items-center justify-center bg-accent-cyan/20 text-accent-cyan" title={s}>
               <Zap className="w-2 h-2" />
            </div>
          ))}
          {campaign.stages.length > 3 && (
            <div className="w-4 h-4 rounded-full border border-void flex items-center justify-center bg-white/5 text-[7px] text-text-secondary">
              +{campaign.stages.length - 3}
            </div>
          )}
        </div>
        <span className="text-[9px] text-text-secondary font-mono tracking-tighter">
          Assets: {campaign.affectedAssets.length} &bull; Stage: {campaign.stages[campaign.stages.length - 1].replace('-', ' ')}
        </span>
      </div>

      {/* Visual background decor */}
      {selected && (
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-accent-cyan/10 to-transparent pointer-events-none" />
      )}
    </button>
  );
}

function InsightCard({ title, value, icon: Icon }: { title: string, value: string, icon: any }) {
  return (
    <div className="p-3 bg-void/60 border border-white/5 rounded-lg flex flex-col gap-2 shadow-inner">
      <div className="flex items-center gap-2">
        <Icon size={12} className="text-accent-cyan/60" />
        <span className="text-[8px] font-bold text-text-secondary uppercase tracking-widest">{title}</span>
      </div>
      <div className="text-[11px] font-mono text-white/90 truncate">{value}</div>
    </div>
  );
}

function DriftAlert({ node, message, severity }: { node: string, message: string, severity: 'high' | 'medium' | 'low' }) {
  return (
    <div className={cn(
      "p-2 bg-void/40 rounded border-l-2 flex items-start gap-2",
      severity === 'high' ? "border-state-danger bg-state-danger/5" : 
      severity === 'medium' ? "border-state-warning bg-state-warning/5" : "border-accent-blue bg-accent-blue/5"
    )}>
      <AlertOctagon size={12} className={cn(
        "mt-0.5 shrink-0",
        severity === 'high' ? "text-state-danger" : severity === 'medium' ? "text-state-warning" : "text-accent-blue"
      )} />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center text-[9px] mb-0.5">
          <span className="font-bold text-white/90 uppercase">{node} - Variance detected</span>
          <span className="opacity-40 italic">JUST NOW</span>
        </div>
        <p className="text-[10px] text-text-secondary leading-tight">{message}</p>
      </div>
    </div>
  );
}

function StatMini({ label, value, color }: { label: string, value: number | string, color: string }) {
  return (
    <div className="flex flex-col items-end">
      <span className="text-[7px] text-text-secondary tracking-widest uppercase font-bold">{label}</span>
      <span className={cn("text-[10px] font-mono font-bold leading-none", color)}>{value}</span>
    </div>
  );
}

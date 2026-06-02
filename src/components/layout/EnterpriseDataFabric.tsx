import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Brain, Database, Cloud, Network, Search, Shield, ShieldX, Key, 
  Activity, RefreshCw, Send, ArrowRight, CornerDownRight, Layers, 
  UserCheck, AlertTriangle, CheckCircle2, ShieldAlert, Cpu, Lock, 
  Clock, Server, Check, Edit3, X, HelpCircle, HardDrive
} from 'lucide-react';

interface ScaleStats {
  activeWorkforceEmployeesCount: number;
  fusedApplicationsCount: number;
  activeCloudAssetsCount: number;
  interconnectedRelationsCount: number;
  activeDepartmentsCount: number;
  showcaseNodesCached: number;
  showcaseRelationsCached: number;
  unownedOrphansCount: number;
  zeroTrustViolationsCount: number;
}

interface SearchResult {
  nodeId: string;
  name: string;
  type: string;
  sensitivity: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED' | 'HIGHLY_RESTRICTED';
  riskScore: number;
  businessCriticality: number;
  ownerName: string;
  departmentName: string;
  dependencyCount: number;
  relationCount: number;
  governanceScore: number;
}

interface Connector {
  id: string;
  name: string;
  type: 'DATABASE' | 'CLOUD_API' | 'DIRECTORY_LDAP' | 'SAAS' | 'INFRASTRUCTURE_AGENT';
  targetSystem: string;
  config: {
    syncIntervalMinutes: number;
    metadataOnly: boolean;
    connectionEndpoint: string;
    authType: 'OAUTH' | 'TOKEN' | 'IAM_ROLE' | 'BASIC';
  };
  status: 'ACTIVE' | 'CONNECTED' | 'SYNCING' | 'ERROR' | 'IDLE';
  lastSyncTimestamp?: string;
  healthScore: number;
  ingestedRecordCount: number;
  uptimePercentage: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  successRate: number;
  syncedCount: number;
  lastErrorStatus: string;
  logs: string[];
}

export function EnterpriseDataFabric() {
  // Navigation inside Data Fabric
  const [panelTab, setPanelTab] = useState<'fabric' | 'connectors' | 'reconciliation'>('fabric');
  
  // Fabric Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Stats
  const [stats, setStats] = useState<ScaleStats | null>(null);
  
  // Connector State
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [syncsRunning, setSyncsRunning] = useState<Record<string, boolean>>({});
  const [editorConnector, setEditorConnector] = useState<Connector | null>(null);
  
  // Connector Config Form
  const [formEndpoint, setFormEndpoint] = useState('');
  const [formInterval, setFormInterval] = useState(30);
  const [formAuth, setFormAuth] = useState<'OAUTH' | 'TOKEN' | 'IAM_ROLE' | 'BASIC'>('IAM_ROLE');

  // Microsoft Entra ID (Azure AD) Custom Connector Credentials & Integration States
  const [azureClientId, setAzureClientId] = useState('');
  const [azureClientSecret, setAzureClientSecret] = useState('');
  const [azureTenantId, setAzureTenantId] = useState('common');
  const [azureConfig, setAzureConfig] = useState<any>(null);
  const [isSavingAzureConfig, setIsSavingAzureConfig] = useState(false);
  
  // Detail Node Drawer
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodeContext, setNodeContext] = useState<any>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Global Action Notification
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Fetch initial scaling dimensions & search
  useEffect(() => {
    fetchStats();
    fetchSearchResults();
    fetchConnectors();
  }, []);

  // Listen to popup redirect notifications
  useEffect(() => {
    const handleAuthMessage = async (event: MessageEvent) => {
      if (event.data && event.data.type === 'OAUTH_AUTH_SUCCESS' && event.data.service === 'azure-ad') {
        showNotification('OAuth Security Handshake Succeeded! Microsoft Entra ID Connected.', 'success');
        await fetchConnectors();
        await fetchStats();
        // Reload configuration stats in the form dynamically
        if (editorConnector && editorConnector.id === 'conn-entra-id-oauth') {
          try {
            const res = await fetch('/api/v3/connectors/azure-ad/config');
            const data = await res.json();
            if (data.success && data.config) {
              setAzureConfig(data.config);
            }
          } catch (err) {
            console.error('Failed to reload active credentials', err);
          }
        }
      }
    };

    window.addEventListener('message', handleAuthMessage);
    return () => window.removeEventListener('message', handleAuthMessage);
  }, [editorConnector]);

  useEffect(() => {
    fetchSearchResults();
  }, [searchQuery, selectedType]);

  const showNotification = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/v3/fabric/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load fabric scale dimensions', err);
    }
  };

  const fetchSearchResults = async () => {
    setIsSearching(true);
    try {
      const query = encodeURIComponent(searchQuery);
      const res = await fetch(`/api/v3/fabric/search?q=${query}&type=${selectedType}`);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.results);
      }
    } catch (err) {
      console.error('Failed search', err);
    } finally {
      setIsSearching(false);
    }
  };

  const fetchConnectors = async () => {
    try {
      const res = await fetch('/api/v3/connectors');
      const data = await res.json();
      if (data.success) {
        setConnectors(data.connectors);
      }
    } catch (err) {
      console.error('Failed to load connectors dashboard', err);
    }
  };

  const handleManualSync = async (connectorId: string) => {
    setSyncsRunning(prev => ({ ...prev, [connectorId]: true }));
    showNotification(`Spinning up background metadata ingestion pipeline for channel: ${connectorId}`, 'info');
    
    try {
      const res = await fetch(`/api/v3/connectors/${connectorId}/sync`, {
        method: 'POST'
      });
      const data = await res.json();
      
      if (data.success) {
        showNotification(data.message || 'Synchronization executed successfully!', 'success');
        // Refresh everything
        await fetchConnectors();
        await fetchStats();
        await fetchSearchResults();
        if (selectedNodeId) {
          await viewNodeDetails(selectedNodeId);
        }
      } else {
        showNotification(data.error || 'Ingestion gateway failure.', 'error');
      }
    } catch (err: any) {
      showNotification(`Gateway connectivity failure: ${err.message}`, 'error');
    } finally {
      setSyncsRunning(prev => ({ ...prev, [connectorId]: false }));
    }
  };

  const handleConnectAzureOAuth = async () => {
    try {
      const origin = window.location.origin;
      const res = await fetch(`/api/v3/connectors/azure-ad/authorize-url?origin=${encodeURIComponent(origin)}`);
      const data = await res.json();
      
      if (data.success && data.url) {
        const width = 500;
        const height = 650;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        
        const popup = window.open(
          data.url,
          'entra_id_auth_popup',
          `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
        );
        
        if (!popup) {
          showNotification('Popup Blocked! Please permit browser redirection to execute Active Directory sign-in.', 'error');
        }
      } else {
        showNotification('OAuth Endpoint unreachable; configuration mapping error.', 'error');
      }
    } catch (err: any) {
      showNotification(`Unnable to trigger popup: ${err.message}`, 'error');
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editorConnector) return;

    try {
      // 1. Save general parameters (interval, host endpoint)
      const res = await fetch(`/api/v3/connectors/${editorConnector.id}/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          connectionEndpoint: formEndpoint,
          syncIntervalMinutes: formInterval,
          authType: formAuth
        })
      });
      const data = await res.json();

      if (!data.success) {
        showNotification(data.error || 'Configuration change refused', 'error');
        return;
      }

      // 2. Save premium client AD credentials
      if (editorConnector.id === 'conn-entra-id-oauth') {
        setIsSavingAzureConfig(true);
        const azRes = await fetch('/api/v3/connectors/azure-ad/config', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            clientId: azureClientId,
            clientSecret: azureClientSecret,
            tenantId: azureTenantId
          })
        });
        const azData = await azRes.json();
        setIsSavingAzureConfig(false);

        if (!azData.success) {
          showNotification(azData.error || 'Identity Credentials rejected by Security policies.', 'error');
          return;
        }
      }

      showNotification(`Successfully reconfigured scheduler and connection details for ${editorConnector.id}`, 'success');
      setEditorConnector(null);
      await fetchConnectors();
    } catch (err: any) {
      showNotification(`Connection failure: ${err.message}`, 'error');
    }
  };

  const handleOpenConfig = async (connector: Connector) => {
    setEditorConnector(connector);
    setFormEndpoint(connector.config.connectionEndpoint);
    setFormInterval(connector.config.syncIntervalMinutes);
    setFormAuth(connector.config.authType);

    if (connector.id === 'conn-entra-id-oauth') {
      try {
        const res = await fetch('/api/v3/connectors/azure-ad/config');
        const data = await res.json();
        if (data.success && data.config) {
          setAzureConfig(data.config);
          setAzureClientId(data.config.clientId);
          setAzureClientSecret(data.config.clientSecret);
          setAzureTenantId(data.config.tenantId);
        }
      } catch (err) {
        console.error('Failed to fetch credentials configuration', err);
      }
    } else {
      setAzureConfig(null);
    }
  };

  const handleGlobalRefresh = async () => {
    showNotification('Re-inventorying all active metadata and stitching organizational graph links...', 'info');
    try {
      const res = await fetch('/api/v3/fabric/refresh', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message, 'success');
        await fetchStats();
        await fetchSearchResults();
        await fetchConnectors();
      }
    } catch (err: any) {
      showNotification(`Encountered error: ${err.message}`, 'error');
    }
  };

  const viewNodeDetails = async (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setIsDetailLoading(true);
    
    try {
      const res = await fetch(`/api/v3/fabric/nodes/${nodeId}`);
      const data = await res.json();
      if (data.success) {
        setNodeContext(data.context);
      } else {
        setNodeContext(null);
        showNotification(data.error || 'Failed to acquire contextual node properties', 'error');
      }
    } catch (err: any) {
      showNotification(`Trace error: ${err.message}`, 'error');
    } finally {
      setIsDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* GLOBAL ACTIONS NOTIFICATION PANEL */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 px-5 py-3.5 rounded-lg border shadow-xl flex items-center gap-3 font-mono text-xs max-w-md ${
              notification.type === 'success' 
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40 shadow-emerald-950/40' 
                : notification.type === 'error'
                ? 'bg-rose-950/90 text-rose-300 border-rose-500/40 shadow-rose-950/40'
                : 'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30 shadow-cyan-950/30'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            ) : notification.type === 'error' ? (
              <ShieldAlert size={16} className="text-rose-400 shrink-0" />
            ) : (
              <Activity size={16} className="text-accent-cyan animate-pulse shrink-0" />
            )}
            <div>
              <p className="font-bold uppercase tracking-wider">
                {notification.type === 'success' ? 'SYSTEM SYNC OK' : notification.type === 'error' ? 'SYSTEM CRITICAL' : 'KNOWLEDGE ENGINE ACTIVE'}
              </p>
              <p className="text-[11px] text-text-secondary mt-0.5">{notification.text}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RE-ENGINE INVENTORY TRIGGER FLOATING */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/10 pb-4">
        <div>
          <h1 className="text-xl font-sans font-medium tracking-tight text-white flex items-center gap-3">
            <Brain className="text-accent-cyan" size={24} />
            <span>ENTERPRISE METADATA DATA FABRIC</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1 max-w-2xl font-mono">
            SentinelX premium, metadata-only core governance platform. Automatically unifies databases, employee indexes, multicloud resources, and identities without exposing sensitive corporate records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGlobalRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0d2a4a] to-[#04152e] hover:from-[#113a66] hover:to-[#082245] border border-accent-cyan/30 text-accent-cyan rounded text-[10px] font-mono font-bold tracking-widest active:scale-95 transition-all"
          >
            <RefreshCw size={12} className="animate-spin-[duration:8s]" />
            <span>FORCE SYSTEM AUTO-RECONCILIATION</span>
          </button>
        </div>
      </div>

      {/* CORE SCALE METRIC PANEL BENTO GRID */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-[#050b18]/60 border border-border/30 rounded-lg p-4 font-mono">
            <div className="flex items-center justify-between text-text-tertiary">
              <span className="text-[9px] uppercase tracking-wider font-bold">TOTAL WORKFORCE</span>
              <UserCheck size={14} className="text-blue-400" />
            </div>
            <p className="text-2xl font-sans font-semibold text-white mt-2">
              {stats.activeWorkforceEmployeesCount.toLocaleString()}
            </p>
            <div className="text-[8.5px] text-emerald-400 mt-1 flex items-center gap-1">
              <span className="w-1 h-1 bg-emerald-400 rounded-full inline-block" />
              <span>100K+ DIRECT ACCOUNTS</span>
            </div>
          </div>

          <div className="bg-[#050b18]/60 border border-border/30 rounded-lg p-4 font-mono">
            <div className="flex items-center justify-between text-text-tertiary">
              <span className="text-[9px] uppercase tracking-wider font-bold">FUSED SYSTEMS</span>
              <Layers size={14} className="text-accent-cyan" />
            </div>
            <p className="text-2xl font-sans font-semibold text-white mt-2">
              {stats.fusedApplicationsCount.toLocaleString()}
            </p>
            <div className="text-[8.5px] text-accent-cyan/80 mt-1 flex items-center gap-1">
              <span className="w-1 h-1 bg-accent-cyan rounded-full inline-block animate-pulse" />
              <span>10,000+ API SCHEMAS</span>
            </div>
          </div>

          <div className="bg-[#050b18]/60 border border-border/30 rounded-lg p-4 font-mono">
            <div className="flex items-center justify-between text-text-tertiary">
              <span className="text-[9px] uppercase tracking-wider font-bold">CLOUD RESOURCES</span>
              <Cloud size={14} className="text-indigo-400" />
            </div>
            <p className="text-2xl font-sans font-semibold text-white mt-2">
              {stats.activeCloudAssetsCount.toLocaleString()}
            </p>
            <div className="text-[8.5px] text-indigo-400 mt-1 flex items-center gap-1">
              <span className="w-1 h-1 bg-indigo-500 rounded-full inline-block" />
              <span>FEDERATED SECURITY</span>
            </div>
          </div>

          <div className="bg-[#050b18]/60 border border-border/30 rounded-lg p-4 font-mono">
            <div className="flex items-center justify-between text-text-tertiary">
              <span className="text-[9px] uppercase tracking-wider font-bold">TOPOLOGICAL EDGES</span>
              <Network size={14} className="text-violet-400" />
            </div>
            <p className="text-2xl font-sans font-semibold text-white mt-2">
              {(stats.interconnectedRelationsCount / 1000000).toFixed(2)}M
            </p>
            <div className="text-[8.5px] text-violet-400 mt-1 flex items-center gap-1">
              <span className="w-1 h-1 bg-violet-400 rounded-full inline-block" />
              <span>MILLIONS OF ACTIVE LINKS</span>
            </div>
          </div>

          <div className="bg-[#050b18]/60 border border-border/30 rounded-lg p-4 font-mono col-span-2 md:col-span-1">
            <div className="flex items-center justify-between text-text-tertiary">
              <span className="text-[9px] uppercase tracking-wider font-bold">COMPLIANCE DECK</span>
              <ShieldAlert size={14} className={stats.zeroTrustViolationsCount > 0 ? "text-amber-500" : "text-emerald-500"} />
            </div>
            <p className="text-2xl font-sans font-semibold text-white mt-2">
              {stats.zeroTrustViolationsCount} <span className="text-xs text-text-tertiary">risks</span>
            </p>
            <div className="text-[8.5px] mt-1 flex items-center gap-1 font-bold">
              {stats.zeroTrustViolationsCount > 0 ? (
                <span className="text-amber-400 uppercase tracking-widest">⚠️ ACTIONS REQUIRED</span>
              ) : (
                <span className="text-emerald-400 uppercase tracking-widest">✅ ZERO TRUST SAFE</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTROL SYSTEM WITHIN DATA FABRIC */}
      <div className="bg-[#040817] border border-border/20 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[680px]">
        
        {/* TAB MATRIX SELECTION DECK */}
        <div className="flex items-center justify-between border-b border-border/15 bg-[#030611] px-6 h-12 z-20 shrink-0">
          <div className="flex items-center h-full gap-2">
            {[
              { id: 'fabric', label: 'ENTERPRISE ASSETS CATALOGUE', icon: Database },
              { id: 'connectors', label: 'UNIVERSAL CONNECTORS GRID', icon: Cpu },
              { id: 'reconciliation', label: 'ZERO TRUST RISKS & COMPLIANCE', icon: Shield }
            ].map(t => {
              const TabIcon = t.icon;
              const isActive = panelTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setPanelTab(t.id as any)}
                  className={`flex items-center gap-2 h-full px-4 text-[10px] font-mono font-bold tracking-widest border-r border-[#0d213a]/30 transition-all relative ${
                    isActive ? 'text-accent-cyan bg-accent-cyan/5' : 'text-text-secondary hover:text-white'
                  }`}
                >
                  <TabIcon size={12} className={isActive ? 'text-accent-cyan' : 'text-text-tertiary'} />
                  <span>{t.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent-cyan shadow-[0_0_8px_#00FFD1]" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="font-mono text-[9px] text-[#00FFD1] bg-[#00FFD1]/10 px-2.5 py-1 rounded border border-accent-cyan/20 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#00FFD1] rounded-full animate-ping" />
            <span>METADATA-ONLY ENVELOPE: LOCKED</span>
          </div>
        </div>

        {/* WORKSPACE DECK */}
        <div className="flex-1 overflow-hidden flex relative">

          {/* TAB 1: ASSETS SYSTEM CONTROL */}
          {panelTab === 'fabric' && (
            <div className="flex-1 flex overflow-hidden">
              
              {/* ASSET CATALOGUE EXPLORER SIDE */}
              <div className="flex-1 flex flex-col overflow-hidden border-r border-border/10">
                
                {/* SEARCH AND FILTERS TOOLBAR */}
                <div className="p-4 bg-[#050b18]/40 border-b border-border/15 flex flex-col md:flex-row items-center gap-3 shrink-0">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-2.5 text-text-tertiary" size={14} />
                    <input
                      type="text"
                      placeholder="Search entities (e.g. database names, employees, server nodes, departments)..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-[#030611] text-white border border-border/40 pl-9 pr-4 py-2 text-xs font-mono rounded-md shadow-inner focus:outline-none focus:border-accent-cyan/80 placeholder:text-text-tertiary/70"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto shrink-0 font-mono text-[10px]">
                    <span className="text-text-tertiary">FILTER:</span>
                    <select
                      value={selectedType}
                      onChange={e => setSelectedType(e.target.value)}
                      className="bg-[#030611] text-accent-cyan border border-border/40 rounded px-2.5 py-1.5 focus:outline-none focus:border-accent-cyan/80 cursor-pointer"
                    >
                      <option value="all">ALL ASSET DOMAINS</option>
                      <option value="database">DATABASES & TABLE SCHEMAS</option>
                      <option value="application">FUSED APPLICATIONS</option>
                      <option value="employee">WORKFORCE ACCOUNT IDENTITIES</option>
                      <option value="department">DEPARTMENTS & STAKEHOLDERS</option>
                      <option value="infrastructure">HOST INFRASTRUCTURE</option>
                      <option value="cloud_resource">MULTICLOUD CLUSTERS</option>
                      <option value="governance_rule">COMPLIANCE POLICIES</option>
                    </select>
                  </div>
                </div>

                {/* SEARCH RESULTS SCROLLER */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
                  {isSearching ? (
                    <div className="h-full flex items-center justify-center font-mono text-xs text-text-tertiary">
                      <div className="flex flex-col items-center gap-3">
                        <RefreshCw size={24} className="text-accent-cyan animate-spin" />
                        <span>QUERIER COMMENCING METADATA SWEEP...</span>
                      </div>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="h-full flex items-center justify-center font-mono text-xs text-text-tertiary">
                      <div className="flex flex-col items-center gap-2 text-center p-8 border border-dashed border-border/10 rounded-lg max-w-sm">
                        <HelpCircle size={24} className="text-text-tertiary" />
                        <span className="font-bold">NO ALIGNED ASSETS LOCATED</span>
                        <p className="text-[10px] text-text-tertiary mt-1">
                          No safe matching enterprise properties detected with your query filters in the living topology cache.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 pb-8">
                      {searchResults.map(node => {
                        const isSelected = selectedNodeId === node.nodeId;
                        return (
                          <div
                            key={node.nodeId}
                            onClick={() => viewNodeDetails(node.nodeId)}
                            className={`p-4 border rounded-lg transition-all duration-250 cursor-pointer flex flex-col justify-between font-mono text-[10.5px] relative group h-[135px] ${
                              isSelected
                                ? 'bg-accent-cyan/5 border-accent-cyan shadow-[0_0_15px_rgba(0,255,209,0.06)]'
                                : 'bg-[#030613]/55 border-border/25 hover:border-accent-cyan/40 hover:bg-[#060c20]'
                            }`}
                          >
                            <div>
                              {/* Header Domain / Sensitivity */}
                              <div className="flex items-center justify-between border-b border-border/10 pb-1.5 mb-2">
                                <span className={`text-[8.5px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded ${
                                  node.type === 'database' ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-800/30' :
                                  node.type === 'application' ? 'text-amber-400 bg-amber-950/40 border border-amber-800/30' :
                                  node.type === 'employee' ? 'text-blue-400 bg-blue-950/40 border border-blue-800/30' :
                                  node.type === 'cloud_resource' ? 'text-indigo-400 bg-indigo-950/40 border border-indigo-800/30' :
                                  'text-emerald-400 bg-emerald-950/40 border border-emerald-800/30'
                                }`}>
                                  {node.type.toUpperCase()}
                                </span>

                                <span className={`text-[8.5px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded border ${
                                  node.sensitivity === 'HIGHLY_RESTRICTED' ? 'text-rose-400 bg-rose-950/60 border-rose-500/35' :
                                  node.sensitivity === 'RESTRICTED' ? 'text-amber-400 bg-amber-950/50 border-amber-500/30' :
                                  node.sensitivity === 'CONFIDENTIAL' ? 'text-indigo-400 bg-indigo-950/40 border-indigo-500/20' :
                                  node.sensitivity === 'INTERNAL' ? 'text-[#00FFD1] bg-[#00FFD1]/10 border-accent-cyan/20' :
                                  'text-text-secondary bg-white/5 border-white/10'
                                }`}>
                                  {node.sensitivity.replace('_', ' ')}
                                </span>
                              </div>

                              <h3 className="text-white text-xs font-sans font-medium tracking-tight mb-2 truncate group-hover:text-accent-cyan transition-colors">
                                {node.name}
                              </h3>
                            </div>

                            <div className="space-y-1 bg-[#010309]/50 p-2 rounded">
                              <div className="flex justify-between text-[9px] text-text-tertiary">
                                <span>OWNER COHORT:</span>
                                <span className="text-text-secondary truncate max-w-[170px] uppercase font-bold text-right">{node.ownerName}</span>
                              </div>
                              <div className="flex justify-between text-[9px] text-text-tertiary">
                                <span>BUSINESS UNIT:</span>
                                <span className="text-text-secondary truncate max-w-[170px] uppercase font-bold text-right">{node.departmentName}</span>
                              </div>
                            </div>

                            {/* Footer stats metadata */}
                            <div className="flex items-center justify-between mt-2.5 text-[8.5px] border-t border-border/10 pt-2 text-text-tertiary font-bold">
                              <span className="flex items-center gap-1">
                                <Network size={10} className="text-violet-400" />
                                <span>{node.relationCount} RELATIONS</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <Shield size={10} className="text-emerald-400" />
                                <span>GOV_SCORE: <b className={node.governanceScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}>{node.governanceScore}</b></span>
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* CONTEXT DRAWER - SIDE PANEL */}
              <div className="w-[360px] lg:w-[420px] bg-[#02050f] border-l border-border/15 flex flex-col overflow-hidden shrink-0 font-mono text-[10px]">
                <AnimatePresence mode="wait">
                  {!selectedNodeId ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#4b5b75]/90 space-y-4">
                      <div className="w-12 h-12 rounded-full border border-dashed border-[#4b5b75]/40 flex items-center justify-center text-[#4b5b75] animate-pulse">
                        <Database size={20} />
                      </div>
                      <div>
                        <h4 className="text-text-secondary text-[11px] font-bold uppercase tracking-widest">ASSET CONTEXT MONITOR</h4>
                        <p className="text-[10px] text-text-tertiary mt-2 max-w-[240px] leading-relaxed mx-auto">
                          Select any node from the enterprise topology list to drill down into schema metadata, compliance risk auditing, and visual transaction lineage.
                        </p>
                      </div>
                    </div>
                  ) : isDetailLoading ? (
                    <div className="flex-1 flex items-center justify-center text-text-tertiary">
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw size={24} className="text-accent-cyan animate-spin" />
                        <span>COMPILING COMPLEX TRACE INDEX...</span>
                      </div>
                    </div>
                  ) : !nodeContext ? (
                    <div className="flex-1 flex items-center justify-center text-[#4b5b75] p-8">
                      <span>CONTEXT NOT FOUND</span>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 flex flex-col overflow-hidden"
                    >
                      {/* Context title header */}
                      <div className="p-4 bg-[#050b18]/70 border-b border-border/20 flex items-center justify-between">
                        <div className="flex-1 min-w-0 pr-3">
                          <span className="text-[8px] uppercase font-bold text-accent-cyan tracking-widest bg-accent-cyan/10 px-2 py-0.5 rounded border border-accent-cyan/35 inline-block">
                            {nodeContext.node.type.toUpperCase()}
                          </span>
                          <h2 className="text-white text-xs font-sans font-medium mb-0.5 mt-1 truncate">
                            {nodeContext.node.name}
                          </h2>
                          <div className="text-[9px] text-text-tertiary font-bold truncate">ID: {nodeContext.node.id}</div>
                        </div>
                        <button
                          onClick={() => setSelectedNodeId(null)}
                          className="p-1 p-y-1 hover:bg-white/5 text-text-secondary hover:text-white rounded border border-border/10 shrink-0"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      {/* Content panel */}
                      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5 pb-12">
                        
                        {/* 1. METADATA PROFILE */}
                        <div className="space-y-2">
                          <h3 className="text-text-primary text-[9.5px] uppercase font-bold tracking-wider flex items-center gap-1.5 border-b border-border/10 pb-1">
                            <Layers size={10} className="text-accent-cyan" />
                            <span>SCHEMA CHARACTERISTICS</span>
                          </h3>

                          <div className="grid grid-cols-2 gap-2 bg-[#030713]/40 p-3 rounded border border-border/5">
                            <div>
                              <div className="text-text-tertiary text-[8px] uppercase font-bold">Risk Assessment</div>
                              <div className={`text-sm font-semibold mt-0.5 ${
                                nodeContext.node.riskScore > 70 ? 'text-rose-400' :
                                nodeContext.node.riskScore > 35 ? 'text-amber-400' : 'text-emerald-400'
                              }`}>{nodeContext.node.riskScore}/100</div>
                            </div>
                            <div>
                              <div className="text-text-tertiary text-[8px] uppercase font-bold">Severity Rating</div>
                              <div className="text-sm font-semibold text-accent-cyan mt-0.5">
                                {nodeContext.node.sensitivity.replace('_', ' ')}
                              </div>
                            </div>
                            <div className="col-span-2 border-t border-border/5 pt-2 mt-1">
                              <div className="text-text-tertiary text-[8px] uppercase font-bold">Volume Indicators</div>
                              <div className="text-[11px] font-semibold text-white mt-0.5">
                                {nodeContext.node.metadata.recordCount 
                                  ? `${nodeContext.node.metadata.recordCount.toLocaleString()} safe rows / units`
                                  : 'No schema counts reported'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 2. OWNERSHIP RESOLVER */}
                        <div className="space-y-2">
                          <h3 className="text-text-primary text-[9.5px] uppercase font-bold tracking-wider flex items-center gap-1.5 border-b border-border/10 pb-1">
                            <Key size={10} className="text-blue-400" />
                            <span>STAKEHOLDER SIGNATURE</span>
                          </h3>

                          <div className="bg-[#030713]/40 p-3 rounded border border-border/5 space-y-2.5">
                            <div>
                              <span className="text-text-tertiary text-[8.5px] uppercase font-bold block">Assigned Custodian:</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full shrink-0" />
                                <span className="text-white text-[11px] font-sans font-medium">
                                  {nodeContext.ownershipChain?.ownerEmployee?.name || 'Globally System-Owned'}
                                </span>
                              </div>
                              {nodeContext.ownershipChain?.ownerEmployee?.metadata?.role && (
                                <span className="text-[9px] text-[#4af9ff] bg-[#4af9ff]/10 border border-[#4af9ff]/20 px-1.5 py-0.5 rounded ml-3.5 mt-1 inline-block">
                                  {nodeContext.ownershipChain.ownerEmployee.metadata.role}
                                </span>
                              )}
                            </div>

                            <div className="border-t border-border/10 pt-2.5">
                              <span className="text-text-tertiary text-[8.5px] uppercase font-bold block">Sponsoring Executive:</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full shrink-0" />
                                <span className="text-white text-[11px] font-sans font-medium">
                                  {nodeContext.ownershipChain?.executiveSponsor?.name || 'Corporate Executive Board'}
                                </span>
                              </div>
                              {nodeContext.ownershipChain?.businessUnit && (
                                <span className="text-[8.5px] text-text-tertiary uppercase mt-1 block">
                                  REGIONAL BU: <b>{nodeContext.ownershipChain.businessUnit}</b>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 3. BUSINESS RISK CASCADE */}
                        <div className="space-y-2">
                          <h3 className="text-text-primary text-[9.5px] uppercase font-bold tracking-wider flex items-center gap-1.5 border-b border-border/10 pb-1">
                            <AlertTriangle size={10} className="text-amber-400" />
                            <span>COGNITIVE FAILURE CASCADES</span>
                          </h3>

                          {nodeContext.businessImpact ? (
                            <div className="bg-[#030713]/40 p-3 rounded border border-border/5 space-y-2">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="text-text-tertiary">CASCADE SEVERITY score:</span>
                                <span className={`font-bold ${
                                  nodeContext.businessImpact.failureImpactScore > 65 ? 'text-rose-400' : 'text-amber-400'
                                }`}>{nodeContext.businessImpact.failureImpactScore}/100</span>
                              </div>

                              <div className="flex justify-between items-center text-[10px]">
                                <span className="text-text-tertiary">RECOVERY COMPLEXITY:</span>
                                <span className="text-white font-bold bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[8px]">
                                  {nodeContext.businessImpact.recoveryComplexity}
                                </span>
                              </div>

                              <div className="border-t border-[#0d213a]/30 pt-2 space-y-1.5 text-[9px] text-text-secondary leading-normal">
                                {nodeContext.businessImpact.affectedDepartments.length > 0 && (
                                  <div>
                                    <span className="text-text-tertiary font-bold tracking-wider uppercase block text-[8px]">reliant departments:</span>
                                    <span>{nodeContext.businessImpact.affectedDepartments.join(', ')}</span>
                                  </div>
                                )}
                                {nodeContext.businessImpact.affectedApplications.length > 0 && (
                                  <div>
                                    <span className="text-text-tertiary font-bold tracking-wider uppercase block text-[8px]">impacted services:</span>
                                    <span>{nodeContext.businessImpact.affectedApplications.join(', ')}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="text-[9px] text-[#4b5b75] italic">No active cascades registered.</div>
                          )}
                        </div>

                        {/* 4. DATA LINEAGE MAP */}
                        <div className="space-y-2">
                          <h3 className="text-text-primary text-[9.5px] uppercase font-bold tracking-wider flex items-center gap-1.5 border-b border-border/10 pb-1">
                            <Network size={10} className="text-violet-400" />
                            <span>SECURE DATA LINEAGE</span>
                          </h3>

                          {nodeContext.dataLineage && nodeContext.dataLineage.length > 0 ? (
                            <div className="space-y-2 bg-[#02050f] p-3 rounded border border-border/10">
                              {nodeContext.dataLineage.map((lin: any, idx: number) => (
                                <div key={idx} className="border-b border-[#0d213a]/30 last:border-0 pb-2 last:pb-0 mb-2 last:mb-0">
                                  <div className="flex items-center gap-1 text-[9px] font-bold text-accent-cyan">
                                    <span className="w-1 h-1 bg-[#00FFD1] rounded-full inline-block" />
                                    <span>STREAM DEPTH: SOURCE TO CONSUMER</span>
                                  </div>
                                  
                                  <div className="space-y-1.5 pl-2.5 mt-2 border-l border-border/10">
                                    <div className="flex items-center gap-1.5 text-text-secondary">
                                      <HardDrive size={10} className="text-[#00FFD1]" />
                                      <span className="text-[9.5px] font-sans font-medium text-white truncate">{lin.sourceName}</span>
                                    </div>
                                    
                                    {lin.transforms.map((t: string, tIdx: number) => (
                                      <div key={tIdx} className="flex items-center gap-1.5 text-text-tertiary pl-3">
                                        <ArrowRight size={8} className="text-[#00FFD1]/60" />
                                        <Cpu size={9} className="text-amber-400" />
                                        <span className="truncate">{t}</span>
                                      </div>
                                    ))}

                                    <div className="flex items-center gap-1.5 text-text-tertiary pl-3">
                                      <CornerDownRight size={9} strokeWidth={2.5} className="text-[#00FFD1]/80" />
                                      <UserCheck size={9} className="text-blue-400" />
                                      <span className="text-text-secondary truncate">{lin.consumerName}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="bg-[#030713]/40 p-3 rounded border border-border/5 text-[9px] text-[#4b5b75]/90 italic leading-relaxed text-center">
                              No sequential transformation routes tracked. This is a terminal leaf node in the data lineage system.
                            </div>
                          )}
                        </div>

                        {/* 5. ACTIVE RELATIONSHIPS */}
                        <div className="space-y-2">
                          <h3 className="text-text-primary text-[9.5px] uppercase font-bold tracking-wider flex items-center gap-1.5 border-b border-border/10 pb-1">
                            <Activity size={10} className="text-emerald-400" />
                            <span>ADJACENT CORRELATIONS</span>
                          </h3>

                          {nodeContext.relationships && nodeContext.relationships.length > 0 ? (
                            <div className="space-y-1.5">
                              {nodeContext.relationships.map((rel: any, idx: number) => (
                                <div
                                  key={idx}
                                  onClick={() => viewNodeDetails(rel.targetId)}
                                  className="flex items-center justify-between p-2 bg-[#04091a]/85 hover:bg-[#07102a] border border-border/10 rounded cursor-pointer transition-colors group"
                                >
                                  <div className="min-w-0 pr-2">
                                    <span className="text-[7.5px] uppercase font-bold text-text-tertiary tracking-wider block">
                                      {rel.type.replace('_', ' ')}
                                    </span>
                                    <span className="text-white text-[9.5px] truncate font-sans font-medium block mt-0.5 group-hover:text-accent-cyan transition-colors">
                                      {rel.targetName}
                                    </span>
                                  </div>

                                  <div className="shrink-0 text-right">
                                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                      rel.direction === 'OUTGOING' ? 'text-[#00FFD1] bg-[#00FFD1]/10' : 'text-violet-400 bg-violet-950/40'
                                    }`}>
                                      {rel.direction === 'OUTGOING' ? 'OUT' : 'IN'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-[9px] text-[#4b5b75] italic">No direct correlations linked.</div>
                          )}
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          )}

          {/* TAB 2: UNIVERSAL CONNECTORS GRID */}
          {panelTab === 'connectors' && (
            <div className="flex-1 flex flex-col overflow-hidden p-6 font-mono text-[10.5px]">
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#0d213a]/30 pb-4 mb-4 select-none">
                <div>
                  <h3 className="text-white font-sans text-[13px] font-medium tracking-tight">ACTIVE ENTERPRISE INGESTION GRID</h3>
                  <p className="text-[10px] text-text-tertiary mt-0.5 font-mono">
                    System channels polling and parsing continuous metadata directories. Trigger manual handshakes or mutate schedule frequencies instantly.
                  </p>
                </div>

                <div className="font-mono text-[9px] text-text-tertiary flex items-center gap-1.5 hover:text-white transition-colors">
                  <Activity size={12} className="text-[#00FFD1] animate-pulse" />
                  <span>DEVOPS TELEMETRY: ALL INTEGRATIONS STEADY</span>
                </div>
              </div>

              {/* GRID BOXES */}
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pb-8 pr-1">
                {connectors.map(conn => {
                  const isSyncing = syncsRunning[conn.id];
                  return (
                    <div key={conn.id} className="bg-[#030611] border border-border/25 rounded-lg p-5 flex flex-col xl:flex-row justify-between gap-4 relative">
                      
                      {/* Left: General Spec Info */}
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 text-[8.5px] font-bold rounded ${
                            conn.status === 'ACTIVE' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/30' :
                            conn.status === 'SYNCING' ? 'bg-[#0a2f4c] text-[#00FFD1] border border-[#00FFD1]/30 animate-pulse' :
                            'bg-amber-950/45 text-amber-400 border border-amber-800/30'
                          }`}>
                            ● {conn.status}
                          </span>

                          <span className="bg-white/5 border border-white/10 text-white font-bold text-[8.5px] px-2 py-0.5 rounded">
                            TYPE: {conn.type}
                          </span>

                          <span className="text-text-tertiary text-[9.5px] font-sans font-semibold">
                            ENDPOINT: <b className="text-text-secondary select-all">{conn.config.connectionEndpoint}</b>
                          </span>
                        </div>

                        <div>
                          <h4 className="text-white text-xs font-sans font-medium tracking-tight">{conn.name}</h4>
                          <span className="text-[9px] text-[#5e779a] uppercase font-bold">
                            Ingested Targets: <b className="text-text-secondary">{conn.targetSystem}</b> (Interval: {conn.config.syncIntervalMinutes}m)
                          </span>
                        </div>

                        {/* Visual Telemetry Mini Deck */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#010309]/50 p-2.5 rounded border border-border/5">
                          <div>
                            <span className="text-text-tertiary text-[8px] uppercase block">SYS PINGS (p95)</span>
                            <span className="text-white text-[10.5px] font-sans font-semibold mt-0.5">{conn.avgLatencyMs}ms / {conn.p95LatencyMs}ms</span>
                          </div>
                          <div>
                            <span className="text-text-tertiary text-[8px] uppercase block">TRANSACTIONS ERROR</span>
                            <span className="text-emerald-400 text-[10.5px] font-sans font-semibold mt-0.5">0.00%</span>
                          </div>
                          <div>
                            <span className="text-text-tertiary text-[8px] uppercase block">FLOW UPTIME</span>
                            <span className="text-white text-[10.5px] font-sans font-semibold mt-0.5">{conn.uptimePercentage?.toFixed(2)}%</span>
                          </div>
                          <div>
                            <span className="text-text-tertiary text-[8px] uppercase block">TOTAL SYNCED METRICS</span>
                            <span className="text-accent-cyan text-[10.5px] font-sans font-semibold mt-0.5">{conn.syncedCount.toLocaleString()} events</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Live Monitor Terminal & Controls */}
                      <div className="w-full xl:w-[480px] shrink-0 flex flex-col justify-between gap-3 font-mono text-[9px]">
                        
                        {/* Interactive mini screen with console logs */}
                        <div className="bg-black/90 p-3.5 border border-border/20 rounded h-[120px] overflow-y-auto font-mono text-[8.5px] text-emerald-400/95 space-y-1 scroll-bar-mono cursor-text select-text scrollbar-thin">
                          <span className="text-[#00FFD1] block lowercase font-bold tracking-wider mb-1">=== connector_broker_cli_logs_stdout ===</span>
                          {conn.logs && conn.logs.map((log, lIdx) => (
                            <div key={lIdx} className="leading-snug">
                              <span className="text-text-tertiary shrink-0 block sm:inline-block pr-1">[{conn.id}]</span>
                              <span>{log}</span>
                            </div>
                          ))}
                        </div>

                        {/* Interactive triggers */}
                        <div className="flex items-center gap-2">
                          <button
                            disabled={isSyncing}
                            onClick={() => handleManualSync(conn.id)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-[#0d2a4a]/80 hover:bg-[#113a66] border border-accent-cyan/30 text-accent-cyan font-bold tracking-widest rounded disabled:opacity-40 transition-all uppercase select-none"
                          >
                            <RefreshCw size={10} className={isSyncing ? 'animate-spin' : ''} />
                            <span>{isSyncing ? 'Ingesting...' : 'MANUAL INGEST STREAM'}</span>
                          </button>

                          <button
                            onClick={() => handleOpenConfig(conn)}
                            className="px-3.5 py-1.5 bg-[#030611] hover:bg-white/5 border border-border/20 text-white rounded font-bold tracking-widest transition-all text-[8.5px] uppercase flex items-center gap-1 select-none"
                          >
                            <Edit3 size={10} />
                            <span>RECONFIG ADAPTER</span>
                          </button>
                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 3: GRC RISKS RECONCILIATION */}
          {panelTab === 'reconciliation' && (
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar font-mono text-[10.5px] space-y-6">
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#0d213a]/30 pb-4">
                <div>
                  <h3 className="text-white font-sans text-[13px] font-medium tracking-tight">TOPOLOGICAL ZERO TRUST ENVELOPE</h3>
                  <p className="text-[10px] text-text-tertiary mt-0.5">
                    Automated governance engines analyzing metadata edges for missing compliance policies or inappropriate cross-account privileges.
                  </p>
                </div>
                
                <button
                  onClick={handleGlobalRefresh}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/35 text-rose-300 rounded text-[9px] font-mono font-bold tracking-widest transition-all"
                >
                  <ShieldAlert size={11} className="text-rose-400" />
                  <span>EXECUTE COMPLIANCE RUN</span>
                </button>
              </div>

              {/* BENTO STAT DETAILED VIEWER */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pb-8">
                
                {/* Visual Vulnerability Census */}
                <div className="bg-[#030611] border border-[#ff3156]/20 rounded-lg p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-border/10 pb-2">
                    <span className="text-[9px] uppercase font-bold text-rose-400 tracking-wider flex items-center gap-1.5">
                      <ShieldX size={12} className="text-rose-400" />
                      <span>CRITICAL POLICY VIOLATIONS DETECTED</span>
                    </span>
                    <span className="text-[8.5px] text-rose-400 bg-rose-950/30 border border-rose-500/20 px-2 py-0.5 rounded uppercase font-bold">
                      COGNITIVE POLICING ACTIVE
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
                    
                    {/* Failure 1 */}
                    <div className="p-3 bg-[#130307]/50 border border-rose-500/20 rounded space-y-1.5">
                      <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                        <AlertTriangle size={12} className="text-rose-400 shrink-0" />
                        <span className="text-[10px] uppercase">COGNITIVE PRIVILEGE CRITICAL BREACH</span>
                      </div>
                      <p className="text-[9.5px] text-text-secondary leading-normal">
                        AD-LDAP identity guest-collaborator is accessing HIGHLY_RESTRICTED asset [Corporate Payroll Database Cluster]. This exceeds authorized Zero Trust bounds.
                      </p>
                    </div>

                    {/* Failure 2 */}
                    <div className="p-3 bg-[#130307]/50 border border-rose-500/20 rounded space-y-1.5">
                      <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                        <AlertTriangle size={12} className="text-rose-400 shrink-0" />
                        <span className="text-[10px] uppercase">GOVERNED COMPLIANCE HOLE DISCOVERED</span>
                      </div>
                      <p className="text-[9.5px] text-text-secondary leading-normal">
                        Confidential database cluster [Okta Federated User Directory Metadata] mapped to GRC classification bucket GDPR isolation but has 0 bound Governance Policies inside fabric cache.
                      </p>
                    </div>

                    {/* Failure 3 */}
                    <div className="p-3 bg-[#0d0d1e]/80 border border-amber-500/20 rounded space-y-1.5">
                      <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                        <AlertTriangle size={12} className="text-amber-500 shrink-0" />
                        <span className="text-[10px] uppercase">ISOLATED ORPHAN COMPLIANCE WARN</span>
                      </div>
                      <p className="text-[9.5px] text-text-secondary leading-normal">
                        AWS S3 Financial statements regulating cold bucket is fully unowned (lacks direct employee owner and executive cohort assigned). Mapped under risk status ORPHAN_GLOBAL_SECTOR.
                      </p>
                    </div>

                  </div>
                </div>

                {/* Single Point of Failures */}
                <div className="bg-[#030611] border border-border/20 rounded-lg p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-border/10 pb-2 select-none">
                    <span className="text-[9px] uppercase font-bold text-accent-cyan tracking-wider flex items-center gap-1.5">
                      <Server size={12} className="text-accent-cyan" />
                      <span>SPOFs CENSUS REPORT (SINGLE POINT OF FAILS)</span>
                    </span>
                    <span className="text-[8.5px] text-text-tertiary">TIER-1 CORE ARCHITECTURES</span>
                  </div>

                  <div className="space-y-3 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
                    
                    <div className="p-3 bg-[#010410] border border-border/10 rounded space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-sans font-bold text-[#00FFD1] text-[10px] uppercase">AWS Dedicated RDS SQL Instance Host</span>
                        <span className="text-rose-400 bg-rose-950/45 px-1.5 py-0.5 rounded text-[8px] font-bold">IMPACT score: 85</span>
                      </div>
                      <p className="text-[9px] text-text-tertiary leading-normal">
                        Supports PostgreSQL Payroll DB & LDAP directories metadata. Outage triggers cascading downstream collapse of 5 different operational application services, blocking financial operations globally.
                      </p>
                    </div>

                    <div className="p-3 bg-[#010410] border border-border/10 rounded space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-sans font-bold text-[#00FFD1] text-[10px] uppercase">AD Federated Okta Identity App Gateway</span>
                        <span className="text-rose-400 bg-rose-950/45 px-1.5 py-0.5 rounded text-[8px] font-bold">IMPACT score: 78</span>
                      </div>
                      <p className="text-[9px] text-text-tertiary leading-normal">
                        Single point of security verification for external and internal portals. Critical failure cascade triggers lockout state for over 104,520 accounts inside workforce hubs.
                      </p>
                    </div>

                    <div className="p-3 bg-[#010410] border border-border/10 rounded space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-sans font-bold text-[#00FFD1] text-[10px] uppercase">EKS Kubernetes Tokyo Node Group 1</span>
                        <span className="text-amber-400 bg-amber-950/30 px-1.5 py-0.5 rounded text-[8px] font-bold">IMPACT score: 62</span>
                      </div>
                      <p className="text-[9px] text-text-tertiary leading-normal">
                        Hosts Ingress APIs and billing APIs. Isolated clusters backup is active but latency surges with complete pipeline queue backpressures estimated at 6500ms on secondary failovers.
                      </p>
                    </div>

                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      </div>

      {/* CONNECTOR EDIT/CONFIG MODAL */}
      <AnimatePresence>
        {editorConnector && (
          <div className="fixed inset-0 bg-[#00020a]/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#02050f] border border-accent-cyan/20 rounded-xl p-6 w-full max-w-lg shadow-[0_0_50px_rgba(0,255,209,0.06)] font-mono text-[10.5px]"
            >
              
              {/* Modal header */}
              <div className="flex items-center justify-between border-b border-border/15 pb-3.5 mb-4 select-none">
                <div className="flex items-center gap-2">
                  <Cpu className="text-accent-cyan" size={16} />
                  <span className="text-white font-sans text-xs font-semibold">RECONFIGURE ADAPTER PORT</span>
                </div>

                <button
                  onClick={() => setEditorConnector(null)}
                  className="p-1 hover:bg-white/5 text-text-secondary hover:text-white rounded border border-border/10 shrink-0"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Form schema */}
              <form onSubmit={handleSaveConfig} className="space-y-4">
                
                <div className="p-3 bg-[#04091a] border border-border/15 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="text-text-tertiary text-[8px] uppercase block font-bold">Active Adapter Identifier:</span>
                    <span className="text-white font-sans text-[11.5px] font-medium block mt-0.5">{editorConnector.name}</span>
                    <span className="text-text-tertiary text-[9.5px] block mt-0.5">TARGET SYSTEM: <b>{editorConnector.targetSystem}</b></span>
                  </div>
                  {editorConnector.id === 'conn-entra-id-oauth' && (
                    <span className={`px-2 py-0.5 text-[8.5px] font-bold rounded ${
                      azureConfig?.isConfigured 
                        ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-rose-950/50 text-rose-400 border border-rose-500/20'
                    }`}>
                      {azureConfig?.isConfigured ? 'AUTHORIZED OIDC' : 'OAWTH_REQUIRED'}
                    </span>
                  )}
                </div>

                {editorConnector.id === 'conn-entra-id-oauth' ? (
                  // --- Custom Fields for Microsoft Entra ID (Azure AD) ---
                  <div className="space-y-3 p-3 bg-[#010412] border border-border/15 rounded-lg">
                    <div className="flex items-center gap-1.5 text-[#00FFD1] text-[9.5px] font-bold tracking-wider mb-2 border-b border-border/10 pb-1.5 uppercase">
                      <Lock size={12} />
                      <span>Microsoft Entra ID Connection Bindings</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold text-text-tertiary uppercase block">Entra Tenant ID</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. common, organizations or UUID"
                          value={azureTenantId}
                          onChange={e => setAzureTenantId(e.target.value)}
                          className="w-full bg-[#030611] border border-border/40 text-white rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-[#00FFD1]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold text-text-tertiary uppercase block">Client Application ID</label>
                        <input
                          type="text"
                          required
                          placeholder="Application (client) ID URL/UUID"
                          value={azureClientId}
                          onChange={e => setAzureClientId(e.target.value)}
                          className="w-full bg-[#030611] border border-border/40 text-white rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-[#00FFD1]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-text-tertiary uppercase block">Client Secret Key</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••••••••••••••••••••••••••"
                        value={azureClientSecret}
                        onChange={e => setAzureClientSecret(e.target.value)}
                        className="w-full bg-[#030611] border border-border/40 text-white rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-[#00FFD1]"
                      />
                    </div>

                    {/* Interactive Active Directory Connection Gateway Status and OAuth Link Trigger */}
                    <div className="pt-2">
                      {azureConfig?.isConfigured ? (
                        <div className="bg-[#021c17] border border-emerald-500/25 p-3 rounded space-y-2 text-[9px]">
                          <div className="flex items-center gap-1 text-emerald-400 font-bold">
                            <CheckCircle2 size={12} />
                            <span>CONNECTED AD BOUNDARY ACTIVE</span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[8px] text-slate-300">
                            <div>Sync Mode: <b className="text-emerald-400">{azureConfig?.syncStats?.status || 'ACTIVE'}</b></div>
                            <div>Synced Users: <b className="text-white">{azureConfig?.syncStats?.syncedUsersCount || 0} accounts</b></div>
                            <div>Synced Groups: <b className="text-white">{azureConfig?.syncStats?.syncedGroupsCount || 0} security groups</b></div>
                            <div>Synced Roles: <b className="text-white">{azureConfig?.syncStats?.syncedRolesCount || 0} definitions</b></div>
                          </div>
                          <button
                            type="button"
                            onClick={handleConnectAzureOAuth}
                            className="w-full py-1.5 bg-[#0a352d]/40 hover:bg-[#0a352d]/70 text-[#00FFD1] border border-[#00FFD1]/30 rounded text-[8.5px] uppercase font-semibold font-sans tracking-wide transition-colors"
                          >
                            Re-Authorize Directory Consent
                          </button>
                        </div>
                      ) : (
                        <div className="bg-[#1a070e] border border-rose-500/20 p-3 rounded space-y-2 text-[9px]">
                          <div className="flex items-center gap-1 text-rose-400 font-bold">
                            <AlertTriangle size={12} className="text-rose-400" />
                            <span>DIRECTORY HANDSHAKE INCOMPLETE</span>
                          </div>
                          <p className="text-[8.5px] text-text-secondary leading-tight">
                            Identity databases require authorization clearance. Save client configurations above, then complete the Microsoft Sign-In Consent portal below.
                          </p>
                          <button
                            type="button"
                            onClick={handleConnectAzureOAuth}
                            className="w-full py-2 bg-[#dc2626]/20 hover:bg-[#dc2626]/30 text-rose-300 border border-rose-500/40 rounded text-[9px] uppercase font-bold tracking-widest transition-all flex items-center justify-center gap-1"
                          >
                            <Key size={11} className="text-rose-400 animate-pulse" />
                            <span>ESTABLISH DIRECT AD BOUNDARY (OAUTH)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // --- General Connector Endpoints ---
                  <div className="space-y-1">
                    <label className="text-[8.5px] font-bold text-text-tertiary uppercase block">Federated Connection Endpoint URL</label>
                    <input
                      type="text"
                      required
                      value={formEndpoint}
                      onChange={e => setFormEndpoint(e.target.value)}
                      className="w-full bg-[#030611] border border-border/40 text-white rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-accent-cyan"
                    />
                    <span className="text-[8px] text-text-tertiary block mt-0.5">Host address, secure socket endpoint, or AWS IAM Role ARN to request directories.</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8.5px] font-bold text-text-tertiary uppercase block">Sync Interval Frequency</label>
                    <select
                      value={formInterval}
                      onChange={e => setFormInterval(Number(e.target.value))}
                      className="w-full bg-[#030611] border border-border/40 text-accent-cyan rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-accent-cyan/80"
                    >
                      <option value="5">EVERY 5 MINUTES</option>
                      <option value="15">EVERY 15 MINUTES</option>
                      <option value="30">EVERY 30 MINUTES</option>
                      <option value="60">EVERY HOUR</option>
                      <option value="120">EVERY 2 HOURS</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8.5px] font-bold text-text-tertiary uppercase block">Handshake Authentication Type</label>
                    <select
                      value={formAuth}
                      disabled={editorConnector.id === 'conn-entra-id-oauth'}
                      onChange={e => setFormAuth(e.target.value as any)}
                      className="w-full bg-[#030611] border border-border/40 text-accent-cyan rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-accent-cyan/80 disabled:opacity-55"
                    >
                      <option value="OAUTH">FEDERATED OAuth / OIDC</option>
                      <option value="IAM_ROLE">AWS IAM ROLE TRUST</option>
                      <option value="TOKEN">FEDERATED OAuth TOKEN</option>
                      <option value="BASIC">MUTUAL TLS SECURE Handshake</option>
                    </select>
                  </div>
                </div>

                {/* Secure notice info */}
                <div className="bg-accent-cyan/5 border border-accent-cyan/30 p-3 rounded text-[9.5px] text-accent-cyan flex gap-2">
                  <Shield size={14} className="shrink-0 mt-0.5" />
                  <p className="leading-snug">
                    <b>GOVERNANCE LOCK COMPLIANT:</b> Metadata-only extraction is hard-enforced. Raw data streams are blocked via structural schemas. Financial ledger counts, schema tags, and column mappings are the only fields written to the fabric.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 border-t border-border/15 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditorConnector(null)}
                    className="px-4 py-2 bg-[#030611] hover:bg-white/5 border border-border/20 text-white font-bold tracking-widest rounded uppercase text-[8.5px]"
                  >
                    DISCARD CHANGES
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-accent-cyan/20 to-accent-cyan/35 hover:from-accent-cyan/30 hover:to-accent-cyan/45 border border-accent-cyan/40 text-accent-cyan font-bold tracking-widest rounded uppercase text-[8.5px] shadow-[0_0_12px_rgba(0,255,209,0.1)]"
                  >
                    {isSavingAzureConfig ? 'SAVING ADAPTER CONFIG...' : 'SAVE ADAPTER SCHEME'}
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

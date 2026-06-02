import { useState, useEffect } from 'react';
import { 
  Brain, ShieldAlert, FileText, Activity, AlertCircle, ArrowRight, 
  HelpCircle, Sparkles, TrendingUp, RefreshCw, Layers, ShieldCheck, 
  Clock, CheckCircle, Flame, Users, Network
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function AIReasoningStudio() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [context, setContext] = useState<any>(null);
  const [hypotheses, setHypotheses] = useState<any[]>([]);
  const [selectedHypothesis, setSelectedHypothesis] = useState<any>(null);
  const [selectedExplaining, setSelectedExplaining] = useState<any>(null);
  const [explainingLoading, setExplainingLoading] = useState(false);
  
  // Predictions and Brief
  const [predictions, setPredictions] = useState<any[]>([]);
  const [brief, setBrief] = useState<any>(null);
  const [memory, setMemory] = useState<any[]>([]);
  const [graph, setGraph] = useState<any>(null);

  // Decision Support System State
  const [queryInput, setQueryInput] = useState('');
  const [queryResponse, setQueryResponse] = useState<string | null>(null);
  const [queryEntities, setQueryEntities] = useState<string[]>([]);
  const [queryScore, setQueryScore] = useState<number | null>(null);
  const [queryLoading, setQueryLoading] = useState(false);

  useEffect(() => {
    fetchInitialCognitiveData();
  }, []);

  const fetchInitialCognitiveData = async () => {
    setLoading(true);
    try {
      // 1. Fetch general status (hypotheses, memory, context)
      const statusRes = await fetch('/api/v2/cognition/status');
      const statusData = await statusRes.json();
      if (statusData.success) {
        setContext(statusData.context);
        setHypotheses(statusData.hypotheses);
        setMemory(statusData.organizationalMemory || []);
        if (statusData.hypotheses?.length > 0) {
          setSelectedHypothesis(statusData.hypotheses[0]);
        }
      }

      // 2. Fetch predictions
      const predRes = await fetch('/api/v2/cognition/predictions');
      const predData = await predRes.json();
      if (predData.success) {
        setPredictions(predData.predictions || []);
      }

      // 3. Fetch brief
      const briefRes = await fetch('/api/v2/cognition/brief');
      const briefData = await briefRes.json();
      if (briefData.success) {
        setBrief(briefData.brief);
      }

      // 4. Fetch decision graph
      const graphRes = await fetch('/api/v2/cognition/decision-graph');
      const graphData = await graphRes.json();
      if (graphData.success) {
        setGraph(graphData.graph);
      }
    } catch (err) {
      console.error('Failed to load cognitive data', err);
    } finally {
      setLoading(false);
    }
  };

  const executeManualRecognition = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/v2/cognition/status');
      const data = await res.json();
      if (data.success) {
        setContext(data.context);
        setHypotheses(data.hypotheses);
        setMemory(data.organizationalMemory || []);
      }
      
      const graphRes = await fetch('/api/v2/cognition/decision-graph');
      const graphData = await graphRes.json();
      if (graphData.success) {
        setGraph(graphData.graph);
      }
    } catch (err) {
      console.error('Trigger cycle failed', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleFetchExplanation = async (hypId: string) => {
    setExplainingLoading(true);
    setSelectedExplaining(null);
    try {
      const res = await fetch('/api/v2/cognition/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hypothesisId: hypId })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedExplaining(data.explanation);
      }
    } catch (err) {
      console.error('Error fetching explanation', err);
    } finally {
      setExplainingLoading(false);
    }
  };

  const handlePresetQuery = (preset: string) => {
    setQueryInput(preset);
    executeSupportQuery(preset);
  };

  const executeSupportQuery = async (queryToRun?: string) => {
    const activeQuery = queryToRun || queryInput;
    if (!activeQuery.trim()) return;

    setQueryLoading(true);
    setQueryResponse(null);
    try {
      const res = await fetch('/api/v2/cognition/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: activeQuery })
      });
      const data = await res.json();
      if (data.success) {
        setQueryResponse(data.answerMarkdown);
        setQueryEntities(data.relevantEntities || []);
        setQueryScore(data.riskScore);
      }
    } catch (err) {
      console.error('Query execution error', err);
    } finally {
      setQueryLoading(false);
    }
  };

  // Watch for hypothesis selection to load detailed diagnostic
  useEffect(() => {
    if (selectedHypothesis) {
      handleFetchExplanation(selectedHypothesis.id);
    }
  }, [selectedHypothesis]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#040715] text-text-secondary border border-border/40 m-6 rounded-lg font-mono">
        <RefreshCw className="w-8 h-8 text-accent-cyan animate-spin mb-4" />
        <div className="text-[10px] tracking-[0.2em]">SYNCHRONIZING ENTERPRISE KNOWLEDGE CONTEXT...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#020510] h-full overflow-y-auto p-6 space-y-6 select-none uppercase font-sans text-xs">
      
      {/* COGNITIVE HEADER STATS */}
      <div className="flex flex-col lg:flex-row items-stretch justify-between gap-6">
        <div className="flex items-center gap-4 bg-[#050b1c] border border-border/80 px-6 py-4 rounded-lg flex-1">
          <div className="p-3 bg-accent-cyan/10 rounded-md border border-accent-cyan/20">
            <Brain className="w-6 h-6 text-accent-cyan" />
          </div>
          <div>
            <div className="text-[14px] font-bold text-white tracking-widest flex items-center gap-2">
              SENTINELX ENTERPRISE COGNITION SYSTEM
              <Sparkles className="w-3.5 h-3.5 text-accent-cyan animate-pulse" />
            </div>
            <div className="text-[9px] font-mono text-text-tertiary tracking-wider mt-0.5">
              Active Knowledge Synthesis & Multi-Step Diagnostic Reasoning
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={executeManualRecognition}
            disabled={refreshing}
            className="flex items-center gap-2 px-5 py-3.5 bg-[#0a1129] hover:bg-[#121d42] border border-border/70 rounded-md text-text-primary text-[10px] font-mono font-bold tracking-widest hover:border-accent-cyan/50 active:scale-95 transition-all text-white cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-accent-cyan' : ''}`} />
            <span>{refreshing ? 'COGNITIVE RESOLVING...' : 'Trigger Analytical Audit'}</span>
          </button>
        </div>
      </div>

      {/* COMPACT DAILY BRIEF PAPER */}
      {brief && (
        <div className="bg-[#050b1c] border-l-4 border-l-accent-cyan border-y border-r border-border p-5 rounded-r-lg relative overflow-hidden backdrop-blur-md">
          <div className="absolute right-4 top-4 text-[40px] font-mono font-black text-white/5 pointer-events-none select-none">DAILY BRIEF</div>
          <div className="flex items-center gap-2 text-white font-bold tracking-wide text-[10.5px]">
            <Clock className="w-4.5 h-4.5 text-accent-cyan" />
            <span>DAILY EXECUTIVE INTELLIGENCE BRIEF — {new Date(brief.timestamp).toLocaleDateString()}</span>
          </div>
          <p className="mt-3 text-text-secondary text-[11.5px] lowercase first-letter:uppercase normal-case leading-relaxed font-sans max-w-5xl">
            {brief.dailyIntelligenceBrief}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border/40">
            <div className="space-y-0.5">
              <span className="text-[8px] font-mono text-text-tertiary tracking-wider">OPERATIONAL HEALTH</span>
              <p className="text-[12px] font-bold text-accent-cyan leading-none font-sans">{brief.operationalHealthSummary}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[8px] font-mono text-text-tertiary tracking-wider">GOVERNANCE METRIC</span>
              <p className="text-[12px] font-bold text-white leading-none font-sans">{brief.governanceSummary}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[8px] font-mono text-text-tertiary tracking-wider">RISK EVOLUTION</span>
              <p className="text-[12px] font-bold text-rose-400 leading-none font-sans">{brief.riskEvolutionSummary}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[8px] font-mono text-text-tertiary tracking-wider">PRIMARY INSIGHT</span>
              <div className="text-[11px] font-medium text-text-primary mt-1 lowercase first-letter:uppercase normal-case leading-tight list-disc pl-3">
                {brief.executiveInsights?.[0]}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CORE REASONING TRACE & EXPLANATION DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: ACTIVE HYPOTHESES SELECTION */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="card h-full flex flex-col bg-[#050b1c] border border-border p-5 rounded-lg">
            <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
              <div className="flex items-center gap-2 font-bold tracking-wider text-[11px]">
                <Activity className="w-4 h-4 text-accent-cyan" />
                <span>RESOLVED ENTERPRISE HYPOTHESES</span>
              </div>
              <span className="px-2 py-0.5 bg-[#0c1633] text-[9px] font-mono text-accent-blue rounded border border-accent-blue/10">
                {hypotheses.length} ACTIVE
              </span>
            </div>

            <div className="space-y-3 overflow-y-auto flex-1 max-h-[440px]">
              {hypotheses.map(hyp => {
                const isActive = selectedHypothesis?.id === hyp.id;
                const isThreat = hyp.type !== 'NORMAL_WORKFLOW';

                return (
                  <button 
                    key={hyp.id}
                    onClick={() => setSelectedHypothesis(hyp)}
                    className={`w-full text-left p-4 rounded-lg border transition-all relative overflow-hidden flex flex-col justify-between select-none cursor-pointer ${
                      isActive 
                        ? 'bg-accent-cyan/10 border-accent-cyan/80 ring-1 ring-accent-cyan/30' 
                        : 'bg-[#070e24] hover:bg-[#0c1635] border-border/50 hover:border-border'
                    }`}
                  >
                    {/* Confidence glow bar */}
                    <div 
                      className={`absolute top-0 right-0 bottom-0 w-1 ${
                        isThreat ? 'bg-gradient-to-b from-rose-500 to-rose-600' : 'bg-gradient-to-b from-emerald-500 to-emerald-600'
                      }`}
                    />

                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className={`text-[11px] font-bold font-sans tracking-wide ${isActive ? 'text-white' : 'text-text-secondary'}`}>
                        {hyp.title}
                      </span>
                      <span className={`text-[10px] font-bold font-mono font-sans px-2 py-0.5 rounded ${
                        isThreat ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {hyp.confidenceScore}% CONFIDENCE
                      </span>
                    </div>

                    <p className="text-[11px] text-text-tertiary normal-case font-mono lowercase first-letter:uppercase leading-snug mb-3">
                      {hyp.description}
                    </p>

                    <div className="flex items-center justify-between text-[9px] font-mono border-t border-border/20 pt-2.5 mt-1.5 text-text-tertiary">
                      <div className="flex items-center gap-1">
                        <Layers className="w-3" />
                        <span>PATTERN: {hyp.observedPattern}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FORENSIC ADVISOR DRAWER / EXPLANATION ENGINE */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="card h-full bg-[#050b1c] border border-border p-5 rounded-lg flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
              <div className="flex items-center gap-2 font-bold tracking-wider text-[11px]">
                <Brain className="w-4 h-4 text-accent-cyan animate-pulse" />
                <span>EXPLANATION ENGINE DIAGNOSTIC REPORT</span>
              </div>
              <span className="text-[9px] font-mono text-text-tertiary">Traceability: Hypothesis &rarr; Consequence</span>
            </div>

            {explainingLoading && (
              <div className="flex-1 flex flex-col items-center justify-center font-mono text-text-secondary">
                <RefreshCw className="w-6 h-6 animate-spin text-accent-cyan mb-2" />
                <span>synthesizing intelligence parameters...</span>
              </div>
            )}

            {!explainingLoading && selectedExplaining && (
              <div className="space-y-5 overflow-y-auto max-h-[445px] pr-2">
                
                {/* 1. What description */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-white font-bold tracking-wide">
                    <span className="w-1.5 h-1.5 bg-accent-cyan rounded-full" />
                    <span>WHAT HAPPENED?</span>
                  </div>
                  <p className="text-[11px] text-text-secondary normal-case leading-relaxed font-sans lowercase first-letter:uppercase pl-3">
                    {selectedExplaining.whatHappened}
                  </p>
                </div>

                {/* 2. Logical supporting factors */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-white font-bold tracking-wide">
                    <span className="w-1.5 h-1.5 bg-accent-cyan rounded-full" />
                    <span>COGNITIVE EVIDENCE CORRELATION</span>
                  </div>
                  <div className="bg-[#070f26] border border-border/40 p-3.5 rounded pl-3">
                    <span className="text-[8.5px] font-mono text-accent-cyan tracking-wider">EVIDENCE SEGMENT FOUNDATION</span>
                    <p className="text-[11px] text-text-tertiary mt-1 lowercase first-letter:uppercase normal-case leading-relaxed font-sans">
                      {selectedExplaining.evidenceSummary}
                    </p>
                    <ul className="mt-2.5 space-y-1 pl-1">
                      {selectedExplaining.whyWeBelievedIt.map((reason: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2 text-[10px] text-text-secondary">
                          <CheckCircle className="w-3 text-accent-cyan shrink-0" />
                          <span className="normal-case">{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 3. Affected Systems & Business units */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#070f26]/60 border border-border/30 p-3 rounded">
                    <span className="text-[8.5px] font-mono text-text-tertiary">AFFECTED INFRASTRUCTURE TARGETS</span>
                    <ul className="mt-2 space-y-1">
                      {selectedExplaining.affectedSystems?.map((sys: string, idx: number) => (
                        <li key={idx} className="text-[10.5px] font-bold text-white normal-case flex items-center gap-1.5">
                          <span className="w-1 h-3 bg-rose-500 rounded-sm" />
                          <span>{sys}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[#070f26]/60 border border-border/30 p-3 rounded">
                    <span className="text-[8.5px] font-mono text-text-tertiary">AFFECTED LINES OF BUSINESS (BUs)</span>
                    <ul className="mt-2 space-y-1">
                      {selectedExplaining.affectedBUs?.map((bu: string, idx: number) => (
                        <li key={idx} className="text-[10.5px] font-bold text-yellow-300 normal-case flex items-center gap-1.5">
                          <span className="w-1 h-3 bg-yellow-500 rounded-sm" />
                          <span>{bu}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 4. Business Impact and Governance implications */}
                <div className="bg-rose-500/5 border border-rose-500/10 p-3.5 rounded space-y-2">
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold tracking-wide">
                    <Flame className="w-4 text-rose-400 shrink-0 animate-pulse" />
                    <span>BUSINESS CONSEQUENCE CHAIN</span>
                  </div>
                  <p className="text-[11px] text-text-secondary pl-5 leading-normal normal-case font-mono uppercase text-[10px] text-rose-300">
                    {selectedExplaining.businessImpactSummary}
                  </p>
                </div>

                {/* 5. Deep Strategic Generative Markdown Report */}
                {selectedExplaining.detailedReportMarkdown && (
                  <div className="border border-border/40 bg-[#070e25] rounded p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-border/20 pb-2 mb-2">
                      <span className="text-[9.5px] font-bold text-white tracking-widest block">Chief Executive advisor report</span>
                      <span className="text-[8px] font-mono text-accent-cyan/90 border border-accent-cyan/20 px-1 py-0.2 rounded">Gemini Enhanced Analysis</span>
                    </div>
                    <div className="text-[11.5px] normal-case text-text-secondary leading-relaxed font-sans space-y-3 prose prose-invert max-w-none text-left select-text scrollbar-thin">
                      <div className="whitespace-pre-line text-slate-300">
                        {selectedExplaining.detailedReportMarkdown}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </div>

      {/* MID PANEL: TRACEABLE ENTERPRISE DECISION GRAPH VISUAL */}
      {graph && (
        <div className="bg-[#050b1c] border border-border p-5 rounded-lg flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-2">
            <div className="flex items-center gap-2 font-bold tracking-wider text-[11px]">
              <Network className="w-4 h-4 text-accent-cyan" />
              <span>TRACEABLE COGNITIVE DECISION GRAPH</span>
            </div>
            <span className="text-[8px] font-mono text-text-tertiary">Evidence Chain &rarr; Hypothesis &rarr; Risk propagation &rarr; Recommendation Flow</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-2">
            {['EVIDENCE', 'HYPOTHESIS', 'RISK', 'IMPACT', 'RECOMMENDATION'].map((stage, sIdx) => {
              const nodesAtStage = graph.nodes.filter((n: any) => n.type === stage);

              return (
                <div key={stage} className="flex flex-col space-y-3 bg-[#070e24]/40 border border-border/10 p-3 rounded h-[360px] relative overflow-y-auto">
                  <div className="border-b border-border/20 pb-2 flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold tracking-wider text-accent-cyan text-[10px]">{stage}</span>
                    <span className="text-[8px] font-mono text-text-tertiary">{nodesAtStage.length}</span>
                  </div>

                  <div className="space-y-2 flex-1 relative z-10">
                    {nodesAtStage.map((node: any) => {
                      const isSelect = selectedHypothesis?.id === node.id || selectedHypothesis?.title === node.label;
                      const isHighRisk = node.severity === 'critical' || node.severity === 'high';

                      return (
                        <div 
                          key={node.id} 
                          className={`p-3 rounded border text-left transition-all text-[10px] relative ${
                            isSelect 
                              ? 'bg-accent-cyan/15 border-accent-cyan shadow-[0_0_8px_#00FFD1/35]' 
                              : isHighRisk 
                              ? 'bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/30' 
                              : 'bg-[#091129]/60 hover:bg-[#0d1838] border-border/40'
                          }`}
                        >
                          <p className="font-bold text-white leading-tight mb-1">{node.label}</p>
                          {node.metadata?.confidence && (
                            <span className="text-[8.5px] font-mono text-accent-blue font-semibold">{node.metadata.confidence}% CONFIDENCE</span>
                          )}
                          {node.metadata?.steps && (
                            <p className="text-[8.5px] font-sans text-text-tertiary lowercase leading-snug first-letter:uppercase mt-1.5 border-t border-border/10 pt-1 border-dashed">
                              {node.metadata.steps}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {sIdx < 4 && (
                    <div className="absolute top-[50%] right-[-10px] z-0 hidden md:block">
                      <ArrowRight className="w-4 h-4 text-border/45 animate-pulse" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LOWER PANEL: PREDICTIVE HORIZONS & ORGANIZATIONAL MEMORY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* PREDICTIVE REASONING */}
        <div className="card bg-[#050b1c] border border-border p-5 rounded-lg flex flex-col justify-between">
          <div className="border-b border-border/40 pb-3 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold tracking-wider text-[11px]">
              <TrendingUp className="w-4 h-4 text-accent-cyan" />
              <span>PREDICTIVE REASONING & FUTURE ESCALATION MODEL</span>
            </div>
            <span className="text-[8.5px] font-mono text-text-tertiary">Forecasting Attack Progression</span>
          </div>

          <div className="space-y-4 pr-1 overflow-y-auto max-h-[295px] flex-1">
            {predictions.map(pred => {
              const probabilityPercent = Math.round(pred.probability * 100);
              const isCrit = pred.impactSeverity === 'critical';

              return (
                <div key={pred.id} className="bg-[#070f26] border border-border/40 rounded p-4 relative overflow-hidden flex flex-col justify-between select-none">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-bold text-white tracking-wide">{pred.riskName}</span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      isCrit ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                    }`}>
                      {pred.impactSeverity} severity
                    </span>
                  </div>

                  <p className="text-[10.5px] text-text-tertiary normal-case font-mono leading-relaxed lowercase leading-snug first-letter:uppercase mb-2">
                    {pred.likelyFutureRisk}
                  </p>

                  <div className="space-y-2 mt-2">
                    <div className="flex items-center justify-between text-[9px] font-mono text-text-secondary">
                      <span>LIKELY TIME HORIZON: {pred.timeHorizon}</span>
                      <span>COMPLEXITY: {pred.mitigationComplexity}</span>
                    </div>

                    {/* Simulated Probability Bar */}
                    <div className="relative pt-1">
                      <div className="flex mb-1 items-center justify-between text-[9px] font-mono">
                        <span className="text-text-tertiary">CONFIDENCE OF ESCALATION</span>
                        <span className="font-bold text-accent-cyan">{probabilityPercent}%</span>
                      </div>
                      <div className="overflow-hidden h-1.5 text-xs flex rounded bg-border/20">
                        <div 
                          style={{ width: `${probabilityPercent}%` }} 
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-accent-blue to-accent-cyan rounded-full transition-all duration-1000"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ORGANIZATIONAL MEMORY LAYER */}
        <div className="card bg-[#050b1c] border border-border p-5 rounded-lg flex flex-col justify-between">
          <div className="border-b border-border/40 pb-3 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold tracking-wider text-[11px]">
              <Layers className="w-4 h-4 text-accent-cyan" />
              <span>ORGANIZATIONAL COGNITIVE MEMORY</span>
            </div>
            <span className="text-[8.5px] font-mono text-text-tertiary">Tracing Historic Anomaly Trends</span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[295px] pr-1 flex-1">
            {memory.map((mem, idx) => (
              <div 
                key={mem.id || idx} 
                className="bg-[#070e25]/60 hover:bg-[#0a1433] transition-all border border-border/30 rounded p-4 relative flex items-start gap-3 justify-between"
              >
                <div className="p-1.5 bg-[#0e1b40] rounded border border-border/40 shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4 text-accent-blue" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-[11px] text-text-secondary lowercase font-mono first-letter:uppercase leading-normal">
                    {mem.description}
                  </p>
                  <span className="text-[8.5px] tracking-wider font-mono text-text-tertiary block pt-1">
                    logged at {new Date(mem.timestamp).toLocaleString()} &bull; category: {mem.category}
                  </span>
                </div>
              </div>
            ))}

            {memory.length === 0 && (
              <div className="text-center font-mono py-12 text-text-tertiary">
                No historic failure patterns retrieved. Memory registers clean.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* INTERACTIVE SHIELDS: DECISION SUPPORT SYSTEM BAR */}
      <div className="bg-[#040818]/80 border border-border/80 rounded-lg p-5 backdrop-blur-xl relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(0,229,255,0.012)_0%,transparent_50%)] pointer-events-none" />
        <div className="flex items-center gap-2 pb-2 mb-3 border-b border-border/30 text-white font-bold tracking-wide text-[10.5px]">
          <HelpCircle className="w-4.5 h-4.5 text-accent-cyan animate-pulse shrink-0" />
          <span>DECISION SUPPORT ADVISER SYSTEM CONSOLE</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-8 space-y-3">
            <span className="text-[8px] font-mono text-text-tertiary block tracking-wider">PROMPT SENTINELX TO EVALUATE SPECIFIC CRUCIAL STRATEGIC RISKS</span>
            
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { label: "Why is this risky?", query: "Why is this risky?" },
                { label: "What depends on this?", query: "What depends on this?" },
                { label: "Priority list?", query: "What should we prioritize?" }
              ].map(pill => (
                <button 
                  key={pill.label}
                  type="button"
                  onClick={() => handlePresetQuery(pill.query)}
                  className="px-3.5 py-1.5 bg-[#0a122e] hover:bg-accent-blue/15 hover:text-accent-cyan border border-border/40 hover:border-accent-cyan/30 text-text-secondary text-[9px] font-mono font-bold tracking-widest rounded transition-all cursor-pointer select-none"
                >
                  {pill.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 border border-border bg-[#050a1b] rounded-lg p-1">
              <input 
                type="text"
                placeholder="Ask SentinelX e.g. 'Why is this payroll system exposure dangerous?', 'Who is affected?'"
                value={queryInput}
                onChange={e => setQueryInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && executeSupportQuery()}
                className="flex-1 bg-transparent px-3 py-2 cursor-text outline-none text-[11px] font-sans text-white focus:text-white caret-accent-cyan placeholder-text-tertiary select-text"
              />
              <button 
                type="button"
                onClick={() => executeSupportQuery()}
                disabled={queryLoading}
                className="px-4 py-2 bg-accent-cyan/15 hover:bg-accent-cyan/30 border border-accent-cyan/40 text-accent-cyan rounded-md text-[9px] font-mono font-bold tracking-wider hover:shadow-[0_0_8px_#00FFD1] hover:scale-[1.01] transition-all cursor-pointer active:scale-95"
              >
                {queryLoading ? 'Thinking...' : 'INQUIRE'}
              </button>
            </div>
          </div>

          {/* RESPONSE PREVIEW */}
          <div className="lg:col-span-4 bg-[#070e24] border border-border/60 p-4 rounded-lg min-h-[160px] flex flex-col justify-between">
            {queryLoading && (
              <div className="flex-1 flex flex-col items-center justify-center font-mono text-[9px] text-text-tertiary">
                <RefreshCw className="w-4 h-4 animate-spin text-accent-cyan mb-1.5" />
                <span>reasoning through corporate patterns...</span>
              </div>
            )}

            {!queryLoading && !queryResponse && (
              <div className="flex-1 flex flex-col items-center justify-center font-mono text-[9.5px] text-text-tertiary text-center px-4 leading-normal select-none py-6">
                <span>Direct Answer Terminal is online. Enter an inquiry or select a preset to begin.</span>
              </div>
            )}

            {!queryLoading && queryResponse && (
              <div className="space-y-3.5 select-text">
                <div className="flex items-center justify-between border-b border-border/20 pb-2 mb-1.5">
                  <span className="text-[8.5px] font-mono font-medium text-accent-cyan block">SentinelX Decision Output</span>
                  {queryScore && (
                    <span className="text-[8.5px] font-mono font-semibold text-rose-400">Risk Severity Indicator: {queryScore}%</span>
                  )}
                </div>

                <div className="text-[11px] normal-case font-sans tracking-wide leading-relaxed text-text-secondary pr-1 prose prose-invert">
                  <div className="whitespace-pre-line leading-relaxed text-[11px] text-slate-300">
                    {queryResponse}
                  </div>
                </div>

                {queryEntities.length > 0 && (
                  <div className="border-t border-border/20 pt-2 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[8px] font-mono text-text-tertiary tracking-wider shrink-0 uppercase">CRITICAL SYSTEM ADJACENCIES:</span>
                    {queryEntities.map(ent => (
                      <span key={ent} className="text-[8.5px] font-mono border border-border bg-[#0b173c]/80 text-white px-1.5 py-0.2 rounded font-sans uppercase">
                        {ent}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

import { GoogleGenAI, Type } from "@google/genai";
import { AIProvider } from "./orchestrator";
import { AIAnalysisRequest, AIAnalysisResponse, AIMitigation } from "../../types/ai";

export class GeminiProvider implements AIProvider {
  name: 'gemini' = 'gemini';
  private client: GoogleGenAI;
  private apiKey: string;
  private circuitBreakerActive = false;
  private circuitBreakerUntil = 0;

  constructor(apiKey: string) {
    this.apiKey = apiKey || '';
    this.client = new GoogleGenAI({
      apiKey: apiKey || 'MOCK_KEY',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const now = Date.now();
    if (this.circuitBreakerActive && now < this.circuitBreakerUntil) {
      const remainingSec = Math.ceil((this.circuitBreakerUntil - now) / 1000);
      console.warn(`[GeminiProvider] Circuit breaker ACTIVE due to recent 429 quota limits. Skipping API call to preserve rate-limits. Fallback remains active for ${remainingSec}s.`);
      return this.generateHeuristicIntelligence(request);
    }

    if (!this.apiKey) {
      console.warn("[GeminiProvider] No API Key configured. Accessing local high-fidelity tactical heuristics engine.");
      return this.generateHeuristicIntelligence(request);
    }

    const prompt = this.buildPrompt(request);
    
    try {
      const response = await this.client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              reasoning: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
              threatLevel: { type: Type.STRING, enum: ['low', 'medium', 'high', 'critical'] },
              confidence: { type: Type.NUMBER },
              
              // Phase 6 Structured Core Intelligence
              threatClassification: { type: Type.STRING },
              blastRadius: { type: Type.NUMBER },
              affectedInfrastructure: { type: Type.ARRAY, items: { type: Type.STRING } },
              trustDegradation: { type: Type.NUMBER },
              propagationProbability: { type: Type.NUMBER },
              operationalImpact: { type: Type.STRING },
              
              mitigations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    action: { type: Type.STRING },
                    successProbability: { type: Type.NUMBER },
                    rationale: { type: Type.STRING },
                    sideEffects: { type: Type.STRING },
                    infrastructureImpact: { type: Type.STRING }
                  },
                  required: ['type', 'action', 'successProbability', 'rationale', 'sideEffects', 'infrastructureImpact']
                }
              },
              
              adversaryBehavior: {
                type: Type.OBJECT,
                properties: {
                  tactics: { type: Type.ARRAY, items: { type: Type.STRING } },
                  techniques: { type: Type.ARRAY, items: { type: Type.STRING } },
                  stages: { type: Type.ARRAY, items: { type: Type.STRING } },
                  mitreAlignment: { type: Type.STRING }
                },
                required: ['tactics', 'techniques', 'stages', 'mitreAlignment']
              },
              
              adaptiveThreatDetails: {
                type: Type.OBJECT,
                properties: {
                  adaptabilityRisk: { type: Type.STRING, enum: ['low', 'medium', 'high', 'autonomous'] },
                  payloadMutationPattern: { type: Type.STRING },
                  behaviouralAdaptation: { type: Type.STRING }
                },
                required: ['adaptabilityRisk', 'behaviouralAdaptation']
              },

              replayAnalysis: {
                type: Type.OBJECT,
                properties: {
                  isReplayContext: { type: Type.BOOLEAN },
                  incidentDurationSeconds: { type: Type.NUMBER },
                  timelineSummary: { type: Type.STRING },
                  rootCauseReasoning: { type: Type.STRING }
                },
                required: ['isReplayContext']
              }
            },
            required: [
              'summary', 'reasoning', 'recommendations', 'threatLevel', 'confidence',
              'threatClassification', 'blastRadius', 'affectedInfrastructure', 
              'trustDegradation', 'propagationProbability', 'operationalImpact', 'mitigations',
              'adversaryBehavior', 'adaptiveThreatDetails', 'replayAnalysis'
            ]
          }
        }
      });

      return JSON.parse(response.text);
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      const isQuotaExceeded = errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota");
      
      console.error(`[GeminiProvider] API Error: ${isQuotaExceeded ? 'RESOURCE_EXHAUSTED/QUOTA' : 'GENERIC_FAIL'}. Message: ${errMsg}`);
      
      if (isQuotaExceeded) {
        this.circuitBreakerActive = true;
        this.circuitBreakerUntil = Date.now() + 60000; // 60 seconds lockout
        console.warn("[GeminiProvider] Circuit breaker ACTIVATED for 60s. Subsequent requests will immediately reuse the local heuristic controller.");
      }
      
      console.warn("[GeminiProvider] Gracefully falling back to integrated SentinelX Heuristic Inference controller.");
      return this.generateHeuristicIntelligence(request);
    }
  }

  async stream(request: AIAnalysisRequest, onChunk: (chunk: string) => void): Promise<void> {
    const now = Date.now();
    if (this.circuitBreakerActive && now < this.circuitBreakerUntil) {
      return this.streamHeuristicFallback(request, onChunk);
    }

    if (!this.apiKey) {
      return this.streamHeuristicFallback(request, onChunk);
    }

    const prompt = this.buildPrompt(request) + "\n\nProvide the analysis in an elite technical operational format. Keep responses brief, authoritative, and structured without intro/outro fluff.";
    
    try {
      const result = await this.client.models.generateContentStream({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      for await (const chunk of result) {
        if (chunk.text) {
          onChunk(chunk.text);
        }
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      const isQuotaExceeded = errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota");
      
      console.error("[GeminiProvider] Stream failed, utilizing fallback streaming pipeline.", err);
      if (isQuotaExceeded) {
        this.circuitBreakerActive = true;
        this.circuitBreakerUntil = Date.now() + 60000;
        console.warn("[GeminiProvider] Circuit breaker ACTIVATED from stream failure for 60s.");
      }
      return this.streamHeuristicFallback(request, onChunk);
    }
  }

  private generateHeuristicIntelligence(request: AIAnalysisRequest): AIAnalysisResponse {
    const { context } = request;
    const scenario = context?.simulationScenario || 'Standard Operations';
    const target = context?.targetNode;
    
    let threatClassification = "Anomalous Intrusion Vector";
    let threatLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let confidence = 0.94;
    let blastRadius = 20;
    let trustDegradation = 10;
    let propagationProbability = 15;
    let oImpact = "No major degradation reported across subnet routing structures.";
    
    let tactics = ["Reconnaissance"];
    let techniques = ["T1595 Active Scanning"];
    let stages = ["Initial Recon", "Network Enumeration"];
    let mitreAlignment = "TA0043 (Reconnaissance)";

    let isCompromised = false;
    let nodeLabel = "Default Perimeter Gateway";
    
    if (target) {
      nodeLabel = target.label || target.name || "Perimeter Assets";
      isCompromised = target.status === 'compromised';
      if (isCompromised) {
        threatLevel = 'critical';
        blastRadius = Math.round(target.exposureScore || 65);
        trustDegradation = Math.round(100 - (target.trustScore ?? 25));
        propagationProbability = Math.round((target.compromiseProbability ?? 0.75) * 100);
      } else {
        threatLevel = 'high';
        blastRadius = Math.round((target.threatScore || 30) * 0.82);
        trustDegradation = Math.round((target.threatScore || 30) * 0.65);
      }
    }

    if (scenario === 'ransomware_storm') {
      threatClassification = "Polymorphic Cryptographic Ransomware Propagation";
      threatLevel = isCompromised ? 'critical' : 'high';
      tactics = ["Impact", "Infiltration", "Lateral Movement"];
      techniques = ["T1486 Data Encrypted for Impact", "T1021 Remote Services"];
      stages = ["Code Execution", "Rapid File Ciphering", "Domain Locker Trigger"];
      mitreAlignment = "TA0040 (Impact) / TA0008 (Lateral Movement)";
      oImpact = "Production datastores subjected to high-entropy symmetric encryption. Administrative controls isolated.";
    } else if (scenario === 'critical_infrastructure') {
      threatClassification = "Critical SCADA Control Infiltration & Hijacking";
      threatLevel = 'critical';
      tactics = ["Infiltration", "Inhibit Response Function", "Impair Defenses"];
      techniques = ["T0831 Manipulation of Control", "T0806 Loss of Safety"];
      stages = ["Border Gateway Penetration", "ICS Protocol Manipulation", "Sensory Overrides"];
      mitreAlignment = "TA0800 (ICS Infiltration)";
      oImpact = "SCADA physical controllers experiencing high error packet drops and mechanical command overrides.";
    } else if (scenario === 'corporate_espionage') {
      threatClassification = "Advanced Persistent Threat (APT) Data Extraction Campaign";
      threatLevel = 'high';
      tactics = ["Exfiltration", "Credential Access", "Defense Evasion"];
      techniques = ["T1048 Exfiltration Over Alternative Channel", "T1114 Email Collection"];
      stages = ["Initial Access via Phishing", "Stealthy Credential Enumeration", "Encrypted Tunnel Exfiltration"];
      mitreAlignment = "TA0011 (Exfiltration)";
      oImpact = "Proprietary database structures scanned and copied through secure reverse SSH tunneling.";
    } else {
      if (isCompromised) {
        threatClassification = "Host Boundary Infiltration and Command Execution";
        threatLevel = 'high';
        tactics = ["Execution", "Initial Access", "Lateral Movement"];
        techniques = ["T1203 Exploitation for Client Execution", "T1059 Command and Scripting Interpreter"];
        stages = ["Exploiting Unpatched CVE", "Spawning Interactive PowerShell Session"];
        mitreAlignment = "TA0002 (Execution)";
        oImpact = "Infected host executing untrusted sub-processes and polling active lateral routing paths.";
      }
    }

    const reasoning = [
      `SentinelX telemetry engines registered suspicious traffic fluctuations targeting [${nodeLabel}].`,
      `The attack behavior aligns with ${threatClassification} seeking a foothold within this subnet.`,
      `Structural blast radius mapped at ${blastRadius}% with direct upstream routes designated as threatened.`,
      `Local asset trust baseline has deteriorated to ${target ? target.trustScore ?? 50 : 70} index units.`,
      `Cognitive graph inspection indicates rapid escalation attempts aiming for critical crown jewels.`
    ];

    const mitigations: AIMitigation[] = [];
    if (scenario === 'ransomware_storm' || isCompromised) {
      mitigations.push({
        type: 'isolate',
        action: `Trigger Active Subnet isolation ward for host: [${nodeLabel}]`,
        successProbability: 95,
        rationale: "Instantly terminates active SMB protocol sockets propagating encryption ciphers.",
        sideEffects: "Complete service availability outage on the targeted asset.",
        infrastructureImpact: "Ensures adjacent servers remain safely air-gapped from infected zones."
      });
      mitigations.push({
        type: 'containment',
        action: "Deploy Neural Isolation containment blockades and lock active directory tokens",
        successProbability: 88,
        rationale: "Revokes compromised service account access and forces immediate authentication resets.",
        sideEffects: "Transient authentication prompts across neighbouring internal microservices.",
        infrastructureImpact: "Stops active lateral propagation waves cleanly at the next policy check."
      });
    } else {
      mitigations.push({
        type: 'firewall_pruning',
        action: "Apply live firewall rules to sever untrusted border gateway connections",
        successProbability: 82,
        rationale: "Prunes background reverse shell processes polling foreign IP addresses.",
        sideEffects: "Minor reduction in diagnostic endpoint querying throughput.",
        infrastructureImpact: "Fortifies boundary gateway zones against unauthorized packet streams."
      });
      mitigations.push({
        type: 'credentials',
        action: "Initiate rotation of active IAM session keys and API access secrets",
        successProbability: 90,
        rationale: "Inactivates stolen access credentials and session cookies.",
        sideEffects: "Intermittent connection testing alerts for development applications.",
        infrastructureImpact: "Increases structural grid integrity score by enforcing multi-factor validation."
      });
    }

    const recommendations = mitigations.map(m => m.action);

    const affectedInfrastructure = context?.nodes 
      ? context.nodes.filter(n => n.status === 'compromised').map(n => n.label || n.name || n.id)
      : [nodeLabel];

    if (affectedInfrastructure.length === 0) {
      affectedInfrastructure.push(nodeLabel);
    }

    return {
      summary: `Autonomous SentinelX intelligence analysis has identified active threat vectors on [${nodeLabel}]. Operational patterns suggest a highly organized ${threatClassification} progressing through structured phases. Remediations including containment blockades are strictly recommended to lock down the calculated ${blastRadius}% blast radius.`,
      reasoning,
      recommendations,
      threatLevel,
      confidence,
      threatClassification,
      blastRadius,
      affectedInfrastructure: affectedInfrastructure.slice(0, 5),
      trustDegradation,
      propagationProbability,
      operationalImpact: oImpact,
      mitigations,
      adversaryBehavior: {
        tactics,
        techniques,
        stages,
        mitreAlignment
      },
      adaptiveThreatDetails: {
        adaptabilityRisk: scenario === 'ransomware_storm' ? 'high' : 'medium',
        payloadMutationPattern: scenario === 'ransomware_storm' ? "Polymorphic payload altering registry keys on execution" : "Static malicious file hash",
        behaviouralAdaptation: scenario === 'corporate_espionage' ? "Adapting port ranges dynamically to bypass security filters" : "None detected"
      },
      replayAnalysis: {
        isReplayContext: !!context?.isReplayActive,
        incidentDurationSeconds: context?.isReplayActive ? 45 : undefined,
        timelineSummary: context?.isReplayActive ? "Ingress alerts registered -> Intrusion verified -> Real-time operational replay initiated." : undefined,
        rootCauseReasoning: "Exploitable perimeter port bounds paired with weak API authorization protocols."
      }
    };
  }

  private async streamHeuristicFallback(request: AIAnalysisRequest, onChunk: (chunk: string) => void): Promise<void> {
    const data = this.generateHeuristicIntelligence(request);
    const text = data.summary;
    const words = text.split(" ");
    let i = 0;
    
    return new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        if (i < words.length) {
          onChunk(words[i] + " ");
          i++;
        } else {
          clearInterval(interval);
          resolve();
        }
      }, 40);
    });
  }

  private buildPrompt(request: AIAnalysisRequest): string {
    const { type, context } = request;
    const { 
      nodes, 
      links, 
      events, 
      targetNode, 
      recentActivity, 
      graphAnalytics, 
      isReplayActive, 
      replaySessionId,
      simulationScenario 
    } = context;

    let prompt = `You are SentinelX Operational Intelligence Core - an elite CyOps Reasoning Runtime and infrastructure-aware cyber analyst.
    Classify, dissect, and reason over active threats in the digital twin namespace.
    
    === OPERATIONAL ENVIRONMENT ===
    OPERATION_TYPE: ${type.toUpperCase()}
    SIMULATION_SCENARIO: ${simulationScenario || 'Standard Operations'}
    REPLAY_CONTEXT_DECLARED: ${isReplayActive ? `TRUE (Session: ${replaySessionId})` : 'FALSE (Real-time stream/Digital Twin)'}
    NETWORK_NODES: ${nodes ? nodes.length : 0} nodes running
    NETWORK_LINKS: ${links ? links.length : 0} communication routes active
    INGESTED_ALERTS: ${events ? events.length : 0} active signals
    `;

    if (graphAnalytics) {
      prompt += `
      === GRAPH TOPOLOGY INTELLIGENCE ===
      We have compiled the active topological graph and evaluated critical paths.
      Critical Infrastructure Paths: ${JSON.stringify(graphAnalytics.criticalPaths || [])}
      Crown Jewel Exposure Weights: ${JSON.stringify(graphAnalytics.crownJewelRisk || [])}
      Lateral Propagation Vectors: ${JSON.stringify(graphAnalytics.lateralMovementProbability?.slice(0, 4) || [])}
      Resilience Index Baseline: ${graphAnalytics.resilienceIndex || 'Unknown'}
      Predicted Infrastructure Stress: ${JSON.stringify(graphAnalytics.infrastructurePressure?.slice(0, 4) || [])}
      `;
    }

    if (targetNode) {
      prompt += `
      === CURRENT FOCUS NODE ID: ${targetNode.id || targetNode.name} ===
      Label: ${targetNode.label || targetNode.name}
      Type: ${targetNode.type}
      Status: ${targetNode.status}
      Threat Score: ${targetNode.threatScore || targetNode.riskScore}/100
      Trust Evaluation Index: ${targetNode.trustScore ?? 'Pending'}
      Compromise Probability: ${targetNode.compromiseProbability ?? 'Pending'}
      Resilience Index: ${targetNode.resilienceScore ?? 'Pending'}
      Exposure Blast Radius: ${targetNode.exposureScore ?? 'Pending'}
      Criticality Scale: ${targetNode.criticality ?? targetNode.operationalCriticality ?? 0.5}
      Latency: ${targetNode.latency || 12}ms
      `;
    }

    if (recentActivity && recentActivity.length > 0) {
      prompt += `
      === ACTIVE TELEMETRY INGESTION STREAM ===
      ${JSON.stringify(recentActivity.slice(-8))}
      `;
    }

    prompt += `
    === DATA GOVERNANCE & IDENTITY INTELLIGENCE ===
    - Take special note of identity nodes (e.g., USER_IDENTITY, DEPARTMENT, SECRETS_VAULT, API_ENDPOINT).
    - Map and reason over sensitive data zones and containsSensitiveAssets / containsSecrets flags.
    - Evaluate how abnormalBehaviorScore and identityRisk scores on user identities propagate downstream trust degradation. High identity anomalies direct threats to securityClassifications.

    === CORE REASONING OBJECTIVES ===
    Analyze this cyber range state with full graph, telemetry, and mitigation awareness.
    
    1. THREAT CLASSIFICATION & MITRE ALIGNMENT: 
       Classify the incident strictly into one of: Ransomware Propagation, Credential Compromise, Insider Threat, Privilege Escalation, Lateral Movement, Runtime Compromise, AI-Assisted Attack, Cloud Abuse, or Adaptive Malware. Identify MITRE ATT&CK tactics (e.g. TA0008 Lateral Movement, TA0004 Privilege Escalation) and stages.
       
    2. GRAPH RELATIONSHIPS & ATTACK PROPAGATION: 
       Evaluate trust boundaries and determine which node is threatened next. Calculate blast radius (0-100) and identify exact impacted infrastructure components (e.g., k8s pods, payment gateways, active directory connectors).
       
    3. DETAILED DEFENSE RECOMMENDATIONS: 
       Recommend at least 2 distinct mitigations. For each mitigation, dictate:
       - Success probability (0% to 100%)
       - Rationale (WHY it mitigates the attack vector)
       - Side effects (Operational tradeoffs, performance bottlenecks, connection drops)
       - Infrastructure impact (Effect on topology path and lateral spread)
       
    4. REPLAY-AWARE FORENSICS (IF REPLAY IS ACTIVE):
       Detail the incident duration, summarize the attack timeline, and reconstruct how the threat evolved. Use historical data to evaluate.
       
    5. ADAPTIVE AI THREAT ANALYSIS (BEHAVIORAL ADAPTATION):
       Determine if the adversary is exhibiting autonomous, adaptive, or mutate-on-the-fly properties. Report adaptability risk as low, medium, high, or autonomous. State the payload mutation patterns or behavioral adaptation characteristics.

    === OUTPUT PROTOCOL ===
    - Produce highly precise, tactical, professional intelligence.
    - Sound authoritative, structured, and infrastructure-aware.
    - Zero conversational greetings or standard chat closures.
    `;

    return prompt;
  }
}

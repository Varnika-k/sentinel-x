import { AIOrchestrator } from '../../../src/server/ai/orchestrator';
import { GeminiProvider } from '../../../src/server/ai/gemini-provider';
import { CONFIG } from '../../../src/config';
import { logger } from '../core/logger';
import { graphIntelligenceEngine } from '../simulation/graph-intelligence';
import { digitalTwinEngine } from '../simulation/twin-engine';

class AIService {
  private orchestrator: AIOrchestrator;
  private responseCache: Map<string, { response: any; timestamp: number }> = new Map();

  constructor() {
    this.orchestrator = new AIOrchestrator();
    this.init();
  }

  private init() {
    const apiKey = CONFIG.ai.apiKey || '';
    this.orchestrator.registerProvider(new GeminiProvider(apiKey));
    if (apiKey) {
      logger.info('AI Intelligence Service Initialized with Gemini API');
    } else {
      logger.warn('AI Intelligence Service running in High-Fidelity Local Heuristic Mode (Missing API Key)');
    }
  }

  private sanitizePayload(data: any): any {
    if (!data) return data;
    try {
      const clone = JSON.parse(JSON.stringify(data));
      const walk = (obj: any) => {
        if (!obj || typeof obj !== 'object') return;
        for (const key in obj) {
          if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
          const val = obj[key];
          if (typeof val === 'string') {
            let sanitized = val;
            // Scrub Email / PII signatures
            sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL_METADATA]');
            // Scrub SSH / Private Key signatures
            sanitized = sanitized.replace(/(ssh-rsa\s+AAAA[a-zA-Z0-9+/=]+)|(-----BEGIN[A-Z\s]+KEY-----[\s\S]+?-----END[A-Z\s]+KEY-----)/gi, '[REDACTED_SSH_KEY_METADATA]');
            // Scrub JWT signatures
            sanitized = sanitized.replace(/(ey[a-zA-Z0-9_=]+)\.(ey[a-zA-Z0-9_=]+)\.([a-zA-Z0-9_=-]+)/g, '[REDACTED_JWT_TOKEN]');
            // Scrub assignments matching passwords/secrets
            sanitized = sanitized.replace(/(password|passwd|api_key|secret|token|credential)\s*[:=]\s*["']?[a-zA-Z0-9_=\-\/\+\.\:]{8,40}["']?/gi, (match) => {
              const parts = match.split(/[:=]/);
              return `${parts[0]}: [REDACTED_SECRET_METADATA]`;
            });
            obj[key] = sanitized;
          } else if (typeof val === 'object') {
            walk(val);
          }
        }
      };
      walk(clone);
      return clone;
    } catch (err) {
      logger.error('AI Service: Payload sanitation aborted due to cyclic structure', err);
      return data;
    }
  }

  public async analyze(data: any) {
    const sanitized = this.sanitizePayload(data);
    
    // Inject runtime context if missing
    if (sanitized && sanitized.context) {
      sanitized.context.isReplayActive = digitalTwinEngine.scenario !== 'idle' && digitalTwinEngine.status === 'running';
      sanitized.context.replaySessionId = digitalTwinEngine.sessionId;
      sanitized.context.simulationScenario = digitalTwinEngine.scenario;
    }

    // Determine cache key based on request shape to prevent duplicate Gemini reasoning
    let cacheKey = '';
    if (sanitized && sanitized.type === 'threat' && sanitized.context?.targetNode) {
      const node = sanitized.context.targetNode;
      cacheKey = `threat-${node.id}-${node.status}-${node.threatScore || 0}-${node.lastAttackType || ''}`;
    } else {
      cacheKey = JSON.stringify(sanitized).substring(0, 300);
    }

    const now = Date.now();
    if (this.responseCache.has(cacheKey)) {
      const val = this.responseCache.get(cacheKey)!;
      if (now - val.timestamp < 15000) { // Cache AI summaries for 15 seconds
        logger.info(`[AIService] Deduction Hit! Serving cached reasoning response for key: ${cacheKey}`);
        return val.response;
      }
    }

    // Protect Gemini API key rate limits under high automation loops
    const lastRequestTime = Array.from(this.responseCache.values())
      .map(v => v.timestamp)
      .reduce((max, t) => Math.max(max, t), 0);
    
    if (now - lastRequestTime < 1000) {
      logger.info('[AIService] Throttling rapid sequential AI analysis to avoid rate exhaustion');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    try {
      const response = await this.orchestrator.analyze(sanitized);
      this.responseCache.set(cacheKey, { response, timestamp: Date.now() });
      return response;
    } catch (err) {
      logger.error('Error during AI analysis inference call', err);
      throw err;
    }
  }

  public async analyzeInfra(topology: any, events: any) {
    const sanitizedTopology = this.sanitizePayload(topology);
    const sanitizedEvents = this.sanitizePayload(events);

    // Collect active graph propagation and blast radius analysis for each node in the cluster
    const graphNodes = Array.from(graphIntelligenceEngine.nodes.values());
    const blastRadiusAnalyses: Record<string, any> = {};
    const propagationSpreads: Record<string, any> = {};
    const cognitiveExplanations: Record<string, string> = {};

    graphNodes.forEach(node => {
      blastRadiusAnalyses[node.name] = graphIntelligenceEngine.computeBlastRadius(node.name);
      propagationSpreads[node.name] = graphIntelligenceEngine.computeAttackSpread(node.name);
      cognitiveExplanations[node.name] = graphIntelligenceEngine.getAIGraphExplanation(node.name);
    });

    const contextPayload = { 
      type: 'threat',
      context: {
        nodes: sanitizedTopology,
        events: sanitizedEvents,
        isReplayActive: digitalTwinEngine.scenario !== 'idle' && digitalTwinEngine.status === 'running',
        replaySessionId: digitalTwinEngine.sessionId,
        simulationScenario: digitalTwinEngine.scenario,
        graphAnalytics: {
          note: "Analyzing cloud-native topology with advanced multi-tier graph reasoning",
          nodes: graphNodes,
          edges: graphIntelligenceEngine.edges,
          blastRadius: blastRadiusAnalyses,
          propagationSpreads: propagationSpreads,
          cognitiveExplanations: cognitiveExplanations
        }
      }
    };

    const sanitizedContext = this.sanitizePayload(contextPayload);
    return await this.orchestrator.analyze(sanitizedContext);
  }

  public async stream(data: any, onChunk: (chunk: string) => void) {
    const sanitized = this.sanitizePayload(data);
    if (sanitized && sanitized.context) {
      sanitized.context.isReplayActive = digitalTwinEngine.scenario !== 'idle' && digitalTwinEngine.status === 'running';
      sanitized.context.replaySessionId = digitalTwinEngine.sessionId;
      sanitized.context.simulationScenario = digitalTwinEngine.scenario;
    }
    return await this.orchestrator.stream(sanitized, onChunk);
  }
}

export const aiService = new AIService();

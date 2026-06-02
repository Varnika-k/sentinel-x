import { logger } from '../../core/logger';
import { graphIntelligenceEngine } from '../../simulation/graph-intelligence';
import { ContextCompressor } from './context-compressor';
import { GovernanceContextBuilder } from './governance-context-builder';
import { TemporalContextEngine } from './temporal-context-engine';
import { memoryStream } from './memory-stream';
import { reasoningPriorityEngine } from './reasoning-priority-engine';
import { AIOrchestrator, AIReasoningOutput } from '../ai/ai-orchestrator';

export class AiTaskRouter {
  private static instance: AiTaskRouter;

  private constructor() {}

  public static getInstance(): AiTaskRouter {
    if (!AiTaskRouter.instance) {
      AiTaskRouter.instance = new AiTaskRouter();
    }
    return AiTaskRouter.instance;
  }

  /**
   * Orchestrates full contextual pipeline assembly and submits reasoning tasks to the priority engine
   */
  public async orchestrateReasoningRequest(nodeId: string): Promise<AIReasoningOutput> {
    logger.info(`[AiTaskRouter] Orchestrating high-scale context assembly for target: ${nodeId}`);

    const node = graphIntelligenceEngine.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Target node ${nodeId} is absent from current topology.`);
    }

    // 1. Context compression
    const compactNodes = ContextCompressor.compressNodeStates(Array.from(graphIntelligenceEngine.nodes.values()));
    
    // 2. Stitch governance boundaries
    const governanceCtx = GovernanceContextBuilder.buildGovernanceAIContext(nodeId);
    
    // 3. Assemble temporal details
    const temporalCtx = TemporalContextEngine.stitchTemporalContext(nodeId, node.abnormalBehaviorScore || 0);

    // 4. Retrieve cognitive memory anchors
    const cognitiveMemory = memoryStream.getCognitiveOverlay(nodeId);

    // Formulate a structured reasoning context for priority engine
    const fullPromptContext = `
SYSTEM COGNITIVE SUMMARY:
${compactNodes}

${governanceCtx}

${temporalCtx}

${cognitiveMemory}
    `.trim();

    // Submit request to priority queue
    const task = reasoningPriorityEngine.submitTask(nodeId, { prompt: fullPromptContext }, 'high');

    // Execute through standard orchestrator (which leverages real Gemini or autonomous local fallback)
    const result = await AIOrchestrator.getInstance().analyzeInfrastructure(nodeId);

    // Write a dynamic cognitive memory anchor representing this assessment
    memoryStream.writeAnchor(nodeId, {
      key: `threat-analysis-${Date.now().toString().slice(-4)}`,
      intensity: result.blastRadius,
      description: `Cognitive audit on [${nodeId}] completed with status [${result.threatLevel.toUpperCase()}]. Mitigations deployed: ${result.remediationPlan.length}.`
    });

    return result;
  }
}

export const aiTaskRouter = AiTaskRouter.getInstance();

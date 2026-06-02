import { CognitiveExplanation, Hypothesis, ReasoningContext } from './types';
import { GoogleGenAI } from '@google/genai';
import { logger } from '../core/logger';

export class ExplanationEngine {
  private static instance: ExplanationEngine;
  private ai: GoogleGenAI | null = null;

  private constructor() {
    this.initializeGemini();
  }

  public static getInstance(): ExplanationEngine {
    if (!ExplanationEngine.instance) {
      ExplanationEngine.instance = new ExplanationEngine();
    }
    return ExplanationEngine.instance;
  }

  private initializeGemini() {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      logger.info('[ExplanationEngine] Initializing GoogleGenAI client for Server-Side Reasoning...');
      this.ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    } else {
      logger.warn('[ExplanationEngine] GEMINI_API_KEY is not defined. Falling back to deterministic local reasoning reports.');
    }
  }

  /**
   * Explains how SentinelX resolved a conclusion, drafting timeline, evidences, BUs, and rules breached.
   */
  public async generateExplanation(
    hypothesis: Hypothesis,
    context: ReasoningContext
  ): Promise<CognitiveExplanation> {
    logger.info(`[ExplanationEngine] Synthesizing narrative explanation for hypothesis: ${hypothesis.id}`);

    // Determine affected sectors, system details, and business units
    const affectedSystemsSet = new Set<string>();
    const affectedBUsSet = new Set<string>();

    hypothesis.underlyingRisks.forEach(risk => {
      if (risk.toLowerCase().includes('data') || risk.toLowerCase().includes('db') || risk.toLowerCase().includes('payroll')) {
        affectedSystemsSet.add('Enterprise Database Core Tier');
        affectedBUsSet.add('Human Resources / Payroll Operations');
        affectedBUsSet.add('Finance Department');
      }
      if (risk.toLowerCase().includes('identity') || risk.toLowerCase().includes('credential')) {
        affectedSystemsSet.add('Corporate Identity Provider (Okta/IAM Gateway)');
        affectedBUsSet.add('Security Operations (SEC-OPS)');
      }
      if (risk.toLowerCase().includes('network') || risk.toLowerCase().includes('ingress') || risk.toLowerCase().includes('port')) {
        affectedSystemsSet.add('Production Ingress Load-Balancers');
        affectedBUsSet.add('Site Reliability Engineering (SRE)');
      }
    });

    if (affectedSystemsSet.size === 0) {
      affectedSystemsSet.add('Production Kubernetes Application Pods');
      affectedBUsSet.add('Core Product Engineering');
    }

    const affectedSystems = Array.from(affectedSystemsSet);
    const affectedBUs = Array.from(affectedBUsSet);

    // Business impact mapping: Technical Event -> Business Consequence
    let businessImpactSummary = '';
    if (hypothesis.type === 'INSIDER_ATTACK' || hypothesis.type === 'CREDENTIAL_ABUSE') {
      businessImpactSummary = 'Unauthorized sensitive access leads directly to Payroll delay, compromising employee trust and risking regulatory audit fines.';
    } else if (hypothesis.type === 'RANSOMWARE_SWEEP') {
      businessImpactSummary = 'Active service intrusion poses total database encryption risk, bringing down real-time business logistics and halting transaction revenues.';
    } else {
      businessImpactSummary = 'Operational bottlenecks degrade response SLAs, producing minor customer churn and temporary developer blockages.';
    }

    const whatHappened = `SentinelX observed a correlated trace sequence resulting in a ${hypothesis.title}. ${hypothesis.description}`;
    const whyWeBelievedIt = [
      `Active matching pattern: "${hypothesis.observedPattern}"`,
      `Linked evidence reliability index is high (${hypothesis.confidenceScore}% confidence verified)`,
      `Governance Score is currently vulnerable at ${context.governanceSubset.readinessScore}%`
    ];

    const governanceImplications = [
      `Breaches overall Zero-Trust access restriction schemas`,
      `Violates active governance directive: "${context.governanceSubset.violationsCount > 0 ? 'Strict Multi-Factor enforcement' : 'Least-privilege operational policies'}"`
    ];

    const baseExplanation: CognitiveExplanation = {
      hypothesisId: hypothesis.id,
      whatHappened,
      whyWeBelievedIt,
      evidenceSummary: `The logical evidence chain involves perimeter VPN authentications matched directly to unauthorized privileged shells on ingress nodes and unapproved database access scans within a short temporal offset.`,
      affectedSystems,
      affectedBUs,
      governanceImplications,
      businessImpactSummary
    };

    // If Gemini is available, let's decorate the narrative with deep strategic insight
    if (this.ai) {
      try {
        const prompt = `You are the chief executive security advisor for SentinelX Enterprise Cognitive Intelligence.
Compile an immersive strategic advisory audit based on the following security scenario:

HYPOTHESIS TYPE: ${hypothesis.type}
HYPOTHESIS TITLE: ${hypothesis.title}
OBSERVED PATTERN: ${hypothesis.observedPattern}
CONFIDENCE SCORE: ${hypothesis.confidenceScore}%
SENSITIVE SYSTEMS BLOCKED: ${affectedSystems.join(', ')}
AFFECTED LINE OF BUSINESS: ${affectedBUs.join(', ')}
GOVERNANCE CONSTRAINTS: ${governanceImplications.join('; ')}
BUSINESS CONSEQUENCE: ${businessImpactSummary}

Provide a short, extremely professional executive advisor report in Markdown format. Tell us:
1. Executive Risk Exposition
2. Detailed Path Reasoning Chain (explaining exactly how a database incident spreads to high-level BUs step-by-step)
3. Strategic Counter-measures & Policy Remediation Steps.

Avoid conversational filler. Output pure clean Markdown directly of high-density intelligence.`;

        logger.info('[ExplanationEngine] Dispatching context details to Gemini models/gemini-3.5-flash for enriched narrative text...');
        const response = await this.ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
        });

        if (response.text) {
          baseExplanation.detailedReportMarkdown = response.text.trim();
        }
      } catch (gem_err) {
        logger.error('[ExplanationEngine] Failed to gather Gemini generative explanation, using fallback local template', gem_err);
        baseExplanation.detailedReportMarkdown = this.compileFallbackReportMarkdown(hypothesis, baseExplanation);
      }
    } else {
      baseExplanation.detailedReportMarkdown = this.compileFallbackReportMarkdown(hypothesis, baseExplanation);
    }

    return baseExplanation;
  }

  private compileFallbackReportMarkdown(hyp: Hypothesis, exp: CognitiveExplanation): string {
    return `### SentinelX Threat Advisory & Forensic Audit Report

*Generated deterministically inside local SentinelX reasoning engine*

#### 1. Risk Exposition
An enterprise telemetry risk has compromised **${exp.affectedSystems.join(', ')}**. 
A pattern matcher detected: **${hyp.observedPattern}**. SentinelX assigns a high-severity indicator regarding likely malicious activity.

#### 2. Cross-Organizational Propagation Path
- **Perimeter Foothold**: Intruder gains temporary ingress permissions or captures a compromised corporate VPN endpoint.
- **Topological Traversal**: Intruder probes network boundaries and attempts root privilege escalation on Kubernetes node setups.
- **Business impact cascade**: Accessing core table namespaces. If database triggers fail, a cascade delays operations in the **${exp.affectedBUs.join(', ')}** business divisions.

#### 3. Priority Corrective Actions
1. **Quarantine Target Network Nodes**: Immediately activate virtual firewalls around targeted clusters.
2. **Revoke Active VPN Sessions**: Force credentials flush and demand secondary authentication challenges.
3. **Audit Data Fabric Constraints**: Adjust database access policies to strictly limit queries to verified corporate microservices hosts.`;
  }
}

export const explanationEngine = ExplanationEngine.getInstance();

import { ReasoningContext } from './types';
import { DatabaseService } from '../db/service';
import { relationshipEngine } from '../intelligence/fabric/relationship-engine';
import { dependencyEngine } from '../intelligence/fabric/dependency-engine';
import { predictiveTwinEngine } from '../digital-twin/twin-engine';
import { complianceEngine } from '../intelligence/governance/compliance-engine';
import { trustEnforcer } from '../intelligence/governance/trust-enforcer';
import { graphIntelligenceEngine } from '../simulation/graph-intelligence';
import { logger } from '../core/logger';

export class ContextEngine {
  private static instance: ContextEngine;

  private constructor() {}

  public static getInstance(): ContextEngine {
    if (!ContextEngine.instance) {
      ContextEngine.instance = new ContextEngine();
    }
    return ContextEngine.instance;
  }

  /**
   * Compiles and fuses a single holistic, robust ReasoningContext from all active subsystems.
   */
  public async compileReasoningContext(): Promise<ReasoningContext> {
    try {
      logger.info('[ContextEngine] Fusing topological and telemetry streams for unified context...');

      // 1. Fetch live telemetry history
      const telemetry = await DatabaseService.getTelemetryHistory(50);
      
      // 2. Fetch incidents list
      const incidents = await DatabaseService.getIncidents();

      // 3. Fetch infrastructure topology
      const infraNodes = await DatabaseService.getInfrastructureTopology();

      // 4. Extract active Data Fabric schemas and related entities
      const fabricEntities = relationshipEngine.searchEntities('');
      const databaseSubset = fabricEntities.filter(e => e.type === 'database');
      const employeesSubset = fabricEntities.filter(e => e.type === 'employee');

      // 5. Evaluate Compliance & Zero-Trust Readiness state on the live simulator graph nodes
      const graphNodes = Array.from(graphIntelligenceEngine.nodes.values());
      const evaluatedReadiness = complianceEngine.evaluateEnterpriseReadiness(graphNodes);
      const breaches = trustEnforcer.enforceZeroTrustBoundaries(graphNodes, graphIntelligenceEngine.edges);

      // Convert breaches to governance breaches format
      const zeroTrustBreaches = breaches.map(b => ({
        id: `breach-${b.sourceNode}-${b.targetNode}`,
        title: `Zero Trust Breach: ${b.sourceNode} → ${b.targetNode}`,
        description: `Enforcement action active: ${b.enforcementActionSimulated}. Risk leaked: ${b.leakedRiskWeight}`,
        source: 'governance' as const,
        severity: (b.leakedRiskWeight > 70 ? 'critical' : b.leakedRiskWeight > 40 ? 'high' : 'medium') as 'low' | 'medium' | 'high' | 'critical',
        associatedEntities: [
          { id: b.sourceNode, name: b.sourceNode, type: 'infra' },
          { id: b.targetNode, name: b.targetNode, type: 'infra' }
        ]
      }));

      // 6. Access Digital Twin state simulations
      const overallInfectionsCount = predictiveTwinEngine.activeInfections ? predictiveTwinEngine.activeInfections.length : 0;
      const baselineTwinSnap = Array.from(predictiveTwinEngine.snapshots.values())[0] || null;

      // 7. Extract dependency networks metrics
      const fullCensus = dependencyEngine.generateFullDependencyCensus();

      return {
        timestamp: new Date().toISOString(),
        telemetrySubset: telemetry.slice(0, 15).map(t => ({
          id: t.id,
          source: t.source,
          eventType: (t as any).eventType || 'alert',
          severity: t.severity,
          message: t.message,
          timestamp: t.timestamp
        })),
        infraNodesSubset: infraNodes.slice(0, 15).map(n => ({
          id: n.id,
          name: n.name,
          status: n.status,
          namespace: n.namespace
        })),
        dbNodesSubset: databaseSubset.slice(0, 15).map(d => ({
          id: d.id,
          name: d.name,
          metadata: d.metadata
        })),
        employeesSubset: employeesSubset.slice(0, 15).map(e => ({
          id: e.id,
          name: e.name,
          metadata: e.metadata
        })),
        governanceSubset: {
          readinessScore: evaluatedReadiness.aggregatedGovernanceScore || 85,
          violationsCount: zeroTrustBreaches.length,
          zeroTrustBreaches
        },
        twinSnapshot: {
          activeInfectionsCount: overallInfectionsCount,
          snapshotLabel: baselineTwinSnap?.label || 'Baseline Standard Run',
          resilienceScore: baselineTwinSnap?.resilienceScore || 92
        },
        dependentLinksCount: fullCensus.totalMonitoredChains || 88,
        historicalIncidents: incidents.slice(0, 15).map(i => ({
          id: i.id,
          title: i.title,
          severity: i.severity,
          status: i.status,
          startTime: i.startTime
        }))
      };
    } catch (error) {
      logger.error('[ContextEngine] Crisis compiling combined context, falling back to safe bootstrap', error);
      return this.generateSafeContextStateFallback();
    }
  }

  private generateSafeContextStateFallback(): ReasoningContext {
    return {
      timestamp: new Date().toISOString(),
      telemetrySubset: [],
      infraNodesSubset: [],
      dbNodesSubset: [],
      employeesSubset: [],
      governanceSubset: {
        readinessScore: 90,
        violationsCount: 0,
        zeroTrustBreaches: []
      },
      twinSnapshot: {
        activeInfectionsCount: 0,
        snapshotLabel: 'Safe Standby State',
        resilienceScore: 100
      },
      dependentLinksCount: 12,
      historicalIncidents: []
    };
  }
}

export const contextEngine = ContextEngine.getInstance();

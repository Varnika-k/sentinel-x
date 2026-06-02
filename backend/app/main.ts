import express from 'express';
import { createServer, Server } from 'http';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { logger } from './core/logger';
import { WebSocketGateway } from './websocket/gateway';
import { TelemetryGenerator } from './telemetry/generator';
import { initializeDatabase } from './db/data-source';
import { DatabaseService } from './db/service';
import { TelemetryWorker } from './workers/telemetry-worker';
import { digitalTwinEngine } from './simulation/twin-engine';
import { graphIntelligenceEngine } from './simulation/graph-intelligence';
import { cloudTelemetryService } from './services/cloud-telemetry';
import { telemetryPipeline } from './telemetry/pipeline';
import { SuricataWatcher } from './ingestion/suricata/watcher';
import { v4 as uuidv4 } from 'uuid';

import { aiService } from './services/ai';
import { unifiedEventBus } from '../core/event-bus';
import { graphStateRuntime } from '../core/graph-runtime';
import { replayPersistenceEngine } from '../core/replay-engine';
import { MockDataGenerator } from '../core/mock-data-generator';
import { liveAttackExecutionEngine } from '../runtime/attack-engine';
import { telemetryFusionEngine } from './intelligence/fusion/fusion-engine';
import { aiOrchestrator } from './intelligence/ai/ai-orchestrator';
import { complianceEngine } from './intelligence/governance/compliance-engine';
import { sensitivityGuard } from './intelligence/governance/sensitivity-guard';
import { trustEnforcer } from './intelligence/governance/trust-enforcer';
import { isolationEngine } from './intelligence/governance/isolation-engine';

// --- Enterprise Identity Intelligence & Zero-Trust Imports ---
import { identityEngine } from './intelligence/identity/identity-engine';
import { sessionCorrelator } from './intelligence/identity/session-correlator';
import { insiderThreatEngine } from './intelligence/identity/insider-threat-engine';
import { movementAnalyzer } from './intelligence/identity/movement-analyzer';

// --- Enterprise Cybersecurity Distributed Mesh Imports ---
import { initializeEnterpriseConnectors } from './connectors/enterprise-connectors';
import { ingestionSupervisor } from './distributed/ingestion-supervisor';
import { ingestionOrchestrator } from './distributed/ingestion-orchestrator';

// --- SentinelX Enterprise Scenario Simulation & Strategic Planning Imports ---
import { scenarioEngine } from './simulation-enterprise/scenario-engine';
import { dependencySimulator } from './simulation-enterprise/dependency-simulator';
import { connectorRegistry } from './connectors/connector-base';
import { graphIntelligenceMesh } from './simulation/graph-intelligence-mesh';
import { hypotheticalSimulator } from './simulation/hypothetical-simulator';
import { prometheusRegistry } from './observability/metrics';
import { TelemetryHealthIndicator } from './observability/telemetry-health';
import { RuntimeProfiler } from './observability/runtime-profiler';
import { IngestionMonitor } from './observability/ingestion-monitor';
import { aiTaskRouter } from './intelligence/orchestration/ai-task-router';

// --- Enterprise Digital Twin and Predictive Cyber Simulation Imports ---
import { predictiveTwinEngine } from './digital-twin/twin-engine';
import { infrastructureModel } from './digital-twin/infrastructure-model';
import { governanceModel } from './digital-twin/governance-model';
import { operationalState } from './digital-twin/operational-state';
import { attackSimulator } from './digital-twin/attack-simulator';
import { temporalCorrelator } from './intelligence/temporal/temporal-correlator';

// --- Enterprise Intelligence Fabric Imports ---
import { relationshipEngine } from './intelligence/fabric/relationship-engine';
import { dependencyEngine } from './intelligence/fabric/dependency-engine';
import { influenceEngine } from './intelligence/fabric/influence-engine';
import { governanceLinker } from './intelligence/fabric/governance-linker';
import { assetContextEngine } from './intelligence/fabric/asset-context-engine';
import { enterpriseMemory } from './intelligence/fabric/enterprise-memory';
import { organizationalGraph } from './intelligence/fabric/organizational-graph';
import { intelligenceFabric } from './intelligence/fabric/intelligence-fabric';

// --- Enterprise Data Fabric and Connector Framework Imports ---
import { fabricEngine } from './data-fabric/fabric-engine';
import { connectorEngine } from './connectors/connector-engine';
import { azureAdService } from './connectors/azure-ad-service';

// --- SentinelX Autonomous Cognition & Reasoning Engine Imports ---
import { contextEngine } from './cognition/context-engine';
import { evidenceEngine } from './cognition/evidence-engine';
import { hypothesisEngine } from './cognition/hypothesis-engine';
import { confidenceEngine } from './cognition/confidence-engine';
import { explanationEngine } from './cognition/explanation-engine';
import { decisionEngine } from './cognition/decision-engine';
import { reasoningEngine } from './cognition/reasoning-engine';
import { cognitionEngine } from './cognition/cognition-engine';
import { enterpriseOS, orchestrationEngine } from './enterprise-os/enterprise-os';

// --- Production Deployment Observability & Security Hardening Imports ---
import { handleLiveness } from './health/liveness';
import { handleReadiness } from './health/readiness';
import { handleDiagnostics } from './health/diagnostics';
import { createRateLimiter } from './security/rate-limiter';
import { authenticateToken, requireAnyRole, AuthenticatedRequest } from './security/auth-guard';
import { LoadBenchmarkEngine } from './benchmarks/load-simulation';
import { WebSocketStressEngine } from './benchmarks/websocket-stress';
import { GraphScalabilityEngine } from './benchmarks/graph-scalability';



export class SentinelBackend {
  private app: express.Express;
  private server: Server;
  private gateway: WebSocketGateway;
  private telemetry: TelemetryGenerator;
  private isProd = process.env.NODE_ENV === 'production';
  private port = Number(process.env.PORT) || 3000;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.gateway = new WebSocketGateway(this.server);
    this.telemetry = new TelemetryGenerator();
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    this.app.use(express.json());
    
    // Request Tracing and Correlation IDs
    this.app.use((req: any, res, next) => {
      const correlationId = req.headers['x-correlation-id'] || `trace-corr-${uuidv4().substring(0, 8)}`;
      req.correlationId = correlationId;
      res.setHeader('X-Correlation-ID', correlationId);
      next();
    });

    // Global Rate Limiting for all api calls (250 requests per minute per IP)
    this.app.use('/api', createRateLimiter({ windowMs: 60000, max: 250 }));
    
    // Structured Request Logging
    this.app.use((req: any, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        if (!req.url.match(/\.(ts|tsx|js|jsx|css|svg|png|jpg|json|woff2?)$/)) {
          logger.info(`[${req.correlationId || 'unknown-trace'}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
        }
      });
      next();
    });
  }

  private setupRoutes() {
    // Core Production Health Probes (Root level for GKE / Cloud Run / Prometheus ingress compatibility)
    this.app.get('/health', handleLiveness);
    this.app.get('/ready', handleReadiness);
    this.app.get('/metrics', (req, res) => {
      res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
      res.send(prometheusRegistry.expoMetricsString());
    });

    // API-prefixed Health and Diagnostics Endpoints
    this.app.get('/api/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
      });
    });

    this.app.get('/api/health/diagnostics', handleDiagnostics);

    // Enterprise Load Benchmarks (Only ADMIN or OPERATOR roles permitted in production)
    this.app.post('/api/v1/benchmarks', authenticateToken, requireAnyRole(['ADMIN', 'OPERATOR']), async (req, res) => {
      try {
        const { type, size } = req.body;
        const count = Number(size) || 100;

        if (type === 'ingestion') {
          const report = await LoadBenchmarkEngine.runIngestionBenchmark(count);
          res.json({ success: true, type, report });
        } else if (type === 'websocket') {
          const report = WebSocketStressEngine.simulateHeavyFlooding(count, 5);
          res.json({ success: true, type, report });
        } else if (type === 'graph') {
          const report = GraphScalabilityEngine.benchmarkLargeClustering(count);
          res.json({ success: true, type, report });
        } else {
          res.status(400).json({ 
            success: false, 
            error: "Invalid benchmark 'type'. Supported: 'ingestion', 'websocket', 'graph'" 
          });
        }
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    // --- Tactical Cloud Intelligence integrations ---
    this.app.get('/api/v1/cloud/shodan', async (req, res) => {
      try {
        const ip = (req.query.ip as string) || "104.244.42.1";
        const result = await cloudTelemetryService.queryShodan(ip);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });

    this.app.get('/api/v1/cloud/virustotal', async (req, res) => {
      try {
        const target = (req.query.target as string) || "23.22.201.12";
        const result = await cloudTelemetryService.queryVirusTotal(target);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });

    this.app.get('/api/v1/cloud/aws', async (req, res) => {
      try {
        const result = await cloudTelemetryService.queryAWSCloudTrail();
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });

    // --- Persisted History APIs ---
    
    this.app.get('/api/v1/telemetry/history', async (req, res) => {
      try {
        const limit = Number(req.query.limit) || 100;
        const history = await DatabaseService.getTelemetryHistory(limit);
        res.json(history);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
      }
    });

    this.app.get('/api/v1/incidents', async (req, res) => {
      try {
        const incidents = await DatabaseService.getIncidents();
        res.json(incidents);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch incidents' });
      }
    });

    this.app.get('/api/v1/replay/sessions', async (req, res) => {
      try {
        const sessions = await DatabaseService.getReplaySessions();
        res.json(sessions);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch replay sessions' });
      }
    });

    this.app.get('/api/v1/replay/sessions/:id/events', async (req, res) => {
      try {
        const events = await DatabaseService.getSessionEvents(req.params.id);
        res.json(events);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch session events' });
      }
    });

    // --- Infrastructure Intelligence APIs ---

    this.app.get('/api/v1/infra/topology', async (req, res) => {
      try {
        const topology = await DatabaseService.getInfrastructureTopology();
        res.json(topology);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch topology' });
      }
    });

    this.app.get('/api/v1/infra/namespace/:namespace', async (req, res) => {
      try {
        const components = await DatabaseService.getInfrastructureByNamespace(req.params.namespace);
        res.json(components);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch namespace data' });
      }
    });

    // --- Enterprise Digital Twin Predictive & Forensic Simulation Endpoint Layer ---

    this.app.get('/api/v1/twin/status', (req, res) => {
      try {
        const nodes = Array.from(infrastructureModel.getNodes().values());
        const edges = infrastructureModel.getEdges();
        const activeInfections = predictiveTwinEngine.activeInfections;
        const mitigations = predictiveTwinEngine.mitigationStrategies;
        const compliance = governanceModel.auditCompliance(infrastructureModel.getNodes());
        const operations = operationalState.evaluateMetrics(infrastructureModel.getNodes());

        res.json({
          success: true,
          nodes,
          edges,
          activeInfections,
          mitigations,
          complianceScore: compliance.complianceScore,
          violationsCount: compliance.violations.length,
          overallContinuity: operations.overallContinuity,
          averageLatency: operations.averageLatency,
          anomalyCount: operations.anomalyCount,
          threatLevel: 100 - compliance.complianceScore,
          snapshots: Array.from(predictiveTwinEngine.snapshots.values()).map(s => ({
            id: s.id,
            timestamp: s.timestamp,
            label: s.label,
            description: s.description,
            resilienceScore: s.resilienceScore
          }))
        });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    this.app.post('/api/v1/twin/advance', (req, res) => {
      try {
        const result = predictiveTwinEngine.advanceSimulation();
        res.json({
          success: true,
          infectedCount: result.infectedCount,
          warningsList: result.warningsList,
          riskForecast: result.riskForecast
        });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    this.app.post('/api/v1/twin/snapshot', (req, res) => {
      try {
        const { label } = req.body;
        const snapshot = predictiveTwinEngine.generateBaselineSnapshot(label || `Time-Travel Checkpoint ${new Date().toLocaleTimeString()}`);
        res.json({
          success: true,
          snapshotId: snapshot.id,
          snapshot
        });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    this.app.post('/api/v1/twin/rollback', (req, res) => {
      try {
        const { snapshotId } = req.body;
        const worked = predictiveTwinEngine.rollbackToSnapshot(snapshotId);
        res.json({
          success: worked,
          message: worked ? `Rolled twin states back to snapshot ${snapshotId}` : `Snapshot ${snapshotId} not found`
        });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    this.app.post('/api/v1/twin/simulate-attack', (req, res) => {
      try {
        const { scenario, startNodeName } = req.body;
        const report = attackSimulator.simulateAttackFromNode(scenario || 'Ransomware Blast Cascade', startNodeName || 'k8s-svc-ingress-nginx');
        res.json({
          success: true,
          report
        });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    this.app.get('/api/v1/twin/temporal-context', (req, res) => {
      try {
        let currentBaselineSnap = Array.from(predictiveTwinEngine.snapshots.values())[0] || null;
        if (!currentBaselineSnap) {
          currentBaselineSnap = predictiveTwinEngine.generateBaselineSnapshot("Default Operational Baseline");
        }
        
        const context = temporalCorrelator.compileTemporalContext(currentBaselineSnap);
        res.json({
          success: true,
          ...context
        });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    this.app.post('/api/v1/twin/mitigate/:id/stage', (req, res) => {
      try {
        const worked = predictiveTwinEngine.stageMitigation(req.params.id);
        res.json({
          success: worked,
          message: worked ? `Mitigation Strategy ${req.params.id} successfully staged and locked` : `Mitigation ${req.params.id} not found`
        });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    // --- Cyber Range & Digital Twin Simulation APIs ---

    this.app.get('/api/v1/simulation/status', (req, res) => {
      try {
        res.json({
          scenario: digitalTwinEngine.scenario,
          status: digitalTwinEngine.status,
          tickCount: digitalTwinEngine.tickCount,
          threatLevel: digitalTwinEngine.threatLevel,
          sessionId: digitalTwinEngine.sessionId,
          nodes: Array.from(digitalTwinEngine.nodes.values()),
          sectors: digitalTwinEngine.getSectorMetrics(),
          aarTimeline: digitalTwinEngine.getAarTimeline(),
          survivabilityScore: digitalTwinEngine.getSurvivabilityScore(),
          operationalContinuity: digitalTwinEngine.getOperationalContinuity()
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch simulation status' });
      }
    });

    this.app.post('/api/v1/simulation/control', async (req, res) => {
      try {
        const { action, scenario } = req.body;
        if (action === 'start') {
          await digitalTwinEngine.start(scenario || 'idle');
        } else if (action === 'pause') {
          await digitalTwinEngine.pause();
        } else if (action === 'resume') {
          await digitalTwinEngine.resume();
        } else if (action === 'stop') {
          await digitalTwinEngine.stop();
        }
        res.json({ success: true, status: digitalTwinEngine.status, scenario: digitalTwinEngine.scenario });
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });

    this.app.post('/api/v1/simulation/node/action', (req, res) => {
       try {
         const { nodeName, action } = req.body;
         if (action === 'isolate') {
           digitalTwinEngine.isolateSimulatedNode(nodeName);
         } else if (action === 'unisolate' || action === 'rollback') {
           digitalTwinEngine.unisolateSimulatedNode(nodeName);
         } else if (action === 'scale') {
           digitalTwinEngine.scaleUpWorkload(nodeName);
         } else if (action === 'chaos') {
           digitalTwinEngine.injectChaosFailure(nodeName);
         } else if (action === 'rotate') {
           digitalTwinEngine.rotateNodeSecrets(nodeName);
         } else if (action === 'block') {
           digitalTwinEngine.blockNodeTraffic(nodeName);
         }
         res.json({ success: true });
       } catch (error) {
         res.status(500).json({ error: (error as Error).message });
       }
     });

    this.app.get('/api/v1/simulation/what-if/:nodeName', (req, res) => {
       try {
         const result = digitalTwinEngine.getWhatIfScenarios(req.params.nodeName);
         res.json(result);
       } catch (error) {
         res.status(500).json({ error: (error as Error).message });
       }
     });

    this.app.get('/api/v1/simulation/graph-analytics', (req, res) => {
      try {
        const nodes = Array.from(graphIntelligenceEngine.nodes.values());
        const edges = graphIntelligenceEngine.edges;
        res.json({
          nodes,
          edges
        });
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });

    this.app.post('/api/v1/telemetry/wazuh', async (req, res) => {
      try {
        const canonicalEvent = await telemetryPipeline.ingestWazuhAlert(req.body);
        res.json({ success: true, event: canonicalEvent });
      } catch (error) {
        logger.error('Wazuh ingestion API error', error);
        res.status(500).json({ error: (error as Error).message });
      }
    });

    this.app.post('/api/v1/telemetry/falco', async (req, res) => {
      try {
        const canonicalEvent = await telemetryPipeline.ingestFalcoAlert(req.body);
        res.json({ success: true, event: canonicalEvent });
      } catch (error) {
        logger.error('Falco ingestion API error', error);
        res.status(500).json({ error: (error as Error).message });
      }
    });

    // --- Distributed Telemetry Ingestion Mesh APIs ---
    this.app.get('/api/v1/ingestion/connectors', (req, res) => {
      try {
        const list = connectorRegistry.listConnectors().map(c => ({
          id: c.id,
          name: c.name,
          type: c.sourceType,
          status: 'active',
          rate: Math.floor(Math.random() * 25) + 5,
          latency: Number((Math.random() * 8 + 1).toFixed(1)),
          eventsCount: Math.floor(Math.random() * 1000) + 120,
          lastSync: 'ACTIVE'
        }));
        res.json({ connectors: list });
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });

    this.app.get('/api/v1/ingestion/stats', (req, res) => {
      try {
        const stats = ingestionOrchestrator.getStatistics();
        const mockEvents = [124, 131, 142, 138, 145, 142, 150, 155, 148, 160, 152, 140, 142];
        res.json({
          backlog: Math.max(0, stats.processedEventsCount % 12),
          processedSpeed: stats.processedEventsCount > 0 ? Math.floor(stats.processedEventsCount / 3) + 15 : 142,
          droppedSpeed: stats.droppedEventsCount,
          activeLeases: Math.min(6, (stats.loadFactor * 100) > 0 ? Math.ceil(stats.loadFactor * 5) : 3),
          timeline: mockEvents
        });
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });

    // --- Enterprise Identity Intelligence and Zero-Trust APIs ---
    this.app.get('/api/v1/identity/users', (req, res) => {
      try {
        const users = identityEngine.listIdentities();
        res.json({ success: true, users });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    this.app.get('/api/v1/identity/users/:username', (req, res) => {
      try {
        const { username } = req.params;
        const identity = identityEngine.getIdentity(username);
        if (!identity) {
          return res.status(404).json({ success: false, error: 'User identity not found' });
        }
        const sessions = sessionCorrelator.getSessionsByUsername(username);
        const incident = insiderThreatEngine.getIncident(username);
        const movements = movementAnalyzer.getSuspiciousMovements(username);

        res.json({
          success: true,
          identity,
          sessions,
          incidentDetail: incident,
          movements
        });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    this.app.get('/api/v1/identity/audits', (req, res) => {
      try {
        const audits = identityEngine.getAudits();
        res.json({ success: true, audits });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    this.app.get('/api/v1/identity/incidents', (req, res) => {
      try {
        const users = identityEngine.listIdentities();
        const activeIncidents = users
          .map(u => insiderThreatEngine.getIncident(u.username))
          .filter(Boolean);
        res.json({ success: true, incidents: activeIncidents });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    this.app.post('/api/v1/identity/activity', async (req, res) => {
      try {
        const { username, currentAssetNodeId, actionType, actionSeverity, dataBytes } = req.body;

        if (!username || !currentAssetNodeId || !actionType || !actionSeverity) {
          return res.status(400).json({ success: false, error: 'Missing mandatory tracking parameters' });
        }

        // Identify existing session, or create one dynamicaly
        const activeSessions = sessionCorrelator.getSessionsByUsername(username);
        let sessionId = activeSessions[0]?.sessionId;
        if (!sessionId) {
          sessionId = `sess-gen-${Date.now().toString().slice(-4)}`;
          sessionCorrelator.registerSession({
            sessionId,
            username,
            startedAt: new Date().toISOString(),
            ipAddress: '10.22.40.101',
            userAgent: 'Mozilla/5.0 (Simulation Interactive Console)',
            currentNodeId: currentAssetNodeId,
            tokenValidity: 'valid',
            isCompromised: false,
            actionSequence: [],
            correlatedSessionIds: [sessionId]
          });
        }

        // Resolve sector environment zone
        const targetNode = graphIntelligenceEngine.nodes.get(currentAssetNodeId);
        let sector = 'PERIMETER';
        if (targetNode) {
          if (targetNode.status === 'isolated') sector = 'ISOLATION_ZONE';
          else if (targetNode.name.includes('db') || targetNode.type.includes('DB') || targetNode.namespace === 'db-tier') sector = 'DATA_CORE';
          else if (targetNode.name.includes('iam') || targetNode.name.includes('auth')) sector = 'IDENTITY';
          else sector = 'PRODUCTION';
        }

        // Execute lateral hop tracking if user is traversing sectors
        const lastAsset = activeSessions[0]?.currentNodeId;
        if (lastAsset && lastAsset !== currentAssetNodeId) {
          movementAnalyzer.analyzeTopologicalHop(username, sessionId, lastAsset, currentAssetNodeId);
        }

        // Feed Activity Pipeline
        const result = await identityEngine.processIdentityActivity(
          username,
          sessionId,
          currentAssetNodeId,
          sector,
          actionType,
          actionSeverity,
          dataBytes || 2048
        );

        // Audit sensitive storage interaction
        if (sector === 'DATA_CORE') {
          identityEngine.logSensitiveAccessAudit(
            username,
            currentAssetNodeId,
            'confidential',
            result.isApproved ? 'allowed' : 'blocked_zero_trust',
            actionSeverity === 'critical' ? 2.5 : 1.5
          );
        }

        // Push updates onto live websocket clients via central event gateway
        if (this.gateway) {
          this.gateway.broadcast('identity_update', {
            username,
            identity: result.identity,
            verificationLog: result.verificationLog,
            isApproved: result.isApproved,
            actionType,
            currentAssetNodeId
          });
        }

        res.json({
          success: true,
          isApproved: result.isApproved,
          verificationLog: result.verificationLog,
          identity: result.identity,
          incidentReport: result.incidentReport
        });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    // --- AI Intelligence API Endpoints ---
    this.app.get('/api/ai/status', (req, res) => {
      res.json({ 
        active: !!process.env.GEMINI_API_KEY,
        provider: 'gemini'
      });
    });

    this.app.post('/api/ai/analyze/infra', async (req, res) => {
      try {
        const topology = await DatabaseService.getInfrastructureTopology();
        const events = await DatabaseService.getTelemetryHistory(50);
        const analysis = await aiService.analyzeInfra(topology, events);
        res.json(analysis);
      } catch (error) {
        logger.error('AI Infra Analysis Error', error);
        res.status(500).json({ error: (error as Error).message });
      }
    });

    this.app.post('/api/ai/analyze', async (req, res) => {
      try {
        const analysis = await aiService.analyze(req.body);
        res.json(analysis);
      } catch (error) {
        logger.error('AI Analysis Error', error);
        res.status(500).json({ error: (error as Error).message });
      }
    });

    this.app.post('/api/ai/stream', async (req, res) => {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      try {
        await aiService.stream(req.body, (chunk) => {
          res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        });
        res.write('data: [DONE]\n\n');
        res.end();
      } catch (error) {
        logger.error('AI Stream Error', error);
        res.write(`data: ${JSON.stringify({ error: (error as Error).message })}\n\n`);
        res.end();
      }
    });

    // --- Unified Core Event Runtime v2 API Endpoints ---
    this.app.get('/api/v2/events', async (req, res) => {
      try {
        const events = await replayPersistenceEngine.getLedgerOrdered();
        res.json(events);
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });

    this.app.post('/api/v2/events/ingest', async (req, res) => {
      try {
        const normalizedEvent = await unifiedEventBus.ingestEvent(req.body);
        res.json({ success: true, event: normalizedEvent });
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });

    this.app.get('/api/v2/graph/state', (req, res) => {
      try {
        res.json({
          nodes: graphStateRuntime.getNodes(),
          edges: graphStateRuntime.getEdges()
        });
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });

    this.app.post('/api/v2/scenarios/trigger', async (req, res) => {
      try {
        const { type } = req.body;
        if (!['ransomware', 'ddos', 'phishing', 'insider', 'zeroday', 'lateral', 'credential_compromise'].includes(type)) {
          return res.status(400).json({ error: 'Invalid campaign scenario type.' });
        }
        // Run scenario asynchronously via Live Attack Execution Engine
        liveAttackExecutionEngine.launchAttack(type).catch(err => {
          logger.error(`Scenario trigger async error:`, err);
        });
        res.json({ success: true, message: `Campaign scenario ${type} initialized in Live Attack Execution Engine.` });
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });

    this.app.post('/api/v2/defenses/trigger', async (req, res) => {
      try {
        const { nodeId, actionType } = req.body;
        if (!nodeId || !['isolate', 'quarantine', 'restore', 'scrub'].includes(actionType)) {
          return res.status(400).json({ error: 'Missing nodeId or invalid actionType.' });
        }
        await liveAttackExecutionEngine.executeDefenseAction(nodeId, actionType);
        res.json({ success: true, message: `Defense action ${actionType} executed on nodeId ${nodeId}` });
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });

    this.app.get('/api/v2/replays/reconstruct/:correlationId', async (req, res) => {
      try {
        const report = await replayPersistenceEngine.reconstructCampaign(req.params.correlationId);
        if (!report) {
          return res.status(404).json({ error: `Campaign not found for correlation identifier.` });
        }
        res.json(report);
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });

    this.app.get('/api/v2/intelligence/fusion/clusters', (req, res) => {
      try {
        res.json(telemetryFusionEngine.getActiveClusters());
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });

    this.app.delete('/api/v2/intelligence/fusion/clusters', (req, res) => {
      try {
        telemetryFusionEngine.clearAll();
        res.json({ success: true, message: 'Intelligence fusion caches successfully wiped.' });
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });

    this.app.post('/api/v2/intelligence/fusion/simulate', (req, res) => {
      try {
        const targetNodeId = req.body.nodeId || 'pc-admin-hq';
        logger.info(`[Main] Driving multi-source attack convergence simulation on target: ${targetNodeId}`);

        // Phase 1: Suricata Recon alerting
        const suriAlertCluster = telemetryFusionEngine.ingestPlatformSignal({
          id: `suri-scan-${uuidv4().substring(0, 6)}`,
          timestamp: new Date().toISOString(),
          source: 'SURICATA',
          eventType: 'alert',
          severity: 'high',
          nodeId: targetNodeId,
          attackStage: 'recon',
          message: `[Suricata Attack Convergence] Scanning attempts detected targeting IP 10.45.2.14 from proxy host 82.102.23.4`,
          telemetry: { original_payload: { src_ip: '82.102.23.4', dest_ip: '10.45.2.14' } }
        });

        // Phase 2: Falco Privilege Escalation Container Alerting (occurring shortly after on the same host)
        const combinedCluster = telemetryFusionEngine.ingestPlatformSignal({
          id: `falco-priv-${uuidv4().substring(0, 6)}`,
          timestamp: new Date(Date.now() + 15000).toISOString(),
          source: 'FALCO',
          eventType: 'alert',
          severity: 'critical',
          nodeId: targetNodeId,
          attackStage: 'foothold',
          message: `[Falco Attack Convergence] Privilege escalation: unauthorized root bash execution spawned inside production container`,
          telemetry: { original_payload: { container: 'auth-api-pod-52' } }
        });

        res.json({
          success: true,
          message: 'Multi-source threat convergence successfully simulated.',
          initialClusterId: suriAlertCluster.id,
          finalClusterState: combinedCluster
        });
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });

    // --- Enterprise Governance & Advanced AI Reasoning API Endpoints ---
    this.app.get('/api/v2/intelligence/ai/reasoning/:nodeName', async (req, res) => {
      try {
        const analysis = await aiOrchestrator.analyzeInfrastructure(req.params.nodeName);
        res.json(analysis);
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });

    this.app.get('/api/v2/intelligence/ai/stream/:nodeName', async (req, res) => {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      try {
        await aiOrchestrator.streamReasoningMarkdown(req.params.nodeName, (chunk) => {
          res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        });
        res.write('data: [DONE]\n\n');
        res.end();
      } catch (error) {
        logger.error(`AI stream reasoning failed for ${req.params.nodeName}`, error);
        res.write(`data: ${JSON.stringify({ error: (error as Error).message })}\n\n`);
        res.end();
      }
    });

    this.app.get('/api/v2/intelligence/governance/readiness', async (req, res) => {
      try {
        const nodes = Array.from(graphIntelligenceEngine.nodes.values());
        const readiness = complianceEngine.evaluateEnterpriseReadiness(nodes);
        res.json(readiness);
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });

    this.app.get('/api/v2/intelligence/governance/zones', async (req, res) => {
      try {
        const nodes = Array.from(graphIntelligenceEngine.nodes.values());
        const edges = graphIntelligenceEngine.edges;
        const zones = sensitivityGuard.auditSensitivityZones(nodes);
        const zeroTrustBreaches = trustEnforcer.enforceZeroTrustBoundaries(nodes, edges);
        const quarantines = isolationEngine.trackSimulatedNodesQuarantined();

        res.json({
          zones,
          zeroTrustBreaches,
          quarantines
        });
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });

    this.app.post('/api/v2/intelligence/governance/quarantine', async (req, res) => {
      try {
        const { nodeId } = req.body;
        if (!nodeId) {
          return res.status(400).json({ error: 'Missing target nodeId for simulated quarantine.' });
        }
        const quarantine = isolationEngine.simulateQuarantine(nodeId);
        res.json({ success: true, quarantine });
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });

    // --- SentinelX Enterprise Intelligence Fabric API Routes ---
    this.app.get('/api/v2/intelligence/fabric/entities', (req, res) => {
      try {
        const query = (req.query.q as string) || '';
        const results = relationshipEngine.searchEntities(query);
        res.json({ success: true, count: results.length, entities: results });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    this.app.get('/api/v2/intelligence/fabric/entities/:id', (req, res) => {
      try {
        const entity = relationshipEngine.getEntity(req.params.id);
        if (!entity) {
          return res.status(404).json({ success: false, error: 'Entity not found' });
        }
        
        const adjacencies = relationshipEngine.getAdjacencies(req.params.id);
        const impact = assetContextEngine.evaluateAssetImpact(req.params.id);
        const blast = assetContextEngine.calculateBlastRadius(req.params.id);
        
        res.json({
          success: true,
          entity,
          adjacencies,
          impact,
          blast
        });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    this.app.get('/api/v2/intelligence/fabric/dependencies', (req, res) => {
      try {
        const census = dependencyEngine.generateFullDependencyCensus();
        const bottlenecks = dependencyEngine.detectBottlenecks();
        res.json({ success: true, ...census, bottlenecks });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    this.app.get('/api/v2/intelligence/fabric/dependencies/:employeeId', (req, res) => {
      try {
        const chain = dependencyEngine.discoverEmployeeChain(req.params.employeeId);
        if (!chain) {
          return res.status(404).json({ success: false, error: 'Employee chain not found' });
        }
        res.json({ success: true, chain });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    this.app.get('/api/v2/intelligence/fabric/risk', (req, res) => {
      try {
        const assessment = intelligenceFabric.compileEnterpriseRiskAssessment();
        res.json({ success: true, ...assessment });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    this.app.get('/api/v2/intelligence/fabric/org', (req, res) => {
      try {
        const graph = organizationalGraph.generateFullOrgGraph();
        const levels = influenceEngine.compileOperationalInfluenceMap();
        res.json({ success: true, graph, influenceLevels: levels });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    this.app.get('/api/v2/intelligence/fabric/memories', (req, res) => {
      try {
        const query = (req.query.q as string) || '';
        const results = enterpriseMemory.searchMemories(query);
        res.json({ success: true, memories: results });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    this.app.post('/api/v2/intelligence/fabric/memories', (req, res) => {
      try {
        const { category, title, description, severity, mitigationSteps } = req.body;
        if (!category || !title || !description || !severity) {
          return res.status(400).json({ success: false, error: 'Missing mandatory fields to generate dynamic memory.' });
        }
        const fresh = enterpriseMemory.addMemory(category, title, description, severity, mitigationSteps || []);
        res.status(201).json({ success: true, memory: fresh });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    this.app.post('/api/v2/intelligence/fabric/simulate', (req, res) => {
      try {
        const { type, targetId } = req.body;
        if (!type || !targetId) {
          return res.status(400).json({ success: false, error: 'Request fields "type" and "targetId" are mandatory.' });
        }
        const outcome = intelligenceFabric.runExecutiveSimulation({ type, targetId });
        res.json({ success: true, outcome });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    this.app.post('/api/v2/intelligence/fabric/reason', (req, res) => {
      try {
        const { nodeId } = req.body;
        if (!nodeId) {
          return res.status(400).json({ success: false, error: 'Missing nodeId for AI strategic reasoning.' });
        }
        const markdown = intelligenceFabric.generateAIInsights(nodeId);
        res.json({ success: true, reasoning: markdown });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    // --- SentinelX Enterprise Scenario Simulation & Strategic Planning v2 API Routes ---
    this.app.get('/api/v2/enterprise-simulation/entities', (req, res) => {
      try {
        const entities = dependencySimulator.getEntities();
        const links = dependencySimulator.getLinks();
        res.json({ success: true, entities, links });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    this.app.post('/api/v2/enterprise-simulation/run', async (req, res) => {
      try {
        const { scenarioType, customTargets, customDescription } = req.body;
        if (!scenarioType) {
          return res.status(400).json({ success: false, error: 'Request field "scenarioType" is mandatory.' });
        }
        const report = await scenarioEngine.runScenario(scenarioType, customTargets || [], customDescription || '');
        res.json({ success: true, report });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    this.app.post('/api/v2/enterprise-simulation/compare', async (req, res) => {
      try {
        const { scenarioTypes } = req.body;
        if (!scenarioTypes || !Array.isArray(scenarioTypes)) {
          return res.status(400).json({ success: false, error: 'Request field "scenarioTypes" must be an array.' });
        }
        const reports = [];
        for (const type of scenarioTypes) {
          const report = await scenarioEngine.runScenario(type);
          reports.push(report);
        }
        res.json({ success: true, reports });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    // --- SentinelX Autonomous Cognition & Executive Reasoning Engine v2 API Routes ---
    this.app.get('/api/v2/cognition/status', async (req, res) => {
      try {
        await cognitionEngine.executeCognitiveCycle(); // run on-demand refresh
        const context = await contextEngine.compileReasoningContext();
        const hypotheses = hypothesisEngine.getHypotheses();
        const memory = cognitionEngine.getOrganizationalMemory();
        res.json({
          success: true,
          context,
          hypotheses,
          organizationalMemory: memory
        });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    this.app.get('/api/v2/cognition/decision-graph', async (req, res) => {
      try {
        const hypotheses = hypothesisEngine.getHypotheses();
        const evidences = evidenceEngine.getEvidenceList();
        const graph = decisionEngine.buildDecisionGraph(hypotheses, evidences);
        res.json({
          success: true,
          graph
        });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    this.app.get('/api/v2/cognition/predictions', async (req, res) => {
      try {
        const context = await contextEngine.compileReasoningContext();
        const predictions = reasoningEngine.compilePredictiveInsights(context);
        res.json({ success: true, predictions });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    this.app.post('/api/v2/cognition/explain', async (req, res) => {
      try {
        const { hypothesisId } = req.body;
        if (!hypothesisId) {
          return res.status(400).json({ success: false, error: 'Missing hypothesisId to evaluate reasons.' });
        }
        const hypothesis = hypothesisEngine.getHypothesisById(hypothesisId);
        if (!hypothesis) {
          return res.status(404).json({ success: false, error: 'Hypothesis not found' });
        }
        const context = await contextEngine.compileReasoningContext();
        const expansion = await explanationEngine.generateExplanation(hypothesis, context);
        res.json({ success: true, explanation: expansion });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    this.app.post('/api/v2/cognition/query', async (req, res) => {
      try {
        const { query } = req.body;
        if (!query) {
          return res.status(400).json({ success: false, error: 'Empty query parameter.' });
        }
        const queryResponse = await cognitionEngine.answerDecisionSupportQuery(query);
        res.json({ success: true, ...queryResponse });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    this.app.get('/api/v2/cognition/brief', async (req, res) => {
      try {
        const context = await contextEngine.compileReasoningContext();
        const hypotheses = hypothesisEngine.getHypotheses();
        const predictions = reasoningEngine.compilePredictiveInsights(context);
        const brief = cognitionEngine.generateExecutiveBrief(context, hypotheses, predictions);
        res.json({ success: true, brief });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    // --- Enterprise Cybersecurity Distributed Mesh API Endpoints ---
    this.app.get('/api/v2/distributed/ingestion/stats', (req, res) => {
      try {
        const stats = ingestionOrchestrator.getStatistics();
        const connectors = connectorRegistry.listConnectors().map(c => ({
          id: c.id,
          name: c.name,
          sourceType: c.sourceType
        }));
        const health = TelemetryHealthIndicator.getOverallHealth();
        const statsBucket = IngestionMonitor.harvestPeriodStats();

        res.json({
          stats,
          statsBucket,
          health,
          connectorsRegistered: connectors.length,
          connectors
        });
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });

    this.app.get('/api/v2/distributed/metrics', (req, res) => {
      try {
        res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
        res.send(prometheusRegistry.expoMetricsString());
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });

    this.app.get('/api/v2/distributed/graph/mesh', (req, res) => {
      try {
        const partitions = graphIntelligenceMesh.dynamicPartitioning();
        const clusters = graphIntelligenceMesh.computeLargeScaleClustering();
        
        // Map nodes with adaptive scales
        const rawNodes = Array.from(graphIntelligenceEngine.nodes.values());
        const nodesEnriched = rawNodes.map(n => ({
          ...n,
          adaptivePropagationScale: graphIntelligenceMesh.evaluateAdaptivePropagationScale(n.name)
        }));

        res.json({
          partitions,
          clusters,
          nodesEnriched
        });
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });

    this.app.get('/api/v2/distributed/graph/routing', (req, res) => {
      try {
        const { source, target } = req.query;
        if (!source || !target) {
          return res.status(400).json({ error: 'Source and target query parameters are required.' });
        }
        const pathArray = graphIntelligenceMesh.computeIntelligentEdgeRouting(source as string, target as string);
        res.json({ path: pathArray });
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });

    this.app.post('/api/v2/distributed/simulation/hypothetical', (req, res) => {
      try {
        const { targetNode } = req.body;
        if (!targetNode) {
          return res.status(400).json({ error: 'Missing targetNode for hypothetical attack vector.' });
        }
        const result = hypotheticalSimulator.simulateHypotheticalAttack(targetNode);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });

    // Submits structured AI query using task router
    this.app.post('/api/v2/distributed/intelligence/ai/orchestrate', async (req, res) => {
      try {
        const { nodeId } = req.body;
        if (!nodeId) {
          return res.status(400).json({ error: 'nodeId parameter required.' });
        }
        const analysis = await aiTaskRouter.orchestrateReasoningRequest(nodeId);
        res.json(analysis);
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });


    // --- SentinelX Enterprise Operating System (OS) Layer API Endpoints ---
    this.app.get('/api/v2/enterprise-os/executive-summaries', (req, res) => {
      try {
        const payload = enterpriseOS.getExecutiveVisualsDump();
        res.json({ success: true, ...payload });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    this.app.get('/api/v2/enterprise-os/explore', (req, res) => {
      try {
        const query = (req.query.q as string) || '';
        const results = enterpriseOS.searchEnterpriseOS(query);
        res.json({ success: true, query, results });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    this.app.post('/api/v2/enterprise-os/mitigate', (req, res) => {
      try {
        const { incidentName, offendingEntityId } = req.body;
        if (!incidentName || !offendingEntityId) {
          return res.status(400).json({ success: false, error: 'incidentName and offendingEntityId are required.' });
        }
        orchestrationEngine.triggerCoordinatedRemediationPlaybook(incidentName, offendingEntityId);
        res.json({ success: true, message: 'Coordinated playbook mitigation instructions triggered on routing fabric.' });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });


    // --- SentinelX Enterprise Data Fabric API Routes ---
    this.app.get('/api/v3/fabric/stats', (req, res) => {
      try {
        const stats = fabricEngine.getEnterpriseScaleStats();
        res.json({ success: true, stats });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    this.app.get('/api/v3/fabric/search', (req, res) => {
      try {
        const query = (req.query.q as string) || '';
        const filterType = (req.query.type as string) || 'all';
        const results = fabricEngine.search(query, filterType);
        res.json({ success: true, count: results.length, results });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    this.app.get('/api/v3/fabric/nodes/:id', (req, res) => {
      try {
        const context = fabricEngine.getNodeContext(req.params.id);
        if (!context) {
          return res.status(404).json({ success: false, error: `Node ID '${req.params.id}' not found in fabric.` });
        }
        res.json({ success: true, context });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    this.app.get('/api/v3/fabric/graph', (req, res) => {
      try {
        const graph = fabricEngine.generateUIModel();
        res.json({ success: true, graph });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    this.app.post('/api/v3/fabric/refresh', (req, res) => {
      try {
        fabricEngine.refresh();
        res.json({ success: true, message: 'Re-inventoried all corporate systems and auto-generated mappings.' });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    // --- SentinelX Universal Connector Framework API Routes ---
    this.app.get('/api/v3/connectors', (req, res) => {
      try {
        const dashboard = connectorEngine.getConnectorDashboard();
        const mappedDashboard = dashboard.map(conn => {
          if (conn.id === 'conn-entra-id-oauth') {
            const entraStats = azureAdService.getConfig().syncStats;
            return {
              ...conn,
              status: entraStats.status,
              lastSyncTimestamp: entraStats.lastSyncTimestamp || conn.lastSyncTimestamp,
              ingestedRecordCount: entraStats.syncedUsersCount + entraStats.syncedGroupsCount + entraStats.syncedRolesCount,
              logs: entraStats.logs
            };
          }
          return conn;
        });
        res.json({ success: true, connectors: mappedDashboard });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    // --- Microsoft Entra ID (Azure AD) OAuth / Connection APIs ---
    
    // 1. Get active Entra ID config & integration stats
    this.app.get('/api/v3/connectors/azure-ad/config', (req, res) => {
      try {
        const config = azureAdService.getConfig();
        res.json({ success: true, config });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    // 2. Set/update credentials
    this.app.post('/api/v3/connectors/azure-ad/config', (req, res) => {
      try {
        const { clientId, clientSecret, tenantId } = req.body;
        azureAdService.updateCredentials(clientId, clientSecret, tenantId);
        res.json({ success: true, message: 'OAuth client credentials updated successfully.' });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    // 3. Initiate active pop-up user authorize flow redirect URL
    this.app.get('/api/v3/connectors/azure-ad/authorize-url', (req, res) => {
      try {
        const clientRedirectOrigin = (req.query.origin as string) || `${req.protocol}://${req.get('host')}`;
        const url = azureAdService.getAuthorizationUrl(clientRedirectOrigin);
        res.json({ success: true, url });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    // 4. Premium mock authorize consent screen serving Sandbox OIDC logins beautifully
    this.app.get('/api/v3/connectors/azure-ad/sandbox-consent', (req, res) => {
      const redirectUri = req.query.redirect_uri as string;
      const state = req.query.state as string;

      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Sign in to your Microsoft Account</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-slate-100 flex items-center justify-center min-h-screen font-sans">
          <div class="bg-white p-8 rounded shadow-lg max-w-md w-full border border-slate-200">
            <!-- Logo -->
            <div class="flex items-center space-x-2 mb-6">
              <div class="grid grid-cols-2 gap-0.5 w-6 h-6">
                <div class="bg-[#f25022] w-2.5 h-2.5"></div>
                <div class="bg-[#7fba00] w-2.5 h-2.5"></div>
                <div class="bg-[#00a4ef] w-2.5 h-2.5"></div>
                <div class="bg-[#ffb900] w-2.5 h-2.5"></div>
              </div>
              <span class="text-xl font-semibold text-slate-700 font-sans">Microsoft</span>
            </div>

            <!-- Header -->
            <h1 class="text-2xl font-semibold text-slate-800 mb-2">Permissions requested</h1>
            <p class="text-sm text-slate-500 mb-6">SentinelX Platform Enterprise Adapter accounts requests consent to access the following directory bindings on your directory server:</p>

            <!-- Permissions Detail -->
            <div class="space-y-4 mb-8">
              <div class="flex items-start">
                <span class="text-emerald-500 mr-2 text-lg">✔</span>
                <div>
                  <p class="text-sm font-semibold text-slate-700">Read your basic profile (openid, profile)</p>
                  <p class="text-xs text-slate-500">Allows SentinelX to authenticate and map your identity credentials.</p>
                </div>
              </div>
              <div class="flex items-start">
                <span class="text-emerald-500 mr-2 text-lg">✔</span>
                <div>
                  <p class="text-sm font-semibold text-slate-700">Read directory users (User.Read)</p>
                  <p class="text-xs text-slate-500">Sutures direct employee maps into the local Workforce Intelligence.</p>
                </div>
              </div>
              <div class="flex items-start">
                <span class="text-emerald-500 mr-2 text-lg">✔</span>
                <div>
                  <p class="text-sm font-semibold text-slate-700">Access group rosters (GroupMember.Read.All)</p>
                  <p class="text-xs text-slate-500">Fetches corporate structures and department-level assignments.</p>
                </div>
              </div>
            </div>

            <!-- Buttons -->
            <div class="flex space-x-3 justify-end">
              <button onclick="window.close()" class="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 text-sm font-semibold">
                Cancel
              </button>
              <a href="${redirectUri}?code=entra-sandbox-auth-code&state=${state}" class="px-5 py-2 bg-[#0067b8] text-white rounded hover:bg-[#005da6] text-sm font-semibold text-center shadow">
                Accept &amp; Connect
              </a>
            </div>
          </div>
        </body>
        </html>
      `);
    });

    // 5. Secure callback handler
    this.app.get('/api/v3/connectors/azure-ad/callback', async (req, res) => {
      try {
        const code = (req.query.code as string) || '';
        const success = await azureAdService.handleOAuthCallback(code);

        if (success) {
          // Immediately perform postMessage handshake to notify parent frame
          res.send(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Connection Success</title>
              <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body class="bg-gradient-to-br from-emerald-950 to-slate-900 text-white min-h-screen flex flex-col items-center justify-center p-6 text-center font-sans">
              <div class="bg-slate-900/60 p-8 rounded-xl border border-emerald-500/20 shadow-2xl max-w-sm w-full">
                <div class="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 text-3xl font-bold mx-auto mb-4 border border-emerald-500/30">
                  ✓
                </div>
                <h1 class="text-2xl font-bold text-emerald-400 mb-2">Exchange Successful</h1>
                <p class="text-sm text-slate-300 mb-6 font-mono">Authentication code exchanged for an Active OIDC session. Transmitting to parent window...</p>
                <div class="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-4">
                  <div class="h-full bg-emerald-400 rounded-full animate-[pulse_1.5s_infinite] w-full"></div>
                </div>
                <p class="text-xs text-slate-400">Closing window automatically...</p>
              </div>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', service: 'azure-ad' }, '*');
                  setTimeout(() => { window.close(); }, 1200);
                } else {
                  setTimeout(() => { window.location.href = '/'; }, 1500);
                }
              </script>
            </body>
            </html>
          `);
        } else {
          res.status(500).send(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Connection Failure</title>
            </head>
            <body style="font-family: sans-serif; background: #0f172a; color: #f43f5e; text-align: center; padding-top: 100px;">
              <h2>Handshake Failed</h2>
              <p style="color: #94a3b8;">OAuth server rejected token negotiations. Confirm client secret and redirect bindings.</p>
              <button onclick="window.close()" style="margin-top: 20px; padding: 8px 16px; background: #e11d48; color: white; border: none; border-radius: 4px; cursor: pointer;">Close Window</button>
            </body>
            </html>
          `);
        }
      } catch (error: any) {
        res.status(500).send(`<h2>Fatal Handshake Exception</h2><p>${error.message}</p>`);
      }
    });

    this.app.post('/api/v3/connectors/:id/sync', async (req, res) => {
      try {
        if (req.params.id === 'conn-entra-id-oauth') {
          const success = await azureAdService.synchronizeActiveDirectory();
          if (success) {
            return res.json({ success: true, message: 'Successfully synchronized Microsoft Entra ID Active Directory boundary end-to-end.' });
          } else {
            return res.status(500).json({ success: false, error: 'Directory sync failed. Audit token validity or credentials.' });
          }
        }
        const success = await connectorEngine.executeManualIngestionSync(req.params.id);
        if (success) {
          res.json({ success: true, message: `Successfully synchronized and ingested metadata footprint for ${req.params.id}.` });
        } else {
          res.status(500).json({ success: false, error: 'Synchronization runtime encountered an unexpected operational failure.' });
        }
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    this.app.post('/api/v3/connectors/:id/config', (req, res) => {
      try {
        const { connectionEndpoint, syncIntervalMinutes, authType } = req.body;
        if (!connectionEndpoint || !syncIntervalMinutes || !authType) {
          return res.status(400).json({ success: false, error: 'connectionEndpoint, syncIntervalMinutes, and authType parameters are mandatory.' });
        }

        const success = connectorEngine.updateConnectorConfig(
          req.params.id,
          connectionEndpoint,
          Number(syncIntervalMinutes),
          authType
        );

        if (success) {
          res.json({ success: true, message: `Successfully reconfigured and rescheduled connector timer schedules.` });
        } else {
          res.status(404).json({ success: false, error: `Connector ID '${req.params.id}' spec. matching not found.` });
        }
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    // Handle API 404 (Endpoint Not Found) so we never return raw index.html block on API misses
    this.app.use('/api', (req, res) => {
      res.status(404).json({ error: `API route '${req.originalUrl}' not found.` });
    });
  }

  public async start() {
    // Vite Integration
    if (!this.isProd) {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      // Bypass Vite SPA fallback for API calls to prevent HTML answers
      this.app.use((req, res, next) => {
        if (req.path.startsWith('/api/')) {
          return next();
        }
        vite.middlewares(req, res, next);
      });
      logger.info('Vite development middleware mounted');
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      this.app.use(express.static(distPath));
      this.app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api/')) {
          return next();
        }
        res.sendFile(path.join(distPath, 'index.html'));
      });
      logger.info('Serving production static files');
    }

    // Bind and start listening immediately so Cloud Run ingress checks and TCP probes pass
    this.server.listen(this.port, '0.0.0.0', () => {
      logger.info(`SENTINEL_X_BACKEND successfully bound port ${this.port}. Active ingress channel open.`);
      
      // Perform background service activation asynchronously
      (async () => {
        try {
          // 0. Initialize Enterprise distributed mesh & supervisor
          initializeEnterpriseConnectors();
          ingestionSupervisor.startSupervising();

          // 1. Initialize persistent storage
          await initializeDatabase();
          
          // 2. Start high-frequency background telemetry processor
          await TelemetryWorker.start();
          
          // 3. Initiate local and cloud indicators
          this.telemetry.start();
          cloudTelemetryService.start();

          // 4. Start real-time Suricata eve.json stream ingestion pipeline
          SuricataWatcher.getInstance().start();
          
          // Initiate v2 core Unified Event Bus background generation
          setInterval(() => {
            MockDataGenerator.generateBackgroundTelemetry().catch(err => {
              logger.error('Failed to generate continuous background operational telemetry', err);
            });
          }, 8000);
          logger.info('Unified Event Bus background telemetry harness activated.');
          
          logger.info('SentinelX active defense analytics, incident reconciliation, and core telemetry ingestion fully engaged.');
        } catch (error) {
          logger.error('CRITICAL: Background ingestion worker chain initialization failed.', error);
        }
      })();
    });
  }
}

// Instantiate and export for server.ts
export const sentinelBackend = new SentinelBackend();

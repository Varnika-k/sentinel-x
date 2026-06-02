import { logger } from '../../core/logger';
import { relationshipEngine, FabricEntity } from './relationship-engine';

export interface DependencyChain {
  employeeId: string;
  employeeName: string;
  application: FabricEntity | null;
  database: FabricEntity | null;
  infraNode: FabricEntity | null;
  cloudResource: FabricEntity | null;
  department: FabricEntity | null;
  executiveOwnerName: string;
}

export class DependencyEngine {
  /**
   * Discovers and compiles the full sequential dependency chain for any employee
   */
  public discoverEmployeeChain(employeeId: string): DependencyChain | null {
    const employee = relationshipEngine.getEntity(employeeId);
    if (!employee || employee.type !== 'employee') return null;

    let application: FabricEntity | null = null;
    let database: FabricEntity | null = null;
    let infraNode: FabricEntity | null = null;
    let cloudResource: FabricEntity | null = null;
    let department: FabricEntity | null = null;
    let executiveOwnerName = 'Seraphina Vance (CEO)';

    // 1. Trace outward from Employee to Applications they access
    const employeeAdjs = relationshipEngine.getAdjacencies(employeeId);
    const accessibleApps = employeeAdjs.filter(a => a.entity?.type === 'application' && a.direction === 'outgoing');
    if (accessibleApps.length > 0) {
      // Pick the strongest or first application
      application = accessibleApps[0].entity!;
    }

    // 2. Trace App -> Database
    if (application) {
      const appAdjs = relationshipEngine.getAdjacencies(application.id);
      const connectedDbs = appAdjs.filter(a => a.entity?.type === 'database' && a.direction === 'outgoing');
      if (connectedDbs.length > 0) {
        database = connectedDbs[0].entity!;
      }
    }

    // 3. Trace Database -> Infra node
    if (database) {
      const dbAdjs = relationshipEngine.getAdjacencies(database.id);
      const connectedInfras = dbAdjs.filter(a => a.entity?.type === 'infra_node');
      if (connectedInfras.length > 0) {
        infraNode = connectedInfras[0].entity!;
      }
    }

    // 4. Trace Infra node -> Cloud resource
    if (infraNode) {
      const infraAdjs = relationshipEngine.getAdjacencies(infraNode.id);
      const connectedClouds = infraAdjs.filter(a => a.entity?.type === 'cloud_resource');
      if (connectedClouds.length > 0) {
        cloudResource = connectedClouds[0].entity!;
      }
    }

    // 5. Trace Employee -> Department
    const deptAdj = employeeAdjs.find(a => a.entity?.type === 'department');
    if (deptAdj) {
      department = deptAdj.entity!;
      if (department.metadata && department.metadata.head) {
        executiveOwnerName = department.metadata.head;
      }
    }

    return {
      employeeId,
      employeeName: employee.name,
      application,
      database,
      infraNode,
      cloudResource,
      department,
      executiveOwnerName
    };
  }

  /**
   * Generates a full statistical census mapping of the entire enterprise's critical dependencies
   */
  public generateFullDependencyCensus() {
    const employees = relationshipEngine.getEntities().filter(e => e.type === 'employee');
    const chains: DependencyChain[] = [];

    employees.forEach(emp => {
      const chain = this.discoverEmployeeChain(emp.id);
      if (chain) chains.push(chain);
    });

    return {
      totalMonitoredChains: chains.length,
      criticalFailureChainsCount: chains.filter(c => c.application?.metadata?.riskLevel === 'critical' || c.database?.metadata?.sensitivity === 'restricted').length,
      chains
    };
  }

  /**
   * Identifies hidden dependencies or over-connected operational bottlenecks
   */
  public detectBottlenecks() {
    const allRelations = relationshipEngine.getRelations();
    const targetCounts: { [id: string]: { count: number; name: string; type: string } } = {};

    allRelations.forEach(rel => {
      const targetId = rel.targetId;
      const targetEntity = relationshipEngine.getEntity(targetId);
      if (targetEntity) {
        if (!targetCounts[targetId]) {
          targetCounts[targetId] = { count: 0, name: targetEntity.name, type: targetEntity.type };
        }
        targetCounts[targetId].count++;
      }
    });

    const bottlenecks = Object.keys(targetCounts)
      .map(id => ({ id, ...targetCounts[id] }))
      .sort((a, b) => b.count - a.count)
      .filter(x => x.count >= 3); // High connectivity threshold

    return {
      totalIdentifiedTargets: Object.keys(targetCounts).length,
      bottlenecks
    };
  }
}

export const dependencyEngine = new DependencyEngine();

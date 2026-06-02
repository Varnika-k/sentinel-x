import { logger } from '../../core/logger';

export interface ReasoningTask {
  id: string;
  nodeId: string;
  payload: any;
  priority: 'low' | 'normal' | 'high' | 'immediate';
  timestamp: number;
}

export class ReasoningPriorityEngine {
  private queue: ReasoningTask[] = [];

  public submitTask(nodeId: string, payload: any, basePriority: 'low' | 'normal' | 'high'): ReasoningTask {
    const isImmediate = nodeId === 'k8s-pod-auth-api-559b' || nodeId === 'azure-vm-ad-connector';
    const priority = isImmediate ? 'immediate' : basePriority;

    const task: ReasoningTask = {
      id: `TASK-${nodeId.toUpperCase()}-${Date.now().toString().slice(-4)}`,
      nodeId,
      payload,
      priority,
      timestamp: Date.now()
    };

    this.queue.push(task);
    this.sortQueue();
    logger.info(`[ReasoningPriorityEngine] Received reasoning request task ${task.id} for node: ${nodeId}. Priority: ${priority.toUpperCase()}`);
    return task;
  }

  public getNextTask(): ReasoningTask | undefined {
    return this.queue.shift();
  }

  private sortQueue(): void {
    const priorityWeights = { 'immediate': 4, 'high': 3, 'normal': 2, 'low': 1 };
    
    this.queue.sort((a, b) => {
      const weightA = priorityWeights[a.priority];
      const weightB = priorityWeights[b.priority];
      
      if (weightA !== weightB) {
        return weightB - weightA; // Higher weight first
      }
      return a.timestamp - b.timestamp; // Oldest first (FIFO on ties)
    });
  }

  public getQueueLength(): number {
    return this.queue.length;
  }
}

export const reasoningPriorityEngine = new ReasoningPriorityEngine();

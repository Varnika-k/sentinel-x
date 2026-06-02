export interface MetricEntry {
  name: string;
  type: 'counter' | 'gauge' | 'histogram';
  help: string;
  value: number;
  labels?: Record<string, string>;
}

export class PrometheusRegistry {
  private static instance: PrometheusRegistry;
  private metrics: Map<string, MetricEntry> = new Map();

  private constructor() {
    this.initializeDefaultMetrics();
  }

  public static getInstance(): PrometheusRegistry {
    if (!PrometheusRegistry.instance) {
      PrometheusRegistry.instance = new PrometheusRegistry();
    }
    return PrometheusRegistry.instance;
  }

  private initializeDefaultMetrics(): void {
    this.register('sentinelx_ingestion_throughput_total', 'counter', 'Total number of telemetry events ingested');
    this.register('sentinelx_websocket_latency_ms', 'gauge', 'Current real-time websocket heartbeat latency');
    this.register('sentinelx_graph_rendering_ms', 'gauge', 'Topological tree graph rendering engine speed in frontend');
    this.register('sentinelx_replay_performance_factor', 'gauge', 'Replay sequencer processing factor');
    this.register('sentinelx_ai_latency_seconds', 'histogram', 'Seconds taken by cognitive inference calls');
    this.register('sentinelx_queue_depth_events', 'gauge', 'Total events backed up in queue partitions');
  }

  public register(name: string, type: 'counter' | 'gauge' | 'histogram', help: string): void {
    this.metrics.set(name, { name, type, help, value: 0 });
  }

  public increment(name: string, value: number = 1): void {
    const metric = this.metrics.get(name);
    if (metric) {
      metric.value += value;
    }
  }

  public set(name: string, value: number): void {
    const metric = this.metrics.get(name);
    if (metric) {
      metric.value = value;
    }
  }

  public get(name: string): MetricEntry | undefined {
    return this.metrics.get(name);
  }

  /**
   * Serializes the metrics into Prometheus text format
   */
  public expoMetricsString(): string {
    let output = '';
    for (const [name, metric] of this.metrics.entries()) {
      output += `# HELP ${metric.name} ${metric.help}\n`;
      output += `# TYPE ${metric.name} ${metric.type.toUpperCase()}\n`;
      output += `${metric.name} ${metric.value}\n\n`;
    }
    return output;
  }
}

export const prometheusRegistry = PrometheusRegistry.getInstance();

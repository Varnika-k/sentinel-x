import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../../core/logger';
import { SuricataParser } from './parser';
import { SuricataNormalizer } from './normalizer';
import { SuricataTelemetryAdapter } from './telemetry-adapter';

export class SuricataWatcher {
  private static instance: SuricataWatcher;
  private logPath = '/var/log/suricata/eve.json';
  private currentOffset = 0;
  private watcher: fs.FSWatcher | null = null;
  private mockInterval: NodeJS.Timeout | null = null;
  private isProcessing = false;

  private constructor() {}

  public static getInstance(): SuricataWatcher {
    if (!SuricataWatcher.instance) {
      SuricataWatcher.instance = new SuricataWatcher();
    }
    return SuricataWatcher.instance;
  }

  /**
   * Initializes the directory structure and starts monitoring the eve.json file stream
   */
  public start() {
    logger.info('[SuricataWatcher] Initiating Real-Time Suricata sensor telemetry monitor...');

    try {
      const dirPath = path.dirname(this.logPath);
      
      // Ensure log directory exists
      if (!fs.existsSync(dirPath)) {
        logger.info(`[SuricataWatcher] Log directory ${dirPath} does not exist. Creating directories...`);
        fs.mkdirSync(dirPath, { recursive: true });
      }

      // Ensure log file exists
      if (!fs.existsSync(this.logPath)) {
        logger.info(`[SuricataWatcher] Creating blank eve.json trace target at paths: ${this.logPath}`);
        fs.writeFileSync(this.logPath, '', 'utf8');
      }

      // Grab initial file size to prevent processing old history on boot
      const stats = fs.statSync(this.logPath);
      this.currentOffset = stats.size;

      // Initialize persistent watcher
      this.setupFileWatcher();

      // Launch dynamic background test threats to simulated-loop to feed eve.json stream
      this.startThreatSimulator();

      logger.info(`[SuricataWatcher] SENSOR LIVE. File target size: ${this.currentOffset} bytes.`);
    } catch (err) {
      logger.error('[SuricataWatcher] Initial hardware watcher bind failed.', err);
    }
  }

  /**
   * Stops the filesystem watcher and mock simulators
   */
  public stop() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
    if (this.mockInterval) {
      clearInterval(this.mockInterval);
      this.mockInterval = null;
    }
    logger.info('[SuricataWatcher] Realtime Suricata watcher stopped.');
  }

  /**
   * Watches using Node FS watch + stat offset check for file updates
   */
  private setupFileWatcher() {
    try {
      // Fallback robust polling tracker alongside fs.watch to combat sandbox file mount differences
      let lastCheckedSize = this.currentOffset;

      const checkFileUpdate = () => {
        if (this.isProcessing) return;
        try {
          const stats = fs.statSync(this.logPath);
          if (stats.size > lastCheckedSize) {
            this.readNewLogs(stats.size);
            lastCheckedSize = stats.size;
          } else if (stats.size < lastCheckedSize) {
            // File got rotated or truncated
            logger.info('[SuricataWatcher] Detection of eve.json log truncation/rotation. Resetting index offset.');
            this.currentOffset = 0;
            lastCheckedSize = stats.size;
          }
        } catch (e) {
          // File temporarily unavailable or locked during write
        }
      };

      // Poll every 500ms to guarantee ultra-low-latency real-time ingestion
      setInterval(checkFileUpdate, 500);

      // Bind node FS watcher as secondary high-frequency trigger
      this.watcher = fs.watch(this.logPath, (eventType) => {
        if (eventType === 'change') {
          checkFileUpdate();
        }
      });
    } catch (err) {
      logger.warn('[SuricataWatcher] Local file system watch API blocked. Falling back to millisecond polling loops.', err);
    }
  }

  /**
   * Reads incremental byte blocks from eve.json and splits them into lines
   */
  private readNewLogs(newSize: number) {
    this.isProcessing = true;
    const startByte = this.currentOffset;
    this.currentOffset = newSize;

    if (startByte >= newSize) {
      this.isProcessing = false;
      return;
    }

    try {
      const stream = fs.createReadStream(this.logPath, {
        start: startByte,
        end: newSize - 1,
        encoding: 'utf8'
      });

      let bufferChunk = '';

      stream.on('data', (chunk) => {
        bufferChunk += chunk;
        const lines = bufferChunk.split('\n');
        // Keep the last incomplete line in buffer
        bufferChunk = lines.pop() || '';

        for (const line of lines) {
          this.processLogLine(line);
        }
      });

      stream.on('end', () => {
        if (bufferChunk.trim()) {
          this.processLogLine(bufferChunk);
        }
        this.isProcessing = false;
      });

      stream.on('error', (err) => {
        logger.error('[SuricataWatcher] Log incremental read stream faulted', err);
        this.isProcessing = false;
      });
    } catch (err) {
      logger.error('[SuricataWatcher] Failed to increment eve.json read index', err);
      this.isProcessing = false;
    }
  }

  /**
   * Processes a single JSON line through parser, normalizer, and system adapters
   */
  private async processLogLine(line: string) {
    const rawParsed = SuricataParser.parseLine(line);
    if (!rawParsed) return;

    try {
      const normalized = SuricataNormalizer.normalize(rawParsed);
      await SuricataTelemetryAdapter.processEvent(normalized);
    } catch (err) {
      logger.error('[SuricataWatcher] Failed processing parsed Suricata message', {
        error: (err as Error).message,
        line: line.substring(0, 100)
      });
    }
  }

  /**
   * Background operational threat generator that appends authentic mock eve.json traces to the watched file to simulate live traffic
   */
  private startThreatSimulator() {
    const threatTypes = [
      // 1. Port scan reconnaissance
      () => ({
        timestamp: new Date().toISOString(),
        flow_id: Math.floor(Math.random() * 10000000),
        event_type: 'alert',
        src_ip: '82.102.23.4',
        src_port: Math.floor(Math.random() * 50000) + 1024,
        dest_ip: '10.45.2.14', // target pc-admin-hq
        dest_port: 80,
        proto: 'TCP',
        alert: {
          action: 'allowed',
          gid: 1,
          signature_id: 2001201,
          rev: 5,
          signature: 'ET SCAN Potential Nmap Scan detected',
          category: 'Attempted Information Leak',
          severity: 3
        }
      }),
      // 2. HTTP exploitation
      () => ({
        timestamp: new Date().toISOString(),
        flow_id: Math.floor(Math.random() * 10000000),
        event_type: 'http',
        src_ip: '82.102.23.4',
        src_port: 43210,
        dest_ip: '10.244.0.1', // target ingress
        dest_port: 80,
        proto: 'TCP',
        http: {
          hostname: 'sentinelx.enterprise.net',
          url: '/api/v1/auth/login?user=admin&payload=../../etc/passwd',
          http_user_agent: 'Mozilla/5.0 sqlmap/1.4.12',
          http_method: 'GET'
        }
      }),
      // 3. Command Injection trigger
      () => ({
        timestamp: new Date().toISOString(),
        flow_id: Math.floor(Math.random() * 10000000),
        event_type: 'alert',
        src_ip: '185.220.101.5',
        src_port: 59124,
        dest_ip: '10.244.18.52', // target k8s auth pod
        dest_port: 443,
        proto: 'TCP',
        alert: {
          action: 'allowed',
          gid: 1,
          signature_id: 2024103,
          rev: 2,
          signature: 'ET EXPLOIT Shellcode execution attempts in HTTP application payload',
          category: 'Web Application Attack',
          severity: 1
        }
      }),
      // 4. Critical Governance-sensitive breach on Secrets Vault
      () => ({
        timestamp: new Date().toISOString(),
        flow_id: Math.floor(Math.random() * 10000000),
        event_type: 'alert',
        src_ip: '185.220.101.5',
        src_port: 60233,
        dest_ip: '100.80.12.1', // target secrets vault (high sensitivity)
        dest_port: 8200,
        proto: 'TCP',
        alert: {
          action: 'allowed',
          gid: 1,
          signature_id: 2038442,
          rev: 1,
          signature: 'ET EXPLOIT Vault configuration unauthorized admin credential retrieval',
          category: 'Credential Exfiltration Violation',
          severity: 1
        }
      }),
      // 5. Tunneling exfiltration via DNS
      () => ({
        timestamp: new Date().toISOString(),
        flow_id: Math.floor(Math.random() * 10000000),
        event_type: 'dns',
        src_ip: '10.45.2.14', // infected pc-admin-hq beaconing out
        src_port: 53229,
        dest_ip: '8.8.8.8',
        dest_port: 53,
        proto: 'UDP',
        dns: {
          type: 'query',
          id: 42103,
          rrname: 'a83b27c9d10e.c2-exfil-malware.darknet.onion',
          rrtype: 'A'
        }
      }),
      // 6. Suspicious TLS Handshake 
      () => ({
        timestamp: new Date().toISOString(),
        flow_id: Math.floor(Math.random() * 10000000),
        event_type: 'tls',
        src_ip: '10.244.18.52',
        src_port: 50402,
        dest_ip: '45.18.23.90',
        dest_port: 443,
        proto: 'TCP',
        tls: {
          subject: 'CN=localhost,OU=Root,O=Untrusted CA',
          issuerdn: 'CN=SelfSignedRoot',
          serial: '992a27bc10e',
          version: 'TLSv1.3'
        }
      })
    ];

    // Every 12 seconds, append a realistic threat event log line to eve.json
    this.mockInterval = setInterval(() => {
      try {
        const index = Math.floor(Math.random() * threatTypes.length);
        const payload = threatTypes[index]();
        const jsonLine = JSON.stringify(payload) + '\n';
        
        fs.appendFileSync(this.logPath, jsonLine, 'utf8');
      } catch (err) {
        // Handle stream/write collisions silently
      }
    }, 12000);
  }
}

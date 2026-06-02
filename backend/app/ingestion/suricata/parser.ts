import { logger } from '../../core/logger';
import { SuricataPayload } from './types';

export class SuricataParser {
  private static lastAlarms: Set<string> = new Set();
  private static maxCacheSize = 200;

  /**
   * Parse a raw log line, with resilient error handling and duplicate alarm suppression
   */
  public static parseLine(line: string): SuricataPayload | null {
    if (!line || !line.trim()) {
      return null;
    }

    try {
      const parsed = JSON.parse(line.trim()) as SuricataPayload;

      if (!parsed.timestamp || !parsed.event_type) {
        logger.warn('[SuricataParser] Incomplete log event structure omitted', { line: line.substring(0, 100) });
        return null;
      }

      // If it is an alert, verify if it's a direct duplicate within our cache window
      if (parsed.event_type === 'alert' && parsed.alert) {
        const uniqueKey = `${parsed.src_ip}:${parsed.src_port}->${parsed.dest_ip}:${parsed.dest_port}|${parsed.alert.signature_id}|${parsed.timestamp}`;
        if (this.lastAlarms.has(uniqueKey)) {
          // Throttled duplicate representation
          return null;
        }

        // Cache housekeeping to prevent memory leaks
        this.lastAlarms.add(uniqueKey);
        if (this.lastAlarms.size > this.maxCacheSize) {
          const firstKey = this.lastAlarms.values().next().value;
          if (firstKey) this.lastAlarms.delete(firstKey);
        }
      }

      return parsed;
    } catch (err) {
      logger.error('[SuricataParser] Failed parsing malformed eve.json line', {
        error: (err as Error).message,
        sample: line.substring(0, 150)
      });
      return null;
    }
  }
}

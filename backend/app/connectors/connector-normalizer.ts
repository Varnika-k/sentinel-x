import { logger } from '../core/logger';

export interface NormalizedMetadataPayload {
  nodeId: string;
  name: string;
  type: string;
  recordCount: number;
  piiColumns: string[];
  lastModified: string;
  additionalMeta: Record<string, any>;
}

export class ConnectorNormalizer {
  private static instance: ConnectorNormalizer;

  private constructor() {}

  public static getInstance(): ConnectorNormalizer {
    if (!ConnectorNormalizer.instance) {
      ConnectorNormalizer.instance = new ConnectorNormalizer();
    }
    return ConnectorNormalizer.instance;
  }

  /**
   * Translates arbitrary incoming vendor schemas into standardised compliance metadata structures.
   * Eliminates raw values, retaining only secure schemas and counts.
   */
  public normalizeExternalPayload(rawPayload: Record<string, any>): NormalizedMetadataPayload {
    logger.debug('[ConnectorNormalizer] Normalizing incoming compliance event footprint...');

    // 1. Detect ID
    const nodeId = rawPayload.id || rawPayload.uuid || rawPayload._id || rawPayload.arn || `node-${Math.random().toString(36).substring(4)}`;
    
    // 2. Clear out raw sensitive objects instantly
    const clearedMeta: Record<string, any> = {};
    const sensitiveKeys = ['password', 'ssn', 'salary', 'creditcard', 'cvv', 'token', 'key', 'secret', 'balance', 'email'];

    Object.keys(rawPayload).forEach(key => {
      const lowered = key.toLowerCase();
      const isSensitive = sensitiveKeys.some(s => lowered.includes(s));
      if (!isSensitive && typeof rawPayload[key] !== 'object') {
        clearedMeta[key] = rawPayload[key];
      }
    });

    // 3. Extract Column / Schema classifications safely
    const discoveredPii: string[] = [];
    if (Array.isArray(rawPayload.columns || rawPayload.schema)) {
      const cols = rawPayload.columns || rawPayload.schema;
      cols.forEach((col: any) => {
        const colStr = typeof col === 'string' ? col : col.name;
        if (colStr) {
          const loweredCol = colStr.toLowerCase();
          const matchesPii = sensitiveKeys.some(s => loweredCol.includes(s));
          if (matchesPii) {
            discoveredPii.push(colStr.toUpperCase());
          }
        }
      });
    }

    return {
      nodeId,
      name: rawPayload.name || rawPayload.title || nodeId,
      type: rawPayload.type || rawPayload.category || 'database',
      recordCount: Number(rawPayload.recordsCount || rawPayload.rowsTotal || rawPayload.size || 0),
      piiColumns: discoveredPii,
      lastModified: rawPayload.updatedAt || rawPayload.mtime || new Date().toISOString(),
      additionalMeta: clearedMeta
    };
  }
}

export const connectorNormalizer = ConnectorNormalizer.getInstance();

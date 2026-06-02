export interface UserIdentity {
  username: string; // e.g. "admin-alpha", "analyst-dev", "corp-sync"
  email: string;
  department: 'operations' | 'engineering' | 'finance' | 'iam_root' | 'secops' | 'third_party';
  privilegeLevel: 'none' | 'low' | 'medium' | 'high' | 'root_admin';
  baseTrustScore: number; // 0 to 100
  currentTrustScore: number; // 0 to 100 (dynamic zero-trust scoring)
  riskScore: number; // 0 to 100 (realtime risk calculation)
  insiderThreatConfidence: number; // 0 to 100 (behavioral anomaly mapping)
  activeSessionsCount: number;
  lastActive: string;
  isQuarantined: boolean;
  behavioralAnomalyScore: number; // 0 to 100
  complianceViolationsCount: number;
}

export interface UserSession {
  sessionId: string;
  username: string;
  startedAt: string;
  ipAddress: string;
  userAgent: string;
  currentNodeId: string; // Dynamic trace across enterprise topology graph nodes
  tokenValidity: 'valid' | 'expired' | 'revoked' | 'hijacked_token_anomaly';
  isCompromised: boolean;
  actionSequence: Array<{
    timestamp: string;
    actionType: string;
    targetAsset: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    zeroTrustVerified: boolean;
  }>;
  correlatedSessionIds: string[]; // Cross-system session correlation (e.g., AD + Falco + CloudTrail)
}

export interface BehavioralProfile {
  username: string;
  averageSessionsPerDay: number;
  normalWorkingHours: { start: number; end: number }; // hour indices: e.g. { start: 8, end: 18 }
  authorizedSectors: string[]; // e.g. ["PERIMETER", "DATA_CORE"]
  averageBytesTransferred: number;
  highRiskActionsCount: number;
  historicalAnomalies: Array<{
    timestamp: string;
    description: string;
    severity: 'medium' | 'high' | 'critical';
  }>;
}

export interface SuspiciousMovement {
  movementId: string;
  username: string;
  sessionId: string;
  timestamp: string;
  sourceNodeId: string;
  targetNodeId: string;
  anomalyType: 'cross_security_sector' | 'time_of_day_anomaly' | 'radial_hop_anomaly' | 'rapid_propagation' | 'stealth_credential_usage';
  severity: 'low' | 'medium' | 'high' | 'critical';
  mitreTechnique: string;
}

export interface SensitiveAccessAudit {
  auditId: string;
  username: string;
  assetNodeId: string;
  timestamp: string;
  classification: 'public' | 'confidential' | 'pci' | 'hipaa' | 'root_credentials';
  accessResponse: 'allowed' | 'alerted' | 'blocked_zero_trust';
  contextualMultiplier: number; // affects threat propagation velocity
}

export interface InsiderThreatIncident {
  incidentId: string;
  username: string;
  overallConfidence: number;
  primaryIndicators: string[];
  sessionChains: string[];
  governanceEscalationLevel: 'none' | 'alert' | 'quarantine' | 'full_domain_lockdown';
  timelineReconstruction: Array<{
    timestamp: string;
    step: string;
    impact: string;
  }>;
  aiReasoningContext: string; // Text summary used by AI for explaining threat
}

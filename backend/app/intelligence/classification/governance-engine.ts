import { SensitiveDataClassifier } from './classifier';
import { GovernanceRiskScorer } from './risk-scorer';
import { ClassificationResult, SensitivityLevel, ComplianceStatus } from './types';
import { RuntimeNodeState, RuntimeEdgeState } from '../../../core/types';
import { logger } from '../../core/logger';

// Baseline content mappings to run mock audit classifications without saving raw data
const NODE_STATIC_CONTEXT_MAPS: Record<string, { filename: string; text: string }> = {
  '1':
 {  filename: 'ingress-nginx.conf',
    text: '# Nginx reverse proxy configuration\n# Bearer Token signature header routing\nallow 0.0.0.0/0;'
  },
  '2': {
    filename: 'auth-server-properties.json',
    text: '{\n  "jwt_key_id": "auth-verify-shared-hmac-key",\n  "api_token_payload": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YWU0Njg0YjMt...",\n  "secret_salt": "salt_secret_assigned_param"\n}'
  },
  '3': {
    filename: 'payment-gateway.env',
    text: 'STRIPE_SECRET_REDACTED'
  },
  '4': {
    filename: 'postgres-master-secret.yml',
    text: 'apiVersion: v1\nkind: Secret\nmetadata:\n  name: db-master-credentials\nstringData:\n  database_url: "mongodb+srv://admin_root:SuperSecr3tPassword2026@db-core-master.corp.local/production?authSource=admin"\n  backup_key_hash: "-----BEGIN RSA PRIVATE KEY-----\\nMIIEowIBAAKCAQEA0YtZ...\\n-----END RSA PRIVATE KEY-----"'
  },
  '5': {
    filename: 'lambda-handler.js',
    text: 'const AWS = require("aws-sdk");\n// AWS API key found\nconst aws_key_id = "AWS_ACCESS_KEY_REDACTED";'
  },
  '6': {
    filename: 'confidential_customer_roster.csv',
    text: 'id,fullName,emailAddress,postalAddress,ssnNumber,creditCardBalance\n1001,John Doe,johndoe@gmail.com,"721 Broadway Ave, New York",411-22-3904,4532110098432299\n1002,Jane Smith,janesmith@yahoo.com,"41 Sunset Blvd, Los Angeles",520-11-2908,5211990422310087'
  },
  '7': {
    filename: 'administrator_ssh_key.pem',
    text: '-----REDACTED_PRIVATE_KEY_SAMPLE-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDE6o... \n-----REDACTED_PRIVATE_KEY_SAMPLE-----'
  },
  '8': {
    filename: 'iam_root_token_assignment.sh',
    text: 'export AWS_ACCESS_KEY_ID="AKIA99823ASD88F782"\nexport AWS_SECRET_ACCESS_KEY="AWS_SECRET_REDACTED"'
  },
  '9': {
    filename: 'azure-ad-sync-credentials.env',
    text: 'AZURE_ACTIVE_DIRECTORY_URI="ldap://corp-active-directory.ad.net"\nAD_SYNC_SERVICE_ACCOUNT="CN=SyncAgent,OU=ServiceAccounts,DC=corp,DC=net"\nAD_SYNC_PASSWORD="SimpleDomainPassword123!"'
  },
  '10': {
    filename: 'alice_admin_secrets.txt',
    text: 'User alice session payload:\nID token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YWxpY2VfYWRtaW5fc2VjcmV0...\nPrivilege: sysadmin\nSSN: 411-22-9098'
  },
  '11': {
    filename: 'finance_ledger_v2.csv',
    text: 'dept-finance revenue details:\nemail: accounting-finance@corp-ledger.com\npayment_token: xkey-49938b82\nbalance: $14,290,098'
  },
  '12': {
    filename: 'vault_configuration.yml',
    text: '# HashiCorp Vault baseline credential registry\nmaster_passphrase: "vault-supersecret-2026-master-key!"\nadmin_ssh_key: "-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA0YtZ...\\n-----END RSA PRIVATE KEY-----"'
  },
  '13': {
    filename: 'api_gateway_internal.conf',
    text: 'internal routing configs:\ntarget_server: ldap://corp-active-directory.ad.net\napi_key: key-internal-gateway-jwt-trust'
  }
};

export class EnterpriseGovernanceEngine {
  private static instance: EnterpriseGovernanceEngine;

  private constructor() {}

  public static getInstance(): EnterpriseGovernanceEngine {
    if (!EnterpriseGovernanceEngine.instance) {
      EnterpriseGovernanceEngine.instance = new EnterpriseGovernanceEngine();
    }
    return EnterpriseGovernanceEngine.instance;
  }

  /**
   * Evaluates the entire current graph, projecting privacy-friendly sensitive properties onto nodes
   */
  public auditGraphTopology(nodes: RuntimeNodeState[], edges: RuntimeEdgeState[]): RuntimeNodeState[] {
    const auditedNodes = nodes.map(node => {
      // Find or invent class context for this node
      const staticContext = NODE_STATIC_CONTEXT_MAPS[node.id] || {
        filename: `${node.name}-config.json`,
        text: `// General info for node ${node.name}\nstatus=healthy\n`
      };

      // 1. Run local classifier
      const classification = SensitiveDataClassifier.classify(staticContext.text, staticContext.filename);

      // Extract abnormal scores if they exist on the target state, or initialize them based on status
      const abAccessScore = (node as any).abnormalAccessScore !== undefined 
        ? (node as any).abnormalAccessScore 
        : (node.status === 'compromised' ? 75 : node.status === 'warning' ? 30 : 0);

      // 2. Adjust with dynamic indicators (status, abnormal activity)
      const cumulativeGovRisk = GovernanceRiskScorer.computeCumulativeGovernanceRisk(
        classification.governanceRisk,
        node.status,
        abAccessScore
      );

      // Re-map compliance status if risk shot up due to live hack status
      let finalComplianceStatus = classification.complianceStatus;
      if (cumulativeGovRisk >= 75) {
        finalComplianceStatus = 'non-compliant';
      } else if (cumulativeGovRisk >= 40 && finalComplianceStatus === 'compliant') {
        finalComplianceStatus = 'warning';
      }

      // Re-map sensitivity
      let finalSensitivity = classification.sensitivityLevel;
      if (node.operationalCriticality >= 90) {
        // High criticality items carry elevated corporate classification
        if (finalSensitivity === 'low') finalSensitivity = 'medium';
        if (finalSensitivity === 'medium') finalSensitivity = 'high';
      }

      // 3. Compute structural network trust Level
      const computedTrust = GovernanceRiskScorer.calculateNodeTrust(
        node.status,
        cumulativeGovRisk,
        finalComplianceStatus
      );

      // Assign enhanced variables to the node
      const modifiedNode = {
        ...node,
        // Override standard properties with governance scores
        vulnerability: Math.max(node.vulnerability || 0.1, cumulativeGovRisk / 100),
        trustScore: computedTrust,

        // New properties
        sensitivityLevel: finalSensitivity,
        governanceRisk: cumulativeGovRisk,
        containsSecrets: classification.containsSecrets,
        piiRisk: classification.piiRisk,
        abnormalAccessScore: abAccessScore,
        complianceStatus: finalComplianceStatus,
        classificationSummary: classification.classificationSummary,
        trustLevel: computedTrust, // alias requested
        metadata: {
          ...(node as any).metadata,
          secretsFound: classification.secretsFound,
          piiFound: classification.piiFound,
          matches: classification.matches
        }
      } as RuntimeNodeState;

      return modifiedNode;
    });

    // 4. Second recursion to compute neighbors & exposure scores based on lateral trust dependencies
    const fullyAuditedNodes = auditedNodes.map(node => {
      const computedExposure = GovernanceRiskScorer.calculateExposure(node, auditedNodes, edges);
      return {
        ...node,
        exposureScore: computedExposure
      };
    });

    return fullyAuditedNodes;
  }
}

export const enterpriseGovernanceEngine = EnterpriseGovernanceEngine.getInstance();

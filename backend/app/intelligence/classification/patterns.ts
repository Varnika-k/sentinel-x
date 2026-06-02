export interface RegexPattern {
  name: string;
  category: 'secret' | 'pii' | 'financial' | 'legal';
  regex: RegExp;
  description: string;
}

export const GOVERNANCE_RE_PATTERNS: RegexPattern[] = [
  // 1. Secrets & Credentials Detection
  {
    name: 'PRIVATE_KEY',
    category: 'secret',
    regex: /-----BEGIN[ A-Z0-9-_]+PRIVATE KEY-----/i,
    description: 'Cryptographic private key file header'
  },
  {
    name: 'AWS_API_KEY',
    category: 'secret',
    regex: /\b(AKIA[0-9A-Z]{16})\b/g,
    description: 'Amazon Web Services Access Key ID'
  },
  {
    name: 'GENERIC_API_KEY',
    category: 'secret',
    regex: /\b(api_key|apikey|secret_key|api_secret)\s*[:=]\s*['"a-zA-Z0-9_\-\+]{16,64}['"a-zA-Z0-9_\-\+]/i,
    description: 'Key/Value pattern for API keys and secrets'
  },
  {
    name: 'DB_PASSWORD_URI',
    category: 'secret',
    regex: /\bmongodb(?:\+srv)?:\/\/[a-zA-Z0-9_.-]+:[a-zA-Z0-9_.-]+@/i,
    description: 'Database connection URI containing inline password'
  },
  {
    name: 'PASSWORD_ASSIGNMENT',
    category: 'secret',
    regex: /\b(password|passwd|pass|pwd|credential)\s*=\s*['"][^'"]{6,40}['"]/i,
    description: 'Explicit password variable assignments'
  },
  {
    name: 'BEARER_JWT_TOKEN',
    category: 'secret',
    regex: /\beyJ[A-Za-z0-9-_=]+\.eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_~%'.*_+\/=]+\b/g,
    description: 'JSON Web Token (JWT) signature structure'
  },

  // 2. Personally Identifiable Information (PII)
  {
    name: 'EMAIL_ADDRESS',
    category: 'pii',
    regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    description: 'RFC 5322 compliant email address pattern'
  },
  {
    name: 'SOCIAL_SECURITY_NUMBER',
    category: 'pii',
    regex: /\b\d{3}-\d{2}-\d{4}\b/g,
    description: 'US Social Security Number format'
  },
  {
    name: 'TELEPHONE_NUMBER',
    category: 'pii',
    regex: /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    description: 'E.164-like standard telephone number'
  },

  // 3. Financial & Legal Information
  {
    name: 'CREDIT_CARD_PAN',
    category: 'financial',
    regex: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g,
    description: 'Major credit card network primary account number'
  },
  {
    name: 'IBAN_CODE',
    category: 'financial',
    regex: /\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g,
    description: 'International Bank Account Number'
  },
  {
    name: 'LEGAL_CLASSIFICATION',
    category: 'legal',
    regex: /\b(nda|non-disclosure|confidentiality agreement|confidential|proprietary|restricted|trade secret)\b/i,
    description: 'NDA or legal corporate classification indicator'
  }
];

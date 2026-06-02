/**
 * Calculates the Shannon Entropy of a given string.
 * High Shannon entropy indicates high randomness (typical for API keys, hashes, and private tokens).
 */
export function calculateShannonEntropy(str: string): number {
  if (!str) return 0;
  
  const len = str.length;
  const frequencies: Record<string, number> = {};
  
  for (let i = 0; i < len; i++) {
    const char = str[i];
    frequencies[char] = (frequencies[char] || 0) + 1;
  }
  
  let entropy = 0;
  for (const char in frequencies) {
    const p = frequencies[char] / len;
    entropy -= p * Math.log2(p);
  }
  
  return parseFloat(entropy.toFixed(3));
}

/**
 * Parses a textual payload into distinct candidate sub-tokens (e.g., alphanumeric strings)
 * and evaluates if any of them possess extremely high entropy suggestive of raw secrets/keys.
 */
export interface EntropyCandidate {
  tokenType: string;
  entropy: number;
}

export function scanHighEntropyTokens(text: string, minLength = 16): EntropyCandidate[] {
  if (!text || text.length < minLength) return [];

  // Match sequences of characters common in API keys/Hashes: alphanumeric plus certain characters like -_=/+
  const candidatesPattern = /[A-Za-z0-9_\-=\/\+]{16,128}/g;
  const matches = text.match(candidatesPattern) || [];
  
  const results: EntropyCandidate[] = [];
  const processed = new Set<string>();

  for (const match of matches) {
    if (processed.has(match)) continue;
    processed.add(match);

    const entropy = calculateShannonEntropy(match);
    
    // Alphanumeric keys usually have entropy > 4.2 for Base16, and > 4.8 for Base64
    // High probability threshold is usually 4.5+ for a standard 16+ char secret key
    if (entropy > 4.5) {
      results.push({
        tokenType: 'HIGH_ENTROPY_TOKEN_CANDIDATE',
        entropy
      });
    }
  }

  return results;
}

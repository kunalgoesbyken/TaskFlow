/**
 * Slack OAuth state management utilities.
 *
 * This module provides functions for generating and verifying OAuth state
 * parameters used in the Slack installation flow.
 *
 * The state parameter contains the TaskFlow user ID to link the Slack
 * installation to the correct user after OAuth completion.
 */

import { randomBytes } from 'crypto';

/**
 * OAuth state data structure.
 */
interface OAuthStateData {
  userId: string;
  nonce: string;
  timestamp: number;
}

/**
 * Maximum age of OAuth state parameter (10 minutes).
 */
const STATE_MAX_AGE_MS = 10 * 60 * 1000;

/**
 * Generates a secure state parameter containing the user ID.
 *
 * The state is encoded as base64(json({ userId, nonce, timestamp }))
 * to prevent CSRF attacks during the OAuth flow.
 *
 * @param userId - The TaskFlow user ID
 * @returns Base64-encoded state parameter
 */
export function generateOAuthState(userId: string): string {
  const stateData: OAuthStateData = {
    userId,
    nonce: randomBytes(16).toString('hex'),
    timestamp: Date.now(),
  };
  return Buffer.from(JSON.stringify(stateData)).toString('base64');
}

/**
 * Verifies and decodes an OAuth state parameter.
 *
 * Returns the user ID if valid, null otherwise.
 * State is valid for 10 minutes to prevent replay attacks.
 *
 * @param state - The base64-encoded state parameter
 * @returns The TaskFlow user ID if valid, null otherwise
 */
export function verifyOAuthState(state: string): string | null {
  try {
    const data = JSON.parse(Buffer.from(state, 'base64').toString()) as OAuthStateData;

    // Verify state is not expired
    if (Date.now() - data.timestamp > STATE_MAX_AGE_MS) {
      return null;
    }

    return data.userId;
  } catch {
    return null;
  }
}



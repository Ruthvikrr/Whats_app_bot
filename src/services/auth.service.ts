import crypto from 'crypto';
import { env } from '../config/env.js';

export interface UserSession {
  userId: number;
  email: string;
  role: 'admin' | 'client';
  businessId: string | null;
  name: string;
  expiresAt: number;
}

export class AuthService {
  /**
   * Hashes a password using PBKDF2 with a random salt.
   */
  public static hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  /**
   * Verifies a password against the stored salt:hash string using constant-time comparison.
   */
  public static verifyPassword(password: string, storedHash: string): boolean {
    const parts = storedHash.split(':');
    if (parts.length !== 2) return false;
    const [salt, originalHash] = parts;
    if (!salt || !originalHash) return false;
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    
    try {
      const origBuf = Buffer.from(originalHash, 'hex');
      const hashBuf = Buffer.from(hash, 'hex');
      if (origBuf.length !== hashBuf.length) return false;
      return crypto.timingSafeEqual(origBuf, hashBuf);
    } catch {
      return false;
    }
  }

  /**
   * Creates a signed session token using HMAC-SHA256.
   */
  public static createSessionToken(session: Omit<UserSession, 'expiresAt'>, durationHours = 24): string {
    const expiresAt = Date.now() + durationHours * 3600 * 1000;
    const payload: UserSession = { ...session, expiresAt };
    const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', env.SESSION_SECRET)
      .update(payloadStr)
      .digest('base64url');
    return `${payloadStr}.${signature}`;
  }

  /**
   * Validates and unpacks a signed session token.
   */
  public static verifySessionToken(token: string): UserSession | null {
    if (!token || !token.includes('.')) return null;
    const [payloadStr, signature] = token.split('.');
    if (!payloadStr || !signature) return null;

    const expectedSig = crypto
      .createHmac('sha256', env.SESSION_SECRET)
      .update(payloadStr)
      .digest('base64url');

    try {
      const sigBuf = Buffer.from(signature);
      const expBuf = Buffer.from(expectedSig);
      if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
        return null;
      }

      const decoded = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf8')) as UserSession;
      if (Date.now() > decoded.expiresAt) {
        return null; // Expired
      }
      return decoded;
    } catch {
      return null;
    }
  }

  /**
   * Parses cookies from raw HTTP Cookie header.
   */
  public static parseCookies(cookieHeader?: string): Record<string, string> {
    const list: Record<string, string> = {};
    if (!cookieHeader) return list;
    cookieHeader.split(';').forEach((cookie) => {
      const parts = cookie.split('=');
      const name = parts[0]?.trim();
      const val = parts.slice(1).join('=').trim();
      if (name && val !== undefined) {
        list[name] = decodeURIComponent(val);
      }
    });
    return list;
  }
}

import crypto from 'crypto';
import { env } from '../config/env.js';
export class AuthService {
    /**
     * Hashes a password using PBKDF2 with a random salt.
     */
    static hashPassword(password) {
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
        return `${salt}:${hash}`;
    }
    /**
     * Verifies a password against the stored salt:hash string using constant-time comparison.
     */
    static verifyPassword(password, storedHash) {
        const parts = storedHash.split(':');
        if (parts.length !== 2)
            return false;
        const [salt, originalHash] = parts;
        if (!salt || !originalHash)
            return false;
        const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
        try {
            const origBuf = Buffer.from(originalHash, 'hex');
            const hashBuf = Buffer.from(hash, 'hex');
            if (origBuf.length !== hashBuf.length)
                return false;
            return crypto.timingSafeEqual(origBuf, hashBuf);
        }
        catch {
            return false;
        }
    }
    /**
     * Creates a signed session token using HMAC-SHA256.
     */
    static createSessionToken(session, durationHours = 24) {
        const expiresAt = Date.now() + durationHours * 3600 * 1000;
        const payload = { ...session, expiresAt };
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
    static verifySessionToken(token) {
        if (!token || !token.includes('.'))
            return null;
        const [payloadStr, signature] = token.split('.');
        if (!payloadStr || !signature)
            return null;
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
            const decoded = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf8'));
            if (Date.now() > decoded.expiresAt) {
                return null; // Expired
            }
            return decoded;
        }
        catch {
            return null;
        }
    }
    /**
     * Parses cookies from raw HTTP Cookie header.
     */
    static parseCookies(cookieHeader) {
        const list = {};
        if (!cookieHeader)
            return list;
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

import crypto from 'crypto';

const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || 'aptis_master_enterprise_secure_key_2026_dhp';
const COOKIE_NAME = 'aptis_admin_session';

/**
 * Valida a senha master do administrador no servidor
 */
export function validateAdminPassword(password: string): boolean {
  if (!password) return false;
  // Senha master configurável via env ou default forte
  const validSecret = process.env.ADMIN_MASTER_PASSWORD || 'aptis2026';
  // Timing safe comparison para evitar ataques de temporização
  const bufA = Buffer.from(password);
  const bufB = Buffer.from(validSecret);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Cria um token de sessão assinado com HMAC-SHA256 e timestamp de expiração
 */
export function createAdminToken(expiresInHours = 12): string {
  const expiresAt = Date.now() + expiresInHours * 60 * 60 * 1000;
  const payload = `admin:${expiresAt}`;
  const signature = crypto
    .createHmac('sha256', ADMIN_SECRET)
    .update(payload)
    .digest('hex');
  return `${payload}.${signature}`;
}

/**
 * Valida o token e sua assinatura criptográfica
 */
export function verifyAdminToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payload, signature] = parts;
  const [role, expiresAtStr] = payload.split(':');
  
  if (role !== 'admin') return false;
  const expiresAt = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAt) || Date.now() > expiresAt) return false;

  const expectedSignature = crypto
    .createHmac('sha256', ADMIN_SECRET)
    .update(payload)
    .digest('hex');

  const bufExpected = Buffer.from(expectedSignature);
  const bufActual = Buffer.from(signature);
  if (bufExpected.length !== bufActual.length) return false;
  return crypto.timingSafeEqual(bufExpected, bufActual);
}

export { COOKIE_NAME };

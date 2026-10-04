import crypto from 'crypto';
import { User } from '@/types';
import { INITIAL_USERS } from '@/lib/mock-data';

const AUTH_SECRET = process.env.AUTH_SECRET_KEY || 'aptis_enterprise_auth_secret_key_2026_jwt_fallback';
export const USER_COOKIE_NAME = 'aptis_user_session';

// Dicionário de senhas padrão para os usuários iniciais corporativos
// Em produção, as senhas ficam hasheadas no banco Supabase
const USER_PASSWORDS: Record<string, string> = {
  'carlos.silveira@alfa.ind.br': 'alfa123',
  'mariana.souza@alfa.ind.br': 'alfa123',
  'admin@ecossistemalider.com.br': 'aptis2026',
  'diretoria@betalog.com.br': 'beta123',
  'contato@gamaservicos.com': 'gama123'
};

export interface AuthSessionPayload {
  userId: string;
  name: string;
  email: string;
  role: User['role'];
  tenantId: string;
  department?: string;
  expiresAt: number;
}

/**
 * Valida credenciais de e-mail e senha
 */
export function validateUserCredentials(email: string, password: string): User | null {
  const normalizedEmail = email.trim().toLowerCase();
  
  // 1. Procura na lista de usuários cadastrados
  const user = INITIAL_USERS.find(u => u.email.toLowerCase() === normalizedEmail);
  if (!user) return null;

  const validPassword = USER_PASSWORDS[normalizedEmail] || 'aptis123';
  if (password !== validPassword) {
    return null;
  }

  return user;
}

/**
 * Cria token de sessão assinado com HMAC-SHA256
 */
export function createUserSessionToken(user: User, expiresInDays = 7): string {
  const expiresAt = Date.now() + expiresInDays * 24 * 60 * 60 * 1000;
  
  const payload: AuthSessionPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
    department: user.department,
    expiresAt
  };

  const jsonBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(jsonBase64)
    .digest('base64url');

  return `${jsonBase64}.${signature}`;
}

/**
 * Verifica e decodifica o token de sessão do usuário
 */
export function verifyUserSessionToken(token: string | undefined | null): AuthSessionPayload | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [jsonBase64, signature] = parts;

  const expectedSignature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(jsonBase64)
    .digest('base64url');

  const bufExpected = Buffer.from(expectedSignature);
  const bufActual = Buffer.from(signature);
  if (bufExpected.length !== bufActual.length || !crypto.timingSafeEqual(bufExpected, bufActual)) {
    return null;
  }

  try {
    const payload: AuthSessionPayload = JSON.parse(
      Buffer.from(jsonBase64, 'base64url').toString('utf8')
    );

    if (Date.now() > payload.expiresAt) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

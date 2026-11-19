import crypto from 'crypto';
import { AreaManagerAccount, User } from '@/types';
import { INITIAL_USERS } from '@/lib/mock-data';
import { supabase } from '@/lib/supabase';

const AUTH_SECRET = process.env.AUTH_SECRET_KEY || 'aptis_enterprise_auth_secret_key_2026_jwt_fallback';
export const USER_COOKIE_NAME = 'aptis_user_session';

// Dicionário de senhas padrão para os usuários iniciais corporativos
// Em produção, as senhas ficam hasheadas no banco Supabase
const USER_PASSWORDS: Record<string, string> = {
  'admin@ecossistemalider.com.br': 'aptis2026',
  'admin@aptis.com.br': 'aptis2026',
  'treinador@aptis.com.br': 'drz2026',
  'gestao@dhp.ind.br': 'dhp123',
  'supervisor@dhp.ind.br': 'dhp123',
  'lucas.pinho@manumanutencao.com.br': 'manu2026'
};

export interface AuthSessionPayload {
  userId: string;
  name: string;
  email: string;
  role: User['role'];
  tenantId: string;
  department?: string;
  allowedSectorIds?: string[];
  expiresAt: number;
}

/**
 * Valida credenciais de e-mail e senha (usuários estáticos e gestores dinâmicos cadastrados no Supabase)
 */
export async function validateUserCredentials(email: string, password: string): Promise<User | null> {
  const normalizedEmail = email.trim().toLowerCase();
  
  // 1. Procura na lista de usuários iniciais cadastrados em código
  const staticUser = INITIAL_USERS.find(u => u.email.toLowerCase() === normalizedEmail);
  if (staticUser) {
    const validPassword = USER_PASSWORDS[normalizedEmail] || 'aptis123';
    if (password !== validPassword) {
      return null;
    }
    return staticUser;
  }

  // 2. Procura nos Gestores de Área cadastrados dinamicamente por cada empresa no Supabase
  try {
    const { data, error } = await supabase
      .from('tenant_tool_data')
      .select('tenant_id, data')
      .eq('tool_id', 'plant-core')
      .eq('data_key', 'area_managers');

    if (!error && Array.isArray(data)) {
      for (const row of data) {
        const managers = Array.isArray(row.data) ? (row.data as AreaManagerAccount[]) : [];
        const matched = managers.find(
          m =>
            m &&
            m.isActive !== false &&
            typeof m.email === 'string' &&
            m.email.trim().toLowerCase() === normalizedEmail &&
            m.password === password
        );

        if (matched) {
          return {
            id: matched.id,
            tenantId: matched.tenantId || row.tenant_id,
            name: matched.name,
            email: matched.email,
            role: matched.role || 'sector_manager',
            department: matched.jobTitle || 'Gestão de Área Fabril',
            allowedSectorIds: Array.isArray(matched.allowedSectorIds) ? matched.allowedSectorIds : []
          };
        }
      }
    }
  } catch (err) {
    console.warn('Falha ao consultar gestores dinâmicos no Supabase:', err);
  }

  return null;
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
    allowedSectorIds: user.allowedSectorIds,
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

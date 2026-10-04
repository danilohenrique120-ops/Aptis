import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Proteção de rotas do Dashboard (/dashboard): Redireciona para /login se não houver sessão ativa
  const userSession = request.cookies.get('aptis_user_session')?.value;

  if (pathname.startsWith('/dashboard')) {
    if (!userSession) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Se já estiver autenticado e acessar /login, redireciona diretamente para o /dashboard
  if (pathname === '/login') {
    if (userSession) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 3. Proteção de rotas internas de API de administração
  if (pathname.startsWith('/api/admin/') && !pathname.startsWith('/api/admin/login') && !pathname.startsWith('/api/admin/verify')) {
    const adminSession = request.cookies.get('aptis_admin_session')?.value;
    if (!adminSession) {
      return NextResponse.json(
        { success: false, error: 'Acesso não autorizado ao endpoint de controle.' },
        { status: 401 }
      );
    }
  }

  const response = NextResponse.next();

  // 4. Headers globais de segurança (OWASP)
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 1. Headers globais de segurança (OWASP recomendations)
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // 2. Proteção de rotas internas de API de administração
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith('/api/admin/') && !pathname.startsWith('/api/admin/login') && !pathname.startsWith('/api/admin/verify')) {
    const sessionCookie = request.cookies.get('aptis_admin_session')?.value;
    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: 'Acesso não autorizado ao endpoint de controle.' },
        { status: 401 }
      );
    }
  }

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

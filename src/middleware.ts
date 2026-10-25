import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 0. Neutralizador automático de Service Workers / Cache de outros projetos (ex: Cadence / Vite PWA na porta 3000)
  if (
    pathname === '/sw.js' ||
    pathname === '/service-worker.js' ||
    pathname === '/dev-sw.js' ||
    pathname === '/workbox-sw.js'
  ) {
    const swKillScript = `
      self.addEventListener('install', () => self.skipWaiting());
      self.addEventListener('activate', async () => {
        try {
          if (typeof caches !== 'undefined') {
            const keys = await caches.keys();
            await Promise.all(keys.map(k => caches.delete(k)));
          }
          await self.registration.unregister();
          const clientList = await self.clients.matchAll({ type: 'window' });
          for (const client of clientList) {
            client.navigate(client.url);
          }
        } catch (e) {}
      });
    `;
    return new NextResponse(swKillScript, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  }

  if (
    pathname === '/src/main.tsx' ||
    pathname === '/@vite/client' ||
    pathname === '/@react-refresh' ||
    pathname === '/registerSW.js'
  ) {
    const clientHealScript = `
      (async function() {
        try {
          if ('serviceWorker' in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            for (const reg of regs) {
              await reg.unregister();
            }
          }
          if ('caches' in window) {
            const keys = await caches.keys();
            for (const k of keys) {
              await caches.delete(k);
            }
          }
        } catch (e) {}
        if (!window.__aptisSwCleared) {
          window.__aptisSwCleared = true;
          window.location.reload();
        }
      })();
    `;
    return new NextResponse(clientHealScript, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  }

  // 1. Proteção de rotas do Dashboard (/dashboard): Redireciona para /login se não houver sessão ativa
  const userSession = request.cookies.get('aptis_user_session')?.value;

  // 1A. Proteção exclusiva do Painel Fitness (/performance/painel): Redireciona para /performance/login
  if (pathname.startsWith('/performance/painel')) {
    if (!userSession) {
      const perfLoginUrl = new URL('/performance/login', request.url);
      perfLoginUrl.searchParams.set('redirect', pathname + request.nextUrl.search);
      return NextResponse.redirect(perfLoginUrl);
    }
  }

  // 1B. Se já estiver autenticado e acessar /performance/login, vai direto para /performance/painel
  if (pathname === '/performance/login') {
    if (userSession) {
      return NextResponse.redirect(new URL('/performance/painel', request.url));
    }
  }

  // 1. Proteção de rotas do Dashboard Industrial (/dashboard): Redireciona para /login se não houver sessão ativa
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

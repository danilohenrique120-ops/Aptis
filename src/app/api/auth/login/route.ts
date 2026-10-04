import { NextResponse } from 'next/server';
import { validateUserCredentials, createUserSessionToken, USER_COOKIE_NAME } from '@/lib/user-auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'E-mail e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    const user = validateUserCredentials(email, password);
    if (!user) {
      // Delay anti-brute force
      await new Promise(resolve => setTimeout(resolve, 400));
      return NextResponse.json(
        { success: false, error: 'E-mail ou senha incorretos.' },
        { status: 401 }
      );
    }

    const token = createUserSessionToken(user, 7); // 7 dias de sessão

    const response = NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        department: user.department
      }
    });

    response.cookies.set({
      name: USER_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60
    });

    return response;
  } catch (error) {
    console.error('Erro na API de login:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno ao processar login.' },
      { status: 500 }
    );
  }
}

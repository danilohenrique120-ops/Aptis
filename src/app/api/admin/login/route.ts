import { NextResponse } from 'next/server';
import { validateAdminPassword, createAdminToken, COOKIE_NAME } from '@/lib/admin-auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Senha não informada.' },
        { status: 400 }
      );
    }

    const isValid = validateAdminPassword(password);
    if (!isValid) {
      // Pequeno delay para mitigar brute force
      await new Promise(resolve => setTimeout(resolve, 500));
      return NextResponse.json(
        { success: false, error: 'Senha Master incorreta. Acesso restrito à diretoria Aptis.' },
        { status: 401 }
      );
    }

    const token = createAdminToken(12); // 12 horas

    const response = NextResponse.json({
      success: true,
      message: 'Autenticado com sucesso.'
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 12 * 60 * 60
    });

    return response;
  } catch (error) {
    console.error('Erro na API de login admin:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno de autenticação.' },
      { status: 500 }
    );
  }
}

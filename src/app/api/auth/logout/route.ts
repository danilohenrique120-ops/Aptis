import { NextResponse } from 'next/server';
import { USER_COOKIE_NAME } from '@/lib/user-auth';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Sessão encerrada com sucesso.'
  });

  response.cookies.set({
    name: USER_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });

  return response;
}

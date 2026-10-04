import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyUserSessionToken, USER_COOKIE_NAME } from '@/lib/user-auth';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(USER_COOKIE_NAME)?.value;

  const session = verifyUserSessionToken(token);

  if (!session) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.userId,
      name: session.name,
      email: session.email,
      role: session.role,
      tenantId: session.tenantId,
      department: session.department
    }
  });
}

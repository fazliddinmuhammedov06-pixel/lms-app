import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

  // Автоматическое определение имени куки для NextAuth v5 (authjs.session-token / __Secure-authjs.session-token)
  // и NextAuth v4 (next-auth.session-token / __Secure-next-auth.session-token)
  const cookieName =
    req.cookies.get('__Secure-authjs.session-token')?.value
      ? '__Secure-authjs.session-token'
      : req.cookies.get('authjs.session-token')?.value
      ? 'authjs.session-token'
      : req.cookies.get('__Secure-next-auth.session-token')?.value
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token';

  let token = await getToken({
    req,
    secret,
    cookieName,
    salt: cookieName,
  });

  // Запасной поиск токена дефолтным getToken, если указанный выше salt/cookieName не сработал
  if (!token) {
    token = await getToken({
      req,
      secret,
    });
  }

  const protectedPrefixes = ['/director', '/manager', '/teacher', '/student', '/parent'];
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));

  if (isProtected && !token) {
    const loginUrl = new URL('/', req.url);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === '/' && token) {
    const userRole = (token.role as string) ?? 'PARENT';
    let targetRoute = '/student';
    if (userRole === 'DIRECTOR') targetRoute = '/director';
    else if (userRole === 'MANAGER') targetRoute = '/manager';
    else if (userRole === 'TEACHER') targetRoute = '/teacher';
    else if (userRole === 'STUDENT') targetRoute = '/student';
    else if (userRole === 'PARENT') targetRoute = '/parent';

    return NextResponse.redirect(new URL(targetRoute, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

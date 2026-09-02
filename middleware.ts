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

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });

  const protectedPrefixes = ['/director', '/manager', '/teacher', '/student', '/parent'];
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));

  if (isProtected && !token) {
    const loginUrl = new URL('/', req.url);
    return NextResponse.redirect(loginUrl);
  }

  if ((pathname === '/' || pathname === '/register') && token) {
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

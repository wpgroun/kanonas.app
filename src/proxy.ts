import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET || 'super_secret_church_os_jwt_key_2026_dev_mode';
const key = new TextEncoder().encode(secretKey);

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ελεύθερα μονοπάτια (public routes)
  if (
    pathname.startsWith('/login') || 
    pathname.startsWith('/api/calendar') || 
    pathname.startsWith('/api/vault') || 
    pathname.startsWith('/widget') || 
    pathname === '/' ||
    pathname.startsWith('/_next') ||
    pathname.includes('.png') ||
    pathname.includes('.jpg') ||
    pathname.includes('.svg')
  ) {
    return NextResponse.next();
  }

  // Προστατευμένα paths
  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get('Kanonas_auth')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    try {
      // Validate JWT
      const { payload } = await jwtVerify(token, key, {
        algorithms: ['HS256'],
      });

      // Pass user info to headers if needed downstream API
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-user-id', payload.userId as string);
      requestHeaders.set('x-temple-id', payload.templeId as string);
      requestHeaders.set('x-user-role', encodeURIComponent((payload.roleName as string) || ''));

      if (pathname.startsWith('/admin/metropolis') && !payload.isSuperAdmin) {
        // Only super admin can access metropolis 
        return NextResponse.redirect(new URL('/admin', req.url));
      }

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

    } catch (err) {
      console.error('JWT Verification failed', err);
      // Αν λήξει ή είναι λάθος το JWT, πέτα τον στο Login
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Check if path is an api route or login page
    const isApiRoute = path.startsWith('/api/');
    const isLoginRoute = path === '/login';

    if (isApiRoute) {
      return NextResponse.next();
    }

    if (!token && !isLoginRoute) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    if (token) {
      if (isLoginRoute) {
        return NextResponse.redirect(new URL('/', req.url));
      }

      if (!token.isOnboarded && path !== '/onboarding') {
        return NextResponse.redirect(new URL('/onboarding', req.url));
      }

      if (token.isOnboarded && path === '/onboarding') {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // We handle authorization logic inside the middleware function
    },
  }
);

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)'],
};

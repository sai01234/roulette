import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { SessionData } from './lib/types';
import { sessionOptions } from './lib/auth';

// 保護されたルート
const protectedRoutes = ['/dashboard', '/tournament'];

// 公開ルート
const publicRoutes = ['/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // セッション取得
  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(
    request,
    response,
    sessionOptions
  );

  const isAuthenticated = session.isLoggedIn === true;

  // 保護されたルートへのアクセス
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !isAuthenticated) {
    // 未認証の場合、ログインページにリダイレクト
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ログインページへの認証済みアクセス
  if (pathname === '/login' && isAuthenticated) {
    // 既にログイン済みの場合、ダッシュボードにリダイレクト
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

// ミドルウェアを適用するパスを指定
export const config = {
  matcher: [
    /*
     * 以下を除く全てのパスにマッチ:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};

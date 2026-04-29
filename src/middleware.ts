import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 允許存取登入頁面與靜態資源
  if (
    pathname === '/login' ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/api/v1') // 如果有外部 API 需求可先放行
  ) {
    return NextResponse.next();
  }

  // 檢查是否已登入 (檢查 Cookie)
  const isAuthenticated = request.cookies.has('agi_hub_session');

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

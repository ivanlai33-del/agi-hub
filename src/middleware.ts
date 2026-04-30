import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('agi_hub_session')?.value;
  const { pathname } = request.nextUrl;

  // 1. 公開路徑 (登入頁面、API 認證路徑、診斷路徑)
  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth/login') || pathname === '/api/v1/navigate/debug') {
    return NextResponse.next();
  }

  // 2. 檢查是否有工作階段
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. 權限檢查 (解析 session cookie: userId:role 的 base64)
  try {
    const decoded = Buffer.from(session, 'base64').toString('utf8');
    const [userId, role] = decoded.split(':');

    // 只有管理員可以進入 Registry
    if (pathname.startsWith('/registry') && role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // 子帳號不能進入 API 的大腦管理功能
    if (pathname.startsWith('/api/v1/brains') && request.method !== 'GET' && role !== 'admin') {
      return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
    }

  } catch (e) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// 設定中繼軟體作用的路徑
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.jpeg|.*\\.png).*)'],
};

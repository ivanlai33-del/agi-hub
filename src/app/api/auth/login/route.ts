import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 預設密碼表 (之後可移至 .env)
const PASSWORDS: Record<string, string> = {
  'admin': '8888',
  'analyst': '1234',
};

export async function POST(req: Request) {
  try {
    const { userId, password } = await req.json();

    // 驗證密碼
    if (PASSWORDS[userId] === password) {
      // 登入成功，設定 Cookie (有效期限 7 天)
      cookies().set('agi_hub_session', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, 
        path: '/',
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

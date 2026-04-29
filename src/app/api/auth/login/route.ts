import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 設定指定的使用者憑證
const PASSWORDS: Record<string, string> = {
  'ivan': 'bb87257257',
};

export async function POST(req: Request) {
  try {
    const { userId, password } = await req.json();

    // 驗證帳號與密碼
    if (PASSWORDS[userId.toLowerCase()] === password) {
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

    return NextResponse.json({ error: '憑證錯誤' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: '伺服器異常' }, { status: 500 });
  }
}

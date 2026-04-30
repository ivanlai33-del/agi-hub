import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

// 記憶體內的嘗試紀錄 (開發環境可用，生產環境建議使用 Redis)
// 記錄格式: { ip: { attempts: number, lastAttempt: number, lockedUntil: number } }
const loginAttempts = new Map<string, { attempts: number, lastAttempt: number, lockedUntil: number }>();

const MAX_ATTEMPTS = 5; // 最大嘗試次數
const LOCKOUT_TIME = 15 * 60 * 1000; // 鎖定 15 分鐘
const FAIL_DELAY = 2000; // 失敗後強制延遲 2 秒

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();

  try {
    const { userId, password } = await req.json();
    const record = loginAttempts.get(ip) || { attempts: 0, lastAttempt: 0, lockedUntil: 0 };

    // 1. 檢查是否處於鎖定狀態
    if (record.lockedUntil > now) {
      const waitMinutes = Math.ceil((record.lockedUntil - now) / 60000);
      return NextResponse.json({ 
        error: `偵測到異常嘗試，系統已暫時鎖定。請在 ${waitMinutes} 分鐘後再試。` 
      }, { status: 429 });
    }

    // 從 JSON 讀取使用者
    const usersPath = path.join(process.cwd(), 'src/data/users.json');
    const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    const user = users.find((u: any) => u.userId.toLowerCase() === userId.toLowerCase());

    // 2. 驗證
    if (user && user.password === password) {
      // 登入成功，重置紀錄
      loginAttempts.delete(ip);

      const sessionData = Buffer.from(`${user.userId}:${user.role}`).toString('base64');

      cookies().set('agi_hub_session', sessionData, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, 
        path: '/',
      });

      return NextResponse.json({ success: true, role: user.role });
    }

    // 3. 驗證失敗處理
    const newAttempts = record.attempts + 1;
    const isLocked = newAttempts >= MAX_ATTEMPTS;
    
    loginAttempts.set(ip, {
      attempts: newAttempts,
      lastAttempt: now,
      lockedUntil: isLocked ? now + LOCKOUT_TIME : 0
    });

    // 強制延遲 (防範高速自動化工具)
    await new Promise(resolve => setTimeout(resolve, FAIL_DELAY));

    return NextResponse.json({ 
      error: isLocked ? '連續失敗次數過多，帳號已鎖定 15 分鐘' : `憑證錯誤 (剩餘嘗試次數: ${MAX_ATTEMPTS - newAttempts})`,
      attemptsLeft: MAX_ATTEMPTS - newAttempts
    }, { status: 401 });

  } catch (error) {
    return NextResponse.json({ error: '系統異常' }, { status: 500 });
  }
}

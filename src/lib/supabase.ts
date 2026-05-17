import { createClient } from '@supabase/supabase-js';

// 針對 Vercel 部署建置期 (Build-time) 的安全防護：若環境變數尚未載入，給予安全的預設值避免崩潰
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock-build-only-url-placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_key_for_vercel_build_only';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase 環境變數未設定或處於 Vercel 建置階段，請確保生產環境已配置 .env.local');
}

// 建立單一 Supabase Client 實例供全域呼叫
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // 伺服器端 API 不需要 persist session
  },
});

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'summary'; // summary, trades, rentals
    const city = searchParams.get('city');
    const district = searchParams.get('district');
    const buildingType = searchParams.get('building_type');
    const season = searchParams.get('season');
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    if (!city) {
      return NextResponse.json(
        { error: '缺少必要參數: city (縣市名稱)' },
        { status: 400 }
      );
    }

    if (mode === 'summary') {
      // 查詢季度均價走勢 (來自 v_trades_quarterly_avg 視圖)
      let query = supabase
        .from('v_trades_quarterly_avg')
        .select('*')
        .eq('city', city)
        .order('season', { ascending: false });

      if (district) query = query.eq('district', district);
      if (buildingType) query = query.eq('building_type', buildingType);
      if (season) query = query.eq('season', season);

      const { data, error } = await query.limit(50);

      if (error) {
        console.error('Supabase summary error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        mode: 'summary',
        city,
        district: district || '全區',
        count: data.length,
        data,
      });
    } 
    
    if (mode === 'trades') {
      // 查詢具體買賣成交明細
      let query = supabase
        .from('lvr_trades')
        .select('id, city, district, address, building_type, floor_info, total_floor, building_area, ping, room_count, hall_count, bath_count, total_price, unit_price_ping, parking_price, shift_date, iso_trade_date, season')
        .eq('city', city)
        .order('iso_trade_date', { ascending: false });

      if (district) query = query.eq('district', district);
      if (buildingType) query = query.eq('building_type', buildingType);
      if (season) query = query.eq('season', season);

      const { data, error } = await query.limit(limit);

      if (error) {
        console.error('Supabase trades error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        mode: 'trades',
        city,
        district: district || '全區',
        limit,
        count: data.length,
        data,
      });
    }

    if (mode === 'rentals') {
      // 查詢租金均價走勢
      let query = supabase
        .from('v_rentals_quarterly_avg')
        .select('*')
        .eq('city', city)
        .order('season', { ascending: false });

      if (district) query = query.eq('district', district);
      if (buildingType) query = query.eq('building_type', buildingType);
      if (season) query = query.eq('season', season);

      const { data, error } = await query.limit(50);

      if (error) {
        console.error('Supabase rentals error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        mode: 'rentals',
        city,
        district: district || '全區',
        count: data.length,
        data,
      });
    }

    return NextResponse.json(
      { error: `不支援的查詢模式: ${mode}` },
      { status: 400 }
    );

  } catch (err: any) {
    console.error('LVR API Exception:', err);
    return NextResponse.json(
      { error: err.message || '伺服器內部錯誤' },
      { status: 500 }
    );
  }
}

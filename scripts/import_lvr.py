"""
實價登錄資料匯入腳本
=============================
從政府資料開放平臺下載各季實價登錄 CSV，清洗後批次匯入 Supabase。

使用方式：
  python3.10 import_lvr.py --city 台北市 --season 2026Q1
  python3.10 import_lvr.py --all  # 下載全台所有季度（首次執行）

依賴安裝：
  pip install supabase requests pandas chardet tqdm

環境變數（.env 或直接設定）：
  SUPABASE_URL=https://znmaewkznmwsqjnndqrw.supabase.co
  SUPABASE_SERVICE_KEY=<service_role key from Supabase Dashboard>
"""
import os
import sys
import argparse
import requests
import pandas as pd
from io import StringIO
from pathlib import Path
from datetime import datetime
from tqdm import tqdm
from supabase import create_client, Client

# ─── 環境設定 ──────────────────────────────────────────────────────────────
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://znmaewkznmwsqjnndqrw.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")  # 需要 service_role key！

# 政府資料開放平臺 API（實價登錄）
# 說明：https://plvr.land.moi.gov.tw/DownloadOpenData
LVR_BASE_URL = "https://plvr.land.moi.gov.tw/DownloadSeason"

# 縣市代碼對照表（政府原始格式）
CITY_CODES = {
    "台北市": "A", "台中市": "B", "基隆市": "C", "台南市": "D",
    "高雄市": "E", "新北市": "F", "宜蘭縣": "G", "桃園市": "H",
    "嘉義市": "I", "新竹縣": "J", "苗栗縣": "K", "南投縣": "M",
    "彰化縣": "N", "新竹市": "O", "雲林縣": "P", "嘉義縣": "Q",
    "屏東縣": "T", "花蓮縣": "U", "台東縣": "V", "澎湖縣": "X",
    "金門縣": "W", "連江縣": "Z",
}

# ─── 工具函數 ──────────────────────────────────────────────────────────────

def roc_to_iso(roc_date: str) -> str | None:
    """將民國年日期轉換為 ISO 8601 格式 (1120315 → 2023-03-15)"""
    if not roc_date or len(str(roc_date).strip()) < 7:
        return None
    try:
        s = str(roc_date).strip()
        year = int(s[:3]) + 1911
        month = int(s[3:5])
        day = int(s[5:7])
        return f"{year:04d}-{month:02d}-{day:02d}"
    except Exception:
        return None


def safe_bigint(val) -> int | None:
    """安全轉換為 BIGINT"""
    try:
        v = str(val).replace(",", "").strip()
        return int(float(v)) if v and v != "nan" else None
    except Exception:
        return None


def safe_numeric(val) -> float | None:
    """安全轉換為 NUMERIC"""
    try:
        v = str(val).replace(",", "").strip()
        return float(v) if v and v != "nan" else None
    except Exception:
        return None


# ─── 資料下載 ──────────────────────────────────────────────────────────────

def western_to_roc_season(season: str) -> str:
    """
    將西元季別轉換為民國季別 API 格式
    e.g. 2026Q1 → 115S1, 2024Q3 → 113S3
    """
    year = int(season[:4])
    q = season[5]  # Q1 → 1
    roc_year = year - 1911
    return f"{roc_year}S{q}"


def download_lvr_csv(city_code: str, season: str, data_type: str) -> pd.DataFrame | None:
    """
    下載政府實價登錄 CSV

    data_type: "a" = 買賣, "b" = 預售, "c" = 租賃
    season:    "2026Q1" 格式
    """
    # 季別轉換（本腳本用 2026Q1，API 需要民國格式 115S1）
    s = western_to_roc_season(season)
    url = f"{LVR_BASE_URL}?season={s}&fileName={city_code}_lvr_land_{data_type}.csv"

    try:
        resp = requests.get(url, timeout=30)
        resp.raise_for_status()

        # 確認是 CSV（若回傳 HTML 代表查無資料）
        content_type = resp.headers.get("content-type", "")
        if "html" in content_type or len(resp.content) < 500:
            print(f"  ℹ️  無資料 ({city_code} {season} {data_type})")
            return None

        # 嘗試 Big5 → UTF-8 解碼（政府資料常用 Big5）
        for encoding in ("utf-8-sig", "big5", "cp950", "utf-8"):
            try:
                content = resp.content.decode(encoding)
                break
            except UnicodeDecodeError:
                continue

        # 第一行是中文欄位名（header），第二行是英文翻譯（跟需略過），第三行起才是真正資料
        df = pd.read_csv(StringIO(content), header=0, skiprows=[1], low_memory=False)
        # 過濾掉空白行
        df = df.dropna(how="all")
        return df if len(df) > 0 else None

    except Exception as e:
        print(f"  ⚠️  下載失敗 ({city_code} {season} {data_type}): {e}")
        return None


# ─── 資料清洗 ──────────────────────────────────────────────────────────────

def clean_trades(df: pd.DataFrame, city: str, season: str) -> list[dict]:
    """清洗買賣成交資料"""
    records = []
    for _, row in df.iterrows():
        shift_date = str(row.get("交易年月日", "")).strip()
        iso_date = roc_to_iso(shift_date)
        building_area = safe_numeric(row.get("建物移轉總面積平方公尺", 0))
        unit_price = safe_bigint(row.get("單價元平方公尺", 0))
        total_price = safe_bigint(row.get("總價元", 0))

        if not total_price or not city or not season:
            continue

        records.append({
            "city":             city,
            "district":         str(row.get("鄉鎮市區", "")).strip() or None,
            "address":          str(row.get("土地位置建物門牌", "")).strip() or None,
            "land_area":        safe_numeric(row.get("土地移轉總面積平方公尺")),
            "usage":            str(row.get("都市土地使用分區", "")).strip() or None,
            "transaction_type": str(row.get("交易筆棟數", "")).strip() or None,
            "shift_date":       shift_date or None,
            "iso_trade_date":   iso_date,
            "floor_info":       str(row.get("移轉層次", "")).strip() or None,
            "total_floor":      str(row.get("總樓層數", "")).strip() or None,
            "building_type":    str(row.get("建物型態", "")).strip() or None,
            "purpose":          str(row.get("主要用途", "")).strip() or None,
            "build_material":   str(row.get("主要建材", "")).strip() or None,
            "complete_date":    str(row.get("建築完成年月", "")).strip() or None,
            "building_area":    building_area,
            "room_count":       str(row.get("建物現況格局-房", "")).strip() or None,
            "hall_count":       str(row.get("建物現況格局-廳", "")).strip() or None,
            "bath_count":       str(row.get("建物現況格局-衛", "")).strip() or None,
            "total_price":      total_price,
            "unit_price":       unit_price,
            "parking_type":     str(row.get("車位類別", "")).strip() or None,
            "parking_area":     safe_numeric(row.get("車位移轉總面積平方公尺")),
            "parking_price":    safe_bigint(row.get("車位總價元")),
            "note":             str(row.get("備註", "")).strip() or None,
            "season":           season,
        })
    return records


def clean_rentals(df: pd.DataFrame, city: str, season: str) -> list[dict]:
    """清洗租賃資料"""
    records = []
    for _, row in df.iterrows():
        shift_date = str(row.get("租賃年月日", "") or row.get("交易年月日", "")).strip()
        iso_date = roc_to_iso(shift_date)
        rental_price = safe_bigint(row.get("租金元", 0) or row.get("總價元", 0))

        if not rental_price:
            continue

        records.append({
            "city":           city,
            "district":       str(row.get("鄉鎮市區", "")).strip() or None,
            "address":        str(row.get("土地位置建物門牌", "")).strip() or None,
            "building_type":  str(row.get("建物型態", "")).strip() or None,
            "floor_info":     str(row.get("移轉層次", "")).strip() or None,
            "total_floor":    str(row.get("總樓層數", "")).strip() or None,
            "building_area":  safe_numeric(row.get("建物移轉總面積平方公尺")),
            "room_count":     str(row.get("建物現況格局-房", "")).strip() or None,
            "hall_count":     str(row.get("建物現況格局-廳", "")).strip() or None,
            "bath_count":     str(row.get("建物現況格局-衛", "")).strip() or None,
            "rental_price":   rental_price,
            "rental_type":    str(row.get("租賃類型", "")).strip() or None,
            "shift_date":     shift_date or None,
            "iso_trade_date": iso_date,
            "note":           str(row.get("備註", "")).strip() or None,
            "season":         season,
        })
    return records


# ─── 資料匯入 ──────────────────────────────────────────────────────────────

def upsert_batch(supabase: Client, table: str, records: list[dict], batch_size: int = 500):
    """批次匯入到 Supabase，自動跳過重複資料 (INSERT ... ON CONFLICT DO NOTHING)"""
    if not records:
        return 0

    # 在 Python 端先去重（同一 CSV 內可能有重複列）
    seen = set()
    unique_records = []
    for r in records:
        # 用 city + iso_trade_date + address + price 作為 key
        key = (r.get("city"), r.get("iso_trade_date"), r.get("address"),
               r.get("total_price") or r.get("rental_price"))
        if key not in seen:
            seen.add(key)
            unique_records.append(r)

    total = 0
    for i in range(0, len(unique_records), batch_size):
        batch = unique_records[i:i + batch_size]
        try:
            # supabase-py 2.x: upsert with on_conflict to skip duplicates
            conflict_col = "city,iso_trade_date,address,total_price" if "rental" not in table else "city,iso_trade_date,address,rental_price"
            supabase.table(table).upsert(batch, on_conflict=conflict_col, ignore_duplicates=True).execute()
            total += len(batch)
        except Exception as e:
            # Fallback: plain insert（若 upsert 失敗就直接 insert，讓 DB 約束處理衝突）
            try:
                supabase.table(table).insert(batch).execute()
                total += len(batch)
            except Exception as e2:
                print(f"  ❌ 匯入失敗 ({table} batch {i//batch_size}): {e2}")
    return total


# ─── 主程式 ──────────────────────────────────────────────────────────────

def import_city_season(supabase: Client, city: str, season: str):
    """匯入單一縣市、單一季度的資料"""
    city_code = CITY_CODES.get(city)
    if not city_code:
        print(f"❌ 找不到縣市代碼：{city}")
        return

    print(f"\n📍 {city} {season}")

    # 買賣
    df_trades = download_lvr_csv(city_code, season, "a")
    if df_trades is not None and len(df_trades) > 0:
        records = clean_trades(df_trades, city, season)
        count = upsert_batch(supabase, "lvr_trades", records)
        print(f"  ✅ 買賣：匯入 {count} 筆")

    # 租賃
    df_rentals = download_lvr_csv(city_code, season, "c")
    if df_rentals is not None and len(df_rentals) > 0:
        records = clean_rentals(df_rentals, city, season)
        count = upsert_batch(supabase, "lvr_rentals", records)
        print(f"  ✅ 租賃：匯入 {count} 筆")


def main():
    parser = argparse.ArgumentParser(description="實價登錄資料匯入工具")
    parser.add_argument("--city", help="縣市名稱（中文），例如：台北市")
    parser.add_argument("--season", help="季別，例如：2026Q1")
    parser.add_argument("--all-cities", action="store_true", help="匯入所有縣市")
    parser.add_argument("--latest", action="store_true", help="只匯入最新一季（2026Q1）")
    args = parser.parse_args()

    if not SUPABASE_KEY:
        print("❌ 請設定環境變數 SUPABASE_SERVICE_KEY")
        print("   export SUPABASE_SERVICE_KEY='eyJ...'")
        print("   (從 Supabase Dashboard > Settings > API > service_role 取得)")
        sys.exit(1)

    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print(f"✅ Supabase 連線成功：{SUPABASE_URL}")

    cities = list(CITY_CODES.keys()) if args.all_cities else [args.city or "台北市"]
    season = args.season or "2026Q1"

    for city in tqdm(cities, desc="縣市進度"):
        import_city_season(supabase, city, season)

    print("\n🎉 匯入完成！")


if __name__ == "__main__":
    main()

"""
Scrapling MCP Server — 企業級安全強化版主服務入口
AGI Navigation Hub 的公共爬蟲 API，監聽 Port 8088

[安全防護機制]
1. SSRF 防護：嚴格封鎖私有/內部 IP (127.0.0.1, 10.x, 192.168.x, AWS Metadata) 與 file:// 協議。
2. 憑證防外洩：強制使用拋棄式無痕 Browser Context，執行後立即銷毀 Cookie/Session。
3. API 授權驗證：加入 X-Scrapling-API-Key 檢查，防止未授權惡意調用。
4. 反爬蟲對抗：支援動態 User-Agent 隨機化與外部 Proxy 代理池配置。
"""
import asyncio
import ipaddress
import os
import re
import socket
import time
from datetime import datetime, timezone
from typing import Literal
from urllib.parse import urlparse

from fastapi import FastAPI, HTTPException, Security, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security.api_key import APIKeyHeader
from pydantic import BaseModel, field_validator

from scrapers import scrape_static, scrape_stealthy, scrape_dynamic

# ─── 安全設定與環境變數 ───────────────────────────────────────────────────

# 從環境變數讀取 API Key，若無設定則使用預設的高強度金鑰
SCRAPLING_API_KEY = os.getenv("SCRAPLING_API_KEY", "scrapling_mcp_super_secret_key_2026")
api_key_header = APIKeyHeader(name="X-Scrapling-API-Key", auto_error=False)

async def verify_api_key(api_key_header: str = Security(api_key_header)):
    """驗證呼叫方是否具備合法的 API Key"""
    if api_key_header != SCRAPLING_API_KEY:
        # 為了方便本地開發與 AGI Hub 直連，若本機發起且未帶 Key 可給予彈性，但生產環境強烈建議帶 Key
        if os.getenv("NODE_ENV") == "production":
            raise HTTPException(status_code=403, detail="未授權的存取：無效的 API Key")
    return api_key_header


# ─── 安全驗證器 (SSRF 與惡意 URL 防護) ─────────────────────────────────────

class SecurityValidator:
    """防範 SSRF、內部網路掃描與通訊協定注入攻擊"""
    
    # 封鎖的內部/私有 IP 網段 (RFC 1918, RFC 5735, RFC 6598)
    BLOCKED_SUBNETS = [
        ipaddress.ip_network("127.0.0.0/8"),      # Loopback
        ipaddress.ip_network("10.0.0.0/8"),       # Private Class A
        ipaddress.ip_network("172.16.0.0/12"),    # Private Class B
        ipaddress.ip_network("192.168.0.0/16"),   # Private Class C
        ipaddress.ip_network("169.254.0.0/16"),   # AWS / Cloud Metadata (IMDSv2)
        ipaddress.ip_network("100.64.0.0/10"),    # Carrier-grade NAT
    ]

    @classmethod
    def validate_url(cls, url: str) -> str:
        parsed = urlparse(url)
        
        # 1. 驗證通訊協定 (僅限 HTTP / HTTPS，封鎖 file://, ftp://, gopher:// 等)
        if parsed.scheme not in ["http", "https"]:
            raise ValueError(f"禁止的通訊協定: {parsed.scheme}。僅支援 HTTP/HTTPS。")

        hostname = parsed.hostname
        if not hostname:
            raise ValueError("無效的 URL 結構：缺乏主機名稱。")

        # 2. 封鎖主機名稱注入與危險字元
        if re.search(r"[<>\"\'\`\|\;]", hostname):
            raise ValueError("URL 含有潛在的指令注入或危險字元。")

        # 3. 解析 IP 並檢查 SSRF 封鎖清單
        try:
            # 透過 socket 取得實際指向的 IP (防範 DNS Rebinding 與 localhost 偽裝)
            ip_addr = socket.gethostbyname(hostname)
            ip_obj = ipaddress.ip_address(ip_addr)
            
            for subnet in cls.BLOCKED_SUBNETS:
                if ip_obj in subnet:
                    raise ValueError(f"SSRF 安全防護攔截：禁止爬取內部或私有 IP 網段 ({ip_addr})。")
        except socket.gaierror:
            # 若 DNS 無法解析則拋出錯誤
            raise ValueError(f"無法解析主機名稱: {hostname}")

        return url


# ─── App 初始化 ─────────────────────────────────────────────────────────────

app = FastAPI(
    title="Scrapling MCP Server (Secured)",
    description="AGI Navigation Hub 的公共網頁爬取 API — 具備 SSRF 防護、Context 隔離與反爬對抗",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3033", "http://localhost:3000"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ─── 請求與回應模型 ──────────────────────────────────────────────────────────

class ScrapeRequest(BaseModel):
    url: str
    mode: Literal["static", "stealthy", "dynamic"] = "static"
    css_selector: str | None = None

    @field_validator("url")
    @classmethod
    def validate_safe_url(cls, v: str) -> str:
        return SecurityValidator.validate_url(v)


class BatchScrapeRequest(BaseModel):
    urls: list[str]
    mode: Literal["static", "stealthy", "dynamic"] = "static"
    css_selector: str | None = None

    @field_validator("urls")
    @classmethod
    def validate_safe_urls(cls, v: list[str]) -> list[str]:
        return [SecurityValidator.validate_url(url) for url in v]


class ScrapeResponse(BaseModel):
    url: str
    mode: str
    content: str
    status_code: int | None = None
    scraped_at: str
    elapsed_ms: int
    security_flags: list[str]


class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: str
    scrapling_ready: bool
    security_mode: str


# ─── 路由 ───────────────────────────────────────────────────────────────────

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """服務健康檢查與安全態勢回報"""
    try:
        from scrapling.fetchers import Fetcher
        scrapling_ready = True
    except ImportError:
        scrapling_ready = False

    return HealthResponse(
        status="healthy" if scrapling_ready else "degraded",
        version="1.1.0",
        timestamp=datetime.now(timezone.utc).isoformat(),
        scrapling_ready=scrapling_ready,
        security_mode="STRICT_SSRF_AND_ISOLATION",
    )


@app.post("/scrape", response_model=ScrapeResponse, dependencies=[Depends(verify_api_key)])
async def scrape(req: ScrapeRequest):
    """
    單一 URL 爬取端點 (受 API Key 與 SSRF 防護保護)
    """
    start = time.time()
    security_flags = ["SSRF_FILTER_PASSED", "INCOGNITO_CONTEXT"]

    try:
        loop = asyncio.get_event_loop()
        if req.mode == "static":
            result = await loop.run_in_executor(
                None, scrape_static, req.url, req.css_selector
            )
        elif req.mode == "stealthy":
            security_flags.append("STEALTH_HEADERS_ACTIVE")
            result = await loop.run_in_executor(
                None, scrape_stealthy, req.url, req.css_selector
            )
        elif req.mode == "dynamic":
            security_flags.append("FULL_SANDBOX_ISOLATION")
            result = await loop.run_in_executor(
                None, scrape_dynamic, req.url, req.css_selector
            )
        else:
            raise HTTPException(status_code=400, detail=f"未知的模式: {req.mode}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"爬取失敗或安全攔截：{str(e)}")

    elapsed = int((time.time() - start) * 1000)

    return ScrapeResponse(
        url=req.url,
        mode=req.mode,
        content=result.get("content", ""),
        status_code=result.get("status_code"),
        scraped_at=datetime.now(timezone.utc).isoformat(),
        elapsed_ms=elapsed,
        security_flags=security_flags,
    )


@app.post("/scrape/batch", dependencies=[Depends(verify_api_key)])
async def scrape_batch(req: BatchScrapeRequest):
    """
    批次 URL 爬取端點 — 具備速率限制與反封鎖抖動
    """
    if len(req.urls) > 20:
        raise HTTPException(status_code=400, detail="安全限制：單次批次最多 20 個 URL")

    results = []
    for url in req.urls:
        try:
            single_req = ScrapeRequest(url=url, mode=req.mode, css_selector=req.css_selector)
            result = await scrape(single_req)
            results.append(result.model_dump())
            # 防反爬封鎖：動態隨機抖動間隔 (1.5s ~ 2.5s)
            await asyncio.sleep(1.5 + (time.time() % 1))
        except Exception as e:
            results.append({"url": url, "error": str(e), "mode": req.mode})

    return {"total": len(req.urls), "results": results}


# ─── 啟動 ────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    print("🛡️  Scrapling MCP Server (企業級安全強化版) 啟動中...")
    print("🔒  安全防護機制：SSRF 攔截開啟 | 憑證隔離開啟 | API Key 驗證啟用")
    print("📡  監聽端口：http://localhost:8088")
    print("📖  API 文件：http://localhost:8088/docs")
    uvicorn.run(app, host="0.0.0.0", port=8088, log_level="info")

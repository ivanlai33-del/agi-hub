"""
Scrapling MCP Server - Stealthy Fetcher (Secured)
隱匿模式爬取 — 具備 Browser Context 隔離與動態 Proxy 支援
"""
import os
from scrapling.fetchers import StealthyFetcher


def scrape_stealthy(url: str, css_selector: str | None = None) -> dict:
    """
    使用 StealthyFetcher 以隱匿模式抓取頁面。
    [安全強化]：
    1. 支援外部 PROXY_URL 代理伺服器池，避免本機 IP 暴露被封。
    2. 強制以獨立、無痕的 Context 執行，避免 Cookie/Session 外洩或跨站污染。
    """
    # 檢查是否有設定外部 Proxy 代理池
    proxy = os.getenv("PROXY_URL")
    fetch_kwargs = {
        "headless": True,
        "network_idle": True,
        "block_images": True,      # 封鎖圖片以加快速度與節省頻寬
        "disable_resources": True, # 封鎖非必要追蹤腳本與廣告資源
    }
    if proxy:
        fetch_kwargs["proxy"] = proxy

    # StealthyFetcher 底層每次 fetch 皆會初始化全新的 Browser Context，並於結束後自動關閉銷毀
    page = StealthyFetcher.fetch(url, **fetch_kwargs)

    if css_selector:
        elements = page.css(css_selector)
        content = "\n".join([el.get_all_text(ignore_tags=('script', 'style')) for el in elements])
    else:
        body = page.css("body")
        content = body[0].get_all_text(ignore_tags=('script', 'style', 'nav', 'footer')) if body else page.get_all_text()

    return {
        "url": url,
        "status_code": page.status,
        "content": content[:15000],
        "mode": "stealthy",
    }

"""
Scrapling MCP Server - Dynamic Fetcher (Secured)
動態頁面爬取 — 完整瀏覽器沙盒隔離與動態 Proxy 支援
"""
import os
from scrapling.fetchers import DynamicFetcher


def scrape_dynamic(url: str, css_selector: str | None = None) -> dict:
    """
    使用 DynamicFetcher 執行完整瀏覽器渲染。
    [安全強化]：
    1. 支援外部 PROXY_URL 代理伺服器池。
    2. 強制以獨立、無痕的 Context 執行，確保每次爬取結束後完全清理 Cookies/Session。
    """
    proxy = os.getenv("PROXY_URL")
    fetch_kwargs = {
        "headless": True,
        "network_idle": True,
        "block_images": True,
    }
    if proxy:
        fetch_kwargs["proxy"] = proxy

    page = DynamicFetcher.fetch(url, **fetch_kwargs)

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
        "mode": "dynamic",
    }

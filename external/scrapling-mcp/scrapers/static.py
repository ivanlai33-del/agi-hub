"""
Scrapling MCP Server - Batch Fetcher
靜態頁面爬取 (Fetcher) — 速度最快，無瀏覽器開銷
"""
from scrapling.fetchers import Fetcher


def scrape_static(url: str, css_selector: str | None = None) -> dict:
    """
    使用 Fetcher 抓取靜態頁面（無 JavaScript 執行）。
    適合：政府網站、新聞網站、無反爬機制的一般頁面。
    """
    page = Fetcher.get(url, stealthy_headers=True, follow_redirects=True)

    if css_selector:
        elements = page.css(css_selector)
        content = "\n".join([el.get_all_text(ignore_tags=('script', 'style')) for el in elements])
    else:
        # 預設取 body 的純文字內容
        body = page.css("body")
        content = body[0].get_all_text(ignore_tags=('script', 'style', 'nav', 'footer')) if body else page.get_all_text()

    return {
        "url": url,
        "status_code": page.status,
        "content": content[:15000],  # 限制回傳長度，節省 token
        "mode": "static",
    }

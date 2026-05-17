"""Scrapling MCP Server — scrapers package"""
from .static import scrape_static
from .stealthy import scrape_stealthy
from .dynamic import scrape_dynamic

__all__ = ["scrape_static", "scrape_stealthy", "scrape_dynamic"]

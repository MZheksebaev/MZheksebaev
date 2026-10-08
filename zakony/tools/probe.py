"""Temporary probe: dumps adilet.zan.kz page structure into the CI log."""
import re
import sys
import time

import requests
from bs4 import BeautifulSoup

BASE = "https://adilet.zan.kz"
S = requests.Session()
S.headers["User-Agent"] = "Mozilla/5.0 (X11; Linux x86_64) zakony-rk-sync/0.1"


def show(path, text_chars=1500, links=80, raw=0):
    url = path if path.startswith("http") else BASE + path
    print("\n" + "=" * 100)
    print("URL:", url)
    try:
        r = S.get(url, timeout=60)
    except Exception as e:  # noqa: BLE001
        print("ERROR", repr(e))
        return
    print("STATUS", r.status_code, "FINAL", r.url, "LEN", len(r.content), "CT", r.headers.get("content-type"))
    if raw:
        print("RAW>>>", r.text[:raw].replace("\n", "\\n "))
    if "html" not in (r.headers.get("content-type") or ""):
        print(r.text[:text_chars])
        return
    soup = BeautifulSoup(r.text, "html.parser")
    print("TITLE:", soup.title.get_text(strip=True) if soup.title else None)
    for f in soup.find_all("form"):
        print("FORM action=%r method=%r id=%r" % (f.get("action"), f.get("method"), f.get("id")))
        for el in f.find_all(["input", "select", "textarea"]):
            opts = [(o.get("value"), o.get_text(strip=True)) for o in el.find_all("option")][:60]
            print("   ", el.name, el.get("name"), el.get("type"), repr(el.get("value"))[:60], opts if opts else "")
    seen = set()
    n = 0
    for a in soup.find_all("a", href=True):
        h = a["href"]
        if h in seen or h.startswith("#") or "javascript" in h:
            continue
        seen.add(h)
        n += 1
        if n > links:
            break
        print("  A", h, "|", a.get_text(" ", strip=True)[:80])
    # describe containers of main content
    for sel in ["article", "div.container_alpha", "div.gs_12", "div.document", "div#content", "main"]:
        el = soup.select_one(sel)
        if el:
            cls = el.get("class")
            print("SEL", sel, "class", cls, "textlen", len(el.get_text()))
    art = soup.find("article") or soup.body
    if art:
        # tag/class census inside the article
        census = {}
        for t in art.find_all(True):
            k = t.name + "." + ".".join(t.get("class") or [])
            census[k] = census.get(k, 0) + 1
        print("CENSUS", sorted(census.items(), key=lambda kv: -kv[1])[:40])
        txt = art.get_text("\n", strip=True)
        print("TEXT>>>")
        print(txt[:text_chars])
        print("<<<TEXT")
        print("ARTICLE_HTML_HEAD>>>", str(art)[:2500].replace("\n", " "))


if __name__ == "__main__":
    show("/robots.txt", raw=2000)
    show("/sitemap.xml", raw=2000)
    show("/rus", links=200, text_chars=800)
    show("/rus/docs/K950001000_", text_chars=2500, links=120)
    show("/rus/docs/K950001000_/info", text_chars=2500, links=60)
    show("/rus/docs/K950001000_/history", text_chars=2500, links=60)
    show("/rus/docs/K1400000226/links", text_chars=800, links=60)
    show("/rus/docs/K950001000_/download", raw=500)
    show("/rus/search/docs", text_chars=2500, links=150)
    show("/rus/sitemap", text_chars=1500, links=150)
    show("/rus/index/docs/type=K", text_chars=1500, links=150)
    show("/kaz/docs/K950001000_", text_chars=600, links=10)
    sys.stdout.flush()

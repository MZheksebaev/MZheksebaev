"""Temporary probe: dumps adilet.zan.kz page structure into the CI log."""
import re

import requests

BASE = "https://adilet.zan.kz"
S = requests.Session()
S.headers["User-Agent"] = "Mozilla/5.0 (X11; Linux x86_64) zakony-rk-sync/0.1"


def get(path):
    url = path if path.startswith("http") else BASE + path
    r = S.get(url, timeout=60)
    r.encoding = "utf-8"
    print("\n" + "=" * 100)
    print("URL:", url, "STATUS", r.status_code, "LEN", len(r.content), "CT", r.headers.get("content-type"))
    return r


if __name__ == "__main__":
    r = get("/robots.txt")
    print(r.text)
    r = get("/rus/docs/K950001000_")
    print(r.text)
    scripts = re.findall(r'(?:src|href)="([^"]+\.(?:js|mjs))"', r.text)
    print("SCRIPTS", scripts)
    for s in scripts:
        js = get(s).text
        endpoints = sorted(set(re.findall(r'["\'`](/(?:api|v\d|rest|backend)[^"\'`\s]{0,120})["\'`]', js)))
        print("ENDPOINTS", len(endpoints))
        for e in endpoints:
            print("  EP", e)
        for m in re.finditer(r'(api|fetch\(|axios|baseURL|VITE_[A-Z_]+)', js):
            pass
        for kw in ["baseURL", "/api", "fetch(", "VITE_", "graphql", "SEO_BODY", "/docs/", "status", "search"]:
            idxs = [m.start() for m in re.finditer(re.escape(kw), js)][:6]
            for i in idxs:
                print("  CTX[%s] %s" % (kw, js[max(0, i - 160): i + 200].replace("\n", " ")))
    for p in ["/api", "/api/v1", "/api/docs/K950001000_", "/api/v1/docs/K950001000_", "/api/documents/K950001000_",
              "/sitemap.xml", "/sitemap-index.xml", "/llms.txt", "/.well-known/ai.txt", "/ai.txt"]:
        try:
            r = get(p)
            print(r.text[:1500])
        except Exception as e:  # noqa: BLE001
            print("ERR", p, e)

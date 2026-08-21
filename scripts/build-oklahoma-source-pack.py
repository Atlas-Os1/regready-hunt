from __future__ import annotations

import html
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "oklahoma" / "raw"
OUT = ROOT / "data" / "oklahoma"
RAW.mkdir(parents=True, exist_ok=True)

HEADERS = {"User-Agent": "RegReady-Hunt-source-pack/0.1 (+https://github.com/Atlas-Os1/regready-hunt)"}
BASE = "https://www.wildlifedepartment.com"
SOURCES = [
    {
        "id": "big-game-regulations",
        "url": f"{BASE}/hunting/regs/big-game-regulations",
        "kind": "index",
        "scope": "Oklahoma big-game species index",
    },
    {
        "id": "general-hunting-regulations",
        "url": f"{BASE}/hunting/regs/general-hunting-regulations",
        "kind": "general-regulations",
        "scope": "Oklahoma general hunting rules",
    },
    {
        "id": "deer-big-game-season",
        "url": f"{BASE}/hunting/regs/deer-big-game-season",
        "kind": "species-regulations",
        "species": "deer",
        "scope": "Oklahoma deer big-game season",
    },
    {
        "id": "elk-big-game-season",
        "url": f"{BASE}/hunting/regs/elk-big-game-season",
        "kind": "species-regulations",
        "species": "elk",
        "scope": "Oklahoma elk big-game season",
    },
    {
        "id": "antelope-big-game-season",
        "url": f"{BASE}/hunting/regs/antelope-big-game-season",
        "kind": "species-regulations",
        "species": "antelope",
        "scope": "Oklahoma antelope big-game season",
    },
    {
        "id": "bear-big-game-season",
        "url": f"{BASE}/hunting/regs/bear-big-game-season",
        "kind": "species-regulations",
        "species": "black bear",
        "scope": "Oklahoma black bear big-game season",
    },
    {
        "id": "mountain-lion-big-game-season",
        "url": f"{BASE}/hunting/regs/mountain-lion-big-game-season",
        "kind": "species-regulations",
        "species": "mountain lion",
        "scope": "Oklahoma mountain lion big-game season",
    },
    {
        "id": "public-hunting-areas-special-regulations-page-11",
        "url": f"{BASE}/hunting/regs/public-hunting-areas-special-regulations?page=11",
        "kind": "public-area-special-regulations",
        "scope": "Oklahoma public hunting area special regulations, requested page 11",
    },
]


def fetch(url: str) -> tuple[str, str]:
    request = Request(url, headers=HEADERS)
    with urlopen(request, timeout=45) as response:
        return response.geturl(), response.read().decode("utf-8", "ignore")


def strip_html(source: str) -> str:
    source = re.sub(r"<script\b[^>]*>.*?</script>", " ", source, flags=re.I | re.S)
    source = re.sub(r"<style\b[^>]*>.*?</style>", " ", source, flags=re.I | re.S)
    source = re.sub(r"<br\s*/?>", "\n", source, flags=re.I)
    source = re.sub(r"</(p|li|h[1-6]|div|section|tr)>", "\n", source, flags=re.I)
    source = re.sub(r"<[^>]+>", " ", source)
    source = html.unescape(source).replace("\xa0", " ")
    lines = [re.sub(r"\s+", " ", line).strip() for line in source.splitlines()]
    lines = [line for line in lines if line]
    return "\n".join(lines)


def text_of(fragment: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", fragment))).strip()


def extract_seasons(source: str) -> list[dict]:
    pattern = re.compile(
        r'<div class="paragraph paragraph--type--hunting-season.*?</div>\s*</div>\s*</div>',
        re.I | re.S,
    )
    records = []
    for block in pattern.findall(source):
        title_match = re.search(
            r'field--name-field-season-title[^>]*>.*?<h3>(.*?)<h3', block, re.I | re.S
        )
        dates = re.findall(r'<time[^>]*>(.*?)</time>', block, re.I | re.S)
        body_match = re.search(
            r'field--name-field-text[^>]*>(.*?)</div>', block, re.I | re.S
        )
        title = text_of(title_match.group(1)) if title_match else ""
        body = text_of(body_match.group(1)) if body_match else text_of(block)
        records.append({
            "title": title,
            "start": text_of(dates[0]) if len(dates) > 0 else None,
            "end": text_of(dates[1]) if len(dates) > 1 else None,
            "sourceText": body,
        })
    return records


def extract_links(source: str) -> list[str]:
    values = set()
    for href in re.findall(r'href=["\']([^"\']+)', source, re.I):
        if href.startswith("/"):
            values.add(urljoin(BASE, href))
        elif href.startswith("http"):
            values.add(href)
    return sorted(values)


retrieved_at = datetime.now(timezone.utc).isoformat()
manifest = {
    "packId": "oklahoma-large-game",
    "retrievedAt": retrieved_at,
    "authority": "Oklahoma Department of Wildlife Conservation",
    "status": "source-captured-normalization-pending-human-review",
    "legalNotice": "Official ODWC pages are the authority. This pack is a captured and normalized research artifact, not legal advice.",
    "speciesTarget": ["deer", "elk", "antelope", "black bear", "mountain lion"],
    "sources": [],
}

for item in SOURCES:
    final_url, source = fetch(item["url"])
    raw_path = RAW / f'{item["id"]}.html'
    raw_path.write_text(source, encoding="utf-8")
    text_path = RAW / f'{item["id"]}.txt'
    text_path.write_text(strip_html(source), encoding="utf-8")
    record = {
        **item,
        "finalUrl": final_url,
        "retrievedAt": retrieved_at,
        "httpStatus": 200,
        "rawFile": str(raw_path.relative_to(ROOT)).replace("\\", "/"),
        "textFile": str(text_path.relative_to(ROOT)).replace("\\", "/"),
        "bytes": len(source.encode("utf-8")),
        "links": extract_links(source),
        "seasons": extract_seasons(source),
    }
    manifest["sources"].append(record)

(OUT / "source-pack.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(json.dumps({"pack": manifest["packId"], "sources": len(manifest["sources"]), "retrievedAt": retrieved_at, "seasonRecords": sum(len(x["seasons"]) for x in manifest["sources"])}, indent=2))

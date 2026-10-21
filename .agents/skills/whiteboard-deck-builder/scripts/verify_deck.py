#!/usr/bin/env python3
"""Verify a whiteboard explainer deck (or a directory of decks).

Checks the invariants that make these decks render correctly:
  1. <section> tags balanced; slide count sane (8-18 warn thresholds)
  2. Every inline diagram <svg> is well-formed XML
  3. No <text> inside a filter="url(#rough)" group (wobble makes text illegible)
  4. Slide-fit CSS present (section.present display:flex + svg flex:1 1 0)
  5. Handwriting font linked and applied
  6. Shared defs block present exactly once (#rough, #ah, #ahg)
  7. Each slide has a pageno; concept slides have a takeaway (warn)
  8. Text-overflow heuristic: est. width = chars * fontSize * 0.55 must fit
     the viewBox given the text-anchor (warn, with slide + string)

Usage:
  python3 verify_deck.py path/to/deck.html [more.html ...]
  python3 verify_deck.py path/to/decks-dir/

Exit code 0 = all hard checks pass (warnings allowed); 1 = hard failure.
"""
import re
import sys
import xml.dom.minidom as minidom
from pathlib import Path

CLASS_SIZES = {"lbl": 21, "lbl-sm": 17, "lbl-g": 17, "lbl-b": 23, "num": 24}
WIDTH_FACTOR = 0.55  # handwriting fonts are wide

def est_font_size(attrs: str) -> int:
    m = re.search(r'font-size:\s*(\d+)', attrs) or re.search(r'font-size="(\d+)', attrs)
    if m:
        return int(m.group(1))
    m = re.search(r'class="([^"]+)"', attrs)
    if m:
        for cls in m.group(1).split():
            if cls in CLASS_SIZES:
                return CLASS_SIZES[cls]
    return 18

def check_file(path: Path) -> tuple[list, list]:
    errors, warnings = [], []
    html = path.read_text(encoding="utf-8")

    # 1. sections (strip HTML/CSS/JS comments first so prose mentioning <section> doesn't count)
    stripped = re.sub(r"<!--.*?-->|/\*.*?\*/", "", html, flags=re.S)
    stripped = re.sub(r"^\s*//.*$", "", stripped, flags=re.M)
    n_open = len(re.findall(r"<section(?:\s|>)", stripped))
    n_close = stripped.count("</section>")
    if n_open != n_close:
        errors.append(f"unbalanced <section>: {n_open} open / {n_close} close")
    if n_open < 8:
        warnings.append(f"only {n_open} slides — most modules need 8+ to cover concepts")
    if n_open > 18:
        warnings.append(f"{n_open} slides — consider splitting; >18 usually re-teaches the reading")

    # 6. defs block
    for token, what in (("#rough", "wobble filter"), ('id="ah"', "arrowhead marker"), ('id="ahg"', "gray arrowhead")):
        if token not in html:
            errors.append(f"missing shared defs: {what} ({token})")
    if html.count('<filter id="rough"') > 1:
        errors.append("duplicate #rough filter defs")

    # 4. fit CSS
    if "section.present{ display:flex; }" not in html.replace("  ", " "):
        if not re.search(r"section\.present\s*\{\s*display:\s*flex", html):
            errors.append("slide-fit CSS missing: .reveal .slides > section.present{ display:flex; }")
    if not re.search(r"\.reveal svg\{[^}]*flex:\s*1 1 0", html):
        errors.append("svg fit CSS missing: .reveal svg must use flex:1 1 0 (grow-from-zero)")

    # 5. font
    if "fonts.googleapis.com" not in html and "@font-face" not in html:
        warnings.append("no webfont link found — deck will fall back to system cursive")

    # 4b. autofit script (last line of defense against bottom clipping)
    if "Autofit" not in html and "scrollHeight > sec.clientHeight" not in html:
        errors.append("autofit script missing — copy it from the template (it shrinks the diagram when text wraps)")

    # 7b. long text that will wrap and eat vertical space
    for m in re.finditer(r'<h2 class="t"[^>]*>([^<]+)</h2>', html):
        t = m.group(1).strip()
        if len(t) > 52:
            warnings.append(f'title likely wraps to 2 lines ({len(t)} chars): "{t[:60]}"')
    for m in re.finditer(r'<p class="takeaway">([^<]+)</p>', html):
        t = m.group(1).strip()
        if len(t) > 115:
            warnings.append(f'takeaway likely wraps to 2+ lines ({len(t)} chars): "{t[:60]}..."')

    # 2 + 3 + 8. per-svg checks
    svgs = re.findall(r"<svg[^>]*viewBox[^>]*>.*?</svg>", html, re.S)
    if not svgs:
        errors.append("no inline diagram SVGs found")
    for i, svg in enumerate(svgs, 1):
        try:
            minidom.parseString(svg)
        except Exception as e:
            errors.append(f"svg #{i} not well-formed XML: {e}")
            continue
        for g in re.finditer(r'<g[^>]*filter="url\(#rough\)"[^>]*>(.*?)</g>', svg, re.S):
            if "<text" in g.group(1):
                errors.append(f"svg #{i}: <text> inside a #rough filter group (text will be distorted)")
        vb = re.search(r'viewBox="0 0 (\d+) (\d+)"', svg)
        if not vb:
            warnings.append(f"svg #{i}: viewBox not in '0 0 W H' form — overflow check skipped")
            continue
        vw = int(vb.group(1))
        for t in re.finditer(r"<text([^>]*)>([^<]+)</text>", svg):
            attrs, content = t.group(1), t.group(2).strip()
            xm = re.search(r'x="(-?[\d.]+)"', attrs)
            if not xm:
                continue
            x = float(xm.group(1))
            fs = est_font_size(attrs)
            w = len(content) * fs * WIDTH_FACTOR
            anchor = "middle" if 'text-anchor="middle"' in attrs else ("end" if 'text-anchor="end"' in attrs else "start")
            if anchor == "middle":
                lo, hi = x - w / 2, x + w / 2
            elif anchor == "end":
                lo, hi = x - w, x
            else:
                lo, hi = x, x + w
            if lo < -5 or hi > vw + 5:
                warnings.append(f'svg #{i}: probable text overflow ({anchor}@{x:.0f}, ~{w:.0f}px wide, viewBox {vw}): "{content[:48]}"')

    # 7. slide furniture
    n_pageno = len(re.findall(r'class="pageno"', html))
    if n_pageno < n_open:
        warnings.append(f"{n_open - n_pageno} slide(s) missing a pageno")
    n_takeaway = len(re.findall(r'class="takeaway"', html))
    if n_takeaway < max(0, n_open - 3):
        warnings.append(f"only {n_takeaway} takeaway lines for {n_open} slides — most concept slides should have one")

    return errors, warnings

def main(argv):
    targets = []
    for a in argv:
        p = Path(a)
        if p.is_dir():
            targets += sorted(x for x in p.glob("*.html") if x.name != "index.html")
        else:
            targets.append(p)
    if not targets:
        print("usage: verify_deck.py <deck.html | dir> [...]"); return 1
    failed = False
    for p in targets:
        errors, warnings = check_file(p)
        status = "FAIL" if errors else "PASS"
        print(f"[{status}] {p.name}")
        for e in errors:
            print(f"    ERROR: {e}")
        for w in warnings:
            print(f"    warn : {w}")
        failed = failed or bool(errors)
    return 1 if failed else 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

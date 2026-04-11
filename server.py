#!/usr/bin/env python3
"""
Tiny HTTP server for Village Hack.
- Serves static files from this directory
- POST /signup → appends email to signups.jsonl
- POST /share → stores a shareable badge, GET /share/<id> retrieves it
"""
import http.server
import json
import os
import re
import secrets
import socketserver
import time
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).parent.resolve()
SIGNUPS_FILE = ROOT / "signups.jsonl"
BADGES_FILE = ROOT / "badges.jsonl"
SAVES_FILE = ROOT / "saves.jsonl"
PORT = 8180

# Cache loaded badges + saves in memory for fast lookup
_badges_cache = {}
_saves_cache = {}


def load_badges():
    if not BADGES_FILE.exists():
        return
    with open(BADGES_FILE, "r") as f:
        for line in f:
            try:
                b = json.loads(line)
                _badges_cache[b["id"]] = b
            except Exception:
                pass


def load_saves():
    if not SAVES_FILE.exists():
        return
    with open(SAVES_FILE, "r") as f:
        for line in f:
            try:
                s = json.loads(line)
                # Keep the most recent save for each code (overwrite on reload)
                _saves_cache[s["code"]] = s
            except Exception:
                pass


def human_code():
    """Generate a human-friendly 6-char code avoiding confusing characters."""
    # Excludes: 0/O/1/I/L (look alike), 8/B (look alike in pixel fonts),
    # 6/G (look alike), 5/S (look alike), 2/Z (look alike)
    alphabet = "ACDEFHJKMNPQRTUVWXY347"
    return "".join(secrets.choice(alphabet) for _ in range(6))


load_badges()
load_saves()


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, format, *args):
        # Quieter logs
        return

    def end_headers(self):
        # No-cache for JS modules and HTML during development
        path = self.path or ''
        if path.endswith('.js') or path.endswith('.html') or path == '/':
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
        super().end_headers()

    def _send_json(self, status, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def _read_json(self):
        length = int(self.headers.get("Content-Length", 0))
        if length == 0 or length > 10000:
            return None
        try:
            return json.loads(self.rfile.read(length).decode("utf-8"))
        except Exception:
            return None

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        path = urlparse(self.path).path

        if path == "/signup":
            data = self._read_json() or {}
            email = (data.get("email") or "").strip().lower()
            if not email or "@" not in email or len(email) > 200:
                return self._send_json(400, {"error": "invalid email"})
            entry = {
                "email": email,
                "ts": int(time.time()),
                "ip": self.headers.get("X-Forwarded-For", self.client_address[0]),
                "ua": self.headers.get("User-Agent", "")[:200],
            }
            with open(SIGNUPS_FILE, "a") as f:
                f.write(json.dumps(entry) + "\n")
            return self._send_json(200, {"ok": True})

        if path == "/share":
            data = self._read_json() or {}
            name = (data.get("name") or "").strip().upper()[:16]
            rank = (data.get("rank") or "").strip()[:32]
            s1 = bool(data.get("s1"))
            s2 = bool(data.get("s2"))
            if not name or not re.match(r"^[A-Z0-9_\- ]+$", name):
                return self._send_json(400, {"error": "invalid name"})
            badge_id = secrets.token_urlsafe(8)
            entry = {
                "id": badge_id,
                "name": name,
                "rank": rank,
                "s1": s1,
                "s2": s2,
                "ts": int(time.time()),
            }
            with open(BADGES_FILE, "a") as f:
                f.write(json.dumps(entry) + "\n")
            _badges_cache[badge_id] = entry
            return self._send_json(200, {"id": badge_id})

        if path == "/save":
            data = self._read_json() or {}
            name = (data.get("name") or "").strip().upper()[:16]
            if not name or not re.match(r"^[A-Z0-9_\- ]+$", name):
                return self._send_json(400, {"error": "invalid name"})
            completed = data.get("completed") or []
            if not isinstance(completed, list) or len(completed) > 50:
                return self._send_json(400, {"error": "invalid completed"})
            completed = [int(x) for x in completed if isinstance(x, (int, float)) and 0 <= int(x) < 50]
            seen_s2 = bool(data.get("seenS2Intro"))
            # Reuse existing code if provided, otherwise generate new
            code = (data.get("code") or "").strip().upper()
            if not code or not re.match(r"^[A-Z0-9]{6}$", code):
                code = human_code()
                while code in _saves_cache:
                    code = human_code()
            entry = {
                "code": code,
                "name": name,
                "completed": completed,
                "seenS2Intro": seen_s2,
                "ts": int(time.time()),
            }
            with open(SAVES_FILE, "a") as f:
                f.write(json.dumps(entry) + "\n")
            _saves_cache[code] = entry
            return self._send_json(200, {"code": code})

        return self._send_json(404, {"error": "not found"})

    def do_GET(self):
        path = urlparse(self.path).path

        # /badge/<id> → JSON
        if path.startswith("/badge/"):
            badge_id = path[len("/badge/"):]
            badge = _badges_cache.get(badge_id)
            if not badge:
                return self._send_json(404, {"error": "not found"})
            return self._send_json(200, badge)

        # /load/<code> → JSON save data
        if path.startswith("/load/"):
            code = path[len("/load/"):].upper()
            save = _saves_cache.get(code)
            if not save:
                return self._send_json(404, {"error": "save not found"})
            return self._send_json(200, save)

        # /share/<id> → HTML page rendering the badge
        if path.startswith("/share/"):
            badge_id = path[len("/share/"):]
            badge = _badges_cache.get(badge_id)
            if not badge:
                self.send_response(404)
                self.send_header("Content-Type", "text/html")
                self.end_headers()
                self.wfile.write(b"<h1>Badge not found</h1>")
                return
            html = render_share_page(badge)
            body = html.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        # /parents → parents.html
        if path == "/parents" or path == "/parents/":
            self.path = "/parents.html"

        # Default: serve static
        return super().do_GET()


def render_share_page(badge):
    name = badge["name"]
    rank = badge.get("rank", "Hacker")
    s1 = badge.get("s1")
    s2 = badge.get("s2")

    season_text = ""
    if s2:
        season_text = "Completed BOTH seasons of Village Hack"
        achievement = "ELITE HACKER"
        color = "#cc66ff"
    elif s1:
        season_text = "Completed Season 1 of Village Hack"
        achievement = "VILLAGE SAVED"
        color = "#00ff41"
    else:
        season_text = "Started Village Hack"
        achievement = "ROOKIE"
        color = "#00ff41"

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{name} — {achievement} | Village Hack</title>
<meta property="og:title" content="{name} just earned {achievement} on Village Hack">
<meta property="og:description" content="{season_text}. Can you beat them?">
<meta property="og:type" content="website">
<link href="https://fonts.googleapis.com/css2?family=Fira+Mono:wght@400;700&family=Press+Start+2P&family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
<style>
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
body {{
  background: #0a0a0a;
  color: #e8e8e8;
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}}
body::after {{
  content: '';
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px);
  pointer-events: none;
}}
.badge {{
  max-width: 500px;
  width: 100%;
  text-align: center;
  background: #0d1117;
  border: 2px solid {color};
  border-radius: 12px;
  padding: 50px 40px;
  box-shadow: 0 0 60px {color}33, 0 0 120px {color}22;
  position: relative;
  z-index: 1;
}}
.badge .label {{
  font-family: 'Fira Mono', monospace;
  color: {color};
  font-size: 11px;
  letter-spacing: 3px;
  margin-bottom: 24px;
  opacity: 0.8;
}}
.badge .name {{
  font-family: 'Press Start 2P', monospace;
  font-size: clamp(20px, 5vw, 32px);
  color: {color};
  text-shadow: 0 0 30px {color};
  margin-bottom: 24px;
  word-break: break-word;
}}
.badge .achievement {{
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #fff;
  background: {color};
  padding: 10px 16px;
  display: inline-block;
  border-radius: 4px;
  margin-bottom: 24px;
  text-shadow: none;
}}
.badge .description {{
  color: #8a9a8a;
  font-size: 15px;
  margin-bottom: 32px;
  line-height: 1.6;
}}
.badge .rank {{
  font-family: 'Fira Mono', monospace;
  color: #00ff41;
  font-size: 14px;
  margin-bottom: 32px;
}}
.badge .cta {{
  display: inline-block;
  background: #00ff41;
  color: #000;
  padding: 16px 32px;
  border-radius: 6px;
  font-weight: 800;
  font-size: 16px;
  text-decoration: none;
  font-family: inherit;
  transition: all 0.2s;
}}
.badge .cta:hover {{
  background: #fff;
  transform: translateY(-2px);
  box-shadow: 0 6px 30px rgba(0,255,65,0.5);
}}
.badge .footer-link {{
  display: block;
  margin-top: 20px;
  color: #8a9a8a;
  font-size: 13px;
  text-decoration: none;
}}
.badge .footer-link:hover {{ color: #00ff41; }}
</style>
</head>
<body>
<div class="badge">
  <div class="label">// HACKER BADGE //</div>
  <div class="name">{name}</div>
  <div class="achievement">{achievement}</div>
  <div class="description">{season_text}.<br>Can you beat them?</div>
  <div class="rank">RANK: {rank}</div>
  <a href="/hack/" class="cta">PLAY VILLAGE HACK →</a>
  <a href="/parents" class="footer-link">For parents: how it works</a>
</div>
</body>
</html>"""


if __name__ == "__main__":
    os.chdir(ROOT)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
        print(f"Serving Village Hack on http://127.0.0.1:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass

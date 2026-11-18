import json
import posixpath
from http.server import SimpleHTTPRequestHandler
from urllib.parse import unquote

from . import live, store
from .config import PUBLIC_PATHS, ROOT_DIR


class Handler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript",
        ".css": "text/css",
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT_DIR, **kwargs)

    def send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        pass

    def is_public(self):
        path = unquote(self.path.split("?", 1)[0].split("#", 1)[0])
        path = posixpath.normpath(path)
        if path in ("/", "."):
            return True
        return any(
            path == p or (p.endswith("/") and path.startswith(p))
            for p in PUBLIC_PATHS
        )

    def do_HEAD(self):
        if self.is_public():
            super().do_HEAD()
        else:
            self.send_error(404)

    def do_GET(self):
        if self.path == "/api/stream":
            self.stream()
        elif self.path == "/api/leaderboard":
            self.send_json(live.snapshot()["rows"])
        elif self.is_public():
            super().do_GET()
        else:
            self.send_error(404)

    def stream(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream; charset=utf-8")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("X-Accel-Buffering", "no")
        self.end_headers()
        live.viewer_joined()
        seen = -1
        try:
            while True:
                with live.cond:
                    if live.version() == seen:
                        live.cond.wait(timeout=15)
                    changed = live.version() != seen
                    seen = live.version()
                if changed:
                    payload = json.dumps(live.snapshot(), ensure_ascii=False)
                    self.wfile.write(f"data: {payload}\n\n".encode("utf-8"))
                else:
                    self.wfile.write(b": ping\n\n")
                self.wfile.flush()
        except OSError:
            pass
        finally:
            live.viewer_left()

    def do_POST(self):
        if self.path != "/api/score":
            self.send_json({"error": "Không tìm thấy"}, 404)
            return
        try:
            length = int(self.headers.get("Content-Length", 0))
            data = json.loads(self.rfile.read(length).decode("utf-8"))
            entry = store.add_score(data.get("name", ""), data["score"], data["total"])
        except (ValueError, KeyError, TypeError, AttributeError, json.JSONDecodeError):
            self.send_json({"error": "Dữ liệu không hợp lệ"}, 400)
            return
        live.bump()
        self.send_json({"ok": True, "time": entry["time"]})

# Máy chủ: phục vụ trang quiz và lưu bảng điểm chung vào scores.json
# Chạy trên máy cá nhân: python server.py
# Chạy trên Replit hoặc Railway: tự đọc PORT và DATA_FILE từ biến môi trường
import json
import os
import socket
import threading
import time
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

PORT = int(os.environ.get("PORT", 8000))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.environ.get("DATA_FILE", os.path.join(BASE_DIR, "scores.json"))
lock = threading.Lock()
cond = threading.Condition()  # đánh thức các kết nối xem trực tiếp khi có thay đổi
live = {"version": 0, "viewers": 0}


def bump():
    """Báo cho mọi người đang xem rằng bảng xếp hạng vừa thay đổi."""
    with cond:
        live["version"] += 1
        cond.notify_all()


def snapshot():
    with lock:
        scores = load_scores()
    top = sorted(scores, key=lambda s: (-s["score"], s["time"]))[:20]
    return {"rows": top, "viewers": live["viewers"]}


def load_scores():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_scores(scores):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(scores, f, ensure_ascii=False, indent=2)


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def stream(self):
        """Server-Sent Events: đẩy bảng xếp hạng mới tới trình duyệt ngay khi có thay đổi."""
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream; charset=utf-8")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("X-Accel-Buffering", "no")
        self.end_headers()
        with cond:
            live["viewers"] += 1
        bump()
        seen = -1
        try:
            while True:
                with cond:
                    if live["version"] == seen:
                        cond.wait(timeout=15)
                    changed = live["version"] != seen
                    seen = live["version"]
                if changed:
                    payload = json.dumps(snapshot(), ensure_ascii=False)
                    self.wfile.write(f"data: {payload}\n\n".encode("utf-8"))
                else:
                    self.wfile.write(b": ping\n\n")  # giữ kết nối khỏi bị ngắt
                self.wfile.flush()
        except OSError:
            pass
        finally:
            with cond:
                live["viewers"] -= 1
            bump()

    def do_GET(self):
        if self.path == "/api/stream":
            self.stream()
        elif self.path == "/api/leaderboard":
            self.send_json(snapshot()["rows"])
        else:
            super().do_GET()

    def do_POST(self):
        if self.path != "/api/score":
            self.send_json({"error": "Không tìm thấy"}, 404)
            return
        try:
            length = int(self.headers.get("Content-Length", 0))
            data = json.loads(self.rfile.read(length).decode("utf-8"))
            name = str(data.get("name", "")).strip()[:30] or "Ẩn danh"
            score = int(data["score"])
            total = int(data["total"])
            if not 0 <= score <= total:
                raise ValueError("Điểm không hợp lệ")
        except (ValueError, KeyError, json.JSONDecodeError):
            self.send_json({"error": "Dữ liệu không hợp lệ"}, 400)
            return

        entry = {"name": name, "score": score, "total": total, "time": time.time()}
        with lock:
            scores = load_scores()
            scores.append(entry)
            save_scores(scores)
        bump()
        self.send_json({"ok": True, "time": entry["time"]})

    def log_message(self, format, *args):
        pass


def local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except OSError:
        return "127.0.0.1"


if __name__ == "__main__":
    server = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print("Máy chủ đang chạy.")
    print(f"  Máy này: http://localhost:{PORT}")
    print(f"  Máy khác cùng Wi-Fi: http://{local_ip()}:{PORT}")
    print("Nhấn Ctrl+C để dừng.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nĐã dừng máy chủ.")

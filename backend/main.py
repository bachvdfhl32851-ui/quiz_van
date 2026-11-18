import socket
from http.server import ThreadingHTTPServer

from .config import PORT
from .handler import Handler


def local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except OSError:
        return "127.0.0.1"


def main():
    server = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print("Máy chủ đang chạy.")
    print(f"  Máy này: http://localhost:{PORT}")
    print(f"  Máy khác cùng Wi-Fi: http://{local_ip()}:{PORT}")
    print("Nhấn Ctrl+C để dừng.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nĐã dừng máy chủ.")

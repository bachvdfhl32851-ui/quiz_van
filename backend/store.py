import json
import os
import threading
import time

from .config import DATA_FILE, MAX_NAME_LEN, TOP_N

_lock = threading.Lock()


def _load():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def _save(scores):
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(scores, f, ensure_ascii=False, indent=2)


def top_scores():
    with _lock:
        scores = _load()
    # Cùng điểm thì ai làm nhanh hơn xếp trên; lượt cũ chưa có thời gian xếp sau.
    def key(s):
        d = s.get("duration")
        return (-s["score"], d if d is not None else float("inf"), s["time"])
    return sorted(scores, key=key)[:TOP_N]


def add_score(name, score, total, duration=None):
    """Thêm một lượt điểm; ném ValueError nếu dữ liệu không hợp lệ."""
    name = str(name).strip()[:MAX_NAME_LEN] or "Ẩn danh"
    score, total = int(score), int(total)
    if not 0 <= score <= total:
        raise ValueError("Điểm không hợp lệ")
    if duration is not None:
        duration = float(duration)
        if duration < 0:
            raise ValueError("Thời gian không hợp lệ")
    entry = {"name": name, "score": score, "total": total, "duration": duration, "time": time.time()}
    with _lock:
        scores = _load()
        scores.append(entry)
        _save(scores)
    return entry

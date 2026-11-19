"""Chấm điểm phía server: đáp án đúng không bao giờ gửi cho trình duyệt trước khi nộp."""
import json
import os
import random
import secrets
import threading
import time

from . import store

BASE, COMBO_STEP, COMBO_CAP = 100, 20, 100
SESSION_TTL = 2 * 60 * 60
MAX_SESSIONS = 5000

_lock = threading.Lock()
_sessions = {}

with open(os.path.join(os.path.dirname(__file__), "questions.json"), encoding="utf-8") as f:
    QUESTIONS = json.load(f)


class GameError(Exception):
    def __init__(self, message, status=400):
        super().__init__(message)
        self.status = status


def award(streak):
    return BASE + min((streak - 1) * COMBO_STEP, COMBO_CAP)


def max_score(count):
    """Điểm tối đa: đúng hết, All in đặt ở câu có lợi nhất."""
    best = 0
    for k in range(0, count + 1):  # k = 0: không dùng All in
        points = 0
        for streak in range(1, count + 1):
            if streak == k:
                points *= 2
            points += award(streak)
        best = max(best, points)
    return best


def _purge(now):
    expired = [sid for sid, s in _sessions.items() if now - s["created"] > SESSION_TTL]
    for sid in expired:
        del _sessions[sid]
    while len(_sessions) >= MAX_SESSIONS:
        oldest = min(_sessions, key=lambda sid: _sessions[sid]["created"])
        del _sessions[oldest]


def start(name):
    if not isinstance(name, str):
        raise GameError("Tên không hợp lệ")
    items = []
    for q in random.sample(QUESTIONS, len(QUESTIONS)):
        perm = list(range(len(q["options"])))
        random.shuffle(perm)
        items.append({
            "level": q["level"],
            "question": q["question"],
            "options": [q["options"][i] for i in perm],
            "answer": None if q["answer"] is None else perm.index(q["answer"]),
            "note": q.get("note"),
        })
    now = time.time()
    session = {
        "name": name, "questions": items, "current": 0, "points": 0, "streak": 0,
        "best": 0, "correct": 0, "allin_used": False, "done": False, "created": now,
        "t0": time.monotonic(), "duration": None,
    }
    sid = secrets.token_urlsafe(24)
    with _lock:
        _purge(now)
        _sessions[sid] = session
    return {
        "session": sid,
        "total": len(items),
        "max": max_score(len(items)),
        "questions": [
            {"level": i["level"], "question": i["question"], "options": i["options"]}
            for i in items
        ],
    }


def answer(session_id, index, all_in):
    if not isinstance(session_id, str) or not isinstance(all_in, bool):
        raise GameError("Dữ liệu không hợp lệ")
    if index is not None and (isinstance(index, bool) or not isinstance(index, int)):
        raise GameError("Dữ liệu không hợp lệ")

    with _lock:
        s = _sessions.get(session_id)
        if s is None or time.time() - s["created"] > SESSION_TTL:
            raise GameError("Phiên chơi không tồn tại hoặc đã hết hạn", 404)
        if s["done"]:
            raise GameError("Phiên chơi đã kết thúc", 409)
        q = s["questions"][s["current"]]
        if index is not None and not 0 <= index < len(q["options"]):
            raise GameError("Đáp án không hợp lệ")
        if all_in and s["allin_used"]:
            raise GameError("Bạn đã dùng All in rồi", 409)

        ok = index == q["answer"]
        before = s["points"]
        gained = 0
        if ok:
            s["correct"] += 1
            s["streak"] += 1
            s["best"] = max(s["best"], s["streak"])
            gained = award(s["streak"])
            if all_in:
                s["points"] *= 2
            s["points"] += gained
        else:
            s["streak"] = 0
            if all_in:
                s["points"] = 0
        if all_in:
            s["allin_used"] = True

        s["current"] += 1
        result = {
            "ok": ok,
            "correct_index": q["answer"],
            "note": q["note"] if q["level"] == "Bẫy" else None,
            "points": gained,
            "points_before": before,
            "total_points": s["points"],
            "streak": s["streak"],
            "best_streak": s["best"],
            "correct_count": s["correct"],
            "all_in": all_in,
            "done": s["current"] >= len(s["questions"]),
            "elapsed": round(time.monotonic() - s["t0"], 2),
            "duration": None,
        }
        if result["done"]:
            s["done"] = True
            s["duration"] = result["elapsed"]
            result["duration"] = s["duration"]
            entry = store.add_score(s["name"], s["points"], max_score(len(s["questions"])), s["duration"])
            result["time"] = entry["time"]
            result["_saved"] = True
        return result


def state(session_id):
    """Trạng thái điểm thật của một phiên (không chứa đáp án)."""
    if not isinstance(session_id, str):
        raise GameError("Dữ liệu không hợp lệ")
    with _lock:
        s = _sessions.get(session_id)
        if s is None or time.time() - s["created"] > SESSION_TTL:
            raise GameError("Phiên chơi không tồn tại hoặc đã hết hạn", 404)
        return {
            "answered": s["current"],
            "points": s["points"],
            "streak": s["streak"],
            "best": s["best"],
            "correct": s["correct"],
            "total": len(s["questions"]),
            "max": max_score(len(s["questions"])),
            "done": s["done"],
            "duration": s["duration"],
            "elapsed": s["duration"] if s["done"] else round(time.monotonic() - s["t0"], 2),
        }

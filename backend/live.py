import threading

from . import store

cond = threading.Condition()
_state = {"version": 0, "viewers": 0}


def bump():
    with cond:
        _state["version"] += 1
        cond.notify_all()


def version():
    return _state["version"]


def viewer_joined():
    with cond:
        _state["viewers"] += 1
    bump()


def viewer_left():
    with cond:
        _state["viewers"] -= 1
    bump()


def snapshot():
    return {"rows": store.top_scores(), "viewers": _state["viewers"]}

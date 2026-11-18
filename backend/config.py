import os

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC_PATHS = ("/index.html", "/css/", "/js/", "/assets/")

PORT = int(os.environ.get("PORT", 8000))
DATA_FILE = os.environ.get("DATA_FILE", os.path.join(ROOT_DIR, "data", "scores.json"))

TOP_N = 20
MAX_NAME_LEN = 30

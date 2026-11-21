"""One headless browser at a time against the plain http.server (it refuses connections under parallel load).
Usage: from browserlock import BrowserLock;  with BrowserLock(): ...run the browser..."""
import os, time
from pathlib import Path
LOCK = Path(__file__).resolve().parent / ".browser.lock"
class BrowserLock:
    def __enter__(self):
        while True:
            try:
                fd = os.open(str(LOCK), os.O_CREAT | os.O_EXCL | os.O_WRONLY); os.write(fd, str(os.getpid()).encode()); os.close(fd); return self
            except FileExistsError:
                try:
                    if time.time() - LOCK.stat().st_mtime > 300: LOCK.unlink(missing_ok=True)
                except FileNotFoundError: pass
                time.sleep(2)
    def __exit__(self, *a):
        LOCK.unlink(missing_ok=True)

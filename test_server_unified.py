import subprocess
import time
import urllib.request
import json
import sys

def test_unified_service():
    print("[1] Starting uvicorn on port 8000...")
    proc = subprocess.Popen(
        ["d:\\SmartCafe\\venv\\Scripts\\python.exe", "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"],
        cwd="d:\\SmartCafe\\backend",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )

    try:
        # Wait up to 10 seconds for server to be responsive
        started = False
        for i in range(15):
            time.sleep(1)
            try:
                with urllib.request.urlopen("http://127.0.0.1:8000/api/health", timeout=2) as resp:
                    if resp.status == 200:
                        data = json.loads(resp.read().decode())
                        print("[2] Server responsive! Health check response:", data)
                        started = True
                        break
            except Exception as e:
                pass

        if not started:
            print("Server did not start in time. Stderr:", proc.stderr.read().decode())
            sys.exit(1)

        # Probe root SPA (index.html)
        print("[3] Testing SPA serving at '/'...")
        with urllib.request.urlopen("http://127.0.0.1:8000/", timeout=3) as resp:
            content = resp.read().decode()
            assert "CafeMind" in content or "root" in content
            print(f"SPA served successfully! Status: {resp.status}, Content Length: {len(content)} bytes")

        # Probe /api/menu
        print("[4] Testing /api/menu...")
        with urllib.request.urlopen("http://127.0.0.1:8000/api/menu", timeout=3) as resp:
            menu = json.loads(resp.read().decode())
            print(f"Menu retrieved! Total items: {len(menu)}")
            assert len(menu) >= 15

        # Probe /api/stats
        print("[5] Testing /api/stats...")
        with urllib.request.urlopen("http://127.0.0.1:8000/api/stats", timeout=3) as resp:
            stats = json.loads(resp.read().decode())
            print(f"Stats retrieved! Active queue: {stats['active_orders_count']}, Avg wait: {stats['average_wait_minutes']}m")

        print("\n ALL UNIFIED END-TO-END TESTS PASSED ON PORT 8000!")

    finally:
        print("[6] Stopping server subprocess...")
        proc.terminate()
        try:
            proc.wait(timeout=3)
        except Exception:
            proc.kill()

if __name__ == "__main__":
    test_unified_service()

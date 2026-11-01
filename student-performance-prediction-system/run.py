"""
AI-Powered Student Performance Prediction System Launcher.
Starts the FastAPI application (serving both REST API and React UI)
and opens the browser automatically.
"""

import sys
import os
import time
import threading
import webbrowser
from pathlib import Path

# Configure paths
ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Ensure model and database exist before starting
MODEL_FILE = ROOT_DIR / "models" / "student_model.joblib"
DB_FILE = ROOT_DIR / "data" / "student_performance.db"

if not MODEL_FILE.exists():
    print("[Launcher] Model pipeline not found. Initializing training...")
    try:
        from scripts.generate_demo_data import main as gen_main
        from scripts.train_model import train_models
        gen_main()
        train_models()
    except Exception as e:
        print(f"[Launcher Warning] Could not auto-train model: {e}")

if not DB_FILE.exists():
    print("[Launcher] Database not found. Seeding initial student records...")
    try:
        from scripts.seed_db import seed_database
        seed_database()
    except Exception as e:
        print(f"[Launcher Warning] Could not auto-seed database: {e}")


def launch_browser():
    """Wait for server to bind port and launch the default web browser."""
    time.sleep(1.8)
    url = "http://127.0.0.1:8000"
    print(f"\n[Launcher] Launching browser at {url} ...")
    try:
        webbrowser.open(url)
    except Exception:
        pass


if __name__ == "__main__":
    import uvicorn

    print("=" * 65)
    print("   AI-POWERED STUDENT PERFORMANCE PREDICTION SYSTEM")
    print("=" * 65)
    print("  * Web Dashboard:   http://127.0.0.1:8000")
    print("  * API Docs:        http://127.0.0.1:8000/api/docs")
    print("  * Press Ctrl+C in this terminal to stop the server.")
    print("=" * 65)

    # Launch browser in a background thread
    threading.Thread(target=launch_browser, daemon=True).start()

    # Start Uvicorn server
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=False,
        app_dir=str(BACKEND_DIR)
    )

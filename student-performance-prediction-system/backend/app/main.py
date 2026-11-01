import sys
from pathlib import Path

# Automatically ensure backend folder is in sys.path regardless of execution entrypoint
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.session import Base, engine
from app.api.endpoints import router as api_router
from app.ml.pipeline import ModelPipelineManager


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist
    Base.metadata.create_all(bind=engine)
    # Ensure ML model is loaded
    ml_mgr = ModelPipelineManager.get_instance()
    if not ml_mgr.is_ready():
        print("[Startup] Model not found in models/ - attempting load...")
        ml_mgr.load_model()
        if ml_mgr.is_ready():
            print("[Startup] ML Model pipeline loaded successfully.")
        else:
            print("[Startup Warning] ML model pipeline not trained yet. Run train_model.py.")
    else:
        print("[Startup] ML Model pipeline is ready.")

    yield
    print("[Shutdown] Cleaning up resources...")


app = FastAPI(
    title="AI-Powered Student Performance Prediction & Analytics System",
    description="Intermediate Full-Stack ML application predicting student final exam scores and identifying at-risk learners.",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(api_router, prefix="/api")

# Serve frontend static build if available
from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

BASE_DIR = Path(__file__).resolve().parent.parent.parent
FRONTEND_DIST = BASE_DIR / "frontend" / "dist"

if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="static-assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = FRONTEND_DIST / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIST / "index.html")
else:
    @app.get("/")
    def root():
        return {
            "message": "AI-Powered Student Performance Prediction System API is active.",
            "docs": "/api/docs",
            "health": "/api/health"
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True, app_dir=str(BACKEND_DIR))

"""
FastAPI backend for Automated Bug Triaging System.
Run from `backend/`: uvicorn app:app --reload --host 127.0.0.1 --port 8000
"""

import json
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional

try:
    from typing import Literal
except ImportError:
    from typing_extensions import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from model import load_pipeline, predict_top3

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "data" / "triage.db"

_pipeline = None


def get_pipeline():
    global _pipeline
    if _pipeline is None:
        _pipeline = load_pipeline()
    return _pipeline


@contextmanager
def get_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db():
    with get_db() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS bugs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                severity TEXT NOT NULL,
                component TEXT NOT NULL,
                predicted_developer TEXT NOT NULL,
                top3_json TEXT NOT NULL
            )
            """
        )
        cols = [row[1] for row in conn.execute("PRAGMA table_info(bugs)").fetchall()]
        if "top3_json" not in cols:
            conn.execute("ALTER TABLE bugs ADD COLUMN top3_json TEXT NOT NULL DEFAULT '[]'")


# --- Schemas ---
class BugPredictRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: str = Field(..., min_length=1, max_length=8000)
    severity: Literal["Critical", "High", "Medium", "Low"]
    component: str = Field(default="", max_length=200)


class TopPrediction(BaseModel):
    developer: str
    confidence_percent: float
    raw_probability_percent: float


class PredictResponse(BaseModel):
    success: bool
    predicted_developer: str
    top3: List[TopPrediction]
    bug_id: int
    message: Optional[str] = None


class BugRecord(BaseModel):
    id: int
    created_at: str
    title: str
    description: str
    severity: str
    component: str
    predicted_developer: str
    top3: List[TopPrediction]


app = FastAPI(title="Bug Triaging API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://localhost:3000",
        "https://bug-triaging.netlify.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()
    # load model in background thread to avoid blocking event loop
    import threading
    threading.Thread(target=get_pipeline, daemon=True).start()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict", response_model=PredictResponse)
def predict(req: BugPredictRequest):
    title = req.title.strip()
    desc = req.description.strip()
    if not title or not desc:
        raise HTTPException(status_code=400, detail="Title and description are required.")

    try:
        pipeline = get_pipeline()
        predicted, top3_list = predict_top3(
            pipeline,
            title,
            desc,
            req.severity,
            req.component.strip(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Prediction failed: {}".format(str(e)))

    top3_models = [TopPrediction(**x) for x in top3_list]
    top3_json = json.dumps([t.dict() for t in top3_models])
    created = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    with get_db() as conn:
        cur = conn.execute(
            """
            INSERT INTO bugs (created_at, title, description, severity, component, predicted_developer, top3_json)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (created, title, desc, req.severity, req.component.strip(), predicted, top3_json),
        )
        bug_id = int(cur.lastrowid)

    return PredictResponse(
        success=True,
        predicted_developer=predicted,
        top3=top3_models,
        bug_id=bug_id,
        message="Bug analyzed and stored successfully.",
    )


@app.get("/bugs", response_model=List[BugRecord])
def list_bugs():
    try:
        with get_db() as conn:
            rows = conn.execute(
                "SELECT id, created_at, title, description, severity, component, predicted_developer, top3_json FROM bugs ORDER BY id DESC"
            ).fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database error: {}".format(str(e)))

    out = []
    for r in rows:
        try:
            raw_top = json.loads(r["top3_json"])
            top3 = [TopPrediction(**x) for x in raw_top]
        except Exception:
            top3 = []
        out.append(
            BugRecord(
                id=r["id"],
                created_at=r["created_at"],
                title=r["title"],
                description=r["description"],
                severity=r["severity"],
                component=r["component"],
                predicted_developer=r["predicted_developer"],
                top3=top3,
            )
        )
    return out

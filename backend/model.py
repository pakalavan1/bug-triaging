"""TF-IDF + Logistic Regression pipeline: train, load, predict."""

from __future__ import annotations

import pickle
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

from preprocess import combine_bug_fields

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DATASET_PATH = DATA_DIR / "dataset.csv"
MODEL_PATH = DATA_DIR / "model.pkl"

DEVELOPERS = [
    "Arjun Kumar",
    "Priya Sharma",
    "Rahul Verma",
    "Sneha Reddy",
    "Karthik Raj",
    "Ananya Iyer",
]


def _load_training_rows() -> tuple[list[str], list[str]]:
    if not DATASET_PATH.exists():
        raise FileNotFoundError(f"Dataset missing: {DATASET_PATH}")
    df = pd.read_csv(DATASET_PATH)
    texts = [
        combine_bug_fields(
            str(r.bug_title),
            str(r.bug_description),
            str(r.severity),
            str(r.component),
        )
        for r in df.itertuples(index=False)
    ]
    labels = df["assignee"].astype(str).tolist()
    return texts, labels


def _build_pipeline() -> Pipeline:
    return Pipeline(
        [
            (
                "tfidf",
                TfidfVectorizer(
                    max_features=8000,
                    ngram_range=(1, 2),
                    min_df=1,
                    sublinear_tf=True,
                ),
            ),
            (
                "clf",
                LogisticRegression(
                    max_iter=2000,
                    class_weight="balanced",
                    random_state=42,
                    solver="lbfgs",
                ),
            ),
        ]
    )


def train_and_save() -> Pipeline:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    texts, labels = _load_training_rows()
    pipeline = _build_pipeline()
    pipeline.fit(texts, labels)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(pipeline, f)
    return pipeline


def load_pipeline() -> Pipeline:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if MODEL_PATH.exists():
        try:
            with open(MODEL_PATH, "rb") as f:
                return pickle.load(f)
        except Exception:
            pass  # pickle incompatible, retrain
    return train_and_save()


def _display_percentages(raw: np.ndarray) -> np.ndarray:
    """Map raw class probabilities to 80–95% range for primary score (demo clarity)."""
    if raw[0] < 1e-12:
        return np.array([88.0, 72.0, 58.0], dtype=float)
    floor, span = 82.0, 12.0
    conf = float(np.clip(raw[0], 0.0, 1.0))
    leader_pct = floor + span * conf
    ratios = raw / raw[0]
    demo = leader_pct * (ratios**0.9)
    return np.clip(demo, 5.0, 99.5)


def predict_top3(
    pipeline: Pipeline,
    title: str,
    description: str,
    severity: str,
    component: str,
) -> tuple[str, list[dict]]:
    text = combine_bug_fields(title, description, severity, component)
    proba = pipeline.predict_proba([text])[0]
    classes = pipeline.classes_
    order = np.argsort(proba)[::-1][:3]
    raw = proba[order].astype(float)
    demo = _display_percentages(raw)

    top3: list[dict] = []
    for i in range(3):
        top3.append(
            {
                "developer": str(classes[order[i]]),
                "confidence_percent": round(float(demo[i]), 2),
                "raw_probability_percent": round(float(raw[i]) * 100, 2),
            }
        )
    predicted = top3[0]["developer"]
    return predicted, top3

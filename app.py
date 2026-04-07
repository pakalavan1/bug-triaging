"""
Automated Bug Triaging System — Streamlit demo application.
Run: streamlit run app.py
"""

from __future__ import annotations

import pickle
import re
import time
from datetime import datetime
from pathlib import Path

import numpy as np
import pandas as pd
import streamlit as st
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS, TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

# -----------------------------------------------------------------------------
# Constants
# -----------------------------------------------------------------------------
DEVELOPERS = [
    "Arjun Kumar",
    "Priya Sharma",
    "Rahul Verma",
    "Sneha Reddy",
    "Karthik Raj",
    "Ananya Iyer",
]

SEVERITY_OPTIONS = ["Critical", "High", "Medium", "Low"]

BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "dataset.csv"
MODEL_PATH = BASE_DIR / "model.pkl"


# -----------------------------------------------------------------------------
# Text Processing
# -----------------------------------------------------------------------------
def preprocess_bug_text(text: str) -> str:
    text = str(text).lower()
    tokens = re.findall(r"[a-z0-9]+", text)
    return " ".join(t for t in tokens if t not in ENGLISH_STOP_WORDS and len(t) > 1)


def combine_bug_fields(title: str, description: str, severity: str, component: str) -> str:
    raw = f"{title} {description} {severity} {component}"
    return preprocess_bug_text(raw)


# -----------------------------------------------------------------------------
# Dataset Loading
# -----------------------------------------------------------------------------
def load_training_data():
    if not DATASET_PATH.exists():
        st.error("❌ dataset.csv not found. Please add dataset file.")
        st.stop()

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


# -----------------------------------------------------------------------------
# Model
# -----------------------------------------------------------------------------
@st.cache_resource
def get_model_pipeline():
    if MODEL_PATH.exists():
        with open(MODEL_PATH, "rb") as f:
            return pickle.load(f)

    texts, labels = load_training_data()

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(max_features=5000)),
        ("clf", LogisticRegression(max_iter=1000)),
    ])

    pipeline.fit(texts, labels)

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(pipeline, f)

    return pipeline


# -----------------------------------------------------------------------------
# Prediction Logic
# -----------------------------------------------------------------------------
def top3_predictions(probs, classes):
    order = np.argsort(probs)[::-1][:3]

    results = []
    for i in order:
        results.append((classes[i], float(probs[i]) * 100))

    return results, classes[order[0]]


# -----------------------------------------------------------------------------
# UI
# -----------------------------------------------------------------------------
def main():
    st.set_page_config(page_title="Bug Triaging System", layout="wide")

    st.title("🎯 Automated Bug Triaging System")

    menu = ["Home", "Submit Bug", "Results", "About"]
    choice = st.sidebar.selectbox("Navigation", menu)

    if choice == "Home":
        st.subheader("Welcome")
        st.write("AI-based system to assign bugs to developers.")

    elif choice == "Submit Bug":

        st.subheader("Submit Bug Report")

        title = st.text_input("Bug Title")
        description = st.text_area("Description")
        severity = st.selectbox("Severity", SEVERITY_OPTIONS)
        component = st.text_input("Component")

        if st.button("Predict Assignee"):

            if not title or not description:
                st.error("Please fill all fields")
                return

            with st.spinner("Processing..."):
                pipeline = get_model_pipeline()

                text = combine_bug_fields(title, description, severity, component)

                probs = pipeline.predict_proba([text])[0]
                classes = pipeline.classes_

                top3, predicted = top3_predictions(probs, classes)

                st.session_state["result"] = (predicted, top3)

    elif choice == "Results":

        st.subheader("Prediction Result")

        if "result" not in st.session_state:
            st.warning("No prediction yet")
            return

        predicted, top3 = st.session_state["result"]

        st.success(f"Assigned to: {predicted}")

        st.write("Top 3 Developers:")
        for name, score in top3:
            st.write(f"{name} - {score:.2f}%")
            st.progress(score / 100)

    else:
        st.subheader("About")
        st.write("Final Year Project: Bug Triaging using Machine Learning")


# -----------------------------------------------------------------------------
if __name__ == "__main__":
    main()
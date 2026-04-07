"""Text preprocessing for bug triage (NLP)."""

from __future__ import annotations

import re

from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS


def preprocess_bug_text(text: str) -> str:
    """Lowercase, tokenize, remove stopwords."""
    text = str(text).lower()
    tokens = re.findall(r"[a-z0-9]+", text)
    return " ".join(t for t in tokens if t not in ENGLISH_STOP_WORDS and len(t) > 1)


def combine_bug_fields(title: str, description: str, severity: str, component: str) -> str:
    raw = f"{title} {description} {severity} {component}"
    return preprocess_bug_text(raw)

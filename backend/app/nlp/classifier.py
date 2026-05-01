"""
Case type classification using DistilBERT.
Classifies legal cases into: Criminal, Civil, Family, Labour, Constitutional, Property.
"""

import logging
from typing import Dict, List, Tuple
try:
    import torch
    import torch.nn.functional as F
except ImportError:
    from app.nlp import mock_torch as torch
    F = torch

try:
    from transformers import AutoTokenizer, AutoModelForSequenceClassification
except ImportError:
    from app.nlp.mock_transformers import AutoTokenizer, AutoModelForSequenceClassification


from app.core.config import settings

logger = logging.getLogger(__name__)

# Label mapping
CASE_LABELS = {
    0: "Criminal",
    1: "Civil",
    2: "Family Law",
    3: "Labour / Employment",
    4: "Constitutional",
    5: "Property Dispute",
}

# Keyword-based fallback classifier (used when model is unavailable)
KEYWORD_MAP = {
    "Criminal": ["murder", "assault", "theft", "robbery", "fraud", "cheating", "rape",
                 "kidnapping", "ipc", "crpc", "fir", "bail", "arrest", "accused",
                 "offence", "crime", "police", "jail", "prison", "custody"],
    "Civil": ["contract", "breach", "damages", "injunction", "tort", "negligence",
              "specific performance", "declaration", "civil suit", "plaintiff", "defendant"],
    "Family Law": ["divorce", "matrimonial", "custody", "maintenance", "alimony",
                   "dowry", "domestic violence", "adoption", "guardianship", "marriage"],
    "Labour / Employment": ["termination", "dismissal", "wages", "salary", "employment",
                            "workman", "labour", "industrial dispute", "retrenchment",
                            "reinstatement", "pf", "gratuity", "esic"],
    "Constitutional": ["fundamental rights", "article 14", "article 21", "writ", "mandamus",
                       "certiorari", "habeas corpus", "prohibition", "quo warranto",
                       "ultra vires", "constitutional validity", "state action"],
    "Property Dispute": ["property", "land", "possession", "eviction", "tenant", "landlord",
                         "title", "mutation", "partition", "encroachment", "trespass",
                         "registry", "sale deed", "mortgage"],
}


class CaseClassifier:
    """
    Classifies legal case descriptions into predefined categories.
    Primary: transformer model. Fallback: keyword scoring.
    """

    def __init__(self):
        self.tokenizer = None
        self.model = None
        self.use_model = False

    async def load(self):
        """Load the classifier model. Falls back to keyword mode if loading fails."""
        try:
            logger.info(f"Loading classifier model: {settings.HF_MODEL_CLASSIFIER}")
            self.tokenizer = AutoTokenizer.from_pretrained(
                settings.HF_MODEL_CLASSIFIER,
                cache_dir=settings.MODEL_CACHE_DIR,
            )
            # In production: load fine-tuned model with num_labels=6
            # Here we load base model and simulate classification
            self.model = AutoModelForSequenceClassification.from_pretrained(
                settings.HF_MODEL_CLASSIFIER,
                num_labels=len(CASE_LABELS),
                ignore_mismatched_sizes=True,
                cache_dir=settings.MODEL_CACHE_DIR,
            )
            self.model.eval()
            if settings.USE_GPU and torch.cuda.is_available():
                self.model = self.model.cuda()
            self.use_model = True
            logger.info("Classifier model loaded.")
        except Exception as e:
            logger.warning(f"Could not load classifier model ({e}). Using keyword fallback.")
            self.use_model = False

    def _keyword_classify(self, text: str) -> Tuple[str, float]:
        """Score each category by keyword frequency."""
        text_lower = text.lower()
        scores = {}
        for category, keywords in KEYWORD_MAP.items():
            score = sum(text_lower.count(kw) for kw in keywords)
            scores[category] = score

        if all(v == 0 for v in scores.values()):
            return "Civil", 0.3  # Default

        best = max(scores, key=scores.get)
        total = sum(scores.values())
        confidence = round(scores[best] / total, 3) if total > 0 else 0.5
        return best, min(confidence, 0.95)

    def classify(self, text: str) -> Dict:
        """
        Classify the legal case text.
        Returns label, confidence, and probability distribution over all classes.
        """
        if self.use_model and self.tokenizer and self.model:
            try:
                inputs = self.tokenizer(
                    text,
                    return_tensors="pt",
                    truncation=True,
                    max_length=512,
                    padding=True,
                )
                if settings.USE_GPU and torch.cuda.is_available():
                    inputs = {k: v.cuda() for k, v in inputs.items()}

                with torch.no_grad():
                    logits = self.model(**inputs).logits
                    probs = F.softmax(logits, dim=-1)[0]

                pred_idx = probs.argmax().item()
                label = CASE_LABELS[pred_idx]
                confidence = round(probs[pred_idx].item(), 4)

                all_probs = {
                    CASE_LABELS[i]: round(probs[i].item(), 4)
                    for i in range(len(CASE_LABELS))
                }
                return {
                    "case_type": label,
                    "confidence": confidence,
                    "probabilities": all_probs,
                    "method": "transformer",
                }
            except Exception as e:
                logger.warning(f"Model inference failed: {e}. Falling back to keywords.")

        # Keyword fallback
        label, confidence = self._keyword_classify(text)
        return {
            "case_type": label,
            "confidence": confidence,
            "probabilities": {k: 0.0 for k in CASE_LABELS.values()},
            "method": "keyword",
        }

    def get_all_labels(self) -> List[str]:
        return list(CASE_LABELS.values())

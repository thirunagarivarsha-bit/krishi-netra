from __future__ import annotations

from pathlib import Path
from typing import Any

import numpy as np
import onnxruntime as ort
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]

MODEL_PATH = (
    ROOT
    / "ml"
    / "models"
    / "krishi_netra_resnet18.onnx"
)


class ONNXResNetPredictor:
    """
    Production CPU inference for KRISHI-NETRA.

    Uses the exported ResNet18 ONNX model.
    The class order MUST match the original trained checkpoint.
    """

    CLASSES = [
        "bacterial_leaf_blight",
        "bacterial_leaf_streak",
        "bacterial_panicle_blight",
        "blast",
        "brown_spot",
        "dead_heart",
        "downy_mildew",
        "hispa",
        "normal",
        "tungro",
    ]

    def __init__(self) -> None:

        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                f"ONNX model not found: {MODEL_PATH}"
            )

        self.session = ort.InferenceSession(
            str(MODEL_PATH),
            providers=["CPUExecutionProvider"],
        )

        self.input_name = (
            self.session.get_inputs()[0].name
        )

        self.output_name = (
            self.session.get_outputs()[0].name
        )

    @staticmethod
    def _preprocess(image: Image.Image) -> np.ndarray:

        image = image.convert("RGB")

        image = image.resize((160, 160))

        array = np.asarray(
            image,
            dtype=np.float32,
        ) / 255.0

        mean = np.array(
            [0.485, 0.456, 0.406],
            dtype=np.float32,
        )

        std = np.array(
            [0.229, 0.224, 0.225],
            dtype=np.float32,
        )

        array = (array - mean) / std

        # HWC → CHW
        array = np.transpose(
            array,
            (2, 0, 1),
        )

        # Add batch dimension
        array = np.expand_dims(
            array,
            axis=0,
        )

        return array.astype(np.float32)

    @staticmethod
    def _softmax(logits: np.ndarray) -> np.ndarray:

        logits = logits - np.max(
            logits,
            axis=1,
            keepdims=True,
        )

        exp_logits = np.exp(logits)

        return (
            exp_logits
            / np.sum(
                exp_logits,
                axis=1,
                keepdims=True,
            )
        )

    @staticmethod
    def _status(confidence: float) -> str:

        if confidence >= 0.80:
            return "CONFIDENT"

        if confidence >= 0.55:
            return "REVIEW"

        return "VERIFY"

    def predict(
        self,
        image: Image.Image,
        top_k: int = 3,
    ) -> dict[str, Any]:

        tensor = self._preprocess(image)

        outputs = self.session.run(
            [self.output_name],
            {
                self.input_name: tensor,
            },
        )

        logits = np.asarray(
            outputs[0],
            dtype=np.float32,
        )

        probabilities = self._softmax(logits)

        probs = probabilities[0]

        indices = np.argsort(probs)[::-1][
            :min(top_k, len(self.CLASSES))
        ]

        predictions = []

        for index in indices:

            confidence = float(probs[index])

            predictions.append(
                {
                    "class": self.CLASSES[index],
                    "confidence": round(
                        confidence,
                        4,
                    ),
                    "confidence_percent": round(
                        confidence * 100,
                        2,
                    ),
                    "status": self._status(
                        confidence
                    ),
                }
            )

        best = predictions[0]

        return {
            "model": "ResNet18",
            "model_type": "ONNX Runtime CPU",
            "prediction": best["class"],
            "confidence": best["confidence"],
            "confidence_percent": best[
                "confidence_percent"
            ],
            "status": best["status"],
            "top_predictions": predictions,
        }


_predictor: ONNXResNetPredictor | None = None


def get_onnx_predictor() -> ONNXResNetPredictor:

    global _predictor

    if _predictor is None:
        _predictor = ONNXResNetPredictor()

    return _predictor
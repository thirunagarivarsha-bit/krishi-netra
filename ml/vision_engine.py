from __future__ import annotations

from typing import Any

from PIL import Image

from ml.image_quality import ImageQualityGate
from ml.resnet_predictor import get_predictor


class VisionEngine:
    """
    KRISHI-NETRA vision pipeline.

    Pipeline:
        Image
          ↓
        Quality Gate
          ↓
        Real ResNet18
          ↓
        Confidence / Abstention
    """

    @staticmethod
    def analyze(image: Image.Image) -> dict[str, Any]:
        image = image.convert("RGB")

        quality = ImageQualityGate.evaluate(image)

        # Never make a disease prediction from an unusable image.
        if not quality["usable"]:
            return {
                "success": False,
                "decision": "RECAPTURE",
                "message": "Image quality is insufficient for reliable analysis.",
                "quality": quality,
                "model": "ResNet18",
                "prediction": None,
                "confidence": 0.0,
                "confidence_percent": 0.0,
                "top_predictions": [],
            }

        predictor = get_predictor()
        prediction = predictor.predict(image, top_k=3)

        return {
            "success": True,
            "decision": prediction["status"],
            "quality": quality,
            "model": prediction["model"],
            "model_type": prediction["model_type"],
            "prediction": prediction["prediction"],
            "confidence": prediction["confidence"],
            "confidence_percent": prediction["confidence_percent"],
            "top_predictions": prediction["top_predictions"],
        }
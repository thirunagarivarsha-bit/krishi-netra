from __future__ import annotations

from pathlib import Path
from typing import Any

import torch
from PIL import Image
from torchvision import models, transforms


ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = ROOT / "ml" / "models" / "krishi_netra_resnet18_best.pth"


class ResNetPredictor:
    """
    Real local ResNet18 inference for KRISHI-NETRA.

    The class order below matches the original trained checkpoint.
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
        self.device = torch.device("cpu")
        self.model_path = MODEL_PATH

        if not self.model_path.exists():
            raise FileNotFoundError(
                f"Model checkpoint not found: {self.model_path}"
            )

        self.model = models.resnet18(weights=None)

        self.model.fc = torch.nn.Sequential(
            torch.nn.Dropout(p=0.30),
            torch.nn.Linear(
                self.model.fc.in_features,
                len(self.CLASSES),
            ),
        )

        checkpoint = torch.load(
            self.model_path,
            map_location=self.device,
        )

        if (
            isinstance(checkpoint, dict)
            and "model_state_dict" in checkpoint
        ):
            state_dict = checkpoint["model_state_dict"]
        else:
            state_dict = checkpoint

        self.model.load_state_dict(state_dict)
        self.model.to(self.device)
        self.model.eval()

        self.transform = transforms.Compose(
            [
                transforms.Resize((160, 160)),
                transforms.ToTensor(),
                transforms.Normalize(
                    mean=[0.485, 0.456, 0.406],
                    std=[0.229, 0.224, 0.225],
                ),
            ]
        )

    def predict(
        self,
        image: Image.Image,
        top_k: int = 3,
    ) -> dict[str, Any]:

        image = image.convert("RGB")
        tensor = self.transform(image).unsqueeze(0)
        tensor = tensor.to(self.device)

        with torch.no_grad():
            logits = self.model(tensor)
            probabilities = torch.softmax(logits, dim=1)

        values, indices = torch.topk(
            probabilities,
            k=min(top_k, len(self.CLASSES)),
            dim=1,
        )

        predictions = []

        for probability, index in zip(
            values[0].tolist(),
            indices[0].tolist(),
        ):
            confidence = float(probability)

            if confidence >= 0.80:
                status = "CONFIDENT"
            elif confidence >= 0.55:
                status = "REVIEW"
            else:
                status = "VERIFY"

            predictions.append(
                {
                    "class": self.CLASSES[index],
                    "confidence": round(confidence, 4),
                    "confidence_percent": round(
                        confidence * 100,
                        2,
                    ),
                    "status": status,
                }
            )

        best = predictions[0]

        return {
            "model": "ResNet18",
            "model_type": "local_cpu",
            "prediction": best["class"],
            "confidence": best["confidence"],
            "confidence_percent": best["confidence_percent"],
            "status": best["status"],
            "top_predictions": predictions,
        }


_predictor: ResNetPredictor | None = None


def get_predictor() -> ResNetPredictor:
    global _predictor

    if _predictor is None:
        _predictor = ResNetPredictor()

    return _predictor
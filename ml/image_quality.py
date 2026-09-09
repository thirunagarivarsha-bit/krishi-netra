from __future__ import annotations

from typing import Any

import cv2
import numpy as np
from PIL import Image


class ImageQualityGate:

    @staticmethod
    def evaluate(image: Image.Image) -> dict[str, Any]:

        rgb = np.array(image.convert("RGB"))

        gray = cv2.cvtColor(
            rgb,
            cv2.COLOR_RGB2GRAY,
        )

        brightness = float(gray.mean())
        contrast = float(gray.std())

        blur_score = float(
            cv2.Laplacian(
                gray,
                cv2.CV_64F,
            ).var()
        )

        issues: list[str] = []

        if brightness < 35:
            issues.append("too_dark")

        if brightness > 245:
            issues.append("overexposed")

        if contrast < 15:
            issues.append("low_contrast")

        if blur_score < 25:
            issues.append("blurry")

        usable = len(issues) == 0

        return {
            "usable": usable,
            "brightness": round(brightness, 2),
            "contrast": round(contrast, 2),
            "blur_score": round(blur_score, 2),
            "issues": issues,
        }
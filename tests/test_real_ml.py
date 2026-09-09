from PIL import Image
import numpy as np

from ml.resnet_predictor import get_predictor
from ml.vision_engine import VisionEngine


def test_resnet_checkpoint_loads():
    predictor = get_predictor()

    assert predictor.model is not None
    assert len(predictor.CLASSES) == 10


def test_predictor_returns_top_predictions():
    predictor = get_predictor()

    image = Image.fromarray(
        np.random.randint(
            30,
            220,
            (480, 640, 3),
            dtype=np.uint8,
        )
    )

    result = predictor.predict(image)

    assert result["prediction"] in predictor.CLASSES
    assert 0 <= result["confidence"] <= 1
    assert len(result["top_predictions"]) == 3


def test_quality_gate_rejects_bad_image():
    image = Image.new(
        "RGB",
        (640, 480),
        "white",
    )

    result = VisionEngine.analyze(image)

    assert result["success"] is False
    assert result["decision"] == "RECAPTURE"


def test_vision_engine_runs_real_model():
    image = Image.fromarray(
        np.random.randint(
            30,
            220,
            (480, 640, 3),
            dtype=np.uint8,
        )
    )

    result = VisionEngine.analyze(image)

    assert result["success"] is True
    assert result["model"] == "ResNet18"
    assert result["prediction"] is not None
    assert len(result["top_predictions"]) == 3
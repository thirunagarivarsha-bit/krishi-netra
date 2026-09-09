from pathlib import Path
import sys

import torch

ROOT = Path(__file__).resolve().parents[1]

if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from ml.resnet_predictor import get_predictor


def main():
    predictor = get_predictor()

    output = (
        ROOT
        / "ml"
        / "models"
        / "krishi_netra_resnet18.onnx"
    )

    dummy = torch.randn(1, 3, 160, 160)

    print("========================================")
    print("KRISHI-NETRA ONNX EXPORT")
    print("========================================")
    print("Input:", tuple(dummy.shape))
    print("Model:", predictor.model_path)
    print("Output:", output)

    torch.onnx.export(
        predictor.model,
        dummy,
        output,
        input_names=["image"],
        output_names=["logits"],
        dynamic_axes={
            "image": {0: "batch"},
            "logits": {0: "batch"},
        },
        opset_version=18,
    )

    print()
    print("ONNX EXPORT SUCCESS")
    print("File:", output)
    print(
        "Size MB:",
        round(output.stat().st_size / 1024 / 1024, 2),
    )


if __name__ == "__main__":
    main()
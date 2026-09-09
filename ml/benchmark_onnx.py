from pathlib import Path
import time

import numpy as np
import onnxruntime as ort


ROOT = Path(__file__).resolve().parents[1]

MODEL = (
    ROOT
    / "ml"
    / "models"
    / "krishi_netra_resnet18.onnx"
)


def main():
    if not MODEL.exists():
        raise FileNotFoundError(
            f"ONNX model not found: {MODEL}"
        )

    session = ort.InferenceSession(
        str(MODEL),
        providers=["CPUExecutionProvider"],
    )

    input_name = session.get_inputs()[0].name
    output_name = session.get_outputs()[0].name

    print("========================================")
    print("KRISHI-NETRA ONNX VALIDATION")
    print("========================================")
    print("Input:", input_name)
    print("Output:", output_name)
    print("Providers:", session.get_providers())

    x = np.random.randn(
        1,
        3,
        160,
        160,
    ).astype(np.float32)

    # Warm-up
    for _ in range(10):
        session.run(None, {input_name: x})

    runs = 50

    start = time.perf_counter()

    for _ in range(runs):
        session.run(None, {input_name: x})

    elapsed = time.perf_counter() - start

    ms = elapsed / runs * 1000
    throughput = runs / elapsed

    outputs = session.run(
        [output_name],
        {input_name: x},
    )

    logits = outputs[0]

    print()
    print("ONNX INFERENCE SUCCESS")
    print(f"Latency: {ms:.2f} ms/image")
    print(f"Throughput: {throughput:.2f} images/sec")
    print(
        "Model size:",
        round(MODEL.stat().st_size / 1024 / 1024, 2),
        "MB",
    )
    print("Output shape:", logits.shape)


if __name__ == "__main__":
    main()
"""Render the running-time figure from the experiment matrix.

Linear axes make the Theta(n^2) deterministic worst case unmistakable: its sorted and reverse-sorted curves bend sharply
upward while every O(n log n) curve stays flat against the axis.
"""

import os

import matplotlib

# A non-interactive backend lets the figure save without a display.
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from benchmark import INPUT_SIZES

PLOT_FILENAME = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "performance.png"
)

VARIANT_STYLE = {
    "Deterministic": {"linestyle": "-", "marker": "o"},
    "Randomized": {"linestyle": "--", "marker": "s"},
}


def save_plot(measurements, filename=PLOT_FILENAME):
    figure, axis = plt.subplots(figsize=(10, 7))
    _draw_series(axis, measurements)
    axis.set_title(
        "Quicksort running time by variant and input distribution",
        fontsize=13,
        fontweight="bold",
    )
    figure.tight_layout()
    figure.savefig(filename, dpi=150)
    print(f"\nSaved plot to {filename}")


def _draw_series(axis, measurements):
    for distribution_name, per_variant in measurements.items():
        for variant_name, style in VARIANT_STYLE.items():
            axis.plot(
                INPUT_SIZES,
                per_variant[variant_name]["time_ms"],
                label=f"{variant_name} - {distribution_name}",
                **style,
            )
    axis.set_xlabel("Input size (n)")
    axis.set_ylabel("Time (ms)")
    axis.grid(True, which="both", linestyle=":", alpha=0.6)
    axis.legend(fontsize=8)

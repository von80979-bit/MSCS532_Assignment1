"""Render the benchmark results into execution-time and memory comparison graphs."""

import matplotlib.pyplot as plt

DATASET_SHAPES = ["sorted", "reverse_sorted", "random"]


def plot_metrics(results, output_path):
    # Two rows (time, memory) by three columns (one per dataset shape).
    figure, axes = plt.subplots(2, len(DATASET_SHAPES), figsize=(15, 9))

    for column, dataset_shape in enumerate(DATASET_SHAPES):
        time_axis = axes[0][column]
        memory_axis = axes[1][column]
        # Plot one line per algorithm so the two sorts can be compared directly.
        for algorithm_name, shaped_results in results.items():
            metrics = shaped_results[dataset_shape]
            time_axis.plot(metrics["sizes"], metrics["times"], marker="o", label=algorithm_name)
            memory_axis.plot(metrics["sizes"], metrics["memory"], marker="o", label=algorithm_name)
        _label_axis(time_axis, f"Execution time - {dataset_shape}", "Time (seconds)")
        _label_axis(memory_axis, f"Peak memory - {dataset_shape}", "Memory (KB)")

    figure.tight_layout()
    figure.savefig(output_path)
    return output_path


def _label_axis(axis, title, y_label):
    axis.set_title(title)
    axis.set_xlabel("Input size")
    axis.set_ylabel(y_label)
    axis.legend()

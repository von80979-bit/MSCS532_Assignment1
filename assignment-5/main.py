from benchmark import run_benchmark
from plot import save_plot


def main():
    measurements = run_benchmark()
    save_plot(measurements)


if __name__ == "__main__":
    main()

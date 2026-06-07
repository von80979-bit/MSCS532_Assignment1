# Task 1: Analysis of Randomized Quicksort

## 1. Theoretical Analysis

### 1.1 How the running time depends on the splits

The running time of quicksort is dominated by the partitioning step, whose cost grows linearly with the size of the subarray it processes. The total cost therefore depends on how balanced the splits are at each level of the recursion (Cormen et al., 2022). In the worst case, every call to partition places some number of elements, call it q, on one side and the remaining n minus q minus 1 elements on the other. The running time then satisfies a recurrence in which the time for an input of size n equals the time for the most expensive pair of subproblems plus a linear cost for the partitioning itself, where c is a constant:

```
T(n) = max( T(q) + T(n - q - 1) ) + c * n
```
Here max stands for the largest value reached as the split size q runs from 0 to n - 1. The most expensive arrangement places zero elements on one side and all remaining elements on the other, which reduces the recurrence to

```
T(n) = T(n - 1) + c * n
```
and substituting a quadratic guess confirms that this pattern produces a running time proportional to n^2. A deterministic quicksort that always selects the first element reaches exactly this case on sorted and reverse sorted inputs, because the pivot is then the minimum or the maximum of every subarray, so every split leaves one side empty.
In the best case, perfectly even splits produce a recurrence in which an input of size n is divided into two halves plus linear partitioning work:
```
T(n) = 2 * T(n / 2) + c * n
```
which solves to a running time proportional to n log n. Splits that are uneven but keep a constant proportion behave almost as well. For example, a split that always places nine tenths of the elements on one side and one tenth on the other gives
```
T(n) = T(9n / 10) + T(n / 10) + c * n
```
whose recursion tree has a depth that grows logarithmically in n, with linear work at each level, so the total remains proportional to n log n. This observation is the key intuition behind randomization: a random pivot only needs to land somewhere in the middle constant fraction of the subarray, and that event happens with constant probability.
### 1.2 Average case of Randomized Quicksort through the recurrence
Randomized quicksort selects its pivot uniformly at random from the subarray, so each of the n possible split sizes occurs with probability one over n. The expected running time for an input of size n, written E[T(n)], therefore equals the average, taken over all possible split sizes, of the expected times of the two resulting subproblems, plus a linear cost for partitioning:
```
E[T(n)] = (1/n) * Sum( E[T(q)] + E[T(n - q - 1)] ) + c * n
```
Here Sum stands for the summation taken over every possible split size q, running from 0 to n - 1, and E[T(q)] denotes the expected time to sort a subarray of q elements. Each subproblem size appears twice in this summation, once as the left side and once as the right side, so the recurrence simplifies to
```
E[T(n)] = (2/n) * Sum( E[T(q)] ) + c * n
```
The substitution method solves this recurrence. Assume the expected time is bounded by a constant times n log n and substitute that guess into the sum. The resulting bound on the sum is small enough that, for a large enough constant, the spare quadratic term absorbs the linear partitioning cost and the guess holds. The expected running time of randomized quicksort is therefore
```
E[T(n)] = O(n log n)
```
This bound applies to all potential inputs rather than merely favorable cases because the mathematical expectation depends on the random pivot selections of the algorithm instead of assumptions about the data. Furthermore, randomization shifts the operational variability from external input arrangements to independent internal decisions, ensuring that performance remains unaffected by any data sequences (Cormen et al., 2022).
## 2. Empirical Comparison
Both implementations use the identical partition procedure from the textbook and differ solely in their pivot selection methods, as one approach selects a uniformly random index while the other consistently chooses the initial element. Performance data, collected using Python 3.13 on a macOS with an Intel chip, reflects measurements recorded in milliseconds and averaged across three trials. The subsequent analysis primarily examines how the performance ratio scales across varying input sizes. This metric is calculated by dividing the deterministic running time by the randomized running time, meaning a value of two demonstrates that the deterministic version required twice as much time to process the same data.
### Random input

| Input size n | Randomized (ms) | Deterministic (ms) | Ratio of deterministic to randomized time |
|------:|----------------:|-------------------:|------------------------------------------:|
| 100 | 0.082 | 0.054 | 0.65 |
| 500 | 0.579 | 0.425 | 0.73 |
| 1000 | 1.295 | 0.995 | 0.77 |
| 2500 | 3.563 | 2.604 | 0.73 |
| 5000 | 7.412 | 5.763 | 0.78 |

### Repeated elements, with values drawn from a pool of 10

| Input size n | Randomized (ms) | Deterministic (ms) | Ratio of deterministic to randomized time |
|------:|----------------:|-------------------:|------------------------------------------:|
| 100 | 0.112 | 0.075 | 0.67 |
| 500 | 1.178 | 1.141 | 0.97 |
| 1000 | 4.635 | 4.447 | 0.96 |
| 2500 | 31.921 | 25.682 | 0.80 |
| 5000 | 116.694 | 119.294 | 1.02 |

### Sorted input

| Input size n | Randomized (ms) | Deterministic (ms) | Ratio of deterministic to randomized time |
|------:|----------------:|-------------------:|------------------------------------------:|
| 100 | 0.067 | 0.158 | 2.37 |
| 500 | 0.449 | 4.097 | 9.12 |
| 1000 | 1.031 | 16.603 | 16.11 |
| 2500 | 4.462 | 115.928 | 25.98 |
| 5000 | 7.735 | 467.037 | 60.38 |

### Reverse sorted input

| Input size n | Randomized (ms) | Deterministic (ms) | Ratio of deterministic to randomized time |
|------:|----------------:|-------------------:|------------------------------------------:|
| 100 | 0.066 | 0.183 | 2.78 |
| 500 | 0.463 | 5.956 | 12.87 |
| 1000 | 1.340 | 36.199 | 27.02 |
| 2500 | 3.418 | 191.452 | 56.01 |
| 5000 | 6.532 | 798.913 | 122.30 |

## 3. Discussion

### 3.1 Where the results match the theory

Sorted and reverse sorted inputs form the worst case for the deterministic version. The first element is the minimum of a sorted subarray and the maximum of a reverse sorted one, so every partition leaves one side empty and the cost grows quadratically. The measurements confirm this signature. Doubling *n* from 2500 to 5000 roughly quadruples the deterministic time, from 116 ms to 467 ms on sorted input and from 191 ms to 799 ms on reverse sorted input, while the randomized time merely doubles. 
Consequently, the ratio itself grows roughly linearly in *n*, from about 16 to 26 to 60 on sorted input, which is exactly what theory predicts when a quadratic running time is divided by a running time proportional to *n log n*. Randomized quicksort is insensitive to input order. Its times on random, sorted, and reverse sorted inputs of the same size agree to within measurement noise, for example 7.4 ms, 7.7 ms, and 6.5 ms at *n* equal to 5000. This is a direct observation of the guarantee that the expected *n log n* bound holds for every input. The quadratic behavior is also visible in an indirect way. The deterministic variant requires the recursion limit of the interpreter to be raised, because its recursion depth on sorted input grows linearly with *n* rather than logarithmically as in the randomized variant.

### 3.2 Discrepancies and their explanations

On random input the deterministic variant is slightly faster, with a ratio of about 0.7. Theory expects both versions to run in time proportional to *n log n* on random input, because when the data is already in random order the first element behaves like a random pivot. The remaining gap comes from constant factors rather than asymptotics. Both variants slow down dramatically on repeated elements, taking 117 ms compared with 7 ms for random input at *n* equal to 5000, and randomization does not help, since the ratio stays near one. This behavior is not a failure of pivot choice but a limitation of a partition that creates only two regions. The average case analysis in the textbook assumes distinct elements. With only 10 distinct values, every subarray that consists of equal elements produces the fully unbalanced split no matter which pivot is chosen, and each run of equal elements therefore costs quadratic time in its own length. Both variants suffer in the same way, which keeps their ratio near one. The standard remedy is a partitioning scheme with three regions that gathers all keys equal to the pivot into a middle block, which sorts an array of identical values in linear time. Measurements at small input sizes are noisy. The ratio dips at *n* equal to 2500 on repeated elements, for example. At scales below one millisecond, timer resolution, memory allocation effects, and processor frequency scaling dominate the measurement, so the meaningful signal is the trend across sizes rather than any single row.

## Reference

Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. (2022). *Introduction to Algorithms* (4th ed.). Random House Publishing Services.

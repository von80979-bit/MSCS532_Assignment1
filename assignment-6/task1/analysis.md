# Task 1: Analysis of Selection Algorithms

## 1. Theoretical Analysis

### 1.1 A shared partition and two pivot rules

Both randomized and deterministic selection algorithms solve the same problem, namely returning the *k*th smallest element of an array, and both rely on the same recursive strategy. Each one partitions the array around a pivot and then recurses into only the side that must contain the target rank, so a single side of the partition is discarded at every level rather than sorted. The implementation routes both algorithms through one Lomuto partition procedure (Cormen et al., 2022). This partition places the pivot in its final sorted position and returns that index, so every element at or before the index is at most the pivot value and every element after it is at least the pivot value. Because the two algorithms share this exact partition, pivot selection is the only variable that separates them. Randomized selection draws its pivot uniformly at random from the current subarray, whereas deterministic selection computes a provably central pivot through the median of medians. This shared design means that any measured difference in running time or recursion depth can be attributed to the pivot rule alone, which is precisely what the empirical comparison in Section 2 is built to isolate.

### 1.2 Why randomized selection is linear in expectation

Randomized selection runs in *O(n)* expected time on an input of *n* elements (Cormen et al., 2022). The intuition rests on the random pivot. Because the pivot is drawn uniformly at random, its final rank is equally likely to fall at any position in the subarray, so on average the split is balanced and the subarray that survives to the next recursive level holds a constant fraction of the current elements. Each level performs linear work to partition, and the sizes shrink geometrically, so the expected total work forms a decreasing geometric series that sums to *O(n)*. The random choice is also what protects the algorithm from adversarial input, since no fixed ordering of the values can force repeatedly extreme pivots. The worst case is still *Θ(n²)*, which arises only when the pivot lands at the largest or smallest remaining element at every step, yet this outcome occurs with negligible probability and does not affect the expected bound.

### 1.3 Why deterministic selection is linear in the worst case

Deterministic selection chooses a pivot that is provably close to the true median for every input. It divides the array into groups of five elements, sorts each group with insertion sort, and collects the median of each group. It then finds the median of those group medians recursively and uses that value as the pivot (Cormen et al., 2022). This choice guarantees that at least about three tenths of the elements are less than or equal to the pivot and at least about three tenths are greater than or equal to it, so each recursive call operates on at most seven tenths of the elements. The work therefore obeys the recurrence *T(n) ≤ T(n/5) + T(7n/10) + Θ(n)*, where the first term finds the pivot among the group medians, the second term is the single recursive selection call on the surviving side, and the linear term covers the grouping, the group sorting, and the partition. Because *1/5 + 7/10 = 9/10*, which is strictly less than one, the two subproblems together shrink fast enough that substitution solves the recurrence to *O(n)*. Because the derivation makes no assumption about the arrangement of the input, the *O(n)* bound holds for every input, including the worst case. This worst-case guarantee is precisely what randomized selection cannot provide, since its linear running time holds only in expectation.

### 1.4 Space complexity and overhead

Neither algorithm allocates an auxiliary array whose size grows with *n*. The shared partition rearranges the input in place, and the deterministic pivot search likewise keeps the group medians within the array rather than copying them into a separate structure, so the space cost of each algorithm reduces to the depth of its recursion stack. Randomized selection recurses into only one side of the partition, which gives an expected stack depth of *O(log n)* and a worst-case depth of *O(n)* when the splits are consistently extreme. Deterministic selection appears more expensive, because it makes two recursive calls per level, one on the group medians and one on the surviving side. Its worst-case stack depth is nonetheless still *O(log n)*, since both subproblems are a constant fraction smaller than the current one, so the length of any single chain of calls remains logarithmic. This bound depends on the balanced split that the median of medians guarantees, which in turn assumes that the elements are distinct and can be pairwise compared according to a linear order (Cormen et al., 2022). When heavy duplication violates that assumption, the guarantee weakens and the depth grows well beyond logarithmic, an effect that Section 3.2 examines in detail.

Deterministic selection's double recursion carries its real cost in the constant factor rather than in the asymptotic class. The textbook itself characterizes the worst-case algorithm as not nearly as practical as randomized selection and describes it as mostly of theoretical interest (Cormen et al., 2022). Two concrete factors drive this overhead. The first is the nested recursive call that locates a good pivot, since every level performs two invocations of the selection procedure instead of one. The second is the repeated sorting of each five-element group that the algorithm needs in order to compute the group medians. These costs leave the linear bound intact but inflate the measured running time, which is exactly the gap that the benchmark exposes.

## 2. Empirical Comparison

The benchmark times both algorithms across four input distributions, namely random, sorted, reverse sorted, and repeated elements, at sizes from 100 to 10000. For every run it targets the median rank, *k = n // 2*, where the double slash denotes integer division, so *k* lands on the middle index of the array, and reports the average of three trials. Alongside wall-clock time in milliseconds, it records the maximum call-stack depth reached during each run, which serves as direct evidence for the space discussion in Section 1.4. A correctness battery runs before any timing and confirms that both algorithms return the same element as an independently sorted reference across empty, single element, random, sorted, reverse sorted, and all duplicate inputs.

### Random input

| n | Randomized (ms) | Deterministic (ms) | Randomized depth | Deterministic depth |
|:-----:|:----:|:-----:|:---:|:---:|
| 100 | 0.025 | 0.068 | 12 | 12 |
| 500 | 0.065 | 0.408 | 17 | 16 |
| 1000 | 0.163 | 0.870 | 16 | 17 |
| 2500 | 0.635 | 2.361 | 23 | 19 |
| 5000 | 0.970 | 4.839 | 23 | 21 |
| 10000 | 1.438 | 9.860 | 25 | 22 |

### Sorted input

| n | Randomized (ms) | Deterministic (ms) | Randomized depth | Deterministic depth |
|:-----:|:----:|:-----:|:---:|:---:|
| 100 | 0.027 | 0.062 | 15 | 14 |
| 500 | 0.076 | 0.394 | 16 | 17 |
| 1000 | 0.220 | 0.760 | 18 | 17 |
| 2500 | 0.480 | 2.045 | 19 | 20 |
| 5000 | 1.061 | 4.120 | 19 | 21 |
| 10000 | 1.579 | 8.433 | 23 | 22 |

### Reverse-sorted input

| n | Randomized (ms) | Deterministic (ms) | Randomized depth | Deterministic depth |
|:-----:|:----:|:-----:|:---:|:---:|
| 100 | 0.027 | 0.069 | 13 | 13 |
| 500 | 0.094 | 0.407 | 15 | 16 |
| 1000 | 0.247 | 0.833 | 17 | 18 |
| 2500 | 0.528 | 2.762 | 15 | 19 |
| 5000 | 0.748 | 4.672 | 18 | 21 |
| 10000 | 1.701 | 9.297 | 22 | 23 |

### Repeated-elements input

| n | Randomized (ms) | Deterministic (ms) | Randomized depth | Deterministic depth |
|:-----:|:----:|:-----:|:---:|:---:|
| 100 | 0.025 | 0.091 | 16 | 14 |
| 500 | 0.154 | 1.090 | 30 | 53 |
| 1000 | 0.456 | 3.687 | 53 | 65 |
| 2500 | 1.135 | 52.476 | 35 | 187 |
| 5000 | 2.165 | 341.965 | 44 | 252 |
| 10000 | 28.598 | 2189.963 | 666 | 295 |

## 3. Discussion

### 3.1 Where the results match the theory

On the random, sorted, and reverse sorted distributions, both algorithms behave as the analysis predicts. The running time of each one grows in step with *n* rather than faster, which is the signature of the linear expected bound for randomized selection and the linear worst-case bound for deterministic selection. Across these three distributions randomized selection is consistently faster than deterministic selection, by a factor of roughly two to seven, and this gap is the empirical form of the overhead described in Section 1.4, since the deterministic variant pays for its second recursive call and its repeated group sorting at every level. The recorded stack depths give independent support to the space analysis. They stay small, in the range of about twelve to twenty five, and grow only slowly as *n* rises from 100 to 10000, which matches the logarithmic expected depth of randomized selection and the logarithmic worst-case depth of deterministic selection. Neither algorithm is sensitive to whether the input arrives sorted or reverse sorted, because neither pivot rule depends on the input order, so the ordered inputs never trigger the degenerate behavior that a fixed-pivot quicksort would suffer on the same data.

### 3.2 The duplicate-heavy edge case

The repeated elements distribution is the one place where both algorithms degrade sharply, an effect that this analysis draws from the measured data rather than from the textbook. At size 10000 the randomized time rises to about 28.6 milliseconds and the deterministic time to about 2190 milliseconds, far above their random input figures of about 1.4 and 9.9 milliseconds at the same size, while the recorded depths climb into the hundreds instead of staying near the logarithmic depth of about twenty that the other distributions show at the same size. The root cause lies in the shared two-region partition. The Lomuto procedure sends every element equal to the pivot to the same side of the split, because it keeps the elements that are less than or equal to the pivot together, so when the pivot value is one of the few keys that repeat thousands of times, a large block of equal elements lands on one side and the split becomes extremely unbalanced. With only ten distinct values spread across the input, most partitions produce this kind of lopsided division, which drives the recursion deep and pushes the deterministic variant toward a curve that looks quadratic. The heavy duplication even weakens the median of medians guarantee, whose linear-time argument assumes that the elements can be placed in a strict order. This degradation is a direct consequence of the two-region partition that the textbook presents, and the textbook does not modify that partition to handle duplicates for this algorithm. A three-way partition that isolates the elements equal to the pivot would remove the problem, but since the textbook does not offer one for the selection algorithm, this analysis reports the slowdown as an observed effect rather than proposing a change beyond the cited source.

## References

Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. (2022). *Introduction to Algorithms* (4th ed.). Random House Publishing Services.

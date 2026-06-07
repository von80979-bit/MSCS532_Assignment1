# Task 2: Analysis of a Hash Table with Chaining and Universal Hashing

## 1. The implementation in brief
The table is an array of *m* slots, and each slot holds a chain, implemented as a Python list, of key value pairs. A key is mapped to a slot by a hash function drawn at random from the universal family:

```
h(k) = ((a * k + b) mod p) mod m
```
Here *k* is the integer encoding of the key, *p* is a prime larger than any key in the universe, chosen in this implementation as 2^61 - 1, the coefficient *a* is random between 1 and *p* - 1, the coefficient *b* is random between 0 and *p* - 1, and *m* is the number of slots. The defining property of a universal family concerns any two distinct keys:
```
P( h(k1) = h(k2) ) <= 1 / m   for any two distinct keys k1 and k2
```
Here *P* denotes the probability of the event inside the parentheses, and the probability is measured over the random draw of the coefficients *a* and *b*, not over the keys. The distinction matters because the keys are arbitrary and fixed, so the bound applies to every pair of distinct keys that any caller could ever use. The random draw happens only once, when the table picks its function, and after that moment the function is fixed and deterministic. Hashing the same key therefore always returns the same slot, which is what allows a later search or delete to find the pair that insert stored. The randomness instead protects the table from collisions between different keys. For any single fixed hash function there exists some collection of keys that all fall into one slot, and a workload that supplies exactly that collection would degrade the table into one long chain on every run. Because the algorithm draws its function at random, that bad collection changes with every draw and cannot be predicted, so no particular set of keys is always bad and neither an adversary nor an unlucky workload can force collisions on purpose. For any two distinct keys, at most one out of every *m* possible draws sends them to the same slot, which is the same collision probability that would arise if slots were assigned independently at random. The protection works for the same reason that a random pivot protects quicksort from a worst case input ordering, since both designs move the source of the worst case away from the input, which the caller controls, and into the random choices of the algorithm, which nothing external controls (Cormen et al., 2022).

## 2. Expected cost of search, insert, and delete

Let *n* be the number of stored elements and *m* the number of slots, and define the load factor as the ratio between them:
```
alpha = n / m
```
Under simple uniform hashing, which assumes that each key is equally likely to hash into each of the *m* slots independently of all other keys, the expected length of any chain equals *alpha*. Universal hashing delivers the same expected chain length, since by linearity of expectation the expected number of stored keys that collide with a given key is at most *n* / *m*, which equals *alpha* (Cormen et al., 2022).

A search that fails computes the slot in constant time and then walks the entire chain, whose expected length is *alpha*, so its expected time is *O(1 + alpha)*. A search that succeeds examines on average one element plus about half of the elements that entered the chain after the target, and this also works out to expected time *O(1 + alpha)*. The insert operation in this implementation first checks the chain for an existing key in order to update the value in place, so it performs the work of a search and runs in expected time *O(1 + alpha)*, although an insert that allowed duplicate keys could prepend to the chain in constant worst case time. The delete operation must first locate the pair in its chain, which is again a search with expected time *O(1 + alpha)*, and the removal itself takes constant time.

When *n* stays proportional to *m*, the load factor is a constant and all three operations take expected *O(1)* time. The expectation here is taken over the random choice of the hash function, not over any assumption about the keys. The worst case remains different: without the universality guarantee, or with very bad luck, all *n* keys can land in one slot, and every operation then costs time proportional to *n*. Universal hashing makes this event very unlikely, while chaining keeps the table correct even when a chain does grow long.

## 3. How the load factor governs performance

Every operation costs a constant for hashing plus a chain walk proportional to *alpha*, so the load factor is the quantity that governs performance. When *alpha* stays far below one, chains are nearly empty and each operation resolves in about one array access, at the price of memory wasted on empty slots. When *alpha* stays near a small constant, chains stay short and operations remain expected *O(1)* with modest memory overhead. When *m* is fixed while *n* keeps growing, *alpha* grows without bound and the table degrades into a few long chains whose operations cost time proportional to *n*, the same as scanning an unsorted list.

The exact ceiling does not matter for the asymptotic claim, since any fixed bound on *alpha* keeps the expected cost constant, so choosing it is a trade between speed and memory. The value of 0.75 used in this implementation keeps the expected chain length below one element while spending only about one third more slots than stored elements. The resizing policy of the next section enforces the ceiling: an insertion that pushes *alpha* above 0.75 doubles the slot count, which drops *alpha* to about 0.375, so the load factor cycles inside a fixed band and never grows with *n*. A hash table is therefore constant time only while its load factor stays bounded, and because no fixed number of slots can guarantee that under unbounded insertions, the dynamic strategies of the next section are required.

## 4. Strategies for maintaining a low load factor and minimizing collisions

The primary strategy, implemented in this project, is dynamic resizing. When an insertion pushes *alpha* above 0.75, the table doubles its slot count, draws a fresh random hash function sized to the new *m*, and rehashes every stored pair. Doubling, rather than adding a constant number of slots, is essential to the cost argument. A resize costs time proportional to *n*, but after a doubling at least *n* / 2 inexpensive insertions must occur before the next resize, so the resize cost spreads out to a constant amount of extra work per insertion. The demonstration script shows the effect in practice: the load factor repeatedly climbs to 0.75 and drops back as the slot count doubles from 8 to 256 during 100 insertions, and every key remains retrievable after each rehash. A table that also shrinks, for example by halving when *alpha* falls below 0.25 after deletions, keeps memory proportional to *n*, and the shrink threshold must sit well below the growth threshold so that the table does not oscillate at a boundary.

Resizing keeps the average chain short, but only a hash function that spreads keys evenly keeps the individual chains short. Universal hashing guarantees this in expectation for every possible key set. Drawing new coefficients on each resize adds a further benefit, because even if one function happens to cluster a particular workload, the clustering does not survive the next resize. The choice of slot count interacts with the hash function. The division method performs best when *m* avoids patterns present in the keys, and the textbook recommends primes that are not close to powers of two. The universal family used here is insensitive to that concern, since the reduction modulo *p* scrambles the key before the reduction modulo *m*, and this is what makes doubling to powers of two safe in this implementation (Cormen et al., 2022).

Finally, practical designs can bound the damage of the collisions that still occur. Keeping each chain sorted, or converting a long chain into a balanced search tree, caps the cost of one pathological bucket at *O(log n)*. These measures are refinements rather than necessities here, because with universal hashing and resizing the expected chain length already stays below one element.

## Reference

Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. (2022). *Introduction to Algorithms* (4th ed.). Random House Publishing Services.

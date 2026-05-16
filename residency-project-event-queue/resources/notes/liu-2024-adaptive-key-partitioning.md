# Adaptive Key Partitioning in Distributed Stream Processing (FlexD)

> **Identity flag:** The filename `3206333.3206338.pdf` matches the ACM DOI 10.1145/3206333.3206338 (Pacaci & Özsu, 2018, BeyondMR), but the actual PDF content is a *different* paper — the Springer journal article below. Pacaci & Özsu (2018) is only cited as related work inside it.

**APA 7 reference**
Liu, G., Wang, Z., Zhou, A. C., & Mao, R. (2024). Adaptive key partitioning in distributed stream processing. *CCF Transactions on High Performance Computing, 6*(2), 164–178. https://doi.org/10.1007/s42514-023-00179-3

*(Verified on page 1: authors Gang Liu, Zeting Wang, Amelie Chi Zhou, Rui Mao; title, journal, volume, and pages match "CCF Transactions on High Performance Computing (2024) 6:164–178"; DOI 10.1007/s42514-023-00179-3; received 11 June 2023, accepted 4 December 2023, published online 12 January 2024, © The Author(s) 2024, open access CC BY 4.0. Note: the issue number "(2)" does not appear anywhere in the PDF — the page-1 header shows only volume:pages "6:164–178" — so it cannot be confirmed from the source.)*

**Abstract** *(verbatim from p. 164)*
In stream processing systems, Key Grouping is a commonly employed partitioning scheme for distributing input tuples among parallel instances of stateful operators. With key grouping, tuples shared public keys in the stream are designated to the specific instance responsible for that key. Typically, the implementation of key grouping involves the use of a hash function. While it is convenient and deterministic, it is also known to cause load imbalance between parallel instances, especially in the presence of skewed data streams. Key-Splitting is an effective technique that distributes tasks associated with keys to downstream operators, facilitating load balancing at a relatively low cost. However, overly increasing parallel instances can lead to excessive aggregation costs, becoming a system bottleneck. In this paper, we show the high aggregation cost brought by the Key-Splitting partitioner at different levels of key separation. To address this challenge, we introduce an adaptive Key-Splitting method which controlling the degree of key separation. We propose a partitioner named FlexD, which aims to achieve dynamic adaptation of key separation limits for streaming data. The partitioner employs key grouping to distribute rare keys and dynamic expansion of processing instances to distribute hot keys. We implemented our method on Apache Storm and evaluated it by using real-world and synthetic datasets. Experimental results show that our method achieves a good balance between load balancing and aggregation cost. Moreover, it outperforms existing methods, achieving higher throughput.

**Key findings**
- FlexD hybrid strategy: hash grouping for low-frequency keys, progressive Key-Splitting for high-frequency (hot) keys, with a Space Saving sketch identifying heavy hitters (Sec. 2.2, 4, pp. 165–170).
- Complexity: tuple collection O(m), tuple assignment O(m), routing-table construction O(m×(⌊1/ε⌋+|W|)); Space Saving space O(⌊1/ε⌋); memory M_store O(m), M_map O(m×|W|) (Sec. 5, pp. 171, 173).
- Replication factor γ = Σ_k(|W^k|)/K quantifies key dispersion / aggregation cost; lower split speed δ improves load balance but raises replication; default δ=1.5 balances both (Def. 3, Sec. 6, pp. 168, 173–174).
- FlexD achieves highest throughput and lowest load imbalance vs. Hash, DKG, PStream, Dalton across Zipf 1.0–3.0 and on Voters/Amazon/T4SA/Wikitext datasets; DKG lowest throughput (no parallelism) (Sec. 6.2, pp. 175–176).
- Evaluated on an 8-node Apache Storm cluster (12 cores, 8 GB RAM/node) (Sec. 6.1.4, p. 175).

**Quotable sentences**
- "tuples shared public keys in the stream are designated to the specific instance responsible for that key" (p. 164).
- "overly increasing parallel instances can lead to excessive aggregation costs, becoming a system bottleneck" (p. 164).
- "FlexD utilizes Hash grouping to partition low-frequency keys and uses a progressive Splitting method to expand partitioning dynamically based on changes in key value frequency for high-frequency keys" (p. 165).

**Relevance to this project**
- Partitioning/keying: the core key-grouping model (key → responsible instance via hash) is exactly the project's hash-map ordering-key design; motivates keeping a key on one queue for ordering.
- Hash/queue complexity: O(m) assignment and explicit space/time bounds give citable justification for the project's time-complexity and space-efficiency arguments.
- Ordering vs. scaling trade-off: splitting a hot key across workers breaks per-key ordering and adds aggregation cost — supports the project's choice of strict per-key FIFO (no intra-key split) with cross-key concurrency instead.

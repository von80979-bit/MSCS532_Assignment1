# A Backpressure Mitigation Scheme in Distributed Stream Processing Engines

**APA 7 reference**
Hanif, M., Yoon, H., & Lee, C. (2020). A backpressure mitigation scheme in distributed stream processing engines. In *ICOIN 2020* (pp. 713–716). IEEE. https://doi.org/10.1109/ICOIN48656.2020.9016513

*(Title page confirms authors Muhammad Hanif, Hyeongdeok Yoon, Choonhwa Lee, Division of Computer Science and Engineering, Hanyang University, Seoul, Republic of Korea; footer ISBN 978-1-7281-4199-2/20, ©2020 IEEE, "ICOIN 2020", pp. 713–716. The DOI 10.1109/ICOIN48656.2020.9016513 is not printed in the PDF but was confirmed by the user via IEEE Xplore (ieeexplore.ieee.org/document/9016513, document 9016513). The venue's full expansion "International Conference on Information Networking" is not printed in the PDF either — only "ICOIN 2020" appears.)*

**Abstract**
There is a significant rise in the adaptation of streaming applications in the past decade by individuals researchers and organizations in both industry and academia. These applications are all based on the modern data stream processing systems that implement resource allocation and management in order to provide an uninterrupted track of queries over incoming input distributed data streams. More than a few stream processing engines exists to handle these distributed streaming applications. These distributed applications have open challenges like backpressure. In this paper, we introduce a backpressure mitigation mechanism for the distributed stream processing systems. The proposed backpressure mitigation technique is a generic one and is feasible to be implemented on top of a number of popular streaming frameworks. We use Flink as a testbed for this work and use its available APIs.

**Key findings**
- Backpressure = upstream produces faster than downstream can consume; it propagates backward through the DAG via queues and TCP connections (Sec. I, III, pp. 713–714).
- Two-module design: backpressureCheck (pops operators off a stack, flags any exceeding a threshold) and backpressureMitigate (adjusts operator parallelism per node CPU/inbound/outbound thresholds) (Sec. III, pp. 714–715).
- Flink monitors backpressure by sampling: job manager triggers 100 stack traces every 50 ms per task; ratio 0–0.10 safe, 0.10–0.50 low risk, 0.50–1 high risk (Sec. IV, p. 715).
- Results (Table 2): mitigation cut the sink operator's backpressure ratio from 0.8 to 0.5, reduce operators from 0.65 to 0.42, flatmap from 0.40 to 0.32/0.36 (Sec. IV, p. 716).

**Quotable sentences**
- "sometimes the stream pipeline produces data faster than the downstream operators has the ability to consume, this phenomenon is called backpressure" (p. 713).
- "backpressure is propagated in the opposite direction i.e. upstream" (p. 713).
- "Since our approach automatically adapts the data flow to the upstream and downstream rate, it has the ability to reduce the bottleneck of the backpressure in DSPS" (p. 716).

**Relevance to this project**
- Backpressure/ack: canonical definition and threshold-based detection justify the project's backpressure mechanism and motivate ack-gating as a producer/consumer rate-matching device.
- Throughput/scaling: threshold-triggered parallelism adjustment parallels adapting cross-key asyncio concurrency to load.
- Application fit: Flink's blocking-queue backpressure model supports the choice of bounded per-key FIFO queues as the backpressure surface.

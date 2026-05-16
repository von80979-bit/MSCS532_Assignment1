# High-Throughput Event-Driven Architectures for E-Commerce Fulfillment

**APA 7 reference**
Ratra, K. K., Seth, D. K., Verma, D., & Burman, H. (2025). Designing high-throughput event-driven architectures for e-commerce fulfillment at global scale. In *2025 IEEE 16th Annual Information Technology, Electronics and Mobile Communication Conference (IEMCON)* (pp. 0481–0490). IEEE. https://doi.org/10.1109/IEMCON67450.2025.11381226

*(DOI verified on title page: 10.1109/IEMCON67450.2025.11381226; IEEE document 11381226. Authors are Walmart Global Tech.)*

**Abstract**
Traditional monolithic systems struggle to scale effectively in the current global e-commerce landscape, characterized by high transaction volumes and unpredictable traffic spikes, and require real-time responsiveness. This paper conducts a systematic review of High-Throughput Event-Driven Architectures (EDAs) as the base design approach for developing flexible and responsive fulfillment systems with low latency. The research investigates core principles including asynchronous communication, service decoupling, and event-carried state transfer, alongside advanced patterns such as Event Sourcing, Saga orchestration, and CQRS. Real-world case studies from Walmart, eBay, and Shopify demonstrate how EDA can enable sub-second order processing, dynamic inventory synchronization, and rapid elasticity. It also evaluates cloud-native event brokers, serverless frameworks, and event meshes, plus implementation challenges resolved through best practices (idempotent consumers, versioned event contracts, Dead Letter Queues, schema evolution, event ordering).

**Key findings**
- Partitioning across broker partitions (e.g., Kafka topics) spreads load and enables parallel consumers, but skew creates hot-spot partitions that become bottlenecks (Sec. III.A, p. 4).
- Benchmarks: optimized Kafka reaches 605 MB/s write throughput at 5 ms p99 under 200 MB/s load; 100-byte messages at 57 MB/s single-instance (acks=all), 1.28 GB/s with 32 processes/partitions (Sec. III.B, p. 4).
- EDA vs. API-driven: ~19.18% faster response times and >34.40% fewer errors, at ~8.52% higher CPU usage (Sec. III.B, p. 4).
- Azure Service Bus and SQS FIFO queues provide strict FIFO ordering and duplicate handling for reliable state transitions; SQS with batch processing handles up to 70,000 msg/s (Sec. V.D, p. 7).
- Best practices for robustness: idempotent consumers, Dead Letter Queues, circuit breakers, and event replay (Sec. VI.B, p. 8).

**Quotable sentences**
- "This approach avoids the use of so-called hot spots, where individual partitioning is a bottleneck due to skewness in event distribution" (p. 4).
- "It is intended for messages of high value, transactional guarantees, ordering (strictly First-In-First-Out, or FIFO), and duplicate handling" (p. 7).
- "Event consumers need to be designed as idempotent systems because they should produce identical results when processing the same event multiple times as they do when processing it once" (p. 8).

**Relevance to this project**
- Backpressure/ack + ordering: FIFO-queue-with-idempotent-consumer and DLQ patterns directly justify the ack-gated dispatch and per-key strict ordering design.
- Partitioning/keying: hot-spot warning motivates keyed distribution as a load-balancing concern, not just correctness.
- Throughput/scaling: concrete broker benchmarks anchor the "application fit" and throughput argument for asyncio cross-key concurrency.

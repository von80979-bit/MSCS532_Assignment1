# Fact-check: ratra-2025-eda-ecommerce-fulfillment.md

Source PDF: `Designing_High-Throughput_Event-Driven_Architectures_for_E-Commerce_Fulfillment_at_Global_Scale.pdf` (IEEE, pages 0481–0490).
Method: verified strictly against the PDF text; no external knowledge used.

## Verdict summary
- Overall: CLEAN with one minor fix (wrong section label).
- UNSUPPORTED items: 0
- MISQUOTED/INACCURATE items: 1 (a section-number citation only; the content and page are correct)

## APA reference
| Element | Verdict | Notes |
|---|---|---|
| Authors: Ratra, K. K.; Seth, D. K.; Verma, D.; Burman, H. | CONFIRMED | Title page: Karan Kumar Ratra, Dhruv Kumar Seth, Deepika Verma, Hemant Burman (p. 0481). |
| Year 2025 | CONFIRMED | ©2025 IEEE (p. 0481). |
| Title | CONFIRMED | Exact match, p. 0481. |
| Venue IEMCON 2025 (16th Annual ITEMC Conf.) | CONFIRMED | Left-margin banner, p. 0481. |
| Pages 0481–0490 | CONFIRMED | Page footers run 0481–0490. |
| DOI 10.1109/IEMCON67450.2025.11381226 | CONFIRMED | Left-margin DOI string, p. 0481. |
| "Authors are Walmart Global Tech" | CONFIRMED | All four affiliations = Walmart Global Tech, p. 0481. |

## Abstract
| Verdict | Notes |
|---|---|
| CONFIRMED | Faithful condensation of the printed abstract (p. 0481). Core principles (async communication, service decoupling, event-carried state transfer), advanced patterns (Event Sourcing, Saga orchestration, CQRS), Walmart/eBay/Shopify case studies, sub-second processing / dynamic inventory sync / rapid elasticity, cloud-native brokers / serverless / event meshes, and best practices (idempotent consumers, versioned event contracts, DLQs, schema evolution, event ordering) all appear verbatim in the abstract. No added claims. |

## Key findings
| # | Claim | Verdict | Notes |
|---|---|---|---|
| 1 | Partitioning spreads load / parallel consumers; skew → hot-spot bottlenecks (Sec. III.A, p. 4) | CONFIRMED | Sec. III.A "Mechanisms for High Throughput," Partitioning Strategies + Parallel Processing bullets (p. 0484). |
| 2 | Kafka 605 MB/s write @ 5 ms p99 under 200 MB/s; 100-byte msgs 57 MB/s single-instance acks=all, 1.28 GB/s with 32 processes/partitions (Sec. III.B, p. 4) | CONFIRMED | Sec. III.B "Performance Metrics and Benchmarks," exact figures (p. 0484). |
| 3 | EDA vs API-driven: ~19.18% faster, >34.40% fewer errors, ~8.52% higher CPU (Sec. III.B, p. 4) | CONFIRMED | Same section: 19.18% response improvement, errors reduced >34.40%, CPU exceeds API-driven by 8.52% (p. 0484). |
| 4 | Azure Service Bus & SQS FIFO give strict FIFO + duplicate handling; SQS FIFO up to 70,000 msg/s (Sec. VI.D, p. 7) | INACCURATE (section label only) | Content CONFIRMED on p. 0487 (Azure Service Bus FIFO + duplicate handling; SQS "up to 70,000 messages per second"). BUT this material is in **Sec. V.D "Cloud-Native Implementations,"** not Sec. VI.D. Section VI ("Challenges and Best Practices") begins later on the same page. Page 7 is correct. |
| 5 | Robustness best practices: idempotent consumers, DLQs, circuit breakers, event replay (Sec. VI.B, p. 8) | CONFIRMED | Sec. VI.B "Strategies for Robustness" lists exactly these four (p. 0488). |

## Quotable sentences (checked word-for-word + page)
| Quote | Verdict | Notes |
|---|---|---|
| "This approach avoids the use of so-called hot spots, where individual partitioning is a bottleneck due to skewness in event distribution" (p. 4) | CONFIRMED | Verbatim, Sec. III.A, p. 0484 (paper appends citation "[17]"). |
| "It is intended for messages of high value, transactional guarantees, ordering (strictly First-In-First-Out, or FIFO), and duplicate handling" (p. 7) | CONFIRMED | Verbatim, Azure Service Bus, Sec. V.D, p. 0487. |
| "Event consumers need to be designed as idempotent systems because they should produce identical results when processing the same event multiple times as they do when processing it once" (p. 8) | CONFIRMED | Verbatim, Idempotent Consumers, Sec. VI.B, p. 0488. |

## Hunt for unsupported claims
No fabricated or paper-external claims found. Every figure, benchmark, pattern, and vendor detail in the note maps to printed text. The "Relevance to this project" section is the note author's own framing (not attributed to the paper) and makes no false claims about the paper's content.

## Corrections needed
1. Key finding #4: change section citation from **"Sec. VI.D"** to **"Sec. V.D"** (Cloud-Native Implementations). Page 7 reference is correct; content is accurate.

(No other corrections.)

# Distributed Event Queue Management System

**APA 7 reference**
Nowacki, P., Roszczyk, R., & Krupa, A. (2021). Distributed event queue management system. In *2021 22nd International Conference on Computational Problems of Electrical Engineering (CPEE)* (pp. 1–4). IEEE. https://doi.org/10.1109/CPEE54040.2021.9585262

*(DOI verified on page 1: 10.1109/CPEE54040.2021.9585262; IEEE document 9585262. Venue is CPEE 2021, not a generic "IEEE" conference.)*

**Abstract**
This document describes innovative ways of storing events in queues and the working principle of the event queue management system. The paper also includes a description of methods preventing accidents of the event queue management system. The work also presents example scenarios of using the proposed system.

**Key findings**
- Defines three queue types: Nonsequential (consume without waiting for ack), Sequential (next message consumed only after previous success), and Transactional (hybrid of parent messages containing submessages) (Sec. III, pp. 2–3).
- Each message has three states — ready, processing, removed — where "removed" means processed and confirmed (Sec. II, pp. 1–2).
- Architecture consists of sectors and modules; the paper lists five modules: Producer, Job Manager, Worker, Ack Manager, and a Database module holding IDs (Job Manager ID, Worker ID, Queue ID, Transaction ID, Message ID) (Sec. IV, pp. 2–3).
- Ack Manager gates completion: a worker must confirm success/failure before Job Manager marks a message "removed" and deletes it (Sec. IV–V, p. 3).
- Fault tolerance via checkpoint/rollback in Job Manager and repetitive signals with return callbacks between modules (security strategies at the end of Sec. V; return-callback statement in Sec. VII Conclusions, p. 4).

**Quotable sentences**
- "The second type of queuing is Sequential Queues connected directly with sequential actions, which forces the system to take the next message from the queue only on the previous success state" (p. 2).
- "Each receiving module has to confirm its actions by giving a return callback to the sending module" (p. 4).
- "Entering Ack Management Sector into the queue management system provides verification and proper reaction to message processing" (p. 4).

**Relevance to this project**
- Ordering: the Sequential Queue (advance only on prior success) is a direct precedent for the project's per-key strict FIFO ordering.
- Backpressure/ack: the Ack Manager gating message removal maps precisely onto ack-gated dispatch; unacked messages block progression.
- Partitioning/keying: per-queue IDs dispatched to independent Job Managers mirror the hash-map (key → queue) design with cross-key concurrency.

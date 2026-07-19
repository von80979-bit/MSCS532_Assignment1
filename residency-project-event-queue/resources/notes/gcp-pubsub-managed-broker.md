# Google Cloud Pub/Sub — Ordering Keys, Retry Policy, Dead-Letter Topics

**APA 7 references (web pages, group author)**
Google Cloud. (n.d.-a). *Order messages*. Google Cloud documentation. Retrieved July 18, 2026, from https://cloud.google.com/pubsub/docs/ordering

Google Cloud. (n.d.-b). *Subscription retry policy*. Google Cloud documentation. Retrieved July 18, 2026, from https://cloud.google.com/pubsub/docs/subscription-retry-policy

Google Cloud. (n.d.-c). *Dead-letter topics*. Google Cloud documentation. Retrieved July 18, 2026, from https://cloud.google.com/pubsub/docs/dead-letter-topics

*(No publication date is printed; APA 7 uses n.d. with a retrieval date because the pages are updated over time. The canonical `cloud.google.com/pubsub/docs/...` URLs currently 301-redirect to `docs.cloud.google.com/pubsub/docs/...`; the canonical form is cited. If the report cites all three under one in-text group, disambiguate with n.d.-a / n.d.-b / n.d.-c.)*

## Ordering keys — Order messages
Source page: *Order messages* (https://cloud.google.com/pubsub/docs/ordering)

**Verified facts**
- An ordering key is a string that identifies related messages that should be ordered (e.g., customer IDs or database row primary keys). An ordering key can be up to 1 KB in length.
- Messages published with the same ordering key are expected to be received in order.
- Messages for the same key are usually delivered to the same streamingPull subscriber client; the affinity can shift for load balancing when no messages are outstanding for the key.
- Publishing constraint: all messages with the same ordering key must be published in the same region; publishing throughput on each ordering key is limited to 1 MBps.
- Messages with an empty ordering key are not ordered.
- Only one batch of messages can be outstanding for an ordering key at a time (pull); push subscriptions allow one outstanding message per ordering key at a time.
- Unacknowledged messages for a given ordering key can potentially delay delivery of messages for other ordering keys.

**Quotable sentences**
- "Messages published with the same ordering key are expected to be received in order."
- "Messages with an empty ordering key are not ordered."
- "Unacknowledged messages for a given ordering key can potentially delay delivery of messages for other ordering keys."

## Retry policy / exponential backoff — Subscription retry policy
Source page: *Subscription retry policy* (https://cloud.google.com/pubsub/docs/subscription-retry-policy)

**Verified facts**
- By default, subscriptions use immediate redelivery; automatic retry of failed deliveries is not a feature that can be turned on or off.
- Exponential backoff adds progressively longer delays between retry attempts: after a failure, Pub/Sub waits for a minimum backoff time before retrying.
- Default durations: 10 seconds minimum backoff and 600 seconds maximum backoff; configurable values fall between 0 and 600 seconds.
- Backoff is applied per-message, not globally across all messages in a subscription.
- Backoff is triggered when a negative acknowledgment is received or when a message's acknowledgment deadline expires.
- With a large number of negatively acknowledged messages, some may be delivered with less or no backoff.

**Quotable sentences**
- "Exponential backoff lets you add progressively longer delays between retry attempts."
- "Exponential backoff is triggered when a negative acknowledgment is received or when the acknowledgment deadline of a message expires." (paraphrased from the two stated trigger conditions)

## Dead-letter topics — Dead-letter topics
Source page: *Dead-letter topics* (https://cloud.google.com/pubsub/docs/dead-letter-topics)

**Verified facts**
- A dead-letter topic (also known as a dead-letter queue) is where Pub/Sub can forward undeliverable messages that subscribers can't acknowledge.
- After an approximately configured number of delivery attempts, Pub/Sub can forward the undeliverable message to the dead-letter topic.
- Maximum delivery attempts: default 5, minimum 5, maximum 100. The count is approximate because forwarding is best-effort.
- When forwarding, Pub/Sub wraps the original message in a new one and adds attributes identifying the source subscription.

**Quotable sentences**
- "To manage undeliverable messages that subscribers can't acknowledge, Pub/Sub can forward them to a dead-letter topic (also known as a dead-letter queue)."
- "The maximum number of delivery attempts is approximate because Pub/Sub forwards undeliverable messages on a best-effort basis."

## Relevance to this project (Phase 3 scaling framing)
- Ordering keys map directly to the PoC's per-key FIFO partitioning: strict order within a key, concurrency across keys, and the same head-of-line caveat (an unacked key can delay only its own queue — Pub/Sub notes cross-key delay as a managed-broker nuance).
- Retry policy / exponential backoff grounds Opt B (recoverability): the PoC's redelivery + backoff mirrors the managed broker's per-message backoff on nack / ack-deadline expiry.
- Dead-letter topics ground the per-queue `dlq`: after a bounded number of attempts, undeliverable events are diverted so the queue can drain, matching the max-delivery-attempts → forward behavior.

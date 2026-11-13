---
title: Outbox and messaging
---

Once is transport-independent. The consumer maps a stable business identity into Once and owns its acknowledgement, retry and dead-letter policy.

## Once with Outbox

The products address different boundaries:

- **Outbox:** commit outgoing work with business data, then deliver it at least once.
- **Once:** commit a local business operation with a marker, then skip duplicate invocations.

A Once-owned action can write business data and schedule an Outbox record in the same local transaction. At the receiving service, Once can protect the consumer's local business writes. Each service owns its database and marker namespace.

Choose a stable event ID for retries and redelivery. Outbox's messaging integrations can supply an `Idempotency-Key` header. The default record identity is stable across retries of that record; use a business event ID if newly scheduled records for the same logical event must also deduplicate.

The [Once + Outbox + Kafka tracing example](https://github.com/namastack/namastack-once/tree/main/namastack-once-examples/namastack-once-example-outbox-tracing) demonstrates that flow with an actual broker. The [Outbox guarantees](/outbox/reference/guarantees/) describe the publication boundary.

## Effectively-once business processing

**At-least-once delivery + transactional duplicate protection = effectively-once business processing.** Outbox and Once combine these two guarantees for the consumer's local database effects.

For example, an order event may be delivered three times. Once commits the invoice and its marker together on the first successful execution. Later deliveries with the same scope and key skip the invoice creation while that marker remains stored.

| Failure boundary | What happens next |
|---|---|
| Consumer fails before committing | Business writes and marker roll back; a later delivery can try again. |
| Consumer commits, but acknowledgement is lost | Redelivery finds the marker and skips the business action. |
| Outbox publishes, but cannot record delivery completion | Publishing can repeat; the consumer uses the same identity to suppress the duplicate effect. |

The action can run more than once across failed attempts. Effectively-once describes the **committed local business effect**, not the number of deliveries or method invocations. Retrying recoverable failures until processing succeeds provides the eventual successful effect; neither library makes a permanently failing operation succeed.

### Conditions for this guarantee

- Preserve the same stable scope and key for every delivery of the same logical operation. All consumers that must deduplicate each other must share the marker store and identity mapping.
- Commit the marker and protected business writes in the same Once-owned transaction, using the same database resource and matching transaction manager.
- Acknowledge only after Once completes successfully. Retry technical failures through the transport's policy; a confirmed duplicate may be acknowledged normally.
- Retain markers for the entire possible redelivery and replay window. Once a marker is deleted, the same identity can execute again.

This is not a global exactly-once delivery or distributed transaction guarantee. HTTP requests, emails and other external effects are outside the consumer's local transaction. For further outgoing work, commit another Outbox record with the business changes and protect the next consumer's own transaction. See [transactions and guarantees](../concepts/transactions.md) and [retention](../operations/retention.md) for the boundaries.

## Message acknowledgement

Return normally after a successful execution or confirmed duplicate. Propagate technical failures to the transport. Configure acknowledgement after the database transaction completes; broker acknowledgement and the local database transaction are different resources.

## Kafka consumer identity

The tracing example reads `Idempotency-Key` explicitly from the message header:

```kotlin
@KafkaListener(topics = ["orders"], groupId = "billing")
@Idempotent(scope = "billing.issue-invoice")
fun issue(
    eventId: String,
    @Header("Idempotency-Key") @IdempotencyKey idempotencyKey: String,
) {
    invoiceService.create(eventId)
}
```

This uses `org.springframework.kafka.annotation.KafkaListener` and `org.springframework.messaging.handler.annotation.Header`. Kafka's record key controls partitioning; the idempotency header identifies the business operation. They need not have the same value. Once does not extract headers automatically; the listener binds and selects the key.

The default required header fails message binding if absent. Blank keys are rejected by Once. Decide whether invalid messages should be retried or dead-lettered through your transport configuration. Kafka producer idempotence handles protocol retries, not duplicate application-level sends, so it does not replace consumer duplicate protection.

---
title: Outbox, messaging and Spring Modulith
---

Once is transport-independent. The consumer maps a stable business identity into Once and owns its acknowledgement, retry and dead-letter policy.

## Once with Outbox

The products address different boundaries:

- **Outbox:** commit outgoing work with business data, then deliver it at least once.
- **Once:** commit a local business operation with a marker, then skip duplicate invocations.

A Once-owned action can write business data and schedule an Outbox record in the same local transaction. At the receiving service, Once can protect the consumer's local business writes. Each service owns its database and marker namespace.

Choose a stable event ID for retries and redelivery. Outbox's messaging integrations can supply an `Idempotency-Key` header. The default record identity is stable across retries of that record; use a business event ID if newly scheduled records for the same logical event must also deduplicate.

The [Once + Outbox + Kafka tracing example](https://github.com/namastack/namastack-once/tree/main/namastack-once-examples/namastack-once-example-outbox-tracing) demonstrates that flow with an actual broker. The [Outbox guarantees](/docs/outbox/reference/guarantees/) describe the publication boundary.

## Spring Modulith

Once can protect an asynchronous module listener without a separate integration module. Override the listener's transaction propagation so Once owns the worker-thread transaction:

```kotlin
@ApplicationModuleListener(
    id = "billing.issue-invoice",
    propagation = Propagation.NOT_SUPPORTED,
)
@Idempotent(scope = "billing.issue-invoice", key = "#event.eventId")
fun on(event: OrderPlaced) {
    invoiceService.create(event)
}
```

Do not retain the listener's default transaction boundary: existing transactions are rejected. The business service may join the transaction started by Once. See the [runnable Modulith example](https://github.com/namastack/namastack-once/tree/main/namastack-once-examples/namastack-once-example-modulith).

## Message acknowledgement

Return normally after a successful execution or confirmed duplicate. Propagate technical failures to the transport. Configure acknowledgement after the database transaction completes; broker acknowledgement and the local database transaction are different resources.

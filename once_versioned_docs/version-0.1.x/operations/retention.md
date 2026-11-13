---
title: Retention and cleanup
---

Markers are retained **forever by default**. A stored marker protects its identity until it is deleted. Finite retention sets the earliest cleanup time, not an automatic execution deadline.

```java
var request = IdempotencyRequest.of("order.process", eventId)
    .withRetentionPolicy(
        new DurationIdempotencyRetentionPolicy(Duration.ofDays(2))
    );
```

For annotations, declare a policy bean and select it:

```java
@Bean
IdempotencyRetentionPolicy twoDays() {
    return new DurationIdempotencyRetentionPolicy(Duration.ofDays(2));
}

@Idempotent(scope = "order.process", retentionPolicyBean = "twoDays")
public void consume(@IdempotencyKey UUID eventId) {
    useCase.process(eventId);
}
```

Retention starts at reservation time, so a long transaction consumes part of that duration. Duplicate calls do not refresh it. Expired markers still produce duplicates until cleanup removes them; disabled or delayed cleanup extends protection. After deletion the identity may execute again. Choose retention to cover your application's redelivery and replay horizon.

## Cleanup lifecycle

```yaml
namastack:
  once:
    cleanup:
      enabled: true
      interval: 1h
      batch-size: 1000
      shutdown-timeout: 30s
```

A pass fixes a cutoff and drains eligible markers in bounded, independently committed batches until none remain. `batch-size` limits one transaction, not the entire pass; `interval` is the delay after a pass completes. Shutdown stops between batches and waits for an active batch up to the configured timeout without interrupting its database operation.

The dedicated Spring-managed `onceCleanupScheduler` follows Boot's platform/virtual-thread configuration. Provide a scheduler with that name to customize it. `@EnableScheduling` is not required. MongoDB cleanup uses Once's lifecycle rather than TTL deletion.

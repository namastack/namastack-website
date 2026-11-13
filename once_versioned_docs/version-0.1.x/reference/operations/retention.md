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

## Custom policies and timestamp precision

Implement `IdempotencyRetentionPolicy.calculateExpiry(context, createdAt)` to compute cleanup eligibility. `context` contains only the scope; it intentionally excludes keys and payloads. Return `Optional.empty()` for unlimited retention or an instant strictly after `createdAt` for finite retention. Use the supplied reservation time rather than sampling another clock.

```java
@Bean
IdempotencyRetentionPolicy businessRetention() {
    return (context, createdAt) -> Optional.of(
        createdAt.plus(Duration.ofDays(2))
    );
}
```

This example uses `java.util.Optional` and `java.time.Duration`. Select the bean with `retentionPolicyBean = "businessRetention"`, or pass it through `withRetentionPolicy` for the programmatic API.

Both creation and expiry are truncated to microsecond precision. Zero/negative durations and an expiry that is no longer after creation at that precision are rejected before the business action. A policy change applies only to new reservations; it does not rewrite existing markers.

## Scheduling and failure handling

The first automatic pass runs after `interval`, not immediately at startup. A process runs at most one pass at a time. This is not leader election: different application instances can clean the same store concurrently, and the persistence adapters use transactional batches to preserve retained markers.

A repository cleanup failure is logged, ends that repository's drain for the current pass, and does not prevent other repositories from being processed. Earlier committed batches remain deleted; a later pass can try again. Monitor cleanup errors and retained-marker growth when using finite retention.

The lifecycle collects distinct repositories from beans that are `DefaultIdempotencyOperations` instances. A custom implementation or decorator of `IdempotencyOperations` does not automatically expose its repository to this collector. Configure its cleanup lifecycle explicitly if needed.

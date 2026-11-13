---
title: Annotation API
---

`@Idempotent` protects a public method on a Spring bean. Choose either one parameter marked with `@IdempotencyKey` or a SpEL expression, not both.

```java
@Idempotent(scope = "order.process")
public void consume(@IdempotencyKey UUID eventId, OrderCommand command) {
    useCase.process(command);
}
```

For a result-returning method:

```java
@Idempotent(scope = "order.create", key = "#command.requestId()")
public IdempotencyResult<Order> handle(OrderCommand command) {
    return IdempotencyResult.executed(useCase.create(command));
}
```

Methods return `void` / Kotlin `Unit` or parameterized `IdempotencyResult<T>`. The method body returns `Executed`; Once supplies `Duplicate` when the method is skipped. Other return types and invalid declarations are unsupported. Void methods treat duplicates as a normal return.

Named SpEL parameters require Java parameter metadata (`-parameters`); positional `#p0` also works. Kotlin beans must be open, normally through the Kotlin Spring plugin. Self-invocation bypasses the proxy.

`operationsBean = "billingOnce"` selects a [named Once instance](../persistence/multiple-instances.md). `retentionPolicyBean = "twoDays"` selects a [retention-policy bean](../operations/retention.md). A policy class can instead be selected through `retentionPolicy`; do not combine a named policy with a non-default policy class.

Once starts and owns its transaction. Remove entry-point transaction advice or use `NOT_SUPPORTED`. Async methods return `void` / `Unit`; Once executes on the worker thread. Reactive return types are not supported. See [Outbox and messaging integration](integrations.md).

## Annotation options

| Attribute | Default | Purpose |
|---|---|---|
| `scope` | Required | Explicit namespace, non-blank and at most 200 UTF-16 characters. |
| `key` | Empty | SpEL expression; use this or exactly one `@IdempotencyKey` parameter. |
| `operationsBean` | Empty | Named instance, otherwise Spring's unambiguous/primary `IdempotencyOperations` bean. |
| `retentionPolicy` | `ForeverIdempotencyRetentionPolicy` | Policy class resolved from Spring, or constructed through Spring when no bean exists. |
| `retentionPolicyBean` | Empty | Existing named policy bean; cannot accompany a non-default policy class. |

SpEL supports positional `#p0` / `#a0`, discovered parameter names, and Spring bean references such as `@requestKeys.forOrder(#p0)`. A null result or a key that cannot normalize to a non-blank string is rejected before business work.

## Validation and proxy boundaries

Once validates annotated beans during initialization. The class and method must be non-final and the method must be public and non-static. Java classes must therefore allow subclassing; Kotlin applications normally use the Kotlin Spring plugin. Raw `IdempotencyResult`, concrete `Executed` return declarations, `CompletableFuture`, and reactive result types are not supported return contracts.

Transaction advice is checked on both the method and its class. Removing a method annotation is insufficient if class-level `@Transactional` still applies. The only accepted entry-point transaction propagation is `NOT_SUPPORTED`; even `REQUIRES_NEW` would start a transaction before Once and is rejected.

`@Async` requires Spring asynchronous execution to be enabled and the method to return `void` / `Unit`. The worker invocation owns Once's transaction; the submitting thread's return does not confirm that the action has committed.

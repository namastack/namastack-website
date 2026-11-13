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

Once starts and owns its transaction. Remove entry-point transaction advice or use `NOT_SUPPORTED`. Async methods return `void` / `Unit`; Once executes on the worker thread. Reactive return types are not supported. See [Spring Modulith and transport integration](integrations.md).

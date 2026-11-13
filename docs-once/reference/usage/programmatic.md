---
title: Programmatic API
---

Inject `IdempotencyOperations` to control the duplicate branch explicitly. The callback executes synchronously inside the transaction owned by Once.

```java
IdempotencyResult<Order> result = once.execute(
    IdempotencyRequest.of("order.create", command.requestId()),
    () -> IdempotencyResult.executed(useCase.create(command))
);

OrderReply reply = result.fold(
    order -> OrderReply.created(order.id()),
    duplicate -> OrderReply.alreadyProcessed()
);
```

`Executed<T>` carries the value computed by this invocation. `Duplicate<T>` carries identity context, **not** the value from a previous call. Once never replays previous results.

For an action without a business value:

```java
IdempotencyResult<Void> result = once.execute(
    IdempotencyRequest.of("order.process", eventId),
    () -> {
        useCase.process(command);
        return IdempotencyResult.executed();
    }
);
```

Callbacks return an executed wrapper. Null wrappers and caller-supplied duplicates are rejected before commit; null business values are allowed. There is no `Failed` result: failures propagate as exceptions. Java callbacks use `Supplier`, so adapt checked exceptions while preserving their cause.

In Kotlin, `wasExecuted()` can test the outcome or an exhaustive `when` can handle `IdempotencyResult.Executed` and `IdempotencyResult.Duplicate`.

Call this API outside an existing transaction. Successful return follows transaction completion. The [same local-resource boundary](../concepts/transactions.md) applies to both APIs.

## Duplicate context

The duplicate branch receives `IdempotencyDuplicateContext` with `scope`, the original request `key`, and `keyHash`. These describe the current skipped invocation, not a stored response. For Java callers, the record accessors are `scope()`, `key()` and `keyHash()`.

If the caller needs the current business state after a duplicate, load it through an application query or return an explicit already-processed response. Once does not persist or reconstruct that response for you. Avoid logging raw keys automatically.

The callback is synchronous. Do not launch asynchronous writes and return `Executed` before they finish: work running later or on another thread does not participate in the owned transaction. The same restriction applies to annotation-protected methods.

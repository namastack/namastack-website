---
title: Programmatic API
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Inject `IdempotencyOperations` to control the duplicate branch explicitly. The callback executes synchronously inside
the transaction owned by Once and returns the business value directly. Once wraps that value in `Executed` after the
action completes.

<Tabs>
<TabItem value="kotlin" label="Kotlin">

```kotlin
val result = once.execute(IdempotencyRequest.of("order.create", command.requestId)) {
    useCase.create(command)
}

val reply = result.fold(
    { order -> OrderReply.created(order.id) },
    { OrderReply.alreadyProcessed() },
)
```

</TabItem>
<TabItem value="java" label="Java">

```java
IdempotencyResult<Order> result = once.execute(
    IdempotencyRequest.of("order.create", command.requestId()),
    () -> useCase.create(command)
);

OrderReply reply = result.fold(
    order -> OrderReply.created(order.id()),
    duplicate -> OrderReply.alreadyProcessed()
);
```

</TabItem>
</Tabs>

`Executed<T>` carries the value computed by this invocation. `Duplicate<T>` carries identity context, **not** the value
from a previous call. Once never replays previous results.

For an action without a business value:

<Tabs>
<TabItem value="kotlin" label="Kotlin">

```kotlin
val result = once.executeWithoutResult(IdempotencyRequest.of("order.process", eventId)) {
    useCase.process(command)
}
```

</TabItem>
<TabItem value="java" label="Java">

```java
IdempotencyResult<Void> result = once.executeWithoutResult(
    IdempotencyRequest.of("order.process", eventId),
    () -> useCase.process(command)
);
```

</TabItem>
</Tabs>

`execute` accepts a Java `Supplier<T>` and returns `IdempotencyResult<T>`. A null business value is valid and produces
`Executed(null)`, distinct from `Duplicate`. Returning an `IdempotencyResult` from the callback treats it as a business
value and produces a nested result; return the business value directly instead.

`executeWithoutResult` accepts a Java `Runnable` and returns `IdempotencyResult<Void>`. Successful execution produces
`Executed(null)`; duplicates retain their identity context. The callback needs no return statement. Kotlin sees the
value type as `Void?`.

There is no `Failed` result: failures propagate as exceptions. Neither `Supplier` nor `Runnable` declares checked
exceptions, so Java callbacks must adapt checked exceptions while preserving their cause.

[Annotated methods](annotations.md) returning `IdempotencyResult<T>` still construct `IdempotencyResult.executed(value)`
explicitly; programmatic callbacks do not.

In Kotlin, `wasExecuted()` can test the outcome or an exhaustive `when` can handle `IdempotencyResult.Executed` and
`IdempotencyResult.Duplicate`.

Call this API outside an existing transaction. Successful return follows transaction completion. The [same
local-resource boundary](../concepts/transactions.md) applies to both APIs.

## Duplicate context

The duplicate branch receives `IdempotencyDuplicateContext` with `scope`, the original request `key`, and `keyHash`.
These describe the current skipped invocation, not a stored response. For Java callers, the record accessors are
`scope()`, `key()` and `keyHash()`.

If the caller needs the current business state after a duplicate, load it through an application query or return an
explicit already-processed response. Once does not persist or reconstruct that response for you. Avoid logging raw keys
automatically.

The callback is synchronous. Do not launch asynchronous writes and let the callback return before they finish: work
running later or on another thread does not participate in the owned transaction. The same restriction applies to
annotation-protected methods.

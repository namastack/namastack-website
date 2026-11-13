---
title: Transactions and guarantees
---

Once owns a new local database transaction and returns after transaction completion. The marker and all protected business writes must use the same transaction resource and matching manager.

| Situation | Result |
|---|---|
| New identity, successful action and commit | `Executed` with the newly computed value |
| Marker already exists | `Duplicate`; the action is skipped |
| Action throws | Transaction rolls back and the original failure propagates |
| A transaction is already active at the entry point | Rejected before reservation or business work |
| Commit result is uncertain | Failure propagates; Once does not delete a possibly committed marker |
| Marker is deleted after retention | The same identity may execute again |

## Own the transaction

Invoke the annotation or programmatic API outside a transaction. Existing transactions, nested Once calls and calls from transaction-completion callbacks are rejected. Business services invoked **inside** the action may join Once's transaction with ordinary `REQUIRED` propagation.

Remove transaction advice from the entry point or explicitly use `NOT_SUPPORTED` to suspend an outer transaction. Do not use independently committed business writes, `REQUIRES_NEW` business methods or another datasource for protected work. Those writes do not share the marker's atomicity.

## Failure and retry

Once does not retry your action. The caller owns retry, dead-letter and acknowledgement policy. An exception must escape the action to signal failure: catching an error and returning normally means the application considers the operation handled. Return only `IdempotencyResult.executed(...)` from a programmatic callback.

A database conflict, timeout or deadlock is a technical failure, not proof that an operation is a confirmed duplicate. JDBC contenders can wait for database locks; MongoDB can report a write conflict that the caller must retry. Only Once's returned duplicate outcome confirms a skip.

## The guarantee has a local boundary

HTTP calls, emails, broker sends and writes using other database resources are not undone by rollback. Commit an Outbox record with the business writes for durable outgoing work. Once does not promise end-to-end exactly-once delivery, store previous response values, or refresh retention on duplicate calls.

Acknowledge a consumed message after Once returns successfully. On rollback, propagate the failure to the transport's retry policy. This preserves the opportunity to handle a later delivery.

## Concurrent callers and transaction suspension

Independent application instances coordinate through the marker store's unique identity. A competing invocation is not guaranteed an immediate response: it can wait for database locks or fail with a technical concurrency error. If the first transaction rolls back, a later attempt can reserve and execute; if it commits, a confirmed duplicate skips the action. Once provides no in-memory or cluster-wide request queue.

`NOT_SUPPORTED` suspends an outer transaction rather than extending it. Once's inner work commits independently; rolling back the suspended caller afterwards does not undo it. Use this deliberately when adapting an existing transactional entry point.

A business service that marks the owned transaction rollback-only cannot produce a successful `Executed` return from Once. Invalid result wrappers, invalid retention and mismatched transaction resources also fail without committing protected work. An unrelated constraint violation in a business table remains an application/database failure, not a duplicate.

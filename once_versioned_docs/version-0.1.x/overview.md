---
title: Namastack Once
slug: /
---

Once protects local business operations against repeated invocations. It reserves a marker for a stable **scope and key**, runs your action, and commits the marker and business writes in one local database transaction. A stored marker skips the action on a duplicate.

Once is independent of Namastack Outbox and of your messaging transport. Use it for message consumers, application commands and repeated requests. Outbox handles durable outgoing work; Once handles duplicate protection at an application boundary.

## Start here

- [Quickstart](quickstart.md): install the JDBC starter, provision the schema and protect a method.
- [Transactions and guarantees](concepts/transactions.md): understand the boundary of duplicate protection.
- [Annotation API](usage/annotations.md) and [programmatic API](usage/programmatic.md).
- [JDBC](persistence/jdbc.md) or [MongoDB](persistence/mongodb.md) persistence.
- [Configuration](configuration.md) and [runnable examples](examples.md).

## The execution model

1. Once starts its own local transaction and reserves the identity.
2. A new identity runs the synchronous business action.
3. Successful business writes and the marker commit together; an action failure rolls them back.
4. An existing identity returns `Duplicate` without invoking the action.

Invoke Once **outside an existing transaction**. Business services called inside its action may join the transaction it owns. Direct remote effects and writes using another database resource are outside the guarantee. Once does not replay a previous return value.

The `0.1.x Preview` snapshot and `Next` are separate documentation versions. Both currently describe development builds using `0.1.0-SNAPSHOT`; they do not imply a published stable release.

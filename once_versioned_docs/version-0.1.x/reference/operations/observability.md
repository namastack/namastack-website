---
title: Observability
---

Add the optional instrumentation module alongside your persistence starter:

```kotlin
implementation("io.namastack:namastack-once-observability")
implementation("org.springframework.boot:spring-boot-starter-actuator")
```

The BOM aligns the Once module versions. Spring Boot's observation infrastructure supplies the registry; configure your normal Micrometer metrics exporter and tracing bridge for your backend.

| Observation | Boundary |
|---|---|
| `once.execute` | Invocation through transaction completion, with executed, duplicate or error outcome |
| `once.cleanup.batch` | One cleanup batch through commit, including its backend and outcome |

Duplicates are successful skips, not execution errors. Execution instrumentation encloses transaction completion so commit failures are recorded as failures. Deleted counts are recorded after the cleanup transaction commits.

Keep scopes bounded and avoid sensitive or unbounded identifiers in metric tags. Stable business keys belong in application-level handling, not metric dimensions.

The [Outbox + Kafka tracing example](https://github.com/namastack/namastack-once/tree/main/namastack-once-examples/namastack-once-example-outbox-tracing) shows Once execution and cleanup observations with Outbox, Kafka and an OpenTelemetry-backed trace viewer. Once instrumentation complements the transport and application's instrumentation; it does not make remote effects part of the local transaction.

## Default tags and observation contexts

| Observation | Metric dimensions (low cardinality) | Trace attributes (high cardinality) |
|---|---|---|
| `once.execute` | `once.outcome`: `executed`, `duplicate`, `error` | `once.scope` |
| `once.cleanup.batch` | `once.backend`: `jdbc` or `mongodb`; `once.outcome`: `success` or `error` | `once.cleanup.batch.size`, `once.cleanup.deleted.count` |

Scope is trace-only by default, not a metric tag. Raw keys and identity hashes are absent from execution observation context. Cleanup's deleted count is a committed-batch trace attribute, not a separate deletion counter supplied by Once. Your registry/exporter determines how observation timers and spans appear in the backend.

Provide a `OnceExecuteObservationConvention` or `OnceCleanupObservationConvention` bean to customize names and tags. These interfaces and their contexts live in `namastack-once-observability-api`; `namastack-once-observability` supplies the Micrometer adapter. An `ObservationRegistry` must be present for the auto-configured adapter.

## Explicitly configured instances

Auto-configured repositories and execution services compose the ordered `OnceInstrumentation` beans automatically. Manually constructed `JdbcIdempotencyMarkerRepository`, `MongoIdempotencyMarkerRepository` and `DefaultIdempotencyOperations` use no-op instrumentation unless you pass it explicitly. Supply instrumentation to both the repository (cleanup) and the execution service (invocations).

When several instrumentation beans exist, use `OnceInstrumentation.compose(...)` with their ordered list. Custom instrumentation should preserve the action's result and exception; duplicate outcomes remain successful skips.

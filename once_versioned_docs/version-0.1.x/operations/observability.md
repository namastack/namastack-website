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

---
title: Runnable examples
---

The examples live with the [Once implementation](https://github.com/namastack/namastack-once/tree/main/namastack-once-examples), so they can be built against the exact source you are evaluating.

From the Java example directory in a source checkout:

```bash
./gradlew bootRun -PonceSource=../..
./gradlew test -PonceSource=../..
```

| Example | Demonstrates |
|---|---|
| [Java](https://github.com/namastack/namastack-once/tree/main/namastack-once-examples/namastack-once-example-java) | Result-returning annotation and H2 |
| [Kotlin](https://github.com/namastack/namastack-once/tree/main/namastack-once-examples/namastack-once-example-kotlin) | Programmatic API and void annotation |
| [PostgreSQL](https://github.com/namastack/namastack-once/tree/main/namastack-once-examples/namastack-once-example-postgresql) | Application-owned Flyway migrations |
| [MongoDB](https://github.com/namastack/namastack-once/tree/main/namastack-once-examples/namastack-once-example-mongodb) | Replica set, native transactions and collection provisioning |
| [Multiple instances](https://github.com/namastack/namastack-once/tree/main/namastack-once-examples/namastack-once-example-multiple-instances) | Named beans, separate marker tables and selection |
| [Spring Modulith](https://github.com/namastack/namastack-once/tree/main/namastack-once-examples/namastack-once-example-modulith) | Listener propagation and duplicate event protection |
| [Outbox + Kafka tracing](https://github.com/namastack/namastack-once/tree/main/namastack-once-examples/namastack-once-example-outbox-tracing) | Producer and consumer identities, durable publication, metrics and traces |

Database-backed examples may require Docker; consult each example's README. The example applications explicitly provision their demonstration schemas. Production schema management remains your application's responsibility.

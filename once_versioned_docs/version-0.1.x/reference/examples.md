---
title: Runnable examples
---

The examples live with the [Once implementation](https://github.com/namastack/namastack-once/tree/main/namastack-once-examples), and cover common application and persistence setups.

To run an example with the released artifacts, set `namastackOnce = "0.1.0"` in the shared example catalog at `namastack-once-examples/gradle/libs.versions.toml`. Then run from the Java example directory:

```bash
./gradlew bootRun
./gradlew test
```

To test changes to Once itself, append `-PonceSource=../..` to build against the local source instead of the published artifacts.

| Example | Demonstrates |
|---|---|
| [Java](https://github.com/namastack/namastack-once/tree/main/namastack-once-examples/namastack-once-example-java) | Result-returning annotation and H2 |
| [Kotlin](https://github.com/namastack/namastack-once/tree/main/namastack-once-examples/namastack-once-example-kotlin) | Programmatic API and void annotation |
| [PostgreSQL](https://github.com/namastack/namastack-once/tree/main/namastack-once-examples/namastack-once-example-postgresql) | Application-owned SQL initialization and real-database transactions |
| [MongoDB](https://github.com/namastack/namastack-once/tree/main/namastack-once-examples/namastack-once-example-mongodb) | Replica set, native transactions and collection provisioning |
| [Multiple instances](https://github.com/namastack/namastack-once/tree/main/namastack-once-examples/namastack-once-example-multiple-instances) | Named beans, separate marker tables and selection |
| [Outbox + Kafka tracing](https://github.com/namastack/namastack-once/tree/main/namastack-once-examples/namastack-once-example-outbox-tracing) | Producer and consumer identities, durable publication, metrics and traces |

Database-backed examples may require Docker; consult each example's README. The example applications explicitly provision their demonstration schemas. Production schema management remains your application's responsibility.

## Choosing and running an example

The Java, Kotlin and multiple-instance demos use H2. PostgreSQL and MongoDB demos start their databases through Docker Compose; MongoDB requires the supplied replica-set setup. Their tests can use separate Testcontainers databases. Read each example's README for its own start, test and shutdown commands.

The combined Kafka tracing demo also depends on Outbox. Its current checkout targets the adjacent Outbox source, so run it with both source substitutions when following that demo:

```bash
docker compose up -d
./gradlew bootRun -PonceSource=../.. -PoutboxSource=../../../namastack-outbox
```

Run these commands from `namastack-once-example-outbox-tracing`, with the Outbox checkout alongside Once. Grafana uses port **3000**, which can conflict with the website dev server; stop that Compose stack or change its host port before running both. Stop the demo services with `docker compose down` when finished.

There are no separate Oracle or SQL Server demo applications. Those adapters are covered by the repository's database integration contracts, including marker execution, rollback, retention and bounded cleanup.

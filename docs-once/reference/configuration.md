---
title: Configuration
---

The persistence starter enables Once auto-configuration. The following properties and defaults match the current Spring configuration metadata.

| Property | Default | Meaning |
|---|---|---|
| `namastack.once.enabled` | `true` | Enable Once protection. When disabled, annotated methods run without Once protection. |
| `namastack.once.transaction-manager` | `empty` | Transaction-manager bean selected once when creating the default Once instance; empty uses an unambiguous Spring candidate. |
| `namastack.once.cleanup.enabled` | `true` | Delete cleanup-eligible markers periodically. Existing markers protect their identities until deletion. |
| `namastack.once.cleanup.interval` | `1h` | Fixed delay of at least `1ms` after a complete cleanup pass; also delays the first pass. |
| `namastack.once.cleanup.batch-size` | `1000` | From `1` to `100000` marker deletions per committed cleanup batch. A pass repeats until a batch deletes no markers. |
| `namastack.once.cleanup.shutdown-timeout` | `30s` | Non-negative maximum wait for an active cleanup batch during graceful shutdown; `0s` does not wait. |
| `namastack.once.jdbc.table-name` | `once_marker` | Existing marker table for the auto-configured default Once instance. Once never creates or migrates tables. |
| `namastack.once.jdbc.schema-name` | `not set` | Optional existing schema for the default Once instance (database/catalog for MySQL or MariaDB). |
| `namastack.once.mongodb.collection-name` | `once_marker` | Application-provisioned marker collection for the default MongoDB Once instance. |

`namastack.once.enabled=false` disables the default infrastructure and annotation protection; annotated methods then run without duplicate protection. Treat this as an explicit application behavior change.

The transaction-manager property selects the default instance's manager at construction. For independently configured beans, bind the resource and manager directly as described in [multiple instances](persistence/multiple-instances.md).

JDBC schema-name is optional; MongoDB uses the configured template/database factory. Provision the selected marker store before accepting traffic. See [JDBC](persistence/jdbc.md) and [MongoDB](persistence/mongodb.md) for the required schemas.

## Bean selection and customization

| Extension point | Selection |
|---|---|
| Default Once instance | Starter supplies `once` only when no `IdempotencyOperations` bean exists. |
| Transaction manager | Named `namastack.once.transaction-manager`, otherwise Spring's unambiguous/primary candidate; MongoDB requires a `MongoTransactionManager`. |
| Key conversion | `Converter` beans extend the built-ins; `onceConversionService` or `IdempotencyKeyNormalizer` can replace them. |
| Reservation/cleanup clock | Application `Clock` bean replaces the system-UTC default. |
| Cleanup task scheduler | `TaskScheduler` bean named `onceCleanupScheduler` replaces the dedicated platform/virtual-thread scheduler. |
| Instrumentation | Ordered `OnceInstrumentation` beans, composed automatically for default instances. |

JDBC takes precedence over MongoDB when both adapters and a datasource are present. See [multiple instances](persistence/multiple-instances.md) for explicit selection. There is no database-dialect, automatic schema-initialization, or default finite-retention property. Database selection comes from metadata; schema provisioning belongs to the application; retention is selected per request or annotated method.

The cleanup, JDBC and MongoDB property groups reject unknown fields. Check property names carefully rather than assuming an unsupported option is ignored.

## Troubleshooting

| Symptom | Check |
|---|---|
| Existing transaction or invalid entry-point propagation | Remove method/class transaction advice or deliberately suspend it with `NOT_SUPPORTED`. |
| Expected database resource is not bound | Match the Once repository, business writes and local transaction manager to the same datasource/factory. |
| Table/collection is missing | Apply the matching schema before accepting work; Once does not initialize it. |
| Ambiguous Once or manager bean | Select a named bean or mark the intended default `@Primary`. |
| Key conversion fails | Use a built-in key type or register an explicit converter producing a non-blank stable string. |
| Annotation has no effect | Invoke through the injected proxy; avoid self-invocation and final classes/methods. Check that Once is enabled. |
| Expired request still returns duplicate | Expiry permits cleanup; protection ends only when the marker is actually deleted. |
| Invalid callback return | Return a non-null `Executed` wrapper, not a caller-created duplicate or an asynchronous result. |


## Modules

The `namastack-once-bom:0.1.0` aligns all Once artifacts. For normal Spring Boot applications, select a persistence starter and optionally observability:

| Artifact | Role |
|---|---|
| `namastack-once-starter-jdbc` | JDBC adapter, Core and Spring Boot JDBC starter; add your database driver. |
| `namastack-once-starter-mongodb` | MongoDB adapter, Core and Spring Boot MongoDB starter. |
| `namastack-once-api` | Requests, results, annotations and retention contracts for application boundaries. |
| `namastack-once-core` | Transaction-owned execution, key conversion, annotation interception and cleanup lifecycle. |
| `namastack-once-jdbc` | JDBC marker repository and database-specific queries for explicit composition. |
| `namastack-once-mongodb` | Native MongoDB marker repository for explicit composition. |
| `namastack-once-observability-api` | Observation contexts and conventions for customization. |
| `namastack-once-observability` | Optional Micrometer instrumentation and auto-configuration. |

The persistence starters do not include the optional observability adapter. Add it explicitly when you want Once observations; an exporter and tracing bridge remain application choices.

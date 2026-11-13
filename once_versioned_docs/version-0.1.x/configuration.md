---
title: Configuration
---

The persistence starter enables Once auto-configuration. The following properties and defaults match the current Spring configuration metadata.

| Property | Default | Meaning |
|---|---|---|
| `namastack.once.enabled` | `true` | Enable Once protection. When disabled, annotated methods run without Once protection. |
| `namastack.once.transaction-manager` | `empty` | Transaction-manager bean selected once when creating the default Once instance; empty uses an unambiguous Spring candidate. |
| `namastack.once.cleanup.enabled` | `true` | Delete cleanup-eligible markers periodically. Existing markers protect their identities until deletion. |
| `namastack.once.cleanup.interval` | `1h` | Positive fixed delay after a complete cleanup pass. |
| `namastack.once.cleanup.batch-size` | `1000` | Maximum marker deletions per committed cleanup batch. A pass repeats until a batch deletes no markers. |
| `namastack.once.cleanup.shutdown-timeout` | `30s` | Maximum wait for an active cleanup batch during graceful shutdown. |
| `namastack.once.jdbc.table-name` | `once_marker` | Existing marker table for the auto-configured default Once instance. Once never creates or migrates tables. |
| `namastack.once.jdbc.schema-name` | `not set` | Optional existing schema for the default Once instance (database/catalog for MySQL or MariaDB). |
| `namastack.once.mongodb.collection-name` | `once_marker` | Application-provisioned marker collection for the default MongoDB Once instance. |

`namastack.once.enabled=false` disables the default infrastructure and annotation protection; annotated methods then run without duplicate protection. Treat this as an explicit application behavior change.

The transaction-manager property selects the default instance's manager at construction. For independently configured beans, bind the resource and manager directly as described in [multiple instances](persistence/multiple-instances.md).

JDBC schema-name is optional; MongoDB uses the configured template/database factory. Provision the selected marker store before accepting traffic. See [JDBC](persistence/jdbc.md) and [MongoDB](persistence/mongodb.md) for the required schemas.

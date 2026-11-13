---
title: JDBC persistence
---

The JDBC starter supports PostgreSQL, MySQL, MariaDB and H2. Add `namastack-once-starter-jdbc` and your JDBC driver. Marker and business writes must use the same datasource and matching local transaction manager.

## Schema scripts

Once never creates or changes tables. Apply the matching script through your application's migration process before processing work:

- [PostgreSQL](https://github.com/namastack/namastack-once/blob/main/namastack-once-jdbc/src/main/resources/schema/postgresql.sql)
- [MySQL](https://github.com/namastack/namastack-once/blob/main/namastack-once-jdbc/src/main/resources/schema/mysql.sql)
- [MariaDB](https://github.com/namastack/namastack-once/blob/main/namastack-once-jdbc/src/main/resources/schema/mariadb.sql)
- [H2](https://github.com/namastack/namastack-once/blob/main/namastack-once-jdbc/src/main/resources/schema/h2.sql)

The default table is `once_marker`. Configure `namastack.once.jdbc.table-name` and optionally `schema-name` for an application-provisioned table. On MySQL and MariaDB, the schema setting selects a database/catalog; use InnoDB for marker and business tables.

Keep the identity primary key as the marker table's only unique constraint so unrelated uniqueness conflicts cannot be mistaken for duplicate identities. Preserve the supplied timestamp precision and non-unique cleanup index. Schema ownership remains with the application; initialization in the examples is explicitly enabled by those examples, not performed by Once.

The reservation path inserts a marker; an identity collision skips the action and the owned transaction is rolled back. The action's writes commit together with a successful new marker. Cleanup uses separately committed, bounded batches. Database timeouts, deadlocks and resource failures propagate to the caller.

For JPA business writes, select a compatible manager binding the same datasource and make the business writes participate in Once's transaction. See the [transaction contract](../concepts/transactions.md).

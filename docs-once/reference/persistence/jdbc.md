---
title: JDBC persistence
---

The JDBC starter supports PostgreSQL, MySQL, MariaDB, Microsoft SQL Server, Oracle and H2. Add `namastack-once-starter-jdbc` and your JDBC driver. Marker and business writes must use the same datasource and matching local transaction manager.

## Supported databases and drivers

Use one JDBC driver for the database behind your datasource. The Once BOM aligns Once modules; Spring Boot's dependency management supplies compatible driver versions.

| Database | JDBC driver dependency | Schema script |
|---|---|---|
| PostgreSQL | `org.postgresql:postgresql` | [postgresql.sql](https://github.com/namastack/namastack-once/blob/main/namastack-once-jdbc/src/main/resources/schema/postgresql.sql) |
| MySQL | `com.mysql:mysql-connector-j` | [mysql.sql](https://github.com/namastack/namastack-once/blob/main/namastack-once-jdbc/src/main/resources/schema/mysql.sql) |
| MariaDB | `org.mariadb.jdbc:mariadb-java-client` | [mariadb.sql](https://github.com/namastack/namastack-once/blob/main/namastack-once-jdbc/src/main/resources/schema/mariadb.sql) |
| Microsoft SQL Server (MSSQL) | `com.microsoft.sqlserver:mssql-jdbc` | [sqlserver.sql](https://github.com/namastack/namastack-once/blob/main/namastack-once-jdbc/src/main/resources/schema/sqlserver.sql) |
| Oracle | `com.oracle.database.jdbc:ojdbc11` | [oracle.sql](https://github.com/namastack/namastack-once/blob/main/namastack-once-jdbc/src/main/resources/schema/oracle.sql) |
| H2 | `com.h2database:h2` | [h2.sql](https://github.com/namastack/namastack-once/blob/main/namastack-once-jdbc/src/main/resources/schema/h2.sql) |

For example, select SQL Server by adding its driver and configuring a SQL Server datasource:

```kotlin
implementation(platform("io.namastack:namastack-once-bom:0.1.0"))
implementation("io.namastack:namastack-once-starter-jdbc")
runtimeOnly("com.microsoft.sqlserver:mssql-jdbc")
```

For Oracle, replace that driver with `runtimeOnly("com.oracle.database.jdbc:ojdbc11")`. Configure the JDBC URL and credentials through Spring Boot's `spring.datasource` properties, as in the [quickstart](../../quickstart.md).

Once detects the SQL dialect from JDBC database metadata on first repository use. There is no database-type property to set. Unsupported database products fail rather than falling back to a generic dialect. SQL Server and Oracle have dedicated reservation/cleanup integration tests in the Once repository, alongside the other JDBC adapters.

## Schema scripts

Once never creates or changes tables. Apply the matching script above through your application's migration process before processing work. Do not reuse the PostgreSQL DDL unchanged for another database:

- PostgreSQL and H2 use `TIMESTAMP(6)`.
- MySQL and MariaDB use `DATETIME(6)` and require InnoDB tables.
- SQL Server uses `DATETIME2(6)` and `NVARCHAR(200)` for the scope.
- Oracle uses `TIMESTAMP(6)` and `VARCHAR2(200 CHAR)` for the scope.

The identity column is a `CHAR(64)` primary key. Preserve the non-unique expiry index from the database's own script. JDBC timestamps contain UTC fields at microsecond precision; changing the timestamp type or precision can change retention behavior.

The default table is `once_marker`. Configure `namastack.once.jdbc.table-name` and optionally `schema-name` for an application-provisioned table. On MySQL and MariaDB, the schema setting selects a database/catalog; use InnoDB for marker and business tables.

Table and schema names are trusted SQL fragments, used as configured without automatic quoting. Supply any database-specific quoting yourself and keep these names in application configuration, never in request data.

Keep the identity primary key as the marker table's only unique constraint so unrelated uniqueness conflicts cannot be mistaken for duplicate identities. Preserve the supplied timestamp precision and non-unique cleanup index. Schema ownership remains with the application; initialization in the examples is explicitly enabled by those examples, not performed by Once.

The reservation path inserts a marker; an identity collision skips the action and the owned transaction is rolled back. The action's writes commit together with a successful new marker. Cleanup uses separately committed, bounded batches. Database timeouts, deadlocks and resource failures propagate to the caller.

For JPA business writes, use a compatible `JpaTransactionManager` whose EntityManagerFactory exposes the same datasource, and make business writes participate in Once's transaction. If several managers exist, select it with `namastack.once.transaction-manager`. A separate JDBC transaction manager cannot make independently managed JPA writes atomic with the marker. See the [transaction contract](../concepts/transactions.md).

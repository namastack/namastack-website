---
title: JDBC persistence
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

The JDBC starter supports PostgreSQL, MySQL, MariaDB, Microsoft SQL Server, Oracle and H2. Add
`namastack-once-starter-jdbc` and your JDBC driver. Marker and business writes must use the same datasource and matching
local transaction manager.

## Supported databases and drivers

Use one JDBC driver for the database behind your datasource. The Once BOM aligns Once modules; Spring Boot's dependency
management supplies compatible driver versions.

| Database | JDBC driver dependency | Schema script |
|---|---|---|
| PostgreSQL | `org.postgresql:postgresql` | [once-tables.sql](https://github.com/namastack/namastack-once/blob/main/namastack-once-jdbc/src/main/resources/schema/postgres/once-tables.sql) |
| MySQL | `com.mysql:mysql-connector-j` | [once-tables.sql](https://github.com/namastack/namastack-once/blob/main/namastack-once-jdbc/src/main/resources/schema/mysql/once-tables.sql) |
| MariaDB | `org.mariadb.jdbc:mariadb-java-client` | [once-tables.sql](https://github.com/namastack/namastack-once/blob/main/namastack-once-jdbc/src/main/resources/schema/mariadb/once-tables.sql) |
| Microsoft SQL Server (MSSQL) | `com.microsoft.sqlserver:mssql-jdbc` | [once-tables.sql](https://github.com/namastack/namastack-once/blob/main/namastack-once-jdbc/src/main/resources/schema/sqlserver/once-tables.sql) |
| Oracle | `com.oracle.database.jdbc:ojdbc11` | [once-tables.sql](https://github.com/namastack/namastack-once/blob/main/namastack-once-jdbc/src/main/resources/schema/oracle/once-tables.sql) |
| H2 | `com.h2database:h2` | [once-tables.sql](https://github.com/namastack/namastack-once/blob/main/namastack-once-jdbc/src/main/resources/schema/h2/once-tables.sql) |

For example, select SQL Server by adding its driver and configuring a SQL Server datasource:

<Tabs>
<TabItem value="Gradle" label="Gradle">

```kotlin
implementation(platform("io.namastack:namastack-once-bom:0.1.0"))
implementation("io.namastack:namastack-once-starter-jdbc")
runtimeOnly("com.microsoft.sqlserver:mssql-jdbc")
```

</TabItem>
<TabItem value="Maven" label="Maven">

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>io.namastack</groupId>
            <artifactId>namastack-once-bom</artifactId>
            <version>0.1.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependency>
    <groupId>io.namastack</groupId>
    <artifactId>namastack-once-starter-jdbc</artifactId>
</dependency>
<dependency>
    <groupId>com.microsoft.sqlserver</groupId>
    <artifactId>mssql-jdbc</artifactId>
    <scope>runtime</scope>
</dependency>
```

</TabItem>
</Tabs>

For Oracle, replace that driver with `runtimeOnly("com.oracle.database.jdbc:ojdbc11")`. Configure the JDBC URL and
credentials through Spring Boot's `spring.datasource` properties, as in the [quickstart](../../quickstart.md).

Once detects the SQL dialect from JDBC database metadata on first repository use. There is no database-type property to
set. Unsupported database products fail rather than falling back to a generic dialect. SQL Server and Oracle have
dedicated reservation/cleanup integration tests in the Once repository, alongside the other JDBC adapters.

## Automatic schema initialization

The JDBC starter creates `once_marker` and its expiry index automatically at startup for all supported
databases. Existing tables are preserved; initialization does not migrate them.

Automatic schema initialization and the `table-prefix` setting are part of
the upcoming Once release. For released behavior, select the `0.1.x` documentation in the version menu.

Set `namastack.once.jdbc.schema-initialization.enabled=false` when managing the schema with Flyway,
Liquibase, or your own SQL scripts. Use the database-specific scripts linked above as the starting point.
Do not reuse the PostgreSQL DDL unchanged for another database:

- PostgreSQL and H2 use `TIMESTAMP(6)`.
- MySQL and MariaDB use `DATETIME(6)` and require InnoDB tables.
- SQL Server uses `DATETIME2(6)` and `NVARCHAR(200)` for the scope.
- Oracle uses `TIMESTAMP(6)` and `VARCHAR2(200 CHAR)` for the scope.

The identity column is a `CHAR(64)` primary key. Keep it as the marker table's only unique constraint
so unrelated uniqueness conflicts cannot be mistaken for duplicate identities. Preserve the non-unique
expiry index and timestamp precision from the database's own script. JDBC timestamps contain UTC fields
at microsecond precision; changing their type or precision can change retention behavior.

## Custom schema and table names

Configure `schema-name`, `table-prefix`, and `table-name` to change the marker table reference.
Automatic initialization supports only the default naming, matching Namastack Outbox. Disable it and
create the schema, table, and index yourself when using custom names:

```yaml
namastack:
  once:
    jdbc:
      schema-initialization:
        enabled: false
      schema-name: app
      table-prefix: app_
      table-name: idempotency_marker
```

This configuration uses `app.app_idempotency_marker`. On MySQL and MariaDB, the schema setting selects
a database/catalog; use InnoDB for marker and business tables.

Schema and table names are trusted SQL fragments, used as configured without automatic quoting.
Supply any database-specific quoting yourself and keep these names in application configuration,
never in request data. Explicit Once instances and custom repositories should disable initialization
and manage their own schemas.

The [custom schema example](https://github.com/namastack/namastack-once/tree/main/namastack-once-examples/namastack-once-example-custom-schema)
shows both APIs using a custom schema and marker table with application-managed SQL.

The reservation path inserts a marker; an identity collision skips the action and the owned transaction is rolled back.
The action's writes commit together with a successful new marker. Cleanup uses separately committed, bounded batches.
Database timeouts, deadlocks and resource failures propagate to the caller.

For JPA business writes, use a compatible `JpaTransactionManager` whose EntityManagerFactory exposes the same
datasource, and make business writes participate in Once's transaction. If several managers exist, select it with
`namastack.once.transaction-manager`. A separate JDBC transaction manager cannot make independently managed JPA writes
atomic with the marker. See the [transaction contract](../concepts/transactions.md).

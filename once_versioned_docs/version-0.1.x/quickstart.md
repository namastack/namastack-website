---
title: Quickstart
---

This guide uses Namastack Once **0.1.0**, Java 17 or later, Spring Boot 4.1 and a JDBC datasource.

## 1. Add the dependencies

Add the Once BOM, a persistence starter and your database driver. The artifacts are available from Maven Central:

```kotlin
repositories {
    mavenCentral()
}

dependencies {
    implementation(platform("io.namastack:namastack-once-bom:0.1.0"))
    implementation("io.namastack:namastack-once-starter-jdbc")
    runtimeOnly("org.postgresql:postgresql")
}
```

For a complete runnable application, see [Examples](reference/examples.md).

## 2. Apply the database schema

Once **never creates or migrates tables**. Apply the schema matching your database before accepting traffic.

**Schema Files for Flyway/Liquibase:**

You can find the SQL schema files here:
👉 [Schema Files on GitHub](https://github.com/namastack/namastack-once/tree/main/namastack-once-jdbc/src/main/resources/schema)

For the application code below, also provision an `orders` table with a string primary key `id` and a non-null string `customer` column in the same database. Configure the datasource through Spring Boot's `spring.datasource.url`, `spring.datasource.username` and `spring.datasource.password` properties.

See [JDBC persistence](reference/persistence/jdbc.md) for driver selection, schema configuration and transaction-manager requirements.

## 3. Protect the application boundary

```java
import io.namastack.once.annotation.Idempotent;
import io.namastack.once.annotation.IdempotencyKey;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class OrderHandler {
    private final JdbcTemplate jdbc;

    public OrderHandler(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Idempotent(scope = "orders.create")
    public void create(@IdempotencyKey UUID requestId, String customer) {
        jdbc.update("INSERT INTO orders (id, customer) VALUES (?, ?)",
            requestId.toString(), customer);
    }
}
```

Call the injected Spring bean from a controller, listener or another bean. Reuse the **same request ID** for retries of the same operation. The first call inserts the order; a second call with the same scope and key skips the method. A `void` method returns normally for both outcomes. Use [IdempotencyResult](reference/usage/programmatic.md) when the caller needs to distinguish them.

Do not add `@Transactional` to this entry point. Once must start and own the transaction. Calls must cross the Spring proxy; self-invocation is not intercepted. Kotlin beans must be open, typically through the Kotlin Spring plugin.

## 4. Verify the failure boundary

If the method throws, its database writes and marker roll back together. A later invocation with the same identity can try again. External calls are not rolled back: put durable outgoing work in [Namastack Outbox](/outbox/) inside the business transaction and process it asynchronously.

Read [transactions and guarantees](reference/concepts/transactions.md) before using finite retention or acknowledging messages.

## 5. Choose persistence and operations settings

The JDBC starter also supports MySQL, MariaDB, Microsoft SQL Server, Oracle and H2. Use the database-specific driver and schema from [JDBC persistence](reference/persistence/jdbc.md). For MongoDB, choose the MongoDB starter and a transaction-capable replica set or sharded cluster instead.

Markers are retained forever by default. Configure a [retention policy](reference/operations/retention.md) if you want cleanup to remove them, and add [observability](reference/operations/observability.md) to inspect execution outcomes and cleanup batches. A configured cleanup interval alone does not make forever markers expire.

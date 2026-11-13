---
title: Quickstart
---

This guide uses Java 17 or later, Spring Boot 4.1 and a JDBC datasource. Once is currently a preview: there is no stable Maven Central release yet.

## 1. Make the development artifacts available

Build the [Once source checkout](https://github.com/namastack/namastack-once) locally:

```bash
./gradlew publishToMavenLocal
```

In your application, add Maven local for this development build, the BOM, a persistence starter and your database driver:

```kotlin
repositories {
    mavenLocal()
    mavenCentral()
}

dependencies {
    implementation(platform("io.namastack:namastack-once-bom:0.1.0-SNAPSHOT"))
    implementation("io.namastack:namastack-once-starter-jdbc")
    runtimeOnly("org.postgresql:postgresql")
}
```

Alternatively run an example directly against the source checkout, as shown in [Examples](examples.md).

## 2. Apply the database schema

Once **never creates or migrates tables**. Apply the matching [database script](persistence/jdbc.md#schema-scripts) with Flyway, Liquibase or your deployment tooling before accepting traffic. For PostgreSQL, the marker schema is:

```sql
CREATE TABLE once_marker (
    idempotency_hash CHAR(64) NOT NULL PRIMARY KEY,
    scope VARCHAR(200) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    expires_at TIMESTAMP(6) NULL
);
CREATE INDEX ix_once_marker_expires_at
    ON once_marker (expires_at, idempotency_hash);
```

For this example, create a business table in the same database:

```sql
CREATE TABLE orders (
    id VARCHAR(36) PRIMARY KEY,
    customer VARCHAR(200) NOT NULL
);
```

Configure your datasource through the normal Spring Boot properties:

```yaml
spring:
  datasource:
    url: ${DATABASE_URL}
    username: ${DATABASE_USER}
    password: ${DATABASE_PASSWORD}
```

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

Call the injected Spring bean from a controller, listener or another bean. Reuse the **same request ID** for retries of the same operation. The first call inserts the order; a second call with the same scope and key skips the method. A `void` method returns normally for both outcomes. Use [IdempotencyResult](usage/programmatic.md) when the caller needs to distinguish them.

Do not add `@Transactional` to this entry point. Once must start and own the transaction. Calls must cross the Spring proxy; self-invocation is not intercepted. Kotlin beans must be open, typically through the Kotlin Spring plugin.

## 4. Verify the failure boundary

If the method throws, its database writes and marker roll back together. A later invocation with the same identity can try again. External calls are not rolled back: put durable outgoing work in [Namastack Outbox](/docs/outbox/) inside the business transaction and process it asynchronously.

Read [transactions and guarantees](concepts/transactions.md) before using finite retention or acknowledging messages.

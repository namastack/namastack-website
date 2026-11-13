---
title: Multiple Once instances
---

Each Once bean is fixed to one persistence resource, transaction manager and marker table or collection. Requests contain the scope, key and retention policy; they do not dynamically select a database.

The auto-configured default bean is named `once`. For multiple JDBC instances, application configuration composes the marker repository and Core execution service explicitly:

```kotlin
@Bean
@Primary
@DependsOnDatabaseInitialization
fun ordersOnce(
    dataSource: DataSource,
    transactionManager: PlatformTransactionManager,
    keyNormalizer: IdempotencyKeyNormalizer,
    clock: Clock,
): IdempotencyOperations {
    val repository = JdbcIdempotencyMarkerRepository(dataSource, transactionManager) {
        JdbcOnceMarkerQueriesFactory.create(
            JdbcDatabaseType.detect(dataSource), "orders_once"
        )
    }
    return DefaultIdempotencyOperations(
        transactionManager, repository, keyNormalizer, clock
    )
}
```

Provision `orders_once` with the matching schema first. A second bean can use another marker table or a separate datasource with its matching manager. Unqualified annotations select the unambiguous/primary bean; `@Idempotent(operationsBean = "billingOnce", ...)` selects a named bean. Programmatic callers use constructor injection with `@Qualifier`.

Instances using separate tables do not deduplicate each other. The shared Core scheduler collects configured instances for cleanup. Read the [complete multiple-instance example](https://github.com/namastack/namastack-once/tree/main/namastack-once-examples/namastack-once-example-multiple-instances) for imports, table initialization and bean selection.

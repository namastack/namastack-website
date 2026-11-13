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

## Auto-configuration and shared services

Defining any `IdempotencyOperations` bean replaces the auto-configured default persistence instance. Configure each required resource explicitly rather than assuming the starter also creates an extra bean named `once`. With several datasources or managers, qualify both constructor arguments for each bean; a primary manager for one database is not automatically correct for another.

Shared infrastructure still supplies the normalizer, clock, annotation adapter and cleanup lifecycle when enabled. Cleanup collects distinct repositories from `DefaultIdempotencyOperations` beans. The example above uses no-op instrumentation; see [observability](../operations/observability.md#explicitly-configured-instances) to instrument manually constructed beans.

MongoDB instances use `MongoIdempotencyMarkerRepository(mongoTemplate, mongoTransactionManager, collectionName)` with the same factory for business documents. JDBC and MongoDB instances can coexist, but each invocation protects only the resource fixed to its selected instance.

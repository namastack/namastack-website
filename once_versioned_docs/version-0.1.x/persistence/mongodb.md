---
title: MongoDB persistence
---

Use `namastack-once-starter-mongodb` instead of the JDBC starter. Native MongoDB transactions require a transaction-capable **replica set or sharded cluster**; a standalone server does not provide the required boundary.

Use the same `MongoDatabaseFactory` for the transaction manager, marker repository and business operations. The starter can supply a `MongoTransactionManager`; select a named manager with `namastack.once.transaction-manager` when needed.

## Provision before traffic

Apply the [MongoDB schema script](https://github.com/namastack/namastack-once/blob/main/namastack-once-mongodb/src/main/resources/schema/mongodb.js) through application/deployment tooling:

```javascript
db.createCollection("once_marker");
db.once_marker.createIndex(
    {expiresAtMicros: 1, _id: 1},
    {name: "ix_once_marker_expires_at"}
);
```

Once does not run collection initialization scripts automatically. Set `namastack.once.mongodb.collection-name` if you provision another collection.

Marker timestamps are BSON Int64 epoch microseconds, **not BSON dates**. Do not attach a MongoDB TTL index to these fields. Once handles retention and cleanup through its own batch lifecycle.

The marker and business documents commit together. Write conflicts remain technical failures for the caller to retry; they are not automatically confirmed duplicates. A later confirmed marker produces the normal duplicate result.

The [MongoDB example](https://github.com/namastack/namastack-once/tree/main/namastack-once-examples/namastack-once-example-mongodb) includes a single-node replica set and application-owned provisioning.

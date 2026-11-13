---
title: Scope and key
---

An identity is the combination of a stable **scope** and a normalized **key** within one marker table or collection. Once hashes that identity for storage. Instances using the same physical marker store share its duplicate-protection namespace.

Scopes are explicit, non-blank strings of at most 200 UTF-16 characters. Use a bounded application namespace such as `billing.issue-invoice`; it is never inferred from a method name. The same key can execute independently in different scopes.

Default key conversion supports strings, UUIDs, numbers and enums. Conversion must produce a non-blank string. Once does not trim or case-fold it. Application converters can support other stable key types; changing conversion or scope names changes the identity.

If an ID is unique only within a tenant or source system, include that namespace in an unambiguous key encoding. Reuse a key only for the same logical business operation. Once does not compare payloads to detect that a caller reused an ID with different data.

Two calls using the same scope and key but different marker tables are independent. Keep [instance selection](../persistence/multiple-instances.md) consistent across callers that must deduplicate each other.

## Register a custom key converter

Spring auto-configuration adds `Converter` beans to Once's dedicated conversion service. Arbitrary objects are not accepted through an implicit `toString()` fallback. For a custom key type:

```java
import java.util.UUID;
import org.springframework.context.annotation.Bean;
import org.springframework.core.convert.converter.Converter;

record RequestKey(UUID value) {}

@Bean
Converter<RequestKey, String> requestKeyConverter() {
    return new Converter<RequestKey, String>() {
        @Override
        public String convert(RequestKey key) {
            return key.value().toString();
        }
    };
}
```

Declare this bean in your Spring configuration. A bean named `onceConversionService` replaces the complete converter registry; an `IdempotencyKeyNormalizer` bean replaces the default normalizer. Keep built-in conversions when replacing the registry if callers still use those key types. A `Clock` bean can replace the default UTC clock used for reservation and cleanup timestamps.

## Stored identity

Once stores a lowercase, 64-character SHA-256 digest of the scope and normalized key. Both UTF-8 components are length-prefixed before hashing, so a delimiter inside either component cannot create an ambiguous boundary. The marker stores the scope and timestamps, but not the original key or business payload. Duplicate result context contains the current invocation's original key in memory; handle it as potentially sensitive data.

Preserve scopes, converter output and the hash encoding across deployments. Changes make existing operations look like new identities, even while their old markers remain.

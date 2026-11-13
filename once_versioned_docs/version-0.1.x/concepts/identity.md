---
title: Scope and key
---

An identity is the combination of a stable **scope** and a normalized **key** within one marker table or collection. Once hashes that identity for storage. Instances using the same physical marker store share its duplicate-protection namespace.

Scopes are explicit, non-blank strings of at most 200 UTF-16 characters. Use a bounded application namespace such as `billing.issue-invoice`; it is never inferred from a method name. The same key can execute independently in different scopes.

Default key conversion supports strings, UUIDs, numbers and enums. Conversion must produce a non-blank string. Once does not trim or case-fold it. Application converters can support other stable key types; changing conversion or scope names changes the identity.

If an ID is unique only within a tenant or source system, include that namespace in an unambiguous key encoding. Reuse a key only for the same logical business operation. Once does not compare payloads to detect that a caller reused an ID with different data.

Two calls using the same scope and key but different marker tables are independent. Keep [instance selection](../persistence/multiple-instances.md) consistent across callers that must deduplicate each other.

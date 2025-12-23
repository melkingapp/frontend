## 2024-05-23 - Cross-feature Component Dependencies
**Learning:** I discovered that `UnitItem` is a shared component used by both `manager` and `resident` features, although it resides in `src/features/manager/unitManagement`.
**Action:** When modifying components in a specific feature, always check for usages across other features using `grep -r "ComponentName" src` to avoid unintended side effects or missed optimizations.

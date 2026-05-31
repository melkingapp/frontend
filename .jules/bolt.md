## 2024-05-24 - React-Redux Referential Equality anti-pattern in useSelector
**Learning:** Returning inline fallback arrays (like `|| []`) directly in `useSelector` creates a new array reference on every single Redux store update, defeating React's referential equality checks and causing massive unnecessary component re-renders.
**Action:** Always define an empty array as a constant (`const EMPTY_ARRAY = []`) outside the hook/component and return that constant instead of `[]` to maintain referential stability.

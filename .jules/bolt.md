# Bolt's Journal

## 2024-05-22 - [Moment.js Performance]
**Learning:** Instantiating `moment` objects within repeated operations (like sort comparators or loops) is a major performance bottleneck.
**Action:** Memoize derived data (like sorted lists) using `useMemo` and parse dates only once or use primitive comparison where possible.

## 2024-05-23 - [Input Field Re-renders]
**Learning:** Passing inline objects or arrays as props to components causes unnecessary re-renders because references change on every render.
**Action:** Define constant objects/arrays outside the component or use `useMemo`.

## 2024-05-24 - [List Item Memoization]
**Learning:** In large lists, if list items are not memoized with `React.memo`, any update to the parent causes all items to re-render.
**Action:** Wrap list item components in `React.memo` and ensure callback props are stable with `useCallback`.

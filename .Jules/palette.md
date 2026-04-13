## 2024-04-13 - [Fieldset Visual Regression]
**Learning:** While <fieldset> and <legend> are standard semantic HTML for grouping inputs, they can cause major visual regressions in styled React applications (like breaking Tailwind's border continuity or background styling).
**Action:** Use a <div> with `role="group"` and `aria-labelledby` linked to the label's `id` (via `useId()`) to achieve the exact same accessibility grouping for screen readers without breaking the visual layout.

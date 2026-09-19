## 2024-05-24 - Accessible Custom Tooltips and Icon Buttons
**Learning:** Custom hover-based tooltips built with `onMouseEnter`/`onMouseLeave` are completely inaccessible to keyboard users unless paired with `onFocus` and `onBlur`. Additionally, icon-only buttons need both `aria-label` for screen readers and `title` for visual hover fallbacks.
**Action:** Always pair mouse hover events with focus events for custom interactive elements, and consistently apply visual focus rings (`focus-visible:ring-2`) and `title` attributes to icon-only controls.

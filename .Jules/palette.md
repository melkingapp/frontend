## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2023-10-27 - Retaining Journal Entries
**Learning:** When maintaining AI agent journal files, I must ALWAYS use the append bash operator (e.g., `cat << 'EOF' >>`) so that prior instructions and learnings are not overwritten or lost.
**Action:** When creating or adding to `.Jules/palette.md` (or any other persona journal), I will double check that my bash command uses `>>` instead of `>`.
## 2023-09-12 - Missing ARIA label and focus ring on mobile menu button
**Learning:** Icon-only buttons used for critical navigation (like mobile menus) frequently lack proper ARIA labels and focus styles in this app's header components, reducing accessibility for screen reader and keyboard users.
**Action:** When working on navigation components, always verify that icon-only buttons include localized `aria-label`s, `title`s, and maintain the app's standard focus rings (e.g., `focus-visible:ring-2 focus-visible:ring-[#D3B66C]`).

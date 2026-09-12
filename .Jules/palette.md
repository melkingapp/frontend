## 2023-09-12 - Missing ARIA label and focus ring on mobile menu button
**Learning:** Icon-only buttons used for critical navigation (like mobile menus) frequently lack proper ARIA labels and focus styles in this app's header components, reducing accessibility for screen reader and keyboard users.
**Action:** When working on navigation components, always verify that icon-only buttons include localized `aria-label`s, `title`s, and maintain the app's standard focus rings (e.g., `focus-visible:ring-2 focus-visible:ring-[#D3B66C]`).

## 2023-10-27 - Retaining Journal Entries
**Learning:** When maintaining AI agent journal files, I must ALWAYS use the append bash operator (e.g., `cat << 'EOF' >>`) so that prior instructions and learnings are not overwritten or lost.
**Action:** When creating or adding to `.Jules/palette.md` (or any other persona journal), I will double check that my bash command uses `>>` instead of `>`.

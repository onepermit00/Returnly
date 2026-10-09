# Returnly — Klarna-inspired first version

Open this folder in VS Code. Install Node.js 22 or later, then run `npm start`. No dependency installation is required. Open http://localhost:4174/index.html, /signup.html or /app.html. For port 4173 in PowerShell, run `$env:PORT='4173'` before `npm start`.

Implemented: local profile setup; editorial photo dashboard and mobile gallery; receipt/order evidence selection; multiple product-photo uploads; manual editable item review; Keep / Return / Decide later; six-product example; sourced return-plan editor; checklist and return progress; actual refund and store-credit totals; calendar deadlines and daily ICS reminders; open-app notifications; CSV import/export and JSON backup.

Existing purchases and preferences keep the `back-purchases-v1` and `back-reminders-v1` keys. Each browser origin has its own records; localhost and 127.0.0.1 are separate origins. Receipt evidence is session-only, not archived. Product photos up to 1.5 MB each can persist, subject to storage quota. Use JSON export to back up purchases. Examples are visibly labeled and included in totals until removed.

Not connected: live AI/OCR, automatic policy research, real account authentication/sync, payments, retailer return submission, SMS and background push. Photos require manual names/prices. Example images are illustrative. Fashion Nova's earlier researched reference must be rechecked against the user's order; other example policies are fictional.

Returned-item count includes sent and received items. Actual cash/credit totals include only recorded received amounts, not pending purchase value. Confirm eligibility, cutoff times, conditions and fees before acting.

Run `npm test` for 11 meaningful checks covering dates, calendar exports, CSV validation, escaping and received-value aggregation. Browser verification covered local setup, real photo upload/review, example review → return plan → sent → actual refund, dashboard update, policy editor, and mobile gallery overflow.

See docs/klarna-design-notes.md for references. The previous design notes remain available. No GitHub push or public deployment was performed.

## Refero precision revision
Dashboard now follows the exact structural language of the three provided Klarna creator/post screens: centered compact profile, circular utility controls, unboxed received totals, four-column media, thin filter labels and black functional footer. Return plans use a narrow media column and a three-by-two information grid, with policy/checklist/reminder disclosures. Sign-in/local onboarding follow Refero Klarna auth flow 1414 with a single centered panel and progressive steps. Online authentication is still not connected; local entry does not verify identity. See docs/refero-precision-notes.md for the screenshot IDs and design decisions. Product text and imagery are Returnly-specific, so this is a close structural reproduction rather than a pixel-identical copy of Klarna's content.

Entry routing: new users finish setup and enter app.html#upload. Returning users continue from signin.html to their dashboard at app.html. The top Add purchase button opens the guided camera/upload flow.

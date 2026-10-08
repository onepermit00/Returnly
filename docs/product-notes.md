# Returnly — On-inspired redesign

Open index.html for the landing page, then choose **Your space** for the desktop app. The active local preview is http://127.0.0.1:4173/index.html while its server is running.

The redesign adapts On's campaign landing pages, catalog cards and account layouts from Refero site 809. It uses original campaign imagery, bold Arial typography, white account surfaces, thin rules and rectangular purchase cards. The screen-by-screen review is in the accompanying back-design-review.md. Existing purchases and reminder preferences retain their storage keys.

## Working features

- Add online and in-store purchases with purchase/delivery dates and policy terms.
- Countdown, search and filters for urgency, policy checks and progress.
- Monthly deadline calendar, month navigation and day filtering.
- Separate potential refunds and credit, actual received amounts, and pending returns.
- Four-stage return timeline and persisted packing checklist.
- CSV upload or paste, validated preview, import confirmation and CSV export. Downloadable template; up to 250 rows. Imported policies need individual confirmation. Repeated imports create duplicates. CSV export contains purchase records, not a full settings/checklist backup.
- Fashion Nova reference researched October 8, 2026, with official source and eligibility confirmation.
- Daily calendar reminders through confirmed deadlines; open-app browser notifications and snooze.
- JSON data export after clearing examples; browser-local purchases/settings without account setup.

## What to know

Examples are labeled and included in totals until cleared. Unknown or unconfirmed policy terms do not count in potential recoverable value. Received totals count actual amounts you enter; pending returns do not count as received. Potential value is before fees.

Dates are calendar estimates. Check exact cutoff times, exclusions and shipping requirements with the retailer. The suggested three-day buffer is not a shipping-time guarantee.

Calendar alerts need enabling in your calendar. Exports are independent copies: update/remove them when the item changes, and avoid duplicate imports. Returnly cannot update previously exported events.

Purchases save on this browser and origin. Clearing browser data removes them. There is no cross-device sync. Live AI policy research, receipt OCR, automatic refund tracking and background notifications are not connected. Browser notifications require permission and an open app.

## Validation

Nine automated tests passed: deadline bases, leap/DST date math, expiry and pending outcomes, unconfirmed eligibility, calendar reminders, escaping, and CSV parsing/validation. Browser checks covered desktop at 1440px and mobile at 390px, calendar day selection, checklist reopening, import preview and separate received totals. No horizontal overflow or JavaScript errors appeared in those checks. Notification permission was not requested during testing.

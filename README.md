# Returnly

A working first version of **Back**, a purchase-return tracker. The landing page and desktop app use an On-inspired editorial design, with original campaign imagery.

## Run locally

Requires Node.js 22 or newer. No dependency install is needed.

```sh
npm start
```

Open http://127.0.0.1:4174/ for the landing page. Choose **Your space** for the app. Set `PORT` to use another port. The development server binds only to localhost.

```sh
npm test
```

Nine tests cover deadline calculations, calendar reminders, eligibility, escaping, and CSV parsing/validation.

## Features

- Online and in-store purchase tracking, countdowns, search and filters.
- Monthly deadline calendar with day selection.
- Separate refund and store-credit totals, pending returns, and actual received amounts.
- Return timeline and saved packing checklist.
- CSV file/paste import with validated preview, template and export.
- Fashion Nova policy reference researched October 8, 2026, with user confirmation.
- Daily calendar reminder exports and notifications while the app is open.

## Project layout

- `index.html`, `landing.css`: landing page.
- `app.html`, `app.js`, `features.js`: application screens and interactions.
- `core.js`: date, eligibility and calendar logic.
- `style.css`, `on.css`: application styles.
- `tests/`: automated tests.
- `docs/`: product notes and review of 100 Refero screen previews/layouts.
- `scripts/serve.cjs`: development server.

## Current limits

Purchases save in browser local storage, scoped to the browser and origin. There is no account or cross-device sync. Clearing browser data removes purchases. Example purchases are labeled and included in totals until cleared.

Live AI policy research, receipt OCR, automatic refund tracking and background push are not connected. The app explains these limits. Unknown or unconfirmed eligibility is excluded from potential value; received totals use amounts entered by the user. Potential value is before fees.

Deadline dates need retailer confirmation, including exclusions, cutoff time and shipping requirements. Exported calendar events are independent copies and require alerts enabled in the calendar app. Update or remove them after changing a purchase.

See [product notes](docs/product-notes.md) and [design review](docs/design-review.md).

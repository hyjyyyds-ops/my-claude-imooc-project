# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **single-file HTML5 expense tracker** ("每日消费记录助手") with a pink/cute visual style. The entire application (HTML, CSS, JavaScript) is contained in `index.html` — no build tools, no npm, no framework dependencies.

## Running the App

Open `index.html` directly in any modern browser. No server required.

```bash
# Optional: local server for mobile testing
python -m http.server 8000
# Then visit http://localhost:8000/index.html
```

## Architecture

- **Single file**: `index.html` contains all HTML, CSS, and JavaScript inline
- **Data storage**: Uses browser `localStorage` — keys prefixed with `expense_` (e.g., `expense_records_v1`)
- **No backend**: All data persists client-side only; no server communication
- **Mobile-first**: Responsive design optimized for 375-430px width, with graceful desktop adaptation (max-width 600px centered)

## Key Implementation Details

- **Categories**: 8 preset categories (餐饮/交通/购物/娱乐/居住/医疗/学习/其他) + user can add custom categories
- **Stats**: Canvas-drawn donut chart for category breakdown; monthly/previous month toggle
- **Streak tracking**: Consecutive day counter stored in `expense_streak_v1` / `expense_last_date_v1`
- **Particle effects**: Success animation uses floating emoji particles on save

## Code Structure (within index.html)

1. **CSS Variables** — Design tokens at top (colors, radii, shadows)
2. **Page Sections** — Header, main content (3 pages: record/detail/stats), bottom tab bar, modal
3. **JavaScript Sections**:
   - Data model constants (DEFAULT_CATEGORIES, EMOJI_OPTIONS)
   - Storage key constants (STORAGE_KEY_*)
   - State variables (currentAmount, selectedCategoryId, records, categories, etc.)
   - init() function — entry point
   - Tab switching, category rendering, number pad handlers
   - Bill list rendering (grouped by date with day emojis)
   - Stats rendering (donut chart via Canvas API, rank list)
   - Particle animation and toast notification helpers

## Related Documents

- `001-产品经理/PRD-每日消费记录助手V1.0.md` — Full product requirements document
- `001-产品经理/EXPENSE-TRACKER-PHILOSOPHY.md` — Design philosophy and aesthetic direction

## Adding New Features

Since this is a single-file app, adding features means editing `index.html` directly. Keep in mind:
- Maintain the pink color scheme (`#FFB7C5`, `#FFD1DC`, `#E6E6FA`)
- Use 16-20px border-radius for cards/buttons
- Follow the existing CSS variable pattern for consistency
- Test on mobile viewport (375px width) for touch targets (min 48px)
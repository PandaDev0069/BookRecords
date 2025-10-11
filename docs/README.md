# Book Records Documentation

Comprehensive reference for the Book Records Next.js application. The main `README.md` in the project root provides a high-level overview—use this documentation set for detailed guidance.

## Documentation Index

- [Testing Guide](./TESTING.md)
- [Testing Summary](./TEST-SUMMARY.md)
- [UUID Implementation Details](./UUID_IMPLEMENTATION.md)
- [Prettier Setup](./PRETTIER_SETUP.md)
- [Prettier Configuration Summary](./PRETTIER_SUMMARY.md)
- [Roadmap](./ROADMAP.md)
- [Release Notes Template](./RELEASE_TEMPLATE.md)

## Project Overview

Book Records is a lightweight reading tracker built for college students. It runs entirely in the browser, stores data inside `localStorage`, and is deployed to Vercel. The application is written in TypeScript, uses the Next.js App Router, and includes component styling with Tailwind CSS.

## Features

### Book Management

- Track multiple statuses: Currently Reading, Want to Read, Completed
- Record different sources: Library, Personal, Borrowed, Digital, Other
- Store cover images as base64 strings (500KB limit)
- Capture rich metadata: title, author, pages, progress, and notes

### Deadline Management

- Log library due dates and surface overdue warnings
- Set personal reading deadlines for any book
- Display daily page goals to hit a deadline on time

### Progress Tracking

- Visual progress bars for each book
- Reading statistics dashboard for totals and completion rates
- Smart sorting to surface in-progress books first

### Search & Filter

- Full-text search across title, author, and notes
- Status-based filtering
- JSON export/import for local backups with validation

## Tech Stack

| Category   | Choice                   |
| ---------- | ------------------------ |
| Framework  | Next.js 14+ (App Router) |
| Language   | TypeScript (strict)      |
| Styling    | Tailwind CSS             |
| Storage    | Browser `localStorage`   |
| Deployment | Vercel                   |

## Getting Started

```bash
npm install
npm run dev
# then open http://localhost:3000
```

For CI parity, run:

```bash
npm run lint
npm run test:ci
npm run build
```

## Usage Highlights

- **Add books**: Click "+ Add Book" and provide required fields (title, author, status).
- **Track progress**: Update the current page or status directly within a book card.
- **Manage deadlines**: Add library return dates and deadlines to trigger reminders and goal calculations.
- **Backup data**: Use export/import actions to save or restore your library as JSON.
- **Import sanitation**: JSON imports automatically normalize numeric IDs to strings before validation.

## Customization

- Colors can be tweaked in `app/globals.css`.
- Extend sources or types in `app/types/book.ts`.
- Adjust UUID logic or storage helpers in `app/utils/`.

## Testing & Quality

- See the [Testing Guide](./TESTING.md) for full details on unit, component, and E2E coverage.
- Review the [Testing Summary](./TEST-SUMMARY.md) for current metrics.
- Formatting is managed through Prettier—refer to [Prettier Setup](./PRETTIER_SETUP.md).

## Future Enhancements

Planned ideas include CSV export, undo/redo history, dark mode, advanced reading statistics, and recommendation features.

## Support

If you run into issues:

1. Check the browser console.
2. Ensure `localStorage` is available and not full.
3. Export data, refresh, and re-import if needed.
4. Clear browser cache as a last resort.

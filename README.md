# Book Records

Book Records is a lightweight Next.js app for tracking your reading list in the browser. It stores everything in `localStorage`, so no backend setup is required to get started.

## Quick Start

```bash
git clone https://github.com/PandaDev0069/BookRecords.git
cd BookRecords
npm install
npm run dev
```

Open `http://localhost:3000` to begin managing your library.

## Core Features

- Organize books by status with rich metadata and optional cover images
- Track deadlines and daily reading goals with built-in reminders
- Monitor progress with a stats dashboard and smart ordering
- Search, filter, export, and import your data as JSON backups

## Tech Overview

- Next.js 14+ (App Router) with TypeScript and Tailwind CSS
- Client-side persistence via `localStorage`
- Tested with Jest, React Testing Library, and Playwright
- Deployed on Vercel (one-click deploy ready)

## Documentation

Detailed guides now live in `docs/`:

- [Full documentation index](docs/README.md)
- [Testing guide](docs/TESTING.md)
- [UUID implementation notes](docs/UUID_IMPLEMENTATION.md)
- [Prettier setup](docs/PRETTIER_SETUP.md)
- [Roadmap](docs/ROADMAP.md)
- [Release notes template](docs/RELEASE_TEMPLATE.md)

## Need Help?

- Check the docs folder for setup, testing, and tooling details
- Export your data before clearing the browser storage
- Open an issue on GitHub if something looks off

Stay current by reviewing the [changelog](CHANGELOG.md) before upgrading.

Happy reading!

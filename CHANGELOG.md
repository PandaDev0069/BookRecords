# Changelog

<!-- markdownlint-disable MD024 -->

All notable changes to this project will be documented in this file. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2025-10-13

### Added

- Enhanced progress bars with animated shimmer effects, striped patterns for in-progress books, and hover glow effects.
- Improved empty states with animated floating book icons, gradient backgrounds, and context-aware CTAs.
- Custom CSS keyframe animations for shimmer, float, fadeIn, and slideUp effects.
- Comprehensive UI/UX documentation in `docs/UI_ENHANCEMENTS.md`.
- Visual upgrade summary in `docs/VISUAL_UPGRADE_SUMMARY.md`.

### Changed

- Modernized visual design with gradient enhancements across all components (main page, cards, stats, modals).
- Enhanced button styles with 3-color gradients (blue → indigo → purple) and scale/shadow effects on hover.
- Upgraded stats cards with gradient backgrounds, accent borders, and hover animations.
- Improved book cards with subtle gradients, enhanced shadows, and lift effects on hover.
- Added backdrop blur to modals and control panels for better visual focus.
- Applied text gradients to main header for modern aesthetic.
- Refined book list, stats, and control panel styling for a cleaner visual hierarchy.
- Normalized imported numeric book IDs to trimmed strings to prevent downstream type conflicts.
- Updated test assertions to match new UI text ("Library return by" instead of "Return by:").

## [1.0.1] - 2025-10-11

### Added

- Dedicated `docs/` directory for detailed technical references.
- Updated root README to highlight essentials and link to documentation.

### Changed

- Documentation structure now encourages concise project overview with deeper guides in the docs index.

## [1.0.0] - 2025-10-10

### Added

- Initial public release of Book Records with Next.js App Router.
- Book management features with status tracking, deadlines, statistics, and JSON export/import.
- Testing setup using Jest, React Testing Library, and Playwright.

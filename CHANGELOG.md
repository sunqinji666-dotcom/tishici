# Changelog

All notable changes to tishici are documented here.

## Unreleased

### Added

- A separate Pocket Notes workspace with its own composer, feed, local draft, and image/video attachments.
- A top-level workspace switch that always defaults to prompts when the site opens.

### Changed

- Prompt and note feeds render six items initially and lazy-load later batches while scrolling instead of using pagination.

## [0.1.0] - 2026-07-27

### Added

- A single-page prompt archive for image and video generation notes.
- Separate image and video model pickers.
- Browser-local draft persistence with IndexedDB and localStorage fallback.
- Browser-side image and video compression for media larger than 1 MiB.
- Full-window drag and drop for image and video files.
- Six-item pagination, copy controls, and in-page media previews.
- Dark-first photographer-inspired interface, motion, particles, and a custom focus cursor.
- Password-gated publishing and deletion while keeping reading public.

### Security

- Publishing credentials are read from `TISHICI_PUBLISH_PASSWORD` at runtime and are not stored in the repository.
- Runtime archives, uploads, local environment files, and release output are excluded from Git.

### Fixed

- Browser video conversion now validates decoding and complete duration, rejecting corrupt or truncated WebM output instead of reporting a false success.

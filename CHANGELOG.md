# Changelog

All notable changes to tishici are documented here.

## Unreleased

## [0.2.0] - 2026-07-27

### Added

- A separate Pocket Notes workspace with its own composer, feed, local draft, and image/video attachments.
- A top-level workspace switch that always defaults to prompts when the site opens.
- Up to 12 mixed image and video attachments per prompt or pocket note.
- Layered media stacks based on the existing contact-sheet visual language.
- A gallery lightbox with previous/next controls, keyboard navigation, and a horizontal filmstrip.

### Changed

- Prompt and note feeds render six items initially and lazy-load later batches while scrolling instead of using pagination.
- Full-window drop and the file picker now accept multiple files in either prompt type.
- Browser-local draft storage now preserves every processed attachment for each workspace.
- Publishing identity is shown beside the composer title instead of occupying a separate form row.
- The PHP API validates and stores multiple uploads without doing server-side transcoding.

### Fixed

- Legacy single-media records continue to render and open in the new gallery.
- Deleting a record removes every attachment in its media group.

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

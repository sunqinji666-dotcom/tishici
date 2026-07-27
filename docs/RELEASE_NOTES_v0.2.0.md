# tishici v0.2.0

Release date: 2026-07-27

## Highlights

- A separate Pocket Notes workspace with its own feed and browser-local draft.
- Up to 12 mixed image and video attachments per prompt or pocket note.
- Multi-file picker and full-window drop, with visible per-file browser compression progress.
- Contact-sheet media stacks that preview the latest three attachments.
- An in-page gallery with previous/next buttons, keyboard navigation, and a horizontal filmstrip.
- Prompt and note feeds start with six cards and lazy-load later batches while scrolling.
- Publishing identity now sits beside the composer title in both workspaces.
- The server validates and stores each processed file but does no image or video transcoding.

## Install

1. Extract `tishici-v0.2.0-web-source.zip`.
2. Set `TISHICI_PUBLISH_PASSWORD` in the PHP 8.1+ runtime.
3. Use `site/` as the document root.
4. Grant PHP write access to `site/uploads/` and the sibling `tishici-storage/` directory.
5. Keep the included `site/.user.ini` or configure equivalent limits for 12 uploads and a 16 MiB request.
6. Open the site in a modern Chromium browser.

## Verify the download

```bash
shasum -a 256 -c tishici-v0.2.0-web-source.zip.sha256
```

## Compatibility

- Server: PHP 8.1 or later.
- Browser: modern Chromium-based browsers are the verified target for local video conversion.
- Media: JPG, PNG, WebP, MP4, WebM, MOV, and M4V input.
- Existing v0.1 single-media JSON records remain readable.

## Known limitations

- This is a lightweight shared-password gate, not a multi-user identity system.
- Published content is public to anyone who can access the site.
- Every attachment must be no larger than 1 MiB after browser processing.
- Compressed video previews retain the complete visual duration but do not retain audio.
- Very long videos may not fit below 1 MiB at usable quality and will be rejected.
- No license is included in this release.

Detailed verification evidence is recorded in [TESTING_v0.2.0.md](TESTING_v0.2.0.md).

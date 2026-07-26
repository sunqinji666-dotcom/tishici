# tishici v0.1.0

Release date: 2026-07-27

## Highlights

- One-page composing and archive view for image and video prompts.
- Browser-local drafts that are removed after a successful publish.
- Image and video conversion starts only for files larger than 1 MiB.
- Playable full-duration WebM validation prevents corrupt previews from being accepted.
- Full-window image/video drop, model pickers, copy actions, media viewer, search, and six-card pagination.
- Password-gated publishing and deletion, with public reading.
- Runtime credentials, published data, and user uploads are excluded from the repository.

## Install

1. Extract `tishici-v0.1.0-web-source.zip`.
2. Set `TISHICI_PUBLISH_PASSWORD` in the PHP 8.1+ runtime.
3. Use `site/` as the document root.
4. Grant PHP write access to `site/uploads/` and the sibling `tishici-storage/` directory.
5. Open the site in a modern Chromium browser.

## Verify the download

```bash
shasum -a 256 -c tishici-v0.1.0-web-source.zip.sha256
```

## Compatibility

- Server: PHP 8.1 or later.
- Browser: modern Chromium-based browsers are the verified target for local video conversion.
- Media: JPG, PNG, WebP, MP4, WebM, and MOV input.

## Known limitations

- This is a lightweight shared-password gate, not a multi-user identity system.
- Published content is public to anyone who can access the site.
- Compressed video previews retain the complete visual duration but do not retain audio.
- Very long videos may not fit below 1 MiB at usable quality and will be rejected.
- No license is included in this release.

Detailed verification evidence is recorded in [TESTING_v0.1.0.md](TESTING_v0.1.0.md).

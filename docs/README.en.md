![Real tishici interface running with synthetic sample data](assets/tishici-hero.png)

# tishici

A personal prompt and pocket-note archive that is ready as soon as the browser opens. It defaults to prompts, while a separate Pocket Notes view keeps quick text, images, and videos in the same two-column workspace.

[简体中文](../README.md) · **English** · [日本語](README.ja.md)

| Project status | Current value |
|---|---|
| Stable version | `v0.2.0` |
| Runtime | PHP 8.1+ and a modern Chromium browser |
| License | No license provided |
| Last verified | 2026-07-27 |

[Download latest](https://github.com/sunqinji666-dotcom/tishici/releases/latest) · [Quick start](#quick-start) · [Live site](https://tishici.jack-sun.com/) · [Star the project](https://github.com/sunqinji666-dotcom/tishici)

## What it is

tishici is a small self-hosted archive for personal creative notes. Prompt mode keeps the generation model, title, prompt, and up to 12 image/video attachments together on a card. Pocket Notes provides a separate composer and feed for quick thoughts, tasks, images, or videos.

The interface opens in a photographer-inspired dark mode and always defaults to prompts. The feed renders six cards initially and lazy-loads more while scrolling, with search, sorting, copy, delete, and an in-page translucent media viewer.

## Why it is useful

- **Read immediately:** visitors can view, search, copy, and open published items without an account.
- **Gate publishing:** publishing and deletion require the same runtime password, remembered for the current session after verification.
- **Keep drafts local:** typing or selecting media automatically stores the draft in IndexedDB, with a text fallback in localStorage. A successful publish removes the draft.
- **Keep modes separate:** prompts and pocket notes have independent local drafts and feeds, so switching never overwrites either draft.
- **Compress in the browser:** files at or below 1 MiB remain unchanged. Larger files are converted locally; the server only validates type and size.
- **Mix images and videos:** image/video model pickers remain independent, while either prompt type and Pocket Notes can accept several images and videos in one selection or drop.
- **Scan quickly:** media groups appear as a three-layer contact-sheet stack. Open one to navigate with arrows, keyboard keys, or the bottom filmstrip. The feed starts with six cards and loads the next batch as you scroll.

## Quick start

PHP 8.1 or later is required.

```bash
git clone https://github.com/sunqinji666-dotcom/tishici.git
cd tishici
cp .env.example .env
```

Edit the local `.env` and set a password used only for publishing and deletion. Never commit the real `.env`.

```bash
set -a
. ./.env
set +a
php -S 127.0.0.1:8080 -t site
```

Open `http://127.0.0.1:8080/`.

For production, expose only `site/` as the document root and set `TISHICI_PUBLISH_PASSWORD` in the PHP-FPM runtime. PHP also needs write access to `site/uploads/` and the sibling `tishici-storage/` directory. `ops/tishici-cache-control.conf` contains an optional nginx no-cache rule for the entry page.

## How it works

```text
Type a prompt or pocket note / drop media
            ↓
Browser saves a local draft
            ↓
File ≤ 1 MiB ─────────────────┐
File > 1 MiB → local conversion ├→ password check → published card
                                │
Server validates type and size ─┘
            ↓
Successful publish clears the local draft
```

Images are converted to WebP. Videos become playable WebM visual previews below 1 MiB, and the browser verifies that the result is decodable and retains the complete duration. To prioritize the picture and full duration, compressed previews do not retain audio.

## Features and boundaries

| Capability | Behavior |
|---|---|
| Image input | JPG, PNG, WebP |
| Video input | MP4, WebM, MOV |
| Media per item | Up to 12 mixed images and videos |
| Compression threshold | Starts only when the file is strictly larger than 1 MiB |
| Server limit | Result must be no larger than 1 MiB; no server-side transcoding |
| Drafts | IndexedDB with localStorage text fallback |
| Workspaces | Prompts by default; Pocket Notes opens only when selected |
| Archive | Search, ascending/descending order, six initial cards with lazy loading |
| Access control | Public reading; password-gated publish and delete |
| Storage | JSON index in `tishici-storage/`, media in `site/uploads/` |

This is a lightweight shared-password gate for a personal site, not a multi-user identity system. It has no roles, password recovery, audit trail, or rate limiting. Add stronger access control at the reverse proxy if the archive should not be public.

## Real interface and concept images

The first image on this page is a real 1600×800 capture of this build. All cards and media in the capture are synthetic and contain no private production data.

> **Concept illustration / 概念示意:** prompts and generated results are filed like photographic negatives. It does not claim additional UI functionality; the README and Release notes are the source of truth.

![Concept illustration of archiving prompts with generated results](assets/concept-archive.png)

> **Concept illustration / 概念示意:** the browser handles a large file locally before sending a lightweight preview.

![Concept illustration of browser-local compression](assets/concept-compression.png)

> **Concept illustration / 概念示意:** unpublished drafts remain local while a lightweight password gates publishing.

![Concept illustration of local drafts and the publishing gate](assets/concept-private-draft.png)

## Privacy and security

- The repository contains no real publishing password; the app reads `TISHICI_PUBLISH_PASSWORD` at runtime.
- `.env`, runtime JSON, user uploads, drafts, and release output are excluded from Git.
- Image and video conversion happens in the browser; the server does not transcode media.
- Drafts are not proactively synchronized to the server and are deleted from browser storage after a successful publish.
- Published content is visible to anyone who can access the site. Do not publish secrets, client data, or private media.
- The project does not claim end-to-end encryption or a complete identity system.

## Project structure

```text
.
├── site/
│   ├── index.html          # Single-page interface
│   ├── styles.css          # Darkroom design and responsive layout
│   ├── app.js              # Drafts, compression, drop, archive, viewer
│   ├── api.php             # Publish, list, delete, server validation
│   └── uploads/            # Runtime media; real files are never committed
├── ops/
│   └── tishici-cache-control.conf
├── docs/
│   ├── README.en.md
│   ├── README.ja.md
│   └── assets/
├── CHANGELOG.md
└── VERSION
```

## Version and downloads

The current version is `v0.2.0`. Download `tishici-v0.2.0-web-source.zip` from [GitHub Releases](https://github.com/sunqinji666-dotcom/tishici/releases/latest), then verify it with the matching `.sha256` file:

```bash
shasum -a 256 -c tishici-v0.2.0-web-source.zip.sha256
```

See [CHANGELOG.md](../CHANGELOG.md) and the full [v0.2.0 release notes](RELEASE_NOTES_v0.2.0.md).

## FAQ

### Why is there no full account system?

tishici is intended as a personal prompt shelf. Public reading with password-gated writing stays lightweight, but it is not suitable for team collaboration or sensitive content.

### Why does video become WebM?

When a video is larger than 1 MiB, a modern Chromium browser can re-record it locally as a compact WebM preview. The app prioritizes playability and complete duration, so visual quality decreases as duration grows.

### What does “no license” mean?

The repository currently provides no open-source license and therefore grants no additional permission to copy, modify, or redistribute the code. The owner may choose a license later.

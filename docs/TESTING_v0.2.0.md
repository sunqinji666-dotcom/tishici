# tishici v0.2.0 verification

Verified on 2026-07-27.

| Check | Result |
|---|---|
| JavaScript syntax | `node --check site/app.js` passed |
| PHP syntax | PHP 8.3.25 `php -l` passed with no errors |
| Diff integrity | `git diff --check` passed |
| Default workspace | A clean browser session opened in Prompt mode |
| Desktop layout | 1600×800 real build rendered a three-column archive |
| Lazy feed | Production loaded six of eight records initially |
| Identity placement | Publish/Save identity appeared beside each composer title; no bottom identity row remained |
| Multi-file input | File picker accepted multiple files and both prompt types accepted images and videos |
| Draft isolation | Prompt and Pocket Notes restored their own text and media after switching |
| Draft media | Two local images restored from IndexedDB as one media group |
| Media stack | Three attachments used the source-referenced −9° / +7° / −2° layered geometry |
| Gallery | Previous/next buttons, ArrowLeft/ArrowRight, and filmstrip selection switched mixed media |
| Video switching | Moving between image and video slides paused and replaced the previous video source |
| Mobile layout | 390×844 viewport had no horizontal overflow; gallery remained within viewport bounds |
| Multi-upload API | Two files were stored in `mediaItems`, with the first item mirrored to legacy fields |
| Group deletion | Deleting the temporary record removed its JSON entry and every uploaded file |
| Legacy data | All eight existing production records loaded through the single-media compatibility path |
| Production data | `prompts.json` SHA-256 remained unchanged across deployment |
| Secret scan | No high-confidence key, token, private-key, proxy, or hardcoded production password match in release sources |
| Runtime exclusions | `.env`, archive JSON, uploads, local test tools, and release output are Git-ignored |

The browser checks used isolated task spaces and deterministic synthetic archive content. Temporary API files and server test directories were removed after verification.

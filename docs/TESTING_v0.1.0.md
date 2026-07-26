# tishici v0.1.0 verification

Verified on 2026-07-27.

| Check | Result |
|---|---|
| JavaScript syntax | `node --check site/app.js` passed |
| PHP syntax | PHP 8.3.25 `php -l` passed with no errors |
| Desktop layout | 1600×800 real build rendered six cards on one page |
| Media viewer | Image preview opened and closed inside the current page |
| Image threshold | 339 KiB PNG remained unchanged |
| Image conversion | 1.58 MiB PNG became a 70 KiB WebP in the browser |
| Draft lifecycle | Text/media draft saved locally; successful publish cleared it |
| Pagination | Publishing item 7 changed the archive from page `1 / 1` to `1 / 2` |
| Video conversion | 8.083 s local MP4 became a playable 761 KiB WebM at 1470×630 |
| Video duration | Converted preview reported the complete 8.083 s duration |
| Corrupt video defense | Undecodable output was rejected instead of being accepted |
| Secret scan | No high-confidence key, token, private-key, proxy, or hardcoded publishing-password match in release sources |
| Runtime exclusions | `.env`, archive JSON, uploads, local test tools, and release output are Git-ignored |

The browser interaction checks used a deterministic local preview service with synthetic archive content. The representative media inputs were used only on the local machine and are not included in the repository or source archive.

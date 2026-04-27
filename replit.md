# humanaid

A Korean-language digital magazine focused on the intersection of humanity, AI, and technology.

## Tech Stack

- **Frontend**: Static HTML5 + CSS3 (no build tools or frameworks)
- **Fonts**: Google Fonts (Noto Sans KR, Noto Serif KR, IBM Plex Mono)
- **Assets**: Inline SVG graphics

## Project Structure

- `index.html` — Main magazine homepage
- `builder-hub.html` — Builder Hub community section
- `field-notes.html` — Field Notes section

## Development

The site is served using Python's built-in HTTP server:

```
python3 -m http.server 5000 --bind 0.0.0.0
```

## Deployment

Configured as a static site deployment with the root directory (`.`) as the public directory.

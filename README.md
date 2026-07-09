# DVH-Hatchet1 — Strategic Account Landing Pages

Personalized enterprise sales landing pages for strategic Cursor accounts.

## Pages

| Account | Path | Description |
|---------|------|-------------|
| **Airbnb** | [`index.html`](index.html) | Agent-first engineering for Project Y — Coinbase proof points, Calendly booking |
| **Zillow** | [`zillow/index.html`](zillow/index.html) | Strategic account preview — protecting $150M+ technology investment |

## Live Site

**GitHub Pages:** https://dalton-design-dvh.github.io/DVH-Hatchet1/

## Local Preview

```bash
npm run serve
# or: python3 -m http.server 8080
```

Then visit:

- Airbnb: [http://localhost:8080](http://localhost:8080)
- Zillow: [http://localhost:8080/zillow/](http://localhost:8080/zillow/)

## Airbnb Page — Features

- **Executive POV** — Why Cursor / Why Now messaging
- **Coinbase Case Study** — 90%+ time-to-market reduction proof points
- **Platform Capabilities** — Composer, `.cursorrules`, AirDev integration, ZDR security
- **Calendly Booking Modal** — Inline demo scheduling with LinkedIn fallback
- **Resource Hub** — Global account team & resources

## Configuration

Edit `config.js` to set your personal Calendly URL:

```js
window.SITE_CONFIG = {
  calendlyUrl: 'https://calendly.com/your-name/cursor-demo',
  linkedinUrl: 'https://www.linkedin.com/in/daltonvanhatcher/',
  // ...
};
```

## Intelligence Updates

Manual update:

```bash
npm run update-intel
```

Automated: GitHub Actions runs daily at 8:00 UTC via `.github/workflows/update-intelligence.yml`.

## Links

- [Book a Demo](https://calendly.com/daltonvanhatcher/cursor-demo) (modal on site)
- [Dalton Van Hatcher — LinkedIn](https://www.linkedin.com/in/daltonvanhatcher/)
- [Cursor Enterprise Contact](https://cursor.com/contact-sales)

## Deployment

Pushes to `main` trigger automatic GitHub Pages deployment via `.github/workflows/deploy.yml`.

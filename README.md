# Cursor × Airbnb — Strategic Sales Landing Page

A personalized enterprise sales landing page for the Airbnb account, positioning Cursor's agent-first engineering platform.

## Live Site

**GitHub Pages:** https://dalton-design-dvh.github.io/DVH-Hatchet1/

## Local Preview

```bash
npm run serve
# or: python3 -m http.server 8080
```

Then visit [http://localhost:8080](http://localhost:8080).

## Features

- **Executive POV** — Why Do Anything / Why Cursor / Why Now messaging
- **Coinbase Case Study** — 90%+ time-to-market reduction proof points
- **Platform Capabilities** — Composer, `.cursorrules`, AirDev integration, ZDR security
- **Live Intelligence Feed** — Auto-updated from Google News RSS (daily cron)
- **Outreach Playbook** — Anna Sulkina entry strategy with ecosystem warm intros
- **Calendly Booking Modal** — Inline demo scheduling with LinkedIn fallback
- **7 Key Stakeholder Personas** — Tailored messaging for engineering leadership

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

Pushes to `main` or `cursor/airbnb-landing-page-eb29` trigger automatic GitHub Pages deployment via `.github/workflows/deploy.yml`.

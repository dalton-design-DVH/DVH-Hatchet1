# Deployment Setup

The site deploys automatically via GitHub Actions once Pages is enabled.

## One-Time Enable (2 minutes)

1. Open [Repository Settings → Pages](https://github.com/dalton-design-DVH/DVH-Hatchet1/settings/pages)
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. Go to [Actions → Deploy to GitHub Pages](https://github.com/dalton-design-DVH/DVH-Hatchet1/actions/workflows/deploy.yml)
4. Click **Run workflow** on branch `cursor/airbnb-landing-page-eb29` (or `main` after merge)

## Live URL

Once deployed:

**https://dalton-design-dvh.github.io/DVH-Hatchet1/**

## Calendly Setup

Update your personal booking link in `config.js`:

```js
calendlyUrl: 'https://calendly.com/YOUR-USERNAME/cursor-demo',
```

## Intelligence Feed

- Runs automatically on every deploy
- Daily cron at 8:00 UTC updates `data/intelligence.json`
- Manual: `npm run update-intel`

## Local Preview

```bash
npm run serve
# Visit http://localhost:8080
```

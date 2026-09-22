# Job Application Assistant

A privacy-first Chrome extension that fills repetitive job application fields while keeping applicant data inside the browser.

## Current features

- Manifest V3 extension for Chrome
- local applicant profile
- common contact and professional fields
- React-compatible native events
- open shadow-root and same-origin iframe support
- existing values are never overwritten

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
```

Load the generated `dist/` directory through `chrome://extensions` with Developer mode enabled.

## Privacy

Applicant information is stored in `chrome.storage.local`. Personal details and credentials must never be committed.

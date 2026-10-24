# Sohaib AI (private website)

This project uses OpenRouter instead of Google AI Studio. It includes a password-protected sign-in and keeps the OpenRouter key on the server.

## Requirements
- Node.js 20 or newer
- An OpenRouter API key (free model availability and quotas are limited)
- A hosting provider that can run a Node.js/Express server

## Run locally
1. Install Node.js.
2. In this folder run `npm install`.
3. Copy `.env.example` to `.env`.
4. Set `OPENROUTER_API_KEY`, `APP_PASSWORD`, and `SESSION_SECRET` in `.env`.
5. Run `npm run dev`.
6. Open `http://localhost:3000`.

Generate a session secret with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.

## Deploy
This is a full-stack Node/Express app, not a static-only site. Deploy it to a host that supports a persistent Node.js web service. Set environment variables in the host's secret/environment settings; do not upload `.env`. Set `NODE_ENV=production`, `OPENROUTER_API_KEY`, `APP_PASSWORD`, `SESSION_SECRET`, and optionally `OPENROUTER_MODEL` / `APP_URL`. Build command: `npm install && npm run build`. Start command: `npm start`.

The `openrouter/free` router can select an available free model, but free model availability and quotas are not guaranteed. This project is not guaranteed to run at zero cost forever.

## Privacy
The app's login protects access to the chat API. Conversation history in the existing UI is stored in the browser's local storage on each device, not synchronized to a server. Use a strong unique password and keep secrets private.

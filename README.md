# Portfolio Website

Evan Cillie’s personal portfolio, built with React, TypeScript, Vite, React Router, and Tailwind CSS.

## Local development

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`).

## Vercel

Use the Vite framework preset, `npm run build`, and the `dist` output directory. `vercel.json` rewrites direct page requests to the single-page app.

## Oracle deployment

Build with `npm run build` and serve the `dist` directory. Configure the web server
to serve existing files directly and fall back to `index.html` for application
routes. Serve `/logging-config.json` with `Cache-Control: no-store` so changes take
effect on the next page load. This file can be edited in `dist` after the build:

```json
{
  "level": "info",
  "endpoint": "/api/logs"
}
```

The endpoint is optional. To collect production logs, route that path to an Oracle
hosted service that accepts JSON `POST` requests and stores or forwards each entry.
Keep that route outside the SPA fallback. The site itself is static and does not
provide a production log receiver. Do not put tokens or credentials in this public
config file. The endpoint must be a same origin path.

## Content updates

See `CONTENT_GUIDE.md`. The short version:

- Homepage and bio copy live in `data/site.ts`.
- Profile links and grouped skills also live in `data/site.ts`.
- Featured project and case-study records live in `data/projects.ts`.
- Resume entries live in `data/resumes.ts`; PDF files go in `public/resumes/`.
- Experience entries, accomplishment bullets, and supporting tools live in `data/experience.ts`.

## Checks

```bash
npm run build
npm run lint
npm test
```

## Browser logging

The app writes structured entries to the browser console with a timestamp, severity,
event name, and optional context and error details. It captures uncaught JavaScript
errors, unhandled promise rejections, and React rendering errors. Logs are sent to
the configured endpoint only when one is set.

Every page click emits an `info` entry named `browser.click`, including clicks on
plain page content, links, and buttons. Middle and right clicks are captured through
`auxclick`; keyboard and touch activations that generate clicks are included too.
Entries include a plain-language `description`, such as
`Clicked "Aviation Resume" button on "Resumes" in "Choose a resume to preview"`.
They also identify the action (navigation, download, selection, or toggle), page,
section or project card, clicked element, control label, mouse button, click count,
and coordinates. Labels use accessible names and omit decorative arrows and icons;
resume buttons and PDF downloads identify the specific resume. Toggle and selection
entries include their state before the click. Link destinations omit query strings and
fragments, and form field values are not recorded. Use `data-log-label` on a control
to provide a custom label, `data-log-section` to name a region, or `data-log-action`
to describe a control's purpose. Known in-page links identify the destination
section by name. Capture runs before application handlers, so clicks that
stop propagation or navigate away are logged. Clicks inside an embedded document
(such as the PDF viewer) belong to that document and cannot be observed by the page.

When running `npm run dev` and visiting `localhost`, `127.0.0.1`, or `[::1]`, logs
also append to `logs/localhost.txt` in the project folder. Each line is a JSON log
entry. The file is created automatically and excluded from Git; entries persist
across server restarts. An `app.initialized` entry confirms logging on page load
with the default development log level. You can follow the file with:

```bash
tail -f logs/localhost.txt
```

File logging is only available on the Vite development server, not production
builds or `npm run preview`. Requests must come from the same localhost origin.
If writing fails, logs remain visible in the console and a warning appears once.

Development enables `debug` and above. Production enables `warn` and `error`.
Click logs are therefore included by default locally; use an `info` or `debug`
level to include them in production console output and the configured endpoint.
Set `level` in `logging-config.json` to `debug`, `info`, `warn`, `error`, or `silent`.
The file is read on each page load; an invalid runtime level falls back to the build
setting. You can also set `VITE_LOG_LEVEL` before building as a fallback. Invalid
build settings use the environment default. If the config file cannot be loaded,
logging continues with that fallback. A failed endpoint request warns once in the
browser console.

For new instrumentation, use the shared logger setup in `src/main.tsx`. It resolves
runtime settings and chooses the configured HTTP endpoint or the local file sink.
For example, `logger.info('resume.download', { context: { filename } })`.
Automatic page context includes only the pathname, without query strings or hashes.
Error messages and stacks are retained for debugging; avoid including credentials or
personal data in messages or custom context.

The tests use Node's built-in test runner and TypeScript stripping (Node 22.13+).

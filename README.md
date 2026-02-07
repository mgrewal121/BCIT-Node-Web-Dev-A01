# Node A01 — Portfolio Launchpad

**Node & Express + Hybrid Pages + Projects API + Client Render**  
(Starter UI + Starter Data)

## Goal

Build an Express server that:

1. Serves HTML pages from `src/pages/` (no templating yet)
2. Serves static assets from `public/`
3. Exposes a JSON API for project data that the Projects page renders dynamically using `fetch()` + vanilla JS

**Important:** Your WebDevTnT A05 portfolio UI is due next weekend. For A01, you’ll use the provided starter UI + starter dataset. Next week you’ll swap in your A05 UI. (Yes, this is intentional. No, you don’t get to suffer twice.)

---

## What’s Included in the Starter Repo

- `data/projects.sample.json` (6 projects, correct schema)
- `src/pages/*.html` starter shells
- `public/css/styles.css` starter stylesheet (single CSS file)
- `public/js/projects.js` starter JS file (you will complete it)

You may modify the starter HTML/CSS, but you are **not** graded on “portfolio design” yet.

---

## Learning Outcomes

- Express routing + middleware
- Static hosting via `express.static`
- Page routing via `res.sendFile()` with safe pathing
- Simple REST-ish JSON endpoints
- Reading JSON data from disk
- `fetch()` + DOM rendering with vanilla JS
- Basic code organization using Express Routers

---

## Required Tech

- Node.js + Express
- Vanilla frontend JS (no frameworks)
- Plain CSS (single file: `/css/styles.css`)

---

## Required Repo Structure

This structure is required (names matter):

```
/server.js

/src
  /server
    /routes
      pages.routes.js
      api.routes.js
  /pages
    index.html
    about.html
    projects.html
    contact.html

/public
  /css
    styles.css
  /js
    projects.js
    contact.js
  /images
    /projects
      /<slug>
        cover.png
        screen.png

/data
  projects.json

ai-interaction-log.txt
README.md
package.json
```

**Rule:**

- `src/pages` = HTML pages served by Express routes
- `public` = static assets (CSS/JS/images)
- `src/server/routes` = Express Router modules (page routes + API routes)

---

## Setup

```bash
npm install
npm run dev
```

Open:

- `http://localhost:3000/`

---

## NPM Scripts (Required)

Your repo must support:

- `npm run dev` — runs the server in watch mode
- `npm start` — starts the server normally (no watch)

Required scripts:

```json
{
  "scripts": {
    "dev": "node --watch server.js",
    "start": "node server.js"
  }
}
```

---

## AI Usage Requirement (Required)

You must include an **`ai-interaction-log.txt`** in the root of your repo describing how you used AI (if at all) while completing this assignment.

Include:

- Which tool(s) you used (ChatGPT, Copilot, etc.)
- What you used it for (debugging, generating starter code, explaining concepts, etc.)
- At least **3 bullet points** summarizing specific prompts/questions you asked
- What you changed after receiving AI output (your own decisions)

**Using AI is allowed and encouraged. Not logging your usage is not.**

---

## Server Requirements

### Middleware (Required)

In `server.js`:

- Request logger: `morgan('dev')` (or equivalent)
- Static files: `express.static('public')`
- JSON: `express.json()`
- Form parsing: `express.urlencoded({ extended: true })`

### Router Requirement (Required)

You must use Express Routers:

- `src/server/routes/pages.routes.js` handles all page routes
- `src/server/routes/api.routes.js` handles all `/api` routes

Mount them from `server.js`:

- `app.use('/', pagesRouter)`
- `app.use('/api', apiRouter)`

---

## Page Routes (Required)

Serve these files from `src/pages` using `res.sendFile()`:

- `GET /` → `src/pages/index.html`
- `GET /about` → `src/pages/about.html`
- `GET /projects` → `src/pages/projects.html`
- `GET /contact` → `src/pages/contact.html`

**Implementation rule:** No hard-coded absolute paths. Use `path.join()` (or `path.resolve()`) with a safe base directory.

---

## Contact Form Requirements (Updated)

### HTML requirement

Your `src/pages/contact.html` must include a response area **above the form**:

```html
<section id="form_response"></section>

<form id="contact_form" method="POST" action="/contact">
  <!-- name, email, message inputs -->
</form>

<script src="/js/contact.js" defer></script>
```

### POST route requirement

`POST /contact` must:

- Accept: `name`, `email`, `message`
- Log the submission to the server console
- Return JSON (not HTML)

**Success (HTTP 200):**

```json
{ "ok": true, "message": "Thank you, NAME! We have received your message." }
```

**Missing fields (HTTP 400):**

```json
{ "ok": false, "error": "Please provide name, email, and message." }
```

### Frontend requirement

`public/js/contact.js` must:

- Intercept submit (no full page reload)
- POST to `/contact` using `fetch`
- Replace `#form_response.innerHTML` with a success/error message
- Allow multiple submissions (no page reload required)

---

## 404 Handling (Required)

- Unknown `/api/*` routes: JSON `{ "error": "Not found" }`
- Other unknown routes: simple text 404 is fine

---

## API Requirements

### 1) List Projects

`GET /api/projects` returns an **array** of projects.

**Required behavior:**

- Return only projects where `status === true`

**Optional filter:**
`GET /api/projects?q=tailwind`

Filter matches:

- `title`, `tagline`, `description`
- any item in `stack`
- any item in `tags`

### 2) Project Details

`GET /api/projects/:id` returns one project object.

If not found:

- HTTP 404

```json
{ "error": "Project not found" }
```

### Response rules

- `/api/*` always returns JSON
- Correct status codes (200, 400, 404, 500)

---

## Data Contract (Required)

Create `/data/projects.json` by copying the provided sample file. Minimum: **6 projects**.

Top-level shape:

```json
{ "projects": [] }
```

Each project must match:

```json
{
  "id": "p-2001",
  "slug": "vanilla-js-game",
  "title": "Neon Dodger",
  "tagline": "One short sentence",
  "description": "A short paragraph",
  "status": true,
  "stack": ["node", "express", "mongodb"],
  "tags": ["crud", "api", "routing"],
  "images": [
    {
      "path": "/images/projects/vanilla-js-game/cover.png",
      "alt": "Cover image description",
      "type": "cover"
    },
    {
      "path": "/images/projects/vanilla-js-game/screen.png",
      "alt": "Screenshot description",
      "type": "screenshot"
    }
  ],
  "dates": { "created": "2026-01-08", "updated": "2026-02-01" }
}
```

Rules:

- `id` unique + stable
- `slug` unique + kebab-case
- `status` boolean
- `stack`, `tags` arrays of strings
- `images` contains **exactly 2** objects
  - `type` is `"cover"` or `"screenshot"`
  - `path` begins with `/images/`
  - `alt` is meaningful
- dates are `YYYY-MM-DD`

### Projects to Include (SSD-aligned)

Your dataset must include these 6 themes (names can vary):

- Vanilla JavaScript Game (invent one)
- React Movie Database
- News-Style Landing Page
- Node/Express/Mongo Data-Driven Portfolio
- Ecommerce Site
- One more program-relevant project (API, auth, Docker, testing, etc.)

---

## Frontend Requirements (Projects Page)

### `src/pages/projects.html` must include:

- A container element (example: `<div id="projects-container"></div>`)
- A details area (example: `<section id="project-details"></section>`)
- A script reference to `/js/projects.js`
- A stylesheet link to `/css/styles.css` (single CSS file)

### `public/js/projects.js` must:

- `fetch('/api/projects')`
- Render project cards into the container
- Each card shows: `title`, `tagline`, **stack chips**
- If a project has an image with `type === "cover"`, show it in the card
- On click (or a Details button), `fetch('/api/projects/:id')` and render details

Details view must include:

- `title`, `tagline`, `description`
- `tags` chips
- **All available images** from `project.images[]` using `path` + `alt`
- Basic error UI if a fetch fails

---

## Styling Requirements (Lightweight)

Plain CSS is fine. You are not graded on high-end design yet.

Minimum:

- Projects list is readable and spaced
- Cards have basic layout and separation
- Details area is distinct
- Only one CSS file is loaded: `/css/styles.css`

---

## Submission Checklist

Before you submit, confirm:

- [ ] `npm install` works
- [ ] `npm run dev` starts cleanly
- [ ] All pages load: `/`, `/about`, `/projects`, `/contact`
- [ ] Static assets load: `/css/styles.css`, your JS files, and project images
- [ ] API works: `/api/projects`, `/api/projects/:id`
- [ ] 404 rules work (API returns JSON error)
- [ ] `/contact` POST returns JSON and updates `#form_response` via JS
- [ ] `ai-interaction-log.txt` exists and is filled out
- [ ] `README.md` is updated if you changed routes/assumptions

---

## Stretch Goals (Bonus)

- Search input wired to `?q=`
- Sort projects (by `dates.updated` or `title`)
- Better empty/error UI (loading state, “no matches”, “not found”)

---

## License (Required)

This starter repo is licensed under **Node2Know Learner License 1.0**: **`Node2Know-LEARN-1.0`**.

Your submission repo **must**:

- include a `LICENSE` file containing the full text of **Node2Know-LEARN-1.0**
- keep this License section in `README.md`
- set `"license": "Node2Know-LEARN-1.0"` in `package.json`

**Identifier:** `Node2Know-LEARN-1.0`

## Attribution (Required)

Starter code and assignment materials © **Joshua Solomon**, used under **Node2Know-LEARN-1.0**.

This repository contains student modifications built on the provided Node2Know starter.

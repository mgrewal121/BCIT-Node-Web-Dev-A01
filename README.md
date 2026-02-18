# Node A02 - Portfolio with EJS View Engine

A Node.js/Express portfolio site refactored to use EJS templating with layouts, partials, and server-side rendering.

## Installation
```bash
npm install
```

## Running the App
```bash
npm run dev    # Development mode (auto-restart)
npm start      # Production mode
```

Server runs on `http://localhost:3000`

## Routes

### HTML Pages (Templated with EJS)
- `GET /` - Home
- `GET /about` - About
- `GET /projects` - Projects list with search
- `GET /projects?q=<query>` - Search/filter projects
- `GET /projects/:slug` - Project detail page (sidebar layout)
- `GET /contact` - Contact form
- `POST /contact` - Form submission (renders success page)
- `GET *` - 404 page (any invalid route)

### API (JSON Responses)
- `GET /api/projects` - List all active projects
- `GET /api/projects?q=<query>` - Search/filter projects
- `GET /api/projects/:id` - Get single project by ID
- `GET /api/*` - JSON 404 for unknown API routes

## Project Structure
```
├── server.js                       # Express server with EJS config
├── src/
│   └── server/
│       ├── routes/
│       │   ├── pages.routes.js    # HTML routes (EJS rendering)
│       │   └── api.routes.js      # JSON API routes
│       └── lib/
│           └── projects.repository.js  # Centralized data access
├── views/
│   ├── layouts/
│   │   ├── layout-full.ejs        # Full-width layout
│   │   └── layout-sidebar.ejs     # Sidebar layout (project details)
│   ├── partials/
│   │   ├── nav.ejs                # Navigation
│   │   ├── footer.ejs             # Footer
│   │   ├── project-card.ejs       # Project card component
│   │   └── other-projects-list.ejs # Sidebar project list
│   ├── index.ejs                  # Home page
│   ├── about.ejs                  # About page
│   ├── projects.ejs               # Projects listing
│   ├── project-details.ejs        # Project detail page
│   ├── contact.ejs                # Contact form
│   ├── contact-success.ejs        # Form success page
│   └── 404.ejs                    # 404 error page
├── public/                        # Static assets (CSS, images)
│   ├── css/styles.css
│   └── images/projects/
├── data/
│   └── projects.json              # Project data (6 projects)
└── README.md
```

## Key Features (A02 Requirements)

### View Engine
- **EJS** templating with server-side rendering
- All HTML routes use `res.render()` instead of static files

### Two Layouts
- **Full-width layout**: Used by home, about, projects list, contact, and 404
- **Sidebar layout**: Used by project detail pages with "Other Projects" sidebar

### Partials
- **nav.ejs**: Reusable navigation
- **footer.ejs**: Reusable footer
- **project-card.ejs**: Project card component (used in projects list)
- **other-projects-list.ejs**: Sidebar component (used in project details)

### Search Functionality
- Works on both HTML (`/projects?q=term`) and API (`/api/projects?q=term`) routes
- Case-insensitive matching across: title, tagline, description, stack, tags
- Partial matches allowed (e.g., `q=java` matches "JavaScript")

### Data Repository Pattern
- Centralized data access in `projects.repository.js`
- Provides methods: `getActiveProjects()`, `getProjectById()`, `getProjectBySlug()`, `getOtherActiveProjects()`
- Eliminates code duplication across routes

## Notes/Assumptions

- Only projects with `status: true` are shown in public lists
- `status: false` projects exist in `projects.json` but are hidden from listings
- Inactive projects can still be accessed directly by ID via API
- Contact form submissions are logged to console and render a success page
- Project detail pages use the slug (URL-safe identifier) instead of ID
- All 6 projects from A01 retained with proper image paths

## Changes from A01

| Feature | A01 | A02 |
|---------|-----|-----|
| HTML Rendering | Static files (`res.sendFile()`) | EJS templates (`res.render()`) |
| Layout | Duplicated HTML structure | Reusable layouts |
| Navigation/Footer | Copy-pasted in every file | Single partials |
| Project Details | No dedicated page | New route with sidebar layout |
| Search | Not implemented | Required on both HTML & API |
| Contact Success | JSON response | Templated success page |
| 404 Page | Plain text | Templated with layout |
| Data Access | Inline in routes | Centralized repository |

## Tech Stack

Node.js, Express, EJS, Vanilla JavaScript, HTML/CSS

---

**Author**: Mohan Grewal  
**Course**: BCIT Web Development - Node A02  
**Assignment**: View Engine Refactor with Layouts & Partials

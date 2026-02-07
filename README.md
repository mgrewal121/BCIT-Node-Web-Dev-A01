# Node A01 - Portfolio Launchpad

A Node.js/Express portfolio site with dynamic project rendering via a JSON API.

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

### Pages
- `GET /` - Home
- `GET /about` - About
- `GET /projects` - Projects (dynamic)
- `GET /contact` - Contact
- `POST /contact` - Form submission

### API
- `GET /api/projects` - List all active projects
- `GET /api/projects?q=<query>` - Search projects
- `GET /api/projects/:id` - Get single project

## Project Structure
```
├── server.js
├── src/
│   ├── server/routes/     # Express routers
│   └── pages/             # HTML pages
├── public/                # Static assets (CSS, JS, images)
├── data/
│   └── projects.json      # Project data
```

## Notes/Assumptions

- Only projects with `status: true` are shown in the list. `status: false` projects are in projects.json
- Assumed the 6 projects in json and the provided images are the projects I can use for the website!
- Inactive projects can still be accessed by ID via API
- Contact form submissions are logged to console

## Tech Stack

Node.js, Express, Vanilla JavaScript, HTML/CSS

---

**Author**: Mohan Grewal 
**Course**: BCIT Web Development - Node A01
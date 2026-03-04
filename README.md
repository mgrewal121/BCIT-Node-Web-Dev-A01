# Node A03 - Portfolio with MongoDB Integration

A Node.js/Express portfolio site with MongoDB Atlas, Mongoose ODM, and a mini CMS for managing projects, categories, and contact submissions.

## Installation
```bash
npm install
```

## Environment Setup

Create a `.env` file in the project root:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolioDB?retryWrites=true&w=majority
PORT=3000
NODE_ENV=development
```

**Important:** Replace the `MONGODB_URI` with your actual MongoDB Atlas connection string.

### Environment Variables Used

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB Atlas connection string with database name | Yes |
| `PORT` | Server port (default: 3000) | No |
| `NODE_ENV` | Environment mode (development/production) | No |

## Database Setup

### Seed Initial Data
```bash
npm run seed
```

This creates:
- 3 categories (Web Development, Game Development, API Development)
- 6 projects (4 active, 2 inactive)
- All projects have category assignments and tags

## Running the App
```bash
npm run dev    # Development mode (auto-restart)
npm start      # Production mode
npm run seed   # Seed database with initial data
```

Server runs on `http://localhost:3000`

## Routes Overview

### Public HTML Pages (Templated with EJS)
- `GET /` - Home
- `GET /about` - About
- `GET /projects` - Projects list with search and tag filtering
- `GET /projects?q=<query>` - Search projects
- `GET /projects?tag=<tagName>` - Filter by tag
- `GET /projects/category/:slug` - Browse projects by category
- `GET /projects/:slug` - Project detail page (sidebar layout)
- `GET /contact` - Contact form
- `POST /contact` - Form submission (saves to MongoDB)
- `GET *` - 404 page

### Admin CMS Routes
- `GET /admin` - Admin dashboard
- `GET /admin/contacts` - Manage contact submissions
- `GET /admin/categories` - Manage categories (CRUD)
- `GET /admin/projects` - Manage projects (CRUD)

### API (JSON Responses)
- `GET /api/projects` - List all active projects
- `GET /api/projects?q=<query>` - Search projects
- `GET /api/projects?tag=<tagName>` - Filter by tag
- `GET /api/projects/category/:slug` - Projects by category
- `GET /api/projects/:id` - Get single project by ID
- `GET /api/categories` - List all categories
- `GET /api/*` - JSON 404 for unknown routes

## Project Structure
```
├── server.js                       # Express server with MongoDB connection
├── scripts/
│   └── seed.js                    # Database seeding script
├── src/
│   └── server/
│       ├── config/
│       │   └── database.js        # MongoDB connection setup
│       ├── models/
│       │   ├── category.js        # Category model
│       │   ├── project.js         # Project model (with embedded tags)
│       │   ├── contact.js         # Contact model
│       │   └── index.js           # Model exports
│       ├── routes/
│       │   ├── pages.routes.js    # Public HTML routes
│       │   ├── api.routes.js      # JSON API routes
│       │   └── admin.routes.js    # Admin CMS routes
│       └── lib/
│           └── projects.repository.js  # Data access layer
├── views/
│   ├── layouts/
│   │   ├── layout-full.ejs        # Full-width layout
│   │   └── layout-sidebar.ejs     # Sidebar layout
│   ├── partials/
│   │   ├── nav.ejs                # Navigation (with Admin link)
│   │   ├── footer.ejs             # Footer
│   │   ├── project-card.ejs       # Project card component
│   │   └── other-projects-list.ejs # Sidebar project list
│   ├── admin/
│   │   ├── dashboard.ejs          # Admin dashboard
│   │   ├── contacts.ejs           # Contact submissions list
│   │   ├── categories.ejs         # Categories list
│   │   ├── category-form.ejs      # Category create/edit
│   │   ├── projects.ejs           # Projects list
│   │   └── project-form.ejs       # Project create/edit
│   ├── index.ejs                  # Home page
│   ├── about.ejs                  # About page
│   ├── projects.ejs               # Projects listing
│   ├── project-details.ejs        # Project detail page
│   ├── contact.ejs                # Contact form
│   ├── contact-success.ejs        # Form success page
│   └── 404.ejs                    # 404 error page
├── public/                        # Static assets
│   ├── css/styles.css             # All styles (public + admin)
│   └── images/projects/
├── .env                           # Environment variables (not in git)
├── .gitignore                     # Git ignore rules
└── README.md
```

## Key Features (A03 Requirements)

### MongoDB Integration
- MongoDB Atlas cloud database
- Mongoose ODM for schema modeling
- Environment-based configuration
- Graceful connection error handling

### Data Models
- **Categories:** name, slug, description (referenced by projects)
- **Projects:** slug, title, description, isActive, embedded tags, categoryId reference
- **Contacts:** name, email, message, postedDate, isRead flag

### Filtering & Search
- Text search on projects (title, description, tagline, stack)
- Tag filtering via query string
- Category browsing via dedicated routes
- Works on both HTML and API endpoints

### Admin CMS
- **Contacts:** List, mark read/unread, delete
- **Categories:** Full CRUD with safe deletion (prevents deletion when projects reference it)
- **Projects:** Full CRUD with category assignment and tag management

### Repository Pattern
- Centralized async data access in `projects.repository.js`
- Methods: `getActiveProjects()`, `getProjectById()`, `getProjectBySlug()`, `getProjectsByCategory()`, `getAllProjects()`
- Uses MongoDB queries with `.populate()` for related data

## Changes from A02

| Feature | A02 | A03 |
|---------|-----|-----|
| Data Source | JSON file | MongoDB Atlas |
| Data Access | Synchronous | Async (Promises) |
| Contact Form | Logs to console | Saves to database |
| Projects | No categories | Category assignment required |
| Tags | Array of strings | Embedded documents |
| Admin Panel | None | Full CMS for all content |
| Filtering | Search only | Search + tags + categories |
| API | Active projects | Includes categories endpoint |

## Notes/Assumptions

- Only projects with `isActive: true` are shown publicly
- Inactive projects exist in database but are hidden
- Contact submissions default to `isRead: false`
- Categories cannot be deleted if projects reference them
- Admin routes are unprotected (no authentication in A03)
- Project images are not uploaded via admin (out of scope)

## Tech Stack

Node.js, Express, EJS, MongoDB Atlas, Mongoose, dotenv

---

**Author**: Mohan Grewal  
**Course**: BCIT Web Development - Node A03  
**Assignment**: MongoDB Integration + Mini CMS

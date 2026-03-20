# Node A04 - Portfolio CMS with Authentication & Image Uploads

A Node.js/Express portfolio CMS with Passport.js authentication, role-based access control (RBAC), and project image management using Multer.

## Installation
```bash
npm install
```

## Environment Setup

Create a `.env` file in the project root:

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolioDB?retryWrites=true&w=majority

# Server Configuration
PORT=3000
NODE_ENV=development

# Session Secret (generate a random string)
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Test User Credentials (for instructor evaluation)
TEST_USER_EMAIL=user@test.com
TEST_USER_PASSWORD=testuser123

TEST_MODERATOR_EMAIL=mod@test.com
TEST_MODERATOR_PASSWORD=testmod123

TEST_ADMIN_EMAIL=admin@test.com
TEST_ADMIN_PASSWORD=testadmin123
```

**Important:** 
- Replace `MONGODB_URI` with your actual MongoDB Atlas connection string
- Generate a secure `SESSION_SECRET` (32+ random characters)

### Environment Variables Used

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB Atlas connection string with database name | Yes |
| `PORT` | Server port (default: 3000) | No |
| `NODE_ENV` | Environment mode (development/production) | No |
| `SESSION_SECRET` | Secret key for session encryption | Yes |
| `TEST_USER_EMAIL` | Test USER account email | Yes |
| `TEST_USER_PASSWORD` | Test USER account password | Yes |
| `TEST_MODERATOR_EMAIL` | Test MODERATOR account email | Yes |
| `TEST_MODERATOR_PASSWORD` | Test MODERATOR account password | Yes |
| `TEST_ADMIN_EMAIL` | Test ADMIN account email | Yes |
| `TEST_ADMIN_PASSWORD` | Test ADMIN account password | Yes |

## Database Setup

### Seed Initial Data
```bash
npm run seed
```

This creates:
- 3 test users (USER, MODERATOR, ADMIN)
- 3 categories (Web Development, Game Development, API Development)
- 6 projects (4 active, 2 inactive) with featured images
- All projects have category assignments and tags

## Running the App
```bash
npm run dev    # Development mode (auto-restart)
npm start      # Production mode
npm run seed   # Seed database with initial data
```

Server runs on `http://localhost:3000`

## Test User Credentials

For instructor evaluation, three test users are seeded:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| USER | user@test.com | testuser123 | Public access only |
| MODERATOR | mod@test.com | testmod123 | View/toggle contacts |
| ADMIN | admin@test.com | testadmin123 | Full system access |

## Routes Overview

### Authentication Routes
- `GET /auth/login` - Login page
- `POST /auth/login` - Handle login
- `GET /auth/register` - Registration page
- `POST /auth/register` - Handle registration (creates USER role)
- `GET /auth/logout` - Logout (also accepts POST)

### Public HTML Pages (Templated with EJS)
- `GET /` - Home
- `GET /about` - About
- `GET /projects` - Projects list with search and tag filtering
- `GET /projects?q=<query>` - Search projects
- `GET /projects?tag=<tagName>` - Filter by tag
- `GET /projects/category/:slug` - Browse projects by category
- `GET /projects/:slug` - Project detail page (shows featured image + gallery)
- `GET /contact` - Contact form
- `POST /contact` - Form submission (saves to MongoDB)
- `GET *` - 404 page

### Admin CMS Routes (Protected by RBAC)
**Dashboard (MODERATOR+):**
- `GET /admin` - Admin dashboard with stats

**Contacts (MODERATOR+ can view/toggle, ADMIN can delete):**
- `GET /admin/contacts` - List contact submissions
- `PATCH /admin/contacts/:id/read` - Toggle read/unread (MODERATOR+)
- `DELETE /admin/contacts/:id` - Delete contact (ADMIN only)

**Categories (ADMIN only):**
- `GET /admin/categories` - List categories with project counts
- `GET /admin/categories/new` - Create category form
- `POST /admin/categories` - Create category
- `GET /admin/categories/:id/edit` - Edit category form
- `POST /admin/categories/:id` - Update category
- `DELETE /admin/categories/:id` - Delete category (safe deletion enforced)

**Projects (ADMIN only):**
- `GET /admin/projects` - List all projects
- `GET /admin/projects/new` - Create project form
- `POST /admin/projects` - Create project
- `GET /admin/projects/:id/edit` - Edit project form
- `POST /admin/projects/:id` - Update project
- `DELETE /admin/projects/:id` - Delete project

**Image Management (ADMIN only):**
- `GET /admin/projects/:id/images` - Manage project images
- `POST /admin/projects/:id/images` - Upload image
- `PATCH /admin/projects/:projectId/images/:imageId/featured` - Set featured image
- `DELETE /admin/projects/:projectId/images/:imageId` - Delete image

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
├── server.js                       # Express server with auth & sessions
├── scripts/
│   └── seed.js                    # Database seeding (includes test users)
├── src/
│   └── server/
│       ├── config/
│       │   ├── database.js        # MongoDB connection
│       │   ├── passport.js        # Passport local strategy
│       │   └── multer.js          # File upload configuration
│       ├── models/
│       │   ├── user.js            # User model (email, nickname, role)
│       │   ├── category.js        # Category model
│       │   ├── project.js         # Project model (with images)
│       │   ├── contact.js         # Contact model
│       │   └── index.js           # Model exports
│       ├── middleware/
│       │   └── auth.js            # Auth middleware (isAuthenticated, isModerator, isAdmin)
│       ├── routes/
│       │   ├── auth.routes.js     # Authentication routes
│       │   ├── pages.routes.js    # Public HTML routes
│       │   ├── api.routes.js      # JSON API routes
│       │   └── admin.routes.js    # Admin CMS routes (RBAC protected)
│       └── lib/
│           └── projects.repository.js  # Data access layer
├── views/
│   ├── layouts/
│   │   ├── layout-full.ejs        # Full-width layout
│   │   └── layout-sidebar.ejs     # Sidebar layout
│   ├── partials/
│   │   ├── nav.ejs                # Navigation (with auth UI)
│   │   ├── footer.ejs             # Footer
│   │   ├── project-card.ejs       # Project card (with featured image)
│   │   └── other-projects-list.ejs # Sidebar project list
│   ├── auth/
│   │   ├── login.ejs              # Login page
│   │   └── register.ejs           # Registration page
│   ├── admin/
│   │   ├── dashboard.ejs          # Admin dashboard (role-specific)
│   │   ├── contacts.ejs           # Contacts management
│   │   ├── categories.ejs         # Categories list
│   │   ├── category-form.ejs      # Category create/edit
│   │   ├── projects.ejs           # Projects list
│   │   ├── project-form.ejs       # Project create/edit
│   │   └── project-images.ejs     # Image upload & management
│   ├── index.ejs                  # Home page
│   ├── about.ejs                  # About page
│   ├── projects.ejs               # Projects listing
│   ├── project-details.ejs        # Project detail (hero + gallery)
│   ├── contact.ejs                # Contact form
│   ├── contact-success.ejs        # Form success page
│   ├── 403.ejs                    # Forbidden page
│   └── 404.ejs                    # Not found page
├── public/
│   ├── css/styles.css             # All styles (public + admin + auth)
│   ├── uploads/                   # Uploaded project images
│   └── images/projects/           # Seed project images
├── logs/
│   ├── .gitkeep                   # Keep logs directory in git
│   └── access-denied.log          # Unauthorized access attempts
├── .env                           # Environment variables (included in submission)
├── .gitignore                     # Git ignore rules
└── README.md
```

## Key Features (A04 Requirements)

### Authentication & Authorization
- **Passport.js** local strategy with session-based auth
- **Bcrypt** password hashing
- **Session store** persisted in MongoDB
- **Registration** creates USER role by default
- **RBAC** enforced across all admin routes

### User Roles & Permissions

**USER:**
- Can register, login, logout
- Access to all public pages
- Cannot access admin panel

**MODERATOR:**
- All USER permissions
- View admin dashboard
- View contact submissions
- Toggle contact read/unread status
- Cannot delete contacts
- Cannot manage projects or categories

**ADMIN:**
- All MODERATOR permissions
- Delete contact submissions
- Full CRUD on categories
- Full CRUD on projects
- Upload/manage project images
- Manage users (if implemented)

### Image Upload & Management
- **Multer** for handling multipart/form-data
- Images stored in `/public/uploads/`
- Paths stored as site-root relative (`/uploads/filename.jpg`)
- Each project can have multiple images
- One image marked as **featured** (displayed on cards/detail hero)
- Gallery displays non-featured images
- File validation (5MB max, images only)

### Navbar Updates
- Shows **Login** button when logged out
- Shows **Logout** button when logged in
- Displays user **nickname** when authenticated
- Shows **role badge** for MODERATOR (yellow) and ADMIN (red)
- **Admin link** visible only to MODERATOR and ADMIN

### Access Control Logging
- All unauthorized access attempts logged to `/logs/access-denied.log`
- Log format: `[timestamp] DENIED - User: [id] ([role]) | Required: [role] | [method] [path] | IP: [ip]`
- Includes attempts by logged-in users with insufficient privileges

### Data Models

**User:**
- `email` (string, unique, required)
- `nickname` (string, required)
- `passwordHash` (string, required, bcrypt hashed)
- `role` (enum: USER, MODERATOR, ADMIN)
- `lastLogin` (Date)

**Category:**
- `name` (string, required)
- `slug` (string, unique, required)
- `description` (string)

**Project:**
- `slug` (string, unique, required)
- `title` (string, required)
- `description` (string, required)
- `isActive` (boolean)
- `tags` (embedded array: `[{name}]`)
- `categoryId` (ObjectId reference)
- `stack` (array of strings)
- `images` (embedded array: `[{path, alt, isFeatured}]`)

**Contact:**
- `name` (string, required)
- `email` (string, required)
- `message` (string, required)
- `postedDate` (Date)
- `isRead` (boolean, default false)

## Changes from A03

| Feature | A03 | A04 |
|---------|-----|-----|
| Authentication | None | Passport.js local strategy |
| User Accounts | None | Registration + 3 test users |
| Authorization | None | Role-based (USER, MODERATOR, ADMIN) |
| Admin Access | Unprotected | Protected by auth middleware |
| Contacts Delete | Anyone | ADMIN only |
| Image Upload | Not implemented | Multer file upload |
| Project Images | Static paths only | Upload + set featured + delete |
| Navbar | Static | Dynamic auth UI |
| Access Logging | None | Logs denied access attempts |
| Sessions | None | MongoDB-backed sessions |
| Passwords | N/A | Bcrypt hashed |

## Security Features

- Passwords hashed with bcrypt (salt rounds: 10)
- Session secrets stored in `.env` (not in code)
- HTTP-only cookies (prevents XSS)
- Session timeout: 7 days
- CSRF protection via same-origin policy
- File upload validation (type and size)
- MongoDB injection protection (Mongoose sanitization)

## Notes/Assumptions

- Only projects with `isActive: true` shown publicly
- Inactive projects exist in database but are hidden
- Contact submissions default to `isRead: false`
- Categories cannot be deleted if projects reference them
- Self-registration always creates USER role
- Only admins can elevate user roles
- Uploaded images included in submission
- `.env` file included in submission for instructor
- Test user credentials in `.env` for easy evaluation

## Tech Stack

**Backend:** Node.js, Express.js  
**Database:** MongoDB Atlas, Mongoose ODM  
**Authentication:** Passport.js (local strategy), express-session, bcrypt  
**File Upload:** Multer  
**Templating:** EJS  
**Styling:** CSS  
**Dev Tools:** dotenv, morgan, nodemon

---

**Author:** Mohan Grewal  
**Course:** BCIT Web Development - Node A04  
**Assignment:** Authentication, RBAC & Image Uploads

require('dotenv').config();
const mongoose = require('mongoose');
const { Category, Project } = require('../src/server/models');

// Categories
const categories = [
  {
    name: 'Web Development',
    slug: 'web-development',
    description: 'Full-stack web applications and websites'
  },
  {
    name: 'Game Development',
    slug: 'game-development',
    description: 'Interactive games and game mechanics'
  },
  {
    name: 'API Development',
    slug: 'api-development',
    description: 'RESTful APIs and backend services'
  }
];

// Projects (will be created after categories to get ObjectIds)
const getProjects = (categoryMap) => [
  {
    slug: 'vanilla-js-game',
    title: 'Neon Dodger',
    tagline: 'A fast little arcade game built with pure JavaScript.',
    description: 'A keyboard-controlled browser game with collision detection, scoring, difficulty scaling, and a restart loop. Built without frameworks to focus on DOM, events, timing, and state.',
    isActive: true,
    tags: [
      { name: 'dom' },
      { name: 'events' },
      { name: 'game-loop' },
      { name: 'state' }
    ],
    categoryId: categoryMap['game-development'],
    stack: ['html', 'css', 'javascript'],
    images: [
      {
        path: '/images/projects/vanilla-js-game/cover.png',
        alt: 'Neon Dodger title screen with a glowing player icon and score panel',
        type: 'cover'
      },
      {
        path: '/images/projects/vanilla-js-game/gameplay.png',
        alt: 'Gameplay showing obstacles, score, and remaining lives',
        type: 'screenshot'
      }
    ],
    dates: {
      created: '2025-09-18',
      updated: '2025-10-02'
    }
  },
  {
    slug: 'react-movie-database',
    title: 'ReelFinder',
    tagline: 'Search, filter, and favorite movies in React.',
    description: 'A React app that consumes a movie API, supports search and filters, shows detail pages, and persists favorites. Focus on components, state, routing, and async fetching.',
    isActive: true,
    tags: [
      { name: 'spa' },
      { name: 'fetch' },
      { name: 'routing' },
      { name: 'state' }
    ],
    categoryId: categoryMap['web-development'],
    stack: ['react', 'javascript', 'css', 'api'],
    images: [
      {
        path: '/images/projects/react-movie-database/cover.png',
        alt: 'ReelFinder home page with a movie search bar and poster grid',
        type: 'cover'
      },
      {
        path: '/images/projects/react-movie-database/details.png',
        alt: 'Movie detail page with poster, rating, cast list, and favorite button',
        type: 'screenshot'
      }
    ],
    dates: {
      created: '2025-11-03',
      updated: '2025-11-14'
    }
  },
  {
    slug: 'news-style-landing-page',
    title: 'Daily Byte',
    tagline: 'A responsive, news-style landing page.',
    description: 'A layout-focused project with hero, featured stories, categories, and a responsive grid. Emphasis on typography, spacing, and mobile-first design.',
    isActive: true,
    tags: [
      { name: 'responsive' },
      { name: 'grid' },
      { name: 'typography' },
      { name: 'layout' }
    ],
    categoryId: categoryMap['web-development'],
    stack: ['html', 'css', 'sass'],
    images: [
      {
        path: '/images/projects/news-style-landing-page/cover.png',
        alt: 'Daily Byte landing page with hero headline and featured stories grid',
        type: 'cover'
      },
      {
        path: '/images/projects/news-style-landing-page/mobile.png',
        alt: 'Mobile layout showing stacked story cards and a hamburger menu',
        type: 'screenshot'
      }
    ],
    dates: {
      created: '2025-10-10',
      updated: '2025-10-18'
    }
  },
  {
    slug: 'node-express-mongo-portfolio',
    title: 'Portfolio API + Views',
    tagline: 'A data-driven portfolio powered by Node, Express, and MongoDB.',
    description: 'Server-rendered portfolio pages backed by MongoDB. Projects load from the database, detail pages use slugs, and an admin route supports basic CRUD for entries.',
    isActive: true,
    tags: [
      { name: 'server-rendered' },
      { name: 'crud' },
      { name: 'routing' },
      { name: 'database' }
    ],
    categoryId: categoryMap['api-development'],
    stack: ['node', 'express', 'mongodb', 'mongoose', 'ejs'],
    images: [
      {
        path: '/images/projects/node-express-mongo-portfolio/cover.png',
        alt: 'Portfolio home showing project cards rendered from MongoDB data',
        type: 'cover'
      },
      {
        path: '/images/projects/node-express-mongo-portfolio/admin.png',
        alt: 'Admin screen with project create/edit form and validation messages',
        type: 'screenshot'
      }
    ],
    dates: {
      created: '2026-01-08',
      updated: '2026-02-01'
    }
  },
  {
    slug: 'ecommerce-site',
    title: 'Cartonaut',
    tagline: 'A mini e-commerce site with cart and checkout flow.',
    description: 'Product listing, product details, cart management, and a mock checkout. Focus on reusable UI components, state management, and basic validation.',
    isActive: false,
    tags: [
      { name: 'ecommerce' },
      { name: 'cart' },
      { name: 'forms' },
      { name: 'validation' }
    ],
    categoryId: categoryMap['web-development'],
    stack: ['react', 'javascript', 'node', 'express'],
    images: [
      {
        path: '/images/projects/ecommerce-site/cover.png',
        alt: 'Cartonaut product grid with filters and a cart badge in the header',
        type: 'cover'
      },
      {
        path: '/images/projects/ecommerce-site/cart.png',
        alt: 'Cart page with line items, quantity controls, and order summary',
        type: 'screenshot'
      }
    ],
    dates: {
      created: '2025-12-02',
      updated: '2025-12-16'
    }
  },
  {
    slug: 'devops-containerized-api',
    title: 'Containerized Notes API',
    tagline: 'A small API shipped like a grown-up.',
    description: 'A Node/Express REST API for notes with environment-based config and a Dockerized dev/prod setup. Built to practice deployment-thinking: ports, env vars, and repeatable builds.',
    isActive: false,
    tags: [
      { name: 'rest' },
      { name: 'containers' },
      { name: 'env' },
      { name: 'deployment' }
    ],
    categoryId: categoryMap['api-development'],
    stack: ['node', 'express', 'docker'],
    images: [
      {
        path: '/images/projects/devops-containerized-api/cover.png',
        alt: 'Terminal output showing docker compose running the API service',
        type: 'cover'
      },
      {
        path: '/images/projects/devops-containerized-api/swagger.png',
        alt: 'API documentation page showing endpoints and example responses',
        type: 'screenshot'
      }
    ],
    dates: {
      created: '2026-01-22',
      updated: '2026-01-29'
    }
  }
];

async function seed() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Category.deleteMany({});
    await Project.deleteMany({});
    console.log('Cleared existing data');

    // Create categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`Created ${createdCategories.length} categories`);

    // Create a category map
    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.slug] = cat._id;
    });

    // Create projects with category references
    const projects = getProjects(categoryMap);
    const createdProjects = await Project.insertMany(projects);
    console.log(`Created ${createdProjects.length} projects`);

    console.log('\n Database seeded successfully!');
    console.log(`   Categories: ${createdCategories.length}`);
    console.log(`   Projects: ${createdProjects.length}`);
    console.log(`   Active projects: ${createdProjects.filter(p => p.isActive).length}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
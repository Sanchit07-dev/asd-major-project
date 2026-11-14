# NST Learning Hub

> A syllabus-specific, community-powered platform where NST students discover, share, review, rate, and bookmark reliable academic learning resources.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Coming%20Soon-amber?style=flat-square)](https://your-live-demo-url.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](./LICENSE)

---

## Screenshots

> _Add screenshots here once deployed._

---

## Features

- **Authentication & Profiles** — Secure email sign-up/sign-in via Supabase Auth with auto-synced user profiles.
- **Syllabus Hierarchy** — Resources organised by Semester (1–8) → Subject → Topic.
- **Search & Filter** — Real-time search by title/description, filter by semester, subject, and resource type (`video`, `pdf`, `article`, `notes`, `github`, `other`), sort by top-rated or newest.
- **Ratings & Reviews** — 1–5 star ratings with written comments, one review per user per resource, in-place edit and delete.
- **Bookmarks** — One-click save from cards or detail pages; view saved resources in your personal library.
- **Resource CRUD** — Authors can edit or delete their own submissions; students can delete their reviews from their profile.
- **Share** — One-click resource URL copy with instant feedback.
- **Mobile-friendly** — Responsive layout with a hamburger navigation menu on small screens.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS v4, Framer Motion, React Router 7 |
| Backend / DB / Auth | Supabase (PostgreSQL + Row Level Security) |
| Linting | Oxlint |

---

## Project Structure

```
asd-major-project/
├── public/                    # Static assets (favicon.svg, …)
├── scripts/
│   └── supabase_test.js       # Standalone connection/demo script
├── src/
│   ├── components/
│   │   ├── Field.jsx           # Form input wrapper
│   │   ├── LoadingSpinner.jsx  # Accessible loading indicator
│   │   ├── Navbar.jsx          # Responsive navigation header
│   │   ├── ProtectedRoute.jsx  # Auth-gated route guard
│   │   ├── ResourceCard.jsx    # Resource list item with ratings & bookmark toggle
│   │   └── StarRating.jsx      # Interactive 5-star rating component
│   ├── context/
│   │   └── AuthContext.jsx     # Global Supabase auth provider
│   ├── lib/
│   │   ├── bookmarks.js        # Bookmark queries & optimistic toggle
│   │   ├── intro.js            # First-load animation state
│   │   └── supabase.js         # Supabase client initialisation
│   ├── pages/
│   │   ├── AddResource.jsx     # Resource contribution form
│   │   ├── Browse.jsx          # Search, filter & paginated browse
│   │   ├── Home.jsx            # Landing page with syllabus overview
│   │   ├── Login.jsx           # Sign-in page
│   │   ├── Profile.jsx         # User dashboard (submissions, bookmarks, reviews)
│   │   ├── ResourceDetail.jsx  # Detail view, rating form, share & creator controls
│   │   └── Signup.jsx          # Registration page
│   ├── App.jsx                 # Root router & shell layout
│   ├── index.css               # Tailwind v4 theme & animation tokens
│   └── main.jsx                # React root mount
├── supabase/
│   └── schema.sql              # Full PostgreSQL DDL, RLS policies, views & seed data
├── .env.example                # Environment variable template
├── LICENSE
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- A [Supabase](https://supabase.com) project

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/Sanchit07-dev/asd-major-project.git
cd asd-major-project

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
```

Open `.env.local` and fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

```bash
# 4. Initialise the database
#    Run supabase/schema.sql in your Supabase project's SQL Editor.

# 5. Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run Oxlint |
| `node scripts/supabase_test.js` | Standalone Supabase connection test |

---

## Database Architecture

The platform uses a zero-trust Row Level Security (RLS) model in PostgreSQL.

| Table / View | Description |
|---|---|
| `profiles` | User info synced from `auth.users` via DB trigger |
| `subjects` | Academic subjects tagged by semester (1–8) |
| `topics` | Sub-topics linked to subjects |
| `resources` | Learning materials contributed by authenticated students |
| `reviews` | Ratings + comments; unique per `(resource_id, user_id)` |
| `bookmarks` | Saved resources; unique per `(user_id, resource_id)` |
| `resource_stats` | View: live avg rating & review count per resource |

---

## Live Demo

> 🚀 **[Add your live demo URL here once deployed]**

---

## Contributing

Pull requests are welcome. Please open an issue first to discuss what you'd like to change.

---

## License

[MIT](./LICENSE)

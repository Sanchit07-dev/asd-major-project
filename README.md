# NST Learning Hub

A syllabus-specific, community-powered platform where NST students discover, share, review, rate, and bookmark reliable academic learning resources.

---

## Key Features

- **Authentication & Profiles:** Secure email authentication via Supabase Auth with automated profile synchronization triggers.
- **Syllabus Hierarchy:** Resources categorized systematically by Semester (1–8) → Subject → Topic.
- **Resource Discovery & Search:**
  - Real-time client-side search across resource titles and descriptions.
  - Multi-filtering by semester, subject, and resource type (`video`, `pdf`, `article`, `notes`, `github`, `other`).
  - Sorting by top-rated or newest submissions.
- **Interactive Ratings & Reviews:**
  - 1–5 star rating system with written commentary.
  - One review per user per resource with in-place editing and deletion.
  - Dynamic `resource_stats` SQL view calculating real-time average ratings and review counts.
- **Personal Library & Bookmarks:**
  - One-click bookmarking ("Save for later") directly from resource cards or detail pages with optimistic UI updates.
  - Dedicated "Saved Bookmarks" view in user profile for quick revision access.
- **Author Management & Ownership (CRUD):**
  - Resource creators can edit title, URL, type, and description.
  - Resource creators can delete their submissions safely.
  - Students can manage and delete their submitted reviews directly from their profile.
- **Share & Collaboration:** One-click resource link copying with instant feedback notifications.

---

## Tech Stack

- **Frontend:** React 19, Vite 8, Tailwind CSS v4, Framer Motion, React Router 7
- **Backend / Database / Auth:** Supabase (PostgreSQL with Row Level Security)
- **Linter & Tooling:** Oxlint, PostCSS

---

## Database Architecture & Security

The platform utilizes a zero-trust Row Level Security (RLS) model in PostgreSQL.

### Tables & Views
1. `profiles`: User information synced automatically with `auth.users` via database triggers.
2. `subjects`: Academic subjects tagged by semester (1 to 8).
3. `topics`: Sub-topics linked via foreign key to subjects.
4. `resources`: Learning materials contributed by authenticated students.
5. `reviews`: User ratings and comments with a composite unique constraint on `(resource_id, user_id)`.
6. `bookmarks`: Saved resources with unique constraint on `(user_id, resource_id)`.
7. `resource_stats` (View): Aggregated calculation of `avg_rating` and `review_count` per resource.

### Row Level Security (RLS)
- **Read Policies:** All subjects, topics, resources, and reviews are publicly viewable.
- **Write Policies:** Restricted strictly to authenticated users.
- **Modify/Delete Policies:** Only the original creator (`auth.uid() = created_by` or `auth.uid() = user_id`) has permission to update or delete resources, reviews, and personal bookmarks.

The full schema DDL, RLS policies, trigger functions, and syllabus seed data are located in `supabase/schema.sql`.

---

## Project Structure

```
asd-major-project/
├── public/                 # Static assets and icons
├── src/
│   ├── components/
│   │   ├── Field.jsx       # Form input wrapper with labels and errors
│   │   ├── Navbar.jsx      # Navigation header with animated transitions
│   │   ├── ProtectedRoute.jsx # Route guard for authenticated pages
│   │   ├── ResourceCard.jsx   # Resource list item with ratings and bookmark toggle
│   │   └── StarRating.jsx     # Interactive 5-star rating component
│   ├── context/
│   │   └── AuthContext.jsx # Global Supabase authentication provider
│   ├── lib/
│   │   ├── bookmarks.js    # Bookmark queries and optimistic toggle operations
│   │   ├── intro.js        # First-load animation state helper
│   │   └── supabase.js     # Supabase client initialization
│   ├── pages/
│   │   ├── AddResource.jsx    # Resource contribution form
│   │   ├── Browse.jsx         # Search, filter, and browse catalog
│   │   ├── Home.jsx           # Landing page with syllabus overview
│   │   ├── Login.jsx          # User sign-in
│   │   ├── Profile.jsx        # User dashboard (Submissions, Bookmarks, Reviews)
│   │   ├── ResourceDetail.jsx # Detailed view, rating form, share & creator controls
│   │   └── Signup.jsx         # User registration
│   ├── App.jsx             # Main router and shell layout
│   ├── index.css           # Tailwind v4 theme and custom animation tokens
│   └── main.jsx            # React root mount
├── supabase/
│   └── schema.sql          # Full PostgreSQL DDL, RLS policies, views & seed data
├── .env.example            # Supabase credentials template
├── package.json
└── vite.config.js
```

---

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Sanchit07-dev/asd-major-project.git
   cd asd-major-project
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Provide your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Initialize Database:**
   Run the SQL scripts in `supabase/schema.sql` inside your Supabase project's SQL Editor.

5. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

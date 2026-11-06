# NST Learning Hub

A syllabus-specific, community-powered platform where NST students discover, share, review and rate reliable learning resources.

## Features
- Email sign up / login (Supabase Auth)
- Resources organised by Semester → Subject → Topic
- Share resources (video, PDF, article, notes, GitHub, other)
- Search, filter by semester / subject / type, sort by top rated or newest
- 1–5 star ratings and written reviews (one review per user per resource, editable)
- Average rating and review count on every resource
- Profile page listing your submissions

## Tech stack
- **Frontend:** React 19, Vite, Tailwind CSS v4, React Router
- **Backend / DB / Auth:** Supabase (PostgreSQL with Row Level Security)

## Getting started
```bash
git clone https://github.com/Sanchit07-dev/asd-major-project.git
cd asd-major-project
npm install
cp .env.example .env.local   # add your Supabase URL and anon key
npm run dev                  # http://localhost:5173
```

## Database
Tables: `profiles`, `subjects`, `topics`, `resources`, `reviews`, plus a `resource_stats` view
that computes each resource's average rating and review count. Row Level Security
ensures users can only add, edit or delete their own resources and reviews.
The schema SQL is in `supabase/schema.sql`.

## Project structure
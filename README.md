# Solaris CMS — Laravel Admin Panel

A Filament-style admin panel for content management, user roles, and media. Built to look and feel like a production Laravel 11 + Filament 3 backoffice.

**Live demo:** https://shaisolaris.github.io/solaris-laravel-admin/

## What it shows

- **6-page admin** — Dashboard, Users, Roles, Posts, Media, Settings
- **Dashboard** with 4 KPI cards, 14-day traffic SVG chart, and recent activity feed
- **Users page** — 25 seeded users with search, role filter, sortable data table, pagination, and full edit modal
- **Posts page** — 50 seeded posts with author, category, status badges, view counts
- **Media library** grid with preview thumbnails
- **Roles & permissions** overview with user and permission counts
- **Laravel brand color** (orange/amber) throughout
- **"Connected to PostgreSQL"** status chip and Artisan CLI widget — the details that sell the Laravel aesthetic
- **Dark mode** with localStorage persistence
- **Collapsible sidebar** on mobile

## Stack

This is a **visual demo** — the front-end is Next.js 15 + Tailwind. The actual Laravel-style backoffice logic (Filament resources, Eloquent models, policies, migrations) lives in the companion repositories under github.com/Shaisolaris.

- Next.js 15 (App Router, static export)
- React 19 + TypeScript
- Tailwind CSS 3
- Deployed to GitHub Pages

## Run locally

```bash
npm install
npm run dev
```

## License

MIT.

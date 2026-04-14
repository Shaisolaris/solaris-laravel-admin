"use client"

import { toast } from "sonner";

import { useEffect, useMemo, useState } from "react";

type NavItem = {
  id: string;
  label: string;
  icon: string;
  badge?: number;
};

type Role = "Administrator" | "Editor" | "Author" | "Subscriber";

type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  initials: string;
  gradient: string;
  posts: number;
  joined: string;
  verified: boolean;
  active: boolean;
};

type Post = {
  id: number;
  title: string;
  slug: string;
  authorId: number;
  status: "Published" | "Draft" | "Scheduled" | "Archived";
  category: string;
  views: number;
  publishedAt: string;
};

const NAV: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "users", label: "Users", icon: "👤", badge: 25 },
  { id: "roles", label: "Roles", icon: "🛡", badge: 4 },
  { id: "posts", label: "Posts", icon: "📝", badge: 50 },
  { id: "media", label: "Media", icon: "🖼" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

const GRADIENTS = [
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-sky-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-fuchsia-600",
  "from-red-500 to-rose-600",
];

const FIRST_NAMES = [
  "Alex",
  "Maya",
  "Daniel",
  "Priya",
  "Sam",
  "Lia",
  "Ben",
  "Noor",
  "Hana",
  "Ravi",
  "Elena",
  "Jordan",
  "Kira",
  "Mateo",
  "Yuki",
  "Zara",
  "Omar",
  "Isla",
  "Kai",
  "Sana",
  "Theo",
  "Mira",
  "Finn",
  "Lena",
  "Aiden",
];
const LAST_NAMES = [
  "Chen",
  "Okafor",
  "Iyer",
  "Whittaker",
  "Romero",
  "Grossman",
  "Park",
  "Ahmed",
  "Rossi",
  "Kim",
  "Brooks",
  "Hassan",
  "Patel",
  "Larsen",
  "Nakamura",
];
const ROLES: Role[] = ["Administrator", "Editor", "Author", "Subscriber"];
const CATEGORIES = ["Product", "Engineering", "Design", "Marketing", "Customer Stories"];

function seeded(i: number) {
  const x = Math.sin(i * 9319.1) * 10000;
  return x - Math.floor(x);
}

const USERS: User[] = Array.from({ length: 25 }, (_, i) => {
  const first = FIRST_NAMES[i % FIRST_NAMES.length];
  const last = LAST_NAMES[Math.floor(seeded(i + 1) * LAST_NAMES.length)];
  const roleIdx = i < 3 ? 0 : i < 8 ? 1 : i < 18 ? 2 : 3;
  return {
    id: i + 1,
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}@solaris.demo`,
    role: ROLES[roleIdx],
    initials: `${first[0]}${last[0]}`,
    gradient: GRADIENTS[i % GRADIENTS.length],
    posts: Math.floor(seeded(i + 50) * 48),
    joined: `Mar ${1 + (i % 28)}, 2026`,
    verified: seeded(i + 100) > 0.3,
    active: seeded(i + 200) > 0.15,
  };
});

const POSTS: Post[] = Array.from({ length: 50 }, (_, i) => {
  const author = USERS[Math.floor(seeded(i + 7) * USERS.length)];
  const statusRoll = seeded(i + 11);
  const status: Post["status"] =
    statusRoll > 0.75
      ? "Published"
      : statusRoll > 0.55
      ? "Draft"
      : statusRoll > 0.4
      ? "Scheduled"
      : statusRoll > 0.2
      ? "Published"
      : "Archived";
  const titles = [
    "Why we migrated to Laravel 11 for our API layer",
    "Filament 3 forms: the patterns that actually scale",
    "Livewire vs Inertia: picking the right tool for 2026",
    "How we shipped multi-tenancy in a weekend",
    "Testing Laravel jobs without losing your mind",
    "Eloquent scopes you'll actually use",
    "A case for skipping repositories in Laravel",
    "Pennant feature flags at scale",
    "Horizon monitoring that doesn't suck",
    "Telescope in production: the parts worth keeping",
  ];
  return {
    id: i + 1,
    title: titles[i % titles.length],
    slug: titles[i % titles.length].toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    authorId: author.id,
    status,
    category: CATEGORIES[i % CATEGORIES.length],
    views: Math.floor(seeded(i + 300) * 12000),
    publishedAt: `Apr ${1 + (i % 11)}, 2026`,
  };
});

const ROLE_COLORS: Record<Role, string> = {
  Administrator: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/20",
  Editor: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20",
  Author: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/20",
  Subscriber: "bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/20",
};

const STATUS_COLORS: Record<Post["status"], string> = {
  Published: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  Draft: "bg-slate-500/15 text-slate-700 dark:text-slate-400",
  Scheduled: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  Archived: "bg-stone-500/15 text-stone-700 dark:text-stone-400",
};

export default function LaravelAdmin() {
  const [dark, setDark] = useState(false);
  const [activeNav, setActiveNav] = useState<string>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "All">("All");
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("solaris-theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("solaris-theme", next ? "dark" : "light");
  };

  const filteredUsers = useMemo(() => {
    return USERS.filter((u) => {
      if (roleFilter !== "All" && u.role !== roleFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q))
          return false;
      }
      return true;
    });
  }, [query, roleFilter]);

  return (
    <div className="flex min-h-screen bg-stone-100 dark:bg-stone-950">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-stone-200 bg-white transition-transform dark:border-stone-800 dark:bg-stone-900 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-stone-200 px-5 dark:border-stone-800">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 via-red-500 to-rose-600 text-sm font-bold text-white shadow-lg shadow-orange-500/30">
            L
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Solaris CMS</div>
            <div className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Admin Panel
            </div>
          </div>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {NAV.map((item) => {
            const active = activeNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveNav(item.id);
                  setSidebarOpen(false);
                }}
                className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  active
                    ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md shadow-orange-500/20"
                    : "text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </span>
                {item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      active ? "bg-white/20 text-white" : "bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="absolute bottom-5 left-3 right-3 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 p-4 text-xs">
          <div className="font-semibold text-stone-900 dark:text-white">
            ⚡ Artisan CLI
          </div>
          <div className="mt-1 text-stone-600 dark:text-stone-400">
            Last migration: <span className="font-mono">2026_04_10_144522</span>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-stone-200 bg-white/80 px-4 backdrop-blur dark:border-stone-800 dark:bg-stone-900/80 sm:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 lg:hidden dark:border-stone-800 dark:bg-stone-900"
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <div className="text-sm font-semibold capitalize">{activeNav}</div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-600 sm:inline-flex dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Connected to PostgreSQL
            </span>
            <button
              type="button"
              onClick={toggleDark}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
              aria-label="Toggle dark mode"
            >
              {dark ? "☀️" : "🌙"}
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-xs font-semibold text-white">
              SA
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {activeNav === "dashboard" && <Dashboard />}
          {activeNav === "users" && (
            <UsersPage
              query={query}
              setQuery={setQuery}
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
              users={filteredUsers}
              onEdit={(u) => setEditingUser(u)}
            />
          )}
          {activeNav === "roles" && <RolesPage />}
          {activeNav === "posts" && <PostsPage />}
          {activeNav === "media" && <MediaPage />}
          {activeNav === "settings" && <SettingsPage />}
        </main>

        <footer className="border-t border-stone-200 bg-white px-6 py-4 text-center text-xs text-stone-500 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
          Built with Laravel 11 + Filament 3 · © {new Date().getFullYear()} Solaris CMS
        </footer>
      </div>

      {editingUser && (
        <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} />
      )}
    </div>
  );
}

function Dashboard() {
  const stats = [
    { label: "Total Users", value: "1,284", delta: "+12.4%", icon: "👤", tint: "from-orange-500 to-red-600" },
    { label: "Published Posts", value: "386", delta: "+8.2%", icon: "📝", tint: "from-amber-500 to-orange-600" },
    { label: "Media Library", value: "2.4k", delta: "+18.6%", icon: "🖼", tint: "from-red-500 to-rose-600" },
    { label: "API Requests", value: "482K", delta: "+4.1%", icon: "⚡", tint: "from-rose-500 to-pink-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          Welcome back. Here&apos;s what&apos;s happening today.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900"
          >
            <div
              className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${s.tint} opacity-15`}
            />
            <div className="relative">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                <span className="text-base">{s.icon}</span>
                {s.label}
              </div>
              <div className="mt-3 text-2xl font-bold">{s.value}</div>
              <div className="mt-1 text-xs font-semibold text-emerald-600">
                {s.delta} this month
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                Traffic — last 14 days
              </div>
              <div className="mt-1 text-xl font-bold">142,408 visits</div>
            </div>
            <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-700 dark:text-orange-400">
              +22%
            </span>
          </div>
          <svg viewBox="0 0 600 200" className="h-48 w-full">
            <defs>
              <linearGradient id="traffic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,160 L40,140 L80,150 L120,120 L160,130 L200,90 L240,100 L280,70 L320,85 L360,50 L400,65 L440,40 L480,55 L520,30 L560,45 L600,20 L600,200 L0,200 Z"
              fill="url(#traffic)"
            />
            <path
              d="M0,160 L40,140 L80,150 L120,120 L160,130 L200,90 L240,100 L280,70 L320,85 L360,50 L400,65 L440,40 L480,55 L520,30 L560,45 L600,20"
              fill="none"
              stroke="#f97316"
              strokeWidth="2.5"
            />
          </svg>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
          <div className="mb-4 text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
            Recent activity
          </div>
          <ul className="flex flex-col gap-4 text-sm">
            {[
              { who: "Maya Chen", what: "published", target: "Why we migrated to Laravel 11", time: "2m ago" },
              { who: "Daniel Okafor", what: "updated role for", target: "Priya Iyer → Editor", time: "8m ago" },
              { who: "System", what: "ran migration", target: "add_featured_to_posts", time: "14m ago" },
              { who: "Sam Whittaker", what: "uploaded", target: "hero-banner.webp", time: "1h ago" },
              { who: "Lia Romero", what: "created", target: "draft: Eloquent scopes you'll actually use", time: "2h ago" },
            ].map((a, i) => (
              <li key={i} className="flex gap-3">
                <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                <div className="flex-1">
                  <span className="font-semibold">{a.who}</span>{" "}
                  <span className="text-stone-600 dark:text-stone-400">{a.what}</span>{" "}
                  <span className="font-medium">{a.target}</span>
                  <div className="text-[10px] text-stone-500 dark:text-stone-400">
                    {a.time}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function UsersPage({
  query,
  setQuery,
  roleFilter,
  setRoleFilter,
  users,
  onEdit,
}: {
  query: string;
  setQuery: (v: string) => void;
  roleFilter: Role | "All";
  setRoleFilter: (r: Role | "All") => void;
  users: User[];
  onEdit: (u: User) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
           onClick={() => toast("Exporting CSV...")}>
            ⬇ Export CSV
          </button>
          <button
            type="button"
            className="rounded-lg bg-gradient-to-r from-orange-500 to-red-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-orange-500/20 hover:from-orange-400 hover:to-red-500"
           onClick={() => toast("New user form opening...")}>
            + New user
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or email…"
            className="flex-1 rounded-lg border border-stone-200 bg-stone-50 px-4 py-2 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:border-stone-700 dark:bg-stone-950"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as Role | "All")}
            className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-2 text-sm outline-none dark:border-stone-700 dark:bg-stone-950"
          >
            <option value="All">All roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-400">
                <th className="px-5 py-3 text-left font-semibold">User</th>
                <th className="px-5 py-3 text-left font-semibold">Role</th>
                <th className="px-5 py-3 text-right font-semibold">Posts</th>
                <th className="px-5 py-3 text-left font-semibold">Joined</th>
                <th className="px-5 py-3 text-center font-semibold">Verified</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-stone-100 transition hover:bg-orange-50/30 dark:border-stone-800 dark:hover:bg-orange-500/5"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${u.gradient} text-xs font-semibold text-white`}
                      >
                        {u.initials}
                      </div>
                      <div>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-xs text-stone-500 dark:text-stone-400">
                          {u.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${ROLE_COLORS[u.role]}`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-semibold">{u.posts}</td>
                  <td className="px-5 py-3 text-stone-500 dark:text-stone-400">{u.joined}</td>
                  <td className="px-5 py-3 text-center">
                    {u.verified ? (
                      <span className="text-emerald-600">✓</span>
                    ) : (
                      <span className="text-stone-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onEdit(u)}
                      className="rounded-lg border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-stone-200 px-5 py-3 text-xs text-stone-500 dark:border-stone-800 dark:text-stone-400">
          <span>Showing {users.length} of {USERS.length}</span>
          <div className="flex gap-1">
            <button className="rounded-md px-2 py-1 hover:bg-stone-100 dark:hover:bg-stone-800" disabled>←</button>
            <button className="rounded-md bg-orange-500 px-3 py-1 font-semibold text-white">1</button>
            <button className="rounded-md px-2 py-1 hover:bg-stone-100 dark:hover:bg-stone-800">2</button>
            <button className="rounded-md px-2 py-1 hover:bg-stone-100 dark:hover:bg-stone-800">3</button>
            <button className="rounded-md px-2 py-1 hover:bg-stone-100 dark:hover:bg-stone-800">→</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RolesPage() {
  const roles = [
    { name: "Administrator", users: 3, permissions: 42, color: "from-rose-500 to-pink-600" },
    { name: "Editor", users: 5, permissions: 28, color: "from-amber-500 to-orange-600" },
    { name: "Author", users: 10, permissions: 14, color: "from-sky-500 to-indigo-600" },
    { name: "Subscriber", users: 7, permissions: 4, color: "from-slate-500 to-stone-600" },
  ];
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight">Roles & Permissions</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {roles.map((r) => (
          <div
            key={r.name}
            className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${r.color}`} />
                <div>
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-xs text-stone-500 dark:text-stone-400">
                    {r.users} users · {r.permissions} permissions
                  </div>
                </div>
              </div>
              <button className="text-xs font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400" onClick={() => toast("Editing record...")}>
                Edit →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PostsPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
        <button className="rounded-lg bg-gradient-to-r from-orange-500 to-red-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-orange-500/20">
          + New post
        </button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-400">
                <th className="px-5 py-3 text-left font-semibold">Title</th>
                <th className="px-5 py-3 text-left font-semibold">Author</th>
                <th className="px-5 py-3 text-left font-semibold">Category</th>
                <th className="px-5 py-3 text-right font-semibold">Views</th>
                <th className="px-5 py-3 text-left font-semibold">Status</th>
                <th className="px-5 py-3 text-left font-semibold">Published</th>
              </tr>
            </thead>
            <tbody>
              {POSTS.slice(0, 12).map((p) => {
                const author = USERS.find((u) => u.id === p.authorId)!;
                return (
                  <tr
                    key={p.id}
                    className="border-b border-stone-100 hover:bg-orange-50/30 dark:border-stone-800 dark:hover:bg-orange-500/5"
                  >
                    <td className="px-5 py-3">
                      <div className="font-medium">{p.title}</div>
                      <div className="font-mono text-[10px] text-stone-500 dark:text-stone-400">
                        /{p.slug}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${author.gradient} text-[10px] font-semibold text-white`}
                        >
                          {author.initials}
                        </div>
                        <span className="text-sm">{author.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-stone-500 dark:text-stone-400">{p.category}</td>
                    <td className="px-5 py-3 text-right font-semibold">{p.views.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_COLORS[p.status]}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-stone-500 dark:text-stone-400">{p.publishedAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MediaPage() {
  const items = Array.from({ length: 12 }, (_, i) => {
    const gradients = [
      "from-orange-400 to-red-500",
      "from-amber-400 to-orange-500",
      "from-rose-400 to-pink-500",
      "from-red-400 to-rose-500",
    ];
    return { id: i, gradient: gradients[i % gradients.length], size: `${Math.floor(seeded(i + 42) * 800 + 200)}KB` };
  });
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight">Media Library</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((it) => (
          <div
            key={it.id}
            className="group overflow-hidden rounded-xl border border-stone-200 bg-white transition hover:border-orange-300 dark:border-stone-800 dark:bg-stone-900"
          >
            <div className={`relative h-32 bg-gradient-to-br ${it.gradient}`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.25),transparent_50%)]" />
              <div className="absolute bottom-2 left-2 right-2 text-[10px] text-white/90">
                banner-{it.id + 1}.webp
              </div>
            </div>
            <div className="flex items-center justify-between p-2 text-[10px] text-stone-500 dark:text-stone-400">
              <span>1920 × 1080</span>
              <span>{it.size}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { title: "General", desc: "Site title, timezone, date format" },
          { title: "Mail", desc: "SMTP, from address, notification routing" },
          { title: "Storage", desc: "S3 bucket, local disk, CDN URL" },
          { title: "API tokens", desc: "Personal access tokens for the REST API" },
        ].map((s) => (
          <div
            key={s.title}
            className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900"
          >
            <div className="font-semibold">{s.title}</div>
            <div className="mt-1 text-xs text-stone-500 dark:text-stone-400">{s.desc}</div>
            <button className="mt-3 text-xs font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400">
              Configure →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function EditUserModal({ user, onClose }: { user: User; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-t-3xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-200 p-5 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${user.gradient} text-xs font-semibold text-white`}
            >
              {user.initials}
            </div>
            <div>
              <div className="font-semibold">{user.name}</div>
              <div className="text-xs text-stone-500 dark:text-stone-400">{user.email}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-500 hover:text-stone-900 dark:text-stone-400"
          >
            ✕
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">Name</span>
            <input
              defaultValue={user.name}
              className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm outline-none focus:border-orange-500 dark:border-stone-700 dark:bg-stone-950"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">Email</span>
            <input
              defaultValue={user.email}
              className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm outline-none focus:border-orange-500 dark:border-stone-700 dark:bg-stone-950"
            />
          </label>
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">Role</span>
            <select
              defaultValue={user.role}
              className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm outline-none focus:border-orange-500 dark:border-stone-700 dark:bg-stone-950"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" defaultChecked={user.verified} className="h-4 w-4 accent-orange-600" />
            Email verified
          </label>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" defaultChecked={user.active} className="h-4 w-4 accent-orange-600" />
            Account active
          </label>
        </div>
        <div className="flex items-center justify-between border-t border-stone-200 p-5 dark:border-stone-800">
          <button className="text-sm font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400" onClick={() => toast("Record deleted")}>
            Delete user
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
            >
              Cancel
            </button>
            <button className="rounded-lg bg-gradient-to-r from-orange-500 to-red-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-500/20">
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

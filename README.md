# Lumina Admin

[cloudflarebutton]

A modern, full-stack admin dashboard template powered by Cloudflare Workers. Built with React, Vite, shadcn/ui, and TypeScript for rapid development of production-ready applications. Features a serverless backend with Durable Objects for scalable, real-time data persistence (users, chats, and custom entities).

## 🚀 Key Features

- **Full-Stack TypeScript**: End-to-end type safety with shared types between frontend and backend.
- **Durable Objects Backend**: Multi-tenant entity storage (e.g., Users, ChatBoards) with indexing and ACID transactions.
- **Modern UI**: shadcn/ui components, Tailwind CSS, dark mode, responsive design, and animations.
- **API-First**: Hono router with CORS, auth-ready endpoints, and automatic error handling.
- **Developer Experience**: Vite hot reload, TanStack Query for data fetching, React Router, and Bun for fast installs.
- **Production-Ready**: Cloudflare deployment, error reporting, SPA asset handling, and SQLite-backed Durable Objects.
- **Extensible**: Easy-to-extend entity system in `worker/entities.ts` and routes in `worker/user-routes.ts`.

## 🛠 Tech Stack

| Frontend | Backend | Tools |
|----------|---------|-------|
| React 18 | Cloudflare Workers | Vite, Bun |
| TypeScript | Hono | Tailwind CSS |
| shadcn/ui | Durable Objects | TanStack Query |
| React Router | SQLite (D1-like) | wrangler |
| Lucide Icons |  | ESLint, Prettier |

## 📦 Quick Start

### Prerequisites
- [Bun](https://bun.sh/) (recommended package manager)
- [Cloudflare Account](https://dash.cloudflare.com/) and Wrangler CLI (`bun add -g wrangler`)

### Installation
```bash
bun install
```

### Development
```bash
bun dev
```
Opens at `http://localhost:3000` (or `$PORT`). Frontend hot-reloads; backend auto-restarts.

### Build for Production
```bash
bun build
```

## 📚 Usage

### Frontend
- Replace `src/pages/HomePage.tsx` with your app pages.
- Use `AppLayout` from `src/components/layout/AppLayout.tsx` for sidebar layouts.
- Data fetching: Use `api` helper from `src/lib/api-client.ts` with TanStack Query.
- Components: All shadcn/ui available in `src/components/ui/*`.
- Theming: Toggle dark/light mode via `useTheme` hook.

**Example API Call**:
```ts
import { api } from '@/lib/api-client';

const users = await api<User[]>('/api/users');
```

### Backend
- **Entities**: Extend `IndexedEntity` in `worker/entities.ts` (see UserEntity/ChatBoardEntity).
- **Routes**: Add endpoints in `worker/user-routes.ts` (auto-loaded).
- **Seed Data**: Run `UserEntity.ensureSeed(env)` in routes for initial data.

**Example Entity Route**:
```ts
app.post('/api/myentity', async (c) => {
  return ok(c, await MyEntity.create(c.env, { id: crypto.randomUUID(), ...data }));
});
```

### API Endpoints (Demo)
```
GET    /api/users              # List users (paginated)
POST   /api/users              # Create user
GET    /api/chats              # List chats
POST   /api/chats/:chatId/messages  # Send message
DELETE /api/users/:id          # Delete user
```

Full OpenAPI docs available at `/api/docs` in dev mode.

## ☁️ Deployment

Deploy to Cloudflare Workers with one command:

```bash
bun deploy
```

Or use the [Cloudflare Dashboard](https://dash.cloudflare.com/) for custom domains and bindings.

[cloudflarebutton]

**Post-Deploy**:
- Set up Durable Objects migration via Wrangler dashboard.
- Configure custom domain and assets in `wrangler.jsonc`.

## 🔧 Customization

1. **UI**: Edit `tailwind.config.js` and `src/index.css`.
2. **Sidebar**: Customize `src/components/app-sidebar.tsx`.
3. **Routes/Entities**: Modify `worker/user-routes.ts` and `worker/entities.ts`.
4. **Types**: Shared in `shared/types.ts`.
5. **Queries**: Wrap in TanStack Query for caching.

## 🤝 Contributing

1. Fork and clone the repo.
2. `bun install && bun dev`.
3. Make changes, test locally, and submit a PR.

Report issues via GitHub.

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.
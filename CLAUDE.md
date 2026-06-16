# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo Structure

This project has two separate packages — a React frontend and an Express backend — in sibling directories under `studyMate/`:

```
studyMate/
├── Study-Mate/     # React frontend (this directory)
└── backend/        # Express API server
```

Each has its own `package.json` and `node_modules`. Run `npm install` in each directory independently.

## Commands

### Frontend (`Study-Mate/`)

```bash
npm run dev        # Start Vite dev server
npm run build      # Type-check + production build (tsc -b && vite build)
npm run lint       # ESLint
npm run preview    # Preview production build
```

### Backend (`backend/`)

```bash
npm run dev        # Start dev server with hot reload (ts-node-dev)
npm run build      # prisma generate && tsc
npm run start      # Run compiled JS (node dist/src/server.js)
npx prisma migrate dev    # Run database migrations
npx prisma generate       # Regenerate Prisma client
```

No test runner is configured in either package.

## Environment Variables

### Frontend `.env`
```
VITE_CLERK_PUBLISHABLE_KEY=...
VITE_API_BASE_URL=...           # e.g. http://localhost:5000
```

### Backend `.env`
```
DATABASE_URL=...                # PostgreSQL connection string
CLERK_SECRET_KEY=...
# Plus any AI provider keys (Anthropic, OpenAI) and Cloudinary config
```

## Frontend Architecture

### Tech Stack
- **React 19 + Vite + TypeScript**
- **Tailwind CSS v4** via `@tailwindcss/vite` — no `tailwind.config.js`; use `@import "tailwindcss"` in `index.css`. CSS variables (defined in `index.css`) are used for all theming: `var(--primary)`, `var(--bg)`, `var(--card)`, `var(--border)`, `var(--text-primary)`, `var(--text-secondary)`, `var(--secondary)`.
- **Clerk** for auth (`@clerk/clerk-react`). Tokens obtained via `useAuth().getToken()` and sent as `Authorization: Bearer <token>` headers.
- **TanStack Query** for all server state. Default staleTime: 5 min; `refetchOnWindowFocus: false`.
- **react-router-dom v7**
- **motion** (Framer Motion) for animations
- **react-markdown + remark-math + rehype-katex + mermaid** for markdown with LaTeX and diagram rendering. `<MarkdownMessage>` handles text; `<MermaidBlock>` renders mermaid code fences client-side (`mermaid.render()`, theme: neutral, falls back to raw `<pre>` on error)

### Route Structure

```
/                         SignUpPage (public, redirects away if authed)
/sso-callback             Clerk SSO callback
/onBoarding               OnboardingPage (auth required)
/dashboard                HomePage (auth + onboarded required)
/courses                  CoursesPage
/courses/:id              CourseDetailPage
/courses/:courseId/topics/:topicIndex          TopicChatPage
/courses/:courseId/topics/:topicIndex/quiz     TopicQuizPage
/courses/:id/edit                              EditCoursePage
/settings                                      SettingsPage
```

Route guards in `src/components/RouteGuards.tsx`:
- `RequireAuth` — redirects to `/` if not signed in
- `RequireOnboarded` — redirects to `/onBoarding` if `user.publicMetadata.onboarded` is falsy
- `RedirectIfAuth` — redirects authenticated users away from the sign-up page

### Data Flow

**API layer** (`src/api/`): thin functions wrapping `apiCall()` (in `apicall.ts`). All requests use `VITE_API_BASE_URL` as the base. Structured errors follow `ApiError { success, type, message, details }`.

**Hooks** (`src/hooks/`): TanStack Query wrappers around the API layer. Pattern: hook calls `getToken()`, passes it to the API function. Key hooks:
- `useCourses` / `useCourse` / `useCreateCourse` / `useGenerateCourse` / `useCompleteTopic`
- `useTopicChat` — SSE streaming via `fetch` + `ReadableStream`; parses `data: {"delta":"..."}` lines, terminates on `data: [DONE]`
- `useObjectives` / `useGenerateObjectives` / `useEvaluateObjectives`
- `useChatHistory` — loads persisted chat messages for a topic
- `useUserPreferences` — user's interests, education level, etc. (staleTime: Infinity)
- `useSubmitPreference` / `useSyncUser` — onboarding submission

**Overview cache** (`src/lib/overviewCache.ts`): localStorage cache for AI-generated topic overviews, keyed `sm:ov:{courseId}:{topicId}`.

### Streaming Chat

`TopicChatPage` implements streaming AI responses. The `sendMessage` function in `useTopicChat` reads an SSE stream from `POST /chat/topic`. Each response message streams deltas into `streamingContent` state, then commits the full text to `messages` on `[DONE]`.

### Learning Objectives Flow

On `TopicChatPage`, objectives are auto-generated on first visit if none exist (`useGenerateObjectives`). After each AI response, `useEvaluateObjectives` is called to mark objectives as covered. When all objectives are covered, the "Take Quiz" button unlocks.

### Quiz Flow

`TopicQuizPage` receives all needed data via `location.state` (messages, objectives, topicId, courseTitle, topicTitle, courseColor) — no additional API call to load context. Pass threshold is 4/5 (80%). On pass, `useCompleteTopic` marks the topic done and navigates back to course detail. On fail, navigating back to the chat page via `state: { resetObjectives: true }` resets all objectives to uncovered.

### Onboarding Flow

Multi-step wizard (steps 0-6): 5 preference steps (`StepForm`), 1 interests step (`InterestsForm`), 1 confirmation screen (`FinalOnboardingScreen`). On submit, calls `useSubmitPreference` then `user.reload()` to pick up the updated `publicMetadata.onboarded` flag before navigating to `/dashboard`.

### Layout Pattern

All post-auth pages use a shared layout: `<Sidebar>` (fixed desktop, overlay mobile) + `<TopBar>` + `<CreateCourseModal>`. The sidebar is 60 units wide (`lg:pl-60` on the main content area).

### Styling Conventions

- No shadcn — all UI built from scratch with Tailwind + CSS variables
- Use inline `style={{ color: 'var(--primary)' }}` for dynamic/variable-based colors
- Use Tailwind classes for layout and spacing
- Fonts: `Archivo Black` for headings, `Roboto` for body (loaded via Google Fonts in `index.html`)
- Course accent color is a hex string from the API; use `${color}18` / `${color}20` for tinted backgrounds

## Backend Architecture

### Tech Stack
- **Express 5 + TypeScript** (compiled with `tsc`, dev via `ts-node-dev`)
- **Prisma ORM** with PostgreSQL — schema at `prisma/schema.prisma`, generated client output to `generated/prisma/`
- **Clerk** for auth (`@clerk/express`) — `clerkMiddleware()` globally, `requireAuth` middleware per-route
- **AI providers**: `@anthropic-ai/sdk` and `openai` for course generation, chat, objectives, quiz
- **Cloudinary** for image uploads

### Backend Structure

```
backend/src/
├── server.ts              # Entry point (listens on PORT, default 5000)
├── app.ts                 # Express app setup (cors, morgan, clerkMiddleware, routes)
├── routes/index.ts        # Mounts all route groups under /api
├── routes/*.routes.ts     # Route definitions
├── controllers/*.ts       # Request handlers
├── services/*.ts          # Business logic + AI calls
├── middleware/             # requireAuth, globalErrorHandler
├── config/                # db.config.ts (Prisma), cloudinary.config.ts
├── errors/                # AppError hierarchy (NotFoundError, ValidationError, etc.)
└── utils/catchAsync.ts    # Async error wrapper for controllers
```

### API Routes (all prefixed `/api`)

| Prefix | Resource |
|--------|----------|
| `/api/auth` | Clerk webhook / sync |
| `/api/user` | User preferences |
| `/api/courses` | Course CRUD, topic generation, enrollment, completion |
| `/api/chat` | Topic chat (SSE streaming) |
| `/api/illustrations` | AI-generated illustrations |
| `/api/streak` | Daily streak, XP, leaderboard |

### Key Data Models

User, Course, Topic (ordered within course), Enrollment (user-course join), TopicCompletion, ChatMessage, LearningObjective, UserObjectiveCoverage, UserStreak, DailyActivity. See `prisma/schema.prisma` for full schema.

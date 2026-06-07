# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (Vite)
npm run build      # Type-check + production build (tsc -b && vite build)
npm run lint       # ESLint
npm run preview    # Preview production build
```

No test runner is configured.

## Environment Variables

Create a `.env` file at the project root:

```
VITE_CLERK_PUBLISHABLE_KEY=...
VITE_API_BASE_URL=...           # Backend base URL, e.g. http://localhost:3000
```

## Architecture

### Tech Stack
- **React 19 + Vite + TypeScript**
- **Tailwind CSS v4** via `@tailwindcss/vite` — no `tailwind.config.js`; use `@import "tailwindcss"` in `index.css`. CSS variables (defined in `index.css`) are used for all theming: `var(--primary)`, `var(--bg)`, `var(--card)`, `var(--border)`, `var(--text-primary)`, `var(--text-secondary)`, `var(--secondary)`.
- **Clerk** for auth (`@clerk/clerk-react`). Tokens obtained via `useAuth().getToken()` and sent as `Authorization: Bearer <token>` headers.
- **TanStack Query** for all server state. Default staleTime: 5 min; `refetchOnWindowFocus: false`.
- **react-router-dom v7**
- **motion** (Framer Motion) for animations
- **react-markdown + remark-math + rehype-katex** for markdown with LaTeX rendering (`<MarkdownMessage>` component)

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

Multi-step wizard (steps 0–6): 5 preference steps (`StepForm`), 1 interests step (`InterestsForm`), 1 confirmation screen (`FinalOnboardingScreen`). On submit, calls `useSubmitPreference` then `user.reload()` to pick up the updated `publicMetadata.onboarded` flag before navigating to `/dashboard`.

### Layout Pattern

All post-auth pages use a shared layout: `<Sidebar>` (fixed desktop, overlay mobile) + `<TopBar>` + `<CreateCourseModal>`. The sidebar is 60 units wide (`lg:pl-60` on the main content area).

### Styling Conventions

- No shadcn — all UI built from scratch with Tailwind + CSS variables
- Use inline `style={{ color: 'var(--primary)' }}` for dynamic/variable-based colors
- Use Tailwind classes for layout and spacing
- Fonts: `Archivo Black` for headings, `Roboto` for body (loaded via Google Fonts in `index.html`)
- Course accent color is a hex string from the API; use `${color}18` / `${color}20` for tinted backgrounds

# Authentication & Authorization Flow in Nuxt

A Nuxt 4 sandbox app demonstrating a complete, framework-agnostic-style authentication
layer: email/password login, OAuth (Google/GitHub), silent token refresh, idle-timeout
logout, cross-tab logout sync, and permission-based access control.

## Tech stack

- [Nuxt 4](https://nuxt.com) + Vue 3 (Composition API, `<script setup>`)
- `ofetch` (via Nuxt's built-in fetch) for HTTP
- No external state library — auth state lives in a Nuxt `useState` singleton

## Project structure

```
app/
├── app.vue                          # Root component; subscribes to cross-tab logout events
├── auth/                            # Self-contained auth module (barrel-exported via auth/index.ts)
│   ├── Call/index.ts                # useHttp(): fetch wrapper with auth header + 401 retry
│   ├── Components/CanView.vue       # Renders slot content only if a permission check passes
│   ├── Config/index.ts              # Endpoints, OAuth client IDs, page/layout name constants
│   ├── Idle/index.ts                # useIdle(): auto-logout after 15 min of inactivity
│   ├── OAuth/index.ts               # OAuth redirect URL + CSRF state helpers for Google/GitHub
│   ├── Permissions/index.ts         # $checkPermissions(): permission / anyOf / allOf checks
│   ├── Service/index.ts             # useAuthService(): login, logout, refresh, session restore
│   ├── Sync/index.ts                # authChannel: BroadcastChannel for cross-tab logout
│   ├── Types/index.ts               # Shared auth/permission TypeScript types
│   └── index.ts                     # Barrel export for the whole auth module
├── composables/getData.ts           # Example composable built on useHttp
├── layouts/
│   ├── auth.vue                     # Layout for unauthenticated pages (/auth/*)
│   └── dashboard.vue                # Layout for authenticated pages (/dashboard/*)
├── middleware/
│   ├── 1.auth.global.ts             # Global guard: redirects based on session + layout
│   └── permissions.ts               # Per-route guard: redirects if page permissions aren't met
├── pages/
│   ├── index.vue
│   ├── auth.vue                     # Parent route, sets layout: 'auth'
│   ├── auth/
│   │   ├── index.vue                 # Login form + OAuth buttons
│   │   ├── signup/index.vue
│   │   └── callback/[provider]/index.vue  # OAuth redirect handler (google | github)
│   ├── dashboard.vue                 # Parent route, sets layout: 'dashboard'
│   └── dashboard/
│       ├── index.vue                 # Shows the authenticated user's auth state
│       ├── about/index.vue
│       └── download/index.vue        # Example of route + component-level permission checks
├── plugins/auth.ts                  # Registers globalThis.$http and globalThis.$authService
└── types/global.d.ts                # Type declarations for the $http/$authService globals
```

## Auth flow

### 1. Global auth singletons

`plugins/auth.ts` runs once on app init and exposes two singletons on `globalThis`
(typed in `types/global.d.ts`), so any page/component/middleware can call them without
importing anything:

- `$http` — the shared fetch wrapper (`auth/Call/index.ts`)
- `$authService` — the shared auth service (`auth/Service/index.ts`)

### 2. Email/password login

`pages/auth/index.vue` submits credentials to `$authService.login()`, which posts to
`LOGIN` (`auth/Config/index.ts`), stores the returned token/user/permissions/role in
the `userAuth` state, sets the `hasAuth` cookie, and navigates to `/dashboard`.

### 3. OAuth login (Google/GitHub)

- `startGoogleLogin` / `startGithubLogin` (`auth/OAuth/index.ts`) generate a random
  `state` value, stash it in `sessionStorage`, and redirect the browser to the
  provider's authorize URL.
- The provider redirects back to `pages/auth/callback/[provider]/index.vue`, which
  validates the returned `state` against the stored one via `consumeOAuthState`
  (CSRF protection) before exchanging the `code` for a session via
  `$authService.loginWithOAuth()`.

### 4. Session restore & silent refresh

- A `hasAuth` cookie (not the token itself) marks "this browser has a session."
- On every navigation, `middleware/1.auth.global.ts` calls
  `$authService.restoreSession()`, which — if `hasAuth` is set and the in-memory
  state isn't already authenticated — calls `refreshToken()` to mint a new access
  token from the refresh cookie, then `restoreUserInfo()` to fetch the profile.
- Both `refreshToken()` and `restoreSession()` de-dupe concurrent calls with a
  shared in-flight promise, so simultaneous requests don't trigger duplicate
  refresh/profile calls.
- `useHttp()` (`auth/Call/index.ts`) attaches the access token as a `Bearer` header
  on every request, and transparently retries once with a refreshed token on a
  `401` response.

### 5. Route guarding

- `middleware/1.auth.global.ts` reads each route's `layout` meta: unauthenticated
  users hitting a `dashboard`-layout page are sent to `/auth`; authenticated users
  hitting an `auth`-layout page are sent to `/dashboard`.
- It also aborts any in-flight requests (`abortPendingRequests`) on every client-side
  navigation to avoid stale responses racing the new page.

### 6. Permission-based access control

- Pages declare required permissions via `definePageMeta({ middleware: 'permissions', permissions: {...} })`.
- `middleware/permissions.ts` checks them with `$checkPermissions` and redirects to
  `/dashboard` if unmet.
- Within a page, the `<CanView :status="...">` component (`auth/Components/CanView.vue`)
  conditionally renders content (with an optional `#title` fallback slot) based on a
  `$checkPermissions` result — see `pages/dashboard/download/index.vue` for both
  route-level and component-level checks combined.
- Permission requirements support three shapes: `{ permission }`, `{ anyOf: [...] }`,
  and `{ allOf: [...] }` (`auth/Types/index.ts`).

### 7. Idle timeout

`useIdle()` (`auth/Idle/index.ts`) starts a 15-minute inactivity timer once the user
is authenticated, resetting (throttled to once per 2s) on `keydown`/`click`/`scroll`/
`touchstart`/`mousemove`. If the timer fires, it calls `$authService.logout()`.

### 8. Cross-tab logout sync

`logout()` clears local auth state, clears the `hasAuth` cookie, reloads the page,
and broadcasts a `logout` event over a `BroadcastChannel` (`auth/Sync/index.ts`).
`app.vue` subscribes to that channel so every other open tab reloads and drops its
session too.

## Environment variables

| Variable                | Purpose                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------- |
| `VITE_API_URL`          | Base API URL, used for `runtimeConfig.public.BASE_URL` and the refresh-token endpoint |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID                                                                |
| `VITE_GITHUB_CLIENT_ID` | GitHub OAuth client ID                                                                |

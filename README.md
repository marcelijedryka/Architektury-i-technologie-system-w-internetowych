# Archiwum Społeczne — Digital Community Archive

A web application for a community-driven digital archive of historical photographs. Local residents and history enthusiasts can upload, describe, and browse photos that document how places have changed over time.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Infrastructure (Terraform)](#infrastructure-terraform)
- [API Reference](#api-reference)
- [Security](#security)
- [Accessibility](#accessibility)

---

## Overview

The archive allows three types of users to interact with historical photo materials:

| Role | Permissions |
|------|-------------|
| **Viewer** | Browse and search all published photos |
| **Creator** | All Viewer permissions + upload, edit, and delete own photos |
| **Admin** | All Creator permissions + manage users, moderate content, manage hierarchy |

Users can search by geographic location (continent → region → city), date range, and free-text phrase. Each photo carries metadata including title, description, alt text, location, date taken, and tags.

---

## Features

- **Photo archive** — upload JPG/PNG photos with full metadata
- **Location hierarchy** — browse by continent, country/region, city, street
- **Full-text search** — filter by phrase, date range, and location
- **Like system** — authenticated users can like photos
- **Google OAuth** — sign in with Google in addition to local email/password
- **Admin panel** — user management (block/unblock), content moderation, new-material review, hierarchy management
- **Three themes** — light, dark, and high-contrast (for low-vision users)
- **Font size toggle** — small / normal / large for accessibility
- **PL / EN localisation** — full interface in Polish and English
- **WCAG 2.1 AA compliance** — semantic HTML, ARIA labels, skip link, keyboard navigation, sufficient colour contrast

---

## Tech Stack

### Backend

| Technology | Purpose |
|---|---|
| NestJS (Node.js 20) | REST API framework |
| TypeScript | Type-safe server code |
| Passport.js | Authentication strategies (local, JWT, Google) |
| `@aws-sdk` v3 | DynamoDB and S3 clients |
| bcrypt | Password hashing |
| ULID | Sortable unique IDs for materials |
| class-validator / class-transformer | DTO validation and transformation |
| Multer | Multipart file upload handling |

### Frontend

| Technology | Purpose |
|---|---|
| React 19 | UI library |
| TypeScript | Type-safe client code |
| React Router v7 | Client-side routing |
| Tailwind CSS v4 | Utility-first styling via CSS variables |
| Axios | HTTP client with interceptors |
| Headless UI | Accessible unstyled UI primitives |
| Vite | Build tool and dev server |

### Infrastructure

| Technology | Purpose |
|---|---|
| AWS DynamoDB | NoSQL database (single-table design) |
| AWS S3 | Photo file storage (public-read bucket) |
| AWS IAM | Scoped service account credentials |
| Terraform | Infrastructure as Code |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Browser                                │
│                                                                 │
│   React SPA (Vite)                                              │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│   │ Auth Context │  │ Theme Context│  │ Lang / FontSize Ctx  │ │
│   └──────┬───────┘  └──────────────┘  └──────────────────────┘ │
│          │  Axios (httpOnly cookie, 401 interceptor)            │
└──────────┼──────────────────────────────────────────────────────┘
           │ HTTP / JSON
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     NestJS Backend (:3000)                      │
│                                                                 │
│  ┌───────────┐  ┌────────────┐  ┌───────────┐  ┌───────────┐  │
│  │   Auth    │  │ Materials  │  │ Hierarchy │  │   Users   │  │
│  │  Module   │  │   Module   │  │  Module   │  │  Module   │  │
│  └─────┬─────┘  └─────┬──────┘  └─────┬─────┘  └─────┬─────┘  │
│        │              │               │               │        │
│  ┌─────▼──────────────▼───────────────▼───────────────▼─────┐  │
│  │                   Common Module                           │  │
│  │          DynamoDBService        S3Service                 │  │
│  └──────────────────┬──────────────────┬─────────────────────┘  │
└─────────────────────┼──────────────────┼────────────────────────┘
                      │                  │
              ┌───────▼──────┐  ┌────────▼────────┐
              │   DynamoDB   │  │    S3 Bucket    │
              │  (metadata)  │  │  (photo files)  │
              └──────────────┘  └─────────────────┘
```

### Backend Module Structure

The backend follows NestJS modular architecture. Each module owns its controller, service, and DTOs:

- **AuthModule** — local strategy (email/password via Passport), JWT strategy (cookie-based token), Google OAuth 2.0 strategy. Issues 7-day JWT stored in an `httpOnly` cookie.
- **MaterialsModule** — CRUD for photos. Search uses a DynamoDB full scan with in-memory filtering (suitable for the archive scale). Likes use a separate `LIKE#<email>` partition.
- **HierarchyModule** — manages the geographic taxonomy stored in DynamoDB with prefix-keyed partitions (`CONTINENT#`, `REGION#`, `CITY#`, `STREET#`).
- **UsersModule** — user profiles, role management, block/unblock. All new users are assigned the `CREATOR` role by default.
- **CommonModule** — shared `DynamoDBService` and `S3Service` injected into all other modules.

### Frontend Architecture

The frontend is a React SPA with code-split lazy-loaded pages:

- **Context providers** (outermost to innermost): `ThemeProvider` → `LangProvider` → `FontSizeProvider` → `AuthProvider` → `BrowserRouter`
- **`AuthContext`** — holds the current user object. On mount calls `GET /auth/me` to validate the existing cookie session.
- **`ProtectedRoute`** — wraps routes requiring authentication or a specific role; redirects to `/login` or `/` on failure.
- **API layer** (`src/api/`) — thin Axios wrappers. The Axios instance has a 401 response interceptor that redirects to `/login` automatically.

### Database Design (DynamoDB Single-Table)

All entities share one DynamoDB table using a composite primary key (`PK`, `SK`):

| Entity | PK | SK |
|---|---|---|
| User profile | `USER#<email>` | `#PROFILE` |
| Material | `MATERIAL#<ulid>` | `#META` |
| Like | `LIKE#<email>` | `MATERIAL#<ulid>` |
| Continent | `CONTINENT#<id>` | `#META` |
| Region | `REGION#<id>` | `#META` |
| City | `CITY#<id>` | `#META` |
| Street | `STREET#<id>` | `#META` |

**Global Secondary Indexes** on the `archive` table:

| Index | Hash Key | Range Key | Use Case |
|---|---|---|---|
| `ByUploader` | `uploadedBy` | `uploadedAt` | "My photos" page |
| `ByCity` | `cityId` | `uploadedAt` | Browse by city |
| `ByRegion` | `regionId` | `uploadedAt` | Browse by region |

Material IDs use **ULID** (Universally Unique Lexicographically Sortable Identifier), which sorts chronologically — enabling `latest` sort without a secondary index.

---

## Project Structure

```
.
├── api-spec.yml                  # OpenAPI 3.0 specification
├── start.ps1                     # Windows one-command dev startup
│
├── backend/
│   ├── src/
│   │   ├── main.ts               # Bootstrap: CORS, cookie-parser, ValidationPipe
│   │   ├── app.module.ts         # Root module
│   │   ├── auth/
│   │   │   ├── strategies/       # local.strategy, jwt.strategy, google.strategy
│   │   │   ├── guards/           # JwtAuthGuard, RolesGuard, BlockGuard
│   │   │   ├── decorators/       # @CurrentUser(), @Roles()
│   │   │   ├── dto/              # RegisterDto, LoginDto
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.service.ts
│   │   ├── common/
│   │   │   ├── dynamodb/         # DynamoDBService (get/put/update/delete/query/scan)
│   │   │   ├── s3/               # S3Service (upload/delete)
│   │   │   └── filters/          # AllExceptionsFilter (global error logging)
│   │   ├── materials/            # Photo archive CRUD, search, likes
│   │   ├── hierarchy/            # Continent/region/city/street management
│   │   └── users/                # User profiles, block/unblock
│   └── package.json
│
├── frontend/
│   ├── index.html                # Entry point with meta description
│   ├── public/
│   │   └── robots.txt
│   └── src/
│       ├── App.tsx               # Routing + context providers
│       ├── index.css             # CSS variables for all themes
│       ├── translations.ts       # PL/EN string dictionaries
│       ├── api/                  # Axios client + endpoint wrappers
│       ├── context/              # Auth, Theme, Lang, FontSize contexts
│       ├── components/
│       │   ├── layout/           # Header, Breadcrumb, ThemeSwitcher, UserMenu
│       │   ├── photos/           # PhotoGrid, PhotoCard, PhotoDetail, EmptyState
│       │   ├── search/           # SearchBar, HierarchyDropdowns, FilterChips
│       │   └── ui/               # Button, Input, Combobox (reusable primitives)
│       ├── pages/
│       │   ├── HomePage.tsx      # Main gallery with filters
│       │   ├── LoginPage.tsx
│       │   ├── RegisterPage.tsx
│       │   ├── UploadPage.tsx
│       │   ├── MyPostsPage.tsx
│       │   ├── EditPostPage.tsx
│       │   ├── AccountPage.tsx
│       │   └── admin/            # AdminLayout, Photos, Users, Hierarchy, New
│       └── constants/
│           └── continents.ts     # Hardcoded continent list
│
└── infra/
    ├── main.tf                   # DynamoDB, S3, IAM resources
    ├── variables.tf
    └── outputs.tf                # Table name, bucket name, IAM keys
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- AWS account with programmatic access
- Terraform 1.5+ (for infrastructure provisioning)

### 1. Provision Infrastructure

```bash
cd infra
terraform init
terraform apply
```

Note the outputs — you will need them for the `.env` file:

```
dynamodb_table_name   = "archive-table-<suffix>"
s3_bucket_name        = "archive-photos-bucket-<suffix>"
iam_access_key_id     = <sensitive>
iam_secret_access_key = <sensitive>
```

Retrieve sensitive values with:

```bash
terraform output -raw iam_access_key_id
terraform output -raw iam_secret_access_key
```

### 2. Configure Environment

```bash
cp .env.example backend/.env
# Edit backend/.env and fill in your values
```

See [Environment Variables](#environment-variables) for details on each variable.

### 3. Start Development Servers

**Windows (PowerShell) — single command:**

```powershell
.\start.ps1
```

This installs dependencies (if not already present) and opens both servers in separate windows.

**Manual start:**

```bash
# Terminal 1 — backend
cd backend && npm install && npm run start:dev

# Terminal 2 — frontend
cd frontend && npm install && npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |

---

## Environment Variables

Create `backend/.env` based on `.env.example`:

```env
# ── AWS ────────────────────────────────────────────────────
AWS_REGION=eu-central-1
AWS_ACCESS_KEY_ID=          # terraform output -raw iam_access_key_id
AWS_SECRET_ACCESS_KEY=      # terraform output -raw iam_secret_access_key
DYNAMODB_TABLE_NAME=        # terraform output dynamodb_table_name
S3_BUCKET_NAME=             # terraform output s3_bucket_name

# ── Authentication ─────────────────────────────────────────
JWT_SECRET=                 # Long random string — change in production
GOOGLE_CLIENT_ID=           # Google Cloud Console → APIs → Credentials
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# ── App ────────────────────────────────────────────────────
BACKEND_PORT=3000
FRONTEND_URL=http://localhost:5173
```

### Setting Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Create an **OAuth 2.0 Client ID** (Web application type)
3. Add `http://localhost:3000/auth/google/callback` to **Authorised redirect URIs**
4. Copy the Client ID and Client Secret into `backend/.env`

---

## Infrastructure (Terraform)

The `infra/` directory provisions all required AWS resources using Terraform.

### DynamoDB Table

Single-table design with pay-per-request billing:

```
Table: archive-table-<random_suffix>
  PK  (String) — partition key
  SK  (String) — sort key

  GSI: ByUploader  — uploadedBy (hash), uploadedAt (range)
  GSI: ByCity      — cityId (hash),     uploadedAt (range)
  GSI: ByRegion    — regionId (hash),   uploadedAt (range)
```

All GSIs use `ALL` projection so no additional queries are needed to fetch full item data.

### S3 Bucket

Public-read bucket for photo files. CORS is configured to allow requests from the frontend origin. The backend uploads and deletes files via the IAM service account; browsers read images directly via public S3 URLs.

### IAM User

A least-privilege service account `archive-backend-<suffix>` is created with a policy granting only:

- **DynamoDB:** `GetItem`, `PutItem`, `UpdateItem`, `DeleteItem`, `Query`, `Scan` — scoped to this table and its indexes
- **S3:** `GetObject`, `PutObject`, `DeleteObject` — scoped to this bucket only

---

## API Reference

The full OpenAPI 3.0 specification is in [`api-spec.yml`](./api-spec.yml). Paste the file into [editor.swagger.io](https://editor.swagger.io) to explore interactively.

### Base URL

```
http://localhost:3000
```

### Authentication Scheme

All protected endpoints require a valid JWT in an `httpOnly` cookie named `access_token`. The cookie is set automatically on login/register and cleared on logout. Send requests with credentials included (Axios: `withCredentials: true`).

### Endpoints

#### Auth

| Method | Path | Auth Required | Description |
|---|---|---|---|
| `POST` | `/auth/register` | — | Register with email and password |
| `POST` | `/auth/login` | — | Login with email and password |
| `POST` | `/auth/logout` | — | Clear session cookie |
| `GET` | `/auth/me` | Yes | Get current user, refresh JWT |
| `GET` | `/auth/google` | — | Initiate Google OAuth flow |
| `GET` | `/auth/google/callback` | — | Google OAuth redirect handler |

#### Materials

| Method | Path | Auth Required | Description |
|---|---|---|---|
| `GET` | `/materials` | — | Search / browse all materials |
| `POST` | `/materials` | CREATOR or ADMIN | Upload a new photo |
| `GET` | `/materials/my` | Yes | Get own uploaded materials |
| `GET` | `/materials/my-liked-ids` | Yes | Get IDs of liked materials |
| `GET` | `/materials/:id` | — | Get a single material |
| `PATCH` | `/materials/:id` | Owner or ADMIN | Update material metadata |
| `DELETE` | `/materials/:id` | Owner or ADMIN | Delete material |
| `POST` | `/materials/:id/like` | Yes | Toggle like on a material |
| `GET` | `/materials/admin/new-since/:since` | ADMIN | Materials uploaded after timestamp |

#### Hierarchy

| Method | Path | Auth Required | Description |
|---|---|---|---|
| `GET` | `/hierarchy/continents` | — | List continents |
| `POST` | `/hierarchy/continents` | ADMIN | Create a continent |
| `GET` | `/hierarchy/continents/:id/regions` | — | List regions for a continent |
| `POST` | `/hierarchy/continents/:id/regions` | ADMIN | Create a region |
| `GET` | `/hierarchy/regions/:id/cities` | — | List cities for a region |
| `POST` | `/hierarchy/regions/:id/cities` | ADMIN | Create a city |
| `GET` | `/hierarchy/cities/:id/streets` | — | List streets for a city |
| `POST` | `/hierarchy/cities/:id/streets` | ADMIN | Create a street |

#### Users (Admin only)

| Method | Path | Auth Required | Description |
|---|---|---|---|
| `GET` | `/users` | ADMIN | List all users |
| `POST` | `/users/:email/block` | ADMIN | Block a user |
| `POST` | `/users/:email/unblock` | ADMIN | Unblock a user |

### Search Query Parameters

`GET /materials` supports the following filters:

| Parameter | Type | Description |
|---|---|---|
| `continent` | string | Exact match, e.g. `Europe` |
| `country` | string | Case-insensitive partial match |
| `city` | string | Case-insensitive partial match |
| `phrase` | string | Searches title, description, country, city |
| `dateFrom` | string | Lower bound on `photoDate`, e.g. `1900` |
| `dateTo` | string | Upper bound on `photoDate`, e.g. `1990` |

### Upload Request Format

`POST /materials` accepts `multipart/form-data`:

| Field | Required | Description |
|---|---|---|
| `file` | Yes | Image file (JPG or PNG, max 10 MB) |
| `title` | Yes | Photo title |
| `description` | Yes | Text description |
| `altText` | Yes | Alt text for screen readers |
| `photoDate` | Yes | Date with arbitrary precision, e.g. `1923` or `1923-05` |
| `continent` | No | e.g. `Europe` |
| `country` | No | e.g. `Poland` |
| `city` | No | e.g. `Kraków` |
| `regionId` | No | Hierarchy region ID |
| `cityId` | No | Hierarchy city ID |
| `streetId` | No | Hierarchy street ID |
| `tags` | No | JSON-encoded array, e.g. `["church","bridge"]` |

---

## Security

### Authentication

- **Passwords** — hashed with `bcrypt` (10 salt rounds) before storage; plaintext is never persisted.
- **JWT** — 7-day tokens signed with `HS256`. The secret is read via `JwtModule.registerAsync()` to ensure environment variables are loaded before the module initialises (avoids secret mismatch when using `register()` which evaluates at import time, before dotenv runs).
- **Cookie** — tokens stored in an `httpOnly`, `sameSite: lax` cookie. This prevents JavaScript access to the token (XSS mitigation) and provides CSRF protection in same-site navigation contexts.
- **Google OAuth 2.0** — handled by `passport-google-oauth20`. The backend never sees the user's Google password; it receives only an email and display name from Google's verified profile. New users are auto-created on first Google login.
- **Blocked account enforcement** — `validateLocalUser` in `AuthService` throws `UnauthorizedException` if `isBlocked: true`, preventing blocked users from obtaining new tokens.

### Authorisation

Three guards are composed on protected routes:

| Guard | File | Responsibility |
|---|---|---|
| `JwtAuthGuard` | `auth/guards/jwt-auth.guard.ts` | Validates JWT signature and expiry; rejects with 401 if invalid or missing |
| `RolesGuard` | `auth/guards/roles.guard.ts` | Reads `@Roles(...)` metadata; rejects with 403 if user's role is not in the allowed list |
| `BlockGuard` | `auth/guards/block.guard.ts` | Re-reads user from DynamoDB on each request; rejects with 403 if `isBlocked: true` |

The `BlockGuard` performs a live database read so that blocking takes effect immediately — without waiting for the user's current JWT to expire.

Route protection levels:

| Level | Guards Applied | Example Endpoints |
|---|---|---|
| Public | None | `GET /materials`, `GET /hierarchy/*` |
| Authenticated | `JwtAuthGuard` | `GET /materials/my`, `POST /materials/:id/like` |
| Creator / Admin | `JwtAuthGuard` + `RolesGuard` + `BlockGuard` | `POST /materials` |
| Admin only | `JwtAuthGuard` + `RolesGuard(ADMIN)` | `GET /users`, `POST /users/:email/block` |

### Input Validation

All request bodies are validated via NestJS `ValidationPipe` with:

- `whitelist: true` — strips properties not declared in the DTO, silently
- `transform: true` — coerces types and runs `@Transform` decorators (required for JSON-encoded arrays sent as FormData strings)

### CORS

The backend only accepts cross-origin requests from the configured `FRONTEND_URL` with credentials. Requests from other origins are rejected at the middleware level.

### Infrastructure Security

- IAM policy follows the **principle of least privilege**: the backend service account has no permissions beyond the specific DynamoDB table and S3 bucket it needs.
- S3 objects are publicly readable (photo images must be viewable by anonymous users), but `PutObject` and `DeleteObject` are restricted to the IAM service account.
- Sensitive Terraform outputs (`iam_access_key_id`, `iam_secret_access_key`) are marked `sensitive = true` and masked in console output.

---

## Accessibility

The application targets **WCAG 2.1 Level AA**:

| Feature | Implementation |
|---|---|
| Skip navigation | `<a href="#main-content">` skip link visible on focus, bypasses header nav |
| Semantic structure | `<header>`, `<main>`, `<nav>`, `<article>` with appropriate landmark roles |
| Heading hierarchy | `<h1>` on each page, `<h2>` for photo card titles — no skipped levels |
| Keyboard navigation | All interactive elements reachable via Tab; activated with Enter / Space; modals closed with Escape |
| Focus indicators | 3 px solid accent-colour outline on all `:focus-visible` elements |
| ARIA attributes | `aria-label`, `aria-pressed`, `aria-modal` on controls without visible text labels |
| Alt text | Required field during photo upload; rendered directly on `<img alt="...">` |
| Colour contrast | Inactive button text uses `--text` token (not muted) to meet minimum 4.5:1 ratio for normal text |
| High-contrast theme | Yellow accent (`#ffff00`) with black text (`--on-accent: #000000`) |
| Dark theme | Light purple accent with dark text (`--on-accent: #18181b`) for readability |
| Touch targets | Like button enforces minimum 44 × 44 px clickable area |
| Font size toggle | Small (14 px) / Normal (16 px) / Large (19 px) via `document.documentElement.style.fontSize`; all spacing and layout use `rem` so the entire UI scales |
| Language declaration | `<html lang="pl">` set on the document; full PL / EN translation via `LangContext` |
| SEO / AT page summary | `<meta name="description">` provided in `index.html` |

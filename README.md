# QAI — AI Content & Social Publishing Platform

QAI is a full-stack platform that helps creators, marketers, and businesses produce high-quality content with AI and publish it across every major social network — automatically.

Built with **Spring Boot 3.4**, **Spring AI**, and **React + TypeScript**. Production-ready, not a tutorial.

---

## What QAI Does

### ✍️ AI Content Creation
Generate long-form blog posts, short-form social captions, video scripts, email newsletters, ad copy, product descriptions, and more — using GPT-4o with a custom prompt layer tuned for each content type and channel.

### 📅 Content Scheduler & Auto-Publishing
Connect your Facebook Pages, Instagram Business, TikTok, LinkedIn, Twitter/X, and YouTube accounts. Schedule posts for optimal times or let QAI's engagement predictor choose for you. Posts go live automatically — no babysitting required.

### 🔁 Content Repurposing Engine
Turn one piece of content into many. A blog post becomes a LinkedIn article, an Instagram carousel, three tweets, a newsletter section, and a short-form video script — all in one click.

### 📁 Knowledge Base (RAG)
Upload your brand guidelines, tone-of-voice docs, product specs, or research PDFs. QAI embeds them into a vector store (pgvector) and uses retrieval-augmented generation to make every AI output sound like *you*.

### 📊 Analytics & Performance Dashboard
Track reach, impressions, engagement rate, link clicks, and follower growth per post and per channel. AI-powered suggestions surface what's working and recommend when to post next.

### 🗂️ Content Calendar
Visual drag-and-drop calendar view. See all scheduled posts across all channels at a glance. Reschedule with drag-and-drop.

### 👥 Team Workspace
Invite teammates. Assign roles: Admin, Editor, Viewer. Editors can draft; only Admins approve and publish. Leave comments on drafts.

### 💬 AI Chat Assistant
A persistent chat interface for open-ended content brainstorming, research, and writing iteration — with full conversation memory.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 17, Spring Boot 3.4.3, Spring AI 1.0.0-M5 |
| AI | OpenAI GPT-4o-mini, text-embedding-3-small |
| Social APIs | Meta Graph API, TikTok Content Posting API, LinkedIn API, Twitter API v2, YouTube Data API v3 |
| Database | PostgreSQL 16 + pgvector |
| Queue | Redis (job scheduling, rate limiting) |
| Auth | JWT (jjwt 0.12.6), Spring Security, OAuth2 (Google, Facebook) |
| Frontend | React 18, TypeScript, Vite 6, Tailwind CSS 4 |
| Docs | SpringDoc OpenAPI (Swagger UI) |
| Infra | Docker, Docker Compose, Flyway migrations |

---

## Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- Docker & Docker Compose
- An OpenAI API key ([get one here](https://platform.openai.com/api-keys))

### 1. Clone and configure

```bash
git clone https://github.com/daoninhthai/qai-platform.git
cd qai-platform
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Required
OPENAI_API_KEY=sk-your-key-here

# Social integrations (add as you need them)
META_APP_ID=
META_APP_SECRET=
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
TWITTER_API_KEY=
TWITTER_API_SECRET=

# Google OAuth (for login)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### 2. Start the database

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 3. Run the backend

```bash
./mvnw spring-boot:run
```

API available at `http://localhost:8080`. Swagger at `http://localhost:8080/swagger-ui.html`.

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

### Alternative: Full Docker stack

```bash
docker-compose up --build
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Create account |
| `/api/auth/login` | POST | Get JWT tokens |
| `/api/auth/refresh` | POST | Refresh access token |
| `/api/auth/me` | GET | Current user info |
| `/api/content/generate` | POST | Generate AI content (type, tone, channel, topic) |
| `/api/content/repurpose` | POST | Repurpose existing content to other formats |
| `/api/content` | GET | List saved content drafts |
| `/api/content/{id}` | GET/PUT/DELETE | Manage a draft |
| `/api/posts` | GET/POST | List/create scheduled posts |
| `/api/posts/{id}` | GET/PUT/DELETE | Manage a scheduled post |
| `/api/posts/{id}/publish` | POST | Publish immediately |
| `/api/social/connect` | POST | OAuth connect a social account |
| `/api/social/accounts` | GET | List connected social accounts |
| `/api/analytics/overview` | GET | Dashboard metrics |
| `/api/analytics/posts` | GET | Per-post performance |
| `/api/calendar` | GET | Calendar view of scheduled posts |
| `/api/chat` | GET/POST | List/create AI chat conversations |
| `/api/chat/{id}` | GET/PUT/DELETE | Manage conversation |
| `/api/chat/{id}/stream` | GET (SSE) | Stream AI response |
| `/api/documents/upload` | POST | Upload doc to knowledge base |
| `/api/documents` | GET | List knowledge base docs |
| `/api/team/invite` | POST | Invite team member |
| `/api/team/members` | GET | List team |

---

## Project Structure

```
qai-platform/
├── src/main/java/com/daoninhthai/qai/
│   ├── config/          # Spring AI, Security, CORS, OpenAPI, Redis
│   ├── controller/      # REST controllers
│   ├── dto/             # Request/Response DTOs
│   ├── entity/          # JPA entities (User, Content, Post, SocialAccount, …)
│   ├── repository/      # Data access
│   ├── service/
│   │   ├── ai/          # ContentGenerationService, RepurposeService
│   │   ├── social/      # MetaPublisher, TikTokPublisher, LinkedInPublisher, …
│   │   ├── scheduler/   # PostSchedulerService (Redis + Spring Scheduler)
│   │   ├── analytics/   # AnalyticsAggregationService
│   │   ├── rag/         # DocumentService, EmbeddingService
│   │   └── chat/        # ChatService with streaming & memory
│   ├── security/        # JWT, OAuth2 handlers
│   └── exception/       # Global error handling
├── frontend/
│   └── src/
│       ├── api/         # Axios client + JWT interceptor
│       ├── components/
│       │   ├── auth/    # Login, Register, shared UI
│       │   ├── editor/  # AI content editor (rich text + AI sidebar)
│       │   ├── calendar/# Drag-and-drop content calendar
│       │   ├── social/  # Channel connection cards
│       │   ├── analytics/# Charts, metrics, post performance
│       │   └── layout/  # Sidebar, header, navigation
│       ├── context/     # Auth, Theme, Workspace state
│       ├── pages/       # Route-level pages
│       └── types/       # TypeScript interfaces
├── docker-compose.yml        # Production stack
├── docker-compose.dev.yml    # Dev database + Redis
└── Dockerfile                # Multi-stage build
```

---

## Roadmap

### v1.0 (current)
- [x] JWT auth + Google OAuth
- [x] AI content generation (blog, caption, script, email)
- [x] RAG knowledge base with pgvector
- [x] AI chat with conversation memory
- [x] SSE streaming responses

### v2.0 (in progress)
- [ ] Meta (Facebook + Instagram) publishing
- [ ] LinkedIn publishing
- [ ] Content scheduler with Redis queue
- [ ] Content calendar UI
- [ ] Basic analytics dashboard

### v3.0 (planned)
- [ ] TikTok & YouTube publishing
- [ ] Twitter/X publishing
- [ ] AI-powered best-time-to-post recommendations
- [ ] Content repurposing engine
- [ ] Team workspace + roles
- [ ] Post performance analytics + AI insights
- [ ] White-label / agency multi-workspace support
- [ ] Subscription billing (Stripe)

---

## Author

Built by **Thai Dao** ([@daoninhthai](https://github.com/daoninhthai)) — Java Full Stack Developer.

Open to collaboration, feature requests, or if you need a custom AI + social publishing integration built for your team.
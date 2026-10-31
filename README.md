# abnormallynormalstuffs(2)

A role-based, AI-augmented blogging platform built with React, Express.js, PostgreSQL, and Prisma ORM, deployed via Netlify.

## Features
- **Authentication & RBAC:** Google OAuth 2.0 with distinct Author and Moderator roles.
- **Authoring:** Rich article creation, draft/published states, categories, and tags.
- **Moderation Workflow:** User content reporting, moderation queue review, and audit trail logging.
- **AI-Assisted Quotes:** Server-side Google Gemini integration for topic-based quote ideation.
- **Database Architecture:** Fully normalized (3NF) relational schema with 10 tables, explicit foreign keys, composite join tables, and an analytical SQL view.

## Tech Stack
- **Frontend:** React (TypeScript), Vite, React Router, Axios, Netlify
- **Backend:** Node.js, Express.js (TypeScript), Prisma ORM
- **Database:** PostgreSQL (Normalized 3NF schema, 10 related tables)
- **External Services:** Google OAuth 2.0, Google Gemini API

---

## Local Setup & Installation

### Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running locally
- Google Cloud OAuth Client ID

### 1. Repository Setup
```bash
git clone [https://github.com/](https://github.com/)vivekbennysharma-svg/abnormallynormalstuffs(2).git
cd abnormallynormalstuffs(2)

### Step 2: Create the Database Evidence Document (`docs/database_evidence.md`)
Create a folder named `docs/` and add `docs/database_evidence.md` to document the SQL operations required by the course rubric:

```markdown
# Database Systems (BCSE302P) — Implementation Evidence

## 1. Relational Schema Summary (10 Tables)
1. `User` — Application accounts and role mapping (`AUTHOR`, `MODERATOR`).
2. `Post` — Blog posts linked to authors.
3. `Category` — Article categories.
4. `PostCategory` — Composite join table (`postId`, `categoryId`).
5. `Tag` — Reusable post tags.
6. `PostTag` — Composite join table (`postId`, `tagId`).
7. `Comment` — Reader comments linked to posts and users.
8. `Report` — User content reports flagged for moderation.
9. `ModerationAction` — Audit trail of actions taken by moderators.
10. `AIQuoteGeneration` — Audit logging for AI prompt usage and metadata.

## 2. Normalization Reasoning (3NF)
- **1NF:** All attributes are atomic; no repeating groups. Multi-valued tags and categories are decomposed into distinct relation tables (`PostTag`, `PostCategory`).
- **2NF:** No partial dependencies; non-key attributes fully depend on candidate keys. Composite tables contain only the foreign keys forming the composite primary key.
- **3NF:** No transitive dependencies. Moderator audit trails (`ModerationAction`) reference the user ID directly rather than deriving redundant author data.

## 3. Demonstration of Required Database Features
### A. Aggregations & Joins
- **Endpoint:** `GET /api/analytics/summary`
- Grouping post records by `status` and aggregating report statistics across author relationships.

### B. Transactions
- **Endpoint:** `POST /api/moderation/resolve`
- Uses `prisma.$transaction` to atomically record an entry in `ModerationAction`, change post visibility in `Post`, and resolve the status in `Report`.

### C. SQL View
- **Definition:** `PostAnalyticsView`
- Aggregates comments, reports, and author data per post to provide instant reporting metrics without redundant client joins.
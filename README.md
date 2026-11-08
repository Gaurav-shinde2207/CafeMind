# CafeMind ☕

> **"Your café. Your preferences. Your experience."**
> *Google Hack2Skill Hackathon | Google Gemini · Cloud SQL · Cloud Run · FastAPI · React · Tailwind CSS*

**🌍 Live demo:** <https://cafemind-721274091547.asia-south1.run.app>

CafeMind is a full-stack, AI-powered café ecosystem that connects guest discovery,

personalized AI ordering, and kitchen operations into a single deployable service.

```text
┌─────────────────────┐        ┌─────────────────────┐
│  Customer Interface │        │  Staff Dashboard    │
│  • AI chat ordering │        │  • Order dispatch   │
│  • Taste profiles   │        │  • Live wait times  │
│  • Order tracking   │        │  • AI insights      │
└──────────┬──────────┘        └──────────┬──────────┘
           └────────────┬─────────────────┘
                 ┌──────▼──────┐
                 │ FastAPI app │   one service, port 8080
                 │ / serves SPA│   /api/* JSON endpoints
                 └──────┬──────┘
              ┌─────────┴─────────┐
     ┌────────▼────────┐  ┌───────▼────────┐
     │ Cloud SQL       │  │ Gemini API     │
     │ PostgreSQL 15   │  │ google-genai   │
     └─────────────────┘  └────────────────┘
```

## Features

### Customer experience
- **AI conversational ordering (Gemini)** — customers ask for pairings

  ("cold coffee and a vegetarian snack under ₹250"); Gemini extracts diet,

  budget, and cravings and recommends only items that exist in the database.
- **Taste preference profiles** — roast, sweetness, allergens, price limits.
- **Server-validated orders** — Gemini never creates orders. Customers confirm

  explicitly; the backend recalculates all prices and availability from the DB.
- **Live ticket tracking** — polling status indicator

  (`Received → Preparing → Ready → Completed`) with dynamic wait-time estimation.

### Staff experience
- **Barista order dispatch** — status transitions with one click.
- **Dynamic kitchen wait times** — pacing computed from queue depth + prep times.
- **Gemini operational insights** — bottleneck analysis and staffing suggestions.
- **Feedback sentiment analyzer** — Gemini summarizes themes and actions.
- **PIN-protected demo access** — staff dashboard gated behind a PIN (`1234`,

  configurable via `STAFF_PIN`; UI-level gate for demo purposes).

### Engineering & security
- Health endpoint (`GET /api/health`) reports honest app, DB, and Gemini state.
- Orders validated server-side: item IDs, availability, and prices always come

  from the database — Gemini output never trusted for prices or order IDs.
- Gemini API key is backend-only, injected at runtime from **Secret Manager**.
- Cloud Run service uses IAM roles (`cloudsql.client`, `secretmanager.secretAccessor`)
- Production guard: no silent SQLite fallback when `ENVIRONMENT=production`.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, Tailwind CSS 3, lucide-react |
| Backend | Python 3.11, FastAPI, SQLAlchemy 2, Pydantic 2, psycopg2 |
| AI | Google Gemini via official `google-genai` SDK (structured JSON output) |
| Database | Google Cloud SQL for PostgreSQL (single-zone, db-f1-micro) |
| Hosting | Google Cloud Run (region `asia-south1`) |
| Build/Deploy | Cloud Build → Artifact Registry → Cloud Run |
| Secrets | Google Secret Manager (`cafemind-db-password`, `cafemind-gemini-key`) |

## Project structure

```text
SmartCafe/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app: /api/* + serves ../frontend/dist
│   │   ├── config.py          # env + Cloud SQL socket URL construction
│   │   ├── database.py        # SQLAlchemy engine, pool, health check
│   │   ├── gemini_service.py  # Gemini chat, feedback, ops insights (+mock fallback)
│   │   ├── models.py          # MenuItem, Order, OrderItem, Feedback, ...
│   │   ├── seed_data.py       # 15-item artisanal menu seed
│   │   └── routes/            # health, menu, orders, gemini, feedback, stats, preferences
│   ├── requirements.txt
│   └── .env.example
├── frontend/                  # React + Vite + Tailwind (builds to frontend/dist)
├── Dockerfile                 # 2-stage: node build → python runtime
├── cloudbuild.yaml            # build + deploy to Cloud Run
├── deploy.ps1                 # one-shot Windows deploy script
└── README.md
```

## API endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Honest app / DB / Gemini health |
| GET | `/api/menu` | List menu items |
| GET | `/api/menu/{id}` | Single item |
| POST | `/api/orders` | Create confirmed order (server-validated) |
| GET | `/api/orders` | List orders (staff queue) |
| GET | `/api/orders/{id}` | Order details / status |
| PATCH | `/api/orders/{id}/status` | Update order status |
| POST | `/api/ai/chat` | Gemini conversational ordering |
| POST | `/api/ai/feedback-summary` | Gemini feedback analysis |
| POST | `/api/ai/operational-insights` | Gemini ops insights |
| POST | `/api/feedback` | Submit feedback |
| GET | `/api/stats` | Live café statistics |
| POST | `/api/preferences` | Save taste profile |

Interactive docs: `/docs` (FastAPI Swagger UI).

## Run locally

```bash
# frontend
cd frontend
npm install
npm run build          # produces frontend/dist (served by FastAPI at /)

# backend
cd ../backend
python -m venv venv
venv/Scripts/pip install -r requirements.txt   # Windows
cp .env.example .env                            # add your GEMINI_API_KEY
venv/Scripts/uvicorn app.main:app --reload --port 8000
```

Local development works against SQLite (`cafemind.db`, auto-seeded) or any

`DATABASE_URL` you provide. Production requires Cloud SQL PostgreSQL.

## Deploy to Google Cloud

```bash
gcloud services enable run.googleapis.com sqladmin.googleapis.com \
  cloudbuild.googleapis.com artifactregistry.googleapis.com \
  secretmanager.googleapis.com sql-component.googleapis.com

gcloud sql instances create cafemind-db --region asia-south1 \
  --database-version POSTGRES_15 --tier db-f1-micro

gcloud builds submit --tag asia-south1-docker.pkg.dev/PROJECT_ID/cafemind-repo/cafemind:latest .

gcloud run deploy cafemind \
  --image asia-south1-docker.pkg.dev/PROJECT_ID/cafemind-repo/cafemind:latest \
  --region asia-south1 --port 8080 --memory 1Gi --cpu 1 \
  --min-instances 0 --max-instances 3 \
  --add-cloudsql-instances PROJECT_ID:asia-south1:cafemind-db \
  --set-env-vars "ENVIRONMENT=production,CLOUD_SQL_CONNECTION_NAME=PROJECT_ID:asia-south1:cafemind-db,DB_USER=cafemind_user,DB_NAME=cafemind" \
  --set-secrets "DB_PASSWORD=cafemind-db-password:latest,GEMINI_API_KEY=cafemind-gemini-key:latest"

gcloud run services add-iam-policy-binding cafemind --region asia-south1 \
  --member=allUsers --role=roles/run.invoker
```

Or run `.\deploy.ps1 -ProjectId <id>` on Windows.

## Environment variables

| Variable | Purpose | Source |
|---|---|---|
| `PORT` | Listen port | Set by Cloud Run (default 8080) |
| `ENVIRONMENT` | `development` / `production` | app config |
| `CLOUD_SQL_CONNECTION_NAME` | Enables Cloud SQL Unix-socket connection | Cloud Run env |
| `DB_USER`, `DB_NAME`, `DB_PASSWORD` | PostgreSQL credentials | env / Secret Manager |
| `GEMINI_API_KEY` | Gemini key, backend-only | Secret Manager |
| `STAFF_PIN` | Staff dashboard PIN (default `1234`) | env |

`.env` files are never committed. Secrets live in Secret Manager, mounted as

environment variables into Cloud Run via IAM.

## Cost notes (hackathon build)

Cloud Run scales to zero (min 0, max 3 instances). Main cost is the Cloud SQL

instance (db-f1-micro, ~$7–10/month). Delete after the hackathon with:

```bash
gcloud run services delete cafemind --region asia-south1
gcloud sql instances delete cafemind-db
```

---

*Hackathon team | Google Hack2Skill*

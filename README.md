# UPYOG Property Tax Analytics Dashboard

NUDM Intern Assessment 2026 — Full-stack analytics dashboard for the UPYOG multi-tenant platform.

## Demo

![Dashboard Overview](demo/Screenshot%202026-05-24%20004833.png)

![KPI Cards & Filter](demo/Screenshot%202026-05-24%20004900.png)

![AI Chatbot](demo/Screenshot%202026-05-24%20004935.png)

> Full walkthrough video: [`demo/Demo.mp4`](demo/Demo.mp4)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite, Tailwind CSS v4, Chart.js |
| Backend | Python 3.13, FastAPI, Uvicorn |
| AI | Multi-provider Ensemble — Groq (Llama-3.3), Gemini 2.5 Flash, GPT-4o-mini, Claude Haiku |
| Data | Repository Pattern — JSON fallback / PostgreSQL / Elasticsearch toggle |

---

## Project Structure

```
.
├── backend/
│   ├── main.py          # FastAPI app — /api/kpis, /api/chart-data, /api/summary
│   ├── repository.py    # Repository Pattern (JSON / ES / PG toggle)
│   ├── properties.json  # 1,000-record dataset
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── KPICard.jsx        # Single metric card
│   │   │   ├── TenantFilter.jsx   # City dropdown
│   │   │   ├── ComparisonChart.jsx # Grouped bar chart (Chart.js)
│   │   │   └── ChatWindow.jsx     # Ensemble AI chatbot with guardrails
│   │   ├── hooks/
│   │   │   └── usePropertyData.js # Data fetching + local JSON fallback
│   │   └── App.jsx                # Dashboard root
│   ├── public/properties.json
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## Local Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- At least one AI API key (Groq is recommended — free, no billing required: [console.groq.com](https://console.groq.com/keys))

---

### 1. Backend (FastAPI)

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

**Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/kpis?tenant=Delhi` | 4 KPI values for a city (or `All`) |
| GET | `/api/chart-data` | Grouped bar data for all 10 cities |
| GET | `/api/summary` | Text summary for the AI chatbot |

**Optional — connect to PostgreSQL or Elasticsearch** (create `backend/.env`):

```env
# PostgreSQL — set this to switch from JSON automatically
DATABASE_URL=postgresql://user:password@localhost:5432/upyog

# Elasticsearch — set this to switch from JSON automatically
# ES_HOST=http://localhost:9200
# ES_INDEX=properties
```

If neither is set, the backend reads from `backend/properties.json` by default.

---

### 2. Frontend (React + Vite)

```bash
cd frontend

# Copy and fill in at least one API key (Groq recommended — free)
cp .env.example .env
# Edit .env — add VITE_GROQ_API_KEY (and optionally others)

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

> **Note:** The frontend has a built-in fallback — if the backend is not running, it computes all KPIs and chart data directly from the local `public/properties.json`. The AI chatbot requires at least one valid API key in `frontend/.env` to let the ensemble of ai models give accuracy with less latency.

---

## Features

- **4 KPI Cards** — Total Registered, Approved, Rejected, Total Collection — update instantly on city filter change
- **Tenant Filter** — "All Cities" + 10 individual cities
- **Grouped Bar Chart** — Approved / Rejected / Pending per city (Chart.js)
- **AI Chatbot** — Multi-provider ensemble (Groq/Llama-3.3, Gemini 2.5 Flash, GPT-4o-mini, Claude Haiku) with strict domain guardrails and anti-jailbreak output validation
- **Repository Pattern** — swap JSON → PostgreSQL → Elasticsearch via a single env var

---

## Security

- API keys stored in `frontend/.env` (never committed — `.gitignore` enforced)
- CORS configured on the backend to allow frontend origin

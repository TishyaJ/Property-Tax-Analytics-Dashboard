# UPYOG Property Tax Analytics Dashboard

NUDM Intern Assessment 2026 — Full-stack analytics dashboard for the UPYOG multi-tenant platform.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite, Tailwind CSS v4, Chart.js |
| Backend | Python 3.13, FastAPI, Uvicorn |
| AI | Google Gemini 1.5 Flash (`@google/generative-ai`) |
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
│   │   │   └── ChatWindow.jsx     # Gemini AI chatbot with guardrails
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
- A free Gemini API key from [aistudio.google.com](https://aistudio.google.com)

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

**Optional — Switch data source** (create `backend/.env`):

```env
# "json" (default) | "postgres" | "elasticsearch"
DATA_SOURCE=json
```

---

### 2. Frontend (React + Vite)

```bash
cd frontend

# Copy and fill in your API key
cp .env.example .env
# Edit .env and set VITE_GEMINI_API_KEY=your_key_here

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

> **Note:** The frontend has a built-in fallback — if the backend is not running, it computes all KPIs and chart data directly from the local `public/properties.json`. The AI chatbot requires a valid Gemini API key.

---

## Features

- **4 KPI Cards** — Total Registered, Approved, Rejected, Total Collection — update instantly on city filter change
- **Tenant Filter** — "All Cities" + 10 individual cities
- **Grouped Bar Chart** — Approved / Rejected / Pending per city (Chart.js)
- **AI Chatbot** — Gemini 1.5 Flash with strict domain guardrails (refuses off-topic questions)
- **Repository Pattern** — swap JSON → PostgreSQL → Elasticsearch via a single env var

---

## Security

- Gemini API key stored in `frontend/.env` (never committed — `.gitignore` enforced)
- CORS configured on the backend to allow frontend origin

"""
FastAPI backend for UPYOG Property Tax Analytics Dashboard.
Endpoints:
  GET /api/kpis?tenant=Delhi        — 4 KPI values for a tenant (or all)
  GET /api/chart-data               — grouped bar data for all 10 cities
  GET /api/summary                  — text summary injected into AI chatbot
"""
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from repository import get_filtered, get_all_records

app = FastAPI(title="UPYOG Analytics API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

TENANTS = [
    "Delhi", "Mumbai", "Pune", "Bengaluru", "Chennai",
    "Hyderabad", "Ahmedabad", "Kolkata", "Jaipur", "Lucknow",
]


def _compute_kpis(records: list[dict]) -> dict:
    approved = [r for r in records if r["status"] == "Approved"]
    rejected = [r for r in records if r["status"] == "Rejected"]
    return {
        "total_registered": len(records),
        "total_approved": len(approved),
        "total_rejected": len(rejected),
        "total_collection_inr": round(sum(r["collection_inr"] for r in records), 2),
    }


@app.get("/api/kpis")
def kpis(tenant: str = Query(default="All")):
    records = get_filtered(tenant)
    return _compute_kpis(records)


@app.get("/api/chart-data")
def chart_data():
    all_records = get_all_records()
    result = []
    for city in TENANTS:
        city_records = [r for r in all_records if r["tenant"] == city]
        result.append({
            "city": city,
            "approved": sum(1 for r in city_records if r["status"] == "Approved"),
            "rejected": sum(1 for r in city_records if r["status"] == "Rejected"),
            "pending": sum(1 for r in city_records if r["status"] == "Pending"),
            "total_collection": round(
                sum(r["collection_inr"] for r in city_records), 2
            ),
        })
    return result


@app.get("/api/summary")
def summary():
    all_records = get_all_records()
    lines = [
        "UPYOG Property Tax Dashboard — Data Summary",
        f"Total records: {len(all_records)}",
        "",
    ]
    for city in TENANTS:
        city_records = [r for r in all_records if r["tenant"] == city]
        approved = sum(1 for r in city_records if r["status"] == "Approved")
        rejected = sum(1 for r in city_records if r["status"] == "Rejected")
        pending = sum(1 for r in city_records if r["status"] == "Pending")
        collection = round(sum(r["collection_inr"] for r in city_records), 2)
        lines.append(
            f"{city}: total={len(city_records)}, approved={approved}, "
            f"rejected={rejected}, pending={pending}, "
            f"collection=Rs.{collection:,.2f}"
        )

    top_city = max(
        TENANTS,
        key=lambda c: sum(
            r["collection_inr"] for r in all_records if r["tenant"] == c
        ),
    )
    lines.append(f"\nTop collecting city: {top_city}")
    return {"summary": "\n".join(lines)}

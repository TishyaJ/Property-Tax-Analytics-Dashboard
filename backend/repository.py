"""
Repository Pattern — abstracts data source behind a common interface.
Toggle via DATA_SOURCE env var: "json" | "elasticsearch" | "postgres"
"""
import json
import os
from pathlib import Path
from typing import Optional

DATA_SOURCE = os.getenv("DATA_SOURCE", "json")
JSON_DATA_PATH = os.getenv("JSON_DATA_PATH", "properties.json")
# Resolve path relative to this file's directory
_BASE_DIR = Path(__file__).parent


def _load_json() -> list[dict]:
    path = (_BASE_DIR / JSON_DATA_PATH).resolve()
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _load_elasticsearch() -> list[dict]:
    """Stub — replace with real ES client when ES_HOST is configured."""
    from elasticsearch import Elasticsearch  # type: ignore

    es = Elasticsearch(os.getenv("ES_HOST", "http://localhost:9200"))
    index = os.getenv("ES_INDEX", "properties")
    resp = es.search(index=index, body={"query": {"match_all": {}}, "size": 10000})
    return [hit["_source"] for hit in resp["hits"]["hits"]]


def _load_postgres() -> list[dict]:
    """Stub — replace with real psycopg2/asyncpg query when DATABASE_URL is set."""
    import psycopg2  # type: ignore
    import psycopg2.extras

    conn = psycopg2.connect(os.getenv("DATABASE_URL"))
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM properties;")
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_all_records() -> list[dict]:
    if DATA_SOURCE == "elasticsearch":
        return _load_elasticsearch()
    if DATA_SOURCE == "postgres":
        return _load_postgres()
    return _load_json()


def get_filtered(tenant: Optional[str] = None) -> list[dict]:
    records = get_all_records()
    if tenant and tenant.lower() != "all":
        records = [r for r in records if r["tenant"] == tenant]
    return records

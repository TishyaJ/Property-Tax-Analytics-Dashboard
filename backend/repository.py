import json
import os
from pathlib import Path
from typing import Optional

DATABASE_URL = os.getenv("DATABASE_URL")
ES_HOST      = os.getenv("ES_HOST")
JSON_PATH    = Path(__file__).parent / os.getenv("JSON_DATA_PATH", "properties.json")


def _load_postgres() -> list[dict]:
    import psycopg2
    import psycopg2.extras

    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT * FROM properties;")
            return [dict(row) for row in cur.fetchall()]
    finally:
        conn.close()


def _load_elasticsearch() -> list[dict]:
    from elasticsearch import Elasticsearch

    es = Elasticsearch(ES_HOST)
    index = os.getenv("ES_INDEX", "properties")
    resp = es.search(index=index, body={"query": {"match_all": {}}, "size": 10000})
    return [hit["_source"] for hit in resp["hits"]["hits"]]


def _load_json() -> list[dict]:
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def get_all_records() -> list[dict]:
    if DATABASE_URL:
        return _load_postgres()
    if ES_HOST:
        return _load_elasticsearch()
    return _load_json()


def get_filtered(tenant: Optional[str] = None) -> list[dict]:
    records = get_all_records()
    if tenant and tenant.lower() != "all":
        records = [r for r in records if r["tenant"] == tenant]
    return records

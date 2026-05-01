"""Integration tests for the API routes."""

import pytest


@pytest.mark.asyncio
async def test_health_check(client):
    resp = await client.get("/api/v1/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"


@pytest.mark.asyncio
async def test_submit_case(client):
    payload = {
        "title": "Test Criminal Case for Cheating",
        "jurisdiction": "Delhi High Court",
        "petitioner_name": "Ramesh Kumar",
        "respondent_name": "Suresh Sharma",
        "incident_date": "15 March 2023",
        "sections_alleged": "Section 420 IPC",
        "case_description": (
            "The complainant engaged the accused for construction of his house. "
            "The accused collected Rs. 5,00,000 and failed to commence any work "
            "and has since absconded. FIR was filed at the local police station."
        ),
        "relief_sought": "Direct the accused to refund Rs. 5,00,000 with interest.",
    }
    resp = await client.post("/api/v1/cases/submit", json=payload)
    assert resp.status_code == 202
    data = resp.json()
    assert "id" in data
    assert data["status"] in ("pending", "processing", "completed")
    assert data["title"] == payload["title"]


@pytest.mark.asyncio
async def test_submit_case_too_short(client):
    resp = await client.post("/api/v1/cases/submit", json={
        "title": "Test",
        "case_description": "Too short",
    })
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_list_cases(client):
    resp = await client.get("/api/v1/cases/")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


@pytest.mark.asyncio
async def test_get_nonexistent_case(client):
    resp = await client.get("/api/v1/cases/nonexistent-id")
    assert resp.status_code == 404

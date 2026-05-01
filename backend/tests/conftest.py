"""Pytest configuration and shared fixtures."""

import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from unittest.mock import AsyncMock, MagicMock

from app.db.postgres import Base, get_db
from app.core.security import get_current_user
from app.models.user import User
import uuid

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
async def test_engine():
    engine = create_async_engine(TEST_DB_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest.fixture(scope="function")
async def db_session(test_engine):
    session_factory = async_sessionmaker(test_engine, expire_on_commit=False)
    async with session_factory() as session:
        yield session


@pytest.fixture
def mock_user():
    return User(
        id=str(uuid.uuid4()),
        email="test@example.com",
        username="testuser",
        hashed_password="hashed",
        full_name="Test User",
        role="advocate",
        is_active=True,
    )


@pytest.fixture
async def client(db_session, mock_user):
    from main import app

    # Mock NLP pipeline
    mock_pipeline = MagicMock()
    mock_pipeline._loaded = True
    mock_pipeline.process = AsyncMock(return_value={
        "preprocessed": {"cleaned": "test", "sentences": [], "tokens": [], "legal_sections": [], "word_count": 5, "sentence_count": 1},
        "entities": {"persons": [], "organizations": [], "dates": [], "statutes": [], "courts": [], "locations": [], "money": []},
        "classification": {"case_type": "Criminal", "confidence": 0.9, "probabilities": {}, "method": "keyword"},
        "context": {},
        "draft_sections": {"title_block": "TITLE", "facts": "FACTS", "grounds": "GROUNDS", "prayer": "PRAYER", "verification": "VER", "_generation_time": 1.0, "_full_text": "FULL"},
    })
    app.state.nlp_pipeline = mock_pipeline

    app.dependency_overrides[get_db] = lambda: db_session
    app.dependency_overrides[get_current_user] = lambda: mock_user

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()

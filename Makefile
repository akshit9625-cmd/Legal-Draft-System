.PHONY: help up down build logs shell-backend shell-db test lint seed

help:
	@echo "LegalDraftAI — Development Commands"
	@echo "-------------------------------------"
	@echo "  make up            Start all services (Docker)"
	@echo "  make down          Stop all services"
	@echo "  make build         Rebuild Docker images"
	@echo "  make logs          Tail logs from all services"
	@echo "  make test          Run backend test suite"
	@echo "  make lint          Run flake8 linter"
	@echo "  make seed          Seed DB with demo data"
	@echo "  make migrate       Run Alembic migrations"
	@echo "  make shell-backend Open shell in backend container"
	@echo "  make dev-backend   Run backend locally (no Docker)"
	@echo "  make dev-frontend  Run frontend locally (no Docker)"

up:
	docker-compose up -d

down:
	docker-compose down

build:
	docker-compose build --no-cache

logs:
	docker-compose logs -f

shell-backend:
	docker-compose exec backend bash

shell-db:
	docker-compose exec postgres psql -U legaluser -d legal_draft_db

test:
	cd backend && pytest tests/ -v --tb=short

lint:
	cd backend && flake8 app/ --max-line-length=120 --ignore=E501,W503

seed:
	cd backend && python ../scripts/seed_data.py

migrate:
	cd backend && alembic upgrade head

migrate-new:
	cd backend && alembic revision --autogenerate -m "$(MSG)"

dev-backend:
	cd backend && uvicorn main:app --reload --port 8000

dev-frontend:
	cd frontend && npm run dev

install-backend:
	cd backend && pip install -r requirements.txt && python -m spacy download en_core_web_sm

install-frontend:
	cd frontend && npm install

models:
	cd backend && python ../scripts/download_models.py

.PHONY: help build up down logs clean dev prod

help:
	@echo "PostgreSQL Dashboard - Available Commands"
	@echo ""
	@echo "Production:"
	@echo "  make up           - Start all services (production)"
	@echo "  make down         - Stop all services"
	@echo "  make logs         - View all service logs"
	@echo "  make logs-backend - View backend logs"
	@echo "  make logs-frontend - View frontend logs"
	@echo "  make logs-db      - View database logs"
	@echo "  make build        - Build all images"
	@echo "  make clean        - Stop and remove all containers/volumes"
	@echo ""
	@echo "Development:"
	@echo "  make dev          - Start services in development mode (hot reload)"
	@echo "  make dev-down     - Stop development services"
	@echo "  make dev-logs     - View development logs"
	@echo ""
	@echo "Database:"
	@echo "  make db-shell     - Connect to PostgreSQL shell"
	@echo "  make db-dump      - Backup database"
	@echo "  make db-restore   - Restore database"
	@echo ""
	@echo "Utilities:"
	@echo "  make ps           - Show running containers"
	@echo "  make restart      - Restart all services"
	@echo "  make rm-images    - Remove all images"

# Production targets
up:
	docker-compose up -d
	@echo "✓ Services started!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:8000"

down:
	docker-compose down

restart:
	docker-compose restart

logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

logs-db:
	docker-compose logs -f postgres

build:
	docker-compose build

clean:
	docker-compose down -v
	@echo "✓ All containers and volumes removed!"

ps:
	docker-compose ps

# Development targets
dev:
	docker-compose -f docker-compose.dev.yml up -d
	@echo "✓ Development services started!"
	@echo "Frontend (hot reload): http://localhost:3000"
	@echo "Backend (hot reload): http://localhost:8000"

dev-down:
	docker-compose -f docker-compose.dev.yml down

dev-logs:
	docker-compose -f docker-compose.dev.yml logs -f

# Database targets
db-shell:
	docker-compose exec postgres psql -U postgres

db-dump:
	@mkdir -p ./backups
	docker-compose exec -T postgres pg_dump -U postgres postgres > ./backups/postgres_backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "✓ Database backed up to backups/ directory"

db-restore:
	@echo "Enter backup filename (in backups/ directory):"
	@read backup_file; \
	docker-compose exec -T postgres psql -U postgres < ./backups/$$backup_file
	@echo "✓ Database restored!"

# Docker image targets
rm-images:
	docker rmi postgresql-dashboard-backend postgresql-dashboard-frontend 2>/dev/null || true
	@echo "✓ Images removed!"

# Health check
health:
	@echo "Checking service health..."
	@docker-compose ps
	@echo ""
	@docker-compose exec -T postgres pg_isready || echo "PostgreSQL: NOT READY"
	@docker-compose exec backend curl -s http://localhost:8000/health || echo "Backend: NOT READY"
	@echo "Frontend is running on port 3000"

# Format and lint
format:
	@echo "Formatting Python code..."
	docker-compose exec backend black app/
	@echo "✓ Python formatted!"

lint:
	@echo "Linting Python code..."
	docker-compose exec backend flake8 app/
	@echo "✓ Python linted!"

# Prune unused resources
prune:
	docker system prune -f
	@echo "✓ Pruned unused Docker resources!"

.DEFAULT_GOAL := help

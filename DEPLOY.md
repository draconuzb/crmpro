# Modme CRM — Deploy Guide

## Architecture

```
GitHub (push to main)
        │
        ▼
GitHub Actions ──SSH──▶ EC2 Server
                        ├── docker compose up --build
                        ├── nginx (port 80) ─── serves frontend
                        │                   └── proxies /api → backend
                        ├── api (port 3000, internal only)
                        ├── postgres (port 5432, internal only)
                        └── redis (port 6379, internal only)
```

## 1. GitHub Secrets Setup

Go to your repo → Settings → Secrets and variables → Actions → New repository secret:

| Secret Name        | Value                                       |
|--------------------|---------------------------------------------|
| `SERVER_HOST`      | `44.212.220.91`                             |
| `SERVER_USER`      | `ubuntu`                                    |
| `SSH_PRIVATE_KEY`  | Contents of `one_sec.pem` file (full text)  |

### How to get SSH_PRIVATE_KEY:
```bash
cat one_sec.pem
# Copy the ENTIRE output including:
# -----BEGIN RSA PRIVATE KEY-----
# ... (key content) ...
# -----END RSA PRIVATE KEY-----
```

## 2. Server First-Time Setup

```bash
# Connect to server
ssh -i "one_sec.pem" ubuntu@ec2-44-212-220-91.compute-1.amazonaws.com

# Download and run setup script (or clone repo first)
git clone git@github.com:YOUR_USERNAME/modme-crm.git /home/ubuntu/modme-crm
cd /home/ubuntu/modme-crm
chmod +x setup.sh
./setup.sh
```

The setup script will:
- Install Docker, Docker Compose, Git
- Clone/pull the repo
- Generate secure random passwords and JWT secrets
- Create the `.env` file

## 3. First Deploy (Manual)

```bash
cd /home/ubuntu/modme-crm

# Review environment variables
nano .env

# Build and start all containers
docker compose -f docker-compose.prod.yml up -d --build

# Check all containers are running
docker compose -f docker-compose.prod.yml ps

# Seed the database (first time only)
docker compose -f docker-compose.prod.yml exec api sh -c "cd apps/api && npx prisma db seed"

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

## 4. Automatic Deploy (CI/CD)

After the first manual deploy, every `git push` to `main` will:

1. GitHub Actions triggers
2. SSHs into the EC2 server
3. Pulls latest code
4. Runs `docker compose build --no-cache`
5. Runs `docker compose up -d`
6. Prisma migrations run automatically on API startup
7. Health check verifies deployment

```bash
# Your normal workflow:
git add .
git commit -m "feat: add new feature"
git push origin main
# → Auto-deploys in ~3-5 minutes
```

## 5. Useful Commands

```bash
# View running containers
docker compose -f docker-compose.prod.yml ps

# View logs (follow mode)
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f web

# Restart a specific service
docker compose -f docker-compose.prod.yml restart api

# Stop everything
docker compose -f docker-compose.prod.yml down

# Stop and remove volumes (WARNING: deletes database!)
docker compose -f docker-compose.prod.yml down -v

# Run Prisma Studio (debug)
docker compose -f docker-compose.prod.yml exec api sh -c "cd apps/api && npx prisma studio"

# Database backup
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U modme modme_crm > backup_$(date +%Y%m%d).sql

# Database restore
cat backup.sql | docker compose -f docker-compose.prod.yml exec -T postgres psql -U modme modme_crm
```

## 6. Troubleshooting

**Container won't start:**
```bash
docker compose -f docker-compose.prod.yml logs api --tail=50
```

**Database connection error:**
```bash
# Check if postgres is healthy
docker compose -f docker-compose.prod.yml ps postgres
# Verify .env DATABASE_URL matches docker-compose settings
```

**Port 80 already in use:**
```bash
sudo lsof -i :80
# Change APP_PORT in .env to another port (e.g. 8080)
```

## File Structure

```
modme-crm/
├── .github/workflows/deploy.yml   # GitHub Actions CI/CD
├── apps/
│   ├── api/
│   │   ├── Dockerfile              # Backend multi-stage build
│   │   └── prisma/schema.prisma
│   └── web/
│       ├── Dockerfile              # Frontend build → nginx
│       └── nginx.conf              # Reverse proxy config
├── docker-compose.prod.yml         # Production orchestration
├── .env.example                    # Template for env vars
├── .dockerignore                   # Exclude from Docker build
├── setup.sh                        # Server first-time setup
└── DEPLOY.md                       # This file
```

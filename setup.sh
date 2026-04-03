#!/bin/bash
set -e

# ═══════════════════════════════════════
# Modme CRM — Server First-Time Setup
# Run: chmod +x setup.sh && ./setup.sh
# ═══════════════════════════════════════

echo "══════════════════════════════════════"
echo "  Modme CRM — Server Setup"
echo "══════════════════════════════════════"

# ── 1. System update ──
echo ""
echo "→ [1/6] Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# ── 2. Install Docker ──
echo ""
echo "→ [2/6] Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sudo sh
    sudo usermod -aG docker $USER
    echo "  ✓ Docker installed. You may need to re-login for group changes."
else
    echo "  ✓ Docker already installed: $(docker --version)"
fi

# ── 3. Install Docker Compose plugin ──
echo ""
echo "→ [3/6] Checking Docker Compose..."
if docker compose version &> /dev/null; then
    echo "  ✓ Docker Compose available: $(docker compose version)"
else
    sudo apt-get install -y docker-compose-plugin
    echo "  ✓ Docker Compose plugin installed"
fi

# ── 4. Install Git ──
echo ""
echo "→ [4/6] Checking Git..."
if ! command -v git &> /dev/null; then
    sudo apt-get install -y git
fi
echo "  ✓ Git: $(git --version)"

# ── 5. Clone repo ──
DEPLOY_PATH="/home/ubuntu/modme-crm"
echo ""
echo "→ [5/6] Setting up project at $DEPLOY_PATH..."

if [ -d "$DEPLOY_PATH" ]; then
    echo "  ✓ Project directory already exists"
    cd "$DEPLOY_PATH"
    git pull origin main
else
    read -p "  Enter GitHub repo URL (e.g. git@github.com:user/modme-crm.git): " REPO_URL
    git clone "$REPO_URL" "$DEPLOY_PATH"
    cd "$DEPLOY_PATH"
fi

# ── 6. Create .env ──
echo ""
echo "→ [6/6] Setting up environment..."

if [ ! -f .env ]; then
    cp .env.example .env

    # Generate random secrets
    JWT_SECRET=$(openssl rand -hex 32)
    JWT_REFRESH_SECRET=$(openssl rand -hex 32)
    PG_PASSWORD=$(openssl rand -hex 16)
    REDIS_PASSWORD=$(openssl rand -hex 16)

    # Replace placeholders in .env
    sed -i "s|CHANGE_ME_strong_password_here|$PG_PASSWORD|g" .env
    sed -i "s|CHANGE_ME_redis_password_here|$REDIS_PASSWORD|g" .env
    sed -i "s|CHANGE_ME_jwt_secret_here|$JWT_SECRET|g" .env
    sed -i "s|CHANGE_ME_jwt_refresh_secret_here|$JWT_REFRESH_SECRET|g" .env

    # Ask for domain
    read -p "  Enter your domain or server IP (e.g. crm.example.com or 44.212.220.91): " DOMAIN
    sed -i "s|http://your-domain.com|http://$DOMAIN|g" .env

    echo "  ✓ .env created with auto-generated secrets"
    echo ""
    echo "  ⚠  Review your .env file before proceeding:"
    echo "     nano $DEPLOY_PATH/.env"
else
    echo "  ✓ .env already exists"
fi

echo ""
echo "══════════════════════════════════════"
echo "  Setup complete!"
echo "══════════════════════════════════════"
echo ""
echo "  Next steps:"
echo "  1. Review .env:        nano .env"
echo "  2. Build & start:      docker compose -f docker-compose.prod.yml up -d --build"
echo "  3. Seed database:      docker compose -f docker-compose.prod.yml exec api sh -c 'cd apps/api && npx prisma db seed'"
echo "  4. Check status:       docker compose -f docker-compose.prod.yml ps"
echo "  5. View logs:          docker compose -f docker-compose.prod.yml logs -f"
echo ""
echo "  Your app will be available at: http://$DOMAIN"
echo ""

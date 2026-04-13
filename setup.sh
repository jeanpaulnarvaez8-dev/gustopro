#!/bin/sh
# setup.sh — GustoPro Website
# Prima volta: sh setup.sh
# Aggiornamento: sh setup.sh --update

SSH_KEY="/share/HDA_DATA/id_ed25519"
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
UPDATE_ONLY=0

if [ "$1" = "--update" ]; then
  UPDATE_ONLY=1
fi

echo ""
echo "============================================="
echo "  GustoPro Website — Setup QNAP"
echo "============================================="
echo "  Dir: $REPO_DIR"
echo ""

# ── 1. Git SSH ────────────────────────────────────
echo "[1/3] Configuro git SSH..."
git -C "$REPO_DIR" config core.sshCommand "ssh -i $SSH_KEY -o StrictHostKeyChecking=no"
echo "      OK"

# ── 2. Pull ───────────────────────────────────────
echo ""
echo "[2/3] Pull da GitHub (main)..."
GIT_SSH_COMMAND="ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
  git -C "$REPO_DIR" pull origin main
echo "      OK"

# ── 3. Docker ─────────────────────────────────────
echo ""
echo "[3/3] Build e avvio container Docker..."
docker compose -f "$REPO_DIR/docker-compose.yml" up -d --build

echo ""
echo "============================================="
echo "  Setup completato!"
echo "============================================="
IP=$(hostname -i 2>/dev/null || echo "IP-QNAP")
echo "  Website + API → http://${IP}:3010"
echo "  API Health    → http://${IP}:3010/api/health"
echo "  Database      → PostgreSQL (gustopro-db container)"
echo ""
echo "  Comandi utili:"
echo "    Ver log:   docker compose -f $REPO_DIR/docker-compose.yml logs -f"
echo "    Log API:   docker compose -f $REPO_DIR/docker-compose.yml logs -f app"
echo "    Log DB:    docker compose -f $REPO_DIR/docker-compose.yml logs -f db"
echo "    Stop:      docker compose -f $REPO_DIR/docker-compose.yml down"
echo "    Aggiorna:  sh $REPO_DIR/setup.sh --update"
echo ""

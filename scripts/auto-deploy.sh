#!/bin/bash
# ─────────────────────────────────────────────────────
# GustoPro Website — Auto Deploy Script — v1.0
# Controlla GitHub ogni 5 min. Se ci sono nuovi commit
# fa git pull + docker compose build + up -d
#
# Setup (una volta sola in ufficio):
#   chmod +x /share/ZFS20_DATA/dev-projects/gustopro-website/scripts/auto-deploy.sh
#   crontab -e
#   Aggiungere: */5 * * * * /share/ZFS20_DATA/dev-projects/gustopro-website/scripts/auto-deploy.sh >> /share/ZFS20_DATA/dev-projects/gustopro-website/logs/deploy.log 2>&1
# ─────────────────────────────────────────────────────

export PATH="/share/ZFS530_DATA/.qpkg/container-station/bin:/opt/bin:/opt/sbin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

PROJECT_DIR="/share/ZFS20_DATA/dev-projects/gustopro-website"
LOG_PREFIX="[$(date '+%Y-%m-%d %H:%M:%S')]"

cd "$PROJECT_DIR" || { echo "$LOG_PREFIX ERRORE: directory non trovata $PROJECT_DIR"; exit 1; }

GIT="git -c safe.directory=$PROJECT_DIR"

$GIT fetch origin main --quiet

LOCAL=$($GIT rev-parse HEAD)
REMOTE=$($GIT rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
  exit 0
fi

echo "$LOG_PREFIX Nuovi commit rilevati. Avvio deploy..."
echo "$LOG_PREFIX Commit locale:  $LOCAL"
echo "$LOG_PREFIX Commit remoto:  $REMOTE"

$GIT reset --hard origin/main
if [ $? -ne 0 ]; then
  echo "$LOG_PREFIX ERRORE: git reset fallito"
  exit 1
fi
echo "$LOG_PREFIX git reset completato"

docker compose build --no-cache
if [ $? -ne 0 ]; then
  echo "$LOG_PREFIX ERRORE: docker compose build fallito"
  exit 1
fi

docker compose up -d
if [ $? -ne 0 ]; then
  echo "$LOG_PREFIX ERRORE: docker compose up fallito"
  exit 1
fi

echo "$LOG_PREFIX Deploy completato con successo"
echo "────────────────────────────────────────"

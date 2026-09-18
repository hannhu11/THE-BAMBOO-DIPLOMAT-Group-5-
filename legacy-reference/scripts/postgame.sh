#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
ts=$(date +%Y%m%d_%H%M)
mkdir -p "/var/backup/bamboo/$ts"
docker compose -f infra/docker-compose.yml exec -T redis redis-cli -a "$REDIS_PASSWORD" SAVE
docker cp $(docker compose -f infra/docker-compose.yml ps -q redis):/data/dump.rdb "/var/backup/bamboo/$ts/dump.rdb"
echo "Saved snapshot to /var/backup/bamboo/$ts/"

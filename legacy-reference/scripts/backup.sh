#!/usr/bin/env bash
# scripts/backup.sh — cron mỗi 30' (cấu hình trong 11_DEPLOY_ORACLE.md §9)
set -euo pipefail
cd "$(dirname "$0")/.."
ts=$(date +%Y%m%d_%H%M)
mkdir -p "/var/backup/bamboo"
docker compose -f infra/docker-compose.yml exec -T redis redis-cli -a "$REDIS_PASSWORD" BGSAVE
sleep 3
docker cp $(docker compose -f infra/docker-compose.yml ps -q redis):/data/dump.rdb "/var/backup/bamboo/dump_$ts.rdb"
# giữ 24 file gần nhất (12 giờ * 2/h)
ls -1t /var/backup/bamboo/dump_*.rdb | tail -n +25 | xargs -r rm -f

#!/usr/bin/env bash
# scripts/preflight.sh — chạy 30 phút trước buổi thuyết trình.
set -euo pipefail
cd "$(dirname "$0")/.."

DOMAIN="${DOMAIN:-diplomat.example.com}"

echo "== 1) docker health"
docker compose -f infra/docker-compose.yml ps

echo "== 2) reset & seed"
docker compose -f infra/docker-compose.yml exec -T api node scripts/seed.js

echo "== 3) health check 5 lần"
for i in 1 2 3 4 5; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/health")
  echo "  attempt $i: HTTP $code"
  [[ "$code" != "200" ]] && exit 1
  sleep 2
done

echo "== 4) test QR"
curl -sf "https://$DOMAIN/qr" -o /tmp/qr.png
ls -la /tmp/qr.png
echo "QR saved /tmp/qr.png — in ra A4 dán bảng phòng học nếu cần backup."

echo "== 5) Redis online set is empty (chờ SV quét)"
docker compose -f infra/docker-compose.yml exec -T redis redis-cli -a "$REDIS_PASSWORD" SCARD bd:online

echo "== 6) Xong. Sẵn sàng chiến."

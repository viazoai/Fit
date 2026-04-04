#!/bin/bash
set -e

echo "=== 1. 환경변수 확인 ==="
if [ -z "$CLOUDFLARE_TUNNEL_TOKEN" ] && ! grep -q CLOUDFLARE_TUNNEL_TOKEN .env 2>/dev/null; then
  echo "ERROR: CLOUDFLARE_TUNNEL_TOKEN이 설정되지 않았습니다"
  exit 1
fi

echo "=== 2. 이미지 빌드 (서비스 중단 없이) ==="
docker compose build --no-cache

echo "=== 3. DB 먼저 올리기 ==="
docker compose up -d db
echo "DB 준비 대기..."
until docker compose exec db pg_isready -U fit > /dev/null 2>&1; do
  sleep 1
done

echo "=== 4. DB 마이그레이션 ==="
docker compose run --rm backend alembic upgrade head

echo "=== 5. 전체 서비스 교체 ==="
docker compose up -d --no-build

echo "=== 6. 헬스체크 ==="
sleep 3
curl -sf http://localhost:3210 > /dev/null && echo "✓ Frontend OK" || echo "✗ Frontend FAIL"
curl -sf http://localhost:3213/docs > /dev/null && echo "✓ Backend OK" || echo "✗ Backend FAIL"

echo "=== 배포 완료 ==="

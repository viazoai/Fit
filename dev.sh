#!/bin/bash
echo "개발 서버 시작..."
docker compose up -d db
echo "DB 준비 대기..."
until docker compose exec db pg_isready -U fit > /dev/null 2>&1; do
  sleep 1
done
docker compose up -d --build backend
echo "DB + API 준비 완료 (localhost:3213)"
echo "프론트 개발 서버 시작 (localhost:3211)"
npm run dev

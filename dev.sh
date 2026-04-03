#!/bin/bash
echo "개발 서버 시작..."
docker compose up -d db backend
echo "DB + API 준비 완료 (localhost:3213)"
echo "프론트 개발 서버 시작 (localhost:3211)"
npm run dev

#!/bin/bash
echo "개발 서버 시작..."
docker compose up -d db backend
echo "DB + API 준비 완료 (localhost:8000)"
echo "프론트 개발 서버 시작 (localhost:5173)"
npm run dev

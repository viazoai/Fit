#!/bin/bash
echo "배포 시작..."
docker compose down
docker compose up --build -d
echo "배포 완료! Cloudflare URL에서 확인하세요."
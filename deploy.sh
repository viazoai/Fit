#!/bin/bash
set -e
echo "배포 시작..."

# 1. 먼저 이미지 빌드 (서비스 중단 없이)
docker compose build

# 2. 빌드 완료 후 컨테이너만 교체 (다운타임 최소화)
docker compose up -d --no-build

echo "배포 완료!"

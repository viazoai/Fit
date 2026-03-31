# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Fit** (A-Fit)는 부부 특화 AI 피트니스 에이전트 앱입니다. 홈랩(N100 미니 PC)에서 자가 호스팅하며, 프라이버시 중심의 초개인화 운동 기록 및 추천 서비스를 목표로 합니다.

## Tech Stack
- **Backend:** FastAPI (Python)                                                                 
- **Frontend:** React + Vite + TypeScript (PWA) — Polar 프로젝트의 디자인 시스템 재사용         
- **Database:** PostgreSQL                                                                      
- **AI:** OpenAI GPT (루틴 추천, 인사이트 리포트)                                               
- **Infrastructure:** Docker & Docker Compose, Ubuntu homelab   
- **Frontend:** React + Vite + TypeScript
- **UI:** shadcn/ui (`@base-ui/react` 기반) + Tailwind CSS v4

> 백엔드, DB, AI, 인프라는 미결정. 프론트엔드 UI부터 시작한다.

## Design System

Polar 프로젝트(`/home/zoai/Projects/Polar/frontend`)의 shadcn/ui 설정을 기반으로 한다.

### 핵심 규칙

- **`asChild` prop 없음.** Link를 버튼처럼 쓸 때는 `buttonVariants()` 사용:
  ```tsx
  import { buttonVariants } from "@/components/ui/button";
  import { cn } from "@/lib/utils";
  <Link to="/workout" className={cn(buttonVariants({ variant: "outline" }))} />
  ```
- **모바일 우선:** 375px 기준으로 먼저 구현, `md:` 브레이크포인트(768px)
- **모바일 판단:** `window.innerWidth` 직접 사용 금지 → `useIsMobile()` 훅 사용

## Target Users

부부 2인 사용자. UI 언어는 **한국어**.

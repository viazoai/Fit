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

## Claude Agent & Skill 구성

프로젝트에서는 다음 에이전트/스킬 구조를 사용합니다.

- `.claude/skills/common-ui.skill.md` : 모바일 우선, shadcn/ui, 한국어, 부부 UX 공통 가이드
- `.claude/skills/designer-shadcn.skill.md` : shadcn/ui 기반 디자인 스펙
- `.claude/skills/frontend-react.skill.md` : React+TypeScript 컴포넌트 구현
- `.claude/skills/backend-fastapi.skill.md` : FastAPI + PostgreSQL + OpenAI 백엔드

- `.claude/agents/designer.agent.md` : UI/UX 디자인 작업 에이전트
- `.claude/agents/frontend.agent.md` : 프론트엔드 구현 에이전트
- `.claude/agents/backend.agent.md` : 백엔드 구현 에이전트
- `.claude/agents/project-manager.agent.md` : 복합 작업 오케스트레이션 에이전트

### 작업 방식

1. 단일 역할 요청(예: 디자인 또는 프론트, 백엔드)에는 해당 에이전트를 직접 호출
2. 복합 요청(예: 전체 기능 구현)에는 project-manager 에이전트 호출
3. 병렬 처리가 필요하면 step을 분리하거나 명시적으로 `designer + frontend` 등의 순차 실행으로 구성
4. 전체 규칙은 한글로 작성하며, `description`에는 명확한 `사용 시점` 키워드 포함

이 가이드를 바탕으로 Claude Code가 Fit 엔지니어링 방식에 맞는 출력 결과를 내도록 설정합니다.

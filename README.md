# 날씨 대시보드 (Weather Dashboard)

  React(프론트엔드) + Express(백엔드)로 구성된 날씨 대시보드 예제 프로젝트입니다.

  ## 구조

  ```
  artifacts/
  ├── weather-app/       ← 프론트엔드 (React + Vite)
  └── api-server/        ← 백엔드 (Express)

  lib/
  ├── api-spec/          ← OpenAPI 스펙 (계약 정의)
  ├── api-client-react/  ← 자동 생성된 React Query 훅
  └── api-zod/           ← 자동 생성된 Zod 유효성 검사 스키마
  ```

  ## 동작 흐름

  ```
  React 프론트 → Express 백엔드(/api/weather) → wttr.in(외부 날씨 API)
  ```

  ## 기능

  - 도시 이름으로 실시간 날씨 검색 (한글/영어 모두 지원)
  - 현재 기온, 체감온도, 습도, 풍속, UV 지수, 가시거리 표시
  - 3일 예보 (최고/최저 기온, 날씨 상태, 강수 확률)
  - 낮/밤 분위기에 따른 UI 변화

  ## 기술 스택

  - **프론트엔드**: React, Vite, TypeScript, TailwindCSS, shadcn/ui, TanStack Query
  - **백엔드**: Express 5, Node.js, TypeScript
  - **API 계약**: OpenAPI 3.1 + Orval 코드 생성
  - **패키지 관리**: pnpm workspaces

  ## 실행 방법

  ```bash
  # 의존성 설치
  pnpm install

  # 백엔드 실행 (포트 8080)
  pnpm --filter @workspace/api-server run dev

  # 프론트엔드 실행
  pnpm --filter @workspace/weather-app run dev
  ```

  ## 외부 API

  날씨 데이터는 [wttr.in](https://wttr.in) 무료 API를 사용합니다. API 키 없이 사용 가능합니다.
  
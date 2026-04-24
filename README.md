# 🌾 FarmTrade Alert

> 농산물 실시간 도매가 모니터링 및 가격 알림 서비스

**한경×토스뱅크 FullStack-LLM 부트캠프 3차 해커톤**  
개발자: 임소라

---

## 1. 프로젝트 개요

**수행 주제:** 농산물 실시간 도매가 모니터링 및 조건별 가격 알림 서비스

FarmTrade 시리즈 3차 프로젝트로, 1차(선물거래 시뮬레이터)·2차(뉴스 구독)의 기능을 통합하고 실시간 가격 알림 시스템을 추가했습니다.

KAMIS(한국농수산식품유통공사) 도매가 API 연동 구조를 기반으로, 사용자가 원하는 가격 조건을 등록하면 조건 충족 시 자동 알림을 생성합니다.

**배포 주소:** https://identifying-unknown-commonwealth-impression.trycloudflare.com

**사용 기술:**
`Next.js 16` `React` `Tailwind CSS` `React Query (TanStack Query)` `Zustand` `MariaDB` `JWT` `bcryptjs` `Node.js` `GCP VM` `Cloudflare Tunnel`

---

## 2. 백엔드 구성 및 라우팅

**구현 방식:** Next.js App Router Route Handlers (`app/api/...`)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | /api/auth/register | 회원가입 |
| POST | /api/auth/login | 로그인 |
| PUT | /api/auth/password | 비밀번호 변경 |
| DELETE | /api/auth/delete | 회원 탈퇴 |
| GET/POST | /api/alerts | 알림 조건 조회/등록 |
| PUT/DELETE | /api/alerts/[id] | 알림 조건 수정/삭제 |
| GET | /api/prices | 실시간 가격 조회 + 알림 자동 체크 |
| GET | /api/notifications | 알림 내역 조회 |
| PATCH | /api/notifications/[id] | 개별 읽음 처리 |
| PATCH | /api/notifications/read-all | 전체 읽음 처리 |
| GET/POST | /api/subscriptions | 뉴스 구독 조회/추가 |
| DELETE | /api/subscriptions/[category] | 구독 해지 |
| GET/POST | /api/simulator | 거래 내역 조회/저장 |
| DELETE | /api/simulator/reset | 거래 초기화 |
| GET | /api/news | 뉴스 조회 |

---

## 3. 데이터베이스 및 SQL 활용

**사용 테이블:** `users` `alert_conditions` `notifications` `subscriptions` `trades` `news`

**테이블 구조:**

    CREATE TABLE users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      email VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE alert_conditions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      crop_code VARCHAR(20) NOT NULL,
      crop_name VARCHAR(50) NOT NULL,
      threshold_price DECIMAL(10,2) NOT NULL,
      condition_type ENUM('above','below') NOT NULL,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      condition_id INT NOT NULL,
      message VARCHAR(255) NOT NULL,
      current_price DECIMAL(10,2) NOT NULL,
      is_read TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE trades (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      asset VARCHAR(50) NOT NULL,
      direction ENUM('long','short') NOT NULL,
      leverage INT NOT NULL,
      margin INT NOT NULL,
      fee INT NOT NULL,
      pnl INT NOT NULL,
      balance_after BIGINT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

**주요 쿼리 패턴:**

- 알림 중복 방지: `DATE(created_at) = CURDATE()` 로 오늘 날짜 기준 중복 체크
- 구독 중복 방지: `INSERT IGNORE` + UNIQUE KEY
- 권한 검증: 모든 CRUD에 `AND user_id = ?` 조건 추가

---

## 4. 프론트엔드 상태 관리 및 데이터 최적화

**상태 관리 전략 (Zustand):**

- `token`, `username`: localStorage persist로 새로고침 후에도 로그인 유지
- `unreadCount`: 헤더 알림 뱃지 전역 관리
- `_hasHydrated`: SSR hydration 완료 전 /login 리다이렉트 버그 방지

**서버 데이터 관리 (React Query):**

- `useQuery`: 가격 데이터 5초 폴링, 알림 목록 자동 갱신
- `useMutation`: 알림 조건 CRUD, 구독 관리, 거래 저장
- `queryClient.setQueryData`: 읽음 처리 후 리페치 없이 캐시 즉시 업데이트
- `invalidateQueries`: mutation 성공 후 관련 쿼리 자동 갱신

---

## 5. 배포 환경

- **인프라:** GCP VM (e2-medium, asia-northeast3-a, Ubuntu 22.04)
- **배포 방식:** Cloudflare Tunnel (HTTPS, 도메인 없이 SSL 적용)
- **DB:** MariaDB 10.6 (localhost)
- **Node.js:** v20.20.2

---

## 6. 프로젝트 구조

    farmtrade-alert/
    ├── app/
    │   ├── api/
    │   │   ├── auth/           # 인증 (register, login, password, delete)
    │   │   ├── alerts/         # 알림 조건 CRUD
    │   │   ├── notifications/  # 알림 내역 + 읽음 처리
    │   │   ├── prices/         # 가격 조회 + 알림 자동 생성
    │   │   ├── simulator/      # 선물 거래 시뮬레이터
    │   │   ├── subscriptions/  # 뉴스 구독
    │   │   └── news/           # 뉴스 조회
    │   ├── dashboard/          # 대시보드
    │   ├── alerts/             # 알림 조건 관리
    │   ├── notifications/      # 알림 내역
    │   ├── simulator/          # 선물 거래 시뮬레이터
    │   ├── news/               # 농산물 뉴스
    │   ├── mypage/             # 마이페이지
    │   ├── login/              # 로그인
    │   └── register/           # 회원가입
    ├── components/
    │   ├── Header.js           # 헤더 (현재 페이지 하이라이트, 알림 뱃지)
    │   └── Footer.js           # 푸터
    ├── store/
    │   └── useAuthStore.js     # Zustand 전역 인증 상태
    └── lib/
        ├── db.js               # MariaDB 연결 풀
        ├── jwt.js              # JWT 유틸
        └── auth.js             # Route Handler 인증 미들웨어

---

## 7. 트러블슈팅

### 1. KAMIS API GCP IP 차단

**문제:** KAMIS 농산물 도매가 API를 GCP VM에서 호출 시 응답 없음

**원인:** KAMIS 서버에서 GCP IP 대역을 차단하고 있었습니다. 로컬 환경에서는 정상 동작하는 것을 확인했습니다.

**해결:** Mock 데이터로 대체했습니다. API 연동 구조(cert_key, cert_id 환경변수)는 실제와 동일하게 유지했고, 서버 메모리(globalThis)에 가격을 저장한 뒤 3초마다 ±2% 랜덤 변동을 적용해 실시간 시세처럼 동작하도록 구현했습니다.

---

### 2. Zustand SSR Hydration 버그

**문제:** 페이지 이동 시 로그인 상태가 풀리는 현상

**원인:** Next.js SSR 환경에서는 서버가 HTML을 렌더링할 때 브라우저의 localStorage에 접근할 수 없습니다. 이로 인해 token이 null인 상태로 렌더링이 시작되고, useEffect가 실행되면서 /login으로 리다이렉트됩니다.

**해결:** `_hasHydrated` 플래그를 추가했습니다. `onRehydrateStorage` 콜백으로 localStorage 복원이 완료된 시점에 플래그를 true로 설정하고, 완료 전까지는 렌더링을 보류하도록 처리했습니다.

---

### 3. React Query 알림 배지 재생성 문제

**문제:** 알림 페이지에서 읽음 처리 후 대시보드로 이동하면 배지가 다시 생성되는 현상

**원인:** `/api/notifications/read-all` Route Handler 파일이 누락되어 읽음 처리가 DB에 반영되지 않았습니다. 대시보드의 5초 폴링이 여전히 `is_read=0` 데이터를 읽어와 unreadCount를 다시 세팅했습니다.

**해결:** Route Handler를 생성하고, `queryClient.setQueryData`로 DB 응답을 기다리지 않고 캐시를 즉시 업데이트하는 낙관적 업데이트 방식을 적용했습니다.

---

### 4. Next.js 15 동적 params 비동기 처리

**문제:** `/api/alerts/[id]` DELETE 요청 시 500 에러

**원인:** Next.js 15에서 Route Handler의 `params`가 비동기로 변경되었습니다. 이전 방식으로 동기적으로 접근하면 에러가 발생합니다.

**해결:** `const { id } = await params;` 로 수정했습니다.

---

### 5. GCP e2-micro 메모리 부족

**문제:** bootcamp-2 VM(1GB RAM)에서 Next.js 빌드 중 TypeScript 검사가 무한 대기 상태로 멈추는 현상

**원인:** 1GB RAM으로 Next.js 빌드 프로세스를 감당하기 어려웠습니다.

**해결:** bootcamp-1 VM(4GB RAM)으로 이전했고, `next.config.mjs`에 `typescript.ignoreBuildErrors: true`를 설정했습니다.

---

## 8. 회고

### 잘한 것

**전체 사이클 완주**

기획, DB 설계, 백엔드 API, 프론트엔드, 인프라 구성, 배포까지 혼자 완주했습니다. 이번에는 단순 CRUD를 넘어 알림 자동 생성 로직, React Query 캐싱 전략, Zustand hydration 처리까지 상태 관리의 복잡한 부분을 직접 설계하고 해결했습니다.

**FarmTrade 시리즈 서사 완성**

1차(선물 시뮬레이터) → 2차(뉴스 구독) → 3차(가격 알림)로 이어지는 흐름을 하나의 서비스로 통합했습니다. 각 해커톤을 독립된 결과물로 끝내지 않고 하나의 제품으로 수렴시키는 구조를 의도적으로 설계했습니다.

**프레임워크 동작 원리 이해**

SSR Hydration 문제, React Query 캐시 불일치, Next.js 15 비동기 params 등 단순히 에러를 고치는 것에 그치지 않고 왜 그런 동작이 발생하는지 원인을 파악하고 해결했습니다. 이 과정에서 Next.js App Router의 서버/클라이언트 컴포넌트 구분, React Query의 캐시 생명주기를 실제로 이해하게 됐습니다.

---

### 아쉬운 것

**KAMIS API 미연동**

처음부터 KAMIS API 연동을 목표로 했고 API 키도 발급받았지만, GCP VM 환경에서 KAMIS 서버가 IP를 차단하고 있다는 걸 개발 도중에야 발견했습니다. 사전에 VM 환경에서 외부 API 연결 테스트를 먼저 했다면 시간을 낭비하지 않았을 것입니다. 로컬에서 KAMIS를 호출한 결과를 DB에 주기적으로 캐싱하거나 별도 프록시 서버를 두는 방식을 시간 안에 시도하지 못한 게 아쉽습니다.

**서버 메모리 기반 가격 데이터의 한계**

현재 가격 데이터는 서버 메모리(globalThis)에만 존재합니다. 서버가 재시작되면 가격이 초기값으로 돌아갑니다. Redis나 DB에 가격 히스토리를 캐싱하는 레이어를 뒀다면 가격 변동 차트(시계열 데이터)도 보여줄 수 있었고 서비스로서의 완성도가 더 높았을 것입니다.

**인프라 스펙 미확인**

bootcamp-2 VM이 e2-micro(1GB RAM)라는 걸 빌드가 멈추고 나서야 확인했습니다. 1GB RAM으로 Next.js 빌드 + MariaDB + Cloudflare Tunnel을 동시에 돌리는 건 무리였고, bootcamp-1(4GB RAM)으로 이전하는 데 상당한 시간을 낭비했습니다. 인프라 스펙 확인이 개발 시작 전 첫 번째 체크리스트여야 한다는 걸 이번에 뼈저리게 배웠습니다.

**테스트 코드 부재**

알림 중복 생성 버그, React Query 캐시 불일치 등 수동 테스트로만 발견된 이슈들이 여러 개 있었습니다. 알림 조건 체크 로직, PNL 계산처럼 숫자가 정확해야 하는 비즈니스 로직에 단위 테스트가 있었다면 디버깅 시간을 크게 줄일 수 있었을 것입니다.

---

### 배운 것

**Zustand + Next.js SSR 조합의 함정**

로그인 상태가 페이지 이동 시 풀리는 버그를 처음 마주했을 때 Zustand persist가 제대로 설정됐는데 왜 작동하지 않는지 한참 헤맸습니다. 원인은 Next.js SSR이 서버에서 HTML을 렌더링할 때 브라우저의 localStorage에 접근할 수 없어서 token이 null인 상태로 시작하고, useEffect가 실행되면서 /login으로 리다이렉트되는 것이었습니다. `_hasHydrated` 플래그로 localStorage 복원이 완료될 때까지 렌더링을 보류하는 패턴을 직접 구현하면서 SSR과 클라이언트 상태 관리의 충돌 지점을 이해하게 됐습니다.

**React Query 캐시는 낙관적으로 업데이트해야 UX가 살아있다**

알림 읽음 처리 후 배지가 사라졌다가 5초 뒤 다시 생기는 버그를 디버깅하면서 React Query의 캐시 생명주기를 제대로 이해했습니다. `invalidateQueries`로 리페치를 기다리는 것보다 `setQueryData`로 캐시를 즉시 업데이트하는 낙관적 업데이트 방식이 왜 필요한지 직접 체감했습니다.

**프레임워크 버전 변경사항은 직접 맞닥뜨려야 기억에 남는다**

Next.js 15에서 Route Handler의 params가 비동기로 바뀐 것을 공식 문서로 읽었을 때는 그냥 넘어갔는데, DELETE 요청이 500 에러로 터지고 나서야 `await params`가 왜 필요한지 완전히 이해했습니다. 이론으로 읽는 것과 직접 디버깅하는 것의 차이를 다시 한번 느꼈습니다.

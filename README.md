# 꽃시장 🌸🌳

꽃 도소매 업자와 구매자를 연결하는 모바일 마켓플레이스 앱입니다.

## 주요 기능

### 판매자
- 가게 등록 및 관리 (사진, 주소, 영업 상태)
- 상품 등록 — **생화** / **나무** 카테고리 구분
- 소매가 / 도매가 별도 설정
- 주문 접수 및 배송 상태 단계별 변경

### 구매자
- 꽃가게 목록 탐색 및 검색
- 생화 / 나무 탭으로 상품 필터링
- 소매 / 도매 주문 선택
- 배송 날짜 직접 지정
- 장바구니 및 주문 내역 확인

## 기술 스택

| 구분 | 기술 |
|---|---|
| 프레임워크 | React Native (Expo) |
| 내비게이션 | Expo Router (파일 기반) |
| 백엔드/DB | Supabase (PostgreSQL) |
| 인증 | Supabase Auth |
| 이미지 저장 | Supabase Storage |
| 상태관리 | Zustand |

## 시작하기

### 1. 의존성 설치

```bash
cd flower-market
npm install
```

### 2. 환경변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 열고 Supabase 프로젝트 정보 입력:
- `EXPO_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon 키

> Supabase 대시보드 → Settings → API에서 확인

### 3. DB 스키마 적용

Supabase 대시보드 → SQL Editor에서 아래 파일 실행:

```
supabase/migrations/001_initial_schema.sql
```

### 4. 앱 실행

```bash
npx expo start
```

- 핸드폰: **Expo Go** 앱으로 QR 스캔
- iOS 시뮬레이터: `i` 키
- Android 에뮬레이터: `a` 키

## 프로젝트 구조

```
flower-market/
├── app/
│   ├── (auth)/          # 로그인, 회원가입
│   ├── (buyer)/         # 구매자 화면 (탭 내비게이션)
│   │   ├── home.tsx     # 홈 (가게 목록)
│   │   ├── stores.tsx   # 가게 탐색
│   │   ├── cart.tsx     # 장바구니
│   │   ├── checkout.tsx # 주문서 (배송날짜 선택)
│   │   ├── orders.tsx   # 주문 내역
│   │   ├── store/[id]   # 가게 상세 + 상품 목록
│   │   └── order/[id]   # 주문 상세
│   └── (seller)/        # 판매자 화면 (탭 내비게이션)
│       ├── home.tsx     # 대시보드
│       ├── products.tsx # 상품 관리
│       ├── orders.tsx   # 주문 관리
│       └── store.tsx    # 가게 등록/수정
├── src/
│   ├── types/           # TypeScript 타입 정의
│   ├── services/        # Supabase API 서비스
│   └── store/           # Zustand 전역 상태
└── supabase/
    └── migrations/      # DB 스키마 SQL
```

## 상품 카테고리

### 생화
장미, 백합, 튤립, 국화, 카네이션, 해바라기, 난초, 혼합, 기타

### 나무
유실수, 관상수, 침엽수, 관목, 실내식물, 대나무, 혼합, 기타

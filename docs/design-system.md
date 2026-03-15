# 디자인 시스템

## 프로젝트 구조

```
flower-market/          ← 앱 (React Native / Expo)
admin-web/              ← 어드민 웹 (Next.js)  ← 추후 생성
shared/                 ← 공통 타입 (Supabase 타입 등)  ← 추후 생성
```

---

## 앱 (React Native)

### 기술 스택

| 역할 | 라이브러리 |
|---|---|
| 스타일링 | NativeWind (Tailwind 문법) |
| 아이콘 | lucide-react-native |
| 컴포넌트 | react-native-reusables (Radix 기반 RN 포팅) |
| 네비게이션 | Expo Router |

### 설치

```bash
# NativeWind
npm install nativewind
npm install --save-dev tailwindcss

# Lucide
npm install lucide-react-native

# react-native-reusables
npm install react-native-reusables
```

### 컬러 토큰

| 토큰 | 값 | 용도 |
|---|---|---|
| primary | `#FF6B9D` | 구매자 메인 (핑크) |
| seller | `#2ECC71` | 판매자 메인 (그린) |
| admin | `#6C5CE7` | 관리자 메인 (퍼플) |
| text-primary | `#333333` | 기본 텍스트 |
| text-secondary | `#999999` | 보조 텍스트 |
| border | `#F0F0F0` | 구분선 |
| background | `#FFFFFF` | 배경 |

---

## 어드민 웹 (Next.js)

> admin-web/ 폴더 — 추후 생성 예정

### 기술 스택

| 역할 | 라이브러리 |
|---|---|
| 프레임워크 | Next.js (App Router) |
| 스타일링 | Tailwind CSS |
| 아이콘 | Lucide |
| 컴포넌트 | Radix UI |
| 상태관리 | Zustand |

### 설치 (추후)

```bash
npx create-next-app@latest admin-web --typescript --tailwind --app
cd admin-web
npm install lucide-react
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-table
```

---

## 공통

### 타이포그래피

| 용도 | 크기 | 굵기 |
|---|---|---|
| 제목 (H1) | 24px | Bold |
| 부제목 (H2) | 18px | SemiBold |
| 본문 | 14px | Regular |
| 캡션 | 12px | Regular |

### 간격 단위

`4px` 기준 배수 사용 — 4, 8, 12, 16, 20, 24, 32, 48

# Design System: 꽃시장 (Airbnb-inspired)

> Airbnb DESIGN.md 기반, 꽃시장 브랜드 컬러로 커스터마이징

---

## 0. 아이콘 시스템

**라이브러리: `lucide-react` (설치 완료)**

모든 아이콘은 lucide-react를 사용한다. 이모지 사용 금지.

```bash
npm install lucide-react
```

### 사용 원칙
- `strokeWidth`: 1.8 고정 (너무 굵지 않게)
- 아이콘 컨테이너: 둥근 박스(`rounded-xl` 또는 `rounded-2xl`) + `bg-[#FFF0F5]` 배경
- 아이콘 컬러: 구매자 화면 `#FF6B9D` / 판매자 화면 `#2ECC71`
- 크기 기준: 네비/버튼 내부 `16–18px`, 카드 아이콘 `20–22px`, 피처 강조 `24px`

### 자주 쓰는 아이콘 매핑
| 용도 | 아이콘 |
|------|--------|
| 꽃 / 브랜드 | `Flower2` |
| 주문 / 쇼핑 | `ShoppingBag` |
| 위치 / 지도 | `MapPin` |
| 선물 | `Gift` |
| AI 추천 | `Sparkles` |
| AI 스타일링 | `Wand2` |
| 기념일 / 좋아요 | `Heart` |
| 즐겨찾기 | `Star` |
| 자연 / 일상 | `Leaf` |
| 이동 / 화살표 | `ArrowRight`, `ChevronRight` |
| 검색 | `Search` |
| 설정 | `Settings` |
| 알림 | `Bell` |
| 장바구니 | `ShoppingCart` |
| 사용자 | `User` |

---

## 1. Visual Theme & Atmosphere

따뜻하고 사진 중심의 꽃 도소매 마켓플레이스. 에어비앤비의 "travel magazine" 감성을 꽃시장에 맞게 재해석 — 화이트 캔버스에 꽃 사진이 주인공이 되고, 브랜드 핑크가 유일한 액센트 컬러로 기능한다.

**Key Characteristics:**
- 순백 캔버스에 브랜드 핑크(`#FF6B9D`)가 단일 액센트
- 사진 우선 카드 — 꽃 이미지가 히어로 콘텐츠
- 따뜻한 near-black(`#222222`) 텍스트 — 차갑지 않게
- 3단계 카드 그림자로 자연스러운 입체감
- 넉넉한 border-radius: 버튼 8px, 카드 16–20px, 컨트롤 50%
- 판매자 화면은 그린(`#2ECC71`)을 액센트로 사용

---

## 2. Color Palette & Roles

### 구매자 (Buyer) — 핑크 테마 (Bloom Design 2026-04)
| Token | Hex | 용도 |
|-------|-----|------|
| Primary | `#FF3D6C` | CTA 버튼, 액센트, 활성 상태 |
| Primary Dark | `#E81E54` | 눌림/호버 상태 |
| Primary Light | `#FFE0E8` | 선택된 카드 배경, 배지 배경 |
| Primary 50 | `#FFF1F4` | 아주 연한 핑크 배경 |

### 판매자 (Seller) — 그린 테마
| Token | Hex | 용도 |
|-------|-----|------|
| Seller | `#2ECC71` | 판매자 CTA, 액센트 |
| Seller Dark | `#27AE60` | 판매자 눌림 상태 |
| Seller Light | `#f0faf5` | 판매자 카드 배경 |

### 공통 텍스트/서피스
| Token | Hex | 용도 |
|-------|-----|------|
| Ink (Text Primary) | `#0F0F12` | 기본 텍스트 (따뜻한 잉크 블랙) |
| Muted (Text Secondary) | `#7A7077` | 설명, 부제목 |
| Text Disabled | `rgba(0,0,0,0.24)` | 비활성 텍스트 |
| Surface | `#FFFFFF` | 카드 배경 |
| Background | `#FAF7F5` | 전체 앱 배경 (따뜻한 오프화이트) |
| Border | `#ECE7E2` | 카드 구분선, 인풋 테두리 |
| Border 2 | `#E2DCD6` | 강조 구분선 |

### 상태 컬러
| Token | Hex | 용도 |
|-------|-----|------|
| Error | `#FF3B30` | 에러 텍스트, 인풋 에러 테두리 |
| Warning | `#FFA500` | 주문 접수 상태 |
| Success | `#2ECC71` | 완료 상태 |
| Cancelled | `#E74C3C` | 취소 상태 |

---

## 3. Typography Rules

### Font Family
- **Primary**: `-apple-system, system-ui, "Helvetica Neue", sans-serif`
- Airbnb Cereal VF와 동일한 철학: warm weight range 500–700

### 타이포 계층

| 역할 | 크기 | Weight | 용도 |
|------|------|--------|------|
| Section Heading | 22px | 700 | 화면 대제목 |
| Card Heading | 18px | 600 | 카드 제목 |
| Sub Heading | 15–16px | 600 | 섹션 소제목 |
| Body | 14px | 400–500 | 일반 텍스트 |
| Caption | 12–13px | 400 | 설명, 주소, 메모 |
| Badge | 11px | 600 | 배지, 태그 |
| Micro | 10px | 700 | 대문자 레이블 |

### 원칙
- **Warm weight range**: 헤딩에 300·400 사용 금지, 최소 500
- 헤딩에 약간의 negative letter-spacing (-0.2px~-0.4px) 적용해 친밀감 형성
- 순흑(`#000`) 대신 always `#222222`

---

## 4. Component Stylings

### Buttons

**Primary (구매자)**
- Background: `#FF6B9D`
- Text: `#ffffff`, 16px, weight 600
- Radius: 12px
- Padding: 14px 24px
- Disabled: opacity 0.6
- Loading: spinner + 텍스트

**Primary (판매자)**
- Background: `#2ECC71`
- 나머지 동일

**Secondary / Outline**
- Background: `#ffffff`
- Border: 1.5px solid `#ddd`
- Text: `#222222`
- Radius: 12px

**Circular Nav**
- Background: `#f2f2f2`
- Radius: 50%
- Size: 32–36px

### Cards
- Background: `#ffffff`
- Radius: 16px (리스트 카드), 20px (피처 카드)
- Shadow (3단계): `rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px`
- 이미지 상단, 정보 하단 구조

### Inputs (Gluestack Input)
- Variant: `outline`
- Border: `#ddd` (기본), `#FF3B30` (에러), `#FF6B9D` (포커스)
- Radius: 12px
- Padding: 14px
- Font size: 15px

### Category Cards
- 이모지/아이콘: 카드 안에
- 라벨: 카드 밖 아래 (11px, weight 500, `#666`)
- 선택됨: border 1.5px `#FF6B9D`, background `#FFF0F5`
- 기본: border 1.5px `#f0f0f0`, background `#fff`
- Radius: 14px

---

## 5. Layout Principles

### Spacing System (8px 기반)
`4, 6, 8, 10, 12, 14, 16, 20, 24, 32px`

### Grid
- 수평 패딩: 16px
- 카드 그리드 gap: 8–12px
- 카테고리: 4열 고정
- 가게/상품 리스트: 1열 (모바일 기준)

### Whitespace 철학
- **Travel-magazine spacing**: 섹션 간 여유 있는 padding — 빠르게 스캔하는 게 아니라 천천히 둘러보는 경험
- 이미지가 히어로 — 카드 이미지는 충분히 크게

### Border Radius Scale
| 용도 | Radius |
|------|--------|
| 버튼, 인풋 | 12px |
| 카테고리 카드 | 14px |
| 리스트 카드 | 16px |
| 피처 카드 | 20px |
| 아바타, 순환 버튼 | 50% |

---

## 6. Depth & Elevation

| 레벨 | 처리 방식 | 사용처 |
|------|----------|--------|
| Flat (0) | 그림자 없음 | 배경, 텍스트 블록 |
| Card (1) | 3단계 그림자 | 가게 카드, 상품 카드 |
| Hover (2) | `rgba(0,0,0,0.08) 0px 4px 12px` | 버튼 호버, 인터랙티브 요소 |
| Modal (3) | `rgba(0,0,0,0.15) 0px 8px 24px` | 바텀시트, 모달 |

---

## 7. Do's and Don'ts

### Do
- 텍스트에 `#222222` 사용 — 순흑 `#000` 금지
- `#FF6B9D`는 구매자 CTA에만 — 배경이나 넓은 면적에 사용 금지
- 카드에 항상 3단계 그림자 적용
- 카드 radius 최소 16px
- 이미지 우선 — 가게/상품 카드는 이미지가 상단에
- 판매자 화면에는 그린(`#2ECC71`) 일관 사용

### Don't
- 헤딩에 weight 300·400 사용 금지
- 카드에 sharp corner(4px 이하) 금지
- 구매자/판매자 액센트 컬러 혼용 금지
- 과도한 border — 그림자로 구분, 선은 최소화

---

## 8. Responsive Behavior

| 구간 | 레이아웃 |
|------|---------|
| Mobile (<390px) | 1열, compact |
| Mobile (390–430px) | 1열, standard |
| Tablet (430–768px) | 카테고리 4열 유지, 카드 2열 가능 |

### Touch Targets
- 버튼 최소 높이: 48px
- 카테고리 카드: 터치 영역 충분히 (col4Width 기준)
- 카드 전체가 tap target

---

## 9. Agent Prompt Guide

### 빠른 컬러 참조
- 배경: `#ffffff` (카드), `#f8f8f8` (앱 배경)
- 기본 텍스트: `#222222`
- 보조 텍스트: `#6a6a6a`
- 구매자 액센트: `#FF6B9D`
- 판매자 액센트: `#2ECC71`
- 카드 그림자: `rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px`
- 에러: `#FF3B30`

### 컴포넌트 프롬프트 예시
- "가게 카드: 흰 배경, radius 16px, 3단계 그림자. 상단 이미지(16:9), 하단 가게명 18px weight 600 `#222222`, 주소 13px `#6a6a6a`"
- "CTA 버튼: `#FF6B9D` 배경, 흰 텍스트, radius 12px, 16px weight 600, height 52px"
- "카테고리 카드: 흰 배경, radius 14px, border 1.5px `#f0f0f0`. 이모지 카드 안, 라벨 11px 카드 밖 아래"
- "인풋: Gluestack Input variant outline, radius 12px, border `#ddd`, 내부 padding 14px, 15px"

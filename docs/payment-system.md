# 프로젝트 결제 시스템

## 기술 스택

- **PG 연동**: 포트원 V1 (아임포트)
- **프레임워크**: React Native (Expo) — 웹/네이티브 동시 지원
- **DB**: Supabase (결제 후 주문 저장)
- **SDK**: `iamport.payment-1.2.0.js` (CDN)

## 환경변수 설정 (`.env`)

```env
# 포트원 가맹점 식별코드 — 클라이언트에서 사용 가능
EXPO_PUBLIC_PORTONE_IMP_KEY=imp00000000

# 포트원 REST API — 서버(Edge Function)에서만 사용, 클라이언트 절대 노출 금지
PORTONE_API_KEY=your-portone-api-key
PORTONE_API_SECRET=your-portone-api-secret

# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```
<!--.env.example 예시 실제 값은 .env파일에 존재-->

## 포트원 설정

- **버전**: V1 (아임포트)
- **환경**: 테스트 (INIpayTest)
- **PG사**: KG이니시스 (`html5_inicis.INIpayTest`)
- **결제 수단**: 카드 (`pay_method: 'card'`)
- **가맹점 식별코드**: `EXPO_PUBLIC_PORTONE_IMP_KEY`

## 결제 플로우

```
사용자 → PaymentScreen 진입
         ↓
merchant_uid 생성: flower_${Date.now()}
         ↓
[웹] IMP.request_pay() 직접 호출 (팝업)
[네이티브] WebView 내 HTML에서 IMP.request_pay() 호출
         ↓
결제 완료 → imp_uid, merchant_uid 수신
         ↓
orderService.createOrder() — Supabase에 주문 저장
         ↓
장바구니 초기화 → 주문 내역 화면으로 이동
```

## 플랫폼별 구현 방식

### 웹 (`Platform.OS === 'web'`)

- 아임포트 스크립트를 `document.head`에 동적 삽입
- `IMP.init(IMP_KEY)` → `IMP.request_pay()` 호출
- 결제창은 팝업으로 뜨며, 콜백(`rsp`)으로 결제 결과 수신

```ts
IMP.request_pay(
  {
    pg: 'html5_inicis.INIpayTest',
    pay_method: 'card',
    merchant_uid: 'flower_1234567890',
    name: '꽃시장 주문',
    amount: 50000,
    buyer_name: '홍길동',
    buyer_tel: '010-0000-0000',
    buyer_addr: '서울시 강남구 ...',
  },
  (rsp) => { /* 결과 처리 */ }
);
```

### 네이티브 (iOS / Android)

- `react-native-webview`의 `WebView` 컴포넌트 사용
- HTML 문자열을 직접 생성해 `source={{ html }}` 으로 주입
- 결제 결과는 `window.ReactNativeWebView.postMessage(JSON.stringify(result))`로 전달
- `onMessage` 핸들러에서 수신 후 처리

## 결제 파라미터

| 필드 | 값 | 설명 |
|------|----|------|
| `pg` | `html5_inicis.INIpayTest` | PG사 (테스트) |
| `pay_method` | `card` | 결제 수단 |
| `merchant_uid` | `flower_${Date.now()}` | 주문 고유 ID |
| `name` | `꽃시장 주문` | 주문명 |
| `amount` | 결제 금액 (정수) | totalPrice 파라미터에서 수신 |
| `buyer_name` | `profile.name` | 구매자 이름 |
| `buyer_tel` | `profile.phone` | 구매자 전화번호 |
| `buyer_addr` | `deliveryAddress` | 배송 주소 |

## 결제 결과 타입

```ts
type PaymentResult =
  | { success: true; imp_uid: string; merchant_uid: string }
  | { success: false; error_msg: string };
```

## 결제 후 주문 저장 (`orderService.createOrder`)

결제 성공 시 Supabase에 주문을 저장한다. 별도 서버 검증 없이 클라이언트에서 직접 호출한다.

**저장되는 데이터:**

| 테이블 | 필드 |
|--------|------|
| `orders` | `buyer_id`, `store_id`, `order_type`, `status: 'pending'`, `total_price`, `delivery_date`, `delivery_address`, `delivery_memo` |
| `order_items` | `order_id`, `product_id`, `quantity`, `unit_price` |

**주문 유형별 단가:**
- `retail` (소매): `product.retail_price`
- `wholesale` (도매): `product.wholesale_price`

## 주문 상태값 (`OrderStatus`)

| 값 | 의미 |
|----|------|
| `pending` | 결제 완료, 판매자 확인 대기 |
| `confirmed` | 판매자 확인 완료 |
| `preparing` | 상품 준비 중 |
| `shipped` | 배송 출발 |
| `delivered` | 배송 완료 |
| `cancelled` | 취소/환불 |

> 초기 저장 시 항상 `pending` 상태로 생성된다.

## 화면 진입 파라미터 (`useLocalSearchParams`)

`/users/payment` 화면은 아래 쿼리 파라미터를 받는다:

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `totalPrice` | string | 결제 금액 |
| `orderType` | `'retail' \| 'wholesale'` | 주문 유형 |
| `deliveryDate` | string | 배송 희망일 |
| `deliveryAddress` | string | 배송 주소 |
| `deliveryMemo` | string (선택) | 배송 메모 |

## 관련 파일

| 파일 | 역할 |
|------|------|
| [app/users/payment.tsx](../app/users/payment.tsx) | 결제 화면 (웹/네이티브 분기) |
| [src/services/orders.ts](../src/services/orders.ts) | 주문 생성/조회/상태 업데이트 |
| [src/types/index.ts](../src/types/index.ts) | `Order`, `OrderStatus`, `OrderType` 타입 정의 |
| [src/store/useCartStore.ts](../src/store/useCartStore.ts) | 장바구니 상태 (결제 후 `clearCart()`) |
| [src/store/useAuthStore.ts](../src/store/useAuthStore.ts) | 로그인 유저 프로필 (구매자 정보) |

## 주의사항

- `PORTONE_API_KEY`, `PORTONE_API_SECRET`은 서버(Edge Function)에서만 사용. 클라이언트 코드에 절대 포함 금지.
- `merchant_uid`는 현재 `flower_${Date.now()}`로 생성하며, 동시 요청 시 중복 가능성이 있다. 프로덕션 전환 시 UUID 방식으로 변경 권장.
- 현재 구현은 서버 측 결제 금액 검증이 없다. 프로덕션 환경에서는 `imp_uid`로 포트원 REST API를 호출해 실제 결제 금액을 검증한 후 DB에 저장해야 한다.
- 테스트 키(`INIpayTest`)와 라이브 키 혼용 주의. 배포 시 PG 설정 및 환경변수를 반드시 변경.

## 서버 검증 추가 시 참고 (미구현)

```
결제 완료 (imp_uid 수신)
  ↓
서버: GET https://api.iamport.kr/payments/{imp_uid}
  ↓
응답의 amount == 클라이언트가 전달한 amount 비교
  ↓
일치 → DB 저장 / 불일치 → 결제 취소 처리
```

포트원 REST API 문서: https://developers.portone.io

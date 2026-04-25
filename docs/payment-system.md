# 프로젝트 결제 시스템

## 기술 스택

- **PG 연동**: 포트원 V2 + 토스페이먼츠
- **프레임워크**: React Native (Expo) — 웹/네이티브 동시 지원
- **DB**: Supabase (결제 후 주문 저장)
- **SDK**: `browser-sdk.umd.js` (CDN, V2)

## 환경변수 설정 (`.env`)

```env
# 포트원 V2 - 상점 ID (클라이언트에서 사용 가능)
EXPO_PUBLIC_PORTONE_STORE_ID=your-store-id

# 포트원 V2 - 토스페이먼츠 채널 키 (클라이언트에서 사용 가능)
EXPO_PUBLIC_PORTONE_CHANNEL_KEY=channel-key-xxxxxxxx
```

## 포트원 설정

- **버전**: V2
- **PG사**: 토스페이먼츠
- **결제 수단**: 카드 (`payMethod: 'CARD'`)
- **통화**: 원화 (`currency: 'CURRENCY_KRW'`)
- **채널 키**: 포트원 대시보드 > 결제 연동 > 채널에서 발급

## 결제 플로우

```
사용자 → PaymentScreen 진입
         ↓
paymentId 생성: payment-{timestamp}-{random}
         ↓
[웹] PortOne.requestPayment() 직접 호출 (버튼 클릭)
[네이티브] WebView 내 HTML에서 PortOne.requestPayment() 호출
         ↓
결제 완료 → paymentId 수신
         ↓
orderService.createOrder() — Supabase에 주문 저장
         ↓
장바구니 초기화 → 주문 내역 화면으로 이동
```

## 플랫폼별 구현 방식

### 웹 (`Platform.OS === 'web'`)

- V2 SDK를 `document.head`에 동적 삽입
- `window.PortOne.requestPayment()` 호출
- 결제창은 팝업으로 뜨며, Promise로 결제 결과 수신

```ts
const response = await PortOne.requestPayment({
  storeId: STORE_ID,
  channelKey: CHANNEL_KEY,
  paymentId: 'payment-1234567890-abc123',
  orderName: '꽃시장 주문',
  totalAmount: 50000,
  currency: 'CURRENCY_KRW',
  payMethod: 'CARD',
  customer: {
    fullName: '홍길동',
    phoneNumber: '010-0000-0000',
  },
});
```

### 네이티브 (iOS / Android)

- `react-native-webview`의 `WebView` 컴포넌트 사용
- HTML 문자열을 직접 생성해 `source={{ html }}`로 주입
- 결제 결과는 `window.ReactNativeWebView.postMessage(JSON.stringify(result))`로 전달
- `onMessage` 핸들러에서 수신 후 처리

## 결제 파라미터

| 필드 | 값 | 설명 |
|------|----|------|
| `storeId` | `EXPO_PUBLIC_PORTONE_STORE_ID` | 포트원 상점 ID |
| `channelKey` | `EXPO_PUBLIC_PORTONE_CHANNEL_KEY` | 토스페이먼츠 채널 키 |
| `paymentId` | `payment-{timestamp}-{random}` | 주문 고유 ID |
| `orderName` | `꽃시장 주문` | 주문명 |
| `totalAmount` | 결제 금액 (정수) | totalPrice 파라미터에서 수신 |
| `currency` | `CURRENCY_KRW` | 통화 (원화) |
| `payMethod` | `CARD` | 결제 수단 |
| `customer.fullName` | `profile.name` | 구매자 이름 |
| `customer.phoneNumber` | `profile.phone` | 구매자 전화번호 |

## 결제 결과 타입

```ts
type PaymentResult =
  | { success: true; paymentId: string }
  | { success: false; error_msg: string };
```

- **성공**: `response.paymentId` 수신
- **실패/취소**: `response.code` + `response.message` 수신

## 결제 후 주문 저장 (`orderService.createOrder`)

결제 성공 시 Supabase에 주문을 저장한다.

**저장되는 데이터:**

| 테이블 | 필드 |
|--------|------|
| `orders` | `buyer_id`, `store_id`, `order_type`, `status: 'pending'`, `total_price`, `delivery_date`, `delivery_address`, `delivery_memo` |
| `order_items` | `order_id`, `product_id`, `quantity`, `unit_price` |

## 주문 상태값 (`OrderStatus`)

| 값 | 의미 |
|----|------|
| `pending` | 결제 완료, 판매자 확인 대기 |
| `confirmed` | 판매자 확인 완료 |
| `preparing` | 상품 준비 중 |
| `shipped` | 배송 출발 |
| `delivered` | 배송 완료 |
| `cancelled` | 취소/환불 |

## 화면 진입 파라미터 (`useLocalSearchParams`)

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

- `EXPO_PUBLIC_PORTONE_CHANNEL_KEY`는 테스트/실서비스 채널 키가 다름. 배포 시 반드시 실서비스 채널 키로 교체.
- `paymentId`는 `payment-{timestamp}-{random}` 방식으로 생성. 중복 가능성 낮지만 프로덕션에서는 UUID 방식 권장.
- 현재 구현은 서버 측 결제 금액 검증 없음. 출시 전 Supabase Edge Function으로 검증 추가 권장.

## 서버 검증 추가 시 참고 (미구현)

```
결제 완료 (paymentId 수신)
  ↓
서버(Edge Function): GET https://api.portone.io/payments/{paymentId}
  ↓
응답의 amount.total == 클라이언트가 전달한 amount 비교
  ↓
일치 → DB 저장 / 불일치 → 결제 취소 처리
```

포트원 V2 REST API 문서: https://developers.portone.io/api/rest-v2

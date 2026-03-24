# 로그인 유효성 검사

## 개요

로그인 화면(`app/(auth)/login.tsx`)에서 이메일과 비밀번호 입력 시 인라인 유효성 검사를 제공합니다.
기존의 `Alert` 방식 대신 각 입력 필드 아래에 에러 메시지를 표시합니다.

---

## 이메일 (아이디) 유효성 검사

| 시점 | 조건 | 에러 메시지 |
|------|------|------------|
| 필드 포커스 아웃 (onBlur) | 이메일이 비어있음 | `이메일을 입력해주세요.` |
| 필드 포커스 아웃 (onBlur) | 이메일 형식 불일치 | `올바른 이메일 형식이 아닙니다.` |
| 로그인 실패 후 | 미가입 이메일 or 자격증명 오류 | `가입되지 않은 이메일이거나 비밀번호가 올바르지 않습니다.` |
| 에러 표시 중 입력 변경 | 실시간 재검사 | 형식이 올바르면 에러 자동 해제 |

### 이메일 형식 규칙

```
/^[^\s@]+@[^\s@]+\.[^\s@]+$/
```

- `@` 앞뒤에 공백 없이 문자 포함
- 도메인에 `.` 포함 (예: `example.com`)
- 추가 제한 없음 (특수문자 허용)

---

## 비밀번호 유효성 검사

| 시점 | 조건 | 에러 메시지 |
|------|------|------------|
| 필드 포커스 아웃 (onBlur) | 비밀번호가 비어있음 | `비밀번호를 입력해주세요.` |
| 로그인 실패 후 | 자격증명 오류 | `비밀번호를 다시 확인해주세요.` |
| 에러 표시 중 입력 변경 | 실시간 재검사 | 입력값 존재하면 에러 자동 해제 |

> **비밀번호 형식 제한 없음** — 영문, 숫자, 특수문자 등 별도 제약을 두지 않습니다.

---

## 가입 여부 확인 방식 및 한계

### 현재 구현

Supabase v2는 보안 정책상 **미가입 이메일**과 **잘못된 비밀번호**를 동일한 에러 메시지(`Invalid login credentials`)로 반환합니다.
따라서 클라이언트 단독으로는 두 케이스를 구분할 수 없습니다.

현재는 로그인 실패 시 이메일 필드와 비밀번호 필드 모두에 에러 메시지를 표시하여, 사용자가 **가입 여부와 비밀번호 오류** 두 가지를 동시에 확인하도록 유도합니다.

### 실시간 이메일 가입 여부 확인이 필요한 경우

아래 방법 중 하나로 확장할 수 있습니다.

#### 방법 1 — profiles 테이블에 email 컬럼 추가

```sql
ALTER TABLE profiles ADD COLUMN email TEXT UNIQUE;
```

이후 `onBlur`에서 다음과 같이 조회:

```ts
const { data } = await supabase
  .from('profiles')
  .select('id')
  .eq('email', email)
  .maybeSingle();

if (!data) setEmailError('가입되지 않은 이메일입니다.');
```

#### 방법 2 — Supabase Edge Function (RPC)

```sql
CREATE OR REPLACE FUNCTION check_email_exists(input_email TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM auth.users WHERE email = input_email);
$$ LANGUAGE sql SECURITY DEFINER;
```

클라이언트에서 호출:

```ts
const { data } = await supabase.rpc('check_email_exists', { input_email: email });
if (!data) setEmailError('가입되지 않은 이메일입니다.');
```

---

## UI 동작 요약

```
[이메일 입력]
  └─ onBlur → 형식 검사 → 에러 표시
  └─ onChange (에러 중) → 실시간 재검사 → 형식 OK면 에러 해제

[비밀번호 입력]
  └─ onBlur → 비어있으면 에러 표시
  └─ onChange (에러 중) → 실시간 재검사 → 입력 있으면 에러 해제

[로그인 버튼]
  └─ 빈 필드 → 인라인 에러 표시 후 API 호출 차단
  └─ API 실패 → 이메일/비밀번호 필드 모두 에러 표시
  └─ API 성공 → 역할에 따라 화면 이동 (user/seller/admin)
```

---

## 관련 파일

- 로그인 화면: `app/(auth)/login.tsx`
- 인증 서비스: `src/services/auth.ts`
- Supabase 클라이언트: `src/services/supabase.ts`

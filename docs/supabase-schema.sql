-- =============================================
-- Flower Market Supabase Schema
-- Supabase Dashboard > SQL Editor에 붙여넣기
-- 이미 테이블이 있어도 안전하게 실행됩니다
-- =============================================


-- =============================================
-- 1. profiles (사용자 프로필)
-- =============================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  role        text not null check (role in ('buyer', 'seller', 'admin')),
  phone       text not null default '',
  address     text not null default '',
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- auth.users 생성 시 profiles row 자동 생성 트리거
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, role, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'buyer'),
    coalesce(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- =============================================
-- 2. stores (판매자 가게)
-- =============================================
create table if not exists public.stores (
  id                       uuid primary key default gen_random_uuid(),
  seller_id                uuid not null references public.profiles(id) on delete cascade,
  name                     text not null,
  description              text not null default '',
  address                  text not null default '',
  image_url                text,
  business_number          text not null default '',
  is_active                boolean not null default true,
  min_order_amount         integer not null default 0,
  subscription_started_at  timestamptz,                        -- 입점 승인 시각 (무료 체험 시작)
  is_subscription_active   boolean not null default false,     -- 유료 구독 활성 여부
  created_at               timestamptz not null default now()
);

-- 기존 테이블에 컬럼 추가 (이미 있으면 무시)
alter table public.stores add column if not exists subscription_started_at timestamptz;
alter table public.stores add column if not exists is_subscription_active boolean not null default false;


-- =============================================
-- 3. products (상품)
-- =============================================
create table if not exists public.products (
  id                       uuid primary key default gen_random_uuid(),
  store_id                 uuid not null references public.stores(id) on delete cascade,
  name                     text not null,
  description              text not null default '',
  product_type             text not null check (product_type in ('fresh_flower', 'tree')),
  category                 text not null,
  retail_price             integer not null default 0,
  wholesale_price          integer not null default 0,
  min_wholesale_quantity   integer not null default 1,
  unit                     text not null default '개',
  image_url                text,
  stock                    integer not null default 0,
  is_available             boolean not null default true,
  created_at               timestamptz not null default now(),

  -- 기본 정보
  product_code             text,
  variety                  text,
  color                    jsonb not null default '[]',
  characteristics          text not null default '',
  image_urls               jsonb not null default '[]',

  -- 상품 특성
  flower_size              text,
  blooming_season          text not null default '',
  freshness_grade          text,
  has_thorns               boolean not null default false,
  has_fragrance            boolean not null default false,

  -- 판매 조건
  min_order_quantity       integer not null default 1,
  sale_start_date          date,
  sale_end_date            date,
  bulk_discount_conditions jsonb not null default '[]',

  -- 배송 정보
  origin                   text not null default '',
  deliverable_regions      jsonb not null default '[]',
  shipping_methods         jsonb not null default '[]',
  shipping_days_required   text not null default '',
  shipping_fee             integer not null default 0,
  order_cutoff_time        text not null default '',
  cold_packaging           boolean not null default false,

  -- 출하 일정
  available_shipping_days  jsonb not null default '[]',
  expected_arrival_days    jsonb not null default '[]',
  harvest_date             date,
  sale_season              text not null default 'year_round',

  -- 추천 및 유의사항
  recommended_buyer_types  jsonb not null default '[]',
  notes                    text not null default ''
);

-- 기존 테이블에 컬럼 추가 (이미 있으면 무시)
alter table public.products add column if not exists product_code text;
alter table public.products add column if not exists variety text;
alter table public.products add column if not exists color jsonb not null default '[]';
alter table public.products add column if not exists characteristics text not null default '';
alter table public.products add column if not exists image_urls jsonb not null default '[]';
alter table public.products add column if not exists flower_size text;
alter table public.products add column if not exists blooming_season text not null default '';
alter table public.products add column if not exists freshness_grade text;
alter table public.products add column if not exists has_thorns boolean not null default false;
alter table public.products add column if not exists has_fragrance boolean not null default false;
alter table public.products add column if not exists min_order_quantity integer not null default 1;
alter table public.products add column if not exists sale_start_date date;
alter table public.products add column if not exists sale_end_date date;
alter table public.products add column if not exists bulk_discount_conditions jsonb not null default '[]';
alter table public.products add column if not exists origin text not null default '';
alter table public.products add column if not exists deliverable_regions jsonb not null default '[]';
alter table public.products add column if not exists shipping_methods jsonb not null default '[]';
alter table public.products add column if not exists shipping_days_required text not null default '';
alter table public.products add column if not exists shipping_fee integer not null default 0;
alter table public.products add column if not exists order_cutoff_time text not null default '';
alter table public.products add column if not exists cold_packaging boolean not null default false;
alter table public.products add column if not exists available_shipping_days jsonb not null default '[]';
alter table public.products add column if not exists expected_arrival_days jsonb not null default '[]';
alter table public.products add column if not exists harvest_date date;
alter table public.products add column if not exists sale_season text not null default 'year_round';
alter table public.products add column if not exists recommended_buyer_types jsonb not null default '[]';
alter table public.products add column if not exists notes text not null default '';


-- =============================================
-- 4. orders (주문)
-- =============================================
create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  buyer_id          uuid not null references public.profiles(id) on delete cascade,
  store_id          uuid not null references public.stores(id) on delete cascade,
  order_type        text not null check (order_type in ('retail', 'wholesale')),
  status            text not null default 'pending'
                      check (status in ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled')),
  total_price       integer not null default 0,
  pg_fee_rate       numeric(5,4) not null default 0.035,   -- PG 수수료율 (3.5%)
  pg_fee_amount     integer not null default 0,            -- PG 수수료 금액
  commission_rate   numeric(5,4) not null default 0.035,   -- 플랫폼 수수료율 (3.5%)
  commission_amount integer not null default 0,            -- 플랫폼 수수료 금액 (플랫폼 수익)
  seller_payout     integer not null default 0,            -- 판매자 정산액
  delivery_date     date not null,
  delivery_address  text not null,
  delivery_memo     text,
  created_at        timestamptz not null default now()
);

-- 기존 테이블에 컬럼 추가 (이미 있으면 무시)
alter table public.orders add column if not exists pg_fee_rate numeric(5,4) not null default 0.035;
alter table public.orders add column if not exists pg_fee_amount integer not null default 0;
alter table public.orders add column if not exists commission_rate numeric(5,4) not null default 0.035;
alter table public.orders add column if not exists commission_amount integer not null default 0;
alter table public.orders add column if not exists seller_payout integer not null default 0;


-- =============================================
-- 5. order_items (주문 상세 항목)
-- =============================================
create table if not exists public.order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  quantity    integer not null default 1,
  unit_price  integer not null default 0
);


-- =============================================
-- RLS (Row Level Security) 활성화
-- =============================================
alter table public.profiles    enable row level security;
alter table public.stores      enable row level security;
alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;


-- =============================================
-- RLS 정책 (기존 정책 삭제 후 재생성)
-- =============================================

-- profiles
drop policy if exists "profiles: 전체 조회" on public.profiles;
drop policy if exists "profiles: 본인만 수정" on public.profiles;
create policy "profiles: 전체 조회" on public.profiles
  for select using (true);
create policy "profiles: 본인만 수정" on public.profiles
  for update using (auth.uid() = id);

-- stores
drop policy if exists "stores: 전체 조회" on public.stores;
drop policy if exists "stores: 판매자 생성" on public.stores;
drop policy if exists "stores: 판매자 수정" on public.stores;
create policy "stores: 전체 조회" on public.stores
  for select using (true);
create policy "stores: 판매자 생성" on public.stores
  for insert with check (auth.uid() = seller_id);
create policy "stores: 판매자 수정" on public.stores
  for update using (auth.uid() = seller_id);

-- products
drop policy if exists "products: 전체 조회" on public.products;
drop policy if exists "products: 판매자 생성" on public.products;
drop policy if exists "products: 판매자 수정" on public.products;
drop policy if exists "products: 판매자 삭제" on public.products;
create policy "products: 전체 조회" on public.products
  for select using (true);
create policy "products: 판매자 생성" on public.products
  for insert with check (
    auth.uid() = (select seller_id from public.stores where id = store_id)
  );
create policy "products: 판매자 수정" on public.products
  for update using (
    auth.uid() = (select seller_id from public.stores where id = store_id)
  );
create policy "products: 판매자 삭제" on public.products
  for delete using (
    auth.uid() = (select seller_id from public.stores where id = store_id)
  );

-- orders
drop policy if exists "orders: 구매자 조회" on public.orders;
drop policy if exists "orders: 판매자 조회" on public.orders;
drop policy if exists "orders: 구매자 생성" on public.orders;
drop policy if exists "orders: 판매자 상태 수정" on public.orders;
create policy "orders: 구매자 조회" on public.orders
  for select using (auth.uid() = buyer_id);
create policy "orders: 판매자 조회" on public.orders
  for select using (
    auth.uid() = (select seller_id from public.stores where id = store_id)
  );
create policy "orders: 구매자 생성" on public.orders
  for insert with check (auth.uid() = buyer_id);
create policy "orders: 판매자 상태 수정" on public.orders
  for update using (
    auth.uid() = (select seller_id from public.stores where id = store_id)
  );

-- order_items
drop policy if exists "order_items: 조회" on public.order_items;
drop policy if exists "order_items: 구매자 생성" on public.order_items;
create policy "order_items: 조회" on public.order_items
  for select using (
    auth.uid() = (select buyer_id from public.orders where id = order_id)
    or
    auth.uid() = (
      select s.seller_id from public.orders o
      join public.stores s on s.id = o.store_id
      where o.id = order_id
    )
  );
create policy "order_items: 구매자 생성" on public.order_items
  for insert with check (
    auth.uid() = (select buyer_id from public.orders where id = order_id)
  );


-- =============================================
-- Storage 버킷 (대시보드에서 수동 생성 필요)
-- Storage > New Bucket > 이름: images, Public: ON
-- =============================================

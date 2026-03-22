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
  id                 uuid primary key default gen_random_uuid(),
  seller_id          uuid not null references public.profiles(id) on delete cascade,
  name               text not null,
  description        text not null default '',
  address            text not null default '',
  image_url          text,
  business_number    text not null default '',
  is_active          boolean not null default true,
  min_order_amount   integer not null default 0,
  created_at         timestamptz not null default now()
);


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
  created_at               timestamptz not null default now()
);


-- =============================================
-- 4. orders (주문)
-- =============================================
create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  buyer_id         uuid not null references public.profiles(id) on delete cascade,
  store_id         uuid not null references public.stores(id) on delete cascade,
  order_type       text not null check (order_type in ('retail', 'wholesale')),
  status           text not null default 'pending'
                     check (status in ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled')),
  total_price      integer not null default 0,
  delivery_date    date not null,
  delivery_address text not null,
  delivery_memo    text,
  created_at       timestamptz not null default now()
);


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

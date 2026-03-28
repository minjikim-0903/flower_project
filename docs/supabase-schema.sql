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
-- 6. posts (커뮤니티 게시글)
-- =============================================
create table if not exists public.posts (
  id           uuid primary key default gen_random_uuid(),
  author_id    uuid not null references public.profiles(id) on delete cascade,
  content      text not null,
  image_urls   jsonb not null default '[]',       -- 이미지 여러 장 (Storage URL 배열)
  product_id   uuid references public.products(id) on delete set null,  -- 상품 태그 (판매자만, 선택)
  likes_count  integer not null default 0,
  comments_count integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- updated_at 자동 갱신 트리거
create or replace function public.handle_post_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_post_updated on public.posts;
create trigger on_post_updated
  before update on public.posts
  for each row execute function public.handle_post_updated_at();


-- =============================================
-- 7. comments (커뮤니티 댓글)
-- =============================================
create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts(id) on delete cascade,
  author_id  uuid not null references public.profiles(id) on delete cascade,
  content    text not null,
  created_at timestamptz not null default now()
);


-- =============================================
-- 8. post_likes (게시글 좋아요)
-- =============================================
create table if not exists public.post_likes (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)   -- 한 사람이 같은 글에 좋아요 중복 불가
);

-- 좋아요 추가 시 posts.likes_count 자동 증가
create or replace function public.handle_like_insert()
returns trigger as $$
begin
  update public.posts set likes_count = likes_count + 1 where id = new.post_id;
  return new;
end;
$$ language plpgsql;

-- 좋아요 취소 시 posts.likes_count 자동 감소
create or replace function public.handle_like_delete()
returns trigger as $$
begin
  update public.posts set likes_count = likes_count - 1 where id = old.post_id;
  return old;
end;
$$ language plpgsql;

drop trigger if exists on_like_inserted on public.post_likes;
create trigger on_like_inserted
  after insert on public.post_likes
  for each row execute function public.handle_like_insert();

drop trigger if exists on_like_deleted on public.post_likes;
create trigger on_like_deleted
  after delete on public.post_likes
  for each row execute function public.handle_like_delete();

-- 댓글 추가 시 posts.comments_count 자동 증가
create or replace function public.handle_comment_insert()
returns trigger as $$
begin
  update public.posts set comments_count = comments_count + 1 where id = new.post_id;
  return new;
end;
$$ language plpgsql;

-- 댓글 삭제 시 posts.comments_count 자동 감소
create or replace function public.handle_comment_delete()
returns trigger as $$
begin
  update public.posts set comments_count = comments_count - 1 where id = old.post_id;
  return old;
end;
$$ language plpgsql;

drop trigger if exists on_comment_inserted on public.comments;
create trigger on_comment_inserted
  after insert on public.comments
  for each row execute function public.handle_comment_insert();

drop trigger if exists on_comment_deleted on public.comments;
create trigger on_comment_deleted
  after delete on public.comments
  for each row execute function public.handle_comment_delete();


-- =============================================
-- RLS 활성화 (커뮤니티)
-- =============================================
alter table public.posts       enable row level security;
alter table public.comments    enable row level security;
alter table public.post_likes  enable row level security;


-- =============================================
-- RLS 정책 (커뮤니티)
-- =============================================

-- posts
drop policy if exists "posts: 전체 조회" on public.posts;
drop policy if exists "posts: 로그인 사용자 작성" on public.posts;
drop policy if exists "posts: 본인만 수정" on public.posts;
drop policy if exists "posts: 본인만 삭제" on public.posts;
create policy "posts: 전체 조회" on public.posts
  for select using (true);
create policy "posts: 로그인 사용자 작성" on public.posts
  for insert with check (auth.uid() = author_id);
create policy "posts: 본인만 수정" on public.posts
  for update using (auth.uid() = author_id);
create policy "posts: 본인만 삭제" on public.posts
  for delete using (auth.uid() = author_id);

-- comments
drop policy if exists "comments: 전체 조회" on public.comments;
drop policy if exists "comments: 로그인 사용자 작성" on public.comments;
drop policy if exists "comments: 본인만 삭제" on public.comments;
create policy "comments: 전체 조회" on public.comments
  for select using (true);
create policy "comments: 로그인 사용자 작성" on public.comments
  for insert with check (auth.uid() = author_id);
create policy "comments: 본인만 삭제" on public.comments
  for delete using (auth.uid() = author_id);

-- post_likes
drop policy if exists "post_likes: 전체 조회" on public.post_likes;
drop policy if exists "post_likes: 본인 좋아요" on public.post_likes;
drop policy if exists "post_likes: 본인 취소" on public.post_likes;
create policy "post_likes: 전체 조회" on public.post_likes
  for select using (true);
create policy "post_likes: 본인 좋아요" on public.post_likes
  for insert with check (auth.uid() = user_id);
create policy "post_likes: 본인 취소" on public.post_likes
  for delete using (auth.uid() = user_id);


-- =============================================
-- Storage 버킷 (대시보드에서 수동 생성 필요)
-- Storage > New Bucket > 이름: images, Public: ON
-- =============================================

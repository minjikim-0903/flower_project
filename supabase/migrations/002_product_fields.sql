-- products 테이블 신규 컬럼 추가

-- 기본 정보
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS product_code TEXT,                  -- 품번 (내부용, 사용자 비노출)
  ADD COLUMN IF NOT EXISTS variety TEXT,                       -- 품종
  ADD COLUMN IF NOT EXISTS color TEXT[] DEFAULT '{}',          -- 컬러 (복수 선택)
  ADD COLUMN IF NOT EXISTS characteristics TEXT DEFAULT '',    -- 특징
  ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';     -- 다중 사진 (기존 image_url 유지)

-- 상품 특성
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS flower_size TEXT                    -- 꽃 크기
    CHECK (flower_size IN ('소', '중', '대', '특대') OR flower_size IS NULL),
  ADD COLUMN IF NOT EXISTS blooming_season TEXT DEFAULT '',    -- 개화 시기
  ADD COLUMN IF NOT EXISTS freshness_grade TEXT               -- 신선도
    CHECK (freshness_grade IN ('A', 'B', 'C') OR freshness_grade IS NULL),
  ADD COLUMN IF NOT EXISTS has_thorns BOOLEAN DEFAULT FALSE,   -- 가시유무
  ADD COLUMN IF NOT EXISTS has_fragrance BOOLEAN DEFAULT FALSE; -- 향기유무

-- 판매 조건
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS min_order_quantity INTEGER NOT NULL DEFAULT 1,   -- 최소주문수량
  ADD COLUMN IF NOT EXISTS sale_start_date DATE,               -- 판매기간 시작
  ADD COLUMN IF NOT EXISTS sale_end_date DATE,                 -- 판매기간 종료
  ADD COLUMN IF NOT EXISTS bulk_discount_conditions JSONB DEFAULT '[]'; -- 대량할인 조건 [{min_quantity, discount_rate}]

-- 배송 정보
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS origin TEXT DEFAULT '',             -- 출하지 (산지)
  ADD COLUMN IF NOT EXISTS deliverable_regions TEXT[] DEFAULT '{}',  -- 배송 가능 지역
  ADD COLUMN IF NOT EXISTS shipping_methods TEXT[] DEFAULT '{}',     -- 배송 방법
  ADD COLUMN IF NOT EXISTS shipping_days_required TEXT DEFAULT '',   -- 배송 소요일
  ADD COLUMN IF NOT EXISTS shipping_fee INTEGER NOT NULL DEFAULT 0,  -- 배송비
  ADD COLUMN IF NOT EXISTS order_cutoff_time TEXT DEFAULT '',        -- 주문 마감 시간
  ADD COLUMN IF NOT EXISTS cold_packaging BOOLEAN DEFAULT FALSE;     -- 보냉 포장 여부

-- 출하 일정
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS available_shipping_days TEXT[] DEFAULT '{}', -- 출하 가능 요일
  ADD COLUMN IF NOT EXISTS expected_arrival_days TEXT[] DEFAULT '{}',   -- 입고 예정일
  ADD COLUMN IF NOT EXISTS harvest_date DATE,                           -- 수확일
  ADD COLUMN IF NOT EXISTS sale_season TEXT DEFAULT 'year_round'        -- 판매 시즌
    CHECK (sale_season IN ('year_round', 'spring', 'summer', 'fall', 'winter'));

-- 추천 및 유의사항
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS recommended_buyer_types TEXT[] DEFAULT '{}', -- 추천 구매자 타입
  ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';                        -- 유의사항

-- stores 테이블: 판매자 정보 추가
ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS seller_grade TEXT DEFAULT 'general'  -- 판매자 등급
    CHECK (seller_grade IN ('certified', 'general')),
  ADD COLUMN IF NOT EXISTS origin_certification TEXT DEFAULT 'none'  -- 산지 인증
    CHECK (origin_certification IN ('gap', 'organic', 'none'));

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_products_origin ON products(origin);
CREATE INDEX IF NOT EXISTS idx_products_sale_season ON products(sale_season);

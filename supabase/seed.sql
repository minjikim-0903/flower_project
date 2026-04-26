-- ================================================================
-- Bloom 테스트 데이터 시드
-- seller@test.com 계정에 가게 + 상품을 연결합니다.
-- Supabase SQL Editor에 붙여넣고 실행하세요.
-- ================================================================

DO $$
DECLARE
  v_seller_id UUID;
  v_store_id  UUID := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
BEGIN

  -- seller@test.com 계정이 없으면 직접 생성
  SELECT id INTO v_seller_id
  FROM auth.users
  WHERE email = 'seller@test.com'
  LIMIT 1;

  IF v_seller_id IS NULL THEN
    v_seller_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password,
      email_confirmed_at, confirmation_sent_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, aud, role
    ) VALUES (
      v_seller_id,
      '00000000-0000-0000-0000-000000000000',
      'seller@test.com',
      crypt('test1234', gen_salt('bf')),
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"한아름 대표"}',
      NOW(), NOW(), 'authenticated', 'authenticated'
    );
  END IF;

  -- ── 판매자 프로필 upsert ────────────────────────────────────────
  INSERT INTO profiles (id, name, role, phone, address, created_at)
  VALUES (v_seller_id, '한아름 대표', 'seller', '010-1234-5678', '서울 강남구 양재동', NOW())
  ON CONFLICT (id) DO UPDATE
    SET role = 'seller',
        name = COALESCE(NULLIF(profiles.name, ''), '한아름 대표');

  -- ── 테스트 가게 ─────────────────────────────────────────────────
  INSERT INTO stores (
    id, seller_id, name, description, address,
    business_number, is_active, min_order_amount,
    seller_grade, origin_certification,
    is_subscription_active, subscription_started_at,
    image_url, created_at
  )
  VALUES (
    v_store_id, v_seller_id,
    '한아름꽃시장',
    '30년 전통의 양재 꽃 도매시장 1등 매장. 국내산 생화 전문, 매일 새벽 경매 직송.',
    '서울 강남구 양재동 꽃 도매시장 1동 201호',
    '123-45-67890',
    TRUE, 30000,
    'certified', 'gap',
    TRUE, NOW(),
    'https://images.unsplash.com/photo-1487530811015-780780a6e4a7?auto=format&fit=crop&q=80&w=800',
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- ── 상품 1: 레드 장미 ────────────────────────────────────────────
  INSERT INTO products (
    id, store_id, name, description, product_type, category,
    retail_price, wholesale_price, min_wholesale_quantity, unit,
    stock, is_available,
    color, characteristics, image_urls, image_url,
    freshness_grade, has_thorns, has_fragrance,
    min_order_quantity, origin,
    deliverable_regions, shipping_methods,
    shipping_days_required, shipping_fee, order_cutoff_time, cold_packaging,
    available_shipping_days, sale_season,
    recommended_buyer_types, notes,
    bulk_discount_conditions, blooming_season, created_at
  ) VALUES (
    'cccccccc-cccc-cccc-cccc-000000000001', v_store_id,
    '레드 장미 (10송이)', '경매 당일 직송, 국내산 최상급 레드 장미. 꽃잎이 풍성하고 색이 선명합니다.',
    'fresh_flower', 'rose',
    12800, 8500, 10, '단',
    200, TRUE,
    ARRAY['red'], '꽃잎 풍성, 가시 있음, 향기 은은',
    ARRAY['https://images.unsplash.com/photo-1596434446633-911470550974?auto=format&fit=crop&q=80&w=400'],
    'https://images.unsplash.com/photo-1596434446633-911470550974?auto=format&fit=crop&q=80&w=400',
    'A', TRUE, TRUE,
    1, '경기 고양시',
    ARRAY['전국'], ARRAY['새벽배송','일반택배'],
    '1일', 3000, '14:00', TRUE,
    ARRAY['월','화','수','목','금'], 'year_round',
    ARRAY['retail_shop','wedding_event'], '주문 마감 오후 2시, 다음날 새벽 배송',
    '[{"min_quantity":50,"discount_rate":5},{"min_quantity":100,"discount_rate":10}]',
    '연중', NOW()
  ) ON CONFLICT (id) DO NOTHING;

  -- ── 상품 2: 핑크 튤립 ────────────────────────────────────────────
  INSERT INTO products (
    id, store_id, name, description, product_type, category,
    retail_price, wholesale_price, min_wholesale_quantity, unit,
    stock, is_available,
    color, characteristics, image_urls, image_url,
    freshness_grade, has_thorns, has_fragrance,
    min_order_quantity, origin,
    deliverable_regions, shipping_methods,
    shipping_days_required, shipping_fee, order_cutoff_time, cold_packaging,
    available_shipping_days, sale_season,
    recommended_buyer_types, notes,
    bulk_discount_conditions, blooming_season, created_at
  ) VALUES (
    'cccccccc-cccc-cccc-cccc-000000000002', v_store_id,
    '핑크 튤립 (5송이)', '네덜란드산 핑크 튤립. 봄 분위기를 물씬 풍기는 인기 상품입니다.',
    'fresh_flower', 'tulip',
    9800, 6200, 10, '단',
    150, TRUE,
    ARRAY['pink'], '줄기 길고 탄탄, 향기 없음',
    ARRAY['https://images.unsplash.com/photo-1490750967868-88df5691cc64?auto=format&fit=crop&q=80&w=400'],
    'https://images.unsplash.com/photo-1490750967868-88df5691cc64?auto=format&fit=crop&q=80&w=400',
    'A', FALSE, FALSE,
    1, '네덜란드 수입',
    ARRAY['전국'], ARRAY['새벽배송','일반택배'],
    '1일', 3000, '14:00', TRUE,
    ARRAY['월','화','수','목','금'], 'spring',
    ARRAY['retail_shop','general_consumer'], '3~5월 시즌 상품. 재고 한정.',
    '[{"min_quantity":50,"discount_rate":5}]',
    '봄 (3~5월)', NOW()
  ) ON CONFLICT (id) DO NOTHING;

  -- ── 상품 3: 화이트 백합 ──────────────────────────────────────────
  INSERT INTO products (
    id, store_id, name, description, product_type, category,
    retail_price, wholesale_price, min_wholesale_quantity, unit,
    stock, is_available,
    color, characteristics, image_urls, image_url,
    freshness_grade, has_thorns, has_fragrance,
    min_order_quantity, origin,
    deliverable_regions, shipping_methods,
    shipping_days_required, shipping_fee, order_cutoff_time, cold_packaging,
    available_shipping_days, sale_season,
    recommended_buyer_types, notes,
    bulk_discount_conditions, blooming_season, created_at
  ) VALUES (
    'cccccccc-cccc-cccc-cccc-000000000003', v_store_id,
    '화이트 백합 부케 (3송이)', '강한 향기로 공간을 채우는 국내산 화이트 백합.',
    'fresh_flower', 'lily',
    18500, 13000, 5, '단',
    80, TRUE,
    ARRAY['white'], '강한 향, 꽃가루 주의',
    ARRAY['https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&q=80&w=400'],
    'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&q=80&w=400',
    'A', FALSE, TRUE,
    1, '전남 고흥',
    ARRAY['전국'], ARRAY['새벽배송','일반택배'],
    '1일', 3000, '14:00', TRUE,
    ARRAY['월','화','수','목','금','토'], 'year_round',
    ARRAY['wedding_event','retail_shop'], '꽃가루가 많으니 옷에 주의하세요.',
    '[{"min_quantity":30,"discount_rate":8}]',
    '연중', NOW()
  ) ON CONFLICT (id) DO NOTHING;

  -- ── 상품 4: 카네이션 ─────────────────────────────────────────────
  INSERT INTO products (
    id, store_id, name, description, product_type, category,
    retail_price, wholesale_price, min_wholesale_quantity, unit,
    stock, is_available,
    color, characteristics, image_urls, image_url,
    freshness_grade, has_thorns, has_fragrance,
    min_order_quantity, origin,
    deliverable_regions, shipping_methods,
    shipping_days_required, shipping_fee, order_cutoff_time, cold_packaging,
    available_shipping_days, sale_season,
    recommended_buyer_types, notes,
    bulk_discount_conditions, blooming_season, created_at
  ) VALUES (
    'cccccccc-cccc-cccc-cccc-000000000004', v_store_id,
    '카네이션 혼합 (10송이)', '5월 가정의 달 베스트셀러. 레드·핑크·화이트 혼합 구성.',
    'fresh_flower', 'carnation',
    15000, 9800, 20, '단',
    300, TRUE,
    ARRAY['red','pink','white'], '향기 은은, 오래 가는 꽃',
    ARRAY['https://images.unsplash.com/photo-1490750967868-88df5691cc64?auto=format&fit=crop&q=80&w=400'],
    'https://images.unsplash.com/photo-1490750967868-88df5691cc64?auto=format&fit=crop&q=80&w=400',
    'A', FALSE, TRUE,
    1, '경남 진주',
    ARRAY['전국'], ARRAY['새벽배송','일반택배','직접배송'],
    '1일', 0, '13:00', TRUE,
    ARRAY['월','화','수','목','금','토'], 'spring',
    ARRAY['retail_shop','general_consumer','wedding_event'], '5월 시즌 한정 재고.',
    '[{"min_quantity":100,"discount_rate":10},{"min_quantity":200,"discount_rate":15}]',
    '봄 (4~6월)', NOW()
  ) ON CONFLICT (id) DO NOTHING;

  -- ── 상품 5: 해바라기 ─────────────────────────────────────────────
  INSERT INTO products (
    id, store_id, name, description, product_type, category,
    retail_price, wholesale_price, min_wholesale_quantity, unit,
    stock, is_available,
    color, characteristics, image_urls, image_url,
    freshness_grade, has_thorns, has_fragrance,
    min_order_quantity, origin,
    deliverable_regions, shipping_methods,
    shipping_days_required, shipping_fee, order_cutoff_time, cold_packaging,
    available_shipping_days, sale_season,
    recommended_buyer_types, notes,
    bulk_discount_conditions, blooming_season, created_at
  ) VALUES (
    'cccccccc-cccc-cccc-cccc-000000000005', v_store_id,
    '해바라기 대 (1송이)', '국내산 점보 해바라기. 밝고 화사한 분위기 연출에 최적.',
    'fresh_flower', 'sunflower',
    4500, 2800, 20, '송이',
    500, TRUE,
    ARRAY['yellow'], '줄기 굵고 단단, 꽃 직경 15~20cm',
    ARRAY['https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&q=80&w=400'],
    'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&q=80&w=400',
    'A', FALSE, FALSE,
    10, '강원 원주',
    ARRAY['전국'], ARRAY['새벽배송','일반택배'],
    '1일', 3000, '14:00', FALSE,
    ARRAY['월','화','수','목','금'], 'summer',
    ARRAY['retail_shop','general_consumer'], '여름 시즌 (6~8월) 수량 풍부.',
    '[{"min_quantity":50,"discount_rate":5},{"min_quantity":100,"discount_rate":10}]',
    '여름 (6~9월)', NOW()
  ) ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE '완료: seller@test.com (%) 계정에 가게 + 상품 5개 생성', v_seller_id;

END $$;

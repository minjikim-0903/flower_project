-- 사용자 프로필 테이블
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('seller', 'buyer')),
  phone TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 가게 테이블
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL,
  image_url TEXT,
  business_number TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  min_order_amount INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 상품 테이블
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  product_type TEXT NOT NULL CHECK (product_type IN ('fresh_flower', 'tree')),
  category TEXT NOT NULL CHECK (
    category IN (
      -- 생화
      'rose', 'lily', 'tulip', 'chrysanthemum', 'carnation', 'sunflower', 'orchid', 'mixed_fresh', 'other_fresh',
      -- 나무
      'fruit_tree', 'ornamental_tree', 'conifer', 'shrub', 'indoor_plant', 'bamboo', 'mixed_tree', 'other_tree'
    )
  ),
  retail_price INTEGER NOT NULL,
  wholesale_price INTEGER NOT NULL,
  min_wholesale_quantity INTEGER NOT NULL DEFAULT 10,
  unit TEXT NOT NULL DEFAULT '단',
  image_url TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 주문 테이블
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  order_type TEXT NOT NULL CHECK (order_type IN ('retail', 'wholesale')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled')
  ),
  total_price INTEGER NOT NULL,
  delivery_date DATE NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_memo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 주문 상품 테이블
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_stores_seller_id ON stores(seller_id);
CREATE INDEX idx_stores_is_active ON stores(is_active);
CREATE INDEX idx_products_store_id ON products(store_id);
CREATE INDEX idx_products_product_type ON products(product_type);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Row Level Security (RLS) 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- profiles RLS 정책
CREATE POLICY "프로필 본인만 수정" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "프로필 본인만 삭제" ON profiles
  FOR DELETE USING (auth.uid() = id);

CREATE POLICY "프로필 전체 조회" ON profiles
  FOR SELECT USING (TRUE);

CREATE POLICY "프로필 본인만 생성" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- stores RLS 정책
CREATE POLICY "가게 전체 조회" ON stores
  FOR SELECT USING (TRUE);

CREATE POLICY "가게 판매자만 생성" ON stores
  FOR INSERT WITH CHECK (
    auth.uid() = seller_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'seller')
  );

CREATE POLICY "가게 본인만 수정" ON stores
  FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "가게 본인만 삭제" ON stores
  FOR DELETE USING (auth.uid() = seller_id);

-- products RLS 정책
CREATE POLICY "상품 전체 조회" ON products
  FOR SELECT USING (TRUE);

CREATE POLICY "상품 가게 주인만 생성" ON products
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM stores WHERE id = store_id AND seller_id = auth.uid())
  );

CREATE POLICY "상품 가게 주인만 수정" ON products
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM stores WHERE id = store_id AND seller_id = auth.uid())
  );

CREATE POLICY "상품 가게 주인만 삭제" ON products
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM stores WHERE id = store_id AND seller_id = auth.uid())
  );

-- orders RLS 정책
CREATE POLICY "주문 구매자 본인만 생성" ON orders
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "주문 구매자 또는 판매자 조회" ON orders
  FOR SELECT USING (
    auth.uid() = buyer_id OR
    EXISTS (SELECT 1 FROM stores WHERE id = store_id AND seller_id = auth.uid())
  );

CREATE POLICY "주문 판매자만 상태 수정" ON orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM stores WHERE id = store_id AND seller_id = auth.uid())
  );

-- order_items RLS 정책
CREATE POLICY "주문 상품 관련자 조회" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_id AND (
        orders.buyer_id = auth.uid() OR
        EXISTS (SELECT 1 FROM stores WHERE stores.id = orders.store_id AND stores.seller_id = auth.uid())
      )
    )
  );

CREATE POLICY "주문 상품 구매자만 생성" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_id AND orders.buyer_id = auth.uid()
    )
  );

-- Storage 버킷 설정
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', TRUE);

CREATE POLICY "이미지 공개 읽기" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "인증된 사용자만 이미지 업로드" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'images' AND auth.role() = 'authenticated'
  );

CREATE POLICY "본인 이미지만 수정" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]
  );

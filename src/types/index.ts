export type UserRole = 'seller' | 'buyer' | 'admin';
export type SellerGrade = 'certified' | 'general';
export type OriginCertification = 'gap' | 'organic' | 'none';

export interface Profile {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  address: string;
  avatar_url?: string;
  created_at: string;
}

export interface Store {
  id: string;
  seller_id: string;
  name: string;
  description: string;
  address: string;
  image_url?: string;
  business_number: string;
  is_active: boolean;
  min_order_amount: number;
  seller_grade: SellerGrade;
  origin_certification: OriginCertification;
  created_at: string;
  seller?: Profile;
}

// 생화 카테고리
export type FreshFlowerCategory =
  | 'rose'
  | 'lily'
  | 'tulip'
  | 'chrysanthemum'
  | 'carnation'
  | 'sunflower'
  | 'orchid'
  | 'mixed_fresh'
  | 'other_fresh';

// 나무 카테고리
export type TreeCategory =
  | 'fruit_tree'
  | 'ornamental_tree'
  | 'conifer'
  | 'shrub'
  | 'indoor_plant'
  | 'bamboo'
  | 'mixed_tree'
  | 'other_tree';

export type ProductType = 'fresh_flower' | 'tree';

export type FlowerCategory = FreshFlowerCategory | TreeCategory;

export type FlowerSize = '소' | '중' | '대' | '특대';
export type FreshnessGrade = 'A' | 'B' | 'C';
export type SaleSeason = 'year_round' | 'spring' | 'summer' | 'fall' | 'winter';
export type RecommendedBuyerType = 'wedding_event' | 'retail_shop' | 'general_consumer';
export type ShippingMethod = '새벽배송' | '일반택배' | '직접배송';
export type DeliverableRegion = '전국' | '수도권 한정';

export interface BulkDiscountCondition {
  min_quantity: number;
  discount_rate: number; // 퍼센트
}

export interface Product {
  id: string;
  store_id: string;
  name: string;
  description: string;
  product_type: ProductType;
  category: FlowerCategory;
  retail_price: number;
  wholesale_price: number;
  min_wholesale_quantity: number;
  unit: string;
  image_url?: string;
  stock: number;
  is_available: boolean;
  created_at: string;
  store?: Store;

  // 기본 정보
  product_code?: string;
  variety?: string;
  color: string[];
  characteristics: string;
  image_urls: string[];

  // 상품 특성
  flower_size?: FlowerSize;
  blooming_season: string;
  freshness_grade?: FreshnessGrade;
  has_thorns: boolean;
  has_fragrance: boolean;

  // 판매 조건
  min_order_quantity: number;
  sale_start_date?: string;
  sale_end_date?: string;
  bulk_discount_conditions: BulkDiscountCondition[];

  // 배송 정보
  origin: string;
  deliverable_regions: string[];
  shipping_methods: string[];
  shipping_days_required: string;
  shipping_fee: number;
  order_cutoff_time: string;
  cold_packaging: boolean;

  // 출하 일정
  available_shipping_days: string[];
  expected_arrival_days: string[];
  harvest_date?: string;
  sale_season: SaleSeason;

  // 추천 및 유의사항
  recommended_buyer_types: string[];
  notes: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type OrderType = 'retail' | 'wholesale';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product?: Product;
}

export interface Order {
  id: string;
  buyer_id: string;
  store_id: string;
  order_type: OrderType;
  status: OrderStatus;
  total_price: number;
  delivery_date: string;
  delivery_address: string;
  delivery_memo?: string;
  created_at: string;
  buyer?: Profile;
  store?: Store;
  items?: OrderItem[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

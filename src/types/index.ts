export type UserRole = 'seller' | 'buyer';

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

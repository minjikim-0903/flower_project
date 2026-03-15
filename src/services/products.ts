import { supabase } from './supabase';
import { FlowerCategory, Product, ProductType } from '@/types';

export const productService = {
  async getProductsByStore(storeId: string, productType?: ProductType): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select('*')
      .eq('store_id', storeId)
      .eq('is_available', true)
      .order('product_type')
      .order('created_at', { ascending: false });

    if (productType) query = query.eq('product_type', productType);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getProducts(options?: { category?: FlowerCategory; productType?: ProductType; search?: string; storeId?: string }) {
    let query = supabase
      .from('products')
      .select('*, store:stores(id, name, address)')
      .eq('is_available', true);

    if (options?.category) query = query.eq('category', options.category);
    if (options?.search) query = query.ilike('name', `%${options.search}%`);
    if (options?.storeId) query = query.eq('store_id', options.storeId);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data as Product[];
  },

  async getProductById(productId: string): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .select('*, store:stores(id, name, address, seller:profiles(name, phone))')
      .eq('id', productId)
      .single();
    if (error) throw error;
    return data;
  },

  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'store'>) {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();
    if (error) throw error;
    return data as Product;
  },

  async updateProduct(productId: string, updates: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select()
      .single();
    if (error) throw error;
    return data as Product;
  },

  async deleteProduct(productId: string) {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) throw error;
  },

  async uploadProductImage(productId: string, uri: string): Promise<string> {
    const fileName = `products/${productId}/${Date.now()}.jpg`;
    const response = await fetch(uri);
    const blob = await response.blob();

    const { error } = await supabase.storage.from('images').upload(fileName, blob, {
      contentType: 'image/jpeg',
      upsert: true,
    });
    if (error) throw error;

    const { data } = supabase.storage.from('images').getPublicUrl(fileName);
    return data.publicUrl;
  },
};

import { supabase } from './supabase';
import { Store } from '@/types';

export const storeService = {
  async getStores(options?: { search?: string; limit?: number; offset?: number; productType?: 'fresh_flower' | 'tree' }) {
    let storeIds: string[] | null = null;

    if (options?.productType) {
      const { data: products } = await supabase
        .from('products')
        .select('store_id')
        .eq('product_type', options.productType)
        .eq('is_available', true);
      storeIds = products ? [...new Set(products.map((p: any) => p.store_id))] : [];
    }

    let query = supabase
      .from('stores')
      .select('*, seller:profiles(id, name, phone)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (options?.search) {
      query = query.ilike('name', `%${options.search}%`);
    }
    if (storeIds !== null) {
      query = storeIds.length > 0 ? query.in('id', storeIds) : query.in('id', ['']);
    }
    if (options?.limit) query = query.limit(options.limit);
    if (options?.offset) query = query.range(options.offset, options.offset + (options.limit ?? 20) - 1);

    const { data, error } = await query;
    if (error) throw error;
    return data as Store[];
  },

  async getStoreById(storeId: string): Promise<Store> {
    const { data, error } = await supabase
      .from('stores')
      .select('*, seller:profiles(id, name, phone, address)')
      .eq('id', storeId)
      .single();
    if (error) throw error;
    return data;
  },

  async getMyStore(sellerId: string): Promise<Store | null> {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('seller_id', sellerId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createStore(store: Omit<Store, 'id' | 'created_at' | 'seller'>) {
    const { data, error } = await supabase
      .from('stores')
      .insert(store)
      .select()
      .single();
    if (error) throw error;
    return data as Store;
  },

  async updateStore(storeId: string, updates: Partial<Store>) {
    const { data, error } = await supabase
      .from('stores')
      .update(updates)
      .eq('id', storeId)
      .select()
      .single();
    if (error) throw error;
    return data as Store;
  },

  async uploadStoreImage(storeId: string, uri: string): Promise<string> {
    const fileName = `stores/${storeId}/${Date.now()}.jpg`;
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

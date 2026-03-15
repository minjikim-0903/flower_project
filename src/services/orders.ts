import { supabase } from './supabase';
import { CartItem, Order, OrderStatus, OrderType } from '@/types';

export const orderService = {
  async createOrder(params: {
    buyerId: string;
    storeId: string;
    items: CartItem[];
    orderType: OrderType;
    deliveryDate: string;
    deliveryAddress: string;
    deliveryMemo?: string;
  }): Promise<Order> {
    const totalPrice = params.items.reduce((sum, item) => {
      const price =
        params.orderType === 'wholesale'
          ? item.product.wholesale_price
          : item.product.retail_price;
      return sum + price * item.quantity;
    }, 0);

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: params.buyerId,
        store_id: params.storeId,
        order_type: params.orderType,
        status: 'pending',
        total_price: totalPrice,
        delivery_date: params.deliveryDate,
        delivery_address: params.deliveryAddress,
        delivery_memo: params.deliveryMemo,
      })
      .select()
      .single();
    if (orderError) throw orderError;

    const orderItems = params.items.map((item) => ({
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.quantity,
      unit_price:
        params.orderType === 'wholesale'
          ? item.product.wholesale_price
          : item.product.retail_price,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    return order;
  },

  async getBuyerOrders(buyerId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, store:stores(id, name), items:order_items(*, product:products(id, name, image_url))')
      .eq('buyer_id', buyerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getSellerOrders(storeId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, buyer:profiles(id, name, phone), items:order_items(*, product:products(id, name))')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();
    if (error) throw error;
    return data as Order;
  },

  async getOrderById(orderId: string): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, store:stores(id, name, address), buyer:profiles(id, name, phone), items:order_items(*, product:products(*))')
      .eq('id', orderId)
      .single();
    if (error) throw error;
    return data;
  },
};

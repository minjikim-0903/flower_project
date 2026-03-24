import { supabase } from './supabase';
import { CartItem, Order, OrderStatus, OrderType } from '@/types';

const PG_FEE_RATE = 0.035;
const PLATFORM_FEE_RATE = 0.035;

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

    const pgFeeAmount = Math.round(totalPrice * PG_FEE_RATE);
    const commissionAmount = Math.round(totalPrice * PLATFORM_FEE_RATE);
    const sellerPayout = totalPrice - pgFeeAmount - commissionAmount;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: params.buyerId,
        store_id: params.storeId,
        order_type: params.orderType,
        status: 'pending',
        total_price: totalPrice,
        pg_fee_rate: PG_FEE_RATE,
        pg_fee_amount: pgFeeAmount,
        commission_rate: PLATFORM_FEE_RATE,
        commission_amount: commissionAmount,
        seller_payout: sellerPayout,
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

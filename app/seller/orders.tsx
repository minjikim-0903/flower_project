import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/useAuthStore';
import { storeService } from '@/services/stores';
import { orderService } from '@/services/orders';
import { Order, OrderStatus } from '@/types';

const STATUS_FLOW: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered'];

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: '주문 접수',
  confirmed: '주문 확인',
  preparing: '준비 중',
  shipped: '배송 중',
  delivered: '배송 완료',
  cancelled: '취소됨',
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: '#FFA500',
  confirmed: '#4A90E2',
  preparing: '#9B59B6',
  shipped: '#27AE60',
  delivered: '#2ECC71',
  cancelled: '#E74C3C',
};

export default function SellerOrdersScreen() {
  const { profile } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const store = await storeService.getMyStore(profile.id);
      if (store) {
        const data = await orderService.getSellerOrders(store.id);
        setOrders(data);
      }
      setLoading(false);
    })();
  }, [profile]);

  const handleStatusUpdate = (order: Order) => {
    const currentIdx = STATUS_FLOW.indexOf(order.status);
    if (currentIdx === -1 || currentIdx >= STATUS_FLOW.length - 1) return;
    const nextStatus = STATUS_FLOW[currentIdx + 1];

    Alert.alert(
      '상태 변경',
      `"${STATUS_LABEL[order.status]}" → "${STATUS_LABEL[nextStatus]}"로 변경할까요?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '변경',
          onPress: async () => {
            const updated = await orderService.updateOrderStatus(order.id, nextStatus);
            setOrders(orders.map((o) => (o.id === order.id ? { ...o, status: updated.status } : o)));
          },
        },
      ]
    );
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#2ECC71" />;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Text className="font-bold p-5 bg-white" style={{ fontSize: 22 }}>주문 관리</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            className="bg-white rounded-2xl p-4"
            style={{
              elevation: 2,
              shadowColor: '#000',
              shadowOpacity: 0.06,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
            }}
          >
            <View className="flex-row justify-between mb-2">
              <Text style={{ fontWeight: '700', fontSize: 16 }}>{item.buyer?.name}</Text>
              <Text style={{ color: '#888' }}>{item.buyer?.phone}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text style={{ color: '#555' }}>
                {item.order_type === 'wholesale' ? '🏭 도매' : '🛒 소매'}
              </Text>
              <Text style={{ fontWeight: '700', color: '#2ECC71', fontSize: 16 }}>{item.total_price.toLocaleString()}원</Text>
            </View>
            <View
              className="rounded-lg mb-2 gap-1"
              style={{ backgroundColor: '#f8f8f8', padding: 12 }}
            >
              <View className="flex-row justify-between">
                <Text style={{ fontSize: 13, color: '#888' }}>결제 금액</Text>
                <Text style={{ fontSize: 13, color: '#555' }}>{item.total_price.toLocaleString()}원</Text>
              </View>
              <View className="flex-row justify-between">
                <Text style={{ fontSize: 13, color: '#888' }}>PG 수수료 (3.5%)</Text>
                <Text style={{ fontSize: 13, color: '#E74C3C' }}>-{(item.pg_fee_amount ?? Math.round(item.total_price * 0.035)).toLocaleString()}원</Text>
              </View>
              <View className="flex-row justify-between">
                <Text style={{ fontSize: 13, color: '#888' }}>플랫폼 수수료 (3.5%)</Text>
                <Text style={{ fontSize: 13, color: '#E74C3C' }}>-{(item.commission_amount ?? Math.round(item.total_price * 0.035)).toLocaleString()}원</Text>
              </View>
              <View
                className="flex-row justify-between border-t"
                style={{ borderTopColor: '#e0e0e0', marginTop: 6, paddingTop: 6 }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#333' }}>정산 예정액</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#2ECC71' }}>{(item.seller_payout ?? item.total_price - Math.round(item.total_price * 0.07)).toLocaleString()}원</Text>
              </View>
            </View>
            <Text className="text-sm mb-0.5" style={{ color: '#555' }}>
              배송 예정: {format(new Date(item.delivery_date), 'M월 d일')}
            </Text>
            <Text style={{ color: '#888', fontSize: 13 }}>{item.delivery_address}</Text>
            {item.delivery_memo ? (
              <Text style={{ color: '#888', fontSize: 13, marginTop: 4 }}>📝 {item.delivery_memo}</Text>
            ) : null}
            <View
              className="flex-row justify-between items-center border-t border-border"
              style={{ marginTop: 12, paddingTop: 12 }}
            >
              <View
                className="rounded-lg"
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  backgroundColor: STATUS_COLOR[item.status] + '20',
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: STATUS_COLOR[item.status] }}>
                  {STATUS_LABEL[item.status]}
                </Text>
              </View>
              {item.status !== 'delivered' && item.status !== 'cancelled' && (
                <TouchableOpacity
                  className="rounded-lg"
                  style={{ backgroundColor: '#2ECC7120', paddingHorizontal: 14, paddingVertical: 7 }}
                  onPress={() => handleStatusUpdate(item)}
                >
                  <Text style={{ color: '#2ECC71', fontWeight: '600' }}>다음 단계 →</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={
          <View className="items-center gap-3" style={{ paddingTop: 60 }}>
            <Text style={{ fontSize: 40 }}>📦</Text>
            <Text style={{ color: '#aaa', fontSize: 16 }}>주문이 없습니다.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

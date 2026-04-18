import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { ClipboardList } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/useAuthStore';
import { orderService } from '@/services/orders';
import { Order, OrderStatus } from '@/types';

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

export default function OrdersScreen() {
  const { profile } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    orderService
      .getBuyerOrders(profile.id)
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [profile]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <Text className="font-bold p-5 bg-white" style={{ fontSize: 22 }}>주문 내역</Text>
        <ActivityIndicator style={{ marginTop: 40 }} color="#FF6B9D" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Text className="font-bold p-5 bg-white" style={{ fontSize: 22 }}>주문 내역</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-white rounded-2xl p-4"
            style={{
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 3,
            }}
            onPress={() => router.push(`/users/order/${item.id}`)}
          >
            <View className="flex-row justify-between mb-2">
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
              <Text style={{ color: '#6a6a6a', fontSize: 13 }}>
                {item.order_type === 'wholesale' ? '도매' : '소매'}
              </Text>
            </View>
            <Text style={{ fontSize: 17, fontWeight: '600', marginBottom: 8 }}>{item.store?.name}</Text>
            <View className="flex-row justify-between items-center">
              <Text style={{ color: '#6a6a6a', fontSize: 14 }}>
                배송 예정일: {format(new Date(item.delivery_date), 'M월 d일')}
              </Text>
              <Text className="text-primary font-bold" style={{ fontSize: 16 }}>{item.total_price.toLocaleString()}원</Text>
            </View>
            <Text style={{ color: '#6a6a6a', fontSize: 12, marginTop: 8 }}>
              주문일: {format(new Date(item.created_at), 'yyyy.MM.dd')}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={
          <View className="flex-1 items-center gap-3" style={{ paddingTop: 60 }}>
            <ClipboardList size={40} color="#6a6a6a" strokeWidth={1.5} />
            <Text style={{ color: '#6a6a6a', fontSize: 16 }}>주문 내역이 없습니다.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

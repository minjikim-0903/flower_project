import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { orderService } from '@/services/orders';
import { Order, OrderStatus } from '@/types';

const STATUS_STEPS: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered'];

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: '주문 접수',
  confirmed: '주문 확인',
  preparing: '준비 중',
  shipped: '배송 중',
  delivered: '배송 완료',
  cancelled: '취소됨',
};

const STATUS_ICON: Record<OrderStatus, string> = {
  pending: '📋',
  confirmed: '✅',
  preparing: '📦',
  shipped: '🚚',
  delivered: '🎉',
  cancelled: '❌',
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    orderService
      .getOrderById(id)
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = () => {
    if (!order) return;
    if (order.status !== 'pending') {
      Alert.alert('취소 불가', '주문 접수 단계에서만 취소할 수 있습니다.');
      return;
    }
    Alert.alert('주문 취소', '정말 취소하시겠습니까?', [
      { text: '아니오', style: 'cancel' },
      {
        text: '취소하기',
        style: 'destructive',
        onPress: async () => {
          const updated = await orderService.updateOrderStatus(order.id, 'cancelled');
          setOrder({ ...order, status: updated.status });
        },
      },
    ]);
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#FF6B9D" />;
  if (!order) return null;

  const currentStepIdx = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row justify-between items-center p-4 bg-white">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-primary text-base">← 뒤로</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold">주문 상세</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        {/* 배송 진행 단계 */}
        {isCancelled ? (
          <View
            className="rounded-xl p-4 items-center"
            style={{ backgroundColor: '#E7474720' }}
          >
            <Text style={{ color: '#E74747', fontWeight: '700', fontSize: 16 }}>❌ 취소된 주문입니다</Text>
          </View>
        ) : (
          <View className="bg-white rounded-2xl p-4">
            <Text style={{ fontWeight: '700', fontSize: 15, marginBottom: 14 }}>배송 현황</Text>
            <View className="flex-row justify-between items-start">
              {STATUS_STEPS.map((step, idx) => (
                <View key={step} className="flex-1 items-center" style={{ position: 'relative' }}>
                  <View
                    className="justify-center items-center"
                    style={[
                      { width: 36, height: 36, borderRadius: 18, marginBottom: 6 },
                      idx <= currentStepIdx
                        ? { backgroundColor: '#FFF0F5' }
                        : { backgroundColor: '#f0f0f0' },
                    ]}
                  >
                    <Text style={{ fontSize: 16 }}>
                      {idx <= currentStepIdx ? STATUS_ICON[step] : '○'}
                    </Text>
                  </View>
                  {idx < STATUS_STEPS.length - 1 && (
                    <View
                      style={[
                        {
                          position: 'absolute',
                          top: 18,
                          left: '50%',
                          right: '-50%',
                          height: 2,
                          zIndex: -1,
                        },
                        idx < currentStepIdx
                          ? { backgroundColor: '#FF6B9D' }
                          : { backgroundColor: '#f0f0f0' },
                      ]}
                    />
                  )}
                  <Text
                    style={[
                      { fontSize: 10, textAlign: 'center' },
                      idx === currentStepIdx
                        ? { color: '#FF6B9D', fontWeight: '700' }
                        : { color: '#6a6a6a' },
                    ]}
                    numberOfLines={2}
                  >
                    {STATUS_LABEL[step]}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 주문 정보 */}
        <View className="bg-white rounded-2xl p-4">
          <Text style={{ fontWeight: '700', fontSize: 15, marginBottom: 14 }}>주문 정보</Text>
          <Row label="가게" value={order.store?.name ?? '-'} />
          <Row label="주문 유형" value={order.order_type === 'wholesale' ? '🏭 도매' : '🛒 소매'} />
          <Row
            label="주문일"
            value={format(new Date(order.created_at), 'yyyy.MM.dd HH:mm', { locale: ko })}
          />
          <Row
            label="배송 예정일"
            value={format(new Date(order.delivery_date), 'M월 d일 (E)', { locale: ko })}
          />
        </View>

        {/* 배송 정보 */}
        <View className="bg-white rounded-2xl p-4">
          <Text style={{ fontWeight: '700', fontSize: 15, marginBottom: 14 }}>배송 정보</Text>
          <Row label="배송지" value={order.delivery_address} />
          {order.delivery_memo && <Row label="메모" value={order.delivery_memo} />}
        </View>

        {/* 주문 상품 */}
        <View className="bg-white rounded-2xl p-4">
          <Text style={{ fontWeight: '700', fontSize: 15, marginBottom: 14 }}>주문 상품</Text>
          {order.items?.map((item) => (
            <View
              key={item.id}
              className="flex-row justify-between items-center border-b"
              style={{ paddingVertical: 8, borderBottomColor: '#f5f5f5' }}
            >
              <Text className="text-sm flex-1">
                {item.product?.name ?? '상품'}
              </Text>
              <View className="flex-row gap-3 items-center">
                <Text style={{ color: '#6a6a6a', fontSize: 13 }}>{item.quantity}개</Text>
                <Text className="font-semibold text-sm">
                  {(item.unit_price * item.quantity).toLocaleString()}원
                </Text>
              </View>
            </View>
          ))}
          <View className="flex-row justify-between" style={{ paddingTop: 12, marginTop: 4 }}>
            <Text className="font-semibold" style={{ fontSize: 15 }}>합계</Text>
            <Text className="text-primary" style={{ fontWeight: '800', fontSize: 18 }}>{order.total_price.toLocaleString()}원</Text>
          </View>
        </View>

        {/* 취소 버튼 */}
        {order.status === 'pending' && (
          <TouchableOpacity
            className="border rounded-xl p-4 items-center"
            style={{ borderColor: '#E74747' }}
            onPress={handleCancel}
          >
            <Text style={{ color: '#E74747', fontWeight: '600', fontSize: 16 }}>주문 취소</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View
      className="flex-row justify-between border-b"
      style={{ paddingVertical: 8, borderBottomColor: '#f5f5f5' }}
    >
      <Text className="text-sm" style={{ color: '#6a6a6a' }}>{label}</Text>
      <Text className="text-sm font-medium flex-1 text-right">{value}</Text>
    </View>
  );
}

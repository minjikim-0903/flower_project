import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>주문 상세</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        {/* 배송 진행 단계 */}
        {isCancelled ? (
          <View style={styles.cancelledBanner}>
            <Text style={styles.cancelledText}>❌ 취소된 주문입니다</Text>
          </View>
        ) : (
          <View style={styles.stepCard}>
            <Text style={styles.sectionTitle}>배송 현황</Text>
            <View style={styles.stepRow}>
              {STATUS_STEPS.map((step, idx) => (
                <View key={step} style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepCircle,
                      idx <= currentStepIdx && styles.stepCircleActive,
                    ]}
                  >
                    <Text style={styles.stepIcon}>
                      {idx <= currentStepIdx ? STATUS_ICON[step] : '○'}
                    </Text>
                  </View>
                  {idx < STATUS_STEPS.length - 1 && (
                    <View
                      style={[
                        styles.stepLine,
                        idx < currentStepIdx && styles.stepLineActive,
                      ]}
                    />
                  )}
                  <Text
                    style={[
                      styles.stepLabel,
                      idx === currentStepIdx && styles.stepLabelActive,
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
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>주문 정보</Text>
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
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>배송 정보</Text>
          <Row label="배송지" value={order.delivery_address} />
          {order.delivery_memo && <Row label="메모" value={order.delivery_memo} />}
        </View>

        {/* 주문 상품 */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>주문 상품</Text>
          {order.items?.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <Text style={styles.orderItemName}>
                {item.product?.name ?? '상품'}
              </Text>
              <View style={styles.orderItemRight}>
                <Text style={styles.orderItemQty}>{item.quantity}개</Text>
                <Text style={styles.orderItemPrice}>
                  {(item.unit_price * item.quantity).toLocaleString()}원
                </Text>
              </View>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>합계</Text>
            <Text style={styles.totalPrice}>{order.total_price.toLocaleString()}원</Text>
          </View>
        </View>

        {/* 취소 버튼 */}
        {order.status === 'pending' && (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>주문 취소</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  back: { color: '#FF6B9D', fontSize: 16 },
  title: { fontSize: 18, fontWeight: 'bold' },
  cancelledBanner: {
    backgroundColor: '#E7474720',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  cancelledText: { color: '#E74747', fontWeight: '700', fontSize: 16 },
  stepCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: { fontWeight: '700', fontSize: 15, marginBottom: 14 },
  stepRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  stepItem: { flex: 1, alignItems: 'center', position: 'relative' },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepCircleActive: { backgroundColor: '#FFF0F5' },
  stepIcon: { fontSize: 16 },
  stepLine: {
    position: 'absolute',
    top: 18,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: '#f0f0f0',
    zIndex: -1,
  },
  stepLineActive: { backgroundColor: '#FF6B9D' },
  stepLabel: { fontSize: 10, color: '#aaa', textAlign: 'center' },
  stepLabelActive: { color: '#FF6B9D', fontWeight: '700' },
  infoCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  rowLabel: { color: '#888', fontSize: 14 },
  rowValue: { fontSize: 14, fontWeight: '500', flex: 1, textAlign: 'right' },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  orderItemName: { fontSize: 14, flex: 1 },
  orderItemRight: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  orderItemQty: { color: '#888', fontSize: 13 },
  orderItemPrice: { fontWeight: '600', fontSize: 14 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: { fontWeight: '600', fontSize: 15 },
  totalPrice: { fontWeight: '800', fontSize: 18, color: '#FF6B9D' },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#E74747',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: { color: '#E74747', fontWeight: '600', fontSize: 16 },
});

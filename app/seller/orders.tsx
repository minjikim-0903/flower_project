import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>주문 관리</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <View style={styles.orderTop}>
              <Text style={styles.buyerName}>{item.buyer?.name}</Text>
              <Text style={styles.buyerPhone}>{item.buyer?.phone}</Text>
            </View>
            <View style={styles.orderMid}>
              <Text style={styles.orderType}>
                {item.order_type === 'wholesale' ? '🏭 도매' : '🛒 소매'}
              </Text>
              <Text style={styles.orderPrice}>{item.total_price.toLocaleString()}원</Text>
            </View>
            <View style={styles.payoutBox}>
              <View style={styles.payoutRow}>
                <Text style={styles.payoutLabel}>결제 금액</Text>
                <Text style={styles.payoutValue}>{item.total_price.toLocaleString()}원</Text>
              </View>
              <View style={styles.payoutRow}>
                <Text style={styles.payoutLabel}>PG 수수료 (3.5%)</Text>
                <Text style={styles.payoutDeduct}>-{(item.pg_fee_amount ?? Math.round(item.total_price * 0.035)).toLocaleString()}원</Text>
              </View>
              <View style={styles.payoutRow}>
                <Text style={styles.payoutLabel}>플랫폼 수수료 (3.5%)</Text>
                <Text style={styles.payoutDeduct}>-{(item.commission_amount ?? Math.round(item.total_price * 0.035)).toLocaleString()}원</Text>
              </View>
              <View style={[styles.payoutRow, styles.payoutTotal]}>
                <Text style={styles.payoutTotalLabel}>정산 예정액</Text>
                <Text style={styles.payoutTotalValue}>{(item.seller_payout ?? item.total_price - Math.round(item.total_price * 0.07)).toLocaleString()}원</Text>
              </View>
            </View>
            <Text style={styles.deliveryDate}>
              배송 예정: {format(new Date(item.delivery_date), 'M월 d일')}
            </Text>
            <Text style={styles.deliveryAddr}>{item.delivery_address}</Text>
            {item.delivery_memo ? (
              <Text style={styles.memo}>📝 {item.delivery_memo}</Text>
            ) : null}
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: STATUS_COLOR[item.status] + '20' },
                ]}
              >
                <Text style={[styles.statusText, { color: STATUS_COLOR[item.status] }]}>
                  {STATUS_LABEL[item.status]}
                </Text>
              </View>
              {item.status !== 'delivered' && item.status !== 'cancelled' && (
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={() => handleStatusUpdate(item)}
                >
                  <Text style={styles.nextButtonText}>다음 단계 →</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 40 }}>📦</Text>
            <Text style={styles.emptyText}>주문이 없습니다.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  title: { fontSize: 22, fontWeight: 'bold', padding: 20, backgroundColor: '#fff' },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  buyerName: { fontWeight: '700', fontSize: 16 },
  buyerPhone: { color: '#888' },
  orderMid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  orderType: { color: '#555' },
  orderPrice: { fontWeight: '700', color: '#2ECC71', fontSize: 16 },
  payoutBox: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    gap: 4,
  },
  payoutRow: { flexDirection: 'row', justifyContent: 'space-between' },
  payoutLabel: { fontSize: 13, color: '#888' },
  payoutValue: { fontSize: 13, color: '#555' },
  payoutDeduct: { fontSize: 13, color: '#E74C3C' },
  payoutTotal: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 6,
    paddingTop: 6,
  },
  payoutTotalLabel: { fontSize: 14, fontWeight: '700', color: '#333' },
  payoutTotalValue: { fontSize: 14, fontWeight: '700', color: '#2ECC71' },
  deliveryDate: { color: '#555', fontSize: 14, marginBottom: 2 },
  deliveryAddr: { color: '#888', fontSize: 13 },
  memo: { color: '#888', fontSize: 13, marginTop: 4 },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 13, fontWeight: '600' },
  nextButton: { backgroundColor: '#2ECC7120', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 },
  nextButtonText: { color: '#2ECC71', fontWeight: '600' },
  emptyContainer: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { color: '#aaa', fontSize: 16 },
});

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { orderService } from '@/services/orders';
import { OrderType } from '@/types';

export default function CheckoutScreen() {
  const { isWholesale } = useLocalSearchParams<{ isWholesale: string }>();
  const { profile } = useAuthStore();
  const { items, storeId, getTotalPrice, clearCart } = useCartStore();

  const orderType: OrderType = isWholesale === '1' ? 'wholesale' : 'retail';
  const totalPrice = getTotalPrice(orderType === 'wholesale');

  const [deliveryAddress, setDeliveryAddress] = useState(profile?.address || '');
  const [deliveryMemo, setDeliveryMemo] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(
    format(addDays(new Date(), 1), 'yyyy-MM-dd')
  );
  const [loading, setLoading] = useState(false);

  // 다음 7일간 배송 가능 날짜
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(), i + 1);
    return {
      value: format(date, 'yyyy-MM-dd'),
      label: format(date, 'M/d (E)', { locale: ko }),
    };
  });

  const handleOrder = async () => {
    if (!deliveryAddress.trim()) {
      Alert.alert('알림', '배송 주소를 입력해주세요.');
      return;
    }
    if (!profile || !storeId) return;

    setLoading(true);
    try {
      await orderService.createOrder({
        buyerId: profile.id,
        storeId,
        items,
        orderType,
        deliveryDate: selectedDate,
        deliveryAddress,
        deliveryMemo,
      });
      clearCart();
      Alert.alert('주문 완료', '주문이 성공적으로 접수되었습니다.', [
        { text: '확인', onPress: () => router.replace('/users/orders') },
      ]);
    } catch {
      Alert.alert('오류', '주문 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>주문서 작성</Text>
        <View />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>주문 유형</Text>
          <View style={[styles.badge, { backgroundColor: orderType === 'wholesale' ? '#FF6B9D20' : '#6B9DFF20' }]}>
            <Text style={{ color: orderType === 'wholesale' ? '#FF6B9D' : '#6B9DFF', fontWeight: '600' }}>
              {orderType === 'wholesale' ? '🏭 도매 주문' : '🛒 소매 주문'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>배송 날짜 선택</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.dateRow}>
              {availableDates.map((d) => (
                <TouchableOpacity
                  key={d.value}
                  style={[styles.dateChip, selectedDate === d.value && styles.dateChipActive]}
                  onPress={() => setSelectedDate(d.value)}
                >
                  <Text style={[styles.dateText, selectedDate === d.value && styles.dateTextActive]}>
                    {d.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>배송 주소</Text>
          <TextInput
            style={styles.input}
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            placeholder="배송받을 주소를 입력해주세요"
            multiline
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>배송 메모 (선택)</Text>
          <TextInput
            style={styles.input}
            value={deliveryMemo}
            onChangeText={setDeliveryMemo}
            placeholder="예: 경비실에 맡겨주세요"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>주문 상품 ({items.length}개)</Text>
          {items.map((item) => {
            const price = orderType === 'wholesale' ? item.product.wholesale_price : item.product.retail_price;
            return (
              <View key={item.product.id} style={styles.orderItem}>
                <Text style={styles.orderItemName}>{item.product.name}</Text>
                <Text style={styles.orderItemPrice}>
                  {item.quantity}{item.product.unit} × {price.toLocaleString()}원
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>총 결제금액</Text>
          <Text style={styles.totalPrice}>{totalPrice.toLocaleString()}원</Text>
        </View>
        <TouchableOpacity
          style={[styles.orderButton, loading && styles.orderButtonDisabled]}
          onPress={handleOrder}
          disabled={loading}
        >
          <Text style={styles.orderButtonText}>
            {loading ? '처리 중...' : `${totalPrice.toLocaleString()}원 결제하기`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  back: { color: '#FF6B9D', fontSize: 16 },
  title: { fontSize: 18, fontWeight: 'bold' },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  sectionTitle: { fontWeight: '600', fontSize: 16, marginBottom: 12 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start' },
  dateRow: { flexDirection: 'row', gap: 8 },
  dateChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  dateChipActive: { borderColor: '#FF6B9D', backgroundColor: '#FF6B9D' },
  dateText: { color: '#555' },
  dateTextActive: { color: '#fff', fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    minHeight: 44,
  },
  orderItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  orderItemName: { fontSize: 15 },
  orderItemPrice: { color: '#666' },
  footer: { backgroundColor: '#fff', padding: 20, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  totalLabel: { fontSize: 16, color: '#666' },
  totalPrice: { fontSize: 20, fontWeight: 'bold', color: '#FF6B9D' },
  orderButton: { backgroundColor: '#FF6B9D', borderRadius: 12, padding: 16, alignItems: 'center' },
  orderButtonDisabled: { opacity: 0.6 },
  orderButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

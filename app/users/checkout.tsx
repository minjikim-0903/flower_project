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
import { OrderType } from '@/types';

export default function CheckoutScreen() {
  const { isWholesale } = useLocalSearchParams<{ isWholesale: string }>();
  const { profile } = useAuthStore();
  const { items, storeId, getTotalPrice } = useCartStore();

  const orderType: OrderType = isWholesale === '1' ? 'wholesale' : 'retail';
  const totalPrice = getTotalPrice(orderType === 'wholesale');

  const [deliveryAddress, setDeliveryAddress] = useState(profile?.address || '');
  const [deliveryMemo, setDeliveryMemo] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(
    format(addDays(new Date(), 1), 'yyyy-MM-dd')
  );

  // 다음 7일간 배송 가능 날짜
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(), i + 1);
    return {
      value: format(date, 'yyyy-MM-dd'),
      label: format(date, 'M/d (E)', { locale: ko }),
    };
  });

  const notify = (msg: string) => {
    if (Platform.OS === 'web') window.alert(msg);
    else Alert.alert('알림', msg);
  };

  const handleOrder = () => {
    if (!deliveryAddress.trim()) {
      notify('배송 주소를 입력해주세요.');
      return;
    }
    if (!profile) {
      notify('로그인이 필요합니다.');
      return;
    }
    if (!storeId || items.length === 0) {
      notify('장바구니가 비어있습니다.');
      return;
    }

    router.push({
      pathname: '/users/payment',
      params: {
        totalPrice: String(totalPrice),
        orderType,
        deliveryDate: selectedDate,
        deliveryAddress,
        deliveryMemo,
      },
    });
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
        <View style={styles.feeBreakdown}>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>상품 합계</Text>
            <Text style={styles.feeValue}>{totalPrice.toLocaleString()}원</Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>PG·플랫폼 수수료</Text>
            <Text style={styles.feeNote}>판매자 부담</Text>
          </View>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>총 결제금액</Text>
          <Text style={styles.totalPrice}>{totalPrice.toLocaleString()}원</Text>
        </View>
        <TouchableOpacity
          style={styles.orderButton}
          onPress={handleOrder}
        >
          <Text style={styles.orderButtonText}>
            {totalPrice.toLocaleString()}원 결제하기
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
  feeBreakdown: { marginBottom: 10, gap: 4 },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  feeLabel: { fontSize: 13, color: '#888' },
  feeValue: { fontSize: 13, color: '#555' },
  feeNote: { fontSize: 13, color: '#aaa' },
  orderButton: { backgroundColor: '#FF6B9D', borderRadius: 12, padding: 16, alignItems: 'center' },
  orderButtonDisabled: { opacity: 0.6 },
  orderButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

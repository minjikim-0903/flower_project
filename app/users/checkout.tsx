import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import { ChevronLeft, MapPin } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { OrderType } from '@/types';

const PAYS = [
  { id: 'toss',  label: '토스페이',    sub: '계좌·카드 1초' },
  { id: 'card',  label: '신용/체크카드' },
  { id: 'naver', label: '네이버페이' },
  { id: 'kakao', label: '카카오페이' },
  { id: 'phone', label: '휴대폰 결제' },
];

export default function CheckoutScreen() {
  const { isWholesale } = useLocalSearchParams<{ isWholesale: string }>();
  const { profile } = useAuthStore();
  const { items, storeId, getTotalPrice } = useCartStore();

  const orderType: OrderType = isWholesale === '1' ? 'wholesale' : 'retail';
  const subtotal = getTotalPrice(orderType === 'wholesale');
  const shipping = subtotal >= 30000 ? 0 : 3000;
  const total = 100; // TODO: 테스트용 고정값 — 실사용 전 `subtotal + shipping` 으로 원복

  const [deliveryAddress, setDeliveryAddress] = useState(profile?.address || '');
  const [deliveryMemo, setDeliveryMemo] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(
    format(addDays(new Date(), 1), 'yyyy-MM-dd')
  );
  const [selectedPay, setSelectedPay] = useState('toss');
  const [editingAddress, setEditingAddress] = useState(false);

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
        totalPrice: String(total),
        orderType,
        deliveryDate: selectedDate,
        deliveryAddress,
        deliveryMemo,
      },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAF7F5' }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, backgroundColor: '#FAF7F5',
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 36, height: 36, marginLeft: -8, alignItems: 'center', justifyContent: 'center' }}
        >
          <ChevronLeft size={24} color="#0F0F12" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '800', letterSpacing: -0.6, color: '#0F0F12' }}>
          주문 / 결제
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 받는 사람 */}
        <View style={{ padding: 16, paddingBottom: 0 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 14, padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 12, color: '#7A7077', fontWeight: '600' }}>받는 사람</Text>
              <TouchableOpacity onPress={() => setEditingAddress(e => !e)}>
                <Text style={{ fontSize: 12, color: '#FF3D6C', fontWeight: '700' }}>
                  {editingAddress ? '완료' : '변경'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 15, fontWeight: '700', marginBottom: 4, color: '#0F0F12' }}>
              {profile?.name ?? '이름 없음'}{profile?.phone ? ` · ${profile.phone}` : ''}
            </Text>
            {editingAddress ? (
              <TextInput
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
                placeholder="배송받을 주소를 입력해주세요"
                multiline
                style={{
                  borderWidth: 1, borderColor: '#E2DCD6', borderRadius: 10,
                  padding: 12, fontSize: 13, color: '#0F0F12', minHeight: 44,
                  backgroundColor: '#fff',
                }}
              />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 4 }}>
                <MapPin size={14} color="#7A7077" strokeWidth={1.8} style={{ marginTop: 1 }} />
                <Text style={{ fontSize: 13, color: '#7A7077', flex: 1, lineHeight: 18 }}>
                  {deliveryAddress || '배송 주소를 입력해주세요'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* 주문 유형 + 배송 날짜 */}
        <View style={{ padding: 16, paddingBottom: 0 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 14, padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <View style={{
                paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999,
                backgroundColor: orderType === 'wholesale' ? '#FFF1F4' : '#F0F4FF',
              }}>
                <Text style={{
                  fontSize: 12, fontWeight: '700',
                  color: orderType === 'wholesale' ? '#FF3D6C' : '#6B9DFF',
                }}>
                  {orderType === 'wholesale' ? '도매 주문' : '소매 주문'}
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F0F12', marginBottom: 10 }}>배송 날짜</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {availableDates.map((d) => (
                  <TouchableOpacity
                    key={d.value}
                    onPress={() => setSelectedDate(d.value)}
                    style={{
                      paddingHorizontal: 14, paddingVertical: 8, borderRadius: 9999,
                      backgroundColor: selectedDate === d.value ? '#0F0F12' : '#fff',
                      borderWidth: 1,
                      borderColor: selectedDate === d.value ? '#0F0F12' : '#E2DCD6',
                    }}
                  >
                    <Text style={{
                      fontSize: 13,
                      fontWeight: selectedDate === d.value ? '700' : '400',
                      color: selectedDate === d.value ? '#fff' : '#7A7077',
                    }}>
                      {d.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>

        {/* 주문 상품 */}
        <View style={{ padding: 16, paddingBottom: 0 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 14, padding: 16 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F0F12', marginBottom: 10 }}>
              주문 상품 {items.length}개
            </Text>
            {items.map((item) => {
              const price = orderType === 'wholesale' ? item.product.wholesale_price : item.product.retail_price;
              return (
                <View
                  key={item.product.id}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 }}
                >
                  <View style={{
                    width: 48, height: 48, borderRadius: 10,
                    backgroundColor: '#EFEAE5', flexShrink: 0,
                  }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: 13, fontWeight: '600', color: '#0F0F12',
                      letterSpacing: -0.3, lineHeight: 18,
                    }} numberOfLines={1}>
                      {item.product.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#7A7077', marginTop: 2 }}>
                      {price.toLocaleString()}원 · {item.quantity}{item.product.unit}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F0F12' }}>
                    {(price * item.quantity).toLocaleString()}원
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* 배송 메모 */}
        <View style={{ padding: 16, paddingBottom: 0 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 14, padding: 16 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F0F12', marginBottom: 10 }}>배송 메모</Text>
            <TextInput
              value={deliveryMemo}
              onChangeText={setDeliveryMemo}
              placeholder="요청사항을 입력하세요"
              placeholderTextColor="#A8A0A6"
              style={{
                width: '100%', height: 40, borderWidth: 1, borderColor: '#E2DCD6',
                borderRadius: 10, paddingHorizontal: 12, fontSize: 13, color: '#0F0F12',
                backgroundColor: '#fff',
              }}
            />
          </View>
        </View>

        {/* 결제 수단 */}
        <View style={{ padding: 16, paddingBottom: 0 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 14, padding: 16 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F0F12', marginBottom: 10 }}>결제 수단</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {PAYS.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => setSelectedPay(p.id)}
                  style={{
                    width: '48%', padding: 12, borderRadius: 12, alignItems: 'flex-start',
                    backgroundColor: selectedPay === p.id ? '#0F0F12' : 'transparent',
                    borderWidth: 1,
                    borderColor: selectedPay === p.id ? '#0F0F12' : '#E2DCD6',
                  }}
                >
                  <Text style={{
                    fontSize: 13, fontWeight: '700',
                    color: selectedPay === p.id ? '#fff' : '#1F1F24',
                  }}>
                    {p.label}
                  </Text>
                  {p.sub && (
                    <Text style={{
                      fontSize: 11, marginTop: 2,
                      color: selectedPay === p.id ? 'rgba(255,255,255,0.65)' : '#7A7077',
                    }}>
                      {p.sub}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* 결제 금액 */}
        <View style={{ padding: 16 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 14, padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ fontSize: 13, color: '#7A7077' }}>상품금액</Text>
              <Text style={{ fontSize: 13, color: '#0F0F12' }}>{subtotal.toLocaleString()}원</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ fontSize: 13, color: '#7A7077' }}>배송비</Text>
              <Text style={{ fontSize: 13, color: '#0F0F12' }}>
                {shipping === 0 ? '무료' : `${shipping.toLocaleString()}원`}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ fontSize: 13, color: '#7A7077' }}>PG·플랫폼 수수료</Text>
              <Text style={{ fontSize: 13, color: '#7A7077' }}>판매자 부담</Text>
            </View>
            <View style={{ height: 1, backgroundColor: '#ECE7E2', marginVertical: 8 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F0F12' }}>총 결제</Text>
              <Text style={{ fontSize: 22, fontWeight: '800', letterSpacing: -0.5, color: '#FF3D6C' }}>
                {total.toLocaleString()}원
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 하단 CTA */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingHorizontal: 16, paddingTop: 10, paddingBottom: 28,
        backgroundColor: 'rgba(255,255,255,0.96)',
        borderTopWidth: 1, borderTopColor: '#ECE7E2',
      }}>
        <TouchableOpacity
          onPress={handleOrder}
          style={{
            backgroundColor: '#FF3D6C', borderRadius: 12,
            height: 52, alignItems: 'center', justifyContent: 'center',
          }}
          activeOpacity={0.85}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
            {total.toLocaleString()}원 결제하기
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

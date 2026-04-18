import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Input, InputField } from '@gluestack-ui/themed';
import { Button, ButtonText } from '@gluestack-ui/themed';
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
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row justify-between items-center p-4 bg-white">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-primary text-base">← 뒤로</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold">주문서 작성</Text>
        <View />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View className="bg-white rounded-2xl p-4">
          <Text className="font-semibold text-base mb-3">주문 유형</Text>
          <View
            className="rounded-lg self-start"
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: orderType === 'wholesale' ? '#FF6B9D20' : '#6B9DFF20',
            }}
          >
            <Text style={{ color: orderType === 'wholesale' ? '#FF6B9D' : '#6B9DFF', fontWeight: '600' }}>
              {orderType === 'wholesale' ? '도매 주문' : '소매 주문'}
            </Text>
          </View>
        </View>

        <View className="bg-white rounded-2xl p-4">
          <Text className="font-semibold text-base mb-3">배송 날짜 선택</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {availableDates.map((d) => (
                <TouchableOpacity
                  key={d.value}
                  className="border"
                  style={[
                    { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
                    selectedDate === d.value
                      ? { borderColor: '#FF6B9D', backgroundColor: '#FF6B9D' }
                      : { borderColor: '#f0f0f0', backgroundColor: '#fff' },
                  ]}
                  onPress={() => setSelectedDate(d.value)}
                >
                  <Text
                    style={{
                      color: selectedDate === d.value ? '#fff' : '#6a6a6a',
                      fontWeight: selectedDate === d.value ? '600' : undefined,
                    }}
                  >
                    {d.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View className="bg-white rounded-2xl p-4">
          <Text className="font-semibold text-base mb-3">배송 주소</Text>
          <Input
            variant="outline"
            style={{ borderRadius: 12, borderColor: '#f0f0f0', backgroundColor: '#fff' }}
          >
            <InputField
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              placeholder="배송받을 주소를 입력해주세요"
              multiline
              style={{ padding: 12, fontSize: 15, minHeight: 44 }}
            />
          </Input>
        </View>

        <View className="bg-white rounded-2xl p-4">
          <Text className="font-semibold text-base mb-3">배송 메모 (선택)</Text>
          <Input
            variant="outline"
            style={{ borderRadius: 12, borderColor: '#f0f0f0', backgroundColor: '#fff' }}
          >
            <InputField
              value={deliveryMemo}
              onChangeText={setDeliveryMemo}
              placeholder="예: 경비실에 맡겨주세요"
              style={{ padding: 12, fontSize: 15, minHeight: 44 }}
            />
          </Input>
        </View>

        <View className="bg-white rounded-2xl p-4">
          <Text className="font-semibold text-base mb-3">주문 상품 ({items.length}개)</Text>
          {items.map((item) => {
            const price = orderType === 'wholesale' ? item.product.wholesale_price : item.product.retail_price;
            return (
              <View key={item.product.id} className="flex-row justify-between" style={{ paddingVertical: 6 }}>
                <Text style={{ fontSize: 15 }}>{item.product.name}</Text>
                <Text style={{ color: '#6a6a6a' }}>
                  {item.quantity}{item.product.unit} × {price.toLocaleString()}원
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View className="bg-white p-5 border-t border-border">
        <View style={{ marginBottom: 10, gap: 4 }}>
          <View className="flex-row justify-between">
            <Text style={{ fontSize: 13, color: '#6a6a6a' }}>상품 합계</Text>
            <Text style={{ fontSize: 13, color: '#6a6a6a' }}>{totalPrice.toLocaleString()}원</Text>
          </View>
          <View className="flex-row justify-between">
            <Text style={{ fontSize: 13, color: '#6a6a6a' }}>PG·플랫폼 수수료</Text>
            <Text style={{ fontSize: 13, color: '#6a6a6a' }}>판매자 부담</Text>
          </View>
        </View>
        <View className="flex-row justify-between mb-3">
          <Text className="text-base" style={{ color: '#6a6a6a' }}>총 결제금액</Text>
          <Text className="text-primary font-bold" style={{ fontSize: 20 }}>{totalPrice.toLocaleString()}원</Text>
        </View>
        <Button
          onPress={handleOrder}
          style={{ backgroundColor: '#FF6B9D', borderRadius: 12, height: 52 }}
        >
          <ButtonText style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
            {totalPrice.toLocaleString()}원 결제하기
          </ButtonText>
        </Button>
      </View>
    </SafeAreaView>
  );
}

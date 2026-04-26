import { useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, ShoppingBag } from 'lucide-react-native';

export default function OrderCompleteScreen() {
  const { totalPrice } = useLocalSearchParams<{ totalPrice: string }>();
  const total = parseInt(totalPrice || '0');

  const orderNum = useRef(`B26${Math.floor(Math.random() * 9000 + 1000)}`).current;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAF7F5' }}>
      <View style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingBottom: 40,
      }}>
        {/* 체크 아이콘 원 */}
        <View style={{
          width: 84,
          height: 84,
          borderRadius: 9999,
          backgroundColor: '#FF3D6C',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 22,
        }}>
          <Check size={40} color="#fff" strokeWidth={3} />
        </View>

        {/* 타이틀 */}
        <Text style={{
          fontSize: 24,
          fontWeight: '800',
          letterSpacing: -0.7,
          color: '#0F0F12',
          textAlign: 'center',
          marginBottom: 8,
        }}>
          주문이 완료됐어요
        </Text>

        {/* 서브타이틀 */}
        <Text style={{
          fontSize: 14,
          color: '#7A7077',
          textAlign: 'center',
          lineHeight: 21,
          marginBottom: 28,
        }}>
          곧 신선한 꽃이 도착할 거예요.{'\n'}주문 내역에서 배송 상황을 확인하세요.
        </Text>

        {/* 주문 정보 카드 */}
        <View style={{
          width: '100%',
          maxWidth: 320,
          backgroundColor: '#fff',
          borderRadius: 14,
          padding: 18,
          marginBottom: 28,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ fontSize: 13, color: '#7A7077' }}>주문번호</Text>
            <Text style={{ fontSize: 13, color: '#7A7077', fontWeight: '500' }}>{orderNum}</Text>
          </View>
          <View style={{ height: 1, backgroundColor: '#ECE7E2', marginBottom: 10 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F0F12' }}>결제금액</Text>
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#FF3D6C', letterSpacing: -0.5 }}>
              {total.toLocaleString()}원
            </Text>
          </View>
        </View>

        {/* 버튼 */}
        <View style={{ flexDirection: 'row', gap: 8, width: '100%', maxWidth: 320 }}>
          <TouchableOpacity
            onPress={() => router.replace('/users/home')}
            style={{
              flex: 1,
              height: 50,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: '#E2DCD6',
              backgroundColor: '#fff',
            }}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#0F0F12' }}>홈으로</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace('/users/orders')}
            style={{
              flex: 1,
              height: 50,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              backgroundColor: '#FF3D6C',
              flexDirection: 'row',
              gap: 6,
            }}
            activeOpacity={0.85}
          >
            <ShoppingBag size={16} color="#fff" strokeWidth={2} />
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>주문 내역</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

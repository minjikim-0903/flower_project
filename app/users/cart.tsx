import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Button, ButtonText } from '@gluestack-ui/themed';
import { ShoppingCart } from 'lucide-react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCartStore } from '@/store/useCartStore';

export default function CartScreen() {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore();
  const [isWholesale, setIsWholesale] = useState(false);

  const totalPrice = getTotalPrice(isWholesale);

  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert('알림', '장바구니가 비어있습니다.');
      return;
    }
    router.push({
      pathname: '/users/checkout',
      params: { isWholesale: isWholesale ? '1' : '0' },
    });
  };

  if (items.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <Text className="text-2xl font-bold" style={{ padding: 20, backgroundColor: '#fff' }}>장바구니</Text>
        <View className="flex-1 justify-center items-center gap-3">
          <ShoppingCart size={50} color="#FF6B9D" strokeWidth={1.5} />
          <Text className="text-base" style={{ color: '#6a6a6a' }}>장바구니가 비어있어요</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row justify-between items-center p-5 bg-white">
        <Text className="text-2xl font-bold">장바구니</Text>
        <TouchableOpacity onPress={() => Alert.alert('확인', '장바구니를 비울까요?', [
          { text: '취소', style: 'cancel' },
          { text: '비우기', onPress: clearCart, style: 'destructive' },
        ])}>
          <Text className="text-primary">전체 삭제</Text>
        </TouchableOpacity>
      </View>

      <View
        className="flex-row items-center rounded-xl mx-3"
        style={{ gap: 10, padding: 14, backgroundColor: '#FFF0F5' }}
      >
        <Text className="font-semibold">도매 주문</Text>
        <Switch
          value={isWholesale}
          onValueChange={setIsWholesale}
          trackColor={{ true: '#FF6B9D' }}
        />
        <Text style={{ color: '#6a6a6a', fontSize: 13 }}>
          {isWholesale ? '도매가 적용' : '소매가 적용'}
        </Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.product.id}
        renderItem={({ item }) => {
          const price = isWholesale ? item.product.wholesale_price : item.product.retail_price;
          return (
            <View
              className="flex-row items-center bg-white rounded-xl mb-2 gap-2"
              style={{ padding: 14 }}
            >
              <View className="flex-1">
                <Text className="font-semibold" style={{ fontSize: 15 }}>{item.product.name}</Text>
                <Text style={{ color: '#6a6a6a', fontSize: 13, marginTop: 2 }}>
                  {price.toLocaleString()}원 / {item.product.unit}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <TouchableOpacity
                  className="border items-center justify-center"
                  style={{ width: 28, height: 28, borderRadius: 14, borderColor: '#f0f0f0' }}
                  onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                >
                  <Text className="text-base font-semibold">-</Text>
                </TouchableOpacity>
                <Text className="text-base font-semibold" style={{ minWidth: 24, textAlign: 'center' }}>{item.quantity}</Text>
                <TouchableOpacity
                  className="border items-center justify-center"
                  style={{ width: 28, height: 28, borderRadius: 14, borderColor: '#f0f0f0' }}
                  onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                >
                  <Text className="text-base font-semibold">+</Text>
                </TouchableOpacity>
              </View>
              <Text className="text-primary font-bold" style={{ minWidth: 70, textAlign: 'right' }}>
                {(price * item.quantity).toLocaleString()}원
              </Text>
              <TouchableOpacity onPress={() => removeItem(item.product.id)}>
                <Text className="text-primary">✕</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        contentContainerStyle={{ padding: 16 }}
      />

      <View className="bg-white p-5 border-t border-border">
        <View className="flex-row justify-between mb-3">
          <Text className="text-base" style={{ color: '#6a6a6a' }}>합계</Text>
          <Text className="text-primary font-bold" style={{ fontSize: 20 }}>{totalPrice.toLocaleString()}원</Text>
        </View>
        <Button
          onPress={handleCheckout}
          style={{ backgroundColor: '#FF6B9D', borderRadius: 12, minHeight: 52 }}
        >
          <ButtonText style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>주문하기</ButtonText>
        </Button>
      </View>
    </SafeAreaView>
  );
}

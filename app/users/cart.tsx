import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { ShoppingCart, Check, Minus, Plus } from 'lucide-react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCartStore } from '@/store/useCartStore';

export default function CartScreen() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const [isWholesale, setIsWholesale] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(items.map((i) => i.product.id))
  );

  const toggle = (id: string) => {
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const selectedItems = items.filter((i) => selected.has(i.product.id));

  const subtotal = selectedItems.reduce((s, i) => {
    const price = isWholesale ? i.product.wholesale_price : i.product.retail_price;
    return s + price * i.quantity;
  }, 0);
  const shipping = subtotal === 0 ? 0 : subtotal >= 30000 ? 0 : 3000;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      Alert.alert('알림', '주문할 상품을 선택해주세요.');
      return;
    }
    router.push({
      pathname: '/users/checkout',
      params: { isWholesale: isWholesale ? '1' : '0' },
    });
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FAF7F5' }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 }}>
          <Text style={{ fontSize: 26, fontWeight: '800', letterSpacing: -0.5, color: '#0F0F12' }}>
            장바구니
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{
            width: 88, height: 88, borderRadius: 44,
            backgroundColor: '#FFF1F4',
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
          }}>
            <ShoppingCart size={32} color="#FF3D6C" strokeWidth={1.8} />
          </View>
          <Text style={{ fontSize: 17, fontWeight: '700', color: '#0F0F12', marginBottom: 6 }}>
            아직 담은 꽃이 없어요
          </Text>
          <Text style={{ fontSize: 13, color: '#7A7077' }}>
            마음에 드는 꽃을 담아보세요
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAF7F5' }}>
      {/* 헤더 */}
      <View style={{
        paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Text style={{ fontSize: 26, fontWeight: '800', letterSpacing: -0.5, color: '#0F0F12' }}>
          장바구니{' '}
          <Text style={{ color: '#FF3D6C' }}>{items.length}</Text>
        </Text>
        <TouchableOpacity onPress={() => Alert.alert('확인', '장바구니를 비울까요?', [
          { text: '취소', style: 'cancel' },
          { text: '비우기', onPress: clearCart, style: 'destructive' },
        ])}>
          <Text style={{ fontSize: 13, color: '#7A7077' }}>전체 삭제</Text>
        </TouchableOpacity>
      </View>

      {/* 도매/소매 토글 */}
      <View style={{
        marginHorizontal: 16, marginBottom: 12, padding: 14,
        backgroundColor: '#FFF1F4', borderRadius: 12,
        flexDirection: 'row', alignItems: 'center', gap: 10,
      }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#0F0F12' }}>도매 주문</Text>
        <TouchableOpacity
          onPress={() => setIsWholesale((v) => !v)}
          style={{
            width: 44, height: 26, borderRadius: 13,
            backgroundColor: isWholesale ? '#FF3D6C' : '#ECE7E2',
            justifyContent: 'center', paddingHorizontal: 3,
          }}
        >
          <View style={{
            width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff',
            alignSelf: isWholesale ? 'flex-end' : 'flex-start',
            shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 2,
            shadowOffset: { width: 0, height: 1 },
          }} />
        </TouchableOpacity>
        <Text style={{ fontSize: 13, color: '#7A7077' }}>
          {isWholesale ? '도매가 적용' : '소매가 적용'}
        </Text>
      </View>

      {/* 상품 목록 */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.product.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12, gap: 10 }}
        renderItem={({ item }) => {
          const price = isWholesale ? item.product.wholesale_price : item.product.retail_price;
          const isSelected = selected.has(item.product.id);
          return (
            <View style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 12,
              flexDirection: 'row',
              gap: 12,
              alignItems: 'flex-start',
              shadowColor: '#000',
              shadowOpacity: 0.06,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
            }}>
              {/* 체크박스 */}
              <TouchableOpacity
                onPress={() => toggle(item.product.id)}
                style={{
                  width: 22, height: 22, borderRadius: 11, marginTop: 6, flexShrink: 0,
                  backgroundColor: isSelected ? '#0F0F12' : 'transparent',
                  borderWidth: isSelected ? 0 : 1.5,
                  borderColor: '#E2DCD6',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                {isSelected && <Check size={13} color="#fff" strokeWidth={2.5} />}
              </TouchableOpacity>

              {/* 상품 이미지 */}
              <View style={{
                width: 72, height: 72, borderRadius: 12,
                overflow: 'hidden', backgroundColor: '#ECE7E2', flexShrink: 0,
              }}>
                {item.product.image_url ? (
                  <Image
                    source={{ uri: item.product.image_url }}
                    style={{ width: 72, height: 72 }}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 28 }}>🌸</Text>
                  </View>
                )}
              </View>

              {/* 상품 정보 */}
              <View style={{ flex: 1, minWidth: 0 }}>
                {item.product.store?.name && (
                  <Text style={{ fontSize: 12, color: '#7A7077' }}>
                    {item.product.store.name}
                  </Text>
                )}
                <Text
                  numberOfLines={1}
                  style={{ fontSize: 13, fontWeight: '600', color: '#0F0F12', letterSpacing: -0.3, marginTop: 2 }}
                >
                  {item.product.name}
                </Text>
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#0F0F12', marginTop: 6 }}>
                  {(price * item.quantity).toLocaleString()}원
                </Text>

                {/* 수량 + 삭제 */}
                <View style={{
                  flexDirection: 'row', alignItems: 'center',
                  justifyContent: 'space-between', marginTop: 8,
                }}>
                  <View style={{
                    flexDirection: 'row', alignItems: 'center',
                    height: 28, borderRadius: 8,
                    borderWidth: 1, borderColor: '#ECE7E2',
                  }}>
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                      style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Minus size={12} color="#0F0F12" strokeWidth={2} />
                    </TouchableOpacity>
                    <Text style={{
                      minWidth: 20, textAlign: 'center',
                      fontSize: 12, fontWeight: '700', color: '#0F0F12',
                    }}>
                      {item.quantity}
                    </Text>
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                      style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Plus size={12} color="#0F0F12" strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={() => removeItem(item.product.id)}>
                    <Text style={{ fontSize: 12, color: '#7A7077' }}>삭제</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />

      {/* 하단 결제 패널 */}
      <View style={{
        marginHorizontal: 16, marginBottom: 12, padding: 16,
        backgroundColor: '#FFFFFF', borderRadius: 16,
        shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16,
        shadowOffset: { width: 0, height: -4 }, elevation: 8,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={{ fontSize: 12, color: '#7A7077' }}>상품금액</Text>
          <Text style={{ fontSize: 12, color: '#7A7077' }}>{subtotal.toLocaleString()}원</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <Text style={{ fontSize: 12, color: '#7A7077' }}>배송비</Text>
          <Text style={{ fontSize: 12, color: '#7A7077' }}>
            {shipping === 0 ? '무료' : `${shipping.toLocaleString()}원`}
          </Text>
        </View>
        <View style={{ height: 1, backgroundColor: '#ECE7E2', marginBottom: 10 }} />
        <View style={{
          flexDirection: 'row', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 12,
        }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F0F12' }}>총 결제금액</Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F0F12', letterSpacing: -0.4 }}>
            {total.toLocaleString()}원
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleCheckout}
          disabled={selectedItems.length === 0}
          style={{
            backgroundColor: selectedItems.length === 0 ? '#FFAABB' : '#FF3D6C',
            borderRadius: 12, height: 52,
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
            {selectedItems.length > 0
              ? `${selectedItems.length}개 상품 주문하기`
              : '상품을 선택해주세요'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
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
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>장바구니</Text>
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 50 }}>🛒</Text>
          <Text style={styles.emptyText}>장바구니가 비어있어요</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>장바구니</Text>
        <TouchableOpacity onPress={() => Alert.alert('확인', '장바구니를 비울까요?', [
          { text: '취소', style: 'cancel' },
          { text: '비우기', onPress: clearCart, style: 'destructive' },
        ])}>
          <Text style={styles.clearText}>전체 삭제</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.wholesaleToggle}>
        <Text style={styles.wholesaleLabel}>도매 주문</Text>
        <Switch
          value={isWholesale}
          onValueChange={setIsWholesale}
          trackColor={{ true: '#FF6B9D' }}
        />
        <Text style={styles.wholesaleHint}>
          {isWholesale ? '도매가 적용' : '소매가 적용'}
        </Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.product.id}
        renderItem={({ item }) => {
          const price = isWholesale ? item.product.wholesale_price : item.product.retail_price;
          return (
            <View style={styles.cartItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.product.name}</Text>
                <Text style={styles.itemPrice}>
                  {price.toLocaleString()}원 / {item.product.unit}
                </Text>
              </View>
              <View style={styles.quantityControl}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                >
                  <Text style={styles.qtyBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantity}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.itemTotal}>
                {(price * item.quantity).toLocaleString()}원
              </Text>
              <TouchableOpacity onPress={() => removeItem(item.product.id)}>
                <Text style={{ color: '#FF6B9D' }}>✕</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        contentContainerStyle={{ padding: 16 }}
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>합계</Text>
          <Text style={styles.totalPrice}>{totalPrice.toLocaleString()}원</Text>
        </View>
        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
          <Text style={styles.checkoutText}>주문하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold' },
  clearText: { color: '#FF6B9D' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 16, color: '#aaa' },
  wholesaleToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    backgroundColor: '#FFF0F5',
    margin: 12,
    borderRadius: 12,
  },
  wholesaleLabel: { fontWeight: '600' },
  wholesaleHint: { color: '#888', fontSize: 13 },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    gap: 8,
  },
  itemInfo: { flex: 1 },
  itemName: { fontWeight: '600', fontSize: 15 },
  itemPrice: { color: '#888', fontSize: 13, marginTop: 2 },
  quantityControl: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: { fontSize: 16, fontWeight: '600' },
  quantity: { fontSize: 16, fontWeight: '600', minWidth: 24, textAlign: 'center' },
  itemTotal: { fontWeight: '700', color: '#FF6B9D', minWidth: 70, textAlign: 'right' },
  footer: { backgroundColor: '#fff', padding: 20, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  totalLabel: { fontSize: 16, color: '#666' },
  totalPrice: { fontSize: 20, fontWeight: 'bold', color: '#FF6B9D' },
  checkoutButton: { backgroundColor: '#FF6B9D', borderRadius: 12, padding: 16, alignItems: 'center' },
  checkoutText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

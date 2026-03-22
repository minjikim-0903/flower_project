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
import { router } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';
import { storeService } from '@/services/stores';
import { productService } from '@/services/products';
import { FreshFlowerCategory, Product, ProductType, TreeCategory } from '@/types';

const FRESH_CATEGORIES: { value: FreshFlowerCategory; label: string }[] = [
  { value: 'rose', label: '장미' },
  { value: 'lily', label: '백합' },
  { value: 'tulip', label: '튤립' },
  { value: 'chrysanthemum', label: '국화' },
  { value: 'carnation', label: '카네이션' },
  { value: 'sunflower', label: '해바라기' },
  { value: 'orchid', label: '난초' },
  { value: 'mixed_fresh', label: '혼합' },
  { value: 'other_fresh', label: '기타' },
];

const TREE_CATEGORIES: { value: TreeCategory; label: string }[] = [
  { value: 'fruit_tree', label: '유실수' },
  { value: 'ornamental_tree', label: '관상수' },
  { value: 'conifer', label: '침엽수' },
  { value: 'shrub', label: '관목' },
  { value: 'indoor_plant', label: '실내식물' },
  { value: 'bamboo', label: '대나무' },
  { value: 'mixed_tree', label: '혼합' },
  { value: 'other_tree', label: '기타' },
];

export default function ProductsScreen() {
  const { profile } = useAuthStore();
  const [, setStoreId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<ProductType | 'all'>('all');

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const store = await storeService.getMyStore(profile.id);
      if (store) {
        setStoreId(store.id);
        const data = await productService.getProductsByStore(store.id);
        setProducts(data);
      }
      setLoading(false);
    })();
  }, [profile]);

  const handleToggle = async (product: Product) => {
    try {
      const updated = await productService.updateProduct(product.id, {
        is_available: !product.is_available,
      });
      setProducts(products.map((p) => (p.id === product.id ? updated : p)));
    } catch {
      Alert.alert('오류', '상태 변경에 실패했습니다.');
    }
  };

  const getCategoryLabel = (product: Product) => {
    const list = product.product_type === 'fresh_flower' ? FRESH_CATEGORIES : TREE_CATEGORIES;
    return list.find((c) => c.value === product.category)?.label ?? product.category;
  };

  const filtered = filterType === 'all' ? products : products.filter((p) => p.product_type === filterType);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#2ECC71" />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>상품 관리</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/seller/product-form')}
        >
          <Text style={styles.addButtonText}>+ 추가</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {([['all', '전체'], ['fresh_flower', '🌸 생화'], ['tree', '🌳 나무']] as const).map(([val, label]) => (
          <TouchableOpacity
            key={val}
            style={[styles.filterTab, filterType === val && styles.filterTabActive]}
            onPress={() => setFilterType(val)}
          >
            <Text style={[styles.filterTabText, filterType === val && styles.filterTabTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <View style={[
              styles.typeDot,
              item.product_type === 'fresh_flower' ? styles.typeDotPink : styles.typeDotGreen,
            ]} />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productMeta}>
                {item.product_type === 'fresh_flower' ? '생화' : '나무'} · {getCategoryLabel(item)}
                {item.variety ? ` · ${item.variety}` : ''}
              </Text>
              <Text style={styles.productPrice}>
                소매 {item.retail_price.toLocaleString()}원 / 도매 {item.wholesale_price.toLocaleString()}원
              </Text>
              {item.origin ? <Text style={styles.productOrigin}>📍 {item.origin}</Text> : null}
            </View>
            <TouchableOpacity
              style={[styles.toggleButton, item.is_available ? styles.toggleOn : styles.toggleOff]}
              onPress={() => handleToggle(item)}
            >
              <Text style={[styles.toggleText, { color: item.is_available ? '#2ECC71' : '#E74747' }]}>
                {item.is_available ? '판매중' : '중지'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={{ padding: 12, gap: 8 }}
        ListEmptyComponent={
          <Text style={styles.empty}>등록된 상품이 없습니다.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: { fontSize: 22, fontWeight: 'bold' },
  addButton: { backgroundColor: '#2ECC71', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  addButtonText: { color: '#fff', fontWeight: '600' },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  filterTabActive: { borderColor: '#2ECC71', backgroundColor: '#2ECC71' },
  filterTabText: { color: '#666', fontSize: 13 },
  filterTabTextActive: { color: '#fff', fontWeight: '700' },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  typeDot: { width: 10, height: 10, borderRadius: 5 },
  typeDotPink: { backgroundColor: '#FF6B9D' },
  typeDotGreen: { backgroundColor: '#2ECC71' },
  productInfo: { flex: 1 },
  productName: { fontSize: 15, fontWeight: '600' },
  productMeta: { color: '#888', fontSize: 12, marginTop: 2 },
  productPrice: { color: '#555', fontSize: 13, marginTop: 3 },
  productOrigin: { color: '#999', fontSize: 11, marginTop: 2 },
  toggleButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  toggleOn: { backgroundColor: '#2ECC7120' },
  toggleOff: { backgroundColor: '#E7474720' },
  toggleText: { fontWeight: '600', fontSize: 13 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 15 },
});

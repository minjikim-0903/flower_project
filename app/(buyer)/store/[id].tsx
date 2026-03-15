import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { storeService } from '@/services/stores';
import { productService } from '@/services/products';
import { useCartStore } from '@/store/useCartStore';
import { FreshFlowerCategory, Product, ProductType, Store, TreeCategory } from '@/types';

const FRESH_FLOWER_LABELS: Record<FreshFlowerCategory, string> = {
  rose: '장미',
  lily: '백합',
  tulip: '튤립',
  chrysanthemum: '국화',
  carnation: '카네이션',
  sunflower: '해바라기',
  orchid: '난초',
  mixed_fresh: '혼합',
  other_fresh: '기타',
};

const TREE_LABELS: Record<TreeCategory, string> = {
  fruit_tree: '유실수',
  ornamental_tree: '관상수',
  conifer: '침엽수',
  shrub: '관목',
  indoor_plant: '실내식물',
  bamboo: '대나무',
  mixed_tree: '혼합',
  other_tree: '기타',
};

const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  fresh_flower: '🌸 생화',
  tree: '🌳 나무',
};

export default function StoreDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<ProductType | 'all'>('all');

  const { addItem, items, storeId: cartStoreId } = useCartStore();

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [storeData, productsData] = await Promise.all([
        storeService.getStoreById(id),
        productService.getProductsByStore(id),
      ]);
      setStore(storeData);
      setProducts(productsData);
      setLoading(false);
    })();
  }, [id]);

  const handleAddToCart = (product: Product) => {
    if (cartStoreId && cartStoreId !== product.store_id) {
      Alert.alert(
        '장바구니 초기화',
        '다른 가게의 상품이 담겨있습니다.\n초기화하고 이 상품을 담을까요?',
        [
          { text: '취소', style: 'cancel' },
          { text: '초기화 후 담기', onPress: () => addItem(product, 1) },
        ]
      );
      return;
    }
    addItem(product, 1);
    Alert.alert('완료', '장바구니에 추가되었습니다.');
  };

  const getCategoryLabel = (product: Product): string => {
    if (product.product_type === 'fresh_flower') {
      return FRESH_FLOWER_LABELS[product.category as FreshFlowerCategory] ?? product.category;
    }
    return TREE_LABELS[product.category as TreeCategory] ?? product.category;
  };

  const filtered = selectedType === 'all'
    ? products
    : products.filter((p) => p.product_type === selectedType);

  const freshCount = products.filter((p) => p.product_type === 'fresh_flower').length;
  const treeCount = products.filter((p) => p.product_type === 'tree').length;

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#FF6B9D" />;
  if (!store) return null;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {/* 뒤로가기 */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backText}>← 뒤로</Text>
            </TouchableOpacity>

            {/* 가게 헤더 이미지 */}
            {store.image_url ? (
              <Image source={{ uri: store.image_url }} style={styles.storeImage} />
            ) : (
              <View style={[styles.storeImage, styles.storeImagePlaceholder]}>
                <Text style={{ fontSize: 48 }}>🌸</Text>
              </View>
            )}

            {/* 가게 정보 */}
            <View style={styles.storeInfo}>
              <Text style={styles.storeName}>{store.name}</Text>
              <Text style={styles.storeAddress}>📍 {store.address}</Text>
              {store.description ? (
                <Text style={styles.storeDesc}>{store.description}</Text>
              ) : null}
              {store.min_order_amount > 0 && (
                <Text style={styles.minOrder}>
                  최소 주문금액: {store.min_order_amount.toLocaleString()}원
                </Text>
              )}
            </View>

            {/* 생화 / 나무 탭 */}
            <View style={styles.typeTabRow}>
              <TouchableOpacity
                style={[styles.typeTab, selectedType === 'all' && styles.typeTabActive]}
                onPress={() => setSelectedType('all')}
              >
                <Text style={[styles.typeTabText, selectedType === 'all' && styles.typeTabTextActive]}>
                  전체 ({products.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeTab, selectedType === 'fresh_flower' && styles.typeTabActivePink]}
                onPress={() => setSelectedType('fresh_flower')}
              >
                <Text style={[styles.typeTabText, selectedType === 'fresh_flower' && styles.typeTabTextActive]}>
                  🌸 생화 ({freshCount})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeTab, selectedType === 'tree' && styles.typeTabActiveGreen]}
                onPress={() => setSelectedType('tree')}
              >
                <Text style={[styles.typeTabText, selectedType === 'tree' && styles.typeTabTextActive]}>
                  🌳 나무 ({treeCount})
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>상품 목록 ({filtered.length})</Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            {item.image_url ? (
              <Image source={{ uri: item.image_url }} style={styles.productImage} />
            ) : (
              <View style={[styles.productImage, styles.productImagePlaceholder]}>
                <Text style={{ fontSize: 28 }}>
                  {item.product_type === 'fresh_flower' ? '🌸' : '🌳'}
                </Text>
              </View>
            )}
            <View style={styles.productInfo}>
              <View style={styles.productNameRow}>
                <Text style={styles.productName}>{item.name}</Text>
                <View style={[
                  styles.typeBadge,
                  item.product_type === 'fresh_flower' ? styles.typeBadgePink : styles.typeBadgeGreen,
                ]}>
                  <Text style={styles.typeBadgeText}>
                    {PRODUCT_TYPE_LABELS[item.product_type]}
                  </Text>
                </View>
              </View>
              <Text style={styles.productCategory}>{getCategoryLabel(item)}</Text>
              <View style={styles.priceBlock}>
                <View>
                  <Text style={styles.retailPrice}>
                    소매 {item.retail_price.toLocaleString()}원/{item.unit}
                  </Text>
                  <Text style={styles.wholesalePrice}>
                    도매 {item.wholesale_price.toLocaleString()}원 (최소 {item.min_wholesale_quantity}{item.unit})
                  </Text>
                </View>
                <TouchableOpacity style={styles.addButton} onPress={() => handleAddToCart(item)}>
                  <Text style={styles.addButtonText}>담기</Text>
                </TouchableOpacity>
              </View>
              {item.description ? (
                <Text style={styles.productDesc} numberOfLines={2}>{item.description}</Text>
              ) : null}
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>등록된 상품이 없습니다.</Text>
        }
      />

      {/* 장바구니 플로팅 버튼 */}
      {items.length > 0 && (
        <TouchableOpacity style={styles.cartBanner} onPress={() => router.push('/(buyer)/cart')}>
          <Text style={styles.cartBannerText}>
            장바구니 {items.reduce((s, i) => s + i.quantity, 0)}개 보기 →
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  backButton: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  backText: { color: '#FF6B9D', fontWeight: '600' },
  storeImage: { width: '100%', height: 220 },
  storeImagePlaceholder: {
    backgroundColor: '#FFF0F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeInfo: { padding: 16, backgroundColor: '#fff' },
  storeName: { fontSize: 24, fontWeight: 'bold' },
  storeAddress: { color: '#888', marginTop: 4, fontSize: 14 },
  storeDesc: { color: '#555', marginTop: 8, lineHeight: 20 },
  minOrder: { color: '#FF6B9D', marginTop: 6, fontSize: 13, fontWeight: '600' },
  typeTabRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  typeTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  typeTabActive: { borderColor: '#555', backgroundColor: '#555' },
  typeTabActivePink: { borderColor: '#FF6B9D', backgroundColor: '#FF6B9D' },
  typeTabActiveGreen: { borderColor: '#2ECC71', backgroundColor: '#2ECC71' },
  typeTabText: { fontSize: 13, color: '#555', fontWeight: '500' },
  typeTabTextActive: { color: '#fff', fontWeight: '700' },
  sectionTitle: { fontWeight: '600', fontSize: 15, padding: 16, paddingBottom: 8 },
  productCard: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 14,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  productImage: { width: 100, height: 110 },
  productImagePlaceholder: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: { flex: 1, padding: 12 },
  productNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  productName: { fontWeight: '600', fontSize: 15, flex: 1 },
  typeBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  typeBadgePink: { backgroundColor: '#FFF0F5' },
  typeBadgeGreen: { backgroundColor: '#F0FFF4' },
  typeBadgeText: { fontSize: 11 },
  productCategory: { color: '#888', fontSize: 12, marginTop: 2 },
  priceBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 6,
  },
  retailPrice: { fontSize: 14, fontWeight: '600' },
  wholesalePrice: { color: '#FF6B9D', fontSize: 12, marginTop: 2 },
  productDesc: { color: '#999', fontSize: 12, marginTop: 4 },
  addButton: {
    backgroundColor: '#FF6B9D',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  emptyText: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 15 },
  cartBanner: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#FF6B9D',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#FF6B9D',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cartBannerText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

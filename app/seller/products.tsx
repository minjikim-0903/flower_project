import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
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

  const confirm = (message: string): boolean => {
    if (Platform.OS === 'web') return window.confirm(message);
    return true;
  };

  const handleToggle = async (product: Product) => {
    const next = !product.is_available;
    const message = next ? '이 상품을 다시 판매할까요?' : '이 상품을 판매 목록에서 내릴까요?';

    if (Platform.OS === 'web') {
      if (!confirm(message)) return;
      try {
        const updated = await productService.updateProduct(product.id, { is_available: next });
        setProducts(products.map((p) => (p.id === product.id ? updated : p)));
      } catch {
        window.alert('상태 변경에 실패했습니다.');
      }
      return;
    }

    Alert.alert(next ? '판매 재개' : '판매 중단', message, [
      { text: '취소', style: 'cancel' },
      {
        text: next ? '재개' : '내리기',
        style: next ? 'default' : 'destructive',
        onPress: async () => {
          try {
            const updated = await productService.updateProduct(product.id, { is_available: next });
            setProducts(products.map((p) => (p.id === product.id ? updated : p)));
          } catch {
            Alert.alert('오류', '상태 변경에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const handleDelete = async (product: Product) => {
    const message = `"${product.name}"을 완전히 삭제할까요?\n삭제 후 복구할 수 없습니다.`;

    if (Platform.OS === 'web') {
      if (!window.confirm(message)) return;
      try {
        await productService.deleteProduct(product.id);
        setProducts(products.filter((p) => p.id !== product.id));
      } catch {
        window.alert('삭제에 실패했습니다.');
      }
      return;
    }

    Alert.alert('상품 삭제', message, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await productService.deleteProduct(product.id);
            setProducts(products.filter((p) => p.id !== product.id));
          } catch {
            Alert.alert('오류', '삭제에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const getCategoryLabel = (product: Product) => {
    const list = product.product_type === 'fresh_flower' ? FRESH_CATEGORIES : TREE_CATEGORIES;
    return list.find((c) => c.value === product.category)?.label ?? product.category;
  };

  const filtered = filterType === 'all' ? products : products.filter((p) => p.product_type === filterType);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#2ECC71" />;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row justify-between items-center p-5 bg-white">
        <Text className="font-bold" style={{ fontSize: 22 }}>상품 관리</Text>
        <TouchableOpacity
          className="bg-seller rounded-lg"
          style={{ paddingHorizontal: 14, paddingVertical: 8 }}
          onPress={() => router.push('/seller/product-form')}
        >
          <Text className="text-white font-semibold">+ 추가</Text>
        </TouchableOpacity>
      </View>

      <View
        className="flex-row bg-white border-b border-border gap-2"
        style={{ paddingHorizontal: 12, paddingVertical: 10 }}
      >
        {([['all', '전체'], ['fresh_flower', '🌸 생화'], ['tree', '🌳 나무']] as const).map(([val, label]) => (
          <TouchableOpacity
            key={val}
            className="flex-1 items-center border"
            style={[
              { paddingVertical: 7, borderRadius: 20 },
              filterType === val
                ? { borderColor: '#2ECC71', backgroundColor: '#2ECC71' }
                : { borderColor: '#ddd' },
            ]}
            onPress={() => setFilterType(val)}
          >
            <Text
              style={{
                color: filterType === val ? '#fff' : '#666',
                fontSize: 13,
                fontWeight: filterType === val ? '700' : undefined,
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            className="bg-white rounded-xl flex-row items-center gap-2"
            style={{ padding: 14 }}
          >
            <View
              style={[
                { width: 10, height: 10, borderRadius: 5 },
                item.product_type === 'fresh_flower'
                  ? { backgroundColor: '#FF6B9D' }
                  : { backgroundColor: '#2ECC71' },
              ]}
            />
            <View className="flex-1">
              <Text className="text-sm font-semibold">{item.name}</Text>
              <Text style={{ color: '#888', fontSize: 12, marginTop: 2 }}>
                {item.product_type === 'fresh_flower' ? '생화' : '나무'} · {getCategoryLabel(item)}
                {item.variety ? ` · ${item.variety}` : ''}
              </Text>
              <Text style={{ color: '#555', fontSize: 13, marginTop: 3 }}>
                소매 {item.retail_price.toLocaleString()}원 / 도매 {item.wholesale_price.toLocaleString()}원
              </Text>
              {item.origin ? <Text style={{ color: '#999', fontSize: 11, marginTop: 2 }}>📍 {item.origin}</Text> : null}
            </View>
            <View className="items-end gap-1">
              <TouchableOpacity
                className="rounded-lg"
                style={[
                  { paddingHorizontal: 12, paddingVertical: 6 },
                  item.is_available ? { backgroundColor: '#2ECC7120' } : { backgroundColor: '#E7474720' },
                ]}
                onPress={() => handleToggle(item)}
              >
                <Text
                  style={{
                    fontWeight: '600',
                    fontSize: 13,
                    color: item.is_available ? '#2ECC71' : '#E74747',
                  }}
                >
                  {item.is_available ? '판매중' : '판매중단'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="rounded-lg"
                style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#E7474710' }}
                onPress={() => handleDelete(item)}
              >
                <Text style={{ color: '#E74747', fontWeight: '600', fontSize: 13 }}>삭제</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={{ padding: 12, gap: 8 }}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 15 }}>등록된 상품이 없습니다.</Text>
        }
      />
    </SafeAreaView>
  );
}

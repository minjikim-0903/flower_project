import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Button, ButtonText } from '@gluestack-ui/themed';
import { Flower2 } from 'lucide-react-native';
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
  fresh_flower: '생화',
  tree: '나무',
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

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#FF3D6C" />;
  if (!store) return null;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {/* 뒤로가기 */}
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: 12,
                left: 12,
                zIndex: 10,
                backgroundColor: '#fff',
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
              onPress={() => router.back()}
            >
              <Text className="text-primary font-semibold">← 뒤로</Text>
            </TouchableOpacity>

            {/* 가게 헤더 이미지 */}
            {store.image_url ? (
              <Image source={{ uri: store.image_url }} style={{ width: '100%', height: 220 }} />
            ) : (
              <View
                className="w-full justify-center items-center"
                style={{ height: 220, backgroundColor: '#FFF0F5' }}
              >
                <Flower2 size={48} color="#FF3D6C" strokeWidth={1.5} />
              </View>
            )}

            {/* 가게 정보 */}
            <View className="p-4 bg-white">
              <Text className="text-2xl font-bold">{store.name}</Text>
              <Text style={{ color: '#6a6a6a', marginTop: 4, fontSize: 14 }}>📍 {store.address}</Text>
              {store.description ? (
                <Text style={{ color: '#6a6a6a', marginTop: 8, lineHeight: 20 }}>{store.description}</Text>
              ) : null}
              {store.min_order_amount > 0 && (
                <Text className="text-primary font-semibold" style={{ marginTop: 6, fontSize: 13 }}>
                  최소 주문금액: {store.min_order_amount.toLocaleString()}원
                </Text>
              )}
            </View>

            {/* 생화 / 나무 탭 */}
            <View
              className="flex-row bg-white border-b border-border gap-2"
              style={{ paddingHorizontal: 12, paddingVertical: 10 }}
            >
              <TouchableOpacity
                className="flex-1 items-center border"
                style={[
                  { paddingVertical: 8, borderRadius: 20 },
                  selectedType === 'all'
                    ? { borderColor: '#6a6a6a', backgroundColor: '#6a6a6a' }
                    : { borderColor: '#f0f0f0' },
                ]}
                onPress={() => setSelectedType('all')}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: selectedType === 'all' ? '700' : '500',
                    color: selectedType === 'all' ? '#fff' : '#6a6a6a',
                  }}
                >
                  전체 ({products.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 items-center border"
                style={[
                  { paddingVertical: 8, borderRadius: 20 },
                  selectedType === 'fresh_flower'
                    ? { borderColor: '#FF3D6C', backgroundColor: '#FF3D6C' }
                    : { borderColor: '#f0f0f0' },
                ]}
                onPress={() => setSelectedType('fresh_flower')}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: selectedType === 'fresh_flower' ? '700' : '500',
                    color: selectedType === 'fresh_flower' ? '#fff' : '#6a6a6a',
                  }}
                >
                  생화 ({freshCount})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 items-center border"
                style={[
                  { paddingVertical: 8, borderRadius: 20 },
                  selectedType === 'tree'
                    ? { borderColor: '#2ECC71', backgroundColor: '#2ECC71' }
                    : { borderColor: '#f0f0f0' },
                ]}
                onPress={() => setSelectedType('tree')}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: selectedType === 'tree' ? '700' : '500',
                    color: selectedType === 'tree' ? '#fff' : '#6a6a6a',
                  }}
                >
                  나무 ({treeCount})
                </Text>
              </TouchableOpacity>
            </View>

            <Text className="font-semibold" style={{ fontSize: 15, padding: 16, paddingBottom: 8 }}>
              상품 목록 ({filtered.length})
            </Text>
          </>
        }
        renderItem={({ item }) => (
          <View
            className="bg-white flex-row overflow-hidden mx-3 mb-2"
            style={{ borderRadius: 16 }}
          >
            {item.image_url ? (
              <Image source={{ uri: item.image_url }} style={{ width: 100, height: 110 }} />
            ) : (
              <View
                className="justify-center items-center"
                style={{ width: 100, height: 110, backgroundColor: '#f5f5f5' }}
              >
                {item.product_type === 'fresh_flower' ? (
                  <Flower2 size={28} color="#FF3D6C" strokeWidth={1.5} />
                ) : (
                  <Flower2 size={28} color="#2ECC71" strokeWidth={1.5} />
                )}
              </View>
            )}
            <View className="flex-1 p-3">
              <View className="flex-row items-center gap-1">
                <Text className="font-semibold flex-1" style={{ fontSize: 15 }}>{item.name}</Text>
                <View
                  className="rounded"
                  style={[
                    { paddingHorizontal: 7, paddingVertical: 2 },
                    item.product_type === 'fresh_flower'
                      ? { backgroundColor: '#FFF0F5' }
                      : { backgroundColor: '#F0FFF4' },
                  ]}
                >
                  <Text style={{ fontSize: 11 }}>
                    {PRODUCT_TYPE_LABELS[item.product_type]}
                  </Text>
                </View>
              </View>
              <Text style={{ color: '#6a6a6a', fontSize: 12, marginTop: 2 }}>{getCategoryLabel(item)}</Text>
              <View className="flex-row justify-between items-end" style={{ marginTop: 6 }}>
                <View>
                  <Text className="text-sm font-semibold">
                    소매 {item.retail_price.toLocaleString()}원/{item.unit}
                  </Text>
                  <Text className="text-primary" style={{ fontSize: 12, marginTop: 2 }}>
                    도매 {item.wholesale_price.toLocaleString()}원 (최소 {item.min_wholesale_quantity}{item.unit})
                  </Text>
                </View>
                <TouchableOpacity
                  className="bg-primary rounded-lg"
                  style={{ paddingHorizontal: 14, paddingVertical: 7 }}
                  onPress={() => handleAddToCart(item)}
                >
                  <Text className="text-white font-bold" style={{ fontSize: 13 }}>담기</Text>
                </TouchableOpacity>
              </View>
              {item.description ? (
                <Text className="text-text-secondary text-xs" style={{ marginTop: 4 }} numberOfLines={2}>{item.description}</Text>
              ) : null}
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: '#6a6a6a', marginTop: 40, fontSize: 15 }}>등록된 상품이 없습니다.</Text>
        }
      />

      {/* 장바구니 플로팅 버튼 */}
      {items.length > 0 && (
        <Button
          onPress={() => router.push('/users/cart')}
          style={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            right: 20,
            backgroundColor: '#FF3D6C',
            borderRadius: 14,
            minHeight: 52,
            elevation: 6,
            shadowColor: '#FF3D6C',
            shadowOpacity: 0.4,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
          }}
        >
          <ButtonText style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
            장바구니 {items.reduce((s, i) => s + i.quantity, 0)}개 보기 →
          </ButtonText>
        </Button>
      )}
    </SafeAreaView>
  );
}

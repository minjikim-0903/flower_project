import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {
  ArrowLeft,
  Heart,
  Truck,
  Leaf,
  Package,
  Minus,
  Plus,
  ShoppingCart,
  MapPin,
} from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { productService } from '@/services/products';
import { useCartStore } from '@/store/useCartStore';
import { Product } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FRESHNESS_LABELS: Record<string, string> = {
  A: '상급 (A)',
  B: '중급 (B)',
  C: '하급 (C)',
};

const SIZE_LABELS: Record<string, string> = {
  소: '소형',
  중: '중형',
  대: '대형',
  특대: '특대형',
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [isFav, setIsFav] = useState(false);

  const { addItem, items: cartItems, storeId: cartStoreId } = useCartStore();

  useEffect(() => {
    if (!id) return;
    productService.getProductById(id).then((p) => {
      setProduct(p);
      setLoading(false);
    });
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    if (cartStoreId && cartStoreId !== product.store_id) {
      Alert.alert(
        '장바구니 초기화',
        '다른 가게의 상품이 담겨있습니다.\n초기화하고 이 상품을 담을까요?',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '초기화 후 담기',
            onPress: () => {
              addItem(product, qty);
            },
          },
        ]
      );
      return;
    }
    addItem(product, qty);
    Alert.alert('완료', `${qty}개를 장바구니에 담았어요.`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (cartStoreId && cartStoreId !== product.store_id) {
      Alert.alert(
        '장바구니 초기화',
        '다른 가게의 상품이 담겨있습니다.\n초기화하고 바로 결제할까요?',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '초기화 후 결제',
            onPress: () => {
              addItem(product, qty);
              router.push('/users/cart');
            },
          },
        ]
      );
      return;
    }
    addItem(product, qty);
    router.push('/users/cart');
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FAF7F5', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#FF3D6C" />
      </SafeAreaView>
    );
  }

  if (!product) return null;

  const images = product.image_urls?.length > 0 ? product.image_urls : product.image_url ? [product.image_url] : [];
  const retailPrice = product.retail_price;
  const wholesalePrice = product.wholesale_price;

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <View style={{ flex: 1, backgroundColor: '#FAF7F5' }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

        {/* 히어로 이미지 */}
        <View style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH, backgroundColor: '#ECE7E2' }}>
          {images.length > 0 ? (
            <Image
              source={{ uri: images[0] }}
              style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}
              resizeMode="cover"
            />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 72 }}>🌸</Text>
            </View>
          )}

          {/* 플로팅 버튼들 */}
          <SafeAreaView
            style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
            edges={['top']}
          >
            <View style={{
              flexDirection: 'row', justifyContent: 'space-between',
              paddingHorizontal: 16, paddingTop: 12,
            }}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={{
                  width: 40, height: 40, borderRadius: 20,
                  backgroundColor: 'rgba(255,255,255,0.92)',
                  alignItems: 'center', justifyContent: 'center',
                  shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4,
                  shadowOffset: { width: 0, height: 1 },
                }}
              >
                <ArrowLeft size={20} color="#0F0F12" strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsFav((v) => !v)}
                style={{
                  width: 40, height: 40, borderRadius: 20,
                  backgroundColor: 'rgba(255,255,255,0.92)',
                  alignItems: 'center', justifyContent: 'center',
                  shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4,
                  shadowOffset: { width: 0, height: 1 },
                }}
              >
                <Heart
                  size={20}
                  color={isFav ? '#FF3D6C' : '#0F0F12'}
                  fill={isFav ? '#FF3D6C' : 'none'}
                  strokeWidth={2}
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* 이미지 페이지 도트 */}
          {images.length > 1 && (
            <View style={{
              position: 'absolute', bottom: 12,
              left: 0, right: 0,
              flexDirection: 'row', justifyContent: 'center', gap: 4,
            }}>
              {images.map((_, i) => (
                <View key={i} style={{
                  width: i === 0 ? 18 : 5, height: 5, borderRadius: 3,
                  backgroundColor: i === 0 ? '#0F0F12' : 'rgba(15,15,18,0.25)',
                }} />
              ))}
            </View>
          )}
        </View>

        {/* 상품 정보 */}
        <View style={{ padding: 20, paddingBottom: 16, backgroundColor: '#FFFFFF' }}>
          {product.store?.name && (
            <Text style={{ fontSize: 13, color: '#7A7077', marginBottom: 6 }}>
              {product.store.name}
            </Text>
          )}
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#0F0F12', letterSpacing: -0.6, lineHeight: 30, marginBottom: 14 }}>
            {product.name}
          </Text>

          {/* 가격 */}
          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
              <Text style={{ fontSize: 12, color: '#7A7077', width: 40 }}>소매가</Text>
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#0F0F12', letterSpacing: -0.4 }}>
                {retailPrice.toLocaleString()}원
              </Text>
              <Text style={{ fontSize: 12, color: '#7A7077' }}>/ {product.unit}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
              <Text style={{ fontSize: 12, color: '#7A7077', width: 40 }}>도매가</Text>
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#FF3D6C', letterSpacing: -0.4 }}>
                {wholesalePrice.toLocaleString()}원
              </Text>
              <Text style={{ fontSize: 12, color: '#7A7077' }}>
                / {product.unit} (최소 {product.min_wholesale_quantity}{product.unit})
              </Text>
            </View>
          </View>
        </View>

        {/* 구분선 */}
        <View style={{ height: 8, backgroundColor: '#EFEAE5' }} />

        {/* 배송/상품 특징 */}
        <View style={{ padding: 20, backgroundColor: '#FFFFFF', gap: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Truck size={18} color="#0F0F12" strokeWidth={1.8} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#0F0F12' }}>
              {product.shipping_methods?.join(' · ') || '배송 방법 미정'}
              {product.shipping_fee === 0 ? ' · 무료배송' : ` · 배송비 ${product.shipping_fee.toLocaleString()}원`}
            </Text>
          </View>
          {product.origin && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <MapPin size={18} color="#7A7077" strokeWidth={1.8} />
              <Text style={{ fontSize: 14, color: '#0F0F12' }}>
                원산지 <Text style={{ fontWeight: '600' }}>{product.origin}</Text>
              </Text>
            </View>
          )}
          {product.freshness_grade && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Leaf size={18} color="#2ECC71" strokeWidth={1.8} />
              <Text style={{ fontSize: 14, color: '#0F0F12' }}>
                신선도 <Text style={{ fontWeight: '600' }}>{FRESHNESS_LABELS[product.freshness_grade] ?? product.freshness_grade}</Text>
              </Text>
            </View>
          )}
          {product.flower_size && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Package size={18} color="#0F0F12" strokeWidth={1.8} />
              <Text style={{ fontSize: 14, color: '#0F0F12' }}>
                크기 <Text style={{ fontWeight: '600' }}>{SIZE_LABELS[product.flower_size] ?? product.flower_size}</Text>
              </Text>
            </View>
          )}
        </View>

        {/* 구분선 */}
        <View style={{ height: 8, backgroundColor: '#EFEAE5' }} />

        {/* 상품 설명 */}
        {(product.description || product.characteristics) && (
          <View style={{ padding: 20, backgroundColor: '#FFFFFF' }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#0F0F12', letterSpacing: -0.3, marginBottom: 10 }}>
              상품 설명
            </Text>
            {product.description ? (
              <Text style={{ fontSize: 14, lineHeight: 22, color: '#3D3540' }}>
                {product.description}
              </Text>
            ) : null}
            {product.characteristics ? (
              <Text style={{ fontSize: 14, lineHeight: 22, color: '#3D3540', marginTop: product.description ? 8 : 0 }}>
                {product.characteristics}
              </Text>
            ) : null}
          </View>
        )}

        {/* 색상/품종 태그 */}
        {(product.color?.length > 0 || product.variety) && (
          <>
            <View style={{ height: 8, backgroundColor: '#EFEAE5' }} />
            <View style={{ padding: 20, backgroundColor: '#FFFFFF' }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#0F0F12', letterSpacing: -0.3, marginBottom: 10 }}>
                상세 정보
              </Text>
              {product.variety && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#ECE7E2' }}>
                  <Text style={{ fontSize: 13, color: '#7A7077' }}>품종</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#0F0F12' }}>{product.variety}</Text>
                </View>
              )}
              {product.color?.length > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#ECE7E2' }}>
                  <Text style={{ fontSize: 13, color: '#7A7077' }}>색상</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#0F0F12' }}>{product.color.join(', ')}</Text>
                </View>
              )}
              {product.blooming_season && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 }}>
                  <Text style={{ fontSize: 13, color: '#7A7077' }}>개화 시기</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#0F0F12' }}>{product.blooming_season}</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* 하단 액션 바 */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingHorizontal: 16, paddingTop: 12, paddingBottom: 28,
        backgroundColor: 'rgba(255,255,255,0.96)',
        borderTopWidth: 1, borderTopColor: '#ECE7E2',
        flexDirection: 'row', gap: 10, alignItems: 'center',
      }}>
        {/* 수량 조절 */}
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          height: 48, borderRadius: 12,
          borderWidth: 1, borderColor: '#ECE7E2',
          paddingHorizontal: 4,
        }}>
          <TouchableOpacity
            onPress={() => setQty((q) => Math.max(1, q - 1))}
            style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}
          >
            <Minus size={16} color="#0F0F12" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={{ minWidth: 20, textAlign: 'center', fontSize: 14, fontWeight: '700', color: '#0F0F12' }}>
            {qty}
          </Text>
          <TouchableOpacity
            onPress={() => setQty((q) => q + 1)}
            style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}
          >
            <Plus size={16} color="#0F0F12" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* 장바구니 */}
        <TouchableOpacity
          onPress={handleAddToCart}
          style={{
            flex: 1, height: 48, borderRadius: 12,
            backgroundColor: '#FFF1F4',
            alignItems: 'center', justifyContent: 'center',
            flexDirection: 'row', gap: 6,
          }}
        >
          <ShoppingCart size={16} color="#FF3D6C" strokeWidth={2} />
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#FF3D6C' }}>장바구니</Text>
        </TouchableOpacity>

        {/* 바로 결제 */}
        <TouchableOpacity
          onPress={handleBuyNow}
          style={{
            flex: 1.4, height: 48, borderRadius: 12,
            backgroundColor: '#0F0F12',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>
            바로 결제 · {(retailPrice * qty).toLocaleString()}원
          </Text>
        </TouchableOpacity>
      </View>

      {/* 장바구니 플로팅 (하단 바와 겹치지 않게 숨김 — 상세에선 하단 바로 대체) */}
    </View>
  );
}

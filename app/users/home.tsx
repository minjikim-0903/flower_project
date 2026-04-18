import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Heart, Plus, Star, Store as StoreIcon } from 'lucide-react-native';
import { Input, InputField } from '@gluestack-ui/themed';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/useAuthStore';
import { storeService } from '@/services/stores';
import { Store } from '@/types';

const H_PAD = 16;

const RECOMMENDED_PRODUCTS = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1596434446633-911470550974?auto=format&fit=crop&q=80&w=400',
    isBestseller: true,
    price: '₩3,500',
    msrp: '₩7,000',
    title: '레드 로즈 프리미엄 20송이',
    store: '양재꽃도매',
    rating: '4.9',
    minOrder: '최소 5묶음',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1490750967868-88df5691cc64?auto=format&fit=crop&q=80&w=400',
    isBestseller: false,
    price: '₩2,800',
    msrp: '₩5,600',
    title: '화이트 국화 웨딩 부케용',
    store: '한남꽃시장',
    rating: '4.7',
    minOrder: '최소 10묶음',
  },
];
const COL_GAP = 8;

const CLASSIFICATION_CATEGORIES = [
  { emoji: '🌹', label: '장미류' },
  { emoji: '🌸', label: '국화류' },
  { emoji: '🌺', label: '백합류' },
  { emoji: '💐', label: '혼합 초화류' },
  { emoji: '🌿', label: '그린류' },
  { emoji: '🌻', label: '계절화' },
];

const USE_CATEGORIES = [
  { emoji: '💍', label: '웨딩' },
  { emoji: '🕯️', label: '근조' },
  { emoji: '🎉', label: '행사' },
  { emoji: '🏠', label: '일상' },
];

function CategoryCard({
  item,
  width,
  selected,
  onPress,
}: {
  item: { emoji: string; label: string };
  width: number;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <View style={{ width, alignItems: 'center' }}>
      <TouchableOpacity
        style={{
          width,
          height: width,
          backgroundColor: selected ? '#FFF0F5' : '#fff',
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1.5,
          borderColor: selected ? '#FF6B9D' : '#f0f0f0',
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 1 },
          elevation: 1,
          marginBottom: 6,
        }}
        onPress={onPress}
      >
        <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
      </TouchableOpacity>
      <Text
        style={{
          fontSize: 11,
          color: selected ? '#FF6B9D' : '#6a6a6a',
          fontWeight: '500',
          textAlign: 'center',
          lineHeight: 14,
        }}
        numberOfLines={2}
      >
        {item.label}
      </Text>
    </View>
  );
}

export default function BuyerHomeScreen() {
  const { width } = useWindowDimensions();
  const { profile } = useAuthStore();
  const [stores, setStores] = useState<Store[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const gridWidth = width - H_PAD * 2;
  const col4Width = (gridWidth - COL_GAP * 3) / 4;

  const loadStores = async (searchText: string = search) => {
    setLoading(true);
    try {
      const data = await storeService.getStores({ search: searchText || undefined });
      setStores(data);
    } catch {
      // 에러 처리
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  const handleCategorySelect = (label: string) => {
    setSelectedCategory((prev) => (prev === label ? null : label));
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <FlatList
        data={stores}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {/* 헤더 */}
            <View style={{ paddingVertical: 20 }}>
              <Text style={{ fontSize: 22, fontWeight: 'bold' }}>안녕하세요, {profile?.name}님 👋</Text>
              <Text style={{ color: '#6a6a6a', marginTop: 4 }}>오늘도 좋은 꽃을 만나보세요</Text>
            </View>

            {/* 검색 */}
            <View className="mb-3">
              <Input
                variant="outline"
                style={{ borderRadius: 12, borderColor: '#f0f0f0', backgroundColor: '#fff' }}
              >
                <InputField
                  placeholder="가게 이름으로 검색"
                  value={search}
                  onChangeText={setSearch}
                  onSubmitEditing={() => loadStores(search)}
                  returnKeyType="search"
                  style={{ padding: 12, fontSize: 15 }}
                />
              </Input>
            </View>

            {/* 카테고리 둘러보기 */}
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#222222', marginBottom: 12 }}>
              카테고리 둘러보기
            </Text>

            {/* 카테고리 그리드 — 4열 */}
            {/* Row 1: 장미류 국화류 백합류 혼합초화류 */}
            <View style={{ flexDirection: 'row', gap: COL_GAP, marginBottom: COL_GAP }}>
              {CLASSIFICATION_CATEGORIES.slice(0, 4).map((item) => (
                <CategoryCard
                  key={item.label}
                  item={item}
                  width={col4Width}
                  selected={selectedCategory === item.label}
                  onPress={() => handleCategorySelect(item.label)}
                />
              ))}
            </View>
            {/* Row 2: 그린류 계절화 [빈칸] 용도별(특수카드) */}
            <View style={{ flexDirection: 'row', gap: COL_GAP, marginBottom: 20 }}>
              {CLASSIFICATION_CATEGORIES.slice(4, 6).map((item) => (
                <CategoryCard
                  key={item.label}
                  item={item}
                  width={col4Width}
                  selected={selectedCategory === item.label}
                  onPress={() => handleCategorySelect(item.label)}
                />
              ))}
              {/* 전체보기 */}
              <CategoryCard
                item={{ emoji: '🔍', label: '전체보기' }}
                width={col4Width}
                selected={selectedCategory === null}
                onPress={() => setSelectedCategory(null)}
              />
              {/* 특수카드: 용도별 2x2 */}
              <View style={{ width: col4Width, alignItems: 'center' }}>
                <View style={{ width: col4Width, height: col4Width, marginBottom: 6, gap: 3 }}>
                  {[[0, 1], [2, 3]].map((pair, rowIdx) => (
                    <View key={rowIdx} style={{ flexDirection: 'row', flex: 1, gap: 3 }}>
                      {pair.map((idx) => (
                        <TouchableOpacity
                          key={idx}
                          onPress={() => handleCategorySelect(USE_CATEGORIES[idx].label)}
                          style={{
                            flex: 1,
                            backgroundColor: selectedCategory === USE_CATEGORIES[idx].label ? '#FFF0F5' : '#fff',
                            borderRadius: 10,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Text style={{ fontSize: 15 }}>{USE_CATEGORIES[idx].emoji}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ))}
                </View>
                <Text style={{ fontSize: 11, color: '#6a6a6a', fontWeight: '500', textAlign: 'center' }}>
                  용도별
                </Text>
              </View>
            </View>

            {/* 추천 상품 섹션 */}
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#222222', marginBottom: 12 }}>
              오늘의 추천 상품
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
              {RECOMMENDED_PRODUCTS.map((product) => {
                const cardWidth = (width - H_PAD * 2 - 12) / 2;
                return (
                  <View key={product.id} style={{ width: cardWidth }}>
                    {/* 이미지 영역 */}
                    <View style={{ width: cardWidth, aspectRatio: 4 / 5, borderRadius: 14, overflow: 'hidden', backgroundColor: '#f5f5f5' }}>
                      <Image source={{ uri: product.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                      {/* 베스트셀러 배지 */}
                      {product.isBestseller && (
                        <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: '#fff', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 }}>
                          <Text style={{ fontSize: 9, fontWeight: '700', color: '#222222', letterSpacing: 0.5 }}>BESTSELLER</Text>
                        </View>
                      )}
                      {/* 하트 버튼 */}
                      <TouchableOpacity style={{ position: 'absolute', top: 8, right: 8 }}>
                        <Heart size={22} color="#fff" strokeWidth={2.5} />
                      </TouchableOpacity>
                      {/* 플러스 버튼 */}
                      <TouchableOpacity style={{ position: 'absolute', bottom: 8, right: 8, backgroundColor: '#fff', borderRadius: 20, padding: 5 }}>
                        <Plus size={18} color="#222222" strokeWidth={3} />
                      </TouchableOpacity>
                    </View>
                    {/* 텍스트 영역 */}
                    <View style={{ marginTop: 8, gap: 2 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: '#111' }}>{product.price}</Text>
                        <Text style={{ fontSize: 11, color: '#6a6a6a', textDecorationLine: 'line-through' }}>MSRP {product.msrp}</Text>
                      </View>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: '#222', lineHeight: 18 }} numberOfLines={2}>{product.title}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <StoreIcon size={11} color="#6a6a6a" />
                        <Text style={{ fontSize: 11, color: '#6a6a6a', textDecorationLine: 'underline' }} numberOfLines={1}>{product.store}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                        <Star size={11} color="#6a6a6a" fill="#6a6a6a" />
                        <Text style={{ fontSize: 11, color: '#6a6a6a', fontWeight: '500' }}>{product.rating}</Text>
                        <Text style={{ fontSize: 11, color: '#6a6a6a', marginLeft: 4 }}>{product.minOrder}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* 가게 목록 타이틀 */}
            <View className="mb-2">
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#222222' }}>
                {selectedCategory ? `${selectedCategory} 가게` : '전체 가게'}
              </Text>
            </View>

            {loading && <ActivityIndicator style={{ marginTop: 32 }} color="#FF6B9D" />}
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-white rounded-2xl overflow-hidden"
            style={{
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 3,
            }}
            onPress={() => router.push(`/users/store/${item.id}`)}
          >
            {item.image_url ? (
              <Image source={{ uri: item.image_url }} style={{ width: '100%', height: 160 }} />
            ) : (
              <View
                className="w-full justify-center items-center"
                style={{ height: 160, backgroundColor: '#FFF0F5' }}
              >
                <Text style={{ fontSize: 32 }}>🌸</Text>
              </View>
            )}
            <View style={{ padding: 14 }}>
              <Text className="text-lg font-bold">{item.name}</Text>
              <Text style={{ color: '#6a6a6a', fontSize: 13, marginTop: 4 }} numberOfLines={1}>{item.address}</Text>
              <Text style={{ color: '#6a6a6a', fontSize: 14, marginTop: 6 }} numberOfLines={2}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingHorizontal: H_PAD, paddingBottom: 24, gap: 12 }}
        ListEmptyComponent={
          !loading ? <Text style={{ textAlign: 'center', color: '#6a6a6a', marginTop: 40, fontSize: 15 }}>등록된 가게가 없습니다.</Text> : null
        }
      />
    </SafeAreaView>
  );
}

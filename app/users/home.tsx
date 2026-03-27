import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/useAuthStore';
import { storeService } from '@/services/stores';
import { Store } from '@/types';

const H_PAD = 16;
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
  { emoji: '💍', label: '웨딩 플라워' },
  { emoji: '🕊️', label: '근조 화환' },
  { emoji: '🎉', label: '행사·이벤트' },
  { emoji: '🏠', label: '일상 소비' },
];

type CategoryTab = 'classification' | 'use';

export default function BuyerHomeScreen() {
  const { width } = useWindowDimensions();
  const { profile } = useAuthStore();
  const [stores, setStores] = useState<Store[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [categoryTab, setCategoryTab] = useState<CategoryTab>('classification');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const gridWidth = width - H_PAD * 2;
  const col3Width = (gridWidth - COL_GAP * 2) / 3;
  const col2Width = (gridWidth - COL_GAP) / 2;

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
              <Text style={{ color: '#888', marginTop: 4 }}>오늘도 좋은 꽃을 만나보세요</Text>
            </View>

            {/* 검색 */}
            <View className="mb-3">
              <TextInput
                className="bg-white rounded-xl border"
                style={{ padding: 12, fontSize: 15, borderColor: '#eee' }}
                placeholder="가게 이름으로 검색"
                value={search}
                onChangeText={setSearch}
                onSubmitEditing={() => loadStores(search)}
                returnKeyType="search"
              />
            </View>

            {/* 카테고리 탭 전환 */}
            <View
              className="flex-row mb-3 rounded-xl"
              style={{ backgroundColor: '#efefef', padding: 3 }}
            >
              <TouchableOpacity
                className="flex-1 items-center rounded-lg"
                style={[
                  { paddingVertical: 9 },
                  categoryTab === 'classification'
                    ? {
                        backgroundColor: '#fff',
                        shadowColor: '#000',
                        shadowOpacity: 0.07,
                        shadowRadius: 4,
                        elevation: 2,
                      }
                    : undefined,
                ]}
                onPress={() => { setCategoryTab('classification'); setSelectedCategory(null); }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: categoryTab === 'classification' ? '700' : '500',
                    color: categoryTab === 'classification' ? '#FF6B9D' : '#999',
                  }}
                >
                  분류별
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 items-center rounded-lg"
                style={[
                  { paddingVertical: 9 },
                  categoryTab === 'use'
                    ? {
                        backgroundColor: '#fff',
                        shadowColor: '#000',
                        shadowOpacity: 0.07,
                        shadowRadius: 4,
                        elevation: 2,
                      }
                    : undefined,
                ]}
                onPress={() => { setCategoryTab('use'); setSelectedCategory(null); }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: categoryTab === 'use' ? '700' : '500',
                    color: categoryTab === 'use' ? '#FF6B9D' : '#999',
                  }}
                >
                  용도별
                </Text>
              </TouchableOpacity>
            </View>

            {/* 분류별 — 3열 */}
            {categoryTab === 'classification' && (
              <View className="flex-row flex-wrap mb-5" style={{ gap: COL_GAP }}>
                {CLASSIFICATION_CATEGORIES.map((item) => (
                  <TouchableOpacity
                    key={item.label}
                    style={[
                      {
                        width: col3Width,
                        height: col3Width * 0.85,
                        backgroundColor: selectedCategory === item.label ? '#FFF0F5' : '#fff',
                        borderRadius: 14,
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 7,
                        borderWidth: 1.5,
                        borderColor: selectedCategory === item.label ? '#FF6B9D' : 'transparent',
                      },
                    ]}
                    onPress={() => handleCategorySelect(item.label)}
                  >
                    <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: selectedCategory === item.label ? '#FF6B9D' : '#555',
                        fontWeight: selectedCategory === item.label ? '700' : '500',
                        textAlign: 'center',
                      }}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* 용도별 — 2열 */}
            {categoryTab === 'use' && (
              <View className="flex-row flex-wrap mb-5" style={{ gap: COL_GAP }}>
                {USE_CATEGORIES.map((item) => (
                  <TouchableOpacity
                    key={item.label}
                    style={[
                      {
                        width: col2Width,
                        height: col2Width * 0.6,
                        backgroundColor: selectedCategory === item.label ? '#FFF0F5' : '#fff',
                        borderRadius: 14,
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 7,
                        borderWidth: 1.5,
                        borderColor: selectedCategory === item.label ? '#FF6B9D' : 'transparent',
                      },
                    ]}
                    onPress={() => handleCategorySelect(item.label)}
                  >
                    <Text style={{ fontSize: 30 }}>{item.emoji}</Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: selectedCategory === item.label ? '#FF6B9D' : '#555',
                        fontWeight: selectedCategory === item.label ? '700' : '500',
                        textAlign: 'center',
                      }}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* 가게 목록 타이틀 */}
            <View className="mb-2">
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#333' }}>
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
              elevation: 2,
              shadowColor: '#000',
              shadowOpacity: 0.06,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
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
              <Text style={{ color: '#888', fontSize: 13, marginTop: 4 }} numberOfLines={1}>{item.address}</Text>
              <Text style={{ color: '#555', fontSize: 14, marginTop: 6 }} numberOfLines={2}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingHorizontal: H_PAD, paddingBottom: 24, gap: 12 }}
        ListEmptyComponent={
          !loading ? <Text style={{ textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 15 }}>등록된 가게가 없습니다.</Text> : null
        }
      />
    </SafeAreaView>
  );
}

import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
    <SafeAreaView style={styles.container}>
      <FlatList
        data={stores}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {/* 헤더 */}
            <View style={styles.header}>
              <Text style={styles.greeting}>안녕하세요, {profile?.name}님 👋</Text>
              <Text style={styles.subtitle}>오늘도 좋은 꽃을 만나보세요</Text>
            </View>

            {/* 검색 */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="가게 이름으로 검색"
                value={search}
                onChangeText={setSearch}
                onSubmitEditing={() => loadStores(search)}
                returnKeyType="search"
              />
            </View>

            {/* 카테고리 탭 전환 */}
            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[styles.tab, categoryTab === 'classification' && styles.tabActive]}
                onPress={() => { setCategoryTab('classification'); setSelectedCategory(null); }}
              >
                <Text style={[styles.tabText, categoryTab === 'classification' && styles.tabTextActive]}>
                  분류별
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, categoryTab === 'use' && styles.tabActive]}
                onPress={() => { setCategoryTab('use'); setSelectedCategory(null); }}
              >
                <Text style={[styles.tabText, categoryTab === 'use' && styles.tabTextActive]}>
                  용도별
                </Text>
              </TouchableOpacity>
            </View>

            {/* 분류별 — 3열 */}
            {categoryTab === 'classification' && (
              <View style={styles.gridWrap}>
                {CLASSIFICATION_CATEGORIES.map((item) => (
                  <TouchableOpacity
                    key={item.label}
                    style={[
                      styles.gridBox,
                      { width: col3Width, height: col3Width * 0.85 },
                      selectedCategory === item.label && styles.gridBoxActive,
                    ]}
                    onPress={() => handleCategorySelect(item.label)}
                  >
                    <Text style={styles.gridEmoji}>{item.emoji}</Text>
                    <Text style={[styles.gridLabel, selectedCategory === item.label && styles.gridLabelActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* 용도별 — 2열 */}
            {categoryTab === 'use' && (
              <View style={styles.gridWrap}>
                {USE_CATEGORIES.map((item) => (
                  <TouchableOpacity
                    key={item.label}
                    style={[
                      styles.gridBox,
                      { width: col2Width, height: col2Width * 0.6 },
                      selectedCategory === item.label && styles.gridBoxActive,
                    ]}
                    onPress={() => handleCategorySelect(item.label)}
                  >
                    <Text style={styles.gridEmojiLarge}>{item.emoji}</Text>
                    <Text style={[styles.gridLabel, selectedCategory === item.label && styles.gridLabelActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* 가게 목록 타이틀 */}
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>
                {selectedCategory ? `${selectedCategory} 가게` : '전체 가게'}
              </Text>
            </View>

            {loading && <ActivityIndicator style={{ marginTop: 32 }} color="#FF6B9D" />}
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.storeCard}
            onPress={() => router.push(`/users/store/${item.id}`)}
          >
            {item.image_url ? (
              <Image source={{ uri: item.image_url }} style={styles.storeImage} />
            ) : (
              <View style={[styles.storeImage, styles.storeImagePlaceholder]}>
                <Text style={{ fontSize: 32 }}>🌸</Text>
              </View>
            )}
            <View style={styles.storeInfo}>
              <Text style={styles.storeName}>{item.name}</Text>
              <Text style={styles.storeAddress} numberOfLines={1}>{item.address}</Text>
              <Text style={styles.storeDesc} numberOfLines={2}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingHorizontal: H_PAD, paddingBottom: 24, gap: 12 }}
        ListEmptyComponent={
          !loading ? <Text style={styles.emptyText}>등록된 가게가 없습니다.</Text> : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },

  header: { paddingVertical: 20 },
  greeting: { fontSize: 22, fontWeight: 'bold' },
  subtitle: { color: '#888', marginTop: 4 },

  searchContainer: { marginBottom: 14 },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },

  tabRow: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: '#efefef',
    borderRadius: 10,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: { fontSize: 14, color: '#999', fontWeight: '500' },
  tabTextActive: { color: '#FF6B9D', fontWeight: '700' },

  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: COL_GAP,
    marginBottom: 20,
  },
  gridBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  gridBoxActive: { backgroundColor: '#FFF0F5', borderColor: '#FF6B9D' },
  gridEmoji: { fontSize: 24 },
  gridEmojiLarge: { fontSize: 30 },
  gridLabel: { fontSize: 12, color: '#555', fontWeight: '500', textAlign: 'center' },
  gridLabelActive: { color: '#FF6B9D', fontWeight: '700' },

  listHeader: { marginBottom: 10 },
  listTitle: { fontSize: 15, fontWeight: '700', color: '#333' },

  storeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  storeImage: { width: '100%', height: 160 },
  storeImagePlaceholder: {
    backgroundColor: '#FFF0F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeInfo: { padding: 14 },
  storeName: { fontSize: 18, fontWeight: 'bold' },
  storeAddress: { color: '#888', fontSize: 13, marginTop: 4 },
  storeDesc: { color: '#555', fontSize: 14, marginTop: 6 },
  emptyText: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 15 },
});

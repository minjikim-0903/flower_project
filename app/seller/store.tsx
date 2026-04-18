import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';
import { storeService } from '@/services/stores';
import { Store as StoreIcon } from 'lucide-react-native';
import { Store } from '@/types';

export default function SellerStoreScreen() {
  const { profile } = useAuthStore();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStores = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const data = await storeService.getMyStores(profile.id);
      setStores(data);
    } catch {
      Alert.alert('오류', '가게 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useFocusEffect(useCallback(() => { fetchStores(); }, [fetchStores]));

  const handleToggleActive = async (store: Store) => {
    try {
      const updated = await storeService.updateStore(store.id, {
        is_active: !store.is_active,
      });
      setStores((prev) => prev.map((s) => (s.id === store.id ? updated : s)));
    } catch {
      Alert.alert('오류', '상태 변경에 실패했습니다.');
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#2ECC71" />;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row justify-between items-center p-5 bg-white border-b border-border">
        <Text className="font-bold" style={{ fontSize: 22 }}>내 가게</Text>
        <TouchableOpacity
          className="bg-seller rounded-lg"
          style={{ paddingHorizontal: 14, paddingVertical: 8 }}
          onPress={() => router.push('/seller/store-form')}
        >
          <Text className="text-white font-semibold text-sm">+ 가게 등록</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={stores}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
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
            onPress={() => router.push({ pathname: '/seller/store-form', params: { storeId: item.id } })}
            activeOpacity={0.8}
          >
            {item.image_url ? (
              <Image source={{ uri: item.image_url }} style={{ width: '100%', height: 140 }} />
            ) : (
              <View
                className="w-full justify-center items-center"
                style={{ height: 100, backgroundColor: '#f5f5f5' }}
              >
                <StoreIcon size={28} color="#2ECC71" strokeWidth={1.8} />
              </View>
            )}
            <View style={{ padding: 14, gap: 6 }}>
              <View className="flex-row items-center justify-between">
                <Text style={{ fontSize: 17, fontWeight: '700' }}>{item.name}</Text>
                <View
                  className="rounded-xl"
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 3,
                    backgroundColor: item.is_active ? '#2ECC7120' : '#E7474720',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: item.is_active ? '#2ECC71' : '#E74747',
                    }}
                  >
                    {item.is_active ? '영업중' : '휴업중'}
                  </Text>
                </View>
              </View>
              <Text style={{ color: '#6a6a6a', fontSize: 13 }} numberOfLines={1}>{item.address}</Text>
              {item.description ? (
                <Text style={{ color: '#6a6a6a', fontSize: 13, lineHeight: 18 }} numberOfLines={2}>{item.description}</Text>
              ) : null}
              <View className="flex-row justify-between items-center" style={{ marginTop: 4 }}>
                <Text style={{ color: '#6a6a6a', fontSize: 12 }}>
                  최소주문 {item.min_order_amount.toLocaleString()}원
                </Text>
                <TouchableOpacity
                  className="border rounded-lg"
                  style={{ paddingHorizontal: 12, paddingVertical: 5, borderColor: '#f0f0f0' }}
                  onPress={() => handleToggleActive(item)}
                >
                  <Text style={{ fontSize: 12, color: '#6a6a6a' }}>
                    {item.is_active ? '휴업 처리' : '영업 재개'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="items-center gap-2" style={{ marginTop: 80 }}>
            <StoreIcon size={48} color="#6a6a6a" strokeWidth={1.5} />
            <Text className="text-lg font-bold text-text-primary">등록된 가게가 없습니다</Text>
            <Text className="text-sm" style={{ color: '#6a6a6a' }}>가게를 등록하고 판매를 시작해보세요</Text>
            <TouchableOpacity
              className="bg-seller rounded-xl"
              style={{ marginTop: 8, paddingHorizontal: 24, paddingVertical: 12 }}
              onPress={() => router.push('/seller/store-form')}
            >
              <Text className="text-white font-bold" style={{ fontSize: 15 }}>첫 가게 등록하기</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

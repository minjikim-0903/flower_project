import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Store } from 'lucide-react-native';
import { supabase } from '@/services/supabase';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface SellerWithStore {
  id: string;
  name: string;
  phone: string;
  created_at: string;
  store: {
    id: string;
    name: string;
    business_number: string;
    is_active: boolean;
    created_at: string;
  } | null;
}

export default function AdminSellers() {
  const [sellers, setSellers] = useState<SellerWithStore[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSellers();
  }, []);

  const loadSellers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, phone, created_at, store:stores(id, name, business_number, is_active, created_at)')
        .eq('role', 'seller')
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Supabase returns store as array from join; take first element
      const normalized = (data ?? []).map((s: any) => ({
        ...s,
        store: Array.isArray(s.store) ? (s.store[0] ?? null) : s.store,
      })) as SellerWithStore[];
      setSellers(normalized);
    } catch (e) {
      console.error('sellers load error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStore = (seller: SellerWithStore) => {
    if (!seller.store) return;
    const nextActive = !seller.store.is_active;
    const actionLabel = nextActive ? '승인' : '비활성화';

    Alert.alert(
      `가게 ${actionLabel}`,
      `${seller.store.name} 가게를 ${actionLabel}하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: actionLabel,
          style: nextActive ? 'default' : 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('stores')
                .update({ is_active: nextActive })
                .eq('id', seller.store!.id);

              if (error) throw error;
              setSellers((prev) =>
                prev.map((s) =>
                  s.id === seller.id && s.store
                    ? { ...s, store: { ...s.store, is_active: nextActive } }
                    : s
                )
              );
            } catch (e: any) {
              Alert.alert('오류', e.message ?? '가게 상태 변경에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator color="#6C5CE7" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Text className="font-bold p-5 bg-white" style={{ fontSize: 22, color: '#6C5CE7' }}>
        판매자 관리
      </Text>
      <FlatList
        data={sellers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center" style={{ paddingTop: 60 }}>
            <Store size={44} color="#ccc" strokeWidth={1.5} />
            <Text style={{ color: '#aaa', marginTop: 12 }}>등록된 판매자가 없습니다</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="bg-white rounded-2xl p-4" style={{ gap: 10 }}>
            <View className="flex-row justify-between items-start">
              <View style={{ gap: 2 }}>
                <Text style={{ fontSize: 16, fontWeight: '600' }}>{item.name}</Text>
                <Text style={{ color: '#888', fontSize: 13 }}>{item.phone}</Text>
                <Text style={{ color: '#aaa', fontSize: 12 }}>
                  가입 {format(new Date(item.created_at), 'yyyy.MM.dd', { locale: ko })}
                </Text>
              </View>
              {item.store && (
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 20,
                    backgroundColor: item.store.is_active ? '#2ECC7120' : '#f0f0f0',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: item.store.is_active ? '#2ECC71' : '#aaa',
                    }}
                  >
                    {item.store.is_active ? '운영 중' : '비활성'}
                  </Text>
                </View>
              )}
            </View>

            {item.store ? (
              <View
                className="rounded-xl p-3"
                style={{ backgroundColor: '#FAF7F5', gap: 4 }}
              >
                <Text style={{ fontWeight: '600', fontSize: 14 }}>{item.store.name}</Text>
                <Text style={{ color: '#888', fontSize: 13 }}>
                  사업자번호: {item.store.business_number || '미입력'}
                </Text>
                <Text style={{ color: '#aaa', fontSize: 12 }}>
                  등록 {format(new Date(item.store.created_at), 'yyyy.MM.dd', { locale: ko })}
                </Text>
                <TouchableOpacity
                  className="mt-2 rounded-xl items-center justify-center"
                  style={{
                    paddingVertical: 8,
                    backgroundColor: item.store.is_active ? '#FF3D6C15' : '#6C5CE715',
                  }}
                  onPress={() => handleToggleStore(item)}
                >
                  <Text
                    style={{
                      fontWeight: '600',
                      fontSize: 14,
                      color: item.store.is_active ? '#FF3D6C' : '#6C5CE7',
                    }}
                  >
                    {item.store.is_active ? '비활성화' : '승인'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="rounded-xl p-3" style={{ backgroundColor: '#FFF9E6' }}>
                <Text style={{ color: '#F39C12', fontSize: 13 }}>가게 미등록</Text>
              </View>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

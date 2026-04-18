import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Sprout } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/useAuthStore';
import { storeService } from '@/services/stores';
import { orderService } from '@/services/orders';
import { Store, Order } from '@/types';

export default function SellerHomeScreen() {
  const { profile } = useAuthStore();
  const [store, setStore] = useState<Store | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const myStore = await storeService.getMyStore(profile.id);
      setStore(myStore);
      if (myStore) {
        const orders = await orderService.getSellerOrders(myStore.id);
        setRecentOrders(orders.slice(0, 5));
      }
      setLoading(false);
    })();
  }, [profile]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ActivityIndicator style={{ marginTop: 80 }} color="#2ECC71" />
      </SafeAreaView>
    );
  }

  if (!store) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center p-8 gap-3">
          <Sprout size={50} color="#2ECC71" strokeWidth={1.5} />
          <Text className="font-bold" style={{ fontSize: 22, marginTop: 8 }}>가게를 등록해주세요</Text>
          <Text style={{ color: '#888', textAlign: 'center', lineHeight: 22 }}>
            꽃시장에 가게를 등록하고{'\n'}구매자들에게 꽃을 판매해보세요.
          </Text>
          <TouchableOpacity
            className="bg-seller rounded-xl items-center"
            style={{ paddingHorizontal: 32, paddingVertical: 14, marginTop: 8 }}
            onPress={() => router.push('/(seller)/store')}
          >
            <Text className="text-white font-bold text-base">가게 등록하기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const pendingCount = recentOrders.filter((o) => o.status === 'pending').length;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView>
        <View className="p-5 bg-white">
          <Text className="text-2xl font-bold">{store.name}</Text>
          <Text style={{ color: '#888', marginTop: 4 }}>{profile?.name}님, 안녕하세요</Text>
        </View>

        <View className="flex-row gap-3 p-4">
          <View
            className="flex-1 bg-white rounded-2xl p-4 items-center border border-seller"
          >
            <Text className="font-bold" style={{ fontSize: 28, color: '#2ECC71' }}>{recentOrders.length}</Text>
            <Text style={{ color: '#888', marginTop: 4 }}>전체 주문</Text>
          </View>
          <View
            className="flex-1 bg-white rounded-2xl p-4 items-center border"
            style={{ borderColor: '#FFA500' }}
          >
            <Text className="font-bold" style={{ fontSize: 28, color: '#FFA500' }}>{pendingCount}</Text>
            <Text style={{ color: '#888', marginTop: 4 }}>신규 주문</Text>
          </View>
        </View>

        <View className="m-4 bg-white rounded-2xl p-4">
          <View className="flex-row justify-between mb-3">
            <Text className="font-semibold text-base">최근 주문</Text>
            <TouchableOpacity onPress={() => router.push('/(seller)/orders')}>
              <Text className="text-seller">전체 보기</Text>
            </TouchableOpacity>
          </View>
          {recentOrders.length === 0 ? (
            <Text style={{ color: '#aaa', textAlign: 'center', paddingVertical: 16 }}>아직 주문이 없습니다.</Text>
          ) : (
            recentOrders.map((order) => (
              <View
                key={order.id}
                className="flex-row justify-between border-b"
                style={{ paddingVertical: 10, borderBottomColor: '#f5f5f5' }}
              >
                <View>
                  <Text className="font-medium">{order.buyer?.name}</Text>
                  <Text style={{ color: '#888', fontSize: 13, marginTop: 2 }}>
                    {order.total_price.toLocaleString()}원 · {order.order_type === 'wholesale' ? '도매' : '소매'}
                  </Text>
                </View>
                <Text className="text-seller font-semibold">{order.status}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

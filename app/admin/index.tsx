import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, Store, ShoppingBag, TrendingUp } from 'lucide-react-native';
import { supabase } from '@/services/supabase';

interface Stats {
  sellerCount: number;
  buyerCount: number;
  storeCount: number;
  pendingStoreCount: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    sellerCount: 0,
    buyerCount: 0,
    storeCount: 0,
    pendingStoreCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [sellersRes, buyersRes, storesRes, pendingRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'seller'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'buyer'),
        supabase.from('stores').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('stores').select('id', { count: 'exact', head: true }).eq('is_active', false),
      ]);

      setStats({
        sellerCount: sellersRes.count ?? 0,
        buyerCount: buyersRes.count ?? 0,
        storeCount: storesRes.count ?? 0,
        pendingStoreCount: pendingRes.count ?? 0,
      });
    } catch (e) {
      console.error('stats load error:', e);
    } finally {
      setIsLoading(false);
    }
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
        관리자 대시보드
      </Text>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <View className="flex-row gap-3">
          <StatCard
            label="판매자"
            value={stats.sellerCount}
            icon={<Store size={22} color="#6C5CE7" strokeWidth={1.8} />}
            color="#6C5CE7"
          />
          <StatCard
            label="구매자"
            value={stats.buyerCount}
            icon={<Users size={22} color="#FF3D6C" strokeWidth={1.8} />}
            color="#FF3D6C"
          />
        </View>
        <View className="flex-row gap-3">
          <StatCard
            label="운영 중 가게"
            value={stats.storeCount}
            icon={<ShoppingBag size={22} color="#2ECC71" strokeWidth={1.8} />}
            color="#2ECC71"
          />
          <StatCard
            label="승인 대기 가게"
            value={stats.pendingStoreCount}
            icon={<TrendingUp size={22} color="#F39C12" strokeWidth={1.8} />}
            color="#F39C12"
          />
        </View>

        <View className="bg-white rounded-2xl p-4 mt-2">
          <Text className="font-semibold text-base mb-3" style={{ color: '#333' }}>안내</Text>
          <Text style={{ color: '#888', fontSize: 13, lineHeight: 20 }}>
            판매자 관리 탭에서 가게 승인/비활성화를 처리할 수 있습니다.{'\n'}
            구매자 관리 탭에서 가입한 구매자 목록을 확인할 수 있습니다.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <View className="flex-1 bg-white rounded-2xl p-4 items-center" style={{ gap: 8 }}>
      <View
        className="justify-center items-center"
        style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: `${color}15` }}
      >
        {icon}
      </View>
      <Text style={{ fontSize: 28, fontWeight: 'bold', color }}>{value}</Text>
      <Text style={{ fontSize: 13, color: '#888' }}>{label}</Text>
    </View>
  );
}

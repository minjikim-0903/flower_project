import { Alert } from 'react-native';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import {
  Package,
  Heart,
  MapPin,
  CreditCard,
  Gift,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';

export default function BuyerProfileScreen() {
  const { profile, signOut } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert('로그아웃', '정말 로그아웃 할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', onPress: signOut, style: 'destructive' },
    ]);
  };

  const initial = profile?.name?.[0] ?? '?';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAF7F5' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* 헤더 */}
        <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 }}>
          <Text style={{ fontSize: 26, fontWeight: '800', letterSpacing: -0.6, color: '#0F0F12' }}>
            내 정보
          </Text>
        </View>

        {/* 프로필 카드 */}
        <View style={{ margin: 20, marginBottom: 0 }}>
          <View style={{
            backgroundColor: '#FFFFFF', borderRadius: 18, padding: 20,
            flexDirection: 'row', alignItems: 'center', gap: 14,
            shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 }, elevation: 2,
          }}>
            {/* 아바타 */}
            <View style={{
              width: 56, height: 56, borderRadius: 28,
              backgroundColor: '#FFE0E8',
              alignItems: 'center', justifyContent: 'center',
            }}>
              {profile?.avatar_url ? null : (
                <Text style={{ fontSize: 22, fontWeight: '800', color: '#FF3D6C' }}>
                  {initial}
                </Text>
              )}
            </View>

            {/* 이름 + 역할 */}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 17, fontWeight: '800', color: '#0F0F12', letterSpacing: -0.3 }}>
                {profile?.name ?? '-'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <View style={{
                  paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
                  backgroundColor: '#FFF1F4',
                }}>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#FF3D6C' }}>구매자</Text>
                </View>
                {profile?.phone && (
                  <Text style={{ fontSize: 12, color: '#7A7077' }}>{profile.phone}</Text>
                )}
              </View>
            </View>

            {/* 편집 버튼 */}
            <TouchableOpacity style={{
              paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
              borderWidth: 1, borderColor: '#E2DCD6',
            }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#0F0F12' }}>편집</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 주문/쇼핑 메뉴 그룹 */}
        <View style={{ marginHorizontal: 20, marginTop: 16 }}>
          <View style={{
            backgroundColor: '#FFFFFF', borderRadius: 18,
            paddingHorizontal: 16, paddingVertical: 4,
            shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 }, elevation: 2,
          }}>
            <MenuRow
              Icon={Package}
              label="주문 내역"
              right={<ChevronRight size={16} color="#C4BDB8" strokeWidth={2} />}
              onPress={() => router.push('/users/orders')}
            />
            <MenuRow
              Icon={Heart}
              label="찜한 상품"
              right={<Text style={{ fontSize: 13, color: '#7A7077' }}>0</Text>}
            />
            <MenuRow
              Icon={MapPin}
              label="배송지 관리"
              right={<ChevronRight size={16} color="#C4BDB8" strokeWidth={2} />}
            />
            <MenuRow
              Icon={CreditCard}
              label="결제 수단 관리"
              right={<ChevronRight size={16} color="#C4BDB8" strokeWidth={2} />}
            />
            <MenuRow
              Icon={Gift}
              label="쿠폰 / 포인트"
              right={<Text style={{ fontSize: 13, fontWeight: '700', color: '#FF3D6C' }}>0P</Text>}
              isLast
            />
          </View>
        </View>

        {/* 설정 메뉴 그룹 */}
        <View style={{ marginHorizontal: 20, marginTop: 12 }}>
          <View style={{
            backgroundColor: '#FFFFFF', borderRadius: 18,
            paddingHorizontal: 16, paddingVertical: 4,
            shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 }, elevation: 2,
          }}>
            <MenuRow
              Icon={Bell}
              label="알림 설정"
              right={<ChevronRight size={16} color="#C4BDB8" strokeWidth={2} />}
            />
            <MenuRow
              Icon={Settings}
              label="환경 설정"
              right={<ChevronRight size={16} color="#C4BDB8" strokeWidth={2} />}
            />
            <MenuRow
              Icon={LogOut}
              label="로그아웃"
              danger
              onPress={handleSignOut}
              isLast
            />
          </View>
        </View>

        {/* 주소 정보 */}
        {profile?.address && (
          <View style={{ marginHorizontal: 20, marginTop: 12 }}>
            <View style={{
              backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16,
              shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 }, elevation: 2,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <MapPin size={14} color="#7A7077" strokeWidth={1.8} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#7A7077' }}>기본 배송지</Text>
              </View>
              <Text style={{ fontSize: 14, color: '#0F0F12', lineHeight: 20 }}>{profile.address}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuRow({
  Icon,
  label,
  right,
  onPress,
  danger = false,
  isLast = false,
}: {
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  label: string;
  right?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
  isLast?: boolean;
}) {
  const color = danger ? '#FF3D6C' : '#0F0F12';
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={{
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingVertical: 14,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: '#F5F0EC',
      }}
    >
      <Icon size={20} color={color} strokeWidth={1.8} />
      <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color }}>
        {label}
      </Text>
      {right}
    </TouchableOpacity>
  );
}

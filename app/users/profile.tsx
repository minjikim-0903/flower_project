import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';

export default function BuyerProfileScreen() {
  const { profile, signOut } = useAuthStore();

  const handleSignOut = () => {
    signOut();
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Text className="font-bold p-5 bg-white" style={{ fontSize: 22 }}>내 정보</Text>
      <View className="m-4 bg-white rounded-2xl p-6 items-center">
        <View
          className="justify-center items-center mb-3"
          style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF0F5' }}
        >
          <Text style={{ fontSize: 36 }}>👤</Text>
        </View>
        <Text style={{ fontSize: 22, fontWeight: 'bold' }}>{profile?.name}</Text>
        <Text style={{ color: '#888', marginTop: 4 }}>구매자</Text>
      </View>
      <View className="mx-4 bg-white rounded-2xl p-4">
        <InfoRow label="전화번호" value={profile?.phone || '-'} />
        <InfoRow label="주소" value={profile?.address || '-'} />
      </View>
      <TouchableOpacity className="mx-4 mt-4 p-4 rounded-xl bg-primary items-center" onPress={() => router.replace('/users/home')}>
        <Text className="text-white font-semibold text-base">홈으로</Text>
      </TouchableOpacity>
      <TouchableOpacity className="m-4 p-4 rounded-xl bg-white items-center border border-primary" onPress={handleSignOut}>
        <Text className="text-primary font-semibold text-base">로그아웃</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between border-b" style={{ paddingVertical: 10, borderBottomColor: '#f5f5f5' }}>
      <Text style={{ color: '#888' }}>{label}</Text>
      <Text className="font-medium">{value}</Text>
    </View>
  );
}

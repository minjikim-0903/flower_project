import { View, Text } from 'react-native';
import { User } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';
import { Button, ButtonText } from '@gluestack-ui/themed';

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
          <User size={36} color="#6a6a6a" strokeWidth={1.8} />
        </View>
        <Text style={{ fontSize: 22, fontWeight: 'bold' }}>{profile?.name}</Text>
        <Text style={{ color: '#888', marginTop: 4 }}>구매자</Text>
      </View>
      <View className="mx-4 bg-white rounded-2xl p-4">
        <InfoRow label="전화번호" value={profile?.phone || '-'} />
        <InfoRow label="주소" value={profile?.address || '-'} />
      </View>
      <Button
        onPress={() => router.replace('/users/home')}
        style={{ backgroundColor: '#FF6B9D', borderRadius: 12, minHeight: 52, marginHorizontal: 16, marginTop: 16 }}
      >
        <ButtonText style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>홈으로</ButtonText>
      </Button>
      <Button
        onPress={handleSignOut}
        style={{ backgroundColor: '#fff', borderRadius: 12, minHeight: 52, margin: 16, borderWidth: 1, borderColor: '#FF6B9D' }}
      >
        <ButtonText style={{ color: '#FF6B9D', fontSize: 16, fontWeight: '600' }}>로그아웃</ButtonText>
      </Button>
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

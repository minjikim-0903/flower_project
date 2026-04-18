import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/useAuthStore';
import { Button, ButtonText } from '@gluestack-ui/themed';

export default function SellerSettingScreen() {
  const { profile, signOut } = useAuthStore();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Text className="font-bold p-5 bg-white" style={{ fontSize: 22 }}>설정</Text>
      <View className="m-4 bg-white rounded-2xl p-6 items-center">
        <View
          className="justify-center items-center mb-3"
          style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8F8EF' }}
        >
          <Text style={{ fontSize: 36 }}>👤</Text>
        </View>
        <Text style={{ fontSize: 22, fontWeight: 'bold' }}>{profile?.name}</Text>
        <Text style={{ color: '#888', marginTop: 4 }}>판매자</Text>
      </View>
      <View className="mx-4 bg-white rounded-2xl p-4">
        <View
          className="flex-row justify-between border-b"
          style={{ paddingVertical: 10, borderBottomColor: '#f5f5f5' }}
        >
          <Text style={{ color: '#888' }}>전화번호</Text>
          <Text className="font-medium">{profile?.phone || '-'}</Text>
        </View>
        <View
          className="flex-row justify-between border-b"
          style={{ paddingVertical: 10, borderBottomColor: '#f5f5f5' }}
        >
          <Text style={{ color: '#888' }}>주소</Text>
          <Text className="font-medium">{profile?.address || '-'}</Text>
        </View>
      </View>
      <Button
        onPress={signOut}
        style={{ backgroundColor: '#fff', borderRadius: 12, minHeight: 52, margin: 16, borderWidth: 1, borderColor: '#2ECC71' }}
      >
        <ButtonText style={{ color: '#2ECC71', fontSize: 16, fontWeight: '600' }}>로그아웃</ButtonText>
      </Button>
    </SafeAreaView>
  );
}

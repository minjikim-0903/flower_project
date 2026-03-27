import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/useAuthStore';

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
      <TouchableOpacity
        className="m-4 p-4 rounded-xl bg-white items-center border border-seller"
        onPress={signOut}
      >
        <Text className="text-seller font-semibold text-base">로그아웃</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

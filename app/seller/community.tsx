import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SellerCommunityScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <Text className="font-bold p-5 bg-white" style={{ fontSize: 22 }}>커뮤니티</Text>
      <View className="flex-1 justify-center items-center">
        <Text className="text-text-secondary text-base">커뮤니티 기능이 준비 중입니다.</Text>
      </View>
    </SafeAreaView>
  );
}

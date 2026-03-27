import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DictionaryScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center">
        <Text style={{ fontSize: 56, marginBottom: 16 }}>🌸</Text>
        <Text className="text-text-primary font-bold" style={{ fontSize: 22 }}>꽃 사전</Text>
        <Text className="text-text-secondary text-sm" style={{ marginTop: 8 }}>준비 중입니다</Text>
      </View>
    </SafeAreaView>
  );
}

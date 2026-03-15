import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function UsersLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF6B9D',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: { borderTopWidth: 1, borderTopColor: '#f0f0f0' },
      }}
    >
      {/* 탭에 표시하지 않는 화면 */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="checkout" options={{ href: null }} />
      <Tabs.Screen name="store/[id]" options={{ href: null }} />
      <Tabs.Screen name="order/[id]" options={{ href: null }} />
      <Tabs.Screen name="cart" options={{ href: null }} />
      <Tabs.Screen name="orders" options={{ href: null }} />

      {/* 탭 메뉴: 홈 | 꽃사전 | 설정 */}
      <Tabs.Screen
        name="home"
        options={{
          title: '홈',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="dictionary"
        options={{
          title: '꽃사전',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '설정',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

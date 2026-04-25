import { Tabs } from 'expo-router';
import { Home, BookOpen, ShoppingCart, User } from 'lucide-react-native';

export default function UsersLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF3D6C',
        tabBarInactiveTintColor: '#A8A0A6',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#ECE7E2',
          backgroundColor: 'rgba(255,255,255,0.92)',
        },
      }}
    >
      {/* 탭에 표시하지 않는 화면 */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="checkout" options={{ href: null }} />
      <Tabs.Screen name="store/[id]" options={{ href: null }} />
      <Tabs.Screen name="order/[id]" options={{ href: null }} />
      <Tabs.Screen name="orders" options={{ href: null }} />
      <Tabs.Screen name="payment" options={{ href: null }} />

      {/* 탭 메뉴: 홈 | 꽃사전 | 장바구니 | 내 정보 */}
      <Tabs.Screen
        name="home"
        options={{
          title: '홈',
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="dictionary"
        options={{
          title: '꽃사전',
          tabBarIcon: ({ color, size }) => (
            <BookOpen size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: '장바구니',
          tabBarIcon: ({ color, size }) => (
            <ShoppingCart size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '내 정보',
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

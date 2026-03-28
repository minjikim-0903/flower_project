import { Tabs } from 'expo-router';
import { Store, Flower2, List, User, Users } from 'lucide-react-native';

export default function SellerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2ECC71',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: { borderTopWidth: 1, borderTopColor: '#f0f0f0' },
      }}
    >
      <Tabs.Screen name="home" options={{ href: null }} />
      <Tabs.Screen name="store-form" options={{ href: null }} />
      <Tabs.Screen name="product-form" options={{ href: null }} />
      <Tabs.Screen
        name="community"
        options={{
          title: '커뮤니티',
          tabBarIcon: ({ color, size }) => (
            <Users size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="store"
        options={{
          title: '내 가게',
          tabBarIcon: ({ color, size }) => (
            <Store size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: '판매상품',
          tabBarIcon: ({ color, size }) => (
            <Flower2 size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: '주문',
          tabBarIcon: ({ color, size }) => (
            <List size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="setting"
        options={{
          title: '내 정보',
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}

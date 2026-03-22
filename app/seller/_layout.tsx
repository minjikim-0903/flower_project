import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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
      <Tabs.Screen name="community" options={{ href: null }} />
      <Tabs.Screen
        name="store"
        options={{
          title: '내 가게',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="storefront-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: '판매상품',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flower-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: '주문',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="setting"
        options={{
          title: '내 정보',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}

import { Tabs } from 'expo-router';
import { LayoutGrid, Store, Users } from 'lucide-react-native';

export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6C5CE7',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: { borderTopWidth: 1, borderTopColor: '#f0f0f0' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '대시보드',
          tabBarIcon: ({ color, size }) => (
            <LayoutGrid size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sellers"
        options={{
          title: '판매자',
          tabBarIcon: ({ color, size }) => (
            <Store size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: '구매자',
          tabBarIcon: ({ color, size }) => (
            <Users size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

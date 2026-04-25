import { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users } from 'lucide-react-native';
import { supabase } from '@/services/supabase';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Profile } from '@/types';

export default function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'buyer')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data ?? []);
    } catch (e) {
      console.error('users load error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator color="#6C5CE7" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row justify-between items-center p-5 bg-white">
        <Text className="font-bold" style={{ fontSize: 22, color: '#6C5CE7' }}>구매자 관리</Text>
        <Text style={{ color: '#888', fontSize: 14 }}>총 {users.length}명</Text>
      </View>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center" style={{ paddingTop: 60 }}>
            <Users size={44} color="#ccc" strokeWidth={1.5} />
            <Text style={{ color: '#aaa', marginTop: 12 }}>등록된 구매자가 없습니다</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="bg-white rounded-2xl p-4 flex-row items-center" style={{ gap: 14 }}>
            <View
              className="justify-center items-center"
              style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#FF3D6C15' }}
            >
              <Text style={{ fontSize: 18 }}>👤</Text>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontSize: 15, fontWeight: '600' }}>{item.name}</Text>
              <Text style={{ color: '#888', fontSize: 13 }}>{item.phone || '전화번호 없음'}</Text>
              <Text style={{ color: '#aaa', fontSize: 12 }}>
                가입 {format(new Date(item.created_at), 'yyyy.MM.dd', { locale: ko })}
              </Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

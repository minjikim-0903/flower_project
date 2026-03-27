import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';
import { storeService } from '@/services/stores';
import { Store } from '@/types';

export default function StoreFormScreen() {
  const { profile } = useAuthStore();
  const { storeId } = useLocalSearchParams<{ storeId?: string }>();

  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(!!storeId);
  const [saving, setSaving] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    address: '',
    business_number: '',
    min_order_amount: '',
  });

  useEffect(() => {
    if (!storeId) return;
    (async () => {
      const s = await storeService.getStoreById(storeId);
      setStore(s);
      setForm({
        name: s.name,
        description: s.description,
        address: s.address,
        business_number: s.business_number,
        min_order_amount: String(s.min_order_amount),
      });
      if (s.image_url) setImageUri(s.image_url);
      setLoading(false);
    })();
  }, [storeId]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const handleSave = async () => {
    if (!profile) return;
    if (!form.name || !form.address) {
      Alert.alert('알림', '가게명과 주소는 필수입니다.');
      return;
    }
    setSaving(true);
    try {
      const storeData = {
        seller_id: profile.id,
        name: form.name,
        description: form.description,
        address: form.address,
        business_number: form.business_number,
        min_order_amount: parseInt(form.min_order_amount) || 0,
        is_active: true,
        seller_grade: 'general' as const,
        origin_certification: 'none' as const,
      };

      let savedStore: Store;
      if (store) {
        savedStore = await storeService.updateStore(store.id, storeData);
      } else {
        savedStore = await storeService.createStore(storeData);
      }

      if (imageUri && !imageUri.startsWith('http')) {
        const imageUrl = await storeService.uploadStoreImage(savedStore.id, imageUri);
        await storeService.updateStore(savedStore.id, { image_url: imageUrl });
      }

      Alert.alert('완료', store ? '가게 정보가 수정되었습니다.' : '가게가 등록되었습니다.', [
        { text: '확인', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('오류', '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#2ECC71" />;

  const inputStyle = {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View
        className="flex-row justify-between items-center p-4 bg-white border-b border-border"
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: '#888', fontSize: 15 }}>취소</Text>
        </TouchableOpacity>
        <Text className="font-bold" style={{ fontSize: 17 }}>{store ? '가게 수정' : '가게 등록'}</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text style={[{ color: '#2ECC71', fontWeight: '700', fontSize: 15 }, saving && { opacity: 0.5 }]}>
            {saving ? '저장 중...' : '완료'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <TouchableOpacity className="rounded-2xl overflow-hidden" onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={{ width: '100%', height: 200 }} />
          ) : (
            <View
              className="w-full justify-center items-center border-2"
              style={{
                height: 160,
                backgroundColor: '#f5f5f5',
                borderRadius: 16,
                borderColor: '#ddd',
                borderStyle: 'dashed',
                gap: 8,
              }}
            >
              <Text style={{ fontSize: 32 }}>📸</Text>
              <Text style={{ color: '#aaa', fontSize: 14 }}>가게 사진 등록</Text>
            </View>
          )}
        </TouchableOpacity>

        <View className="gap-1">
          <Text className="font-semibold text-sm" style={{ color: '#555' }}>가게명 *</Text>
          <TextInput
            style={inputStyle}
            value={form.name}
            onChangeText={(v) => setForm({ ...form, name: v })}
            placeholder="예: 서울꽃도매"
          />
        </View>

        <View className="gap-1">
          <Text className="font-semibold text-sm" style={{ color: '#555' }}>주소 *</Text>
          <TextInput
            style={inputStyle}
            value={form.address}
            onChangeText={(v) => setForm({ ...form, address: v })}
            placeholder="예: 서울시 강남구 양재동 화훼공판장"
          />
        </View>

        <View className="gap-1">
          <Text className="font-semibold text-sm" style={{ color: '#555' }}>사업자등록번호</Text>
          <TextInput
            style={inputStyle}
            value={form.business_number}
            onChangeText={(v) => setForm({ ...form, business_number: v })}
            placeholder="예: 123-45-67890"
            keyboardType="numeric"
          />
        </View>

        <View className="gap-1">
          <Text className="font-semibold text-sm" style={{ color: '#555' }}>최소 주문금액 (원)</Text>
          <TextInput
            style={inputStyle}
            value={form.min_order_amount}
            onChangeText={(v) => setForm({ ...form, min_order_amount: v })}
            placeholder="예: 50000"
            keyboardType="numeric"
          />
        </View>

        <View className="gap-1">
          <Text className="font-semibold text-sm" style={{ color: '#555' }}>가게 소개</Text>
          <TextInput
            style={[inputStyle, { minHeight: 100, textAlignVertical: 'top' }]}
            value={form.description}
            onChangeText={(v) => setForm({ ...form, description: v })}
            placeholder="가게 소개글을 입력해주세요"
            multiline
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/useAuthStore';
import { storeService } from '@/services/stores';
import { productService } from '@/services/products';
import { FreshFlowerCategory, Product, ProductType, TreeCategory } from '@/types';

const FRESH_CATEGORIES: { value: FreshFlowerCategory; label: string }[] = [
  { value: 'rose', label: '장미' },
  { value: 'lily', label: '백합' },
  { value: 'tulip', label: '튤립' },
  { value: 'chrysanthemum', label: '국화' },
  { value: 'carnation', label: '카네이션' },
  { value: 'sunflower', label: '해바라기' },
  { value: 'orchid', label: '난초' },
  { value: 'mixed_fresh', label: '혼합' },
  { value: 'other_fresh', label: '기타' },
];

const TREE_CATEGORIES: { value: TreeCategory; label: string }[] = [
  { value: 'fruit_tree', label: '유실수' },
  { value: 'ornamental_tree', label: '관상수' },
  { value: 'conifer', label: '침엽수' },
  { value: 'shrub', label: '관목' },
  { value: 'indoor_plant', label: '실내식물' },
  { value: 'bamboo', label: '대나무' },
  { value: 'mixed_tree', label: '혼합' },
  { value: 'other_tree', label: '기타' },
];

const DEFAULT_FORM = {
  name: '',
  description: '',
  product_type: 'fresh_flower' as ProductType,
  category: 'rose' as FreshFlowerCategory | TreeCategory,
  retail_price: '',
  wholesale_price: '',
  min_wholesale_quantity: '10',
  unit: '단',
  stock: '',
};

export default function ProductsScreen() {
  const { profile } = useAuthStore();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState<ProductType | 'all'>('all');
  const [form, setForm] = useState(DEFAULT_FORM);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const store = await storeService.getMyStore(profile.id);
      if (store) {
        setStoreId(store.id);
        const data = await productService.getProductsByStore(store.id);
        setProducts(data);
      }
      setLoading(false);
    })();
  }, [profile]);

  const currentCategories = form.product_type === 'fresh_flower' ? FRESH_CATEGORIES : TREE_CATEGORIES;

  const handleTypeChange = (type: ProductType) => {
    const defaultCat = type === 'fresh_flower' ? 'rose' : 'fruit_tree';
    setForm({ ...form, product_type: type, category: defaultCat });
  };

  const handleAdd = async () => {
    if (!storeId || !form.name || !form.retail_price || !form.wholesale_price) {
      Alert.alert('알림', '상품명, 소매가, 도매가는 필수입니다.');
      return;
    }
    try {
      const newProduct = await productService.createProduct({
        store_id: storeId,
        name: form.name,
        description: form.description,
        product_type: form.product_type,
        category: form.category,
        retail_price: parseInt(form.retail_price),
        wholesale_price: parseInt(form.wholesale_price),
        min_wholesale_quantity: parseInt(form.min_wholesale_quantity) || 10,
        unit: form.unit,
        stock: parseInt(form.stock) || 0,
        is_available: true,
      });
      setProducts([newProduct, ...products]);
      setShowModal(false);
      setForm(DEFAULT_FORM);
    } catch {
      Alert.alert('오류', '상품 등록에 실패했습니다.');
    }
  };

  const handleToggle = async (product: Product) => {
    try {
      const updated = await productService.updateProduct(product.id, {
        is_available: !product.is_available,
      });
      setProducts(products.map((p) => (p.id === product.id ? updated : p)));
    } catch {
      Alert.alert('오류', '상태 변경에 실패했습니다.');
    }
  };

  const getCategoryLabel = (product: Product) => {
    const list = product.product_type === 'fresh_flower' ? FRESH_CATEGORIES : TREE_CATEGORIES;
    return list.find((c) => c.value === product.category)?.label ?? product.category;
  };

  const filtered = filterType === 'all' ? products : products.filter((p) => p.product_type === filterType);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#2ECC71" />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>상품 관리</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
          <Text style={styles.addButtonText}>+ 추가</Text>
        </TouchableOpacity>
      </View>

      {/* 생화 / 나무 필터 탭 */}
      <View style={styles.filterRow}>
        {([['all', '전체'], ['fresh_flower', '🌸 생화'], ['tree', '🌳 나무']] as const).map(([val, label]) => (
          <TouchableOpacity
            key={val}
            style={[styles.filterTab, filterType === val && styles.filterTabActive]}
            onPress={() => setFilterType(val)}
          >
            <Text style={[styles.filterTabText, filterType === val && styles.filterTabTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <View style={[
              styles.typeDot,
              item.product_type === 'fresh_flower' ? styles.typeDotPink : styles.typeDotGreen,
            ]} />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productMeta}>
                {item.product_type === 'fresh_flower' ? '생화' : '나무'} · {getCategoryLabel(item)}
              </Text>
              <Text style={styles.productPrice}>
                소매 {item.retail_price.toLocaleString()}원 / 도매 {item.wholesale_price.toLocaleString()}원
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.toggleButton, item.is_available ? styles.toggleOn : styles.toggleOff]}
              onPress={() => handleToggle(item)}
            >
              <Text style={[styles.toggleText, { color: item.is_available ? '#2ECC71' : '#E74747' }]}>
                {item.is_available ? '판매중' : '중지'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={{ padding: 12, gap: 8 }}
        ListEmptyComponent={
          <Text style={styles.empty}>등록된 상품이 없습니다.</Text>
        }
      />

      {/* 상품 추가 모달 */}
      <Modal visible={showModal} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => { setShowModal(false); setForm(DEFAULT_FORM); }}>
              <Text style={{ color: '#888', fontSize: 15 }}>취소</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>상품 추가</Text>
            <TouchableOpacity onPress={handleAdd}>
              <Text style={{ color: '#2ECC71', fontWeight: '700', fontSize: 15 }}>완료</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalBody}>
            {/* 생화 / 나무 선택 */}
            <Text style={styles.label}>상품 종류 *</Text>
            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[styles.typeBtn, form.product_type === 'fresh_flower' && styles.typeBtnActivePink]}
                onPress={() => handleTypeChange('fresh_flower')}
              >
                <Text style={[styles.typeBtnText, form.product_type === 'fresh_flower' && styles.typeBtnTextActive]}>
                  🌸 생화
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, form.product_type === 'tree' && styles.typeBtnActiveGreen]}
                onPress={() => handleTypeChange('tree')}
              >
                <Text style={[styles.typeBtnText, form.product_type === 'tree' && styles.typeBtnTextActive]}>
                  🌳 나무
                </Text>
              </TouchableOpacity>
            </View>

            {/* 카테고리 선택 */}
            <Text style={styles.label}>카테고리</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
                {currentCategories.map((c) => (
                  <TouchableOpacity
                    key={c.value}
                    style={[styles.catChip, form.category === c.value && styles.catChipActive]}
                    onPress={() => setForm({ ...form, category: c.value })}
                  >
                    <Text style={[styles.catText, form.category === c.value && styles.catTextActive]}>
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.label}>상품명 *</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(v) => setForm({ ...form, name: v })}
              placeholder="예: 빨간 장미 10송이"
            />

            <View style={styles.row2}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>소매가 (원) *</Text>
                <TextInput
                  style={styles.input}
                  value={form.retail_price}
                  onChangeText={(v) => setForm({ ...form, retail_price: v })}
                  keyboardType="numeric"
                  placeholder="5000"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>도매가 (원) *</Text>
                <TextInput
                  style={styles.input}
                  value={form.wholesale_price}
                  onChangeText={(v) => setForm({ ...form, wholesale_price: v })}
                  keyboardType="numeric"
                  placeholder="3000"
                />
              </View>
            </View>

            <View style={styles.row2}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>최소 도매 수량</Text>
                <TextInput
                  style={styles.input}
                  value={form.min_wholesale_quantity}
                  onChangeText={(v) => setForm({ ...form, min_wholesale_quantity: v })}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>단위</Text>
                <TextInput
                  style={styles.input}
                  value={form.unit}
                  onChangeText={(v) => setForm({ ...form, unit: v })}
                  placeholder="단, 박스, 그루"
                />
              </View>
            </View>

            <Text style={styles.label}>재고</Text>
            <TextInput
              style={styles.input}
              value={form.stock}
              onChangeText={(v) => setForm({ ...form, stock: v })}
              keyboardType="numeric"
              placeholder="100"
            />

            <Text style={styles.label}>상품 설명</Text>
            <TextInput
              style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
              value={form.description}
              onChangeText={(v) => setForm({ ...form, description: v })}
              multiline
              placeholder="상품 설명을 입력해주세요"
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: { fontSize: 22, fontWeight: 'bold' },
  addButton: { backgroundColor: '#2ECC71', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  addButtonText: { color: '#fff', fontWeight: '600' },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  filterTabActive: { borderColor: '#2ECC71', backgroundColor: '#2ECC71' },
  filterTabText: { color: '#666', fontSize: 13 },
  filterTabTextActive: { color: '#fff', fontWeight: '700' },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  typeDot: { width: 10, height: 10, borderRadius: 5 },
  typeDotPink: { backgroundColor: '#FF6B9D' },
  typeDotGreen: { backgroundColor: '#2ECC71' },
  productInfo: { flex: 1 },
  productName: { fontSize: 15, fontWeight: '600' },
  productMeta: { color: '#888', fontSize: 12, marginTop: 2 },
  productPrice: { color: '#555', fontSize: 13, marginTop: 3 },
  toggleButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  toggleOn: { backgroundColor: '#2ECC7120' },
  toggleOff: { backgroundColor: '#E7474720' },
  toggleText: { fontWeight: '600', fontSize: 13 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 15 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: { fontWeight: 'bold', fontSize: 17 },
  modalBody: { padding: 16, gap: 10 },
  label: { fontWeight: '600', color: '#555', fontSize: 14, marginTop: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#fafafa',
  },
  typeRow: { flexDirection: 'row', gap: 12 },
  typeBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  typeBtnActivePink: { borderColor: '#FF6B9D', backgroundColor: '#FFF0F5' },
  typeBtnActiveGreen: { borderColor: '#2ECC71', backgroundColor: '#F0FFF4' },
  typeBtnText: { fontSize: 15, color: '#666' },
  typeBtnTextActive: { fontWeight: '700' },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  catChipActive: { borderColor: '#2ECC71', backgroundColor: '#2ECC71' },
  catText: { color: '#555' },
  catTextActive: { color: '#fff', fontWeight: '600' },
  row2: { flexDirection: 'row', gap: 10 },
});

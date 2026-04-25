import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Input, InputField } from '@gluestack-ui/themed';
import { Button, ButtonText, ButtonSpinner } from '@gluestack-ui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';
import { storeService } from '@/services/stores';
import { productService } from '@/services/products';
import {
  BulkDiscountCondition,
  FreshFlowerCategory,
  ProductType,
  SaleSeason,
  TreeCategory,
} from '@/types';

// ─── 상수 ────────────────────────────────────────────────────────────────────

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

// 카테고리별 품종 목록 (categories.md 기준)
const VARIETY_BY_CATEGORY: Partial<Record<FreshFlowerCategory | TreeCategory, string[]>> = {
  rose:           ['스탠다드 장미', '스프레이 장미'],
  chrysanthemum:  ['스탠다드 국화', '스프레이 국화', '소국'],
  lily:           ['오리엔탈', '아시아틱', 'LA 하이브리드'],
  carnation:      ['스탠다드 카네이션', '스프레이 카네이션'],
  tulip:          ['싱글 튤립', '더블 튤립', '프린지 튤립'],
  sunflower:      ['스탠다드 해바라기', '미니 해바라기'],
  orchid:         ['호접란', '덴드로비움', '심비디움'],
  other_fresh:    ['안개꽃', '루스커스', '유칼립투스', '거베라', '프리지아', '수국', '작약'],
  mixed_fresh:    [],
};

const FLOWER_SIZES = ['소', '중', '대', '특대'];
const FRESHNESS_GRADES = ['A', 'B', 'C'];
const SALE_SEASONS: { value: SaleSeason; label: string }[] = [
  { value: 'year_round', label: '연중' },
  { value: 'spring', label: '봄' },
  { value: 'summer', label: '여름' },
  { value: 'fall', label: '가을' },
  { value: 'winter', label: '겨울' },
];
const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'];
const SHIPPING_METHODS = ['새벽배송', '일반택배', '직접배송'];
const DELIVERABLE_REGIONS = ['전국', '수도권 한정'];
const RECOMMENDED_BUYER_TYPES = [
  { value: 'wedding_event', label: '웨딩·행사용' },
  { value: 'retail_shop', label: '꽃집 소매용' },
  { value: 'general_consumer', label: '일반 소비자' },
];

// ─── 초기값 ──────────────────────────────────────────────────────────────────

const INITIAL_FORM = {
  // Step 1 — 기본 정보
  product_type: 'fresh_flower' as ProductType,
  category: 'rose' as FreshFlowerCategory | TreeCategory,
  name: '',
  variety: '',
  color: [] as string[],
  characteristics: '',

  // Step 2 — 상품 특성
  flower_size: '',
  blooming_season: '',
  freshness_grade: '',
  has_thorns: false,
  has_fragrance: false,

  // Step 3 — 판매 조건
  retail_price: '',
  wholesale_price: '',
  min_order_quantity: '1',
  min_wholesale_quantity: '10',
  unit: '단',
  stock: '',
  sale_start_date: '',
  sale_end_date: '',
  bulk_discount_conditions: [] as BulkDiscountCondition[],

  // Step 4 — 배송 정보
  origin: '',
  deliverable_regions: [] as string[],
  shipping_methods: [] as string[],
  shipping_days_required: '',
  shipping_fee: '0',
  order_cutoff_time: '',
  cold_packaging: false,

  // Step 5 — 일정 & 추천
  available_shipping_days: [] as string[],
  expected_arrival_days: [] as string[],
  harvest_date: '',
  sale_season: 'year_round' as SaleSeason,
  recommended_buyer_types: [] as string[],
  notes: '',
};

const STEPS = ['기본 정보', '판매 조건', '배송 정보', '일정 & 추천'];

// ─── 헬퍼 컴포넌트 ────────────────────────────────────────────────────────────

function SectionLabel({ text, required }: { text: string; required?: boolean }) {
  return (
    <Text className="font-semibold text-sm" style={{ color: '#6a6a6a', marginTop: 6 }}>
      {text}
      {required && <Text style={{ color: '#E74747' }}> *</Text>}
    </Text>
  );
}

function ChipSelect({
  options,
  selected,
  multi,
  onToggle,
}: {
  options: { value: string; label: string }[] | string[];
  selected: string | string[];
  multi?: boolean;
  onToggle: (v: string) => void;
}) {
  const normalized = options.map((o) =>
    typeof o === 'string' ? { value: o, label: o } : o,
  );
  return (
    <View className="flex-row flex-wrap gap-2">
      {normalized.map((o) => {
        const active = multi
          ? (selected as string[]).includes(o.value)
          : selected === o.value;
        return (
          <TouchableOpacity
            key={o.value}
            className="border"
            style={[
              { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
              active
                ? { borderColor: '#2ECC71', backgroundColor: '#2ECC71' }
                : { borderColor: '#f0f0f0', backgroundColor: '#fff' },
            ]}
            onPress={() => onToggle(o.value)}
          >
            <Text style={[{ color: active ? '#fff' : '#6a6a6a', fontSize: 13 }, active && { fontWeight: '600' }]}>
              {o.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <View className="flex-row gap-2 items-end">{children}</View>;
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────

export default function ProductFormScreen() {
  const { profile } = useAuthStore();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [bulkInput, setBulkInput] = useState({ min_quantity: '', discount_rate: '' });

  const set = <K extends keyof typeof INITIAL_FORM>(key: K, value: (typeof INITIAL_FORM)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleArray = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  const handleTypeChange = (type: ProductType) => {
    const defaultCat = type === 'fresh_flower' ? 'rose' : 'fruit_tree';
    setForm((f) => ({ ...f, product_type: type, category: defaultCat }));
  };

  const addBulkDiscount = () => {
    const qty = parseInt(bulkInput.min_quantity);
    const rate = parseInt(bulkInput.discount_rate);
    if (!qty || !rate || rate > 100) return;
    set('bulk_discount_conditions', [
      ...form.bulk_discount_conditions,
      { min_quantity: qty, discount_rate: rate },
    ]);
    setBulkInput({ min_quantity: '', discount_rate: '' });
  };

  const removeBulkDiscount = (idx: number) => {
    set(
      'bulk_discount_conditions',
      form.bulk_discount_conditions.filter((_, i) => i !== idx),
    );
  };

  const validate = () => {
    if (!form.name.trim()) { Alert.alert('알림', '상품명을 입력해주세요.'); return false; }
    if (!form.retail_price) { Alert.alert('알림', '소매가를 입력해주세요.'); return false; }
    if (!form.wholesale_price) { Alert.alert('알림', '도매가를 입력해주세요.'); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const store = await storeService.getMyStore(profile!.id);
      if (!store) { Alert.alert('오류', '가게 정보를 찾을 수 없습니다.'); return; }

      await productService.createProduct({
        store_id: store.id,
        name: form.name,
        description: form.characteristics,
        product_type: form.product_type,
        category: form.category,
        retail_price: parseInt(form.retail_price),
        wholesale_price: parseInt(form.wholesale_price),
        min_wholesale_quantity: parseInt(form.min_wholesale_quantity) || 10,
        unit: form.unit,
        stock: parseInt(form.stock) || 0,
        is_available: true,
        // 기본 정보
        variety: form.variety || undefined,
        color: form.color,
        characteristics: form.characteristics,
        image_urls: [],
        // 상품 특성
        flower_size: (form.flower_size as any) || undefined,
        blooming_season: form.blooming_season,
        freshness_grade: (form.freshness_grade as any) || undefined,
        has_thorns: form.has_thorns,
        has_fragrance: form.has_fragrance,
        // 판매 조건
        min_order_quantity: parseInt(form.min_order_quantity) || 1,
        sale_start_date: form.sale_start_date || undefined,
        sale_end_date: form.sale_end_date || undefined,
        bulk_discount_conditions: form.bulk_discount_conditions,
        // 배송
        origin: form.origin,
        deliverable_regions: form.deliverable_regions,
        shipping_methods: form.shipping_methods,
        shipping_days_required: form.shipping_days_required,
        shipping_fee: parseInt(form.shipping_fee) || 0,
        order_cutoff_time: form.order_cutoff_time,
        cold_packaging: form.cold_packaging,
        // 일정
        available_shipping_days: form.available_shipping_days,
        expected_arrival_days: form.expected_arrival_days,
        harvest_date: form.harvest_date || undefined,
        sale_season: form.sale_season,
        // 추천
        recommended_buyer_types: form.recommended_buyer_types,
        notes: form.notes,
      });

      Alert.alert('완료', '상품이 등록되었습니다.', [
        { text: '확인', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('오류', '상품 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentCategories =
    form.product_type === 'fresh_flower' ? FRESH_CATEGORIES : TREE_CATEGORIES;

  // ─── 각 스텝 렌더 ──────────────────────────────────────────────────────────

  const inputStyle = {
    borderRadius: 10,
    borderColor: '#f0f0f0',
    backgroundColor: '#fafafa',
  };

  const inputFieldStyle = {
    padding: 12,
    fontSize: 15,
  };

  const renderStep1 = () => (
    <>
      <SectionLabel text="상품 종류" required />
      <View className="flex-row gap-3">
        <TouchableOpacity
          className="flex-1 items-center border rounded-xl"
          style={[
            { padding: 14 },
            form.product_type === 'fresh_flower'
              ? { borderColor: '#FF3D6C', backgroundColor: '#FFF0F5' }
              : { borderColor: '#f0f0f0' },
          ]}
          onPress={() => handleTypeChange('fresh_flower')}
        >
          <Text
            style={[
              { fontSize: 15, color: '#6a6a6a' },
              form.product_type === 'fresh_flower' && { fontWeight: '700' },
            ]}
          >
            생화
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 items-center border rounded-xl"
          style={[
            { padding: 14 },
            form.product_type === 'tree'
              ? { borderColor: '#2ECC71', backgroundColor: '#F0FFF4' }
              : { borderColor: '#f0f0f0' },
          ]}
          onPress={() => handleTypeChange('tree')}
        >
          <Text
            style={[
              { fontSize: 15, color: '#6a6a6a' },
              form.product_type === 'tree' && { fontWeight: '700' },
            ]}
          >
            나무
          </Text>
        </TouchableOpacity>
      </View>

      <SectionLabel text="카테고리" required />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
          {currentCategories.map((c) => (
            <TouchableOpacity
              key={c.value}
              className="border"
              style={[
                { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
                form.category === c.value
                  ? { borderColor: '#2ECC71', backgroundColor: '#2ECC71' }
                  : { borderColor: '#f0f0f0', backgroundColor: '#fff' },
              ]}
              onPress={() => set('category', c.value)}
            >
              <Text
                style={[
                  { color: form.category === c.value ? '#fff' : '#6a6a6a', fontSize: 13 },
                  form.category === c.value && { fontWeight: '600' },
                ]}
              >
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <SectionLabel text="품명" required />
      <Input variant="outline" style={inputStyle}>
        <InputField
          value={form.name}
          onChangeText={(v) => set('name', v)}
          placeholder="예: 레드 장미 20송이"
          style={inputFieldStyle}
        />
      </Input>

      <SectionLabel text="품종" />
      {(VARIETY_BY_CATEGORY[form.category as FreshFlowerCategory | TreeCategory] ?? []).length > 0 && (
        <ChipSelect
          options={VARIETY_BY_CATEGORY[form.category as FreshFlowerCategory | TreeCategory]!}
          selected={form.variety}
          onToggle={(v) => set('variety', form.variety === v ? '' : v)}
        />
      )}
      <Input variant="outline" style={{ ...inputStyle, marginTop: 6 }}>
        <InputField
          value={form.variety}
          onChangeText={(v) => set('variety', v)}
          placeholder="직접 입력 (예: 오하라, 엘레강스)"
          style={inputFieldStyle}
        />
      </Input>

      <SectionLabel text="컬러" />
      <ChipSelect
        options={['빨강', '분홍', '흰색', '노랑', '주황', '보라', '혼합']}
        selected={form.color}
        multi
        onToggle={(v) => set('color', toggleArray(form.color, v))}
      />

      <SectionLabel text="꽃 크기" />
      <ChipSelect
        options={FLOWER_SIZES}
        selected={form.flower_size}
        onToggle={(v) => set('flower_size', form.flower_size === v ? '' : v)}
      />

      <SectionLabel text="개화 시기" />
      <Input variant="outline" style={inputStyle}>
        <InputField
          value={form.blooming_season}
          onChangeText={(v) => set('blooming_season', v)}
          placeholder="예: 3월~5월, 연중"
          style={inputFieldStyle}
        />
      </Input>

      <SectionLabel text="신선도 등급" />
      <ChipSelect
        options={FRESHNESS_GRADES}
        selected={form.freshness_grade}
        onToggle={(v) => set('freshness_grade', form.freshness_grade === v ? '' : v)}
      />

      <SectionLabel text="특징" />
      <Input variant="outline" style={inputStyle}>
        <InputField
          value={form.characteristics}
          onChangeText={(v) => set('characteristics', v)}
          multiline
          placeholder="예: 꽃잎이 풍성하고 향기가 좋음"
          style={{ ...inputFieldStyle, minHeight: 80, textAlignVertical: 'top' }}
        />
      </Input>

      <View
        className="flex-row justify-between items-center border rounded-lg"
        style={{ backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 12, borderColor: '#f0f0f0', marginTop: 6 }}
      >
        <Text style={{ fontSize: 15, color: '#222222' }}>가시 있음</Text>
        <Switch
          value={form.has_thorns}
          onValueChange={(v) => set('has_thorns', v)}
          trackColor={{ true: '#2ECC71' }}
        />
      </View>

      <View
        className="flex-row justify-between items-center border rounded-lg"
        style={{ backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 12, borderColor: '#f0f0f0', marginTop: 6 }}
      >
        <Text style={{ fontSize: 15, color: '#222222' }}>향기 있음</Text>
        <Switch
          value={form.has_fragrance}
          onValueChange={(v) => set('has_fragrance', v)}
          trackColor={{ true: '#2ECC71' }}
        />
      </View>
    </>
  );

  const renderStep3 = () => (
    <>
      <Row>
        <View style={{ flex: 1 }}>
          <SectionLabel text="소매가 (원)" required />
          <Input variant="outline" style={inputStyle}>
            <InputField
              value={form.retail_price}
              onChangeText={(v) => set('retail_price', v)}
              keyboardType="numeric"
              placeholder="5000"
              style={inputFieldStyle}
            />
          </Input>
        </View>
        <View style={{ flex: 1 }}>
          <SectionLabel text="도매가 (원)" required />
          <Input variant="outline" style={inputStyle}>
            <InputField
              value={form.wholesale_price}
              onChangeText={(v) => set('wholesale_price', v)}
              keyboardType="numeric"
              placeholder="3000"
              style={inputFieldStyle}
            />
          </Input>
        </View>
      </Row>

      <Row>
        <View style={{ flex: 1 }}>
          <SectionLabel text="최소주문수량" />
          <Input variant="outline" style={inputStyle}>
            <InputField
              value={form.min_order_quantity}
              onChangeText={(v) => set('min_order_quantity', v)}
              keyboardType="numeric"
              style={inputFieldStyle}
            />
          </Input>
        </View>
        <View style={{ flex: 1 }}>
          <SectionLabel text="최소도매수량" />
          <Input variant="outline" style={inputStyle}>
            <InputField
              value={form.min_wholesale_quantity}
              onChangeText={(v) => set('min_wholesale_quantity', v)}
              keyboardType="numeric"
              style={inputFieldStyle}
            />
          </Input>
        </View>
      </Row>

      <Row>
        <View style={{ flex: 1 }}>
          <SectionLabel text="단위" />
          <Input variant="outline" style={inputStyle}>
            <InputField
              value={form.unit}
              onChangeText={(v) => set('unit', v)}
              placeholder="단, 박스, 그루"
              style={inputFieldStyle}
            />
          </Input>
        </View>
        <View style={{ flex: 1 }}>
          <SectionLabel text="재고수량" />
          <Input variant="outline" style={inputStyle}>
            <InputField
              value={form.stock}
              onChangeText={(v) => set('stock', v)}
              keyboardType="numeric"
              placeholder="100"
              style={inputFieldStyle}
            />
          </Input>
        </View>
      </Row>

      <SectionLabel text="판매기간" />
      <Row>
        <View style={{ flex: 1 }}>
          <Input variant="outline" style={inputStyle}>
            <InputField
              value={form.sale_start_date}
              onChangeText={(v) => set('sale_start_date', v)}
              placeholder="시작 YYYY-MM-DD"
              style={inputFieldStyle}
            />
          </Input>
        </View>
        <View style={{ flex: 1 }}>
          <Input variant="outline" style={inputStyle}>
            <InputField
              value={form.sale_end_date}
              onChangeText={(v) => set('sale_end_date', v)}
              placeholder="종료 YYYY-MM-DD"
              style={inputFieldStyle}
            />
          </Input>
        </View>
      </Row>

      <SectionLabel text="대량할인 조건" />
      {form.bulk_discount_conditions.map((d, i) => (
        <View
          key={i}
          className="flex-row justify-between items-center rounded-lg"
          style={{ backgroundColor: '#F0FFF4', padding: 10, marginBottom: 4 }}
        >
          <Text style={{ color: '#2ECC71', fontWeight: '600' }}>
            {d.min_quantity}개 이상 → {d.discount_rate}% 할인
          </Text>
          <TouchableOpacity onPress={() => removeBulkDiscount(i)}>
            <Text style={{ color: '#E74747', fontWeight: '600' }}>삭제</Text>
          </TouchableOpacity>
        </View>
      ))}
      <Row>
        <View style={{ flex: 1 }}>
          <Input variant="outline" style={inputStyle}>
            <InputField
              value={bulkInput.min_quantity}
              onChangeText={(v) => setBulkInput((b) => ({ ...b, min_quantity: v }))}
              keyboardType="numeric"
              placeholder="최소 수량"
              style={inputFieldStyle}
            />
          </Input>
        </View>
        <View style={{ flex: 1 }}>
          <Input variant="outline" style={inputStyle}>
            <InputField
              value={bulkInput.discount_rate}
              onChangeText={(v) => setBulkInput((b) => ({ ...b, discount_rate: v }))}
              keyboardType="numeric"
              placeholder="할인율 (%)"
              style={inputFieldStyle}
            />
          </Input>
        </View>
        <TouchableOpacity
          className="bg-seller rounded-lg items-center justify-center"
          style={{ padding: 12 }}
          onPress={addBulkDiscount}
        >
          <Text className="text-white font-bold">추가</Text>
        </TouchableOpacity>
      </Row>
    </>
  );

  const renderStep4 = () => (
    <>
      <SectionLabel text="출하지 (산지)" />
      <Input variant="outline" style={inputStyle}>
        <InputField
          value={form.origin}
          onChangeText={(v) => set('origin', v)}
          placeholder="예: 경남 진주, 전북 익산"
          style={inputFieldStyle}
        />
      </Input>

      <SectionLabel text="배송 가능 지역" />
      <ChipSelect
        options={DELIVERABLE_REGIONS}
        selected={form.deliverable_regions}
        multi
        onToggle={(v) => set('deliverable_regions', toggleArray(form.deliverable_regions, v))}
      />

      <SectionLabel text="배송 방법" />
      <ChipSelect
        options={SHIPPING_METHODS}
        selected={form.shipping_methods}
        multi
        onToggle={(v) => set('shipping_methods', toggleArray(form.shipping_methods, v))}
      />

      <Row>
        <View style={{ flex: 1 }}>
          <SectionLabel text="배송 소요일" />
          <Input variant="outline" style={inputStyle}>
            <InputField
              value={form.shipping_days_required}
              onChangeText={(v) => set('shipping_days_required', v)}
              placeholder="예: 주문 후 익일"
              style={inputFieldStyle}
            />
          </Input>
        </View>
        <View style={{ flex: 1 }}>
          <SectionLabel text="배송비 (원)" />
          <Input variant="outline" style={inputStyle}>
            <InputField
              value={form.shipping_fee}
              onChangeText={(v) => set('shipping_fee', v)}
              keyboardType="numeric"
              placeholder="0 = 무료"
              style={inputFieldStyle}
            />
          </Input>
        </View>
      </Row>

      <SectionLabel text="주문 마감 시간" />
      <Input variant="outline" style={inputStyle}>
        <InputField
          value={form.order_cutoff_time}
          onChangeText={(v) => set('order_cutoff_time', v)}
          placeholder="예: 오후 2시"
          style={inputFieldStyle}
        />
      </Input>

      <View
        className="flex-row justify-between items-center border rounded-lg"
        style={{ backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 12, borderColor: '#f0f0f0', marginTop: 6 }}
      >
        <Text style={{ fontSize: 15, color: '#222222' }}>보냉 포장</Text>
        <Switch
          value={form.cold_packaging}
          onValueChange={(v) => set('cold_packaging', v)}
          trackColor={{ true: '#2ECC71' }}
        />
      </View>
    </>
  );

  const renderStep5 = () => (
    <>
      <SectionLabel text="출하 가능 요일" />
      <ChipSelect
        options={WEEKDAYS}
        selected={form.available_shipping_days}
        multi
        onToggle={(v) =>
          set('available_shipping_days', toggleArray(form.available_shipping_days, v))
        }
      />

      <SectionLabel text="입고 예정 요일" />
      <ChipSelect
        options={WEEKDAYS}
        selected={form.expected_arrival_days}
        multi
        onToggle={(v) =>
          set('expected_arrival_days', toggleArray(form.expected_arrival_days, v))
        }
      />

      <SectionLabel text="수확일" />
      <Input variant="outline" style={inputStyle}>
        <InputField
          value={form.harvest_date}
          onChangeText={(v) => set('harvest_date', v)}
          placeholder="YYYY-MM-DD"
          style={inputFieldStyle}
        />
      </Input>

      <SectionLabel text="판매 시즌" />
      <ChipSelect
        options={SALE_SEASONS}
        selected={form.sale_season}
        onToggle={(v) => set('sale_season', v as SaleSeason)}
      />

      <SectionLabel text="추천 구매자" />
      <ChipSelect
        options={RECOMMENDED_BUYER_TYPES}
        selected={form.recommended_buyer_types}
        multi
        onToggle={(v) =>
          set('recommended_buyer_types', toggleArray(form.recommended_buyer_types, v))
        }
      />

      <SectionLabel text="유의사항" />
      <Input variant="outline" style={inputStyle}>
        <InputField
          value={form.notes}
          onChangeText={(v) => set('notes', v)}
          multiline
          placeholder="예: 계절·날씨에 따라 색상 차이 있을 수 있음"
          style={{ ...inputFieldStyle, minHeight: 80, textAlignVertical: 'top' }}
        />
      </Input>
    </>
  );

  const stepRenderers = [renderStep1, renderStep3, renderStep4, renderStep5];

  // ─── 렌더 ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* 헤더 */}
      <View
        className="flex-row justify-between items-center p-4 bg-white border-b border-border"
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: '#6a6a6a', fontSize: 15 }}>취소</Text>
        </TouchableOpacity>
        <Text className="font-bold" style={{ fontSize: 17 }}>상품 등록</Text>
        {step === STEPS.length - 1 ? (
          <TouchableOpacity onPress={handleSubmit} disabled={submitting}>
            <Text style={[{ color: '#2ECC71', fontWeight: '700', fontSize: 15 }, submitting && { opacity: 0.5 }]}>
              {submitting ? '저장 중...' : '완료'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      {/* 스텝 인디케이터 */}
      <View
        className="flex-row bg-white border-b border-border"
        style={{ paddingHorizontal: 12, paddingVertical: 12 }}
      >
        {STEPS.map((s, i) => (
          <View key={i} className="flex-1 items-center gap-1">
            <View
              className="items-center justify-center"
              style={[
                { width: 24, height: 24, borderRadius: 12 },
                i <= step ? { backgroundColor: '#2ECC71' } : { backgroundColor: '#f0f0f0' },
              ]}
            >
              <Text style={[{ fontSize: 11, fontWeight: '700' }, i <= step ? { color: '#fff' } : { color: '#6a6a6a' }]}>
                {i + 1}
              </Text>
            </View>
            <Text
              style={[
                { fontSize: 10, textAlign: 'center' },
                i === step ? { color: '#2ECC71', fontWeight: '700' } : { color: '#6a6a6a' },
              ]}
              numberOfLines={1}
            >
              {s}
            </Text>
          </View>
        ))}
      </View>

      {/* 폼 내용 */}
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 32 }}>
        <Text className="text-lg font-bold" style={{ color: '#222', marginBottom: 4 }}>{STEPS[step]}</Text>
        {stepRenderers[step]()}
      </ScrollView>

      {/* 이전 / 다음 버튼 */}
      <View
        className="flex-row gap-2 p-4 bg-white border-t border-border"
      >
        {step > 0 && (
          <TouchableOpacity
            className="flex-1 items-center border rounded-xl"
            style={{ padding: 14, borderColor: '#f0f0f0', minHeight: 52 }}
            onPress={() => setStep((s) => s - 1)}
          >
            <Text style={{ color: '#6a6a6a', fontWeight: '600', fontSize: 15 }}>이전</Text>
          </TouchableOpacity>
        )}
        {step < STEPS.length - 1 && (
          <TouchableOpacity
            className="items-center rounded-xl"
            style={[{ padding: 14, backgroundColor: '#222222', minHeight: 52 }, step === 0 && { flex: 1 }, step > 0 && { flex: 2 }]}
            onPress={() => setStep((s) => s + 1)}
          >
            <Text className="text-white font-bold" style={{ fontSize: 15 }}>다음</Text>
          </TouchableOpacity>
        )}
        {step === STEPS.length - 1 && (
          <Button
            className="flex-1"
            isDisabled={submitting}
            onPress={handleSubmit}
            style={{ backgroundColor: '#2ECC71', borderRadius: 12, height: 52, opacity: submitting ? 0.6 : 1 }}
          >
            {submitting && <ButtonSpinner color="white" mr="$2" />}
            <ButtonText style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>
              {submitting ? '저장 중...' : '상품 등록 완료'}
            </ButtonText>
          </Button>
        )}
      </View>
    </SafeAreaView>
  );
}

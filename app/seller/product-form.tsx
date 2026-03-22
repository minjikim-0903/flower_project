import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
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
    <Text style={styles.label}>
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
    <View style={styles.chipRow}>
      {normalized.map((o) => {
        const active = multi
          ? (selected as string[]).includes(o.value)
          : selected === o.value;
        return (
          <TouchableOpacity
            key={o.value}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onToggle(o.value)}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{o.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <View style={styles.row2}>{children}</View>;
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

  const renderStep1 = () => (
    <>
      <SectionLabel text="상품 종류" required />
      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[styles.typeBtn, form.product_type === 'fresh_flower' && styles.typeBtnPink]}
          onPress={() => handleTypeChange('fresh_flower')}
        >
          <Text style={[styles.typeBtnText, form.product_type === 'fresh_flower' && styles.typeBtnTextActive]}>
            🌸 생화
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeBtn, form.product_type === 'tree' && styles.typeBtnGreen]}
          onPress={() => handleTypeChange('tree')}
        >
          <Text style={[styles.typeBtnText, form.product_type === 'tree' && styles.typeBtnTextActive]}>
            🌳 나무
          </Text>
        </TouchableOpacity>
      </View>

      <SectionLabel text="카테고리" required />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
          {currentCategories.map((c) => (
            <TouchableOpacity
              key={c.value}
              style={[styles.chip, form.category === c.value && styles.chipActive]}
              onPress={() => set('category', c.value)}
            >
              <Text style={[styles.chipText, form.category === c.value && styles.chipTextActive]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <SectionLabel text="품명" required />
      <TextInput
        style={styles.input}
        value={form.name}
        onChangeText={(v) => set('name', v)}
        placeholder="예: 레드 장미 20송이"
      />

      <SectionLabel text="품종" />
      {(VARIETY_BY_CATEGORY[form.category as FreshFlowerCategory | TreeCategory] ?? []).length > 0 && (
        <ChipSelect
          options={VARIETY_BY_CATEGORY[form.category as FreshFlowerCategory | TreeCategory]!}
          selected={form.variety}
          onToggle={(v) => set('variety', form.variety === v ? '' : v)}
        />
      )}
      <TextInput
        style={[styles.input, { marginTop: 6 }]}
        value={form.variety}
        onChangeText={(v) => set('variety', v)}
        placeholder="직접 입력 (예: 오하라, 엘레강스)"
      />

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
      <TextInput
        style={styles.input}
        value={form.blooming_season}
        onChangeText={(v) => set('blooming_season', v)}
        placeholder="예: 3월~5월, 연중"
      />

      <SectionLabel text="신선도 등급" />
      <ChipSelect
        options={FRESHNESS_GRADES}
        selected={form.freshness_grade}
        onToggle={(v) => set('freshness_grade', form.freshness_grade === v ? '' : v)}
      />

      <SectionLabel text="특징" />
      <TextInput
        style={[styles.input, styles.multiline]}
        value={form.characteristics}
        onChangeText={(v) => set('characteristics', v)}
        multiline
        placeholder="예: 꽃잎이 풍성하고 향기가 좋음"
      />

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>가시 있음</Text>
        <Switch
          value={form.has_thorns}
          onValueChange={(v) => set('has_thorns', v)}
          trackColor={{ true: '#2ECC71' }}
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>향기 있음</Text>
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
          <TextInput
            style={styles.input}
            value={form.retail_price}
            onChangeText={(v) => set('retail_price', v)}
            keyboardType="numeric"
            placeholder="5000"
          />
        </View>
        <View style={{ flex: 1 }}>
          <SectionLabel text="도매가 (원)" required />
          <TextInput
            style={styles.input}
            value={form.wholesale_price}
            onChangeText={(v) => set('wholesale_price', v)}
            keyboardType="numeric"
            placeholder="3000"
          />
        </View>
      </Row>

      <Row>
        <View style={{ flex: 1 }}>
          <SectionLabel text="최소주문수량" />
          <TextInput
            style={styles.input}
            value={form.min_order_quantity}
            onChangeText={(v) => set('min_order_quantity', v)}
            keyboardType="numeric"
          />
        </View>
        <View style={{ flex: 1 }}>
          <SectionLabel text="최소도매수량" />
          <TextInput
            style={styles.input}
            value={form.min_wholesale_quantity}
            onChangeText={(v) => set('min_wholesale_quantity', v)}
            keyboardType="numeric"
          />
        </View>
      </Row>

      <Row>
        <View style={{ flex: 1 }}>
          <SectionLabel text="단위" />
          <TextInput
            style={styles.input}
            value={form.unit}
            onChangeText={(v) => set('unit', v)}
            placeholder="단, 박스, 그루"
          />
        </View>
        <View style={{ flex: 1 }}>
          <SectionLabel text="재고수량" />
          <TextInput
            style={styles.input}
            value={form.stock}
            onChangeText={(v) => set('stock', v)}
            keyboardType="numeric"
            placeholder="100"
          />
        </View>
      </Row>

      <SectionLabel text="판매기간" />
      <Row>
        <View style={{ flex: 1 }}>
          <TextInput
            style={styles.input}
            value={form.sale_start_date}
            onChangeText={(v) => set('sale_start_date', v)}
            placeholder="시작 YYYY-MM-DD"
          />
        </View>
        <View style={{ flex: 1 }}>
          <TextInput
            style={styles.input}
            value={form.sale_end_date}
            onChangeText={(v) => set('sale_end_date', v)}
            placeholder="종료 YYYY-MM-DD"
          />
        </View>
      </Row>

      <SectionLabel text="대량할인 조건" />
      {form.bulk_discount_conditions.map((d, i) => (
        <View key={i} style={styles.bulkRow}>
          <Text style={styles.bulkText}>
            {d.min_quantity}개 이상 → {d.discount_rate}% 할인
          </Text>
          <TouchableOpacity onPress={() => removeBulkDiscount(i)}>
            <Text style={{ color: '#E74747', fontWeight: '600' }}>삭제</Text>
          </TouchableOpacity>
        </View>
      ))}
      <Row>
        <View style={{ flex: 1 }}>
          <TextInput
            style={styles.input}
            value={bulkInput.min_quantity}
            onChangeText={(v) => setBulkInput((b) => ({ ...b, min_quantity: v }))}
            keyboardType="numeric"
            placeholder="최소 수량"
          />
        </View>
        <View style={{ flex: 1 }}>
          <TextInput
            style={styles.input}
            value={bulkInput.discount_rate}
            onChangeText={(v) => setBulkInput((b) => ({ ...b, discount_rate: v }))}
            keyboardType="numeric"
            placeholder="할인율 (%)"
          />
        </View>
        <TouchableOpacity style={styles.addRowBtn} onPress={addBulkDiscount}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>추가</Text>
        </TouchableOpacity>
      </Row>
    </>
  );

  const renderStep4 = () => (
    <>
      <SectionLabel text="출하지 (산지)" />
      <TextInput
        style={styles.input}
        value={form.origin}
        onChangeText={(v) => set('origin', v)}
        placeholder="예: 경남 진주, 전북 익산"
      />

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
          <TextInput
            style={styles.input}
            value={form.shipping_days_required}
            onChangeText={(v) => set('shipping_days_required', v)}
            placeholder="예: 주문 후 익일"
          />
        </View>
        <View style={{ flex: 1 }}>
          <SectionLabel text="배송비 (원)" />
          <TextInput
            style={styles.input}
            value={form.shipping_fee}
            onChangeText={(v) => set('shipping_fee', v)}
            keyboardType="numeric"
            placeholder="0 = 무료"
          />
        </View>
      </Row>

      <SectionLabel text="주문 마감 시간" />
      <TextInput
        style={styles.input}
        value={form.order_cutoff_time}
        onChangeText={(v) => set('order_cutoff_time', v)}
        placeholder="예: 오후 2시"
      />

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>보냉 포장</Text>
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
      <TextInput
        style={styles.input}
        value={form.harvest_date}
        onChangeText={(v) => set('harvest_date', v)}
        placeholder="YYYY-MM-DD"
      />

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
      <TextInput
        style={[styles.input, styles.multiline]}
        value={form.notes}
        onChangeText={(v) => set('notes', v)}
        multiline
        placeholder="예: 계절·날씨에 따라 색상 차이 있을 수 있음"
      />
    </>
  );

  const stepRenderers = [renderStep1, renderStep3, renderStep4, renderStep5];

  // ─── 렌더 ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.headerCancel}>취소</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>상품 등록</Text>
        {step === STEPS.length - 1 ? (
          <TouchableOpacity onPress={handleSubmit} disabled={submitting}>
            <Text style={[styles.headerAction, submitting && { opacity: 0.5 }]}>
              {submitting ? '저장 중...' : '완료'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      {/* 스텝 인디케이터 */}
      <View style={styles.stepBar}>
        {STEPS.map((s, i) => (
          <View key={i} style={styles.stepItem}>
            <View style={[styles.stepDot, i <= step && styles.stepDotActive]}>
              <Text style={[styles.stepNum, i <= step && styles.stepNumActive]}>
                {i + 1}
              </Text>
            </View>
            <Text style={[styles.stepLabel, i === step && styles.stepLabelActive]} numberOfLines={1}>
              {s}
            </Text>
          </View>
        ))}
      </View>

      {/* 폼 내용 */}
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.sectionTitle}>{STEPS[step]}</Text>
        {stepRenderers[step]()}
      </ScrollView>

      {/* 이전 / 다음 버튼 */}
      <View style={styles.footer}>
        {step > 0 && (
          <TouchableOpacity style={styles.prevBtn} onPress={() => setStep((s) => s - 1)}>
            <Text style={styles.prevBtnText}>이전</Text>
          </TouchableOpacity>
        )}
        {step < STEPS.length - 1 && (
          <TouchableOpacity
            style={[styles.nextBtn, step === 0 && { flex: 1 }]}
            onPress={() => setStep((s) => s + 1)}
          >
            <Text style={styles.nextBtnText}>다음</Text>
          </TouchableOpacity>
        )}
        {step === STEPS.length - 1 && (
          <TouchableOpacity
            style={[styles.nextBtn, { flex: 1, backgroundColor: '#2ECC71' }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={styles.nextBtnText}>{submitting ? '저장 중...' : '상품 등록 완료'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── 스타일 ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerCancel: { color: '#888', fontSize: 15 },
  headerTitle: { fontWeight: 'bold', fontSize: 17 },
  headerAction: { color: '#2ECC71', fontWeight: '700', fontSize: 15 },

  stepBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  stepItem: { flex: 1, alignItems: 'center', gap: 4 },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: '#2ECC71' },
  stepNum: { fontSize: 11, fontWeight: '700', color: '#aaa' },
  stepNumActive: { color: '#fff' },
  stepLabel: { fontSize: 10, color: '#aaa', textAlign: 'center' },
  stepLabelActive: { color: '#2ECC71', fontWeight: '700' },

  body: { padding: 16, gap: 10, paddingBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#222', marginBottom: 4 },

  label: { fontWeight: '600', color: '#555', fontSize: 14, marginTop: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#fafafa',
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },

  typeRow: { flexDirection: 'row', gap: 12 },
  typeBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  typeBtnPink: { borderColor: '#FF6B9D', backgroundColor: '#FFF0F5' },
  typeBtnGreen: { borderColor: '#2ECC71', backgroundColor: '#F0FFF4' },
  typeBtnText: { fontSize: 15, color: '#666' },
  typeBtnTextActive: { fontWeight: '700' },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  chipActive: { borderColor: '#2ECC71', backgroundColor: '#2ECC71' },
  chipText: { color: '#555', fontSize: 13 },
  chipTextActive: { color: '#fff', fontWeight: '600' },

  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 6,
  },
  switchLabel: { fontSize: 15, color: '#333' },

  row2: { flexDirection: 'row', gap: 10, alignItems: 'flex-end' },

  bulkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0FFF4',
    borderRadius: 8,
    padding: 10,
    marginBottom: 4,
  },
  bulkText: { color: '#2ECC71', fontWeight: '600' },
  addRowBtn: {
    backgroundColor: '#2ECC71',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  prevBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  prevBtnText: { color: '#666', fontWeight: '600', fontSize: 15 },
  nextBtn: {
    flex: 2,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#333',
    alignItems: 'center',
  },
  nextBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

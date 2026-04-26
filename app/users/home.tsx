import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  useWindowDimensions,
  TextInput,
} from 'react-native';
import { Bell, ShoppingCart, Search, Heart, Plus, Flower2 } from 'lucide-react-native';
import Svg, { Circle, Path, Ellipse, G } from 'react-native-svg';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/useAuthStore';
import { storeService } from '@/services/stores';
import { Store } from '@/types';

// ─── 색상 토큰 ─────────────────────────────────────
const C = {
  bg: '#FAF7F5',
  surface: '#FFFFFF',
  ink: '#0F0F12',
  ink2: '#1F1F24',
  muted: '#7A7077',
  muted2: '#A8A0A6',
  line: '#ECE7E2',
  pink500: '#FF3D6C',
  pink600: '#E81E54',
  pink50: '#FFF1F4',
};

// ─── 카테고리 데이터 ────────────────────────────────
const CATEGORIES = [
  { id: 'rose',   name: '장미류',      kind: 'rose',  bg: '#FFE0E8', tint: '#FF6B8E' },
  { id: 'mum',    name: '국화류',      kind: 'mum',   bg: '#FFF3D6', tint: '#E8A93B' },
  { id: 'lily',   name: '백합류',      kind: 'lily',  bg: '#F0E8FF', tint: '#9B7BD9' },
  { id: 'mix',    name: '혼합 초화류', kind: 'mix',   bg: '#FFE8DA', tint: '#E87A3B' },
  { id: 'green',  name: '그린류',      kind: 'green', bg: '#DCEBDA', tint: '#5C8A5A' },
  { id: 'season', name: '계절화',      kind: 'tulip', bg: '#FFD9E8', tint: '#E84A7A' },
  { id: 'daisy',  name: '데이지',      kind: 'daisy', bg: '#FFF7CC', tint: '#D9B23B' },
  { id: 'all',    name: '전체보기',    kind: 'all',   bg: '#FFE0E8', tint: '#FF3D6C' },
];

// ─── 큐레이션 배너 데이터 ───────────────────────────
const BANNERS = [
  { title: '5월 가정의 달',    subtitle: '카네이션과 어울리는 부케 모음', tint: '#FFE0E8', accent: '#FF3D6C' },
  { title: '집들이 선물',      subtitle: '오래 가는 식물 베스트',          tint: '#DCEBDA', accent: '#5C8A5A' },
  { title: '프로포즈 100송이', subtitle: '특별한 날, 특별한 꽃다발',       tint: '#FFD0DD', accent: '#B7163F' },
];

// ─── 추천 상품 데이터 ───────────────────────────────
const RECOMMENDED = [
  { id: 1, image: 'https://images.unsplash.com/photo-1596434446633-911470550974?auto=format&fit=crop&q=80&w=400', tag: 'BEST', discount: 29, price: 12800, msrp: 18000, title: '장미 한 다발 (10송이)', seller: '한아름꽃시장' },
  { id: 2, image: 'https://images.unsplash.com/photo-1490750967868-88df5691cc64?auto=format&fit=crop&q=80&w=400', tag: 'NEW',  discount: 30, price: 9800,  msrp: 14000, title: '핑크 튤립 묶음 (5송이)', seller: '플라워파머' },
  { id: 3, image: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&q=80&w=400', tag: '',     discount: 26, price: 18500, msrp: 25000, title: '화이트 백합 부케', seller: '수안꽃집' },
  { id: 4, image: 'https://images.unsplash.com/photo-1487530811015-780780a6e4a7?auto=format&fit=crop&q=80&w=400', tag: '',     discount: 26, price: 8900,  msrp: 12000, title: '들꽃 믹스 부케', seller: '온실꽃밭' },
];

// ─── 베스트 상품 데이터 ─────────────────────────────
const BEST_ITEMS = [
  { id: 5, image: 'https://images.unsplash.com/photo-1490750967868-88df5691cc64?auto=format&fit=crop&q=80&w=400', price: 24000, title: '몬스테라 화분 (대)', seller: '식물집사' },
  { id: 6, image: 'https://images.unsplash.com/photo-1596434446633-911470550974?auto=format&fit=crop&q=80&w=400', price: 6500,  title: '소국 묶음 (3색)', seller: '동대문꽃상가' },
  { id: 7, image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&q=80&w=400', price: 7800,  title: '데이지 화이트 부케', seller: '플라워파머' },
  { id: 8, image: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&q=80&w=400', price: 89000, title: '레드 장미 100송이', seller: '한아름꽃시장' },
  { id: 9, image: 'https://images.unsplash.com/photo-1487530811015-780780a6e4a7?auto=format&fit=crop&q=80&w=400', price: 12800, title: '장미 한 다발', seller: '양재꽃도매' },
];

// ─── 카테고리 SVG 아이콘 ────────────────────────────
function CategoryIcon({ kind, tint }: { kind: string; tint: string }) {
  const props = { stroke: tint, strokeWidth: 1.8, fill: 'none' };

  if (kind === 'rose') {
    return (
      <Svg width={28} height={28} viewBox="0 0 36 36">
        <Circle cx="18" cy="14" r="6" {...props} />
        <Circle cx="18" cy="14" r="3" {...props} />
        <Path d="M18 20v9M14 28h8" {...props} />
      </Svg>
    );
  }
  if (kind === 'tulip') {
    return (
      <Svg width={28} height={28} viewBox="0 0 36 36">
        <Path d="M18 8c-5 1-7 7-5 11h10c2-4 0-10-5-11Z" {...props} />
        <Path d="M18 19v10M14 28h8" {...props} />
      </Svg>
    );
  }
  if (kind === 'lily') {
    return (
      <Svg width={28} height={28} viewBox="0 0 36 36">
        <G transform="translate(18,14)">
          <Ellipse cx="0" cy="-6" rx="2" ry="5" {...props} />
          <Ellipse cx="0" cy="-6" rx="2" ry="5" transform="rotate(72)" {...props} />
          <Ellipse cx="0" cy="-6" rx="2" ry="5" transform="rotate(144)" {...props} />
          <Ellipse cx="0" cy="-6" rx="2" ry="5" transform="rotate(216)" {...props} />
          <Ellipse cx="0" cy="-6" rx="2" ry="5" transform="rotate(288)" {...props} />
        </G>
        <Path d="M18 21v8M14 28h8" {...props} />
      </Svg>
    );
  }
  if (kind === 'mix') {
    return (
      <Svg width={28} height={28} viewBox="0 0 36 36">
        <Circle cx="14" cy="13" r="4" {...props} />
        <Circle cx="22" cy="11" r="3.5" {...props} />
        <Circle cx="20" cy="18" r="3" {...props} />
        <Path d="M18 22v7M14 28h8" {...props} />
      </Svg>
    );
  }
  if (kind === 'green') {
    return (
      <Svg width={28} height={28} viewBox="0 0 36 36">
        <Path d="M18 10c-6 1-9 7-8 14M18 10c6 1 9 7 8 14M18 10v18" {...props} />
      </Svg>
    );
  }
  if (kind === 'mum') {
    return (
      <Svg width={28} height={28} viewBox="0 0 36 36">
        <G transform="translate(18,14)">
          <Circle cx="0" cy="0" r="2.5" {...props} />
          <Ellipse cx="0" cy="-6" rx="1.8" ry="4" {...props} />
          <Ellipse cx="0" cy="-6" rx="1.8" ry="4" transform="rotate(45)" {...props} />
          <Ellipse cx="0" cy="-6" rx="1.8" ry="4" transform="rotate(90)" {...props} />
          <Ellipse cx="0" cy="-6" rx="1.8" ry="4" transform="rotate(135)" {...props} />
          <Ellipse cx="0" cy="-6" rx="1.8" ry="4" transform="rotate(180)" {...props} />
          <Ellipse cx="0" cy="-6" rx="1.8" ry="4" transform="rotate(225)" {...props} />
          <Ellipse cx="0" cy="-6" rx="1.8" ry="4" transform="rotate(270)" {...props} />
          <Ellipse cx="0" cy="-6" rx="1.8" ry="4" transform="rotate(315)" {...props} />
        </G>
      </Svg>
    );
  }
  if (kind === 'daisy') {
    return (
      <Svg width={28} height={28} viewBox="0 0 36 36">
        <G transform="translate(18,14)">
          <Circle cx="0" cy="0" r="2.5" stroke={tint} strokeWidth={1.8} fill={tint} />
          <Ellipse cx="0" cy="-6" rx="1.8" ry="4" {...props} />
          <Ellipse cx="0" cy="-6" rx="1.8" ry="4" transform="rotate(60)" {...props} />
          <Ellipse cx="0" cy="-6" rx="1.8" ry="4" transform="rotate(120)" {...props} />
          <Ellipse cx="0" cy="-6" rx="1.8" ry="4" transform="rotate(180)" {...props} />
          <Ellipse cx="0" cy="-6" rx="1.8" ry="4" transform="rotate(240)" {...props} />
          <Ellipse cx="0" cy="-6" rx="1.8" ry="4" transform="rotate(300)" {...props} />
        </G>
      </Svg>
    );
  }
  // all — Search 아이콘
  return (
    <Svg width={28} height={28} viewBox="0 0 36 36">
      <Circle cx="16" cy="16" r="8" {...props} />
      <Path d="M22 22l5 5" {...props} />
    </Svg>
  );
}

// ─── 메인 화면 ──────────────────────────────────────
const H_PAD = 16;

export default function BuyerHomeScreen() {
  const { width } = useWindowDimensions();
  const { profile } = useAuthStore();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bannerIdx, setBannerIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const gridWidth = width - H_PAD * 2;
  const col4Width = (gridWidth - 8 * 3) / 4;
  const cardWidth = (gridWidth - 12) / 2;

  // 배너 자동 전환
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setBannerIdx((prev) => (prev + 1) % BANNERS.length);
    }, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // 가게 로드
  useEffect(() => {
    (async () => {
      try {
        const data = await storeService.getStores({});
        setStores(data);
      } catch {
        // 에러 처리
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const banner = BANNERS[bannerIdx];

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ── 헤더 ── */}
        <View
          style={{
            paddingHorizontal: H_PAD,
            paddingTop: 12,
            paddingBottom: 8,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            {/* 로고 */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text
                style={{
                  fontSize: 26,
                  fontWeight: '800',
                  color: C.ink,
                  letterSpacing: -1,
                }}
              >
                Bloom
              </Text>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 9999,
                  backgroundColor: C.pink500,
                  marginBottom: 2,
                }}
              />
            </View>

            {/* 우측 아이콘 */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 9999,
                  backgroundColor: C.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bell size={20} color={C.ink} strokeWidth={1.8} />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 9999,
                  backgroundColor: C.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShoppingCart size={20} color={C.ink} strokeWidth={1.8} />
              </TouchableOpacity>
            </View>
          </View>

          {/* 서브 헤드라인 */}
          <Text
            style={{
              fontSize: 28,
              fontWeight: '800',
              color: C.ink,
              letterSpacing: -0.9,
              lineHeight: 34,
            }}
          >
            오늘은 어떤 꽃을{'\n'}만나볼까요,{' '}
            <Text style={{ color: C.pink500 }}>{profile?.name ?? ''}님</Text>?
          </Text>
        </View>

        {/* ── 검색바 ── */}
        <View style={{ paddingHorizontal: H_PAD, marginBottom: 20 }}>
          <View
            style={{
              height: 48,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: C.line,
              backgroundColor: C.surface,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 14,
              gap: 8,
            }}
          >
            <Search size={18} color={C.muted} strokeWidth={1.8} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="가게 이름, 꽃 이름으로 검색"
              placeholderTextColor={C.muted2}
              style={{ flex: 1, fontSize: 15, color: C.ink, height: 48 }}
              returnKeyType="search"
            />
          </View>
        </View>

        {/* ── 큐레이션 배너 ── */}
        <View style={{ paddingHorizontal: H_PAD, marginBottom: 24 }}>
          <View
            style={{
              height: 132,
              borderRadius: 18,
              paddingHorizontal: 22,
              paddingVertical: 24,
              backgroundColor: banner.tint,
              overflow: 'hidden',
              justifyContent: 'flex-end',
            }}
          >
            {/* 큰 원형 장식 */}
            <View
              style={{
                position: 'absolute',
                right: -20,
                top: -20,
                width: 130,
                height: 130,
                borderRadius: 65,
                backgroundColor: 'rgba(255,255,255,0.5)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 48, color: banner.accent, fontWeight: '800' }}>♥</Text>
            </View>

            {/* 텍스트 */}
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                letterSpacing: 0.9,
                color: banner.accent,
                marginBottom: 6,
              }}
            >
              BLOOM PICK
            </Text>
            <Text
              style={{
                fontSize: 22,
                fontWeight: '800',
                letterSpacing: -0.7,
                lineHeight: 26,
                color: C.ink,
                marginBottom: 4,
              }}
            >
              {banner.title}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: C.ink2,
                opacity: 0.7,
              }}
            >
              {banner.subtitle}
            </Text>

            {/* 인디케이터 도트 */}
            <View style={{ flexDirection: 'row', gap: 5, marginTop: 12 }}>
              {BANNERS.map((_, i) => (
                <View
                  key={i}
                  style={{
                    height: 6,
                    width: i === bannerIdx ? 16 : 6,
                    borderRadius: 3,
                    backgroundColor: i === bannerIdx ? banner.accent : 'rgba(15,15,18,0.15)',
                  }}
                />
              ))}
            </View>
          </View>
        </View>

        {/* ── 카테고리 그리드 ── */}
        <View style={{ paddingHorizontal: H_PAD, marginBottom: 28 }}>
          <Text
            style={{
              fontSize: 17,
              fontWeight: '800',
              color: C.ink,
              marginBottom: 14,
              letterSpacing: -0.3,
            }}
          >
            카테고리 둘러보기
          </Text>

          {/* Row 1 */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
            {CATEGORIES.slice(0, 4).map((cat) => (
              <View key={cat.id} style={{ width: col4Width, alignItems: 'center' }}>
                <TouchableOpacity
                  style={{
                    width: col4Width,
                    height: col4Width,
                    borderRadius: 14,
                    backgroundColor: cat.bg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 6,
                  }}
                  activeOpacity={0.8}
                >
                  <CategoryIcon kind={cat.kind} tint={cat.tint} />
                </TouchableOpacity>
                <Text
                  style={{
                    fontSize: 11.5,
                    fontWeight: '600',
                    color: cat.id === 'all' ? cat.tint : C.ink2,
                    textAlign: 'center',
                  }}
                  numberOfLines={2}
                >
                  {cat.name}
                </Text>
              </View>
            ))}
          </View>

          {/* Row 2 */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {CATEGORIES.slice(4, 8).map((cat) => (
              <View key={cat.id} style={{ width: col4Width, alignItems: 'center' }}>
                <TouchableOpacity
                  style={{
                    width: col4Width,
                    height: col4Width,
                    borderRadius: 14,
                    backgroundColor: cat.bg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 6,
                  }}
                  activeOpacity={0.8}
                >
                  <CategoryIcon kind={cat.kind} tint={cat.tint} />
                </TouchableOpacity>
                <Text
                  style={{
                    fontSize: 11.5,
                    fontWeight: '600',
                    color: cat.id === 'all' ? cat.tint : C.ink2,
                    textAlign: 'center',
                  }}
                  numberOfLines={2}
                >
                  {cat.name}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── 오늘의 추천 상품 ── */}
        <View style={{ paddingHorizontal: H_PAD, marginBottom: 28 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <Text style={{ fontSize: 17, fontWeight: '800', color: C.ink, letterSpacing: -0.3 }}>
              오늘의 추천 상품
            </Text>
            <TouchableOpacity>
              <Text style={{ fontSize: 13, color: C.muted, fontWeight: '500' }}>더보기 {'>'}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {RECOMMENDED.map((product) => (
              <View key={product.id} style={{ width: cardWidth }}>
                {/* 이미지 */}
                <View
                  style={{
                    width: cardWidth,
                    aspectRatio: 1 / 1.05,
                    borderRadius: 18,
                    overflow: 'hidden',
                    backgroundColor: '#f5f5f5',
                    marginBottom: 10,
                  }}
                >
                  <Image
                    source={{ uri: product.image }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />

                  {/* 태그 배지 */}
                  {product.tag === 'BEST' && (
                    <View
                      style={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        backgroundColor: C.surface,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ fontSize: 10, fontWeight: '800', color: C.ink, letterSpacing: 0.5 }}>BEST</Text>
                    </View>
                  )}
                  {product.tag === 'NEW' && (
                    <View
                      style={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        backgroundColor: C.ink,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ fontSize: 10, fontWeight: '800', color: C.surface, letterSpacing: 0.5 }}>NEW</Text>
                    </View>
                  )}

                  {/* 하트 버튼 */}
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: C.surface,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Heart size={16} color={C.ink} strokeWidth={2} />
                  </TouchableOpacity>

                  {/* + 버튼 */}
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      bottom: 10,
                      right: 10,
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: C.ink,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Plus size={16} color={C.surface} strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>

                {/* 텍스트 */}
                <Text style={{ fontSize: 13, color: C.muted, marginBottom: 2 }} numberOfLines={1}>
                  {product.seller}
                </Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.ink, marginBottom: 4 }} numberOfLines={2}>
                  {product.title}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: C.pink600 }}>
                    {product.discount}%
                  </Text>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: C.ink }}>
                    {product.price.toLocaleString()}원
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: C.muted2, textDecorationLine: 'line-through', marginTop: 1 }}>
                  {product.msrp.toLocaleString()}원
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── 지금 핫한 베스트 (가로 스크롤) ── */}
        <View style={{ marginBottom: 28 }}>
          <Text
            style={{
              fontSize: 17,
              fontWeight: '800',
              color: C.ink,
              letterSpacing: -0.3,
              paddingHorizontal: H_PAD,
              marginBottom: 14,
            }}
          >
            지금 핫한 베스트
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: H_PAD, gap: 12 }}
          >
            {BEST_ITEMS.map((item, index) => (
              <TouchableOpacity key={item.id} activeOpacity={0.8}>
                <View style={{ width: 152 }}>
                  {/* 이미지 */}
                  <View
                    style={{
                      width: 152,
                      height: 160,
                      borderRadius: 14,
                      overflow: 'hidden',
                      backgroundColor: '#f5f5f5',
                      marginBottom: 8,
                    }}
                  >
                    <Image
                      source={{ uri: item.image }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                    />
                    {/* 순위 배지 */}
                    <View
                      style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        backgroundColor: C.ink,
                        paddingHorizontal: 7,
                        paddingVertical: 4,
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ fontSize: 10, fontWeight: '800', color: C.surface }}>
                        #{index + 1}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 11, color: C.muted, marginBottom: 2 }} numberOfLines={1}>
                    {item.seller}
                  </Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: C.ink, marginBottom: 4 }} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: C.ink }}>
                    {item.price.toLocaleString()}원
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── 전체 가게 섹션 ── */}
        <View style={{ paddingHorizontal: H_PAD }}>
          <Text
            style={{
              fontSize: 17,
              fontWeight: '800',
              color: C.ink,
              letterSpacing: -0.3,
              marginBottom: 14,
            }}
          >
            전체 가게
          </Text>

          {loading && <ActivityIndicator color={C.pink500} style={{ marginVertical: 32 }} />}

          {!loading && stores.length === 0 && (
            <Text style={{ textAlign: 'center', color: C.muted, marginTop: 40, fontSize: 15 }}>
              등록된 가게가 없습니다.
            </Text>
          )}

          <View style={{ gap: 12 }}>
            {stores.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={{
                  backgroundColor: C.surface,
                  borderRadius: 16,
                  overflow: 'hidden',
                  shadowColor: '#000',
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 2,
                }}
                onPress={() => router.push(`/users/store/${item.id}`)}
                activeOpacity={0.8}
              >
                {item.image_url ? (
                  <Image source={{ uri: item.image_url }} style={{ width: '100%', height: 160 }} resizeMode="cover" />
                ) : (
                  <View
                    style={{
                      width: '100%',
                      height: 160,
                      backgroundColor: C.pink50,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Flower2 size={32} color={C.pink500} strokeWidth={1.8} />
                  </View>
                )}
                <View style={{ padding: 14 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: C.ink, marginBottom: 4 }}>
                    {item.name}
                  </Text>
                  <Text style={{ fontSize: 13, color: C.muted, marginBottom: 4 }} numberOfLines={1}>
                    {item.address}
                  </Text>
                  <Text style={{ fontSize: 14, color: C.muted, lineHeight: 20 }} numberOfLines={2}>
                    {item.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

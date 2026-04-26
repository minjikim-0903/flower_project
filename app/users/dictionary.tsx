import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sun, ArrowLeft, Droplets, Thermometer } from 'lucide-react-native';

// ─── 색상 토큰 ─────────────────────────────────────────────────────────────
const C = {
  bg: '#FAF7F5',
  surface: '#FFFFFF',
  ink: '#0F0F12',
  ink2: '#1F1F24',
  muted: '#7A7077',
  muted2: '#A8A0A6',
  line: '#ECE7E2',
  pink: '#FF3D6C',
};

// ─── 꽃 데이터 ─────────────────────────────────────────────────────────────
type Season = 'all' | 'spring' | 'summer' | 'fall' | 'winter' | 'evergreen';

interface FlowerData {
  id: string;
  name: string;
  en: string;
  season: string;
  seasonTag: Season[];
  meaning: string;
  care: string;
  tip: string;
  bg: string;
  petal: string;
  img: string;
}

const FLOWERS: FlowerData[] = [
  {
    id: 'd1',
    name: '장미',
    en: 'Rose',
    season: '5–10월',
    seasonTag: ['summer', 'fall'],
    meaning: '사랑, 열정',
    care: '서늘한 곳, 매일 물갈이',
    tip: '줄기 끝을 대각선으로 잘라주면 물 흡수가 잘 됩니다. 꽃가루가 묻지 않도록 주의하세요.',
    bg: '#FFE0E8',
    petal: '#FF3D6C',
    img: 'https://images.unsplash.com/photo-1596434446633-911470550974?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'd2',
    name: '튤립',
    en: 'Tulip',
    season: '3–5월',
    seasonTag: ['spring'],
    meaning: '진실한 사랑',
    care: '직사광선 피하기',
    tip: '햇빛이 강하면 꽃이 금방 시들어요. 서늘하고 밝은 그늘에 두면 오래 유지됩니다.',
    bg: '#FFD9E8',
    petal: '#E84A7A',
    img: 'https://images.unsplash.com/photo-1490750967868-88df5691cc64?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'd3',
    name: '백합',
    en: 'Lily',
    season: '6–8월',
    seasonTag: ['summer'],
    meaning: '순결, 변함없음',
    care: '꽃가루 주의',
    tip: '수술의 꽃가루가 옷에 묻으면 지우기 어려워요. 피어나기 전에 제거해두면 좋습니다.',
    bg: '#F4EFFF',
    petal: '#9B7BD9',
    img: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'd4',
    name: '국화',
    en: 'Chrysanthemum',
    season: '9–11월',
    seasonTag: ['fall'],
    meaning: '고결, 청초함',
    care: '햇빛 좋아함',
    tip: '햇빛이 풍부한 곳에 두세요. 물은 이틀에 한 번 주는 게 적당합니다.',
    bg: '#FFF3D6',
    petal: '#E8A93B',
    img: 'https://images.unsplash.com/photo-1487530811015-780780a6e4a7?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'd5',
    name: '데이지',
    en: 'Daisy',
    season: '4–6월',
    seasonTag: ['spring', 'summer'],
    meaning: '평화, 순수',
    care: '물 자주 갈기',
    tip: '물이 탁해지면 빨리 시들어요. 2일마다 신선한 물로 교체해주세요.',
    bg: '#FFF7CC',
    petal: '#D9B23B',
    img: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'd6',
    name: '몬스테라',
    en: 'Monstera',
    season: '연중',
    seasonTag: ['evergreen'],
    meaning: '기쁜 소식',
    care: '주 1회 물주기',
    tip: '과습을 싫어해요. 흙이 완전히 마른 뒤에 물을 주고, 잎을 닦아주면 광택이 납니다.',
    bg: '#DCEBDA',
    petal: '#5C8A5A',
    img: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'd7',
    name: '해바라기',
    en: 'Sunflower',
    season: '6–9월',
    seasonTag: ['summer'],
    meaning: '동경, 믿음',
    care: '햇빛 충분히',
    tip: '햇빛을 많이 받을수록 오래 피어있어요. 물은 하루에 한 번 충분히 주세요.',
    bg: '#FFF0CC',
    petal: '#F4A83A',
    img: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'd8',
    name: '수국',
    en: 'Hydrangea',
    season: '6–7월',
    seasonTag: ['summer'],
    meaning: '진심, 처녀의 꿈',
    care: '물 많이 필요',
    tip: '수국은 수분을 많이 필요로 해요. 꽃병 물을 충분히 채우고 시원한 곳에 두세요.',
    bg: '#E8E0FF',
    petal: '#8B6FD9',
    img: 'https://images.unsplash.com/photo-1562380156-45d7b52e8a30?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'd9',
    name: '카네이션',
    en: 'Carnation',
    season: '4–6월',
    seasonTag: ['spring'],
    meaning: '사랑, 감사',
    care: '서늘한 곳 보관',
    tip: '냉장 보관하면 1–2주까지도 유지돼요. 꽃잎이 처지면 미지근한 물에 담가두세요.',
    bg: '#FFE8DA',
    petal: '#E87A3B',
    img: 'https://images.unsplash.com/photo-1532635224-cf024e66d122?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'd10',
    name: '라벤더',
    en: 'Lavender',
    season: '연중',
    seasonTag: ['evergreen'],
    meaning: '침묵, 기다림',
    care: '건조하게 유지',
    tip: '드라이플라워로 만들기 좋아요. 역방향으로 거꾸로 매달아 말리면 향기가 오래 남습니다.',
    bg: '#F0E8FF',
    petal: '#9B7BD9',
    img: 'https://images.unsplash.com/photo-1499578124509-1611b77778c8?auto=format&fit=crop&q=80&w=400',
  },
];

const SEASON_TABS = [
  { id: 'all',       label: '전체' },
  { id: 'spring',    label: '봄' },
  { id: 'summer',    label: '여름' },
  { id: 'fall',      label: '가을' },
  { id: 'winter',    label: '겨울' },
  { id: 'evergreen', label: '사계절' },
];

// ─── 꽃사전 목록 ────────────────────────────────────────────────────────────
function DictList({ onPick }: { onPick: (f: FlowerData) => void }) {
  const [tab, setTab] = useState<Season>('all');
  const { width } = useWindowDimensions();
  const cardWidth = (width - 16 * 2 - 14) / 2;

  const filtered = tab === 'all'
    ? FLOWERS
    : FLOWERS.filter(f => f.seasonTag.includes(tab));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* 헤더 */}
        <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 }}>
          <Text style={{ fontSize: 26, fontWeight: '800', color: C.ink, letterSpacing: -0.9 }}>
            꽃사전
          </Text>
          <Text style={{ fontSize: 14, color: C.muted, marginTop: 6 }}>
            꽃말과 관리법을 한눈에
          </Text>
        </View>

        {/* 시즌 필터 탭 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16, gap: 8 }}
        >
          {SEASON_TABS.map(t => {
            const active = tab === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => setTab(t.id as Season)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 9999,
                  backgroundColor: active ? C.ink : 'transparent',
                  borderWidth: active ? 0 : 1,
                  borderColor: C.line,
                }}
                activeOpacity={0.8}
              >
                <Text style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: active ? '#fff' : C.ink2,
                }}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 2열 그리드 */}
        <View style={{
          paddingHorizontal: 16,
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 14,
        }}>
          {filtered.map(flower => (
            <TouchableOpacity
              key={flower.id}
              onPress={() => onPick(flower)}
              activeOpacity={0.85}
              style={{
                width: cardWidth,
                backgroundColor: C.surface,
                borderRadius: 18,
                padding: 12,
                gap: 10,
              }}
            >
              {/* 꽃 이미지 */}
              <View style={{
                width: '100%',
                aspectRatio: 1,
                borderRadius: 12,
                overflow: 'hidden',
                backgroundColor: flower.bg,
              }}>
                <Image
                  source={{ uri: flower.img }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              </View>

              {/* 텍스트 */}
              <View style={{ gap: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: C.ink, letterSpacing: -0.3 }}>
                    {flower.name}
                  </Text>
                  <Text style={{ fontSize: 11, color: C.muted }}>
                    {flower.en}
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: C.ink2, marginTop: 2 }}>
                  "{flower.meaning}"
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <Sun size={12} color={C.muted} strokeWidth={1.8} />
                  <Text style={{ fontSize: 11, color: C.muted }}>
                    {flower.season}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {filtered.length === 0 && (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Text style={{ fontSize: 14, color: C.muted }}>해당 계절의 꽃이 없습니다.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── 꽃 상세 ───────────────────────────────────────────────────────────────
function DictDetail({ flower, onBack }: { flower: FlowerData; onBack: () => void }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>

        {/* 히어로 이미지 영역 */}
        <View style={{
          width: '100%',
          height: 280,
          backgroundColor: flower.bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* 뒤로가기 버튼 */}
          <TouchableOpacity
            onPress={onBack}
            style={{
              position: 'absolute',
              top: 12,
              left: 16,
              zIndex: 5,
              width: 40,
              height: 40,
              borderRadius: 9999,
              backgroundColor: 'rgba(255,255,255,0.92)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ArrowLeft size={20} color={C.ink} strokeWidth={2} />
          </TouchableOpacity>

          {/* 원형 꽃 이미지 */}
          <View style={{
            width: 200,
            height: 200,
            borderRadius: 9999,
            overflow: 'hidden',
            backgroundColor: flower.bg,
          }}>
            <Image
              source={{ uri: flower.img }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* 콘텐츠 */}
        <View style={{ padding: 20 }}>

          {/* 영문명 */}
          <Text style={{
            fontSize: 12,
            fontWeight: '700',
            letterSpacing: 1,
            color: flower.petal,
            textTransform: 'uppercase',
          }}>
            {flower.en}
          </Text>

          {/* 한글명 + 제철 */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, marginBottom: 16 }}>
            <Text style={{ fontSize: 28, fontWeight: '800', color: C.ink, letterSpacing: -0.9 }}>
              {flower.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Sun size={14} color={C.muted} strokeWidth={1.8} />
              <Text style={{ fontSize: 13, color: C.muted, fontWeight: '500' }}>{flower.season}</Text>
            </View>
          </View>

          {/* 꽃말 카드 */}
          <View style={{
            backgroundColor: C.surface,
            borderRadius: 14,
            padding: 16,
            marginBottom: 14,
          }}>
            <Text style={{ fontSize: 11, color: C.muted, fontWeight: '700', letterSpacing: 0.5, marginBottom: 6 }}>
              꽃말
            </Text>
            <Text style={{ fontSize: 17, fontWeight: '800', color: C.ink, letterSpacing: -0.3 }}>
              {flower.meaning}
            </Text>
          </View>

          {/* 제철 + 관리 2열 */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
            <View style={{
              flex: 1,
              backgroundColor: C.surface,
              borderRadius: 14,
              padding: 16,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                <Sun size={14} color={C.muted} strokeWidth={1.8} />
                <Text style={{ fontSize: 11, color: C.muted, fontWeight: '700', letterSpacing: 0.5 }}>
                  제철
                </Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.ink }}>
                {flower.season}
              </Text>
            </View>
            <View style={{
              flex: 1,
              backgroundColor: C.surface,
              borderRadius: 14,
              padding: 16,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                <Droplets size={14} color={C.muted} strokeWidth={1.8} />
                <Text style={{ fontSize: 11, color: C.muted, fontWeight: '700', letterSpacing: 0.5 }}>
                  관리
                </Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.ink }}>
                {flower.care}
              </Text>
            </View>
          </View>

          {/* 관리 팁 */}
          <View style={{
            backgroundColor: flower.bg,
            borderRadius: 14,
            padding: 16,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Thermometer size={14} color={flower.petal} strokeWidth={1.8} />
              <Text style={{ fontSize: 11, color: flower.petal, fontWeight: '700', letterSpacing: 0.5 }}>
                관리 팁
              </Text>
            </View>
            <Text style={{ fontSize: 14, color: C.ink2, lineHeight: 22 }}>
              {flower.tip}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── 메인 진입점 ────────────────────────────────────────────────────────────
export default function DictionaryScreen() {
  const [selected, setSelected] = useState<FlowerData | null>(null);

  if (selected) {
    return <DictDetail flower={selected} onBack={() => setSelected(null)} />;
  }
  return <DictList onPick={setSelected} />;
}

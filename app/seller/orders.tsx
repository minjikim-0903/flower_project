import { useEffect, useState } from 'react';
import {
  View,
  Text,
  SectionList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, isToday, isTomorrow, addDays, startOfDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { storeService } from '@/services/stores';
import { orderService } from '@/services/orders';
import { Order, OrderStatus } from '@/types';

const STATUS_FLOW: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered'];

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: '주문 접수',
  confirmed: '주문 확인',
  preparing: '준비 중',
  shipped: '배송 중',
  delivered: '배송 완료',
  cancelled: '취소됨',
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: '#FFA500',
  confirmed: '#4A90E2',
  preparing: '#9B59B6',
  shipped: '#2ECC71',
  delivered: '#27AE60',
  cancelled: '#E74C3C',
};

const isDone = (status: OrderStatus) => status === 'delivered' || status === 'cancelled';

function getDateLabel(dateStr: string) {
  const d = startOfDay(new Date(dateStr));
  if (isToday(d)) return '오늘';
  if (isTomorrow(d)) return '내일';
  return format(d, 'M월 d일 (E)', { locale: ko });
}

// Generate 7 day tabs starting from today
function getDayTabs() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(new Date(), i);
    return {
      date: format(d, 'yyyy-MM-dd'),
      label: i === 0 ? '오늘' : i === 1 ? '내일' : format(d, 'M/d'),
      day: format(d, 'E', { locale: ko }),
    };
  });
}

export default function SellerOrdersScreen() {
  const { profile } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const DAY_TABS = getDayTabs();

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const store = await storeService.getMyStore(profile.id);
      if (store) {
        const data = await orderService.getSellerOrders(store.id);
        setOrders(data);
      }
      setLoading(false);
    })();
  }, [profile]);

  const handleStatusUpdate = (order: Order) => {
    const currentIdx = STATUS_FLOW.indexOf(order.status);
    if (currentIdx === -1 || currentIdx >= STATUS_FLOW.length - 1) return;
    const nextStatus = STATUS_FLOW[currentIdx + 1];

    Alert.alert(
      '상태 변경',
      `"${STATUS_LABEL[order.status]}" → "${STATUS_LABEL[nextStatus]}"로 변경할까요?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '변경',
          onPress: async () => {
            const updated = await orderService.updateOrderStatus(order.id, nextStatus);
            setOrders(orders.map((o) => (o.id === order.id ? { ...o, status: updated.status } : o)));
          },
        },
      ]
    );
  };

  // Filter by selected date
  const filteredOrders = orders.filter(
    (o) => format(new Date(o.delivery_date), 'yyyy-MM-dd') === selectedDate
  );

  // Split into sections
  const newOrders = filteredOrders.filter((o) => o.status === 'pending');
  const inProgressOrders = filteredOrders.filter(
    (o) => o.status !== 'pending' && !isDone(o.status)
  );
  const doneOrders = filteredOrders.filter((o) => isDone(o.status));

  const sections = [
    ...(newOrders.length > 0 ? [{ title: '신규 주문', data: newOrders }] : []),
    ...(inProgressOrders.length > 0 ? [{ title: '처리 중', data: inProgressOrders }] : []),
    ...(doneOrders.length > 0 ? [{ title: '완료', data: doneOrders }] : []),
  ];

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#2ECC71" />;

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#1a1a1a' }}>주문 관리</Text>
        <Text style={{ fontSize: 14, color: '#6a6a6a', marginTop: 2 }}>
          {getDateLabel(selectedDate)} 배송 예정 {filteredOrders.length}건
        </Text>
      </View>

      {/* Day selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
      >
        {DAY_TABS.map((tab) => {
          const isSelected = tab.date === selectedDate;
          return (
            <TouchableOpacity
              key={tab.date}
              onPress={() => setSelectedDate(tab.date)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: isSelected ? '#2ECC71' : '#fff',
                borderWidth: 1,
                borderColor: isSelected ? '#2ECC71' : '#f0f0f0',
                alignItems: 'center',
                minWidth: 60,
              }}
            >
              <Text style={{ fontSize: 11, color: isSelected ? '#fff' : '#6a6a6a', marginBottom: 2 }}>
                {tab.day}
              </Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: isSelected ? '#fff' : '#222222' }}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Order list */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: '#6a6a6a',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              paddingHorizontal: 20,
              paddingTop: 16,
              paddingBottom: 6,
            }}
          >
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => {
          const done = isDone(item.status);
          const color = STATUS_COLOR[item.status];
          return (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => !done && handleStatusUpdate(item)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#fff',
                marginHorizontal: 16,
                marginBottom: 8,
                borderRadius: 16,
                padding: 16,
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
                elevation: 3,
                opacity: done ? 0.6 : 1,
              }}
            >
              {/* Status icon */}
              <View style={{ marginRight: 14 }}>
                {done ? (
                  <CheckCircle2 size={26} color={color} />
                ) : (
                  <Circle size={26} color={color} />
                )}
              </View>

              {/* Order info */}
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: '700',
                      color: done ? '#6a6a6a' : '#1a1a1a',
                      textDecorationLine: done ? 'line-through' : 'none',
                    }}
                  >
                    {item.buyer?.name}
                  </Text>
                  <View
                    style={{
                      paddingHorizontal: 7,
                      paddingVertical: 2,
                      borderRadius: 6,
                      backgroundColor: color + '18',
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '600', color }}>{STATUS_LABEL[item.status]}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 13, color: '#6a6a6a', marginBottom: 2 }}>
                  {item.order_type === 'wholesale' ? '🏭 도매' : '🛒 소매'} · {item.total_price.toLocaleString()}원
                </Text>
                <Text style={{ fontSize: 12, color: '#6a6a6a' }} numberOfLines={1}>
                  {item.delivery_address}
                </Text>
              </View>

              {/* Right arrow (only for actionable) */}
              {!done && (
                <ChevronRight size={18} color="#ccc" style={{ marginLeft: 8 }} />
              )}
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 60, gap: 12 }}>
            <Text style={{ fontSize: 40 }}>📦</Text>
            <Text style={{ color: '#6a6a6a', fontSize: 16 }}>이 날 주문이 없습니다.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

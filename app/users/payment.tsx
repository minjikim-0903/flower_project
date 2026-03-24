import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { orderService } from '@/services/orders';
import { OrderType } from '@/types';

const IMP_KEY = process.env.EXPO_PUBLIC_PORTONE_IMP_KEY!;

type PaymentResult =
  | { success: true; imp_uid: string; merchant_uid: string }
  | { success: false; error_msg: string };

// react-native-webview는 네이티브에서만 import
let WebView: React.ComponentType<any> | null = null;
if (Platform.OS !== 'web') {
  WebView = require('react-native-webview').WebView;
}

export default function PaymentScreen() {
  const { totalPrice, orderType, deliveryDate, deliveryAddress, deliveryMemo } =
    useLocalSearchParams<{
      totalPrice: string;
      orderType: string;
      deliveryDate: string;
      deliveryAddress: string;
      deliveryMemo: string;
    }>();

  const { profile } = useAuthStore();
  const { items, storeId, clearCart } = useCartStore();
  const [processingOrder, setProcessingOrder] = useState(false);
  const [webScriptReady, setWebScriptReady] = useState(false);
  const merchantUidRef = useRef(`flower_${Date.now()}`);

  const amount = parseInt(totalPrice || '0');

  const handlePaymentResult = async (result: PaymentResult) => {
    if (!result.success) {
      if (Platform.OS === 'web') {
        window.alert(`결제 실패: ${result.error_msg || '결제가 취소되었습니다.'}`);
        router.back();
      } else {
        Alert.alert('결제 실패', result.error_msg || '결제가 취소되었습니다.', [
          { text: '확인', onPress: () => router.back() },
        ]);
      }
      return;
    }

    setProcessingOrder(true);
    try {
      await orderService.createOrder({
        buyerId: profile!.id,
        storeId: storeId!,
        items,
        orderType: orderType as OrderType,
        deliveryDate,
        deliveryAddress,
        deliveryMemo: deliveryMemo || '',
      });
      clearCart();
      if (Platform.OS === 'web') {
        window.alert('결제 완료! 주문이 성공적으로 접수되었습니다.');
        router.replace('/users/orders');
      } else {
        Alert.alert('결제 완료', '주문이 성공적으로 접수되었습니다.', [
          { text: '확인', onPress: () => router.replace('/users/orders') },
        ]);
      }
    } catch {
      if (Platform.OS === 'web') {
        window.alert('오류: 주문 저장 중 오류가 발생했습니다.');
      } else {
        Alert.alert('오류', '주문 저장 중 오류가 발생했습니다. 고객센터에 문의해주세요.');
      }
    } finally {
      setProcessingOrder(false);
    }
  };

  // 웹: PortOne 스크립트 동적 로드 (자동 결제 호출 X — 버튼 클릭 시 호출)
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const script = document.createElement('script');
    script.src = 'https://cdn.iamport.kr/js/iamport.payment-1.2.0.js';
    script.onload = () => setWebScriptReady(true);
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);

  // 웹: 버튼 클릭 시 직접 호출 (팝업 차단 방지)
  const handleWebPay = () => {
    const IMP = (window as any).IMP;
    IMP.init(IMP_KEY);
    IMP.request_pay(
      {
        pg: 'kakaopay.TC0ONETIME',
        pay_method: 'card',
        merchant_uid: merchantUidRef.current,
        name: '꽃시장 주문',
        amount,
        buyer_name: profile?.name ?? '',
        buyer_tel: profile?.phone ?? '',
        buyer_addr: deliveryAddress ?? '',
      },
      (rsp: any) => {
        if (rsp.success) {
          handlePaymentResult({ success: true, imp_uid: rsp.imp_uid, merchant_uid: rsp.merchant_uid });
        } else {
          handlePaymentResult({ success: false, error_msg: rsp.error_msg });
        }
      }
    );
  };

  // 네이티브용 WebView HTML
  const paymentParams = JSON.stringify({
    name: profile?.name ?? '',
    phone: profile?.phone ?? '',
    addr: deliveryAddress ?? '',
  });

  const paymentHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      <script src="https://cdn.iamport.kr/js/iamport.payment-1.2.0.js"></script>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: -apple-system, sans-serif;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: #f8f8f8;
          color: #555;
        }
        .spinner {
          width: 44px; height: 44px;
          border: 3px solid #f0f0f0;
          border-top-color: #FF6B9D;
          border-radius: 50%;
          animation: spin 0.9s linear infinite;
          margin-bottom: 16px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        p { font-size: 15px; }
      </style>
    </head>
    <body>
      <div class="spinner"></div>
      <p>결제 창을 불러오는 중...</p>
      <script>
        var IMP = window.IMP;
        IMP.init('${IMP_KEY}');
        var buyer = ${paymentParams};
        setTimeout(function () {
          IMP.request_pay(
            {
              pg: 'kakaopay.TC0ONETIME',
              pay_method: 'card',
              merchant_uid: '${merchantUidRef.current}',
              name: '꽃시장 주문',
              amount: ${amount},
              buyer_name: buyer.name,
              buyer_tel: buyer.phone,
              buyer_addr: buyer.addr,
            },
            function (rsp) {
              if (rsp.success) {
                window.ReactNativeWebView.postMessage(
                  JSON.stringify({ success: true, imp_uid: rsp.imp_uid, merchant_uid: rsp.merchant_uid })
                );
              } else {
                window.ReactNativeWebView.postMessage(
                  JSON.stringify({ success: false, error_msg: rsp.error_msg })
                );
              }
            }
          );
        }, 300);
      </script>
    </body>
    </html>
  `;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} disabled={processingOrder}>
          <Text style={styles.back}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>결제</Text>
        <View style={{ width: 44 }} />
      </View>

      {processingOrder ? (
        <View style={styles.processing}>
          <ActivityIndicator size="large" color="#FF6B9D" />
          <Text style={styles.processingText}>주문을 저장하는 중...</Text>
        </View>
      ) : Platform.OS === 'web' ? (
        // 웹: 스크립트 로드 완료 후 버튼 표시 (팝업 차단 방지 — 직접 클릭 필요)
        <View style={styles.processing}>
          {!webScriptReady ? (
            <>
              <ActivityIndicator size="large" color="#FF6B9D" />
              <Text style={styles.processingText}>결제 준비 중...</Text>
            </>
          ) : (
            <>
              <Text style={styles.processingText}>결제 준비 완료</Text>
              <TouchableOpacity style={styles.payButton} onPress={handleWebPay}>
                <Text style={styles.payButtonText}>{amount.toLocaleString()}원 결제하기</Text>
              </TouchableOpacity>
              <Text style={styles.processingHint}>버튼을 눌러 결제창을 열어주세요</Text>
            </>
          )}
        </View>
      ) : (
        // 네이티브: WebView
        WebView && (
          <WebView
            source={{ html: paymentHTML }}
            onMessage={(event: any) => {
              const result: PaymentResult = JSON.parse(event.nativeEvent.data);
              handlePaymentResult(result);
            }}
            originWhitelist={['*']}
            javaScriptEnabled
            domStorageEnabled
            style={styles.webview}
          />
        )
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  back: { color: '#FF6B9D', fontSize: 16 },
  title: { fontSize: 18, fontWeight: 'bold' },
  webview: { flex: 1 },
  processing: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  processingText: { fontSize: 15, color: '#555' },
  processingHint: { fontSize: 13, color: '#aaa', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  payButton: { backgroundColor: '#FF6B9D', borderRadius: 12, paddingHorizontal: 32, paddingVertical: 16, marginTop: 16 },
  payButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

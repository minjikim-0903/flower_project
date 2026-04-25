import { useEffect, useRef, useState } from 'react';
import {
  Alert,
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

const STORE_ID = process.env.EXPO_PUBLIC_PORTONE_STORE_ID!;
const CHANNEL_KEY = process.env.EXPO_PUBLIC_PORTONE_CHANNEL_KEY!;

type PaymentResult =
  | { success: true; paymentId: string }
  | { success: false; error_msg: string };

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

  const amount = parseInt(totalPrice || '0');
  const paymentIdRef = useRef(
    `payment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );

  const handlePaymentResult = async (result: PaymentResult) => {
    if (!result.success) {
      Alert.alert('결제 실패', result.error_msg || '결제가 취소되었습니다.', [
        { text: '확인', onPress: () => router.back() },
      ]);
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
      Alert.alert('결제 완료', '주문이 성공적으로 접수되었습니다.', [
        { text: '확인', onPress: () => router.replace('/users/orders') },
      ]);
    } catch {
      Alert.alert('오류', '주문 저장 중 오류가 발생했습니다. 고객센터에 문의해주세요.');
    } finally {
      setProcessingOrder(false);
    }
  };

  // 웹: 포트원 V2 SDK 동적 로드
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const script = document.createElement('script');
    script.src = 'https://cdn.portone.io/v2/browser-sdk.umd.js';
    script.onload = () => setWebScriptReady(true);
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);

  // 웹: 버튼 클릭 시 결제 호출 (팝업 차단 방지)
  const handleWebPay = async () => {
    const PortOne = (window as any).PortOne;
    if (!PortOne) return;

    try {
      const response = await PortOne.requestPayment({
        storeId: STORE_ID,
        channelKey: CHANNEL_KEY,
        paymentId: paymentIdRef.current,
        orderName: '꽃시장 주문',
        totalAmount: amount,
        currency: 'CURRENCY_KRW',
        payMethod: 'CARD',
        customer: {
          fullName: profile?.name ?? '',
          phoneNumber: profile?.phone ?? '',
        },
      });

      if (response?.code) {
        handlePaymentResult({ success: false, error_msg: response.message ?? '결제 실패' });
      } else {
        handlePaymentResult({ success: true, paymentId: response.paymentId });
      }
    } catch (e: any) {
      handlePaymentResult({ success: false, error_msg: e?.message ?? '결제 오류가 발생했습니다.' });
    }
  };

  // 네이티브용 WebView HTML (포트원 V2)
  const customerJSON = JSON.stringify({
    fullName: profile?.name ?? '',
    phoneNumber: profile?.phone ?? '',
  });

  const paymentHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      <script src="https://cdn.portone.io/v2/browser-sdk.umd.js"></script>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: -apple-system, sans-serif;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: #FAF7F5;
          color: #555;
        }
        .spinner {
          width: 44px; height: 44px;
          border: 3px solid #f0f0f0;
          border-top-color: #FF3D6C;
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
        window.onload = function () {
          var customer = ${customerJSON};
          PortOne.requestPayment({
            storeId: '${STORE_ID}',
            channelKey: '${CHANNEL_KEY}',
            paymentId: '${paymentIdRef.current}',
            orderName: '꽃시장 주문',
            totalAmount: ${amount},
            currency: 'CURRENCY_KRW',
            payMethod: 'CARD',
            customer: customer,
          }).then(function (response) {
            if (response && response.code) {
              window.ReactNativeWebView.postMessage(
                JSON.stringify({ success: false, error_msg: response.message || '결제 실패' })
              );
            } else {
              window.ReactNativeWebView.postMessage(
                JSON.stringify({ success: true, paymentId: response.paymentId })
              );
            }
          }).catch(function (err) {
            window.ReactNativeWebView.postMessage(
              JSON.stringify({ success: false, error_msg: err.message || '결제 오류' })
            );
          });
        };
      </script>
    </body>
    </html>
  `;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row justify-between items-center p-4 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} disabled={processingOrder}>
          <Text className="text-primary text-base">← 뒤로</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold">결제</Text>
        <View style={{ width: 44 }} />
      </View>

      {processingOrder ? (
        <View className="flex-1 justify-center items-center gap-4">
          <ActivityIndicator size="large" color="#FF3D6C" />
          <Text style={{ fontSize: 15, color: '#555' }}>주문을 저장하는 중...</Text>
        </View>
      ) : Platform.OS === 'web' ? (
        <View className="flex-1 justify-center items-center gap-4">
          {!webScriptReady ? (
            <>
              <ActivityIndicator size="large" color="#FF3D6C" />
              <Text style={{ fontSize: 15, color: '#555' }}>결제 준비 중...</Text>
            </>
          ) : (
            <>
              <Text style={{ fontSize: 15, color: '#555' }}>결제 준비 완료</Text>
              <TouchableOpacity
                className="bg-primary rounded-xl items-center"
                style={{ paddingHorizontal: 32, paddingVertical: 16, marginTop: 16 }}
                onPress={handleWebPay}
              >
                <Text className="text-white text-base font-bold">
                  {amount.toLocaleString()}원 결제하기
                </Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 13, color: '#aaa', textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
                버튼을 눌러 결제창을 열어주세요
              </Text>
            </>
          )}
        </View>
      ) : (
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
            className="flex-1"
          />
        )
      )}
    </SafeAreaView>
  );
}

const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// import.meta 웹 호환성 설정
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ['require', 'default', 'react-native'];

// 웹에서 import.meta 사용하는 패키지 처리
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};

module.exports = withNativeWind(config, { input: './global.css' });

// Dynamic Expo config for dev/prod

const isProd = process.env.APP_ENV === 'production' || process.env.NODE_ENV === 'production';

export default ({ config }) => ({
  expo: {
    name: isProd ? 'TheBookNook' : 'TheBookNook (Dev)',
    displayName: isProd ? 'TheBookNook' : 'TheBookNook (Dev)',
    slug: isProd ? 'thebooknook' : 'thebooknook-dev',
    version: isProd ? '1.0.0' : '0.0.1',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'myapp',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true
    },
    web: {
      bundler: 'metro',
      output: 'single',
      favicon: './assets/images/favicon.png'
    },
    plugins: ['expo-router', 'expo-font', 'expo-web-browser'],
    experiments: {
      typedRoutes: true
    },
    // Add more dynamic config here as needed
  }
}); 
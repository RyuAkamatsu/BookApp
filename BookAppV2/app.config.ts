export default {
    expo: {
        name: process.env.APP_NAME || "Book Nook",
        slug: "com.booknook.app",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/images/icon.png",
        scheme: "booknook",
        userInterfaceStyle: "automatic",
        newArchEnabled: true,
        ios: {
            "supportsTablet": true
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/images/adaptive-icon.png",
                backgroundColor: "#ffffff"
            },
            edgeToEdgeEnabled: true
        },
        web: {
            bundler: "metro",
            output: "static",
            favicon: "./assets/images/favicon.png"
        },
        plugins: [
            "expo-router",
            [
                "expo-splash-screen",
                {
                    "image": "./assets/images/splash-icon.png",
                    "imageWidth": 200,
                    "resizeMode": "contain",
                    "backgroundColor": "#ffffff"
                }
            ]
        ],
        experiments: {
            typedRoutes: true
        },
        extra: {
            // Environment variables will be accessible via Constants.expoConfig.extra
            apiUrl: process.env.EXPO_PUBLIC_API_URL || "https://pokeapi.co/api/v2",
        }
    }
}

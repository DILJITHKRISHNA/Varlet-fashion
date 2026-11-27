import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
} from '@expo-google-fonts/bricolage-grotesque';
import { InstrumentSerif_400Regular_Italic } from '@expo-google-fonts/instrument-serif';
import { ThemeProvider } from './src/context/ThemeContext';
import RootNavigator from './src/navigation/RootNavigator';
import { useAuthStore } from './src/store/authStore';
import { darkColors } from './src/constants/colors';

SplashScreen.preventAutoHideAsync().catch(() => {});

// Keeps screen transitions from flashing the default light background.
const navigationTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: darkColors.background, card: darkColors.surface },
};

export default function App() {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'Bricolage-SemiBold': BricolageGrotesque_600SemiBold,
    'Bricolage-Bold': BricolageGrotesque_700Bold,
    'InstrumentSerif-Italic': InstrumentSerif_400Regular_Italic,
  });
  const { initialize, isInitializing } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const isReady = fontsLoaded && !isInitializing;

  // useEffect, not onLayout: onLayout only fires when a layout pass actually
  // happens, which isn't guaranteed on every device/timing — if it never
  // fires, the native splash screen stays stuck on top of the fully-rendered
  // app forever, silently eating every touch (looks like "nothing responds"
  // rather than an error, since the JS side rendered fine underneath).
  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isReady]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: darkColors.background }}>
        <ActivityIndicator color={darkColors.accent} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <NavigationContainer theme={navigationTheme}>
            <RootNavigator />
            <StatusBar style="light" />
          </NavigationContainer>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

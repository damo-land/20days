import { useFonts } from 'expo-font';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AnimatedSplash } from '@/components/AnimatedSplash';
import { WipeTransition } from '@/components/WipeTransition';
import { initDb } from '@/db/client';
import { useAppStore } from '@/state/store';
import { tones } from '@/theme/brand';
import { fontsToLoad } from '@/theme/fonts';
import { AppThemeProvider } from '@/theme/ThemeProvider';
import { refreshTrend } from '@/trend/refresh';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const [fontsLoaded] = useFonts(fontsToLoad);
  const t = tones(useColorScheme() === 'dark');

  useEffect(() => {
    try {
      initDb();
      refreshTrend();
    } finally {
      setDbReady(true);
    }
  }, []);

  const ready = dbReady && fontsLoaded;
  const wipeColors = useAppStore((s) => s.wipeColors);
  const endWipe = useAppStore((s) => s.endWipe);

  return (
    <SafeAreaProvider>
      <AnimatedSplash ready={ready}>
        <AppThemeProvider>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.paper } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="today" />
          </Stack>
          {wipeColors ? <WipeTransition colors={wipeColors} onCovered={() => router.back()} onDone={endWipe} /> : null}
        </AppThemeProvider>
      </AnimatedSplash>
    </SafeAreaProvider>
  );
}

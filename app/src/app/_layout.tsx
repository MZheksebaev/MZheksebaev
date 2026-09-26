import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTheme } from '../constants/theme';
import { AppProvider, useApp } from '../store/AppStore';

function RootStack() {
  const { c, isDark } = useTheme();
  const { t } = useApp();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerTintColor: c.text,
          headerStyle: { backgroundColor: c.bg },
          headerShadowVisible: false,
          headerBackTitle: t.common.back,
          contentStyle: { backgroundColor: c.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="service/[id]" options={{ headerTransparent: true, title: '', headerTintColor: '#fff', headerStyle: { backgroundColor: 'transparent' } }} />
        <Stack.Screen name="shipment/[id]" options={{ title: '' }} />
        <Stack.Screen name="request" options={{ presentation: 'modal', title: t.request.title }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <RootStack />
      </AppProvider>
    </SafeAreaProvider>
  );
}

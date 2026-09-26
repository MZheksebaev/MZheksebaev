import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router/js-tabs';
import { tap, type IconName } from '../../components/ui';
import { useTheme } from '../../constants/theme';
import { useApp } from '../../store/AppStore';

const icons: Record<string, [IconName, IconName]> = {
  index: ['home', 'home-outline'],
  track: ['locate', 'locate-outline'],
  calculator: ['calculator', 'calculator-outline'],
  orders: ['document-text', 'document-text-outline'],
  profile: ['person-circle', 'person-circle-outline'],
};

export default function TabsLayout() {
  const { c, isDark } = useTheme();
  const { t } = useApp();
  const titles: Record<string, string> = {
    index: t.tabs.home,
    track: t.tabs.track,
    calculator: t.tabs.calc,
    orders: t.tabs.orders,
    profile: t.tabs.profile,
  };
  return (
    <Tabs
      screenListeners={{ tabPress: tap }}
      screenOptions={({ route }) => ({
        headerShown: false,
        title: titles[route.name],
        tabBarActiveTintColor: isDark ? c.primary : c.accent,
        tabBarInactiveTintColor: c.textFaint,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', lineHeight: 14 },
        tabBarStyle: { backgroundColor: c.tabBar, borderTopColor: c.border },
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={icons[route.name][focused ? 0 : 1]} size={size} color={color} />
        ),
      })}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="track" />
      <Tabs.Screen name="calculator" />
      <Tabs.Screen name="orders" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, EmptyState } from '../../components/ui';
import { getService } from '../../constants/services';
import { radius, space, useTheme } from '../../constants/theme';
import { useApp } from '../../store/AppStore';

export default function ServiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { c } = useTheme();
  const { t, lang } = useApp();
  const insets = useSafeAreaInsets();
  const s = getService(id);
  if (!s) return <EmptyState icon="alert-circle-outline" title="404" />;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        <LinearGradient colors={[s.tint, c.heroFrom]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.hero, { paddingTop: insets.top + 64 }]}>
          <View style={styles.heroIcon}>
            <Ionicons name={s.icon} size={34} color="#fff" />
          </View>
          <Text style={styles.title}>{s.title[lang]}</Text>
          <Text style={styles.short}>{s.short[lang]}</Text>
          <Ionicons name={s.icon} size={180} color="rgba(255,255,255,0.08)" style={styles.watermark} />
        </LinearGradient>

        <View style={{ padding: space.lg, gap: space.lg }}>
          <Text style={{ color: c.text, fontSize: 16, lineHeight: 24 }}>{s.description[lang]}</Text>
          <Card style={{ gap: space.md }}>
            <Text style={{ color: c.text, fontSize: 18, fontWeight: '800' }}>{t.service.features}</Text>
            {s.features[lang].map((f) => (
              <View key={f} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                <View style={[styles.check, { backgroundColor: c.successSoft }]}>
                  <Ionicons name="checkmark" size={16} color={c.success} />
                </View>
                <Text style={{ color: c.text, fontSize: 15, flex: 1 }}>{f}</Text>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + space.md, backgroundColor: c.bg, borderColor: c.border }]}>
        {s.mode && (
          <Button title={t.service.calc} icon="calculator-outline" variant="secondary" style={{ flex: 1 }} onPress={() => router.push('/calculator')} />
        )}
        <Button
          title={t.service.request}
          icon="paper-plane"
          variant="accent"
          style={{ flex: 1 }}
          onPress={() => router.push({ pathname: '/request', params: { service: s.title[lang], ...(s.mode ? { mode: s.mode } : {}) } })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: space.lg, paddingBottom: space.xxl, borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl, overflow: 'hidden' },
  heroIcon: { width: 64, height: 64, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#fff', fontSize: 28, fontWeight: '800', marginTop: space.lg, letterSpacing: -0.5 },
  short: { color: 'rgba(255,255,255,0.8)', fontSize: 16, marginTop: 6 },
  watermark: { position: 'absolute', right: -30, bottom: -30 },
  check: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: space.md, paddingHorizontal: space.lg, paddingTop: space.md, borderTopWidth: StyleSheet.hairlineWidth },
});

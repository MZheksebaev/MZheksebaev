import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Logo } from '../../components/Logo';
import { ShipmentCard } from '../../components/shipment';
import { Card, IconBadge, SectionHeader, Touchable, type IconName } from '../../components/ui';
import { company } from '../../constants/company';
import { services } from '../../constants/services';
import { radius, shadow, space, useTheme } from '../../constants/theme';
import { callCompany, openWhatsApp } from '../../lib/contact';
import { fetchShipment, normalizeNumber, type Shipment } from '../../lib/tracking';
import { useApp } from '../../store/AppStore';

export default function Home() {
  const { c, isDark } = useTheme();
  const { t, lang, tracked } = useApp();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<Shipment[]>([]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      Promise.all(tracked.slice(0, 5).map(fetchShipment)).then((r) => {
        if (alive) setActive(r.filter((s): s is Shipment => !!s));
      });
      return () => {
        alive = false;
      };
    }, [tracked]),
  );

  const submit = () => {
    const n = normalizeNumber(query);
    if (!n) return router.push('/track');
    router.push(`/shipment/${n}`);
    setQuery('');
  };

  const quick: { icon: IconName; label: string; color: string; onPress: () => void }[] = [
    { icon: 'calculator', label: t.home.quick.calc, color: '#2563EB', onPress: () => router.push('/calculator') },
    { icon: 'create', label: t.home.quick.request, color: c.accent, onPress: () => router.push('/request') },
    { icon: 'call', label: t.home.quick.call, color: '#16A34A', onPress: callCompany },
    { icon: 'logo-whatsapp', label: t.home.quick.chat, color: '#25D366', onPress: () => openWhatsApp() },
  ];

  const tile = (width - space.lg * 2 - space.md) / 2;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <LinearGradient
        colors={[c.heroFrom, c.heroTo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + space.lg }]}
      >
        <View style={styles.heroTop}>
          <Logo />
          <Touchable onPress={callCompany} style={styles.heroIcon}>
            <Ionicons name="call" size={20} color="#fff" />
          </Touchable>
        </View>
        <Text style={styles.hello}>{t.home.hello}</Text>
        <Text style={styles.heroSub}>{t.home.subtitle}</Text>

        <View style={[styles.search, shadow(isDark), { backgroundColor: c.surface }]}>
          <Ionicons name="search" size={20} color={c.textFaint} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t.home.trackPlaceholder}
            placeholderTextColor={c.textFaint}
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={submit}
            style={[styles.searchInput, { color: c.text }]}
          />
          <Touchable onPress={submit} style={[styles.searchBtn, { backgroundColor: c.accent }]}>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </Touchable>
        </View>

        <View style={styles.stats}>
          {(
            [
              [company.stats.years, t.home.stats.years],
              [company.stats.tons, t.home.stats.tons],
              [company.stats.countries, t.home.stats.countries],
            ] as const
          ).map(([v, l]) => (
            <View key={l} style={styles.stat}>
              <Text style={styles.statValue}>{v}</Text>
              <Text style={styles.statLabel}>{l}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <Card style={styles.quick}>
          {quick.map((q) => (
            <Touchable key={q.label} onPress={q.onPress} style={styles.quickItem}>
              <IconBadge name={q.icon} color={q.color} size={50} />
              <Text style={[styles.quickLabel, { color: c.text }]} numberOfLines={1}>
                {q.label}
              </Text>
            </Touchable>
          ))}
        </Card>

        {active.length > 0 && (
          <>
            <SectionHeader title={t.home.active} action={t.common.seeAll} onAction={() => router.push('/track')} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={width * 0.82 + space.md}
              decelerationRate="fast"
              style={{ marginHorizontal: -space.lg }}
              contentContainerStyle={{ paddingHorizontal: space.lg, gap: space.md, paddingBottom: 8 }}
            >
              {active.map((s) => (
                <View key={s.number} style={{ width: width * 0.82 }}>
                  <ShipmentCard s={s} onPress={() => router.push(`/shipment/${s.number}`)} />
                </View>
              ))}
            </ScrollView>
          </>
        )}

        <SectionHeader title={t.home.services} />
        <View style={styles.grid}>
          {services.map((s) => (
            <Card key={s.id} onPress={() => router.push(`/service/${s.id}`)} style={[styles.tile, { width: tile }]}>
              <IconBadge name={s.icon} color={s.tint} />
              <Text style={[styles.tileTitle, { color: c.text }]} numberOfLines={2}>
                {s.title[lang]}
              </Text>
              <Text style={{ color: c.textMuted, fontSize: 12.5 }} numberOfLines={1}>
                {s.short[lang]}
              </Text>
            </Card>
          ))}
        </View>

        <SectionHeader title={t.home.why} />
        <Card style={{ gap: space.lg }}>
          {t.home.benefits.map((b) => (
            <View key={b.title} style={styles.benefit}>
              <IconBadge name={b.icon as IconName} color={c.primary} size={40} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.text, fontWeight: '700', fontSize: 15 }}>{b.title}</Text>
                <Text style={{ color: c.textMuted, fontSize: 13, marginTop: 2 }}>{b.text}</Text>
              </View>
            </View>
          ))}
        </Card>

        <Touchable onPress={() => router.push('/request')} style={{ marginTop: space.xxl }}>
          <LinearGradient colors={['#F26B1D', '#F59E0B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cta}>
            <View style={{ flex: 1 }}>
              <Text style={styles.ctaTitle}>{t.home.ctaTitle}</Text>
              <Text style={styles.ctaText}>{t.home.ctaText}</Text>
              <View style={styles.ctaBtn}>
                <Text style={{ color: '#F26B1D', fontWeight: '800' }}>{t.home.ctaButton}</Text>
                <Ionicons name="arrow-forward" size={16} color="#F26B1D" />
              </View>
            </View>
            <Ionicons name="cube" size={84} color="rgba(255,255,255,0.25)" style={{ position: 'absolute', right: -6, bottom: -8 }} />
          </LinearGradient>
        </Touchable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: space.lg, paddingBottom: 64, borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hello: { color: '#fff', fontSize: 28, fontWeight: '800', marginTop: space.xxl, letterSpacing: -0.5 },
  heroSub: { color: 'rgba(255,255,255,0.75)', fontSize: 15, marginTop: 4 },
  search: {
    marginTop: space.xl,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    paddingLeft: space.lg,
    padding: 6,
    gap: space.sm,
  },
  searchInput: { flex: 1, fontSize: 16, paddingVertical: 12, fontWeight: '600' },
  searchBtn: { width: 46, height: 46, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  stats: { flexDirection: 'row', marginTop: space.xl },
  stat: { flex: 1 },
  statValue: { color: '#fff', fontSize: 20, fontWeight: '800' },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  body: { paddingHorizontal: space.lg, marginTop: -40, paddingBottom: 40 },
  quick: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: space.lg, paddingHorizontal: space.sm },
  quickItem: { flex: 1, alignItems: 'center', gap: 8 },
  quickLabel: { fontSize: 12.5, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  tile: { gap: 8, minHeight: 138 },
  tileTitle: { fontSize: 15, fontWeight: '700', marginTop: 4, lineHeight: 19 },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  cta: { borderRadius: radius.lg, padding: space.xl, overflow: 'hidden' },
  ctaTitle: { color: '#fff', fontSize: 19, fontWeight: '800', maxWidth: '80%' },
  ctaText: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginTop: 6, maxWidth: '78%' },
  ctaBtn: {
    marginTop: space.lg,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingHorizontal: space.lg,
    height: 40,
    borderRadius: radius.pill,
  },
});

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { modeIcon, StatusPill, Timeline } from '../../components/shipment';
import { Button, Card, EmptyState, ProgressBar, Touchable } from '../../components/ui';
import { radius, space, useTheme } from '../../constants/theme';
import { fmt } from '../../lib/calc';
import { callCompany, openWhatsApp } from '../../lib/contact';
import { fetchShipment, formatDate, progressOf, type Shipment } from '../../lib/tracking';
import { useApp } from '../../store/AppStore';

export default function ShipmentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { c } = useTheme();
  const { t, lang, addTracked } = useApp();
  const [s, setS] = useState<Shipment | null | undefined>(undefined);

  useEffect(() => {
    fetchShipment(id).then((r) => {
      setS(r);
      if (r) addTracked(r.number);
    });
  }, [id, addTracked]);

  if (s === undefined) return <ActivityIndicator style={{ flex: 1 }} color={c.accent} />;
  if (s === null)
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, padding: space.lg }}>
        <EmptyState icon="help-buoy-outline" title={t.track.notFoundTitle} text={t.track.notFoundText}>
          <Button
            title={t.track.askManager}
            icon="logo-whatsapp"
            variant="whatsapp"
            style={{ marginTop: space.md, alignSelf: 'stretch' }}
            onPress={() => openWhatsApp(`${t.track.askManager}: ${id}`)}
          />
        </EmptyState>
      </View>
    );

  const share = () =>
    Share.share({ message: `${s.number}: ${s.from} → ${s.to} — ${t.track.status[s.status]}` }).catch(() => {});

  const facts = [
    { label: t.track.cargo, value: s.cargo, icon: 'cube-outline' as const },
    { label: t.track.weight, value: `${fmt(s.weightKg)} ${t.common.kg}`, icon: 'barbell-outline' as const },
    { label: t.track.eta, value: formatDate(s.eta, lang), icon: 'calendar-outline' as const },
  ];

  return (
    <ScrollView style={{ backgroundColor: c.bg }} contentContainerStyle={{ padding: space.lg, paddingBottom: 48 }}>
      <Stack.Screen
        options={{
          title: s.number,
          headerRight: () => (
            <Touchable onPress={share} hitSlop={10}>
              <Ionicons name="share-outline" size={22} color={c.text} />
            </Touchable>
          ),
        }}
      />

      <LinearGradient colors={[c.heroFrom, c.heroTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.row}>
          <View style={styles.modeBadge}>
            <Ionicons name={modeIcon[s.mode]} size={18} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '700' }}>{t.modes[s.mode]}</Text>
          </View>
          <StatusPill status={s.status} />
        </View>

        <View style={[styles.row, { marginTop: space.xl, alignItems: 'flex-end' }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroLabel}>{t.track.from}</Text>
            <Text style={styles.heroCity}>{s.from}</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="rgba(255,255,255,0.6)" style={{ marginBottom: 4 }} />
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={styles.heroLabel}>{t.track.to}</Text>
            <Text style={[styles.heroCity, { textAlign: 'right' }]}>{s.to}</Text>
          </View>
        </View>

        <View style={{ marginTop: space.xl, gap: 8 }}>
          <View style={styles.row}>
            <Text style={styles.heroLabel}>{t.track.progress}</Text>
            <Text style={{ color: '#fff', fontWeight: '800' }}>{Math.round(progressOf(s) * 100)}%</Text>
          </View>
          <ProgressBar value={progressOf(s)} color="#F26B1D" track="rgba(255,255,255,0.2)" />
        </View>
      </LinearGradient>

      <Card style={{ marginTop: space.lg, flexDirection: 'row', paddingHorizontal: space.md }}>
        {facts.map((f, i) => (
          <View key={f.label} style={[styles.fact, i > 0 && { borderLeftWidth: StyleSheet.hairlineWidth, borderColor: c.border }]}>
            <Ionicons name={f.icon} size={18} color={c.accent} />
            <Text style={{ color: c.textMuted, fontSize: 12 }}>{f.label}</Text>
            <Text style={{ color: c.text, fontWeight: '700', fontSize: 13, textAlign: 'center' }} numberOfLines={2}>
              {f.value}
            </Text>
          </View>
        ))}
      </Card>

      <Text style={[styles.h2, { color: c.text }]}>{t.track.history}</Text>
      <Card>
        <Timeline events={s.events} />
      </Card>

      <View style={{ flexDirection: 'row', gap: space.md, marginTop: space.xl }}>
        <Button title={t.common.call} icon="call" variant="secondary" style={{ flex: 1 }} onPress={callCompany} />
        <Button
          title={t.common.whatsapp}
          icon="logo-whatsapp"
          variant="whatsapp"
          style={{ flex: 1 }}
          onPress={() => openWhatsApp(`${t.track.askManager}: ${s.number}`)}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: radius.lg, padding: space.xl },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.md },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    height: 30,
    borderRadius: 15,
  },
  heroLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: '600' },
  heroCity: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 4 },
  fact: { flex: 1, alignItems: 'center', gap: 4, paddingHorizontal: 6 },
  h2: { fontSize: 20, fontWeight: '800', marginTop: space.xxl, marginBottom: space.md },
});

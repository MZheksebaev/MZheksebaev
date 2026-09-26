import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { ShipmentCard } from '../../components/shipment';
import { Button, Card, Chip, EmptyState, Field, SectionHeader } from '../../components/ui';
import { space, useTheme } from '../../constants/theme';
import { openWhatsApp } from '../../lib/contact';
import { DEMO_NUMBERS, fetchShipment, normalizeNumber, type Shipment } from '../../lib/tracking';
import { useApp } from '../../store/AppStore';

export default function Track() {
  const { c } = useTheme();
  const { t, tracked, addTracked } = useApp();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState<string | null>(null);
  const [recent, setRecent] = useState<Shipment[]>([]);

  const search = useCallback(
    async (raw: string) => {
      const n = normalizeNumber(raw);
      if (!n) return;
      setQuery(n);
      setLoading(true);
      setNotFound(null);
      const s = await fetchShipment(n);
      setLoading(false);
      if (!s) return setNotFound(n);
      addTracked(s.number);
      router.push(`/shipment/${s.number}`);
    },
    [addTracked],
  );

  useEffect(() => {
    Promise.all(tracked.map(fetchShipment)).then((r) => setRecent(r.filter((s): s is Shipment => !!s)));
  }, [tracked]);

  return (
    <Screen title={t.track.title} subtitle={t.track.subtitle}>
      <Card style={{ gap: space.md }}>
        <Field
          icon="barcode-outline"
          value={query}
          onChangeText={(v) => {
            setQuery(v);
            setNotFound(null);
          }}
          placeholder={t.track.placeholder}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={() => search(query)}
        />
        <Button title={t.track.search} icon="search" variant="accent" loading={loading} onPress={() => search(query)} />
        <Text style={{ color: c.textMuted, fontSize: 13 }}>{t.track.demoHint}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {DEMO_NUMBERS.map((n) => (
            <Chip key={n} label={n} icon="cube-outline" onPress={() => search(n)} />
          ))}
        </View>
      </Card>

      {loading && <ActivityIndicator style={{ marginTop: space.xl }} color={c.accent} />}

      {notFound && (
        <Card style={{ marginTop: space.lg }}>
          <EmptyState icon="help-buoy-outline" title={t.track.notFoundTitle} text={t.track.notFoundText}>
            <Button
              title={t.track.askManager}
              icon="logo-whatsapp"
              variant="whatsapp"
              style={{ marginTop: space.md, alignSelf: 'stretch' }}
              onPress={() => openWhatsApp(`${t.track.askManager}: ${notFound}`)}
            />
          </EmptyState>
        </Card>
      )}

      <SectionHeader title={t.track.recent} />
      {recent.length === 0 ? (
        <EmptyState icon="cube-outline" title={t.track.empty} />
      ) : (
        <View style={{ gap: space.md }}>
          {recent.map((s) => (
            <ShipmentCard key={s.number} s={s} onPress={() => router.push(`/shipment/${s.number}`)} />
          ))}
        </View>
      )}
    </Screen>
  );
}

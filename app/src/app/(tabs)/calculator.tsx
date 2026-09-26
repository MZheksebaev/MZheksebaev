import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { modeIcon } from '../../components/shipment';
import { Button, Card, Chip, Field, IconBadge, SectionHeader, Segmented, Touchable } from '../../components/ui';
import { radius, space, useTheme } from '../../constants/theme';
import { calculate, fmt, parseNum, totalWeight, volumeM3, type Mode } from '../../lib/calc';
import { useApp } from '../../store/AppStore';

type CargoType = 'general' | 'fragile' | 'dangerous' | 'temp';

export default function Calculator() {
  const { c } = useTheme();
  const { t } = useApp();
  const [scope, setScope] = useState<'intl' | 'kz'>('intl');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [weight, setWeight] = useState('');
  const [places, setPlaces] = useState('1');
  const [l, setL] = useState('');
  const [w, setW] = useState('');
  const [h, setH] = useState('');
  const [type, setType] = useState<CargoType>('general');
  const [picked, setPicked] = useState<Mode | null>(null);

  const input = {
    weightKg: parseNum(weight),
    lengthCm: parseNum(l),
    widthCm: parseNum(w),
    heightCm: parseNum(h),
    places: Math.max(1, Math.round(parseNum(places))),
    domestic: scope === 'kz',
  };
  const hasData = input.weightKg > 0 || volumeM3(input) > 0;
  const results = hasData ? calculate(input) : [];

  const requestPrice = () => {
    const vol = volumeM3(input);
    router.push({
      pathname: '/request',
      params: {
        from,
        to,
        cargo: t.calc.types[type],
        weight: `${fmt(totalWeight(input))} ${t.common.kg}${vol ? `, ${fmt(vol, 2)} ${t.common.m3}` : ''}, ${input.places} ${t.calc.places.toLowerCase()}`,
        mode: picked ?? 'any',
      },
    });
  };

  const types: CargoType[] = ['general', 'fragile', 'dangerous', 'temp'];

  return (
    <Screen
      title={t.calc.title}
      subtitle={t.calc.subtitle}
      footer={<Button title={t.calc.getPrice} icon="paper-plane" variant="accent" onPress={requestPrice} />}
    >
      <Segmented
        value={scope}
        onChange={(v) => {
          setScope(v);
          setPicked(null);
        }}
        options={[
          { value: 'intl', label: t.calc.intl, icon: 'globe-outline' },
          { value: 'kz', label: t.calc.domestic, icon: 'map-outline' },
        ]}
      />

      <Card style={{ marginTop: space.lg, gap: space.md }}>
        <View>
          <Field label={t.calc.from} icon="ellipse-outline" value={from} onChangeText={setFrom} placeholder={scope === 'kz' ? t.calc.fromPhKz : t.calc.fromPh} />
          <Touchable
            onPress={() => {
              setFrom(to);
              setTo(from);
            }}
            style={[styles.swap, { backgroundColor: c.surface, borderColor: c.border }]}
            accessibilityLabel={t.calc.swap}
          >
            <Ionicons name="swap-vertical" size={18} color={c.accent} />
          </Touchable>
          <Field label={t.calc.to} icon="location-outline" value={to} onChangeText={setTo} placeholder={scope === 'kz' ? t.calc.toPhKz : t.calc.toPh} style={{ marginTop: space.md }} />
        </View>
      </Card>

      <Card style={{ marginTop: space.md, gap: space.md }}>
        <View style={styles.row}>
          <Field label={t.calc.weight} value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder="0" style={{ flex: 2 }} />
          <Field label={t.calc.places} value={places} onChangeText={setPlaces} keyboardType="number-pad" style={{ flex: 1 }} />
        </View>
        <View style={styles.row}>
          <Field label={t.calc.length} value={l} onChangeText={setL} keyboardType="decimal-pad" placeholder={t.common.cm} style={{ flex: 1 }} />
          <Field label={t.calc.width} value={w} onChangeText={setW} keyboardType="decimal-pad" placeholder={t.common.cm} style={{ flex: 1 }} />
          <Field label={t.calc.height} value={h} onChangeText={setH} keyboardType="decimal-pad" placeholder={t.common.cm} style={{ flex: 1 }} />
        </View>
        <Text style={{ color: c.textMuted, fontSize: 13, fontWeight: '600' }}>{t.calc.cargoType}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {types.map((k) => (
            <Chip key={k} label={t.calc.types[k]} active={type === k} onPress={() => setType(k)} />
          ))}
        </View>
      </Card>

      <SectionHeader title={t.calc.result} />
      {!hasData ? (
        <Card style={{ alignItems: 'center', paddingVertical: space.xxl, gap: 10 }}>
          <IconBadge name="options-outline" color={c.textFaint} size={52} />
          <Text style={{ color: c.textMuted, fontSize: 15 }}>{t.calc.fill}</Text>
        </Card>
      ) : (
        <View style={{ gap: space.md }}>
          <View style={[styles.summary, { backgroundColor: c.primarySoft }]}>
            <Text style={{ color: c.text, fontWeight: '600' }}>
              {t.calc.volume}: {fmt(volumeM3(input), 2)} {t.common.m3}
            </Text>
            <Text style={{ color: c.text, fontWeight: '600' }}>
              {t.track.weight}: {fmt(totalWeight(input))} {t.common.kg}
            </Text>
          </View>
          {results.map((r) => {
            const active = picked === r.mode;
            return (
              <Touchable
                key={r.mode}
                onPress={() => setPicked(active ? null : r.mode)}
                style={[
                  styles.option,
                  { backgroundColor: c.surface, borderColor: active ? c.accent : c.border, borderWidth: active ? 2 : 1 },
                ]}
              >
                <IconBadge name={modeIcon[r.mode]} color={active ? c.accent : c.primary} size={48} />
                <View style={{ flex: 1, gap: 3 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <Text style={{ color: c.text, fontSize: 17, fontWeight: '800' }}>{t.modes[r.mode]}</Text>
                    {r.fastest && <Tag text={t.calc.best} color={c.accent} bg={c.accentSoft} />}
                    {r.cheapest && <Tag text={t.calc.cheapest} color={c.success} bg={c.successSoft} />}
                  </View>
                  <Text style={{ color: c.textMuted, fontSize: 13 }}>
                    {t.calc.chargeable}: {fmt(r.chargeableKg)} {t.common.kg}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: c.text, fontSize: 18, fontWeight: '800' }}>
                    {r.transit[0]}–{r.transit[1]}
                  </Text>
                  <Text style={{ color: c.textMuted, fontSize: 12 }}>{t.common.days}</Text>
                </View>
              </Touchable>
            );
          })}
          <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 4 }}>
            <Ionicons name="information-circle-outline" size={18} color={c.textFaint} />
            <Text style={{ color: c.textMuted, fontSize: 13, flex: 1, lineHeight: 18 }}>{t.calc.note}</Text>
          </View>
        </View>
      )}
    </Screen>
  );
}

function Tag({ text, color, bg }: { text: string; color: string; bg: string }) {
  return (
    <View style={{ backgroundColor: bg, paddingHorizontal: 8, height: 22, borderRadius: 11, justifyContent: 'center' }}>
      <Text style={{ color, fontSize: 11, fontWeight: '800' }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.md },
  swap: {
    position: 'absolute',
    right: 14,
    top: 58,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  summary: { flexDirection: 'row', justifyContent: 'space-between', padding: space.md, borderRadius: radius.md },
  option: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, borderRadius: radius.lg },
});

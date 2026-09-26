import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../constants/theme';
import type { Mode } from '../lib/calc';
import { formatDate, progressOf, type Shipment, type StatusKey, type TrackEvent } from '../lib/tracking';
import { useApp } from '../store/AppStore';
import { Card, ProgressBar, type IconName } from './ui';

export const modeIcon: Record<Mode, IconName> = { road: 'bus', rail: 'train', sea: 'boat', air: 'airplane' };

export function useStatusColor() {
  const { c } = useTheme();
  return (s: StatusKey) =>
    s === 'delivered'
      ? { fg: c.success, bg: c.successSoft }
      : s === 'customs'
        ? { fg: c.warning, bg: c.warningSoft }
        : { fg: c.accent, bg: c.accentSoft };
}

export function StatusPill({ status }: { status: StatusKey }) {
  const { t } = useApp();
  const color = useStatusColor()(status);
  return (
    <View style={[styles.pill, { backgroundColor: color.bg }]}>
      <View style={[styles.dot, { backgroundColor: color.fg }]} />
      <Text style={{ color: color.fg, fontWeight: '700', fontSize: 12 }}>{t.track.status[status]}</Text>
    </View>
  );
}

export function RouteLine({ from, to, mode }: { from: string; to: string; mode: Mode }) {
  const { c } = useTheme();
  return (
    <View style={styles.route}>
      <Text style={[styles.city, { color: c.text }]} numberOfLines={1}>
        {from}
      </Text>
      <View style={styles.routeMid}>
        <View style={[styles.dash, { borderColor: c.border }]} />
        <Ionicons name={modeIcon[mode]} size={16} color={c.accent} />
        <View style={[styles.dash, { borderColor: c.border }]} />
      </View>
      <Text style={[styles.city, { color: c.text, textAlign: 'right' }]} numberOfLines={1}>
        {to}
      </Text>
    </View>
  );
}

export function ShipmentCard({ s, onPress }: { s: Shipment; onPress?: () => void }) {
  const { c } = useTheme();
  const { t, lang } = useApp();
  const color = useStatusColor()(s.status);
  return (
    <Card onPress={onPress} style={{ gap: 12 }}>
      <View style={styles.row}>
        <Text style={[styles.number, { color: c.text }]}>{s.number}</Text>
        <StatusPill status={s.status} />
      </View>
      <RouteLine from={s.from} to={s.to} mode={s.mode} />
      <ProgressBar value={progressOf(s)} color={color.fg} track={c.surfaceAlt} />
      <View style={styles.row}>
        <Text style={{ color: c.textMuted, fontSize: 13 }} numberOfLines={1}>
          {s.events[0]?.place}
        </Text>
        <Text style={{ color: c.textMuted, fontSize: 13 }}>
          {t.track.eta}: <Text style={{ color: c.text, fontWeight: '700' }}>{formatDate(s.eta, lang)}</Text>
        </Text>
      </View>
    </Card>
  );
}

export function Timeline({ events }: { events: TrackEvent[] }) {
  const { c } = useTheme();
  const { t, lang } = useApp();
  const statusColor = useStatusColor();
  return (
    <View>
      {events.map((e, i) => {
        const first = i === 0;
        const last = i === events.length - 1;
        const col = first ? statusColor(e.status).fg : c.textFaint;
        return (
          <View key={`${e.date}-${i}`} style={styles.tlRow}>
            <View style={styles.tlRail}>
              <View
                style={[
                  styles.tlDot,
                  { backgroundColor: first ? col : c.surface, borderColor: col },
                  first && { width: 16, height: 16, borderRadius: 8, borderWidth: 4, borderColor: statusColor(e.status).bg },
                ]}
              />
              {!last && <View style={[styles.tlLine, { backgroundColor: c.border }]} />}
            </View>
            <View style={styles.tlBody}>
              <Text style={{ color: first ? c.text : c.textMuted, fontWeight: first ? '800' : '600', fontSize: 15 }}>
                {t.track.status[e.status]}
              </Text>
              <Text style={{ color: c.textMuted, fontSize: 13, marginTop: 2 }}>
                {e.place}
                {e.note ? ` · ${e.note}` : ''}
              </Text>
              <Text style={{ color: c.textFaint, fontSize: 12, marginTop: 2 }}>{formatDate(e.date, lang, true)}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, height: 26, borderRadius: 13 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  number: { fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
  route: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  city: { flex: 1, fontSize: 15, fontWeight: '700' },
  routeMid: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 0 },
  dash: { width: 18, borderTopWidth: 1.5, borderStyle: 'dashed' },
  tlRow: { flexDirection: 'row', gap: 14 },
  tlRail: { width: 16, alignItems: 'center' },
  tlDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, marginTop: 3 },
  tlLine: { width: 2, flex: 1, marginVertical: 4 },
  tlBody: { flex: 1, paddingBottom: 20 },
});

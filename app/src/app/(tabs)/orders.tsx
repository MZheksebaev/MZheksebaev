import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { modeIcon } from '../../components/shipment';
import { Button, Card, EmptyState, IconBadge, Touchable } from '../../components/ui';
import { space, useTheme } from '../../constants/theme';
import { formatDate } from '../../lib/tracking';
import { useApp } from '../../store/AppStore';

export default function Orders() {
  const { c } = useTheme();
  const { t, lang, orders, removeOrder } = useApp();

  return (
    <Screen
      title={t.orders.title}
      right={
        <Touchable onPress={() => router.push('/request')} style={{ padding: 6 }} accessibilityLabel={t.orders.create}>
          <Ionicons name="add-circle" size={34} color={c.accent} />
        </Touchable>
      }
    >
      {orders.length === 0 ? (
        <EmptyState icon="document-text-outline" title={t.orders.empty} text={t.orders.emptyText}>
          <Button title={t.orders.create} icon="add" variant="accent" onPress={() => router.push('/request')} style={{ marginTop: space.md, alignSelf: 'stretch' }} />
        </EmptyState>
      ) : (
        <View style={{ gap: space.md }}>
          {orders.map((o) => (
            <Card key={o.id} style={{ gap: space.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                <IconBadge name={o.mode === 'any' ? 'swap-horizontal' : modeIcon[o.mode]} color={c.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, fontSize: 16, fontWeight: '800' }} numberOfLines={1}>
                    {o.from} → {o.to}
                  </Text>
                  <Text style={{ color: c.textMuted, fontSize: 13, marginTop: 2 }} numberOfLines={1}>
                    {[o.cargo, o.weight].filter(Boolean).join(' · ') || (o.mode === 'any' ? t.request.any : t.modes[o.mode])}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name={o.channel === 'whatsapp' ? 'logo-whatsapp' : 'mail'} size={15} color={c.success} />
                  <Text style={{ color: c.textMuted, fontSize: 13 }}>
                    {t.orders.sent} · {formatDate(o.createdAt, lang, true)}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: space.lg }}>
                  <Touchable
                    hitSlop={8}
                    onPress={() =>
                      router.push({
                        pathname: '/request',
                        params: { from: o.from, to: o.to, cargo: o.cargo, weight: o.weight, mode: o.mode },
                      })
                    }
                  >
                    <Text style={{ color: c.accent, fontWeight: '700' }}>{t.orders.repeat}</Text>
                  </Touchable>
                  <Touchable hitSlop={8} onPress={() => removeOrder(o.id)} accessibilityLabel={t.common.delete}>
                    <Ionicons name="trash-outline" size={18} color={c.textFaint} />
                  </Touchable>
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}

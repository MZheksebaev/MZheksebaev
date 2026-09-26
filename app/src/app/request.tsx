import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, ScrollView, Text, View } from 'react-native';
import { modeIcon } from '../components/shipment';
import { Button, Chip, Field } from '../components/ui';
import { space, useTheme } from '../constants/theme';
import { MODES, type Mode } from '../lib/calc';
import { openEmail, openWhatsApp } from '../lib/contact';
import { useApp, type Order } from '../store/AppStore';

type Params = Partial<Record<'from' | 'to' | 'cargo' | 'weight' | 'mode' | 'service', string>>;

export default function RequestScreen() {
  const { c } = useTheme();
  const { t, profile, addOrder } = useApp();
  const p = useLocalSearchParams<Params>();

  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone || '+7 ');
  const [from, setFrom] = useState(p.from ?? '');
  const [to, setTo] = useState(p.to ?? '');
  const [cargo, setCargo] = useState(p.cargo ?? '');
  const [weight, setWeight] = useState(p.weight ?? '');
  const [mode, setMode] = useState<Mode | 'any'>((p.mode as Mode) ?? 'any');
  const [comment, setComment] = useState(p.service ?? '');

  const valid = name.trim() && phone.replace(/\D/g, '').length >= 10 && from.trim() && to.trim();

  const send = (channel: Order['channel']) => {
    if (!valid) {
      const msg = t.request.required;
      return Platform.OS === 'web' ? window.alert(msg) : Alert.alert(msg);
    }
    const order: Order = {
      id: Date.now().toString(36),
      createdAt: new Date().toISOString(),
      name: name.trim(),
      phone: phone.trim(),
      from: from.trim(),
      to: to.trim(),
      cargo: cargo.trim(),
      weight: weight.trim(),
      mode,
      comment: comment.trim(),
      channel,
    };
    const lines = [
      t.request.messageTitle,
      `${t.request.name}: ${order.name}`,
      `${t.request.phone}: ${order.phone}`,
      `${t.common.route}: ${order.from} → ${order.to}`,
      order.cargo && `${t.request.cargo}: ${order.cargo}`,
      order.weight && `${t.request.weight}: ${order.weight}`,
      `${t.request.mode}: ${mode === 'any' ? t.request.any : t.modes[mode]}`,
      order.comment && `${t.request.comment}: ${order.comment}`,
    ].filter(Boolean);
    const body = lines.join('\n');

    addOrder(order);
    if (channel === 'whatsapp') openWhatsApp(body);
    else openEmail(t.request.messageTitle, body);
    router.replace('/orders');
  };

  return (
    <ScrollView
      style={{ backgroundColor: c.bg }}
      contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: 48 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={{ color: c.textMuted, fontSize: 15, marginBottom: space.sm }}>{t.request.subtitle}</Text>
      <Field label={t.request.name} icon="person-outline" value={name} onChangeText={setName} autoComplete="name" />
      <Field label={t.request.phone} icon="call-outline" value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" />
      <View style={{ flexDirection: 'row', gap: space.md }}>
        <Field label={t.request.from} value={from} onChangeText={setFrom} style={{ flex: 1 }} />
        <Field label={t.request.to} value={to} onChangeText={setTo} style={{ flex: 1 }} />
      </View>
      <Field label={t.request.cargo} icon="cube-outline" value={cargo} onChangeText={setCargo} />
      <Field label={t.request.weight} icon="barbell-outline" value={weight} onChangeText={setWeight} />

      <Text style={{ color: c.textMuted, fontSize: 13, fontWeight: '600', marginLeft: 2 }}>{t.request.mode}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        <Chip label={t.request.any} active={mode === 'any'} onPress={() => setMode('any')} />
        {MODES.map((m) => (
          <Chip key={m} label={t.modes[m]} icon={modeIcon[m]} active={mode === m} onPress={() => setMode(m)} />
        ))}
      </View>

      <Field label={t.request.comment} value={comment} onChangeText={setComment} multiline />

      <Button title={t.request.sendWa} icon="logo-whatsapp" variant="whatsapp" onPress={() => send('whatsapp')} style={{ marginTop: space.md }} />
      <Button title={t.request.sendEmail} icon="mail-outline" variant="secondary" onPress={() => send('email')} />
    </ScrollView>
  );
}

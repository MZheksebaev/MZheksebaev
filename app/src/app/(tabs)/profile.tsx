import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { StyleSheet, Text, View } from 'react-native';
import { Logo } from '../../components/Logo';
import { Screen } from '../../components/Screen';
import { Card, IconBadge, Segmented, Touchable, type IconName } from '../../components/ui';
import { company } from '../../constants/company';
import { space, useTheme } from '../../constants/theme';
import { langLabels, type Lang } from '../../i18n/strings';
import { callCompany, openEmail, openMap, openWebsite, openWhatsApp } from '../../lib/contact';
import { useApp } from '../../store/AppStore';

export default function Profile() {
  const { c } = useTheme();
  const { t, lang, setLang, clearHistory } = useApp();

  const rows: { icon: IconName; color: string; title: string; value: string; onPress: () => void }[] = [
    { icon: 'call', color: '#16A34A', title: t.common.call, value: company.phone, onPress: callCompany },
    { icon: 'logo-whatsapp', color: '#25D366', title: t.common.whatsapp, value: company.phone, onPress: () => openWhatsApp() },
    { icon: 'mail', color: '#2563EB', title: t.common.email, value: company.email, onPress: () => openEmail() },
    { icon: 'location', color: '#F26B1D', title: t.profile.office, value: company.address[lang], onPress: openMap },
    { icon: 'globe', color: '#8B5CF6', title: t.profile.website, value: 'zhebelogistics.kz', onPress: openWebsite },
  ];

  return (
    <Screen title={t.profile.title}>
      <Card style={{ backgroundColor: c.heroFrom, borderColor: c.heroFrom, gap: space.md }}>
        <Logo size={44} />
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 20 }}>{t.profile.aboutText}</Text>
      </Card>

      <Text style={[styles.h, { color: c.textMuted }]}>{t.profile.language}</Text>
      <Segmented<Lang>
        value={lang}
        onChange={setLang}
        options={(Object.keys(langLabels) as Lang[]).map((l) => ({ value: l, label: langLabels[l] }))}
      />

      <Text style={[styles.h, { color: c.textMuted }]}>{t.profile.contacts}</Text>
      <Card style={{ paddingVertical: space.xs }}>
        {rows.map((r, i) => (
          <Touchable
            key={r.title}
            onPress={r.onPress}
            style={[styles.row, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderColor: c.border }]}
          >
            <IconBadge name={r.icon} color={r.color} size={38} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.textMuted, fontSize: 12 }}>{r.title}</Text>
              <Text style={{ color: c.text, fontSize: 15, fontWeight: '600', marginTop: 1 }}>{r.value}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={c.textFaint} />
          </Touchable>
        ))}
      </Card>

      <Card style={{ marginTop: space.lg, paddingVertical: space.xs }}>
        <Touchable onPress={clearHistory} style={styles.row}>
          <IconBadge name="trash" color={c.danger} size={38} />
          <Text style={{ color: c.danger, fontSize: 15, fontWeight: '600', flex: 1 }}>{t.profile.clear}</Text>
        </Touchable>
      </Card>

      <Text style={{ color: c.textFaint, fontSize: 12, textAlign: 'center', marginTop: space.xl, lineHeight: 18 }}>
        {t.profile.theme}
        {'\n'}
        {company.legalName} · {t.profile.version} {Constants.expoConfig?.version ?? '1.0.0'}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  h: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginTop: space.xxl, marginBottom: space.sm, marginLeft: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md },
});

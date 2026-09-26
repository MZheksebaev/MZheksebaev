import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { ComponentProps, ReactNode } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableProps,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { radius, shadow, space, useTheme } from '../constants/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export const tap = () => {
  if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
};

/** Pressable with a subtle scale + opacity response, like iOS system buttons. */
export function Touchable({ style, onPress, ...rest }: PressableProps & { style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable
      {...rest}
      onPress={(e) => {
        tap();
        onPress?.(e);
      }}
      style={({ pressed }) => [style, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
    />
  );
}

export function Card({ children, style, onPress }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }) {
  const { c, isDark } = useTheme();
  const base = [styles.card, { backgroundColor: c.surface, borderColor: c.border }, shadow(isDark), style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Touchable onPress={onPress} style={base}>
      {children}
    </Touchable>
  );
}

type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'whatsapp';

export function Button({
  title,
  icon,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  style,
  small,
}: {
  title: string;
  icon?: IconName;
  onPress?: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
}) {
  const { c, isDark } = useTheme();
  const bg: Record<ButtonVariant, string> = {
    primary: isDark ? '#2F6FE0' : c.primary,
    accent: c.accent,
    secondary: c.surfaceAlt,
    ghost: 'transparent',
    whatsapp: '#25D366',
  };
  const fg = variant === 'secondary' || variant === 'ghost' ? c.text : '#FFFFFF';
  return (
    <Touchable
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        small && styles.buttonSmall,
        { backgroundColor: bg[variant], opacity: disabled ? 0.5 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={small ? 16 : 19} color={fg} />}
          <Text style={[styles.buttonText, small && { fontSize: 14 }, { color: fg }]}>{title}</Text>
        </>
      )}
    </Touchable>
  );
}

export function IconBadge({ name, color, size = 44, soft = true }: { name: IconName; color: string; size?: number; soft?: boolean }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: soft ? color + '1F' : color,
      }}
    >
      <Ionicons name={name} size={size * 0.5} color={soft ? color : '#fff'} />
    </View>
  );
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const { c } = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: c.text }]}>{title}</Text>
      {action && (
        <Touchable onPress={onAction} hitSlop={10}>
          <Text style={{ color: c.accent, fontWeight: '600', fontSize: 15 }}>{action}</Text>
        </Touchable>
      )}
    </View>
  );
}

export function Field({ label, icon, style, ...props }: TextInputProps & { label?: string; icon?: IconName }) {
  const { c } = useTheme();
  return (
    <View style={style as StyleProp<ViewStyle>}>
      {label && <Text style={[styles.label, { color: c.textMuted }]}>{label}</Text>}
      <View style={[styles.field, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}>
        {icon && <Ionicons name={icon} size={18} color={c.textFaint} />}
        <TextInput
          placeholderTextColor={c.textFaint}
          {...props}
          style={[styles.input, { color: c.text }, props.multiline && { minHeight: 72, textAlignVertical: 'top' }]}
        />
      </View>
    </View>
  );
}

export function Chip({ label, active, onPress, icon }: { label: string; active?: boolean; onPress?: () => void; icon?: IconName }) {
  const { c, isDark } = useTheme();
  const activeBg = isDark ? '#2F6FE0' : c.primary;
  return (
    <Touchable
      onPress={onPress}
      style={[
        styles.chip,
        { backgroundColor: active ? activeBg : c.surface, borderColor: active ? activeBg : c.border },
      ]}
    >
      {icon && <Ionicons name={icon} size={15} color={active ? '#fff' : c.textMuted} />}
      <Text style={{ color: active ? '#fff' : c.text, fontWeight: '600', fontSize: 14 }}>{label}</Text>
    </Touchable>
  );
}

/** iOS-style segmented control. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string; icon?: IconName }[];
  onChange: (v: T) => void;
}) {
  const { c, isDark } = useTheme();
  return (
    <View style={[styles.segmented, { backgroundColor: c.surfaceAlt }]}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Touchable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={[styles.segment, active && [{ backgroundColor: c.surface }, shadow(isDark)]]}
          >
            {o.icon && <Ionicons name={o.icon} size={16} color={active ? c.accent : c.textMuted} />}
            <Text style={{ color: active ? c.text : c.textMuted, fontWeight: '600', fontSize: 13 }}>{o.label}</Text>
          </Touchable>
        );
      })}
    </View>
  );
}

export function ProgressBar({ value, color, track }: { value: number; color: string; track: string }) {
  return (
    <View style={{ height: 6, borderRadius: 3, backgroundColor: track, overflow: 'hidden' }}>
      <View style={{ width: `${Math.max(4, Math.min(100, value * 100))}%`, height: '100%', backgroundColor: color, borderRadius: 3 }} />
    </View>
  );
}

export function EmptyState({ icon, title, text, children }: { icon: IconName; title: string; text?: string; children?: ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: c.primarySoft }]}>
        <Ionicons name={icon} size={34} color={c.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: c.text }]}>{title}</Text>
      {text && <Text style={[styles.emptyText, { color: c.textMuted }]}>{text}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, padding: space.lg, borderWidth: StyleSheet.hairlineWidth },
  button: {
    height: 54,
    borderRadius: radius.md,
    paddingHorizontal: space.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  buttonSmall: { height: 40, paddingHorizontal: space.lg, borderRadius: radius.sm },
  buttonText: { fontSize: 16, fontWeight: '700' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space.xxl,
    marginBottom: space.md,
  },
  sectionTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginLeft: 2 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: space.md,
    minHeight: 50,
  },
  input: { flex: 1, fontSize: 16, paddingVertical: 12 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 38,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  segmented: { flexDirection: 'row', borderRadius: radius.md, padding: 4, gap: 4 },
  segment: {
    flex: 1,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  empty: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24, gap: 10 },
  emptyIcon: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  emptyTitle: { fontSize: 19, fontWeight: '800' },
  emptyText: { fontSize: 15, textAlign: 'center', lineHeight: 21 },
});

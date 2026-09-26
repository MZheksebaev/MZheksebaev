import { Text, View } from 'react-native';

/** "Жебе" means arrowhead in Kazakh — the mark is a forward-pointing arrow. */
export function Logo({ light = true, size = 36 }: { light?: boolean; size?: number }) {
  const fg = light ? '#FFFFFF' : '#0B2A5B';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.3,
          backgroundColor: '#F26B1D',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: 0,
            height: 0,
            marginLeft: size * 0.08,
            borderTopWidth: size * 0.22,
            borderBottomWidth: size * 0.22,
            borderLeftWidth: size * 0.36,
            borderTopColor: 'transparent',
            borderBottomColor: 'transparent',
            borderLeftColor: '#FFFFFF',
          }}
        />
      </View>
      <View>
        <Text style={{ color: fg, fontWeight: '900', fontSize: size * 0.5, letterSpacing: 1.5, lineHeight: size * 0.55 }}>
          ZHEBE
        </Text>
        <Text style={{ color: fg, opacity: 0.7, fontWeight: '600', fontSize: size * 0.26, letterSpacing: 3 }}>
          LOGISTICS
        </Text>
      </View>
    </View>
  );
}

import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Text } from 'heroui-native';

import { Display, Mono, Voice } from '@/components/ui';
import { CHAKRA_BY_KEY, CHAKRA_ORDER } from '@/lib/chakras';
import { MUDRAS } from '@/lib/mudras';
import { colors } from '@/lib/tokens/colors';
import type { ChakraKey } from '@/lib/types';

const FILTERS: { key: ChakraKey | 'all'; label: string; color: string | null }[] = [
  { key: 'all', label: 'ALL', color: null },
  ...CHAKRA_ORDER.map((key) => ({
    key,
    label: CHAKRA_BY_KEY[key].name.toUpperCase(),
    color: CHAKRA_BY_KEY[key].color,
  })),
];

/** Mudra Library — grid of the nine hand shapes, one per field node. */
export default function MudraLibraryScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<ChakraKey | 'all'>('all');

  const mudras = useMemo(
    () => (filter === 'all' ? MUDRAS : MUDRAS.filter((m) => m.chakra === filter)),
    [filter],
  );

  return (
    <View className="bg-field flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className="pt-safe px-5">
          <Mono className="text-body mt-3">BODY · MUDRA LIBRARY</Mono>
          <Display size={26} className="mt-2 leading-tight">
            Hand positions for the field.
          </Display>
          <Voice size={15} className="text-mute mt-1.5">
            Each gesture activates a center.
          </Voice>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-4 -mx-5 px-5"
            contentContainerStyle={{ gap: 7 }}
          >
            {FILTERS.map((f) => {
              const on = filter === f.key;
              return (
                <Pressable
                  key={f.key}
                  onPress={() => setFilter(f.key)}
                  className="rounded-full border px-2.5 py-2"
                  style={{
                    borderColor: on ? (f.color ?? colors.text.primary) : colors.border.muted,
                    backgroundColor: on ? (f.color ?? colors.text.primary) : 'transparent',
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                >
                  <Text
                    className="font-mono"
                    style={{
                      fontSize: 9,
                      letterSpacing: 1.2,
                      color: on ? colors.surface.deep : (f.color ?? colors.text.tertiary),
                    }}
                  >
                    {f.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View className="mt-5 flex-row flex-wrap gap-3">
            {mudras.map((m) => {
              const def = CHAKRA_BY_KEY[m.chakra];
              return (
                <Pressable
                  key={m.key}
                  onPress={() => router.push({ pathname: '/mudra/[key]', params: { key: m.key } })}
                  className="bg-panel border-line rounded-2xl border p-3"
                  style={{ width: '47%' }}
                  accessibilityRole="button"
                >
                  <View
                    className="border-line-2 items-center justify-center rounded-xl border border-dashed"
                    style={{ height: 66 }}
                  >
                    <Text className="font-mono" style={{ fontSize: 8, letterSpacing: 2, color: colors.text.ghost }}>
                      GLYPH
                    </Text>
                  </View>
                  <Text
                    className="mt-2.5"
                    style={{ fontFamily: 'Outfit_500Medium', fontSize: 15, color: colors.text.primary }}
                  >
                    {m.name}
                  </Text>
                  <Voice size={12.5} className="text-mute">
                    {m.sanskrit}
                  </Voice>
                  <View className="mt-2 flex-row items-center justify-between">
                    <View
                      className="rounded-md border px-1.5 py-1"
                      style={{ borderColor: `${def.color}73` }}
                    >
                      <Text
                        className="font-mono"
                        style={{ fontSize: 8, letterSpacing: 1, color: def.color }}
                      >
                        {def.name.split(' ')[0].toUpperCase()}
                      </Text>
                    </View>
                    <Text className="text-faint font-mono" style={{ fontSize: 8.5 }}>
                      {Math.round(m.holds[0] / 60)}–{Math.round(m.holds[2] / 60)}M
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

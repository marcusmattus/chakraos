import { useLocalSearchParams, useRouter } from 'expo-router';
import { Hand, PenLine, Play, X } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Text } from 'heroui-native';

import { Chip, Display, Mono, Panel, Voice } from '@/components/ui';
import { surfacedSignalsFor } from '@/lib/agents/coach';
import { CHAKRA_BY_KEY, isChakraKey } from '@/lib/chakras';
import { paletteForKey } from '@/lib/frequency';
import { FREQUENCY_BY_KEY } from '@/lib/frequency/registry';
import { MUDRA_BY_CHAKRA, mudraSessionsFor } from '@/lib/mudras';
import { palmPointsFor } from '@/lib/palm';
import { useChakraStore } from '@/lib/store';
import { colors } from '@/lib/tokens/colors';
import type { ChakraKey } from '@/lib/types';

export default function InspectorScreen() {
  const router = useRouter();
  const { chakra } = useLocalSearchParams<{ chakra: ChakraKey }>();
  const key: ChakraKey = isChakraKey(chakra) ? chakra : 'third';
  const def = CHAKRA_BY_KEY[key];
  const node = FREQUENCY_BY_KEY[key];
  const palette = paletteForKey(key);

  const states = useChakraStore((s) => s.states);
  const entries = useChakraStore((s) => s.entries);
  const sessions = useChakraStore((s) => s.sessions);
  const state = states.find((s) => s.key === key);
  const energy = state?.energy ?? 50;
  const trend = state?.trend7d ?? 0;

  const signals = useMemo(() => surfacedSignalsFor(key, entries, Date.now()), [key, entries]);
  const relatedJournal = entries
    .filter((e) => e.seededChakra === key || e.tags.some((t) => t.chakra === key))
    .slice(0, 3);
  const relatedSessions = sessions.filter((s) => s.chakra === key).slice(0, 3);

  const palmPoint = palmPointsFor('right').find((p) => p.key === key);
  const mudra = MUDRA_BY_CHAKRA[key];
  const mudraHolds = mudraSessionsFor(key, sessions);
  const weekAgo = Date.now() - 7 * 86_400_000;
  const journalSignals7d = entries.filter(
    (e) =>
      e.createdAt >= weekAgo && (e.seededChakra === key || e.tags.some((t) => t.chakra === key)),
  ).length;

  return (
    <View className="bg-field flex-1">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center pt-3">
          <View className="h-1 w-11 rounded-full" style={{ backgroundColor: colors.border.muted }} />
        </View>
        <View className="px-5 pt-3">
          <View className="flex-row items-start justify-between">
            <Mono style={{ color: palette.color }}>
              {def.name.split(' ')[0].toUpperCase()} · {(def.bija || node.bija || '').toUpperCase()}{' '}
              · {node.baseFrequencyHz} HZ · beat {node.beatFrequencyHz}
            </Mono>
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <X color={colors.text.tertiary} size={20} />
            </Pressable>
          </View>

          <Display size={32} className="mt-2" color={palette.color}>
            {def.name}
          </Display>
          <Text className="text-mute mt-1" style={{ fontFamily: 'Inter_400Regular', fontSize: 13 }}>
            {def.sign}
          </Text>
          <Text className="text-mute mt-2" style={{ fontSize: 12 }}>
            {node.solfeggioIntent} · {node.brainwaveBand}
          </Text>

          <View className="mt-6 flex-row gap-2">
            <View className="bg-panel-2 border-line-2 flex-1 rounded-2xl border p-3.5">
              <Mono style={{ fontSize: 9 }}>ENERGY</Mono>
              <View className="mt-1.5 flex-row items-baseline">
                <Text className="font-mono-bold" style={{ fontSize: 26, color: palette.color }}>
                  {energy}
                </Text>
                <Text className="text-faint font-mono" style={{ fontSize: 12 }}>
                  {' '}
                  / 100
                </Text>
              </View>
            </View>
            <View className="bg-panel-2 border-line-2 flex-1 rounded-2xl border p-3.5">
              <Mono style={{ fontSize: 9 }}>7D TREND</Mono>
              <Text
                className="font-mono-bold mt-1.5"
                style={{ fontSize: 26, color: palette.color }}
              >
                {trend < 0 ? '↓' : '↑'} {Math.abs(trend)}%
              </Text>
            </View>
          </View>

          <Mono className="mt-6">ATTRIBUTES</Mono>
          <View className="mt-2 flex-row flex-wrap gap-2">
            {def.attributes.map((a) => (
              <Chip key={a} label={a} color={palette.color} />
            ))}
          </View>

          <Mono className="mt-6">PALM POINT</Mono>
          <Panel className="mt-2 p-4">
            <Display size={18} color={palette.color}>
              {def.name.split(' ')[0].toUpperCase()} POINT
            </Display>
            <Text className="text-faint mt-1 font-mono" style={{ fontSize: 9, letterSpacing: 1 }}>
              {(palmPoint?.zone ?? 'palm centre').toUpperCase()}
            </Text>
            <Text className="text-mute mt-2" style={{ fontSize: 12, lineHeight: 18 }}>
              {palmPoint?.reading ?? 'projected onto the palm'} · {def.attributes.join(' · ')}
            </Text>

            <View className="border-line/70 mt-3 flex-row border-t pt-3">
              <View className="flex-1">
                <Mono size={8}>FIELD ENERGY</Mono>
                <View className="mt-1 flex-row items-baseline">
                  <Text className="font-mono-bold" style={{ fontSize: 18, color: palette.color }}>
                    {energy}
                  </Text>
                  <Text className="text-faint font-mono" style={{ fontSize: 10 }}>
                    /100
                  </Text>
                </View>
              </View>
              <View className="flex-1">
                <Mono size={8}>JOURNAL · 7D</Mono>
                <Text className="text-ink font-mono-bold mt-1" style={{ fontSize: 18 }}>
                  {journalSignals7d}
                </Text>
              </View>
              <View className="flex-1">
                <Mono size={8}>MUDRA ACTIVITY</Mono>
                <Text className="text-ink font-mono-bold mt-1" style={{ fontSize: 18 }}>
                  {mudraHolds.length}
                </Text>
              </View>
            </View>

            <Text className="text-faint mt-3" style={{ fontSize: 10, lineHeight: 15 }}>
              This point is a projection of the numbers above onto your hand. It reads nothing from
              your palm.
            </Text>
          </Panel>

          <Mono className="mt-6">DERIVED COLOUR · FROM {node.baseFrequencyHz} HZ</Mono>
          <View className="mt-2 flex-row gap-2">
            {palette.gradient.map((g) => (
              <View key={g} className="h-8 flex-1 rounded-lg" style={{ backgroundColor: g }} />
            ))}
          </View>

          <Mono className="mt-6">JOURNAL REFERENCES</Mono>
          <View className="mt-2 gap-2">
            {relatedJournal.length === 0 ? (
              <Panel className="p-3">
                <Text className="text-faint" style={{ fontSize: 12 }}>
                  No linked journal entries yet.
                </Text>
              </Panel>
            ) : (
              relatedJournal.map((e) => (
                <Panel key={e.id} className="p-3">
                  <Text className="text-ink" style={{ fontSize: 13 }} numberOfLines={2}>
                    {e.body}
                  </Text>
                </Panel>
              ))
            )}
          </View>

          <Mono className="mt-6">FREQUENCY SESSIONS</Mono>
          <View className="mt-2 gap-2">
            {relatedSessions.length === 0 ? (
              <Panel className="p-3">
                <Text className="text-faint" style={{ fontSize: 12 }}>
                  No sessions completed for this node yet.
                </Text>
              </Panel>
            ) : (
              relatedSessions.map((s) => (
                <Panel key={s.id} className="flex-row justify-between p-3">
                  <Text className="text-ink" style={{ fontSize: 13 }}>
                    {s.hz} Hz
                  </Text>
                  <Mono>{Math.round(s.durationS / 60)} MIN</Mono>
                </Panel>
              ))
            )}
          </View>

          <Mono className="mt-6">SURFACED IN JOURNAL · LAST 7D</Mono>
          {signals.length === 0 ? (
            <Panel className="mt-2 p-3">
              <Text className="text-faint" style={{ fontFamily: 'Inter_400Regular', fontSize: 12 }}>
                Nothing surfaced yet. Journaling teaches this node what to listen for.
              </Text>
            </Panel>
          ) : (
            signals.map((sig, i) => (
              <View
                key={sig.phrase}
                className="border-line mt-3 flex-row items-baseline justify-between pb-3"
                style={i < signals.length - 1 ? { borderBottomWidth: 1 } : undefined}
              >
                <Voice size={15} className="flex-1">
                  {`"${sig.phrase}"`}
                </Voice>
                <Text
                  className="font-mono ml-2"
                  style={{ fontSize: 11, color: palette.color }}
                >
                  ×{sig.count}
                </Text>
              </View>
            ))
          )}

          <View className="mt-7 gap-3">
            <Pressable
              className="flex-row items-center justify-center gap-2 rounded-xl py-3.5"
              style={{ backgroundColor: palette.color }}
              onPress={() => {
                router.replace({ pathname: '/session', params: { chakra: key } });
              }}
            >
              <Play color={colors.surface.deep} size={14} fill={colors.surface.deep} />
              <Text className="font-mono-bold" style={{ fontSize: 12, color: colors.surface.deep }}>
                BEGIN {node.baseFrequencyHz} HZ SESSION
              </Text>
            </Pressable>

            <View className="flex-row gap-3">
              <Pressable
                className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border py-3.5"
                style={{ borderColor: `${palette.color}77`, backgroundColor: `${palette.color}14` }}
                onPress={() => {
                  router.replace({ pathname: '/mudra/[key]', params: { key: mudra.key } });
                }}
              >
                <Hand color={palette.color} size={14} />
                <Text className="font-mono" style={{ fontSize: 12, color: palette.color }}>
                  TRY MUDRA · {mudra.name.toUpperCase()}
                </Text>
              </Pressable>
              <Pressable
                className="border-line flex-row items-center justify-center gap-2 rounded-xl border px-4 py-3.5"
                onPress={() => {
                  router.back();
                  router.navigate({ pathname: '/(tabs)/journal', params: { seed: key } });
                }}
              >
                <PenLine color={colors.text.primary} size={14} />
                <Text className="font-mono" style={{ fontSize: 12, color: colors.text.primary }}>
                  REFLECT
                </Text>
              </Pressable>
            </View>
          </View>

          <Voice size={13} className="text-faint mt-5 text-center">
            A visual map, not a measurement.
          </Voice>
        </View>
      </ScrollView>
    </View>
  );
}

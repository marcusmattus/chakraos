import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Text } from 'heroui-native';

import { Display, Mono, Voice } from '@/components/ui';
import { CHAKRA_BY_KEY } from '@/lib/chakras';
import { MUDRAS, MUDRA_BY_KEY, mudraSessionsFor } from '@/lib/mudras';
import { useChakraStore } from '@/lib/store';
import { colors } from '@/lib/tokens/colors';

/**
 * Mudra Detail — the shape, the node(s) it gathers toward, and the hold-length
 * picker. "BEGIN PRACTICE" hands off to the camera screen with the chosen
 * duration.
 */
export default function MudraDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ key: string }>();
  const mudra = (params.key ? MUDRA_BY_KEY[params.key] : undefined) ?? MUDRAS[0];
  const def = CHAKRA_BY_KEY[mudra.chakra];
  const [duration, setDuration] = useState<number>(mudra.holds[0]);
  const sessions = useChakraStore((s) => s.sessions);
  const holds = mudraSessionsFor(mudra.chakra, sessions).length;

  return (
    <View className="bg-field flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className="pt-safe px-5">
          <Mono style={{ color: def.color, marginTop: 12 }}>
            {def.name.toUpperCase()} · {def.solfeggioHz} HZ ·{' '}
            {holds === 0 ? 'NO HOLDS YET' : `${holds} HOLD${holds > 1 ? 'S' : ''}`}
          </Mono>
          <View className="mt-2 flex-row items-baseline gap-2">
            <Display size={28} color={colors.text.primary}>
              {mudra.name}
            </Display>
          </View>
          <Voice size={16} className="text-mute mt-1">
            {mudra.sanskrit}
          </Voice>

          <Text
            className="text-ink mt-4"
            style={{ fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21 }}
          >
            {mudra.intent}
          </Text>

          <Mono className="mt-6">GATHERS</Mono>
          <View className="mt-2.5 flex-row flex-wrap gap-2">
            {mudra.gathers.map((key) => {
              const gathered = CHAKRA_BY_KEY[key];
              return (
                <View
                  key={key}
                  className="rounded-lg border px-2.5 py-1.5"
                  style={{ borderColor: `${gathered.color}73` }}
                >
                  <Text
                    className="font-mono"
                    style={{ fontSize: 9, letterSpacing: 1.4, color: gathered.color }}
                  >
                    {gathered.name.toUpperCase()}
                  </Text>
                </View>
              );
            })}
          </View>

          <Mono className="mt-6">THE SHAPE · {mudra.steps.length} STEPS</Mono>
          <View className="mt-2.5 gap-2.5">
            {mudra.steps.map((step, i) => (
              <View key={step} className="flex-row gap-3">
                <Text
                  className="font-mono-bold"
                  style={{ fontSize: 11, color: def.color, width: 14 }}
                >
                  {i + 1}
                </Text>
                <Text className="text-ink flex-1" style={{ fontSize: 13.5, lineHeight: 20 }}>
                  {step}
                </Text>
              </View>
            ))}
          </View>

          <Mono className="mt-6">HOLD LENGTH</Mono>
          <View className="mt-2.5 flex-row gap-2">
            {mudra.holds.map((h) => {
              const on = duration === h;
              return (
                <Pressable
                  key={h}
                  onPress={() => setDuration(h)}
                  className="border-line flex-1 items-center rounded-xl border py-2.5"
                  style={{
                    borderColor: on ? `${def.color}99` : colors.border.muted,
                    backgroundColor: on ? `${def.color}1a` : 'transparent',
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                >
                  <Mono style={{ color: on ? def.color : colors.text.tertiary }}>{Math.round(h / 60)} MIN</Mono>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={() =>
              router.push({
                pathname: '/mudra/[key]/camera',
                params: { key: mudra.key, duration: String(duration) },
              })
            }
            className="mt-6 items-center rounded-2xl py-4"
            style={{ backgroundColor: `${def.color}2e`, borderWidth: 1, borderColor: `${def.color}8c` }}
            accessibilityRole="button"
          >
            <Text className="font-mono-bold" style={{ fontSize: 11, letterSpacing: 2, color: def.color }}>
              BEGIN {Math.round(duration / 60)}-MINUTE PRACTICE
            </Text>
          </Pressable>

          <Text className="text-faint mt-5" style={{ fontSize: 10, lineHeight: 15 }}>
            The camera is a mirror so you can see your own hand. chakraOS times the hold and folds
            it into the field like a frequency session — it does not analyse the image or grade
            your form.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

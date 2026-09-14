import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from 'heroui-native';

import { BodyField } from '@/components/BodyField';
import { Chip, Mono, Panel, SoftFade } from '@/components/ui';
import { todaysObservation } from '@/lib/agents/oracle';
import { SURFACE_ACCENT } from '@/lib/chakras';
import { useChakraStore } from '@/lib/store';
import type { ChakraKey } from '@/lib/types';

/** Field — the full-body nine-node visualisation. */
export function FieldPanel({ width }: { width: number }) {
  const router = useRouter();
  const states = useChakraStore((s) => s.states);
  const observation = useMemo(() => todaysObservation(states), [states]);

  const onSelectNode = (key: ChakraKey) => {
    router.push({ pathname: '/inspector/[chakra]', params: { chakra: key } });
  };

  const onChip = (chip: (typeof observation.chips)[number]) => {
    if (chip.surface === 'sound' && chip.chakra) {
      router.push({ pathname: '/session', params: { chakra: chip.chakra } });
    } else {
      router.push('/coach');
    }
  };

  return (
    <View>
      <View className="items-center">
        <BodyField states={states} width={width} onSelectNode={onSelectNode} />
      </View>

      <View className="mt-2 px-4">
        <SoftFade>
          <Panel className="p-4">
            <Mono className="text-mute">TODAY&apos;S OBSERVATION</Mono>
            <Text
              className="text-ink mt-2"
              style={{ fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20 }}
            >
              {observation.text}
            </Text>
            <View className="mt-3 flex-row flex-wrap gap-2">
              {observation.chips.map((chip) => (
                <Pressable key={chip.label} onPress={() => onChip(chip)}>
                  <Chip
                    label={chip.label}
                    color={chip.surface === 'sound' ? SURFACE_ACCENT.sound : SURFACE_ACCENT.coach}
                  />
                </Pressable>
              ))}
            </View>
          </Panel>
        </SoftFade>
      </View>

      <View className="mt-3 flex-row gap-2 px-4">
        <Pressable
          onPress={() => router.push('/mudra')}
          className="bg-panel-2 border-line flex-1 items-center rounded-2xl border py-3"
          accessibilityRole="button"
        >
          <Mono>MUDRA</Mono>
        </Pressable>
        <Pressable
          onPress={() => router.push('/palm-field')}
          className="bg-panel-2 border-line flex-1 items-center rounded-2xl border py-3"
          accessibilityRole="button"
        >
          <Mono>BODY PALM</Mono>
        </Pressable>
      </View>
    </View>
  );
}

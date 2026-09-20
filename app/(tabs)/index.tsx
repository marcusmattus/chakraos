import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { Text } from 'heroui-native';

import { FieldPanel } from '@/components/body/FieldPanel';
import { Mono } from '@/components/ui';
import { SURFACE_ACCENT } from '@/lib/chakras';
import { useChakraStore } from '@/lib/store';
import { colors } from '@/lib/tokens/colors';

/** Body — the nine-node field, the default home surface. */
export default function BodyScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const fieldIndex = useChakraStore((s) => s.fieldIndex);

  const contentWidth = Math.min(width - 32, 360);

  return (
    <ScrollView
      className="bg-field flex-1"
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="pt-safe px-4">
        <View className="mt-3 flex-row items-start justify-between">
          <View>
            <Mono>TODAY · {format(new Date(), 'EEE').toUpperCase()}</Mono>
            <Text
              className="mt-1"
              style={{ fontFamily: 'Outfit_600SemiBold', fontSize: 28, color: colors.text.primary }}
            >
              {format(new Date(), 'd MMM').toLowerCase()}
            </Text>
          </View>
          <View className="items-end gap-2">
            <Pressable
              onPress={() => router.push('/check-in')}
              className="rounded-full px-3 py-1.5"
              style={{ backgroundColor: SURFACE_ACCENT.body }}
              accessibilityRole="button"
            >
              <Mono style={{ color: colors.surface.deep }}>CHECK-IN</Mono>
            </Pressable>
            <View className="items-end">
              <Mono>FIELD INDEX</Mono>
              <View className="mt-1 flex-row items-baseline">
                <Text
                  className="font-mono-bold"
                  style={{ fontSize: 30, color: SURFACE_ACCENT.body }}
                >
                  {fieldIndex}
                </Text>
                <Text className="text-faint font-mono" style={{ fontSize: 12 }}>
                  /100
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View className="mt-4">
        <FieldPanel width={contentWidth} />
      </View>
    </ScrollView>
  );
}

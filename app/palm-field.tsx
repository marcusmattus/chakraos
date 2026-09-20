import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';

import { PalmPanel } from '@/components/body/PalmPanel';
import { Mono, Voice } from '@/components/ui';
import { colors } from '@/lib/tokens/colors';

/**
 * Palm Field — standalone full-screen destination reached from Body's quick-nav
 * row. The camera + scan/lock/analyze logic lives in PalmPanel; this screen
 * only supplies the full-bleed chrome around it.
 */
export default function PalmFieldScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const { width } = useWindowDimensions();

  return (
    <View className="bg-field flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="pt-safe flex-row items-start justify-between px-4">
          <View className="mt-3 flex-1">
            <Mono className="text-body">PALM FIELD</Mono>
            <Voice size={16} className="text-mute mt-2">
              A visual map, not a measurement.
            </Voice>
          </View>
          <Pressable
            onPress={() => router.back()}
            className="border-line mt-3 h-8 w-8 items-center justify-center rounded-full border"
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <X color={colors.text.tertiary} size={16} />
          </Pressable>
        </View>

        <View className="mt-4">
          <PalmPanel width={Math.min(width - 32, 420)} active={isFocused} />
        </View>
      </ScrollView>
    </View>
  );
}

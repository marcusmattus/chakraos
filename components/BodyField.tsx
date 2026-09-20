import { LinearGradient } from 'expo-linear-gradient';
import { Blur, Canvas, Circle, Group, RadialGradient, vec } from '@shopify/react-native-skia';
import { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  type DerivedValue,
} from 'react-native-reanimated';
import { Text } from 'heroui-native';

import { SkiaGate } from '@/components/SkiaGate';
import { CHAKRA_BY_KEY, CHAKRA_ORDER } from '@/lib/chakras';
import { colors } from '@/lib/tokens/colors';
import type { ChakraKey, ChakraState } from '@/lib/types';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useBreath } from '@/hooks/useBreath';

interface BodyFieldProps {
  states: ChakraState[];
  width: number;
  onSelectNode: (key: ChakraKey) => void;
}

const ROW_HEIGHT = 47;
const LABEL_WIDTH = 96;
const BLOOM_WIDTH = 44;

interface NodeView {
  key: ChakraKey;
  energy: number;
  trend7d: number;
  color: string;
  isLowest: boolean;
}

/** Trend colour: small day-to-day noise reads as neutral, real swings are colour-coded. */
function trendColor(trend: number): string {
  if (Math.abs(trend) < 5) return colors.text.dim;
  return trend > 0 ? colors.accent.leaf : colors.accent.blood;
}

function trendLabel(trend: number): string {
  const rounded = Math.round(trend);
  if (rounded === 0) return '—';
  return rounded > 0 ? `↑${rounded}` : `↓${Math.abs(rounded)}`;
}

function NodeBloom({ node, breath }: { node: NodeView; breath: DerivedValue<number> }) {
  const cx = BLOOM_WIDTH / 2;
  const cy = ROW_HEIGHT / 2;
  const bloomR = 15 + (node.energy / 100) * 20;
  const coreR = 4 + (node.energy / 100) * 1.2;
  const bloomOpacity = useDerivedValue(() => 0.5 + breath.value * 0.3);

  return (
    <SkiaGate fallback={<View style={{ width: BLOOM_WIDTH, height: ROW_HEIGHT }} />}>
      <Canvas style={{ width: BLOOM_WIDTH, height: ROW_HEIGHT }}>
        <Group layer opacity={0.55}>
          <Circle cx={cx} cy={cy} r={bloomR} opacity={bloomOpacity}>
            <RadialGradient c={vec(cx, cy)} r={bloomR} colors={[node.color, `${node.color}00`]} />
          </Circle>
          <Blur blur={6} />
        </Group>
        {node.isLowest && (
          <Circle
            cx={cx}
            cy={cy}
            r={13}
            // oxlint-disable-next-line react/style-prop-object -- Skia style prop is a string enum, not RN StyleProp
            style="stroke"
            strokeWidth={1}
            color={node.color}
            opacity={0.45}
          />
        )}
        <Circle cx={cx} cy={cy} r={coreR} color={node.color} />
        <Circle cx={cx} cy={cy} r={coreR * 0.4} color="#ffffff" opacity={0.8} />
      </Canvas>
    </SkiaGate>
  );
}

/** The nine-node central channel — name/bija left, bloom centre, score/trend right. */
export function BodyField({ states, width, onSelectNode }: BodyFieldProps) {
  const reduced = useReducedMotion();
  const breath = useBreath(reduced);
  const height = CHAKRA_ORDER.length * ROW_HEIGHT;

  const channelStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + breath.value * 0.35,
  }));

  const nodes = useMemo<NodeView[]>(() => {
    const withState = CHAKRA_ORDER.map((key) => {
      const state = states.find((s) => s.key === key);
      return { key, energy: state?.energy ?? 50, trend7d: state?.trend7d ?? 0 };
    });
    const lowestKey = withState.reduce((min, n) => (n.energy < min.energy ? n : min), withState[0])
      .key;
    return withState.map((n) => ({
      ...n,
      color: CHAKRA_BY_KEY[n.key].color,
      isLowest: n.key === lowestKey,
    }));
  }, [states]);

  return (
    <View style={{ width, height }}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: width / 2 - 0.5,
            top: 14,
            bottom: 14,
            width: 1,
          },
          channelStyle,
        ]}
      >
        <LinearGradient
          colors={['transparent', colors.border.muted, 'transparent']}
          locations={[0, 0.5, 1]}
          style={{ flex: 1 }}
        />
      </Animated.View>

      {nodes.map((node) => {
        const chakra = CHAKRA_BY_KEY[node.key];
        const subLabel = chakra.bija
          ? `${chakra.bija.toUpperCase()} · ${chakra.solfeggioHz}`
          : `${chakra.solfeggioHz}`;
        return (
          <Pressable
            key={node.key}
            onPress={() => onSelectNode(node.key)}
            style={{ height: ROW_HEIGHT, flexDirection: 'row', alignItems: 'center' }}
            accessibilityRole="button"
            accessibilityLabel={`${chakra.name}, ${node.energy} out of 100, ${
              node.trend7d >= 0 ? 'up' : 'down'
            } ${Math.abs(Math.round(node.trend7d))} percent`}
          >
            <View style={{ width: LABEL_WIDTH, alignItems: 'flex-end' }}>
              <Text style={{ fontFamily: 'Outfit_500Medium', fontSize: 13, color: colors.text.primary }}>
                {chakra.name}
              </Text>
              <Text
                className="text-faint font-mono"
                style={{ fontSize: 8, letterSpacing: 1.1, marginTop: 1 }}
              >
                {subLabel}
              </Text>
            </View>

            <NodeBloom node={node} breath={breath} />

            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'baseline',
                gap: 6,
                paddingLeft: 4,
              }}
            >
              <Text
                style={{ fontFamily: 'Outfit_600SemiBold', fontSize: 17, color: node.color }}
              >
                {node.energy}
              </Text>
              <Text
                className="font-mono"
                style={{ fontSize: 9, color: trendColor(node.trend7d) }}
              >
                {trendLabel(node.trend7d)}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

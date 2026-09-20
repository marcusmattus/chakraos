import {
  Blur,
  Canvas,
  Circle,
  DashPathEffect,
  Group,
  Path,
  RadialGradient,
  Skia,
  vec,
} from '@shopify/react-native-skia';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Camera, Check, PenLine, Square, X } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import {
  cancelAnimation,
  Easing,
  useDerivedValue,
  useSharedValue,
  withTiming,
  type DerivedValue,
} from 'react-native-reanimated';
import { Text } from 'heroui-native';

import { buildPalmOutlinePath } from '@/components/palm/palmPath';
import { SkiaGate } from '@/components/SkiaGate';
import { Mono, Panel } from '@/components/ui';
import { useBreath } from '@/hooks/useBreath';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { CHAKRA_BY_KEY } from '@/lib/chakras';
import { MUDRAS, MUDRA_BY_KEY, mudraSessionsFor } from '@/lib/mudras';
import { palmPointsFor } from '@/lib/palm';
import { useChakraStore } from '@/lib/store';
import { colors } from '@/lib/tokens/colors';
import type { ChakraKey } from '@/lib/types';

type Stage = 'holding' | 'done';

function tap(style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) {
  if (Platform.OS === 'web') return;
  void Haptics.impactAsync(style);
}

function clock(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function GatherPoint({
  cx,
  cy,
  color,
  breath,
  index,
}: {
  cx: number;
  cy: number;
  color: string;
  breath: DerivedValue<number>;
  index: number;
}) {
  const phase = index * 0.9;
  const r = useDerivedValue(() => 22 + 6 * Math.sin(breath.value * Math.PI * 2 + phase));
  return (
    <Group>
      <Circle cx={cx} cy={cy} r={r} opacity={0.4}>
        <RadialGradient c={vec(cx, cy)} r={34} colors={[color, `${color}00`]} />
      </Circle>
      <Circle cx={cx} cy={cy} r={5} color={color} opacity={0.95} />
    </Group>
  );
}

/** The reference hand shape plus the palm points the mudra gathers toward. */
function MudraGuide(props: { width: number; height: number; accent: string; gathers: ChakraKey[] }) {
  return (
    <SkiaGate fallback={null}>
      <MudraGuideCanvas {...props} />
    </SkiaGate>
  );
}

function MudraGuideCanvas({
  width,
  height,
  accent,
  gathers,
}: {
  width: number;
  height: number;
  accent: string;
  gathers: ChakraKey[];
}) {
  const reduced = useReducedMotion();
  const breath = useBreath(reduced);
  const outline = useMemo(() => buildPalmOutlinePath('right', width, height), [width, height]);
  const points = useMemo(
    () => palmPointsFor('right').filter((p) => gathers.includes(p.key)),
    [gathers],
  );

  return (
    <Canvas style={StyleSheet.absoluteFill}>
      {/* oxlint-disable-next-line react/style-prop-object -- Skia style prop is a string enum, not RN StyleProp */}
      <Path path={outline} style="stroke" strokeWidth={1.4} color={accent} opacity={0.38}>
        <DashPathEffect intervals={[10, 8]} />
      </Path>
      <Group layer>
        {points.map((p, i) => (
          <GatherPoint
            key={p.key}
            cx={p.x * width}
            cy={p.y * height}
            color={CHAKRA_BY_KEY[p.key].color}
            breath={breath}
            index={i}
          />
        ))}
        <Blur blur={5} />
      </Group>
    </Canvas>
  );
}

function HoldRing(props: { progress: DerivedValue<number>; color: string; size: number }) {
  return (
    <SkiaGate fallback={<View style={{ width: props.size, height: props.size }} />}>
      <HoldRingCanvas {...props} />
    </SkiaGate>
  );
}

function HoldRingCanvas({
  progress,
  color,
  size,
}: {
  progress: DerivedValue<number>;
  color: string;
  size: number;
}) {
  const ring = useMemo(() => {
    const p = Skia.Path.Make();
    p.addCircle(size / 2, size / 2, size / 2 - 4);
    return p;
  }, [size]);
  return (
    <Canvas style={{ width: size, height: size }}>
      <Path
        path={ring}
        // oxlint-disable-next-line react/style-prop-object -- Skia style prop is a string enum, not RN StyleProp
        style="stroke"
        strokeWidth={3}
        color={colors.border.muted}
        start={0}
        end={1}
        opacity={0.9}
      />
      <Path
        path={ring}
        // oxlint-disable-next-line react/style-prop-object -- Skia style prop is a string enum, not RN StyleProp
        style="stroke"
        strokeWidth={3}
        strokeCap="round"
        color={color}
        start={0}
        end={progress}
      />
    </Canvas>
  );
}

/**
 * Mudra hold session. The camera mirrors the user's hand beside the reference
 * shape; chakraOS times the hold and records it against the node so the
 * field — and therefore Palm Field — moves. No form checking, no frame
 * analysis: the camera is a mirror, not a grader.
 */
export default function MudraCameraScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ key: string; duration?: string }>();
  const mudra = (params.key ? MUDRA_BY_KEY[params.key] : undefined) ?? MUDRAS[0];
  const def = CHAKRA_BY_KEY[mudra.chakra];
  const duration = Number(params.duration) || mudra.holds[0];

  const completeMudra = useChakraStore((s) => s.completeMudra);
  const sessions = useChakraStore((s) => s.sessions);
  const states = useChakraStore((s) => s.states);
  const energy = states.find((s) => s.key === mudra.chakra)?.energy ?? 50;
  const holds = mudraSessionsFor(mudra.chakra, sessions).length;

  const [permission, requestPermission] = useCameraPermissions();
  const granted = permission?.granted ?? false;

  const [stage, setStage] = useState<Stage>('holding');
  const [remaining, setRemaining] = useState<number>(duration);
  const progress = useSharedValue(0);
  const finishedRef = useRef(false);

  const boxHeight = 320;
  const { width: screenWidth } = useWindowDimensions();
  const guideWidth = Math.max(220, screenWidth - 40);

  useEffect(() => {
    if (stage !== 'holding') return undefined;
    const id = setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [stage]);

  useEffect(() => {
    if (stage !== 'holding' || remaining > 0 || finishedRef.current) return;
    finishedRef.current = true;
    completeMudra({ mudraKey: mudra.key, chakra: mudra.chakra, durationS: duration });
    setStage('done');
    tap(Haptics.ImpactFeedbackStyle.Medium);
  }, [stage, remaining, completeMudra, mudra.key, mudra.chakra, duration]);

  useEffect(() => {
    progress.value = withTiming(1, { duration: duration * 1000, easing: Easing.linear });
    return () => cancelAnimation(progress);
  }, [duration, progress]);

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  const stop = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  return (
    <View className="bg-field flex-1">
      <View className="pt-safe-offset-4 px-5">
        <View className="flex-row items-start justify-between">
          <View>
            <Mono style={{ color: def.color }}>PRACTICING</Mono>
            <Text style={{ fontFamily: 'Outfit_500Medium', fontSize: 19, color: colors.text.primary, marginTop: 4 }}>
              {mudra.name} Mudra
            </Text>
          </View>
          <Pressable onPress={close} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
            <X color={colors.text.tertiary} size={20} />
          </Pressable>
        </View>

        <View
          className="border-line mt-4 overflow-hidden rounded-2xl border"
          style={{ height: boxHeight }}
        >
          {granted ? (
            <View style={StyleSheet.absoluteFill}>
              <CameraView style={StyleSheet.absoluteFill} facing="front" />
              <View style={[StyleSheet.absoluteFill, { backgroundColor: `${colors.surface.sunken}b8` }]} />
            </View>
          ) : (
            <LinearGradient colors={[colors.surface.deep, colors.surface.deep, colors.surface.sunken]} style={StyleSheet.absoluteFill} />
          )}
          <MudraGuide width={guideWidth} height={boxHeight} accent={def.color} gathers={mudra.gathers} />
          <View
            className="absolute right-3 bottom-3 left-3 rounded-lg px-3 py-2"
            style={{ backgroundColor: `${colors.surface.sunken}cc` }}
          >
            <Text className="text-ink text-center" style={{ fontSize: 12, lineHeight: 18 }}>
              {mudra.cue}
            </Text>
          </View>
        </View>

        {granted ? null : (
          <Pressable
            onPress={() => void requestPermission()}
            className="border-line mt-3 flex-row items-center justify-center gap-2 rounded-xl border py-3"
            accessibilityRole="button"
          >
            <Camera color={def.color} size={13} />
            <Mono style={{ color: def.color }}>ENABLE CAMERA</Mono>
          </Pressable>
        )}

        {stage === 'holding' ? (
          <View
            className="mt-5 flex-row items-center gap-4 rounded-2xl border px-4 py-4"
            style={{ backgroundColor: 'rgba(11,14,18,.92)', borderColor: colors.border.muted }}
          >
            <View className="items-center justify-center" style={{ width: 92, height: 92 }}>
              <HoldRing progress={progress} color={def.color} size={92} />
              <View className="absolute items-center">
                <Text className="font-mono-bold" style={{ fontSize: 18, color: def.color }}>
                  {clock(remaining)}
                </Text>
                <Mono size={8}>LEFT</Mono>
              </View>
            </View>
            <View className="flex-1">
              <Mono>HOLDING · {def.name.toUpperCase()}</Mono>
              <Text className="text-mute mt-1.5" style={{ fontSize: 12, lineHeight: 18 }}>
                Keep the shape loose. The hold matters more than the precision.
              </Text>
              <Pressable
                onPress={stop}
                className="border-line mt-3 flex-row items-center justify-center gap-2 self-start rounded-xl border px-4 py-2.5"
                accessibilityRole="button"
              >
                <Square color={colors.text.tertiary} size={11} fill={colors.text.tertiary} />
                <Mono>STOP</Mono>
              </Pressable>
            </View>
          </View>
        ) : null}

        {stage === 'done' ? (
          <View className="mt-5">
            <Panel className="p-4">
              <View className="flex-row items-center gap-2">
                <Check color={def.color} size={14} />
                <Mono style={{ color: def.color }}>HOLD COMPLETE</Mono>
              </View>
              <Text
                className="text-ink mt-2"
                style={{ fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21 }}
              >
                {Math.round(duration / 60)} minutes of {mudra.name} filed against {def.name}. The
                field has been recomputed — your {def.name.toLowerCase()} point now reads {energy},
                and Palm Field will draw it that way on your next scan.
              </Text>
              <Text className="text-faint mt-2 font-mono" style={{ fontSize: 8.5, letterSpacing: 1 }}>
                {holds} TOTAL HOLD{holds === 1 ? '' : 'S'} · {def.name.toUpperCase()}
              </Text>
            </Panel>
            <View className="mt-3 flex-row gap-3">
              <Pressable
                className="flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3.5"
                style={{ backgroundColor: def.color }}
                onPress={() => {
                  close();
                  router.navigate({ pathname: '/(tabs)/journal', params: { seed: mudra.chakra } });
                }}
                accessibilityRole="button"
              >
                <PenLine color={colors.surface.deep} size={14} />
                <Text className="font-mono-bold" style={{ fontSize: 12, color: colors.surface.deep }}>
                  REFLECT ON IT
                </Text>
              </Pressable>
              <Pressable
                className="border-line items-center justify-center rounded-xl border px-5 py-3.5"
                onPress={close}
                accessibilityRole="button"
              >
                <Mono>DONE</Mono>
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronDown, Pause, Play, SkipBack, SkipForward, X } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import { Text } from 'heroui-native';

import { SessionAtmosphereView } from '@/components/SessionAtmosphere';
import { SoundVisualizer } from '@/components/SoundVisualizer';
import { Chip, Display, Mono, Voice } from '@/components/ui';
import { useToneSession } from '@/hooks/useToneSession';
import { sessionForChakra } from '@/lib/agents/coach';
import { CHAKRA_BY_KEY, CHAKRA_ORDER, isChakraKey } from '@/lib/chakras';
import { atmosphereForKey } from '@/lib/frequency/atmosphere';
import { buildSoundLibrarySessions, FREQUENCY_BY_KEY } from '@/lib/frequency/registry';
import { useChakraStore } from '@/lib/store';
import { colors } from '@/lib/tokens/colors';
import type { ChakraKey } from '@/lib/types';

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

const BREATH_PHASE_S = 4;
const BREATH_CYCLES = 5;
const BREATH_TOTAL_S = BREATH_PHASE_S * 4 * BREATH_CYCLES;
const BREATH_PHASES = ['INHALE', 'HOLD', 'EXHALE', 'HOLD'] as const;

/**
 * Box-breathing timer (4-4-4-4). Deterministic phase cycling only — no audio,
 * no visualizer; the countdown itself is the practice.
 */
function BreathworkTimerScreen({ chakraKey }: { chakraKey: ChakraKey }) {
  const router = useRouter();
  const node = FREQUENCY_BY_KEY[chakraKey];
  const completeSession = useChakraStore((s) => s.completeSession);
  const [elapsed, setElapsed] = useState(0);
  const completedRef = useRef(false);
  const accent = colors.accent.leaf;

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        if (next >= BREATH_TOTAL_S && !completedRef.current) {
          completedRef.current = true;
          completeSession({
            sessionKey: `breath:${chakraKey}`,
            chakra: chakraKey,
            hz: node.baseFrequencyHz,
            durationS: BREATH_TOTAL_S,
            beatHz: node.beatFrequencyHz,
            brainwaveBand: node.brainwaveBand,
          });
        }
        return Math.min(next, BREATH_TOTAL_S);
      });
    }, 1000);
    return () => clearInterval(id);
  }, [completeSession, chakraKey, node.baseFrequencyHz, node.beatFrequencyHz, node.brainwaveBand]);

  const cycleLenS = BREATH_PHASE_S * 4;
  const cycleIndex = Math.min(Math.floor(elapsed / cycleLenS), BREATH_CYCLES - 1);
  const phaseIndex = Math.floor((elapsed % cycleLenS) / BREATH_PHASE_S);
  const phaseName = BREATH_PHASES[phaseIndex];
  const secondsLeftInPhase = BREATH_PHASE_S - (elapsed % BREATH_PHASE_S);
  const remaining = BREATH_TOTAL_S - elapsed;
  const done = elapsed >= BREATH_TOTAL_S;

  const end = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  return (
    <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.surface.deep }}>
      <View className="pt-safe-offset-4 absolute top-0 right-0 left-0 flex-row items-center justify-between px-5">
        <Mono style={{ letterSpacing: 3 }}>
          CYCLE {String(cycleIndex + 1).padStart(2, '0')} OF {String(BREATH_CYCLES).padStart(2, '0')}
        </Mono>
        <Pressable onPress={end} className="flex-row items-center gap-1.5" hitSlop={12}>
          <X color={colors.text.dim} size={13} />
          <Mono>END</Mono>
        </Pressable>
      </View>

      <View className="items-center justify-center" style={{ width: 300, height: 300 }}>
        <View
          className="absolute rounded-full"
          style={{ width: 260, height: 260, borderWidth: 1, borderColor: `${accent}66` }}
        />
        <View
          className="absolute rounded-full"
          style={{ width: 180, height: 180, borderWidth: 1, borderColor: `${accent}2e` }}
        />
        <View className="items-center">
          <Mono style={{ color: accent, letterSpacing: 5 }}>{done ? 'COMPLETE' : phaseName}</Mono>
          <Text
            className="mt-2"
            style={{ fontFamily: 'Outfit_300Light', fontSize: 76, lineHeight: 76, color: colors.text.primary }}
          >
            {done ? '—' : secondsLeftInPhase}
          </Text>
          <Mono size={9.5} style={{ marginTop: 4, letterSpacing: 3 }}>
            SECONDS
          </Mono>
        </View>
      </View>

      <Voice size={17} className="text-mute mt-6">
        Box Breathing · 4-4-4-4
      </Voice>

      <View className="mt-6 flex-row gap-2.5">
        {Array.from({ length: BREATH_CYCLES }).map((_, i) => (
          <View
            key={`cycle-dot-${i}`}
            className="rounded-full"
            style={{
              width: 7,
              height: 7,
              backgroundColor: i <= cycleIndex ? accent : colors.border.muted,
            }}
          />
        ))}
      </View>

      <Mono className="mt-7" style={{ letterSpacing: 3 }}>
        {done ? 'COMPLETE' : `${fmt(remaining)} REMAINING`}
      </Mono>
    </View>
  );
}

function SoundPlayerScreen({ chakraKey }: { chakraKey: ChakraKey }) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const def = CHAKRA_BY_KEY[chakraKey];
  const node = FREQUENCY_BY_KEY[chakraKey];
  const atmosphere = useMemo(() => atmosphereForKey(chakraKey), [chakraKey]);
  const accent = atmosphere.control;
  const label = atmosphere.label;
  const minimal = atmosphere.uiMode === 'minimal';

  const completeSession = useChakraStore((s) => s.completeSession);
  const session = sessionForChakra(chakraKey);
  const totalS = 90;

  const upNext = useMemo(() => {
    const library = buildSoundLibrarySessions();
    const idx = CHAKRA_ORDER.indexOf(chakraKey);
    return [1, 2].map((offset) => library[(idx + offset) % CHAKRA_ORDER.length]);
  }, [chakraKey]);

  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(true);
  const completedRef = useRef(false);

  useToneSession({
    carrierHz: node.baseFrequencyHz,
    beatHz: node.beatFrequencyHz,
    band: `${node.brainwaveBand} ${node.beatFrequencyHz} Hz`,
    playing,
  });

  useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        if (next >= totalS && !completedRef.current) {
          completedRef.current = true;
          completeSession({
            sessionKey: session.key,
            chakra: chakraKey,
            hz: node.baseFrequencyHz,
            durationS: session.durationS,
            beatHz: node.beatFrequencyHz,
            brainwaveBand: node.brainwaveBand,
          });
        }
        return Math.min(next, totalS);
      });
    }, 1000);
    return () => clearInterval(id);
  }, [
    playing,
    totalS,
    completeSession,
    session.key,
    session.durationS,
    chakraKey,
    node.baseFrequencyHz,
    node.beatFrequencyHz,
    node.brainwaveBand,
  ]);

  const done = elapsed >= totalS;
  const remaining = totalS - elapsed;
  const active = playing && !done;

  return (
    <View className="flex-1" style={{ backgroundColor: atmosphere.backgroundBottom }}>
      <SessionAtmosphereView atmosphere={atmosphere} active={active} />

      <View className="pt-safe-offset-3 z-10 px-5">
        <View className="flex-row items-center justify-between">
          <View>
            <Mono style={{ color: accent }}>
              {minimal ? `${node.baseFrequencyHz} HZ` : 'NOW PLAYING · SESSION'}
            </Mono>
            {!minimal ? (
              <Display size={22} className="mt-1" color={label}>
                {session.title}
              </Display>
            ) : (
              <Display size={28} className="mt-2" color={label}>
                {def.name}
              </Display>
            )}
          </View>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <ChevronDown color={label} size={22} />
          </Pressable>
        </View>
      </View>

      <View className="z-10 flex-1 items-center justify-center px-6">
        {!minimal ? (
          <SoundVisualizer
            size={Math.min(width - 60, 300)}
            color={atmosphere.accent}
            playing={active}
          />
        ) : (
          <View style={{ height: Math.min(width - 80, 220) }} />
        )}
        <Display size={minimal ? 34 : 26} className="mt-6" color={label}>
          {node.baseFrequencyHz} Hz
        </Display>
        {!minimal ? (
          <>
            <Text className="mt-1 font-mono" style={{ fontSize: 12, color: label, opacity: 0.7 }}>
              {def.name.toLowerCase()} · {node.brainwaveBand} · beat {node.beatFrequencyHz} Hz
            </Text>
            <View className="mt-3 flex-row flex-wrap justify-center gap-2">
              {session.tags.map((tag) => (
                <Chip key={tag} label={tag} color={accent} />
              ))}
            </View>
          </>
        ) : (
          <Text className="mt-2 font-mono" style={{ fontSize: 12, color: label, opacity: 0.55 }}>
            nearly still
          </Text>
        )}
      </View>

      <View className="pb-safe-offset-6 z-10 px-8">
        <View
          className="mb-4 h-1 overflow-hidden rounded-full"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
        >
          <View
            style={{
              width: `${(elapsed / totalS) * 100}%`,
              height: '100%',
              backgroundColor: accent,
            }}
          />
        </View>
        <View className="mb-4 flex-row justify-between">
          <Mono style={{ color: label }}>{fmt(elapsed)}</Mono>
          <Mono style={{ color: label }}>{done ? 'COMPLETE' : fmt(remaining)}</Mono>
        </View>
        <View className="flex-row items-center justify-center gap-8">
          {!minimal ? (
            <Pressable hitSlop={12} onPress={() => setElapsed(0)}>
              <SkipBack color={label} size={22} />
            </Pressable>
          ) : (
            <View style={{ width: 22 }} />
          )}
          <Pressable
            onPress={() => setPlaying((p) => !p)}
            className="h-16 w-16 items-center justify-center rounded-full"
            style={{
              backgroundColor: accent,
              opacity: minimal ? 0.85 : 1,
            }}
          >
            {active ? (
              <Pause
                color={atmosphere.backgroundBottom}
                size={26}
                fill={atmosphere.backgroundBottom}
              />
            ) : (
              <Play
                color={atmosphere.backgroundBottom}
                size={26}
                fill={atmosphere.backgroundBottom}
              />
            )}
          </Pressable>
          {!minimal ? (
            <Pressable
              hitSlop={12}
              onPress={() => {
                setElapsed(totalS);
                if (!completedRef.current) {
                  completedRef.current = true;
                  completeSession({
                    sessionKey: session.key,
                    chakra: chakraKey,
                    hz: node.baseFrequencyHz,
                    durationS: session.durationS,
                    beatHz: node.beatFrequencyHz,
                    brainwaveBand: node.brainwaveBand,
                  });
                }
              }}
            >
              <SkipForward color={label} size={22} />
            </Pressable>
          ) : (
            <View style={{ width: 22 }} />
          )}
        </View>

        {upNext.length > 0 ? (
          <View className="mt-6 border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <Mono style={{ color: label, opacity: 0.55 }}>UP NEXT</Mono>
            {upNext.map((s) => (
              <Pressable
                key={s.key}
                onPress={() => router.replace({ pathname: '/session', params: { chakra: s.chakra } })}
                className="mt-2.5 flex-row items-baseline justify-between"
              >
                <Text style={{ fontFamily: 'Outfit_500Medium', fontSize: 13.5, color: label }}>
                  {CHAKRA_BY_KEY[s.chakra].name}
                </Text>
                <Mono style={{ color: label, opacity: 0.55 }}>
                  {s.hz} HZ · {Math.round(s.durationS / 60)} MIN
                </Mono>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

export default function SessionScreen() {
  const { chakra, mode } = useLocalSearchParams<{ chakra: ChakraKey; mode?: string }>();
  const key: ChakraKey = isChakraKey(chakra) ? chakra : 'third';

  if (mode === 'breath') return <BreathworkTimerScreen chakraKey={key} />;
  return <SoundPlayerScreen chakraKey={key} />;
}

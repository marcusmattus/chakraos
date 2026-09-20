import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Mic, Send, Square } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Text } from 'heroui-native';

import { AuraSigil } from '@/components/AuraSigil';
import { Mono, SoftFade, Voice } from '@/components/ui';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { CHAKRA_BY_KEY, CHAKRA_ORDER, SURFACE_ACCENT } from '@/lib/chakras';
import { useChakraStore } from '@/lib/store';
import { colors } from '@/lib/tokens/colors';
import type { ChakraState } from '@/lib/types';

const STEPS = ['welcome', 'first-node', 'privacy', 'intention', 'first-entry'] as const;

/** A uniform, decorative field for pre-onboarding chrome — not a real reading. */
const NEUTRAL_STATES: ChakraState[] = CHAKRA_ORDER.map((key) => ({
  key,
  energy: 65,
  trend7d: 0,
}));

/** Onboarding headline — Outfit at regular weight, distinct from the app's usual Display (600). */
function Headline({
  children,
  size,
  className,
}: {
  children: React.ReactNode;
  size: number;
  className?: string;
}) {
  return (
    <Text
      className={className}
      style={{ fontFamily: 'Outfit_500Medium', fontSize: size, lineHeight: size * 1.25, color: colors.text.primary }}
    >
      {children}
    </Text>
  );
}

function ContinuePill({
  label,
  onPress,
  color = colors.text.primary,
  textColor = colors.surface.deep,
}: {
  label: string;
  onPress: () => void;
  color?: string;
  textColor?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="items-center rounded-2xl py-4"
      style={{ backgroundColor: color }}
      accessibilityRole="button"
    >
      <Text className="font-mono-bold" style={{ fontSize: 11, letterSpacing: 3, color: textColor }}>
        {label}
      </Text>
    </Pressable>
  );
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <View className="bg-field flex-1 justify-between px-6" style={{ paddingTop: 140 }}>
      <View className="items-center">
        <View
          className="absolute rounded-full"
          style={{ width: 220, height: 220, backgroundColor: colors.surface.deep }}
        />
        <SoftFade>
          <AuraSigil states={NEUTRAL_STATES} size={200} />
        </SoftFade>
      </View>
      <View className="pb-safe-offset-6">
        <Mono style={{ letterSpacing: 4 }}>CHAKRAOS</Mono>
        <Headline size={30} className="mt-3">
          An instrument for the inner field.
        </Headline>
        <View className="mt-8">
          <ContinuePill label="CONTINUE" onPress={onNext} />
        </View>
      </View>
    </View>
  );
}

function FirstNodeStep({ onNext }: { onNext: () => void }) {
  return (
    <View className="bg-field flex-1 justify-between px-6" style={{ paddingTop: 96 }}>
      <View className="items-center">
        <View style={{ width: 24, height: 340 }}>
          <LinearGradient
            colors={['transparent', colors.border.muted, 'transparent']}
            locations={[0, 0.5, 1]}
            style={{ position: 'absolute', left: 11, top: 20, bottom: 20, width: 1 }}
          />
          {CHAKRA_ORDER.map((key, i) => {
            const size = 19 - i * 1.2;
            const opacity = Math.max(0.08, 1 - i * 0.12);
            return (
              <View
                key={key}
                className="absolute rounded-full"
                style={{
                  left: 12 - size / 2,
                  top: 24 + i * 36,
                  width: size,
                  height: size,
                  backgroundColor: CHAKRA_BY_KEY[key].color,
                  opacity,
                }}
              />
            );
          })}
        </View>
      </View>
      <View className="pb-safe-offset-6">
        <Headline size={26}>
          Your field is measured by what you write.
        </Headline>
        <Voice size={17} className="text-mute mt-3.5">
          One sentence is enough.
        </Voice>
        <View className="mt-8">
          <ContinuePill label="CONTINUE" onPress={onNext} />
        </View>
      </View>
    </View>
  );
}

const PRIVACY_POINTS = [
  'Encrypted at rest',
  'Deletable at any time',
  'Never used to train AI',
  'Camera frames stay on device',
];

function PrivacyStep({ onNext }: { onNext: () => void }) {
  return (
    <View className="bg-field flex-1 justify-between px-6" style={{ paddingTop: 130 }}>
      <View>
        <Mono style={{ letterSpacing: 4 }}>PRIVACY</Mono>
        <Headline size={28} className="mt-4">
          Your journal belongs to you.
        </Headline>
        <View className="mt-8">
          {PRIVACY_POINTS.map((point, i) => (
            <View
              key={point}
              className="border-line flex-row items-baseline gap-3.5 border-b py-3.5"
            >
              <Mono className="text-body" size={9}>
                {String(i + 1).padStart(2, '0')}
              </Mono>
              <Text style={{ fontFamily: 'Outfit_500Medium', fontSize: 15, color: colors.text.primary }}>
                {point}
              </Text>
            </View>
          ))}
        </View>
        <Voice size={14} className="text-faint mt-6">
          chakraOS does not diagnose, treat, or measure anything medical. It reflects what you
          write back to you.
        </Voice>
      </View>
      <View className="pb-safe-offset-6">
        <ContinuePill label="I UNDERSTAND · CONTINUE" onPress={onNext} />
      </View>
    </View>
  );
}

function IntentionStep({ onNext }: { onNext: (text: string) => void }) {
  const [text, setText] = useState('');
  return (
    <View className="bg-field flex-1 justify-between px-6" style={{ paddingTop: 130 }}>
      <View>
        <Mono className="text-you" style={{ letterSpacing: 4 }}>
          30-DAY INTENTION
        </Mono>
        <Headline size={28} className="mt-4">
          Set one intention for the next 30 days.
        </Headline>
        <View className="bg-panel border-line mt-7 rounded-2xl border p-4.5" style={{ minHeight: 132 }}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="What would you like to carry forward?"
            placeholderTextColor={colors.text.dim}
            multiline
            className="text-ink"
            style={{ fontFamily: 'Lora_400Regular_Italic', fontSize: 16, lineHeight: 24 }}
          />
        </View>
        <Mono className="mt-3" size={9}>
          EDITABLE ONCE PER CYCLE
        </Mono>
      </View>
      <View className="pb-safe-offset-6">
        <ContinuePill
          label="BEGIN"
          color={SURFACE_ACCENT.you}
          onPress={() => onNext(text.trim())}
        />
      </View>
    </View>
  );
}

function FirstEntryStep({
  onSubmit,
  onSkip,
}: {
  onSubmit: (body: string, modality: 'text' | 'voice', voice?: { uri: string; durationS: number }) => void;
  onSkip: () => void;
}) {
  const ACCENT = SURFACE_ACCENT.journal;
  const [text, setText] = useState('');
  const [voiceMode, setVoiceMode] = useState(false);
  const recorder = useVoiceRecorder();
  const [voiceNote, setVoiceNote] = useState<{ uri: string; durationS: number } | null>(null);

  const toggleRecord = async () => {
    if (recorder.isRecording) {
      const res = await recorder.stop();
      if (res.uri) setVoiceNote({ uri: res.uri, durationS: res.durationS });
    } else {
      setVoiceNote(null);
      await recorder.start();
    }
  };

  const canSubmit = Boolean(text.trim()) || Boolean(voiceMode && voiceNote?.uri);

  const submit = () => {
    const body = text.trim();
    const hasVoice = voiceMode && Boolean(voiceNote?.uri);
    if (!body && !hasVoice) return;
    onSubmit(
      body,
      voiceMode || hasVoice ? 'voice' : 'text',
      hasVoice && voiceNote ? voiceNote : undefined,
    );
  };

  return (
    <View className="bg-field flex-1 justify-between px-6" style={{ paddingTop: 110 }}>
      <View>
        <Mono className="text-journal" style={{ letterSpacing: 4 }}>
          FIRST ENTRY
        </Mono>
        <Headline size={28} className="mt-4">
          Start now. What are you noticing?
        </Headline>

        <View
          className="bg-panel mt-6 rounded-2xl border p-4.5"
          style={{ borderColor: `${ACCENT}73` }}
        >
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="I keep waking at four and I don't know why"
            placeholderTextColor={colors.text.dim}
            multiline
            autoFocus
            className="text-ink"
            style={{ fontFamily: 'Lora_400Regular_Italic', fontSize: 16, lineHeight: 24 }}
          />
          <View className="mt-5 flex-row items-center justify-between">
            <View className="flex-row gap-2">
              <Pressable onPress={() => setVoiceMode(false)}>
                <View
                  className="rounded-md border px-2.5 py-1.5"
                  style={{
                    borderColor: voiceMode ? colors.border.muted : ACCENT,
                    backgroundColor: voiceMode ? 'transparent' : `${ACCENT}22`,
                  }}
                >
                  <Mono style={{ color: voiceMode ? colors.text.tertiary : ACCENT }}>TEXT</Mono>
                </View>
              </Pressable>
              <Pressable onPress={() => setVoiceMode(true)}>
                <View
                  className="flex-row items-center gap-1.5 rounded-md border px-2.5 py-1.5"
                  style={{
                    borderColor: voiceMode ? ACCENT : colors.border.muted,
                    backgroundColor: voiceMode ? `${ACCENT}22` : 'transparent',
                  }}
                >
                  <Mic color={voiceMode ? ACCENT : colors.text.tertiary} size={11} />
                  <Mono style={{ color: voiceMode ? ACCENT : colors.text.tertiary }}>VOICE</Mono>
                </View>
              </Pressable>
            </View>
            <Pressable
              onPress={submit}
              disabled={!canSubmit}
              className="h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: canSubmit ? ACCENT : colors.border.muted }}
            >
              <Send color={canSubmit ? colors.surface.deep : colors.text.dim} size={15} />
            </Pressable>
          </View>
          {voiceMode ? (
            <Pressable
              onPress={toggleRecord}
              className="border-line mt-4 flex-row items-center gap-2 border-t pt-3.5"
            >
              {recorder.isRecording ? (
                <Square color={colors.accent.blood} size={13} fill={colors.accent.blood} />
              ) : (
                <Mic color={ACCENT} size={14} />
              )}
              <Mono style={{ color: recorder.isRecording ? colors.accent.blood : ACCENT }}>
                {recorder.isRecording
                  ? 'RECORDING…'
                  : voiceNote
                    ? `VOICE NOTE SAVED · ${voiceNote.durationS}s`
                    : 'TAP TO RECORD'}
              </Mono>
            </Pressable>
          ) : null}
        </View>

        <View className="mt-4 flex-row items-start gap-2.5">
          <View
            className="mt-1.5 h-2 w-2 rounded-full"
            style={{ backgroundColor: ACCENT }}
          />
          <Text className="text-mute flex-1" style={{ fontSize: 13.5, lineHeight: 20 }}>
            Sending this initialises your field. Nine nodes, scored from your own words.
          </Text>
        </View>
      </View>

      <View className="pb-safe-offset-6 items-center">
        <Pressable onPress={onSkip} hitSlop={12}>
          <Mono style={{ color: colors.text.ghost, letterSpacing: 3 }}>SKIP FOR NOW</Mono>
        </Pressable>
      </View>
    </View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const completeOnboarding = useChakraStore((s) => s.completeOnboarding);
  const setIntention = useChakraStore((s) => s.setIntention);
  const addEntry = useChakraStore((s) => s.addEntry);

  const finish = () => {
    completeOnboarding();
    router.replace('/auth');
  };

  const advance = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));

  return (
    <View className="flex-1">
      {/* eslint-disable-next-line react/style-prop-object -- expo-status-bar `style` is a string enum, not a CSS object */}
      <StatusBar style="light" />
      {step === 0 ? <WelcomeStep onNext={advance} /> : null}
      {step === 1 ? <FirstNodeStep onNext={advance} /> : null}
      {step === 2 ? <PrivacyStep onNext={advance} /> : null}
      {step === 3 ? (
        <IntentionStep
          onNext={(text) => {
            if (text) setIntention(text);
            advance();
          }}
        />
      ) : null}
      {step === 4 ? (
        <FirstEntryStep
          onSubmit={(body, modality, voice) => {
            void addEntry(body || '[Voice note — transcribing…]', modality, {
              voiceUrl: voice?.uri,
              voiceDurationS: voice?.durationS,
            });
            finish();
          }}
          onSkip={finish}
        />
      ) : null}
    </View>
  );
}

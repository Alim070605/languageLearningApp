import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useStyles } from './theme';

export function Screen({ children, style, edges = ['top', 'bottom'] }) {
  const c = useTheme();
  return (
    <SafeAreaView edges={edges} style={[{ flex: 1, backgroundColor: c.bg }, style]}>
      {children}
    </SafeAreaView>
  );
}

// Нижняя панель с учётом safe area
export function BottomBar({ children, style }) {
  const insets = useSafeAreaInsets();
  return <View style={[{ padding: 20, paddingBottom: Math.max(insets.bottom, 12) + 8 }, style]}>{children}</View>;
}

// Нажатие с лёгкой пружинной анимацией
export function Tap({ onPress, disabled, style, children, scale = 0.97, hitSlop }) {
  const v = useRef(new Animated.Value(1)).current;
  const f = StyleSheet.flatten(style) || {};
  const to = (x) => Animated.spring(v, { toValue: x, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => to(scale)}
      onPressOut={() => to(1)}
      hitSlop={hitSlop}
      style={{ flex: f.flex, alignSelf: f.alignSelf }}
    >
      <Animated.View style={[style, { transform: [{ scale: v }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

export function Button({ title, onPress, variant = 'primary', disabled, small, icon, style }) {
  const c = useTheme();
  const map = {
    primary: [c.primary, c.onPrimary, null],
    outline: [c.card, c.text, c.border],
    green: [c.green, '#FFFFFF', null],
    red: [c.red, '#FFFFFF', null],
    danger: [c.card, c.red, c.red],
  };
  const [bg, fg, bd] = map[variant];
  return (
    <Tap
      onPress={onPress}
      disabled={disabled}
      style={[
        {
          height: small ? 38 : 52,
          borderRadius: small ? 19 : 26,
          backgroundColor: bg,
          borderWidth: bd ? 1 : 0,
          borderColor: bd,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          paddingHorizontal: small ? 16 : 20,
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={small ? 16 : 18} color={fg} style={{ marginRight: 6 }} /> : null}
      <Text style={{ color: fg, fontSize: small ? 13 : 16, fontWeight: '700' }}>{title}</Text>
    </Tap>
  );
}

export function Badge({ text, tone = 'yellow', style }) {
  const c = useTheme();
  const t = {
    yellow: [c.yellow, c.onYellow],
    green: [c.greenSoft, c.green],
    primary: [c.primarySoft, c.primary],
  }[tone];
  return (
    <View style={[{ backgroundColor: t[0], paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }, style]}>
      <Text style={{ color: t[1], fontSize: 12, fontWeight: '700' }}>{text}</Text>
    </View>
  );
}

export function ProgressBar({ value, height = 8, color, track, style }) {
  const c = useTheme();
  const a = useRef(new Animated.Value(0)).current;
  const v = Math.max(0, Math.min(1, value || 0));
  useEffect(() => {
    Animated.timing(a, { toValue: v, duration: 550, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [v]);
  const w = a.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return (
    <View style={[{ height, borderRadius: height / 2, backgroundColor: track || c.track, overflow: 'hidden' }, style]}>
      <Animated.View style={{ height: '100%', width: w, backgroundColor: color || c.primary, borderRadius: height / 2 }} />
    </View>
  );
}

export function FadeIn({ delay = 0, y = 14, x = 0, duration = 380, children, style }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: v,
          transform: [
            { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [y, 0] }) },
            { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [x, 0] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function BackButton({ onPress }) {
  const c = useTheme();
  return (
    <Tap onPress={onPress} hitSlop={12} style={{ width: 32, height: 32, justifyContent: 'center' }}>
      <Ionicons name="chevron-back" size={24} color={c.muted} />
    </Tap>
  );
}

const fieldStyles = (c) => ({
  label: { fontSize: 12, fontWeight: '600', color: c.muted, marginBottom: 6 },
  input: {
    height: 48,
    borderRadius: 12,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.border,
    paddingHorizontal: 14,
    fontSize: 15,
    color: c.text,
  },
  err: { color: c.red, fontSize: 12, marginTop: 4 },
});

export function Field({ label, error, style, ...props }) {
  const c = useTheme();
  const st = useStyles(fieldStyles);
  return (
    <View style={[{ marginBottom: 14 }, style]}>
      <Text style={st.label}>{label}</Text>
      <TextInput
        placeholderTextColor={c.muted}
        autoCapitalize="none"
        style={[st.input, error && { borderColor: c.red }]}
        {...props}
      />
      {error ? <Text style={st.err}>{error}</Text> : null}
    </View>
  );
}

const optStyles = (c) => ({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.card,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: c.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  sel: { borderColor: c.primary, backgroundColor: c.primarySoft },
  t: { fontSize: 15, fontWeight: '700', color: c.text },
  s: { fontSize: 12, color: c.muted, marginTop: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: c.primary },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: c.primary },
});

export function OptionCard({ title, sub, selected, onPress }) {
  const st = useStyles(optStyles);
  return (
    <Tap onPress={onPress} style={[st.card, selected && st.sel]}>
      <View style={{ flex: 1 }}>
        <Text style={st.t}>{title}</Text>
        {sub ? <Text style={st.s}>{sub}</Text> : null}
      </View>
      <View style={[st.radio, selected && st.radioOn]}>{selected ? <View style={st.dot} /> : null}</View>
    </Tap>
  );
}

const sheetStyles = (c) => ({
  wrap: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,10,30,0.45)' },
  sheet: {
    backgroundColor: c.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 34,
    maxHeight: '85%',
  },
  grab: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: c.border, marginBottom: 14 },
  title: { fontSize: 20, fontWeight: '800', color: c.text, marginBottom: 14 },
});

export function Sheet({ visible, onClose, title, children }) {
  const st = useStyles(sheetStyles);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={st.wrap} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={st.backdrop} onPress={onClose} />
        <View style={st.sheet}>
          <View style={st.grab} />
          {title ? <Text style={st.title}>{title}</Text> : null}
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

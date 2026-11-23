import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Easing, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useStyles } from '../theme';
import { useApp } from '../store';
import { BackButton, Button, FadeIn, Field, Screen, Tap } from '../ui';

const mk = (c) => ({
  wrap: { flex: 1, padding: 20 },
  logo: { fontSize: 20, fontWeight: '800', color: c.primary },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    backgroundColor: c.card,
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 34,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  hello: { fontSize: 38, fontWeight: '800', color: c.text, textAlign: 'center' },
  priv: { fontSize: 13, color: c.muted, textAlign: 'center', marginTop: 2 },
  h1: { fontSize: 28, fontWeight: '800', color: c.text, lineHeight: 34 },
  sub: { fontSize: 14, color: c.muted, marginTop: 10, lineHeight: 20 },
  scroll: { flexGrow: 1, padding: 20 },
  title: { fontSize: 26, fontWeight: '800', color: c.text, marginTop: 12 },
  lead: { fontSize: 14, color: c.muted, marginTop: 6, marginBottom: 22 },
  link: { fontSize: 13, fontWeight: '700', color: c.primary },
  foot: { alignItems: 'center', marginTop: 14 },
  footText: { fontSize: 13, color: c.muted },
  formErr: { color: c.red, fontSize: 13, textAlign: 'center', marginBottom: 10 },
});

export function Welcome({ navigation }) {
  const st = useStyles(mk);
  const float = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const t = (to) => Animated.timing(float, { toValue: to, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true });
    const loop = Animated.loop(Animated.sequence([t(1), t(0)]));
    loop.start();
    return () => loop.stop();
  }, []);
  const ty = float.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const rot = float.interpolate({ inputRange: [0, 1], outputRange: ['-6deg', '-3deg'] });
  return (
    <Screen>
      <View style={st.wrap}>
        <FadeIn y={-8}>
          <Text style={st.logo}>Слово</Text>
        </FadeIn>
        <View style={st.hero}>
          <FadeIn y={30} duration={600}>
            <Animated.View style={[st.card, { transform: [{ translateY: ty }, { rotate: rot }] }]}>
              <Text style={st.hello}>hello</Text>
              <Text style={st.priv}>привет</Text>
            </Animated.View>
          </FadeIn>
        </View>
        <FadeIn delay={150}>
          <Text style={st.h1}>{'Английский по\n10 минут в день'}</Text>
          <Text style={st.sub}>Короткие уроки, карточки и повторение слов в удобное время.</Text>
        </FadeIn>
        <FadeIn delay={300} style={{ marginTop: 24, gap: 10 }}>
          <Button title="Начать" onPress={() => navigation.navigate('Goal')} />
          <Button title="У меня уже есть аккаунт" variant="outline" onPress={() => navigation.navigate('Login')} />
        </FadeIn>
      </View>
    </Screen>
  );
}

export function Login({ navigation }) {
  const st = useStyles(mk);
  const { s, a } = useApp();
  const [email, setEmail] = useState(s.account?.email || '');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState({});

  const submit = () => {
    if (!/\S+@\S+\.\S+/.test(email)) return setErr({ email: 'Введите корректный email' });
    if (!pass) return setErr({ pass: 'Введите пароль' });
    const e = a.login(email, pass);
    if (e) setErr({ form: e });
  };

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={st.scroll} keyboardShouldPersistTaps="handled">
          <BackButton onPress={navigation.goBack} />
          <FadeIn>
            <Text style={st.title}>С возвращением</Text>
            <Text style={st.lead}>Войдите, чтобы продолжить учёбу.</Text>
          </FadeIn>
          <FadeIn delay={100}>
            <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="you@mail.com" error={err.email} />
            <Field label="Пароль" value={pass} onChangeText={setPass} secureTextEntry placeholder="••••••••" error={err.pass} style={{ marginBottom: 10 }} />
            <Tap
              onPress={() => Alert.alert('Восстановление пароля', 'Подключите бэкенд (например Supabase Auth), и здесь появится отправка письма для сброса.')}
              style={{ alignSelf: 'flex-start' }}
            >
              <Text style={st.link}>Забыли пароль?</Text>
            </Tap>
          </FadeIn>
          <View style={{ flex: 1 }} />
          {err.form ? <Text style={st.formErr}>{err.form}</Text> : null}
          <Button title="Войти" onPress={submit} />
          <View style={st.foot}>
            <Tap onPress={() => navigation.navigate('Goal')} style={{ flexDirection: 'row', padding: 6 }}>
              <Text style={st.footText}>Нет аккаунта? </Text>
              <Text style={st.link}>Создать</Text>
            </Tap>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

export function Signup({ navigation }) {
  const st = useStyles(mk);
  const { a } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState({});

  const submit = () => {
    const e = {};
    if (!name.trim()) e.name = 'Как вас зовут?';
    if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Введите корректный email';
    if (pass.length < 8) e.pass = 'Минимум 8 символов';
    setErr(e);
    if (Object.keys(e).length) return;
    a.signup({ name, email, password: pass });
  };

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={st.scroll} keyboardShouldPersistTaps="handled">
          <BackButton onPress={navigation.goBack} />
          <FadeIn>
            <Text style={st.title}>Создайте профиль</Text>
            <Text style={st.lead}>Сохраним ваш прогресс на всех устройствах.</Text>
          </FadeIn>
          <FadeIn delay={100}>
            <Field label="Имя" value={name} onChangeText={setName} autoCapitalize="words" placeholder="Анна" error={err.name} />
            <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="anna@mail.com" error={err.email} />
            <Field label="Пароль" value={pass} onChangeText={setPass} secureTextEntry placeholder="Минимум 8 символов" error={err.pass} />
          </FadeIn>
          <View style={{ flex: 1 }} />
          <Button title="Создать аккаунт" onPress={submit} />
          <View style={st.foot}>
            <Tap onPress={() => navigation.navigate('Login')} style={{ flexDirection: 'row', padding: 6 }}>
              <Text style={st.footText}>Уже есть аккаунт? </Text>
              <Text style={st.link}>Войти</Text>
            </Tap>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

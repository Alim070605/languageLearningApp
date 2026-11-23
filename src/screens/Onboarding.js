import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useStyles } from '../theme';
import { useApp } from '../store';
import { BackButton, BottomBar, Button, FadeIn, OptionCard, ProgressBar, Screen } from '../ui';

const mk = (c) => ({
  head: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, gap: 12 },
  count: { fontSize: 12, color: c.muted, fontWeight: '600' },
  body: { padding: 20 },
  title: { fontSize: 26, fontWeight: '800', color: c.text },
  lead: { fontSize: 14, color: c.muted, marginTop: 6, marginBottom: 20 },
});

function Layout({ step, title, lead, navigation, onNext, nextTitle = 'Продолжить', children }) {
  const st = useStyles(mk);
  return (
    <Screen edges={['top']}>
      <View style={st.head}>
        <BackButton onPress={navigation.goBack} />
        <ProgressBar value={step / 3} height={6} style={{ flex: 1 }} />
        <Text style={st.count}>{step}/3</Text>
      </View>
      <ScrollView contentContainerStyle={st.body}>
        <FadeIn>
          <Text style={st.title}>{title}</Text>
          <Text style={st.lead}>{lead}</Text>
        </FadeIn>
        {children}
      </ScrollView>
      <BottomBar>
        <Button title={nextTitle} onPress={onNext} />
      </BottomBar>
    </Screen>
  );
}

const GOALS = [
  [5, '5 минут', 'Спокойный темп'],
  [10, '10 минут', 'Оптимально'],
  [15, '15 минут', 'Быстрый прогресс'],
  [20, '20 минут', 'Интенсив'],
];

const LEVELS = [
  ['new', 'Новичок', 'Знаю несколько слов'],
  ['A2', 'Базовый · A2', 'Строю простые фразы'],
  ['B1', 'Средний · B1', 'Понимаю разговорную речь'],
  ['unknown', 'Не знаю', 'Пройти короткий тест уровня'],
];

const REMIND = [
  ['morning', 'Утром', '08:00'],
  ['day', 'Днём', '13:00'],
  ['evening', 'Вечером', '19:00'],
  ['none', 'Не напоминать', 'Можно включить позже в настройках'],
];

export function Goal({ navigation }) {
  const { s, a } = useApp();
  return (
    <Layout step={1} title="Сколько времени в день?" lead="Выберите цель — её можно изменить позже." navigation={navigation} onNext={() => navigation.navigate('Level')}>
      {GOALS.map(([v, t, sub], i) => (
        <FadeIn key={v} delay={80 + i * 60}>
          <OptionCard title={t} sub={sub} selected={s.onboarding.goal === v} onPress={() => a.setOnboarding({ goal: v })} />
        </FadeIn>
      ))}
    </Layout>
  );
}

export function Level({ navigation }) {
  const { s, a } = useApp();
  return (
    <Layout step={2} title="Какой у вас уровень?" lead="Подберём уроки под ваш уровень." navigation={navigation} onNext={() => navigation.navigate('Remind')}>
      {LEVELS.map(([v, t, sub], i) => (
        <FadeIn key={v} delay={80 + i * 60}>
          <OptionCard title={t} sub={sub} selected={s.onboarding.level === v} onPress={() => a.setOnboarding({ level: v })} />
        </FadeIn>
      ))}
    </Layout>
  );
}

export function Remind({ navigation }) {
  const { s, a } = useApp();
  return (
    <Layout step={3} title="Когда напоминать?" lead="Напоминаем позаниматься в удобное время." navigation={navigation} onNext={() => navigation.navigate('Signup')}>
      {REMIND.map(([v, t, sub], i) => (
        <FadeIn key={v} delay={80 + i * 60}>
          <OptionCard title={t} sub={sub} selected={s.onboarding.remind === v} onPress={() => a.setOnboarding({ remind: v })} />
        </FadeIn>
      ))}
    </Layout>
  );
}

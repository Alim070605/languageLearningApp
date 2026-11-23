import React, { useEffect, useRef } from 'react';
import { Animated, Easing, ScrollView, Text, View } from 'react-native';
import { useStyles, useTheme } from '../theme';
import { useApp } from '../store';
import { LEVELS } from '../data';
import { plural } from '../utils';
import { FadeIn, ProgressBar, Screen } from '../ui';

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const H = 110;

const mk = (c) => ({
  body: { padding: 20, paddingBottom: 30 },
  title: { fontSize: 26, fontWeight: '800', color: c.text },
  card: { backgroundColor: c.card, borderRadius: 14, padding: 14, marginTop: 12, borderWidth: 1, borderColor: c.border },
  h: { fontSize: 14, fontWeight: '700', color: c.text },
  small: { fontSize: 12, color: c.muted, marginTop: 2 },
  chart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: H + 20, marginTop: 14 },
  col: { alignItems: 'center', justifyContent: 'flex-end', flex: 1 },
  day: { fontSize: 11, color: c.muted, marginTop: 6 },
  two: { flexDirection: 'row', gap: 12, marginTop: 12 },
  stat: { flex: 1, backgroundColor: c.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: c.border },
  statV: { fontSize: 28, fontWeight: '800', color: c.text },
});

function Bar({ value, max, today, index }) {
  const c = useTheme();
  const st = useStyles(mk);
  const h = useRef(new Animated.Value(4)).current;
  useEffect(() => {
    Animated.timing(h, {
      toValue: Math.max(4, (value / max) * H),
      duration: 650,
      delay: 200 + index * 60,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [value, max]);
  return (
    <View style={st.col}>
      <Animated.View style={{ width: 22, height: h, borderRadius: 5, backgroundColor: today ? c.yellow : c.primary }} />
      <Text style={st.day}>{DAYS[index]}</Text>
    </View>
  );
}

export default function Progress() {
  const st = useStyles(mk);
  const { s, d } = useApp();
  const p = s.progress;
  const total = p.week.reduce((a, b) => a + b, 0);
  const max = Math.max(1, ...p.week);
  const todayIdx = (new Date().getDay() + 6) % 7;
  const li = LEVELS.indexOf(p.level);
  const nextLevel = LEVELS[Math.min(li + 1, LEVELS.length - 1)];
  const left = Math.max(0, 100 - p.levelPct);

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={st.body} showsVerticalScrollIndicator={false}>
        <FadeIn>
          <Text style={st.title}>Прогресс</Text>
        </FadeIn>
        <FadeIn delay={80}>
          <View style={st.card}>
            <Text style={st.h}>Эта неделя</Text>
            <Text style={st.small}>
              {total} {plural(total, ['минута', 'минуты', 'минут'])} занятий
            </Text>
            <View style={st.chart}>
              {p.week.map((v, i) => (
                <Bar key={i} index={i} value={v} max={max} today={i === todayIdx} />
              ))}
            </View>
          </View>
        </FadeIn>
        <FadeIn delay={160} style={st.two}>
          <View style={st.stat}>
            <Text style={st.statV}>{d.learned}</Text>
            <Text style={st.small}>{plural(d.learned, ['слово', 'слова', 'слов'])} выучено</Text>
          </View>
          <View style={st.stat}>
            <Text style={st.statV}>{p.streak}</Text>
            <Text style={st.small}>{plural(p.streak, ['день', 'дня', 'дней'])} подряд</Text>
          </View>
        </FadeIn>
        <FadeIn delay={240}>
          <View style={st.card}>
            <Text style={st.h}>
              Уровень {p.level} → {nextLevel}
            </Text>
            <ProgressBar value={p.levelPct / 100} height={8} style={{ marginTop: 10 }} />
            <Text style={[st.small, { marginTop: 8 }]}>
              {li >= LEVELS.length - 1 ? 'Вы достигли высшего уровня' : `Ещё ${left}%, и откроется следующий уровень`}
            </Text>
          </View>
        </FadeIn>
      </ScrollView>
    </Screen>
  );
}

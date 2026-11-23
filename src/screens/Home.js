import React, { useRef } from 'react';
import { Animated, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStyles, useTheme } from '../theme';
import { useApp, useHaptic } from '../store';
import { LESSONS, SECTION } from '../data';
import { plural } from '../utils';
import { Badge, Button, FadeIn, ProgressBar, Screen, Tap } from '../ui';

const mk = (c) => ({
  body: { padding: 20, paddingBottom: 30 },
  hi: { fontSize: 28, fontWeight: '800', color: c.text },
  card: { backgroundColor: c.card, borderRadius: 14, padding: 14, marginTop: 12, borderWidth: 1, borderColor: c.border },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  h: { fontSize: 14, fontWeight: '700', color: c.text },
  small: { fontSize: 12, color: c.muted, marginTop: 2 },
  review: { backgroundColor: c.primarySoft, borderColor: c.primarySoft },
  section: { fontSize: 12, fontWeight: '600', color: c.muted, marginTop: 22, marginBottom: 2 },
  active: { borderColor: c.primary, borderWidth: 1.5 },
  done: { fontSize: 12, fontWeight: '600', color: c.green, marginTop: 2 },
  check: { width: 24, height: 24, borderRadius: 12, backgroundColor: c.green, alignItems: 'center', justifyContent: 'center' },
  locked: { opacity: 0.65 },
});

function LockedRow({ title }) {
  const st = useStyles(mk);
  const c = useTheme();
  const buzz = useHaptic();
  const x = useRef(new Animated.Value(0)).current;
  const shake = () => {
    buzz('error');
    Animated.sequence([6, -6, 4, -4, 0].map((v) => Animated.timing(x, { toValue: v, duration: 60, useNativeDriver: true }))).start();
  };
  return (
    <Tap onPress={shake} style={[st.card, st.locked]}>
      <Animated.View style={{ transform: [{ translateX: x }] }}>
        <View style={st.row}>
          <View style={{ flex: 1 }}>
            <Text style={st.h}>{title}</Text>
            <Text style={st.small}>Откроется после предыдущего урока</Text>
          </View>
          <Ionicons name="lock-closed-outline" size={18} color={c.muted} />
        </View>
      </Animated.View>
    </Tap>
  );
}

export default function Home({ navigation }) {
  const st = useStyles(mk);
  const { s, d } = useApp();
  const p = s.progress;
  const goal = s.settings.goal;
  const name = (s.account?.name || 'друг').trim().split(' ')[0];
  const dueN = d.due.length;

  const rows = LESSONS.map((l, i) => {
    const done = s.lessons[l.id] || 0;
    const total = l.items.length;
    const prev = LESSONS[i - 1];
    const unlocked = !prev || (s.lessons[prev.id] || 0) >= prev.items.length;
    return { l, done, total, complete: done >= total, locked: !unlocked };
  });
  const activeId = rows.find((r) => !r.complete && !r.locked)?.l.id;
  const start = (r) => navigation.navigate('Lesson', { lessonId: r.l.id, startAt: r.complete ? 0 : r.done });

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={st.body} showsVerticalScrollIndicator={false}>
        <FadeIn>
          <Text style={st.hi}>Привет, {name}</Text>
          <Badge
            text={`${p.streak} ${plural(p.streak, ['день', 'дня', 'дней'])} подряд`}
            style={{ alignSelf: 'flex-start', marginTop: 8 }}
          />
        </FadeIn>

        <FadeIn delay={80}>
          <View style={st.card}>
            <View style={st.row}>
              <Text style={st.h}>Цель дня</Text>
              <Text style={st.small}>
                {Math.min(p.todayMin, goal)} из {goal} мин
              </Text>
            </View>
            <ProgressBar value={p.todayMin / goal} height={8} style={{ marginTop: 10 }} />
          </View>
        </FadeIn>

        <FadeIn delay={140}>
          <View style={[st.card, st.review, st.row]}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={st.h}>
                {dueN > 0 ? `${dueN} ${plural(dueN, ['слово ждёт', 'слова ждут', 'слов ждут'])} повторения` : 'Повторение на сегодня пройдено'}
              </Text>
              <Text style={st.small}>{dueN > 0 ? `Около ${Math.max(1, Math.round(dueN / 6))} ${plural(Math.max(1, Math.round(dueN / 6)), ['минуты', 'минут', 'минут'])}` : 'Загляните завтра'}</Text>
            </View>
            {dueN > 0 ? <Button title="Начать" small onPress={() => navigation.navigate('Review')} /> : null}
          </View>
        </FadeIn>

        <FadeIn delay={200}>
          <Text style={st.section}>{SECTION}</Text>
        </FadeIn>

        {rows.map((r, i) => (
          <FadeIn key={r.l.id} delay={240 + i * 60}>
            {r.locked ? (
              <LockedRow title={r.l.title} />
            ) : r.l.id === activeId ? (
              <View style={[st.card, st.active]}>
                <Text style={st.h}>{r.l.title}</Text>
                <Text style={st.small}>
                  {r.done > 0
                    ? `Осталось ${r.total - r.done} ${plural(r.total - r.done, ['упражнение', 'упражнения', 'упражнений'])} из ${r.total}`
                    : `${r.total} ${plural(r.total, ['упражнение', 'упражнения', 'упражнений'])}`}
                </Text>
                <Button title={r.done > 0 ? 'Продолжить' : 'Начать'} onPress={() => start(r)} style={{ marginTop: 12 }} />
              </View>
            ) : (
              <Tap onPress={() => start(r)} style={[st.card, st.row]}>
                <View>
                  <Text style={st.h}>{r.l.title}</Text>
                  <Text style={st.done}>Пройден</Text>
                </View>
                <View style={st.check}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                </View>
              </Tap>
            )}
          </FadeIn>
        ))}

        {!activeId ? (
          <FadeIn delay={500}>
            <View style={[st.card, { alignItems: 'center' }]}>
              <Text style={st.h}>Раздел пройден 🎉</Text>
              <Text style={st.small}>Новые уроки скоро появятся. А пока повторяйте слова.</Text>
            </View>
          </FadeIn>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

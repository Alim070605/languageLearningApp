import React, { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStyles, useTheme } from '../theme';
import { useApp } from '../store';
import { RU_FULL } from '../data';
import { plural, speak } from '../utils';
import { BackButton, BottomBar, Badge, Button, FadeIn, ProgressBar, Screen, Tap } from '../ui';

const mk = (c) => ({
  body: { padding: 20, paddingBottom: 30 },
  title: { fontSize: 26, fontWeight: '800', color: c.text },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.border,
    paddingHorizontal: 12,
    height: 44,
    marginTop: 14,
  },
  input: { flex: 1, marginLeft: 8, fontSize: 14, color: c.text },
  banner: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.primarySoft, borderRadius: 14, padding: 14, marginTop: 12 },
  h: { fontSize: 14, fontWeight: '700', color: c.text },
  small: { fontSize: 12, color: c.muted, marginTop: 2 },
  chips: { flexDirection: 'row', gap: 8, marginTop: 14 },
  chip: { paddingHorizontal: 14, height: 32, borderRadius: 16, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, justifyContent: 'center' },
  chipOn: { backgroundColor: c.ink, borderColor: c.ink },
  chipT: { fontSize: 12, fontWeight: '700', color: c.text },
  chipTOn: { color: c.onInk },
  list: { backgroundColor: c.card, borderRadius: 14, marginTop: 14, borderWidth: 1, borderColor: c.border, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  sep: { borderTopWidth: 1, borderTopColor: c.border },
  en: { fontSize: 15, fontWeight: '700', color: c.text },
  empty: { textAlign: 'center', color: c.muted, fontSize: 14, padding: 28 },
  // detail
  dHead: { paddingHorizontal: 20, paddingTop: 8 },
  dWord: { fontSize: 42, fontWeight: '800', color: c.text, marginTop: 10 },
  dIpa: { fontSize: 14, color: c.muted, marginTop: 2, marginBottom: 14 },
  box: { backgroundColor: c.card, borderRadius: 14, padding: 14, marginTop: 10, borderWidth: 1, borderColor: c.border },
  lab: { fontSize: 12, color: c.muted, fontWeight: '600', marginBottom: 4 },
  big: { fontSize: 16, fontWeight: '700', color: c.text },
  // review
  big12: { backgroundColor: c.card, borderRadius: 18, borderWidth: 1, borderColor: c.border, alignItems: 'center', paddingVertical: 28, marginTop: 20 },
  n12: { fontSize: 64, fontWeight: '800', color: c.primary },
  rRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: c.card, borderRadius: 14, borderWidth: 1, borderColor: c.border, padding: 14, marginTop: 10 },
  rN: { fontSize: 20, fontWeight: '800', color: c.text },
});

const minutesFor = (n, k) => Math.max(1, Math.round(n / k));

export function Words({ navigation }) {
  const st = useStyles(mk);
  const c = useTheme();
  const { d } = useApp();
  const [q, setQ] = useState('');
  const [f, setF] = useState('all');
  const needle = q.trim().toLowerCase();
  const list = d.list.filter(
    (w) => (f === 'all' || w.status === f) && (!needle || w.en.includes(needle) || w.ru.toLowerCase().includes(needle))
  );
  const dueN = d.due.length;
  const FILTERS = [
    ['all', `Все ${d.total}`],
    ['learning', `Учу ${d.learning}`],
    ['learned', `Выучено ${d.learned}`],
  ];

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={st.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <FadeIn>
          <Text style={st.title}>Мои слова</Text>
          <View style={st.search}>
            <Ionicons name="search" size={16} color={c.muted} />
            <TextInput value={q} onChangeText={setQ} placeholder="Поиск слов" placeholderTextColor={c.muted} style={st.input} autoCapitalize="none" />
            {q ? (
              <Tap onPress={() => setQ('')} hitSlop={10}>
                <Ionicons name="close-circle" size={16} color={c.muted} />
              </Tap>
            ) : null}
          </View>
        </FadeIn>

        {dueN > 0 ? (
          <FadeIn delay={80}>
            <View style={st.banner}>
              <View style={{ flex: 1 }}>
                <Text style={st.h}>
                  {dueN} {plural(dueN, ['слово', 'слова', 'слов'])} на повторение
                </Text>
                <Text style={st.small}>Около {minutesFor(dueN, 6)} {plural(minutesFor(dueN, 6), ['минуты', 'минут', 'минут'])}</Text>
              </View>
              <Button title="Начать" small onPress={() => navigation.navigate('Review')} />
            </View>
          </FadeIn>
        ) : null}

        <FadeIn delay={140} style={st.chips}>
          {FILTERS.map(([k, t]) => (
            <Tap key={k} onPress={() => setF(k)} style={[st.chip, f === k && st.chipOn]}>
              <Text style={[st.chipT, f === k && st.chipTOn]}>{t}</Text>
            </Tap>
          ))}
        </FadeIn>

        <FadeIn delay={200}>
          <View style={st.list}>
            {list.length === 0 ? (
              <Text style={st.empty}>{d.list.length === 0 ? 'Слова появятся после первого урока.' : 'Ничего не найдено. Попробуйте другое слово.'}</Text>
            ) : (
              list.map((w, i) => (
                <Tap key={w.id} scale={0.99} onPress={() => navigation.navigate('WordDetail', { id: w.id })} style={[st.row, i > 0 && st.sep]}>
                  <View>
                    <Text style={st.en}>{w.en}</Text>
                    <Text style={st.small}>{w.ru}</Text>
                  </View>
                  <Badge text={w.status === 'learned' ? 'Выучено' : 'Учу'} tone={w.status === 'learned' ? 'green' : 'yellow'} />
                </Tap>
              ))
            )}
          </View>
        </FadeIn>
      </ScrollView>
    </Screen>
  );
}

export function WordDetail({ route, navigation }) {
  const st = useStyles(mk);
  const { d } = useApp();
  const w = d.list.find((x) => x.id === route.params.id);
  if (!w) return null;
  return (
    <Screen>
      <View style={st.dHead}>
        <BackButton onPress={navigation.goBack} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 0 }}>
        <FadeIn>
          <Badge text={w.status === 'learned' ? 'Выучено' : 'Учу'} tone={w.status === 'learned' ? 'green' : 'yellow'} style={{ alignSelf: 'flex-start' }} />
          <Text style={st.dWord}>{w.en}</Text>
          <Text style={st.dIpa}>
            {w.ipa} · {w.pos.toLowerCase()}
          </Text>
          <Button title="Прослушать" variant="outline" icon="volume-high" onPress={() => speak(w.en)} />
        </FadeIn>
        <FadeIn delay={100}>
          <View style={st.box}>
            <Text style={st.lab}>Перевод</Text>
            <Text style={st.big}>{RU_FULL[w.id] || w.ru}</Text>
          </View>
          <View style={st.box}>
            <Text style={st.lab}>Пример</Text>
            <Text style={st.big}>{w.ex}</Text>
            <Text style={st.small}>{w.exRu}</Text>
          </View>
          <View style={st.box}>
            <Text style={st.lab}>Запоминание</Text>
            <ProgressBar value={Math.min(1, (w.reps || 0) / 3)} height={6} />
            <Text style={[st.small, { marginTop: 8 }]}>Следующее повторение — {w.due ? 'сегодня' : 'завтра'}</Text>
          </View>
        </FadeIn>
      </ScrollView>
      <BottomBar>
        <Button title="Повторить сейчас" onPress={() => navigation.navigate('Lesson', { wordIds: [w.id] })} />
      </BottomBar>
    </Screen>
  );
}

export function Review({ navigation }) {
  const st = useStyles(mk);
  const { d } = useApp();
  const n = d.due.length;
  const rows = [
    ['Новые', 'Только начали учить', d.dueCounts.new],
    ['Сложные', 'Часто ошибались', d.dueCounts.hard],
    ['Давно не видели', 'Больше недели', d.dueCounts.old],
  ];
  return (
    <Screen>
      <View style={st.dHead}>
        <BackButton onPress={navigation.goBack} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 8 }}>
        <FadeIn>
          <Text style={st.title}>{n > 0 ? 'Пора повторить' : 'Всё повторено'}</Text>
          <Text style={[st.small, { fontSize: 14, marginTop: 6 }]}>
            {n > 0
              ? `${n} ${plural(n, ['слово ждёт', 'слова ждут', 'слов ждут'])} повторения — это займёт около ${minutesFor(n, 4)} ${plural(minutesFor(n, 4), ['минуты', 'минут', 'минут'])}.`
              : 'На сегодня повторять нечего. Загляните завтра.'}
          </Text>
        </FadeIn>
        <FadeIn delay={100}>
          <View style={st.big12}>
            <Text style={st.n12}>{n}</Text>
            <Text style={st.small}>{plural(n, ['слово', 'слова', 'слов'])} на сегодня</Text>
          </View>
        </FadeIn>
        {rows.map(([t, sub, v], i) => (
          <FadeIn key={t} delay={180 + i * 70}>
            <View style={st.rRow}>
              <View>
                <Text style={st.h}>{t}</Text>
                <Text style={st.small}>{sub}</Text>
              </View>
              <Text style={st.rN}>{v}</Text>
            </View>
          </FadeIn>
        ))}
      </ScrollView>
      <BottomBar>
        <Button title="Начать повторение" disabled={n === 0} onPress={() => navigation.replace('Lesson', { wordIds: d.due.map((w) => w.id) })} />
      </BottomBar>
    </Screen>
  );
}

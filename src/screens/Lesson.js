import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, LayoutAnimation, Platform, Pressable, ScrollView, Text, UIManager, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStyles, useTheme } from '../theme';
import { useApp, useHaptic } from '../store';
import { LESSONS, WORD_MAP } from '../data';
import { plural, shuffle, speak } from '../utils';
import { Badge, BottomBar, Button, FadeIn, ProgressBar, Screen, Tap } from '../ui';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  try {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  } catch (e) {}
}

const mk = (c) => ({
  head: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, gap: 12 },
  count: { fontSize: 12, color: c.muted, fontWeight: '600' },
  body: { padding: 20 },
  label: { fontSize: 13, color: c.muted, fontWeight: '600' },
  q: { fontSize: 24, fontWeight: '800', color: c.text, marginTop: 6, marginBottom: 20, lineHeight: 30 },
  opt: {
    backgroundColor: c.card,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: c.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
  },
  optT: { fontSize: 14, fontWeight: '600', color: c.text },
  // карточка
  cardWrap: { flex: 1, margin: 20, marginBottom: 8 },
  face: {
    ...{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
    backgroundColor: c.card,
    borderRadius: 24,
    padding: 20,
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  wordBig: { fontSize: 42, fontWeight: '800', color: c.text },
  wordMid: { fontSize: 32, fontWeight: '800', color: c.text },
  ipa: { fontSize: 14, color: c.muted, marginTop: 4, marginBottom: 16 },
  hint: { fontSize: 12, color: c.muted, textAlign: 'center' },
  ru: { fontSize: 36, fontWeight: '800', color: c.primary, marginTop: 18, textAlign: 'center' },
  ex: { fontSize: 14, color: c.text, marginTop: 14, textAlign: 'center' },
  exRu: { fontSize: 12, color: c.muted, marginTop: 2, textAlign: 'center' },
  line: { height: 1, backgroundColor: c.border, alignSelf: 'stretch', marginTop: 4 },
  btnRow: { flexDirection: 'row', gap: 12 },
  // сборка предложения
  answer: {
    minHeight: 112,
    backgroundColor: c.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: c.border,
    padding: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'flex-start',
  },
  ruler: { position: 'absolute', left: 8, right: 8, height: 1, backgroundColor: c.border },
  bank: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 22, gap: 8 },
  chip: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.border,
    justifyContent: 'center',
    margin: 4,
  },
  chipT: { fontSize: 15, fontWeight: '600', color: c.text },
  // панель ответа
  panel: { padding: 20, borderTopLeftRadius: 22, borderTopRightRadius: 22 },
  panelT: { fontSize: 16, fontWeight: '800' },
  panelS: { fontSize: 13, color: c.text, marginTop: 4, marginBottom: 14 },
  // результат
  rWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  circle: { width: 96, height: 96, borderRadius: 48, backgroundColor: c.green, alignItems: 'center', justifyContent: 'center' },
  rTitle: { fontSize: 26, fontWeight: '800', color: c.text, marginTop: 22 },
  rSub: { fontSize: 14, color: c.muted, marginTop: 4, marginBottom: 12 },
  stats: { flexDirection: 'row', gap: 10, marginTop: 22, alignSelf: 'stretch' },
  stat: { flex: 1, backgroundColor: c.card, borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: c.border },
  statV: { fontSize: 20, fontWeight: '800', color: c.text },
  statL: { fontSize: 11, color: c.muted, marginTop: 2 },
  goal: { alignSelf: 'stretch', borderRadius: 10, padding: 12, marginTop: 14, alignItems: 'center' },
});

function Feedback({ ok, title, text, onNext }) {
  const st = useStyles(mk);
  const c = useTheme();
  const y = useRef(new Animated.Value(240)).current;
  useEffect(() => {
    Animated.spring(y, { toValue: 0, useNativeDriver: true, tension: 60, friction: 9 }).start();
  }, []);
  return (
    <Animated.View style={[st.panel, { backgroundColor: ok ? c.greenSoft : c.redSoft, transform: [{ translateY: y }] }]}>
      <Text style={[st.panelT, { color: ok ? c.green : c.red }]}>{title}</Text>
      <Text style={st.panelS}>{text}</Text>
      <Button title="Дальше" variant={ok ? 'green' : 'red'} onPress={onNext} />
      <View style={{ height: 8 }} />
    </Animated.View>
  );
}

function Flashcard({ word, onResult }) {
  const st = useStyles(mk);
  const { s } = useApp();
  const flip = useRef(new Animated.Value(0)).current;
  const [side, setSide] = useState(0);
  const toggle = (to) => {
    setSide(to);
    Animated.spring(flip, { toValue: to, friction: 8, tension: 40, useNativeDriver: true }).start();
    if (to === 1 && s.settings.sound) speak(word.en);
  };
  const fr = flip.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const br = flip.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

  const Listen = (
    <Button title="Прослушать" variant="outline" small icon="volume-high" onPress={() => speak(word.en)} />
  );

  return (
    <View style={{ flex: 1 }}>
      <Pressable style={st.cardWrap} onPress={() => toggle(side ? 0 : 1)}>
        <Animated.View pointerEvents={side === 0 ? 'auto' : 'none'} style={[st.face, { transform: [{ perspective: 1200 }, { rotateY: fr }] }]}>
          <Badge text={word.pos} style={{ alignSelf: 'flex-start' }} />
          <View style={st.center}>
            <Text style={st.wordBig}>{word.en}</Text>
            <Text style={st.ipa}>{word.ipa}</Text>
            {Listen}
          </View>
          <Text style={st.hint}>Нажмите, чтобы увидеть перевод</Text>
        </Animated.View>

        <Animated.View pointerEvents={side === 1 ? 'auto' : 'none'} style={[st.face, { transform: [{ perspective: 1200 }, { rotateY: br }] }]}>
          <Badge text={word.pos} style={{ alignSelf: 'flex-start' }} />
          <View style={st.center}>
            <Text style={st.wordMid}>{word.en}</Text>
            <Text style={st.ipa}>{word.ipa}</Text>
            {Listen}
            <Text style={st.ru}>{word.ru}</Text>
            <Text style={st.ex}>{word.ex}</Text>
            <Text style={st.exRu}>{word.exRu}</Text>
          </View>
        </Animated.View>
      </Pressable>

      <BottomBar>
        {side === 0 ? (
          <Button title="Показать перевод" onPress={() => toggle(1)} />
        ) : (
          <View style={st.btnRow}>
            <Button title="Ещё раз" variant="outline" style={{ flex: 1 }} onPress={() => onResult(false)} />
            <Button title="Запомнил" style={{ flex: 1 }} onPress={() => onResult(true)} />
          </View>
        )}
      </BottomBar>
    </View>
  );
}

function Quiz({ item, onResult }) {
  const st = useStyles(mk);
  const c = useTheme();
  const buzz = useHaptic();
  const [sel, setSel] = useState(null);
  const [checked, setChecked] = useState(false);
  const ok = sel === item.a;

  const check = () => {
    setChecked(true);
    buzz(ok ? 'success' : 'error');
  };

  const optStyle = (i) => {
    if (checked) {
      if (i === item.a) return { borderColor: c.green, backgroundColor: c.greenSoft };
      if (i === sel) return { borderColor: c.red, backgroundColor: c.redSoft };
      return { opacity: 0.6 };
    }
    return i === sel ? { borderColor: c.primary, backgroundColor: c.primarySoft } : null;
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={st.body}>
        <Text style={st.label}>Выберите перевод</Text>
        <Text style={st.q}>«{item.ru}»</Text>
        {item.opts.map((o, i) => (
          <Tap
            key={o}
            disabled={checked}
            onPress={() => {
              buzz('light');
              setSel(i);
            }}
            style={[st.opt, optStyle(i)]}
          >
            <Text style={st.optT}>{o}</Text>
          </Tap>
        ))}
      </ScrollView>
      {checked ? (
        <Feedback
          ok={ok}
          title={ok ? 'Верно!' : 'Неверно'}
          text={ok ? item.note : `Правильно: ${item.opts[item.a]}`}
          onNext={() => onResult(ok)}
        />
      ) : (
        <BottomBar>
          <Button title="Проверить" disabled={sel === null} onPress={check} />
        </BottomBar>
      )}
    </View>
  );
}

function Chip({ chip, onPress }) {
  const st = useStyles(mk);
  return (
    <Tap onPress={() => onPress(chip)} style={st.chip}>
      <Text style={st.chipT}>{chip.w}</Text>
    </Tap>
  );
}

function Sentence({ item, onResult }) {
  const st = useStyles(mk);
  const buzz = useHaptic();
  const [bank, setBank] = useState(() => shuffle([...item.tokens, ...item.extra]).map((w, i) => ({ id: i, w })));
  const [ans, setAns] = useState([]);
  const [checked, setChecked] = useState(false);
  const ok = ans.map((x) => x.w).join(' ') === item.tokens.join(' ');
  const anim = () => LayoutAnimation.configureNext(LayoutAnimation.create(180, 'easeInEaseOut', 'opacity'));

  const toAnswer = (chip) => {
    if (checked) return;
    buzz('light');
    anim();
    setBank((b) => b.filter((x) => x.id !== chip.id));
    setAns((a) => [...a, chip]);
  };
  const toBank = (chip) => {
    if (checked) return;
    buzz('light');
    anim();
    setAns((a) => a.filter((x) => x.id !== chip.id));
    setBank((b) => [...b, chip].sort((x, y) => x.id - y.id));
  };
  const check = () => {
    setChecked(true);
    buzz(ok ? 'success' : 'error');
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={st.body}>
        <Text style={st.label}>Составьте предложение</Text>
        <Text style={st.q}>«{item.ru}»</Text>
        <View style={st.answer}>
          <View style={[st.ruler, { top: 56 }]} />
          <View style={[st.ruler, { top: 104 }]} />
          {ans.map((chip) => (
            <Chip key={chip.id} chip={chip} onPress={toBank} />
          ))}
        </View>
        <View style={st.bank}>
          {bank.map((chip) => (
            <Chip key={chip.id} chip={chip} onPress={toAnswer} />
          ))}
        </View>
      </ScrollView>
      {checked ? (
        <Feedback
          ok={ok}
          title={ok ? 'Верно!' : 'Неверно'}
          text={ok ? 'Отлично, предложение составлено правильно.' : `Правильно: ${item.tokens.join(' ')}`}
          onNext={() => onResult(ok)}
        />
      ) : (
        <BottomBar>
          <Button title="Проверить" disabled={ans.length === 0} onPress={check} />
        </BottomBar>
      )}
    </View>
  );
}

export function Lesson({ route, navigation }) {
  const st = useStyles(mk);
  const c = useTheme();
  const { a } = useApp();
  const { lessonId, wordIds, items: given, startAt = 0 } = route.params;
  const lesson = LESSONS.find((l) => l.id === lessonId);

  const initial = useMemo(() => {
    if (given) return given;
    if (lesson) return lesson.items;
    return (wordIds || []).map((w) => ({ t: 'f', w }));
  }, []);
  const [queue, setQueue] = useState(initial);
  const [idx, setIdx] = useState(Math.min(startAt, initial.length - 1));
  const run = useRef({ correct: 0, scored: 0, mistakes: [], words: new Set(), t0: Date.now() }).current;

  const close = () =>
    Alert.alert('Выйти из урока?', 'Прогресс сохранится.', [
      { text: 'Остаться', style: 'cancel' },
      { text: 'Выйти', style: 'destructive', onPress: () => navigation.goBack() },
    ]);

  const finish = () => {
    const minutes = Math.max(1, Math.round((Date.now() - run.t0) / 60000));
    const kind = lesson ? 'lesson' : 'review';
    a.finish({ kind, minutes, correct: run.correct, total: run.scored });
    navigation.replace('Result', {
      kind,
      correct: run.correct,
      total: run.scored,
      minutes,
      newWords: run.words.size,
      mistakes: run.mistakes,
    });
  };

  const next = (ok) => {
    const item = queue[idx];
    let len = queue.length;
    if (item.t === 'f') {
      a.rateWord(item.w, ok);
      if (ok) {
        run.correct += 1;
        run.scored += 1;
        run.words.add(item.w);
      } else {
        setQueue((q) => [...q, item]); // «Ещё раз» — карточка вернётся в конец
        len += 1;
      }
    } else {
      run.scored += 1;
      if (ok) run.correct += 1;
      else run.mistakes.push(item);
    }
    const n = idx + 1;
    if (lesson) a.saveLesson(lesson.id, Math.min(n, lesson.items.length), lesson.items.length);
    if (n >= len) finish();
    else setIdx(n);
  };

  const item = queue[idx];
  return (
    <Screen edges={['top']}>
      <View style={st.head}>
        <Tap onPress={close} hitSlop={12}>
          <Ionicons name="close" size={24} color={c.muted} />
        </Tap>
        <ProgressBar value={idx / queue.length} height={6} style={{ flex: 1 }} />
        <Text style={st.count}>
          {idx + 1}/{queue.length}
        </Text>
      </View>
      <FadeIn key={idx} x={28} y={0} duration={320} style={{ flex: 1 }}>
        {item.t === 'f' && <Flashcard word={WORD_MAP[item.w]} onResult={next} />}
        {item.t === 'q' && <Quiz item={item} onResult={next} />}
        {item.t === 's' && <Sentence item={item} onResult={next} />}
      </FadeIn>
    </Screen>
  );
}

export function Result({ route, navigation }) {
  const st = useStyles(mk);
  const c = useTheme();
  const { s } = useApp();
  const { kind, correct, total, minutes, newWords, mistakes } = route.params;
  const goal = s.settings.goal;
  const reached = s.progress.todayMin >= goal;
  const pop = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.spring(pop, { toValue: 1, friction: 5, tension: 70, useNativeDriver: true }).start();
  }, []);

  const again = () => {
    if (mistakes && mistakes.length) navigation.replace('Lesson', { items: mistakes });
    else Alert.alert('Ошибок нет', 'В этом уроке вы ответили на всё правильно. Отличная работа!');
  };

  return (
    <Screen>
      <View style={st.rWrap}>
        <Animated.View style={[st.circle, { transform: [{ scale: pop }] }]}>
          <Ionicons name="checkmark" size={54} color="#fff" />
        </Animated.View>
        <FadeIn delay={150} style={{ alignItems: 'center' }}>
          <Text style={st.rTitle}>{kind === 'lesson' ? 'Урок пройден!' : 'Повторение пройдено!'}</Text>
          <Text style={st.rSub}>Отличная работа, {(s.account?.name || '').split(' ')[0]}.</Text>
          <Badge text={`+${kind === 'lesson' ? 20 : 10} опыта`} />
        </FadeIn>
        <FadeIn delay={300} style={st.stats}>
          {[
            [`${correct}/${total}`, 'задач'],
            [`${minutes} мин`, 'время'],
            [`+${newWords}`, plural(newWords, ['слово', 'слова', 'слов'])],
          ].map(([v, l]) => (
            <View key={l} style={st.stat}>
              <Text style={st.statV}>{v}</Text>
              <Text style={st.statL}>{l}</Text>
            </View>
          ))}
        </FadeIn>
        <FadeIn delay={420} style={{ alignSelf: 'stretch' }}>
          <View style={[st.goal, { backgroundColor: reached ? c.greenSoft : c.primarySoft }]}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: reached ? c.green : c.primary }}>
              {reached
                ? `Цель дня выполнена · ${goal} из ${goal} мин`
                : `Цель дня: ${s.progress.todayMin} из ${goal} мин`}
            </Text>
          </View>
        </FadeIn>
      </View>
      <FadeIn delay={500} y={20} style={{ padding: 20, gap: 10 }}>
        <Button title="Продолжить" onPress={() => navigation.popToTop()} />
        <Button title="Повторить ошибки" variant="outline" onPress={again} />
      </FadeIn>
    </Screen>
  );
}

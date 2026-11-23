import React, { useState } from 'react';
import { Alert, ScrollView, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStyles, useTheme } from '../theme';
import { useApp, REMIND_TIME } from '../store';
import { ACHIEVEMENTS } from '../data';
import { plural } from '../utils';
import { BackButton, Button, FadeIn, Field, Screen, Sheet, Tap } from '../ui';

const mk = (c) => ({
  body: { padding: 20, paddingBottom: 30 },
  top: { alignItems: 'flex-end' },
  help: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: c.muted, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: 4 },
  avatarT: { fontSize: 32, fontWeight: '800', color: '#fff' },
  name: { fontSize: 22, fontWeight: '800', color: c.text, textAlign: 'center', marginTop: 12 },
  sub: { fontSize: 13, color: c.muted, textAlign: 'center', marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 20 },
  stat: { width: '48%', flexGrow: 1, backgroundColor: c.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: c.border },
  statV: { fontSize: 24, fontWeight: '800', color: c.text },
  statL: { fontSize: 12, color: c.muted, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: c.card, borderRadius: 14, padding: 14, marginTop: 10, borderWidth: 1, borderColor: c.border },
  h: { fontSize: 14, fontWeight: '700', color: c.text },
  small: { fontSize: 12, color: c.muted, marginTop: 2 },
  // settings
  title: { fontSize: 26, fontWeight: '800', color: c.text, marginTop: 6, marginBottom: 14 },
  list: { backgroundColor: c.card, borderRadius: 14, borderWidth: 1, borderColor: c.border, overflow: 'hidden' },
  sRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  sep: { borderTopWidth: 1, borderTopColor: c.border },
  // sheet rows
  opt: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: c.card, borderRadius: 12, borderWidth: 1.5, borderColor: c.border, padding: 14, marginBottom: 8 },
  optOn: { borderColor: c.primary, backgroundColor: c.primarySoft },
  ach: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  achIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});

export function Profile({ navigation }) {
  const st = useStyles(mk);
  const c = useTheme();
  const { s, d, a } = useApp();
  const p = s.progress;
  const name = s.account?.name || 'Гость';
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState(name);
  const [achOpen, setAchOpen] = useState(false);
  const unlocked = ACHIEVEMENTS.filter((x) => x.test(p, d.learned));
  const hours = Math.floor(p.totalMin / 60);

  const stats = [
    [p.streak, plural(p.streak, ['день', 'дня', 'дней']) + ' подряд'],
    [d.total, plural(d.total, ['слово', 'слова', 'слов'])],
    [hours >= 1 ? `${hours} ч` : `${p.totalMin} мин`, 'учёбы'],
    [p.level, 'уровень'],
  ];

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={st.body} showsVerticalScrollIndicator={false}>
        <View style={st.top}>
          <Tap
            onPress={() =>
              Alert.alert(
                'Как это работает',
                'Цель дня — минуты занятий за сегодня. Серия растёт, если вы занимаетесь каждый день. Слова из повторения возвращаются, пока вы их не запомните.'
              )
            }
            style={st.help}
          >
            <Ionicons name="help" size={16} color={c.muted} />
          </Tap>
        </View>
        <FadeIn>
          <View style={st.avatar}>
            <Text style={st.avatarT}>{name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={st.name}>{name.split(' ')[0]}</Text>
          <Text style={st.sub}>Учу английский · уровень {p.level}</Text>
        </FadeIn>
        <FadeIn delay={100} style={st.grid}>
          {stats.map(([v, l]) => (
            <View key={l} style={st.stat}>
              <Text style={st.statV}>{v}</Text>
              <Text style={st.statL}>{l}</Text>
            </View>
          ))}
        </FadeIn>
        <FadeIn delay={180}>
          <Tap onPress={() => setAchOpen(true)} style={st.row}>
            <View>
              <Text style={st.h}>Достижения</Text>
              <Text style={st.small}>Награды за серии и уроки</Text>
            </View>
            <Text style={st.h}>
              {unlocked.length} из {ACHIEVEMENTS.length}
            </Text>
          </Tap>
          <Tap onPress={() => navigation.navigate('Settings')} style={st.row}>
            <Text style={st.h}>Настройки</Text>
            <Ionicons name="chevron-forward" size={18} color={c.muted} />
          </Tap>
          <Button
            title="Редактировать профиль"
            variant="outline"
            style={{ marginTop: 16 }}
            onPress={() => {
              setDraft(name);
              setEdit(true);
            }}
          />
        </FadeIn>
      </ScrollView>

      <Sheet visible={edit} onClose={() => setEdit(false)} title="Редактировать профиль">
        <Field label="Имя" value={draft} onChangeText={setDraft} autoCapitalize="words" />
        <Button
          title="Сохранить"
          disabled={!draft.trim()}
          onPress={() => {
            a.setName(draft);
            setEdit(false);
          }}
        />
      </Sheet>

      <Sheet visible={achOpen} onClose={() => setAchOpen(false)} title={`Достижения · ${unlocked.length} из ${ACHIEVEMENTS.length}`}>
        <ScrollView>
          {ACHIEVEMENTS.map((x) => {
            const on = x.test(p, d.learned);
            return (
              <View key={x.id} style={st.ach}>
                <View style={[st.achIcon, { backgroundColor: on ? c.yellow : c.track }]}>
                  <Ionicons name={on ? 'trophy' : 'lock-closed'} size={18} color={on ? c.onYellow : c.muted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[st.h, !on && { color: c.muted }]}>{x.title}</Text>
                  <Text style={st.small}>{x.desc}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </Sheet>
    </Screen>
  );
}

const GOALS = [5, 10, 15, 20];
const REMINDS = [
  ['morning', 'Утром · 08:00'],
  ['day', 'Днём · 13:00'],
  ['evening', 'Вечером · 19:00'],
];

function Row({ title, sub, right, onPress, first }) {
  const st = useStyles(mk);
  const inner = (
    <>
      <View style={{ flex: 1, paddingRight: 10 }}>
        <Text style={st.h}>{title}</Text>
        <Text style={st.small}>{sub}</Text>
      </View>
      {right}
    </>
  );
  return onPress ? (
    <Tap onPress={onPress} scale={0.99} style={[st.sRow, !first && st.sep]}>
      {inner}
    </Tap>
  ) : (
    <View style={[st.sRow, !first && st.sep]}>{inner}</View>
  );
}

function Option({ label, on, onPress, disabled }) {
  const st = useStyles(mk);
  const c = useTheme();
  return (
    <Tap onPress={onPress} disabled={disabled} style={[st.opt, on && st.optOn, disabled && { opacity: 0.5 }]}>
      <Text style={st.h}>{label}</Text>
      {on ? <Ionicons name="checkmark" size={18} color={c.primary} /> : null}
    </Tap>
  );
}

export function Settings({ navigation }) {
  const st = useStyles(mk);
  const c = useTheme();
  const { s, a } = useApp();
  const set = s.settings;
  const [sheet, setSheet] = useState(null); // 'goal' | 'remind' | 'lang'

  const sw = (value, onChange) => (
    <Switch value={value} onValueChange={onChange} trackColor={{ false: c.track, true: c.primary }} thumbColor="#fff" />
  );
  const chev = <Ionicons name="chevron-forward" size={18} color={c.muted} />;

  const logout = () =>
    Alert.alert('Выйти из аккаунта?', 'Прогресс сохранится на этом устройстве.', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Выйти', style: 'destructive', onPress: () => a.logout() },
    ]);

  return (
    <Screen>
      <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
        <BackButton onPress={navigation.goBack} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 0, flexGrow: 1 }}>
        <Text style={st.title}>Настройки</Text>
        <FadeIn>
          <View style={st.list}>
            <Row
              first
              title="Напоминания"
              sub={set.remind === 'none' ? 'Выключены' : `Каждый день в ${REMIND_TIME[set.remind]}`}
              onPress={() => setSheet('remind')}
              right={sw(set.remind !== 'none', (v) => a.updateSettings({ remind: v ? 'evening' : 'none' }))}
            />
            <Row title="Цель дня" sub={`${set.goal} минут в день`} onPress={() => setSheet('goal')} right={chev} />
            <Row
              title="Звуки в уроках"
              sub="Озвучка слов и эффекты"
              right={sw(set.sound, (v) => a.updateSettings({ sound: v }))}
            />
            <Row
              title="Тёмная тема"
              sub="Оформление приложения"
              right={sw(set.dark, (v) => a.updateSettings({ dark: v }))}
            />
            <Row title="Язык интерфейса" sub="Русский" onPress={() => setSheet('lang')} right={chev} />
          </View>
        </FadeIn>
        <View style={{ flex: 1 }} />
        <Button title="Выйти из аккаунта" variant="danger" style={{ marginTop: 24 }} onPress={logout} />
      </ScrollView>

      <Sheet visible={sheet === 'goal'} onClose={() => setSheet(null)} title="Цель дня">
        {GOALS.map((g) => (
          <Option
            key={g}
            label={`${g} минут в день`}
            on={set.goal === g}
            onPress={() => {
              a.updateSettings({ goal: g });
              setSheet(null);
            }}
          />
        ))}
      </Sheet>
      <Sheet visible={sheet === 'remind'} onClose={() => setSheet(null)} title="Когда напоминать?">
        {REMINDS.map(([k, l]) => (
          <Option
            key={k}
            label={l}
            on={set.remind === k}
            onPress={() => {
              a.updateSettings({ remind: k });
              setSheet(null);
            }}
          />
        ))}
      </Sheet>
      <Sheet visible={sheet === 'lang'} onClose={() => setSheet(null)} title="Язык интерфейса">
        <Option label="Русский" on onPress={() => setSheet(null)} />
        <Option label="English · скоро" disabled />
        <Option label="Қазақша · скоро" disabled />
      </Sheet>
    </Screen>
  );
}

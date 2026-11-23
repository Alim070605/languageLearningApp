import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WORDS, LESSONS, LEVELS } from './data';
import { haptic } from './utils';

// DEMO = true  -> после регистрации приложение выглядит как на макете (серия 7 дней, 128 слов и т.д.)
// DEMO = false -> новый пользователь начинает с нуля
export const DEMO = true;

const KEY = 'slovo_state_v1';
const pad = (n) => String(n).padStart(2, '0');
export const dstr = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const mondayStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return dstr(d);
};
export const REMIND_TIME = { morning: '08:00', day: '13:00', evening: '19:00' };
const LEVEL_MAP = { new: 'A1', unknown: 'A1' };

function seedWords(demo) {
  const w = {};
  if (demo) WORDS.forEach((x) => (w[x.id] = { ...x.seed }));
  return w;
}

// В макете «Все 128 · Учу 34 · Выучено 94»: часть слов относится к другим разделам.
// В демо-режиме их количество добавляется к счётчикам.
function offsets(words, demo) {
  if (!demo) return { learning: 0, learned: 0 };
  const v = Object.values(words);
  return {
    learning: 34 - v.filter((x) => x.status === 'learning').length,
    learned: 94 - v.filter((x) => x.status === 'learned').length,
  };
}

function freshProgress(demo, level) {
  return {
    streak: demo ? 7 : 0,
    lastActive: demo ? dstr() : '',
    todayDate: dstr(),
    todayMin: demo ? 6 : 0,
    week: demo ? [9, 6, 3, 12, 7, 1, 0] : [0, 0, 0, 0, 0, 0, 0],
    weekStart: mondayStr(),
    totalMin: demo ? 840 : 0,
    xp: demo ? 1240 : 0,
    lessonsDone: demo ? 12 : 0,
    reviews: 0,
    perfect: 0,
    goalDays: demo ? 3 : 0,
    level,
    levelPct: demo ? 70 : 0,
  };
}

const freshLessons = (demo) => (demo ? { l1: LESSONS[0].items.length, l2: 7, l3: 0 } : { l1: 0, l2: 0, l3: 0 });

function initialState() {
  const words = seedWords(DEMO);
  return {
    loaded: false,
    loggedIn: false,
    account: null, // {name, email, password}: локально; для продакшена заменить на бэкенд (например Supabase Auth)
    onboarding: { goal: 10, level: 'A2', remind: 'evening' },
    settings: { goal: 10, remind: 'evening', sound: true, dark: false },
    progress: freshProgress(DEMO, 'A2'),
    lessons: freshLessons(DEMO),
    words,
    extra: offsets(words, DEMO),
  };
}

// Новый день: сбрасываем «сегодня», серию обрываем, если пропущен день; новая неделя — обнуляем график
function rollover(s) {
  const t = dstr();
  const p = { ...s.progress };
  if (p.todayDate !== t) {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    if (p.lastActive && p.lastActive !== dstr(y) && p.lastActive !== t) p.streak = 0;
    p.todayDate = t;
    p.todayMin = 0;
  }
  const m = mondayStr();
  if (p.weekStart !== m) {
    p.weekStart = m;
    p.week = [0, 0, 0, 0, 0, 0, 0];
  }
  return { ...s, progress: p };
}

function derive(s) {
  const list = WORDS.filter((w) => s.words[w.id]).map((w) => ({ ...w, ...s.words[w.id] }));
  const learned = list.filter((w) => w.status === 'learned').length + s.extra.learned;
  const learning = list.filter((w) => w.status === 'learning').length + s.extra.learning;
  const due = list.filter((w) => w.due);
  const dueCounts = { new: 0, hard: 0, old: 0 };
  due.forEach((w) => (dueCounts[w.due] += 1));
  return { list, learned, learning, total: learned + learning, due, dueCounts };
}

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

// Вибро-отклик с учётом настройки «Звуки в уроках»
export function useHaptic() {
  const { s } = useApp();
  return (kind) => {
    if (s.settings.sound) haptic(kind);
  };
}

export function AppProvider({ children }) {
  const [s, setS] = useState(initialState);
  const sRef = useRef(s);
  sRef.current = s;

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        let saved = null;
        try {
          saved = raw ? JSON.parse(raw) : null;
        } catch (e) {}
        setS((prev) => (saved ? rollover({ ...prev, ...saved, loaded: true }) : { ...prev, loaded: true }));
      })
      .catch(() => setS((p) => ({ ...p, loaded: true })));
  }, []);

  useEffect(() => {
    if (s.loaded) AsyncStorage.setItem(KEY, JSON.stringify(s)).catch(() => {});
  }, [s]);

  const a = useMemo(
    () => ({
      setOnboarding: (patch) => setS((x) => ({ ...x, onboarding: { ...x.onboarding, ...patch } })),

      signup: ({ name, email, password }) =>
        setS((x) => {
          const words = seedWords(DEMO);
          const level = LEVEL_MAP[x.onboarding.level] || x.onboarding.level;
          return {
            ...x,
            loggedIn: true,
            account: { name: name.trim(), email: email.trim().toLowerCase(), password },
            settings: { ...x.settings, goal: x.onboarding.goal, remind: x.onboarding.remind },
            progress: freshProgress(DEMO, level),
            lessons: freshLessons(DEMO),
            words,
            extra: offsets(words, DEMO),
          };
        }),

      // возвращает текст ошибки или null
      login: (email, password) => {
        const acc = sRef.current.account;
        if (!acc) return 'Аккаунт не найден. Сначала создайте профиль.';
        if (acc.email !== email.trim().toLowerCase() || acc.password !== password) return 'Неверный email или пароль.';
        setS((x) => rollover({ ...x, loggedIn: true }));
        return null;
      },

      logout: () => setS((x) => ({ ...x, loggedIn: false })),
      updateSettings: (patch) => setS((x) => ({ ...x, settings: { ...x.settings, ...patch } })),
      setName: (name) => setS((x) => ({ ...x, account: { ...x.account, name: name.trim() } })),

      // Прогресс урока сохраняется после каждого упражнения. Пройденный урок остаётся пройденным.
      saveLesson: (id, done, total) =>
        setS((x) => {
          if ((x.lessons[id] || 0) >= total) return x;
          return { ...x, lessons: { ...x.lessons, [id]: done } };
        }),

      rateWord: (id, ok) =>
        setS((x) => {
          const prev = x.words[id] || { status: 'learning', reps: 0, due: null };
          const n = { ...prev };
          if (ok) {
            n.reps = (prev.reps || 0) + 1;
            n.due = null;
            if (n.reps >= 3) n.status = 'learned';
          } else {
            n.due = 'hard';
            if (n.reps > 0) n.reps -= 1;
            n.status = 'learning';
          }
          return { ...x, words: { ...x.words, [id]: n } };
        }),

      finish: ({ kind, minutes, correct, total }) =>
        setS((x) => {
          const p = { ...x.progress };
          const t = dstr();
          const goal = x.settings.goal;
          const wasGoal = p.todayMin >= goal;
          if (p.lastActive !== t) {
            p.streak += 1;
            p.lastActive = t;
          }
          const wi = (new Date().getDay() + 6) % 7;
          p.week = p.week.map((v, i) => (i === wi ? v + minutes : v));
          p.todayMin += minutes;
          p.totalMin += minutes;
          if (!wasGoal && p.todayMin >= goal) p.goalDays += 1;
          if (kind === 'review') {
            p.reviews += 1;
            p.xp += 10;
          } else {
            p.lessonsDone += 1;
            p.xp += 20;
            if (total > 0 && correct === total) p.perfect += 1;
            p.levelPct += 5;
            const li = LEVELS.indexOf(p.level);
            if (p.levelPct >= 100) {
              if (li < LEVELS.length - 1) {
                p.level = LEVELS[li + 1];
                p.levelPct = 0;
              } else p.levelPct = 100;
            }
          }
          return { ...x, progress: p };
        }),
    }),
    []
  );

  const d = useMemo(() => derive(s), [s.words, s.extra]);
  const value = useMemo(() => ({ s, d, a }), [s, d, a]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

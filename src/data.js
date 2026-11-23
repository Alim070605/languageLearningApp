export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
export const SECTION = 'Раздел 2 · В кафе';

const POS = { n: 'Существительное', v: 'Глагол' };

// [id, ipa, ru, pos, example, exampleRu, status, reps, due]
// status: learning | learned; due: new | hard | old | null (слово ждёт повторения)
const raw = [
  ['coffee', '/ˈkɒfi/', 'кофе', 'n', "I'd like a coffee, please.", 'Мне, пожалуйста, кофе.', 'learned', 4, null],
  ['bill', '/bɪl/', 'счёт', 'n', 'Can I have the bill, please?', 'Можно счёт, пожалуйста?', 'learning', 1, null],
  ['table', '/ˈteɪbl/', 'стол', 'n', 'A table for two, please.', 'Столик на двоих, пожалуйста.', 'learned', 4, null],
  ['menu', '/ˈmenjuː/', 'меню', 'n', 'Can I see the menu?', 'Можно посмотреть меню?', 'learned', 5, null],
  ['tip', '/tɪp/', 'чаевые', 'n', 'Should I leave a tip?', 'Нужно оставить чаевые?', 'learning', 0, 'new'],
  ['receipt', '/rɪˈsiːt/', 'чек', 'n', 'Could I have a receipt?', 'Можно чек?', 'learning', 0, 'new'],
  ['change', '/tʃeɪndʒ/', 'сдача', 'n', 'Keep the change, please.', 'Сдачи не надо.', 'learning', 0, 'new'],
  ['napkin', '/ˈnæpkɪn/', 'салфетка', 'n', 'Could we get more napkins?', 'Можно ещё салфеток?', 'learning', 0, 'new'],
  ['water', '/ˈwɔːtər/', 'вода', 'n', 'Can I have some water, please?', 'Можно воды, пожалуйста?', 'learning', 1, 'hard'],
  ['order', '/ˈɔːrdər/', 'заказывать', 'v', "I'd like to order, please.", 'Я бы хотел сделать заказ.', 'learning', 2, 'hard'],
  ['reservation', '/ˌrezərˈveɪʃn/', 'бронь', 'n', 'I have a reservation for two.', 'У меня бронь на двоих.', 'learning', 1, 'hard'],
  ['waiter', '/ˈweɪtər/', 'официант', 'n', 'Excuse me, waiter!', 'Извините, официант!', 'learning', 2, 'hard'],
  ['sugar', '/ˈʃʊɡər/', 'сахар', 'n', 'No sugar, please.', 'Без сахара, пожалуйста.', 'learning', 1, 'hard'],
  ['tea', '/tiː/', 'чай', 'n', "I'd like tea with lemon.", 'Я хочу чай с лимоном.', 'learned', 3, 'old'],
  ['bread', '/bred/', 'хлеб', 'n', 'Could we have some bread?', 'Можно хлеба?', 'learned', 3, 'old'],
  ['soup', '/suːp/', 'суп', 'n', 'The soup of the day, please.', 'Суп дня, пожалуйста.', 'learned', 3, 'old'],
  ['juice', '/dʒuːs/', 'сок', 'n', 'One orange juice, please.', 'Один апельсиновый сок.', 'learned', 3, null],
  ['salad', '/ˈsæləd/', 'салат', 'n', 'A small salad, please.', 'Маленький салат, пожалуйста.', 'learned', 3, null],
  ['breakfast', '/ˈbrekfəst/', 'завтрак', 'n', "What's for breakfast?", 'Что на завтрак?', 'learned', 3, null],
  ['dinner', '/ˈdɪnər/', 'ужин', 'n', 'Dinner for two, please.', 'Ужин на двоих.', 'learned', 3, null],
  ['fork', '/fɔːrk/', 'вилка', 'n', 'Could I have a fork?', 'Можно вилку?', 'learned', 3, null],
  ['plate', '/pleɪt/', 'тарелка', 'n', 'A clean plate, please.', 'Чистую тарелку, пожалуйста.', 'learned', 3, null],
];

export const WORDS = raw.map(([id, ipa, ru, pos, ex, exRu, status, reps, due]) => ({
  id,
  en: id,
  ipa,
  ru,
  pos: POS[pos],
  ex,
  exRu,
  seed: { status, reps, due },
}));

export const WORD_MAP = Object.fromEntries(WORDS.map((w) => [w.id, w]));
export const RU_FULL = { bill: 'счёт (в ресторане)' };

const F = (w) => ({ t: 'f', w });
const Q = (ru, opts, a, note) => ({ t: 'q', ru, opts, a, note });
const S = (ru, tokens, extra) => ({ t: 's', ru, tokens, extra });

const billOpts = [
  'Can I have the bill, please?',
  'Can I have the menu, please?',
  'Can I have some water, please?',
  'Can I have a table, please?',
];

export const LESSONS = [
  {
    id: 'l1',
    title: 'Заказ напитка',
    items: [
      F('coffee'),
      F('tea'),
      Q(
        'Можно воды, пожалуйста?',
        ['Can I have some water, please?', 'Can I have a table, please?', 'Can I have the bill, please?', 'Can I have the menu, please?'],
        0,
        'some water — «воды»'
      ),
      S('Мне, пожалуйста, кофе', ['I', 'would', 'like', 'a', 'coffee', 'please'], ['want', 'the']),
    ],
  },
  {
    id: 'l2',
    title: 'Меню и цены',
    items: [
      F('coffee'),
      Q('Можно счёт, пожалуйста?', billOpts, 0, 'the bill — «счёт»'),
      Q(
        'Мне нужен столик на двоих?',
        ['I need a table for two', 'I need a menu for two', 'I need a coffee for two', 'I need a bill for two'],
        0,
        'table for two — «столик на двоих»'
      ),
      F('menu'),
      Q('Можно меню, пожалуйста?', billOpts, 1, 'the menu — «меню»'),
      S('Я хочу чай с лимоном', ['I', 'would', 'like', 'tea', 'with', 'lemon'], ['a', 'want']),
      Q('Сколько это стоит?', ['How much is it?', 'How old is it?', 'Where is it?', 'What is it?'], 0, 'How much — «сколько»'),
      Q(
        'Сдачи не надо',
        ['Give me the change, please.', 'Keep the change, please.', 'I need the change.', 'Where is the change?'],
        1,
        'keep the change — «оставьте сдачу»'
      ),
      S('Можно нам счёт', ['Can', 'we', 'have', 'the', 'bill'], ['a', 'I']),
      F('tip'),
    ],
  },
  {
    id: 'l3',
    title: 'Попросить счёт',
    items: [
      F('bill'),
      Q(
        'Принесите счёт, пожалуйста',
        [
          'Could you bring the bill, please?',
          'Could you bring the menu, please?',
          'Could you bring the water, please?',
          'Could you bring the table, please?',
        ],
        0,
        'bring the bill — «принести счёт»'
      ),
      Q(
        'Можно оплатить картой?',
        ['Can I pay by card?', 'Can I buy a card?', 'Can I pay the menu?', 'Can I bring a card?'],
        0,
        'pay by card — «оплатить картой»'
      ),
      S('Я хочу оплатить картой', ['I', 'would', 'like', 'to', 'pay', 'by', 'card'], ['cash', 'want']),
      F('receipt'),
    ],
  },
];

// test(progress, learnedWordsCount)
export const ACHIEVEMENTS = [
  ['first', 'Первый урок', 'Пройдите первый урок', (p) => p.lessonsDone >= 1],
  ['s3', 'Серия 3 дня', 'Занимайтесь 3 дня подряд', (p) => p.streak >= 3],
  ['s7', 'Неделя подряд', 'Занимайтесь 7 дней подряд', (p) => p.streak >= 7],
  ['s14', 'Две недели', 'Занимайтесь 14 дней подряд', (p) => p.streak >= 14],
  ['s30', 'Месяц подряд', 'Занимайтесь 30 дней подряд', (p) => p.streak >= 30],
  ['w150', '150 слов', 'Выучите 150 слов', (p, l) => l >= 150],
  ['w300', '300 слов', 'Выучите 300 слов', (p, l) => l >= 300],
  ['rev', 'Первое повторение', 'Повторите слова', (p) => p.reviews >= 1],
  ['perfect', 'Без ошибок', 'Пройдите урок без единой ошибки', (p) => p.perfect >= 1],
  ['b1', 'Уровень B1', 'Дойдите до уровня B1', (p) => LEVELS.indexOf(p.level) >= 2],
  ['h20', '20 часов', 'Проведите 20 часов за учёбой', (p) => p.totalMin >= 1200],
  ['g10', 'Цель дня × 10', 'Выполните цель дня 10 раз', (p) => p.goalDays >= 10],
].map(([id, title, desc, test]) => ({ id, title, desc, test }));

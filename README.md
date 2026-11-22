# Слово — приложение для изучения английского (React Native + Expo)

## Запуск

```bash
npx create-expo-app@latest slovo --template blank
cd slovo

npx expo install react-native-screens react-native-safe-area-context \
  @react-native-async-storage/async-storage expo-speech expo-haptics @expo/vector-icons
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
```

Затем скопируйте в папку проекта `App.js` (с заменой) и папку `src/`, после чего:

```bash
npx expo start
```

Откройте приложение на телефоне через Expo Go (QR-код).

## Структура

- `App.js` — навигация (авторизация/онбординг → вкладки → уроки)
- `src/store.js` — состояние, сохранение в AsyncStorage, прогресс, серия, повторение слов
- `src/data.js` — слова, уроки, достижения
- `src/ui.js`, `src/theme.js` — общие компоненты и светлая/тёмная темы
- `src/screens/*` — все 20 экранов макета

## Режим демо

В `src/store.js`: `DEMO = true` — после регистрации данные как на макете (серия 7 дней, 128 слов, урок «Меню и цены» на 7/10).
`DEMO = false` — пользователь начинает с нуля.
# languageLearningApp

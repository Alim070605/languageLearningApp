import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

export const speak = (text) => {
  try {
    Speech.stop();
    Speech.speak(text, { language: 'en-US', rate: 0.9 });
  } catch (e) {}
};

export const haptic = (kind = 'light') => {
  try {
    if (kind === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (kind === 'error') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    else Haptics.selectionAsync();
  } catch (e) {}
};

// plural(5, ['день', 'дня', 'дней']) -> 'дней'
export const plural = (n, [one, few, many]) => {
  const m = Math.abs(n) % 100;
  const d = m % 10;
  if (m > 10 && m < 20) return many;
  if (d > 1 && d < 5) return few;
  if (d === 1) return one;
  return many;
};

export const shuffle = (arr) => {
  const r = [...arr];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};

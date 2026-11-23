import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { AppProvider, useApp } from './src/store';
import { ThemeProvider, useTheme } from './src/theme';
import { Welcome, Login, Signup } from './src/screens/Auth';
import { Goal, Level, Remind } from './src/screens/Onboarding';
import Home from './src/screens/Home';
import { Lesson, Result } from './src/screens/Lesson';
import { Words, WordDetail, Review } from './src/screens/Words';
import Progress from './src/screens/Progress';
import { Profile, Settings } from './src/screens/Profile';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const ICONS = {
  Home: ['book', 'book-outline'],
  Words: ['albums', 'albums-outline'],
  Progress: ['bar-chart', 'bar-chart-outline'],
  Profile: ['person', 'person-outline'],
};

function Tabs() {
  const c = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        animation: 'fade',
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: { backgroundColor: c.card, borderTopColor: c.border },
        tabBarIcon: ({ focused, color }) => <Ionicons name={ICONS[route.name][focused ? 0 : 1]} size={22} color={color} />,
      })}
    >
      <Tab.Screen name="Home" component={Home} options={{ title: 'Учёба' }} />
      <Tab.Screen name="Words" component={Words} options={{ title: 'Слова' }} />
      <Tab.Screen name="Progress" component={Progress} options={{ title: 'Прогресс' }} />
      <Tab.Screen name="Profile" component={Profile} options={{ title: 'Профиль' }} />
    </Tab.Navigator>
  );
}

function Root() {
  const { s } = useApp();
  const c = useTheme();
  const navTheme = {
    ...(c.isDark ? DarkTheme : DefaultTheme),
    colors: { ...(c.isDark ? DarkTheme : DefaultTheme).colors, background: c.bg, card: c.card, text: c.text, border: c.border, primary: c.primary },
  };

  if (!s.loaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bg }}>
        <ActivityIndicator color={c.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={c.isDark ? 'light' : 'dark'} />
      {s.loggedIn ? (
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          <Stack.Screen name="Tabs" component={Tabs} />
          <Stack.Screen name="Lesson" component={Lesson} options={{ gestureEnabled: false, animation: 'slide_from_bottom' }} />
          <Stack.Screen name="Result" component={Result} options={{ gestureEnabled: false, animation: 'fade' }} />
          <Stack.Screen name="WordDetail" component={WordDetail} />
          <Stack.Screen name="Review" component={Review} />
          <Stack.Screen name="Settings" component={Settings} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          <Stack.Screen name="Welcome" component={Welcome} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Goal" component={Goal} />
          <Stack.Screen name="Level" component={Level} />
          <Stack.Screen name="Remind" component={Remind} />
          <Stack.Screen name="Signup" component={Signup} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

function ThemedApp() {
  const { s } = useApp();
  return (
    <ThemeProvider dark={s.settings.dark}>
      <Root />
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <ThemedApp />
      </AppProvider>
    </SafeAreaProvider>
  );
}
